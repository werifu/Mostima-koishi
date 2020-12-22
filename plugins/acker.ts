import {Context} from 'koishi-core';
import {owner} from '../private_config';
import {CQCode} from 'koishi-utils';
export const name: string = 'acker';
export function apply(ctx: Context) {
    ctx.on('connect', async () => {
      return await ctx.bots[0].sendPrivateMsg(owner, `上线！`);
    })
}