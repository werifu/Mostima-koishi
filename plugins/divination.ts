import {Context} from 'koishi-core';

export const name: string = 'divination';

const behavior: string[] = ['一次寻访', '基建装修', '十连寻访', '刷蓝酮']
export function apply(ctx: Context) {
    ctx.middleware(async (meta, next) => {
        if (meta.message.includes('！占卜') || meta.message.includes('!占卜')) {
            
        }
        return next();
    })
}