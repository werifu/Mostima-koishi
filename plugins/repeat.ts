import {Context} from 'koishi-core';

let last_msg = '';
let send_flag = false;
export const name: string = 'repeat';
export function apply(ctx: Context) {
    ctx.middleware(async (meta, next) => {
        // console.log(meta.message);
        if (meta.message === last_msg && send_flag === false) {
            send_flag = true;
            return meta.$send(meta.message);
        }
        if (meta.message !== last_msg) {
            send_flag = false;
            last_msg = meta.message;
        }
        return next();
    })
}