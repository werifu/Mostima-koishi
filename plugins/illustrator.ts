import {readdirSync} from 'fs';
import {Context} from 'koishi-core';
import {CQCode} from 'koishi-utils';
import {illustration_path_prefix} from '../private_config';

export const name = 'illustrator';
export function apply(ctx: Context) {
    
    ctx.middleware(async (meta, next) => {
        if (meta.message.includes('!色图') || meta.message.includes('！色图')){
            let name = getRandomIllustName();
            console.log(name);
            return meta.$send(CQCode.stringify('image', {file: illustration_path_prefix+name}));
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
