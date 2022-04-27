import { Context, sleep } from 'koishi';
import axios, { AxiosResponse } from 'axios';
import http2 from 'http2';
import util from 'util';
import { Groups, PicturePathPrefix } from '../../private_config';
import { existsSync, readFileSync, promises, accessSync } from 'fs';
import { addRule, deleteRules, getRules, RuleToAdd } from './rules';
interface TwitterConfig {
  accessToken: string;
}

interface Subscribed {
  username: string;
  rule: {
    id: string;
    value: string;
  };
}
interface Media {
  media_key: string;
  type: string;
  url: string;
}
// 本插件用于搬运推特方舟图
export const name = 'twitter';
export function apply(ctx: Context, config: TwitterConfig) {
  ctx.on('connect', () => {
    keepStream(ctx, config.accessToken);
  });

  ctx
    .command('!twi-sub <username>')
    .option('arkTag', '--ark', { value: true })
    .action(async ({ options }, username) => {
      if (!username) return '格式错误';
      if (username[0] !== '@') return '用户名需@开头';
      console.log(options);
      return await subscribe(
        username.substring(1),
        config.accessToken,
        options?.arkTag
      );
    });

  ctx.command('!twi-td <username>').action(async (_, username) => {
    if (!username) return '格式错误';
    if (username[0] !== '@') return '用户名需@开头';
    return await unsubscribe(username.substring(1), config.accessToken);
  });

  ctx.command('!twitter').action(() => {
    const helps = [
      '!twi-sub @xxxx [-ark]  订阅,-ark参数指定带方舟tag的推文',
      '!twi-td @xxx 退订',
      '!twi-list 查看订阅列表',
    ];
    return 'Usage:\n' + helps.join('\n');
  });

  ctx.command('!twi-list').action(async (_) => {
    return await getSubscribeList(ctx, config.accessToken);
  });
}

async function subscribe(
  username: string,
  accessToken: string,
  withArkTag?: boolean
): Promise<string> {
  console.log('subscribe', username, withArkTag);
  let ruleValue = `from:${username} has:images -is:retweet`;
  if (withArkTag) {
    const arkRuleValue = '(#アークナイツ OR #明日方舟 OR #Arknights)';
    ruleValue += ' ' + arkRuleValue;
  }
  try {
    const rule: RuleToAdd = {
      value: ruleValue,
      tag: username,
    };
    return await addRule(rule, accessToken)
      .then(() => '订阅成功')
      .catch((e) => {
        return `订阅失败: ${e.message}`;
      });
  } catch (e) {
    console.log(util.inspect(e, false, null, true));
    return `订阅失败 caused by 异常`;
  }
}
interface Tweet {
  url?: string;
  pictures?: Array<string>;
}
async function broadcast(ctx: Context, groups: number[], data: Tweet) {
  const bot = ctx.bots[0];
  // 每个群都发，同步发避免封号
  for (const group of groups) {
    await bot.sendMessage(group.toString(), `订阅色图更新: ${data.url}`);
    if (data.pictures) {
      for (const pic of data.pictures) {
        await bot.sendMessage(
          group.toString(),
          `[CQ:image,file=${PicturePathPrefix + pic}]`
        );
      }
    }
  }
}

function extractPictureName(url: string): string | null {
  const reg = /([0-9a-zA-Z]+\.(png|jpg|jiff))$/;
  const found = url.match(reg);
  if (!found?.length) {
    return null;
  }
  return found[0];
}

async function keepStream(ctx: Context, accessToken: string) {
  const session = http2.connect('https://api.twitter.com');
  const req = session.request({
    ':path':
      '/2/tweets/search/stream?tweet.fields=public_metrics,created_at&expansions=attachments.media_keys&media.fields=url',
    Authorization: `Bearer ${accessToken}`,
  });
  req.setEncoding('utf8');
  req.on('data', async (chunk) => {
    try {
      const info = JSON.parse(chunk);
      const urlReg = /https:\/\/t.co\/[0-9a-zA-Z]+$/;
      const twiUrlRes: Array<string> = info.data.text.match(urlReg);
      if (twiUrlRes.length < 1) {
        console.log('no twitter url: ', chunk);
        return;
      }
      const twiUrl = twiUrlRes[0];
      const picUrls: Array<string> = info.includes.media.map(
        (item: Media) => item.url
      );
      let tasks: Promise<void>[] = [];
      picUrls.forEach((url) => {
        const picName = extractPictureName(url);
        if (!picName) return;
        if (existsSync(`./pictures/${picName}`)) return;
        // not exist, can download
        tasks.push(
          axios
            .get(url, {
              responseType: 'arraybuffer',
            })
            .then(({ data }) => {
              promises.writeFile(`./pictures/${picName}`, data, 'binary');
            })
        );
      });
      await Promise.all(tasks);

      const data: Tweet = {
        url: twiUrl,
        pictures: picUrls.map((url) => extractPictureName(url) || ''),
      };
      broadcast(ctx, Groups, data);
    } catch (e) {
      // console.log(e);
    }
  });
}

async function unsubscribe(username: string, accessToken: string) {
  try {
    const rules = await getRules(accessToken).catch((e) => {
      throw new Error(e.data);
    });
    const ids = rules
      .filter((item) => item.tag === username)
      .map((item) => item.id);
    const res = await deleteRules(ids, accessToken).catch((e) => {
      throw new Error(e.data);
    });
    if (res.summary.not_deleted === 0) return '退订成功';
    console.log('unsubscribe fail', res);
    return `退订失败: deleted: ${res.summary.deleted}; not_deleted: ${res.summary.not_deleted}`;
  } catch (e) {
    console.log(e);
  }
  return '退订失败';
}

interface UserInfo {
  id: string;
  username: string;
  name: string;
}
async function getSubscribeList(ctx: Context, accessToken: string) {
  const list = await getRules(accessToken).then((res) => {
    return res
      .map((item) => {
        const reg = /from:([0-9a-zA-Z_]+)/;
        const matched = item.value.match(reg);
        if (!matched || matched.length < 2) return '';
        return matched[1];
      })
      .filter((item) => item !== '');
  });
  const usernamesParam = encodeURI(list.join(','));
  const url = 'https://api.twitter.com/2/users/by?usernames=' + usernamesParam;
  return await axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then((res: AxiosResponse<{ data: UserInfo[] }>) => {
      const names = res.data.data.map(
        (item) => `${item.name} @${item.username}`
      );
      let result = '已关注列表：\n';
      result += names.join('\n');
      return result;
    })
    .catch((e) => {
      return `查询发生错误 ${e.message}`;
    });
}
