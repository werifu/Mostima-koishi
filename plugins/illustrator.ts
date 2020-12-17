import {readdirSync} from 'fs';
import {Context} from 'koishi-core';
import {CQCode} from 'koishi-utils';
import {illustration_path_prefix} from '../private_config';

export const name = 'illustrator';
export function apply(ctx: Context) {
    ctx.middleware(async (meta, next) => {
        if (meta.message === '!色图' || meta.message === '！色图'){
            return meta.$send(CQCode.stringify('image', {file: illustration_path_prefix+getRandomIllustName()}));
        } else {
            return next();
        }
    });
}
function getRandomInt(max_num:number):number {
    return Math.floor(Math.random() * Math.floor(max_num));
}

function getRandomIllustName():string {
    let list = readdirSync('./illustrations/');
    return list[getRandomInt(list.length)];
}

// console.log(getRandomIllustName());
