import { Context, sleep } from 'koishi';
import axios from 'axios';
import {
  Groups,
  owner,
  PicturePathPrefix,
  PollingPeriod,
} from '../../private_config';
import { existsSync, writeFileSync } from 'fs';
import { Dynamic, formatTime, getDynamic, matchNewsCmd } from './utils';

// 本插件用于定时搬运订阅列表的动态
const ArknightsUid = 161775300;
const HaimaoUid = 53466;
const WanziUid = 1579053316;
const HyperGryghUid = 598504181;
const Yanyu = 9318640;
const ZCY902Uid = 290982;
let BiliUids = [
  ArknightsUid, // 明日方舟
  HaimaoUid, // 海猫络合物
  WanziUid, // 顽子
  HyperGryghUid, // 鹰角网络
  Yanyu, // 盐鱼料理长
  ZCY902Uid, // 902先辈
];
export const name = 'bili';
export function apply(ctx: Context) {
  ctx.middleware((session, next) => {
    if (session.content === undefined) return next();
    // 匹配新饼命令
    const offset = matchNewsCmd(session.content);
    if (offset === -1) return next();
    getDynamic(ArknightsUid, offset)
      .then(async (data) => {
        await session.sendQueued(
          `来自账号【${data.username}】-${formatTime(data.time)}的新动态:`
        );
        await session.sendQueued(data.text);
        if (data.pictures) {
          for (const pic of data.pictures) {
            await session.sendQueued(
              `[CQ:image,file=${PicturePathPrefix + pic}]`
            );
          }
        }
        if (data.video) {
          await session.sendQueued(`链接: ${data.video}`);
        }
      })
      .catch((e) => {
        console.log(e.code);
        if (e.code === 'ECONNRESET') {
          console.log('ECONNRESET: ' + e.config.url);
        } else {
          console.log(e);
        }
      });
  });

  ctx.on('connect', () => {
    setInterval(async () => {
      // 每个订阅账号都轮询
      for (const uid of BiliUids) {
        await getDynamic(uid, 0)
          .then(async (data) => {
            // 跟js对齐（b站最小单位是秒，js是毫秒
            const now = new Date().getTime();
            if (now - data.time.getTime() <= PollingPeriod) {
              //   console.log(now, data.time.getTime());
              // 说明还没发过
              broadcast(ctx, Groups, data);
            }
          })
          .catch((e) => {
            if (e.code === 'ECONNRESET') {
              console.log('ECONNRESET: ' + e.config.url);
            } else {
              console.log(`uid: ${uid}`, e);
            }
          });
      }
    }, PollingPeriod);
  });

  ctx
    .user(owner.toString())
    .command('subscribe [uid:number]')
    .action((_, uid) => {
      if (BiliUids.indexOf(uid) !== -1) {
        return '已经订阅该用户';
      }
      BiliUids.push(uid);
      return `订阅成功`;
    });
}

async function broadcast(ctx: Context, groups: number[], data: Dynamic) {
  const bot = ctx.bots[0];
  // 每个群都发，同步发避免封号
  for (const group of groups) {
    await bot.sendMessage(
      group.toString(),
      `来自账号【${data.username}】-${formatTime(data.time)}的新动态:`
    );
    await bot.sendMessage(group.toString(), data.text);
    if (data.pictures) {
      for (const pic of data.pictures) {
        await bot.sendMessage(
          group.toString(),
          `[CQ:image,file=${PicturePathPrefix + pic}]`
        );
      }
    }
    if (data.video) {
      await bot.sendMessage(group.toString(), `链接: ${data.video}`);
    }
  }
}
