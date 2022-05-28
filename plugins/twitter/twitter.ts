import { Context, sleep } from 'koishi';
import axios, { AxiosResponse } from 'axios';
import http2 from 'http2';
import util from 'util';
import {
  Groups,
  PicturePathPrefix,
  IllustrationPathPrefix,
} from '../../private_config';
import { existsSync, promises, readdirSync } from 'fs';
import { addRule, deleteRules, getRules, RuleCodec, RuleToAdd } from './rules';
import { randomInt } from 'crypto';
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
      if (username.endsWith('--ark')) return '--ark前请加空格';
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
      '!twi-sub @xxx [--ark]  subscribe,--ark参数指定带方舟tag的推文',
      '!twi-td @xxx TD',
      '!twi-list 查看subscribe列表',
    ];
    return helps.join('\n');
  });

  ctx.command('!twi-list').action(async (_) => {
    return await getSubscribeList(config.accessToken);
  });

  ctx.command('来点色图').action(() => {
    return randomIllust();
  });
}

async function subscribe(
  username: string,
  accessToken: string,
  withArkTag?: boolean
): Promise<string> {
  console.log('subscribe', username, withArkTag);
  try {
    const rules = await getRules(accessToken);
    let codec = new RuleCodec();
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      const ruleHasArk = rule.tag.startsWith('[ark]');
      if ((ruleHasArk && withArkTag) || (!ruleHasArk && !withArkTag)) {
        let newRule: RuleToAdd;
        try {
          newRule = codec.parse(rule).add(username).generate();
        } catch (e) {
          // value too long
          continue;
        }
        await deleteRules([rule.id], accessToken)
          .then((res) => {
            if (res.summary.not_deleted !== 0)
              throw new Error('not_deleted !== 0');
          })
          .catch((e) => {
            throw new Error(e.data);
          });
        await addRule(newRule, accessToken).catch((e) => {
          console.log('addRule fail', e);
          throw new Error('add rule fail');
        });
        return '订阅成功';
      }
    }
    // 没有rule能匹配,重新造
    codec = new RuleCodec(withArkTag);
    const rule = codec.add(username).generate();
    await addRule(rule, accessToken).catch((e) => {
      console.log('addRule fail', e);
      throw new Error('add rule fail');
    });
    return '订阅成功';
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
    try {
      await bot.sendMessage(group.toString(), `订阅色图更新: ${data.url}`);
      if (data.pictures) {
        for (const pic of data.pictures) {
          await bot.sendMessage(
            group.toString(),
            `[CQ:image,file=${IllustrationPathPrefix + pic}]`
          );
        }
      }
    } catch (e) {
      console.log('send fail: ', e);
      continue;
    }
  }
}

export function extractPictureName(url: string): string | null {
  const reg = /([0-9a-zA-Z-]+\.(png|jpg|jiff))$/;
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
      console.log('data come in: ', chunk);
      const twiUrl = twiUrlRes[0];
      const picUrls: Array<string> = info.includes.media.map(
        (item: Media) => item.url
      );
      let tasks: Promise<void>[] = [];
      picUrls.forEach((url) => {
        const picName = extractPictureName(url);
        if (!picName) return;
        if (existsSync(`./illusts/${picName}`)) return;
        // not exist, can download
        tasks.push(
          axios
            .get(url, {
              responseType: 'arraybuffer',
            })
            .then(({ data }) => {
              promises.writeFile(`./illusts/${picName}`, data, 'binary');
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
  req.on('close', () => {
    console.log('stream has been closed, will retry');
    keepStream(ctx, accessToken);
  });
  req.on('error', (e) => {
    console.log('stream error', e);
    keepStream(ctx, accessToken);
  });
}

async function unsubscribe(username: string, accessToken: string) {
  try {
    const rules = await getRules(accessToken).catch((e) => {
      throw new Error(e.data);
    });
    const codec = new RuleCodec();
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];
      codec.parse(rule);
      if (!codec.hasUser(username)) {
        continue;
      }
      // 在里面，可以更新
      const newRule = codec.remove(username).generate();
      await addRule(newRule, accessToken).catch((e) => {
        console.log(e);
        throw new Error('add rule fail');
      });
      await deleteRules([rule.id], accessToken)
        .catch((e) => {
          console.log(e);
          throw new Error(e.data);
        })
        .then((res) => {
          if (res.summary.not_deleted !== 0)
            throw new Error('not_delete !== 0');
        });
      return '退订成功';
    }
    return '退订失败: 不存在的订阅用户';
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
async function getSubscribeList(accessToken: string) {
  const list = await getRules(accessToken).then((res) => {
    const codec = new RuleCodec();
    let usernames: string[] = [];
    if (!res) return [];
    res.forEach((item) => {
      codec.parse(item);
      usernames = usernames.concat(codec.getUsernames());
    });
    return usernames;
  });
  if (list.length === 0) return '无订阅用户';
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
        (item) => `${item.name} \t@${item.username}`
      );
      let result = '已关注列表：\n';
      result += names.join('\n');
      return result;
    })
    .catch((e) => {
      console.log(e);
      return `查询发生错误 ${e.message}`;
    });
}

function randomIllust(): string {
  const picNames = readdirSync('./illusts/').filter((file) => {
    const res = file.match(/\.(gif|jpg|png|jpeg)$/);
    return res !== null;
  });
  const pic = picNames[randomInt(picNames.length)];
  return `[CQ:image,file=${IllustrationPathPrefix + pic}]`;
}
