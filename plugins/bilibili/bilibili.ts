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
const ZCY902Uid = 290982;
const AkEndFieldUid = 1265652806;
const CubesUid = 2123591088;
const ExAstrisUid = 1883857209;
const NorizcUid = 4277009;
const GravityWell = 1554642444;
let BiliUids = [
  ArknightsUid, // 明日方舟
  HaimaoUid, // 海猫络合物
  WanziUid, // 顽子
  HyperGryghUid, // 鹰角网络
  ZCY902Uid, // 902先辈
  AkEndFieldUid, // 明日方舟终末地
  CubesUid, // 库柏思
  ExAstrisUid, // 来自星尘
  NorizcUid, // 紫菜
  GravityWell, // 重力井
];
export const name = 'bili';
export function apply(ctx: Context) {
  ctx.middleware((session, next) => {
    if (session.content === undefined) return next();
    // 匹配新饼命令
    const offset = matchNewsCmd(session.content);
    if (offset === -1) return next();
    try {
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
        .catch(e => {
          throw new Error(e.message);
        });
    } catch (e) {
      console.log(e);
    }
  });

  ctx.on('connect', () => {
    setInterval(async () => {
      // 每个订阅账号都轮询
      for (const uid of BiliUids) {
        try {
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
            .catch(e => {
              throw new Error(e.message);
            });
        } catch (e) {
          console.log(e);
          continue;
        }
      }
    }, PollingPeriod);
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
