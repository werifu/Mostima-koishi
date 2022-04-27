import { Context, sleep } from 'koishi';
import axios from 'axios';
import http2 from 'http2';
import util from 'util';
import {
  Groups,
  PicturePathPrefix,
} from '../../private_config';
import { existsSync, readFileSync, promises } from 'fs';
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
    .option('arkTag', '--ark', {value: true})
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
    return 'Usage: \n!twi-sub @xxxx [-ark]  订阅,-ark参数指定带方舟tag的推文\n!twi-td @xxx 退订';
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
    return await addRule(rule, accessToken).then(() => '订阅成功').catch(e => {
      return `订阅失败: ${e.message}`;
    })
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
    const rules = await getRules(accessToken).catch(e => {
      throw new Error(e.data);
    });
    const ids = rules
      .filter((item) => item.tag === username)
      .map((item) => item.id);
    const res = await deleteRules(ids, accessToken).catch(e => {
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
