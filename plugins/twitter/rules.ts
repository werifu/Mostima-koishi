import axios, { AxiosResponse } from 'axios';
import { runInThisContext } from 'vm';
const MAX_RULE_LEN = 512;
interface TwiRes<SummaryT, ErrorsT, DataT> {
  meta: TwiMeta<SummaryT>;
  errors?: ErrorsT;
  data?: DataT;
}
interface TwiMeta<SummaryT> {
  sent: string;
  summary: SummaryT;
}
interface StrictRule {
  id: string;
  value: string;
  tag: string;
  title: string;
}
type RuleToAdd = Omit<StrictRule, 'id' | 'title'>;
type RuleAdded = Omit<StrictRule, 'title'>;
type RuleError = StrictRule;
interface AddRuleSummary {
  created: number;
  not_created: number;
  valid: number;
  invalid: number;
}
type AddRuleRes = TwiRes<AddRuleSummary, RuleError[], RuleAdded[]>;

interface DelRuleSummary {
  deleted: number;
  not_deleted: number;
}
interface DelRuleError {
  errors: Array<any>;
  title: string;
  detail: string;
  type: string;
}
type DelRuleRes = TwiRes<DelRuleSummary, DelRuleError[], undefined>;

async function addRule(
  rule: RuleToAdd,
  accessToken: string
): Promise<RuleAdded> {
  return axios
    .post(
      'https://api.twitter.com/2/tweets/search/stream/rules',
      {
        add: [rule],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((res: AxiosResponse<AddRuleRes>) => {
      // fail
      const body = res.data;
      if (body.meta.summary.invalid === 1) {
        return Promise.reject(
          new Error(`${body.errors![0].title} : ${body.errors![0].value}:`)
        );
      }
      console.log('add rules: ', body.data);
      return body.data![0];
    });
}

async function deleteRules(
  ids: string[],
  accessToken: string
): Promise<TwiMeta<DelRuleSummary>> {
  return axios
    .post(
      'https://api.twitter.com/2/tweets/search/stream/rules',
      {
        delete: { ids },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((res: AxiosResponse<DelRuleRes>) => {
      const body = res.data;
      if (body.meta.summary.not_deleted !== 0) {
        return Promise.reject(
          new Error(`${body.errors![0].title}: ${body.errors![0].detail}`)
        );
      }
      console.log('delete rules: ', body);
      return body.meta;
    });
}

type GetRulesRes = TwiRes<undefined, undefined, RuleAdded[]>;
async function getRules(accessToken: string): Promise<RuleAdded[]> {
  return axios
    .get('https://api.twitter.com/2/tweets/search/stream/rules', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((res: AxiosResponse<GetRulesRes>) => {
      console.log('get rules: ', res.data.data);
      return res.data.data ?? [];
    });
}

// 规定了value和tag的写法
// with Ark:
// {
//   value: '(#アークナイツ OR #明日方舟 OR #Arknights) AND (from:A OR from:B)',
//   tag: '[ark]A;B',
// }
// without Ark:
// {
//   value: 'from:A OR from:B',
//   tag: 'A;B',
// }
class RuleCodec {
  private withArk: boolean;
  private usernames: string[];
  constructor(withArk?: boolean) {
    this.withArk = withArk ?? false;
    this.usernames = [];
  }

  public add(username: string) {
    this.usernames.push(username);
    return this;
  }

  public parse(rule: RuleAdded) {
    let tagStr;
    if (rule.tag.startsWith('[ark]')) {
      tagStr = rule.tag.substring(5);
      this.withArk = true;
    } else {
      tagStr = rule.tag;
      this.withArk = false;
    }
    this.usernames = tagStr.split(';');
    return this;
  }

  public generate(): RuleToAdd {
    let value = 'has:images -is:retweet';
    let tag = '';
    if (this.withArk) {
      value += ' (#アークナイツ OR #明日方舟 OR #Arknights)';
      tag += '[ark]';
    }
    const froms = this.usernames
      .map((username) => `from:${username}`)
      .join(' OR ');
    const tags = this.usernames.join(';');
    if (froms !== '') {
      value += ` (${froms})`;
      tag += tags;
    }
    if (value.length > MAX_RULE_LEN) {
      console.log(value);
      throw 'value too long';
    }
    return {
      value,
      tag,
    };
  }

  public getUsernames() {
    return this.usernames;
  }
  public remove(username: string) {
    for (let i = 0; i < this.usernames.length; i++) {
      if (this.usernames[i] === username) {
        this.usernames.splice(i, 1);
        return this;
      }
    }
    return this;
  }
  public hasUser(username: string): boolean {
    return this.usernames.includes(username);
  }
}

function addFrom(rule: RuleAdded, username: string): RuleAdded | null {
  const fromUsername = `from:${username}`;
  let { tag, value } = rule;
  tag += `;${username}`;
  value = value.substring(0, value.length - 2) + ' OR ' + fromUsername + ')';

  return {
    id: rule.id,
    value,
    tag,
  };
}

export {
  addRule,
  deleteRules,
  getRules,
  TwiMeta,
  TwiRes,
  RuleToAdd,
  addFrom,
  RuleCodec,
};
