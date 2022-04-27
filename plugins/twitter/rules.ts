import axios, { AxiosResponse } from 'axios';

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
      console.log('delete rules: ', body)
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
      return res.data.data!;
    });
}

export { addRule, deleteRules, getRules, TwiMeta, TwiRes, RuleToAdd };
