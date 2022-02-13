import { Context } from 'koishi';
import { owner } from '../../private_config';
import { getDynamic } from '../bilibili/utils';
import { formatTime } from '../bilibili/utils';
import { PicturePathPrefix } from '../../private_config';
export const name = 'acker';
export function apply(ctx: Context) {
  // ctx.on('connect', async () => {
  //   // console.log(await ctx.broadcast('test'))
  //   ctx.bots[0].sendPrivateMessage(owner.toString(), `I'm on!`);
  //   getDynamic(161775300, 0).then(async data => {
  //     await ctx.bots[0].sendPrivateMessage(owner.toString(), `来自账号【${data.username}】-${formatTime(data.time)}的新动态:\n`)
  //     await ctx.bots[0].sendPrivateMessage(owner.toString(), data.text);
  //     if (data.pictures) {
  //       for (const pic of data.pictures) {
  //         await ctx.bots[0].sendPrivateMessage(owner.toString(), `[CQ:image,file=${PicturePathPrefix + pic}]`)
  //       }
  //     }
  //     if (data.video) {
  //       await ctx.bots[0].sendPrivateMessage(owner.toString(), `链接: ${data.video}`)
  //     }
  //   })
  // })
}