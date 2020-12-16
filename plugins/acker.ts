import {Context} from 'koishi-core';
import {owner} from '../private_config';
export const name: string = 'acker';
export function apply(ctx: Context) {
    ctx.on('connect', async () => {
      await ctx.bots[0].sendPrivateMsg(owner, "上线！");
      setInterval(() =>{ctx.bots[0].sendPrivateMsg(owner, Date())}, 60000);
    })
}