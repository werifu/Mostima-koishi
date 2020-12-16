import {Context} from 'koishi-core';

export const name: string = 'acker';
export function apply(ctx: Context) {
    ctx.on('connect', async () => {
      await ctx.bots[0].sendPrivateMsg(1363195380, "上线！");
      setInterval(() =>{ctx.bots[0].sendPrivateMsg(1363195380, Date())}, 60000);
    })
}