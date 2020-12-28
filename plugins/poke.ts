import {Context} from 'koishi-core';


export const name: string = 'poke';
export function apply(ctx: Context) {
    ctx.middleware(async (meta, next) => {
        return next();
    })
}