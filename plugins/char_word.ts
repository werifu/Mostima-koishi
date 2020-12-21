import {readFileSync} from 'fs';
import {Context} from 'koishi-core';
export const name: string = 'char_word';
export function apply(ctx: Context) {
    ctx.middleware((meta, next) => {
        let msg:string = meta.message;
        if (msg.includes('!名言') || msg.includes('！名言')) {
            return meta.$send(getRandomWord());
        }
        return next();
    })
}


function getRandomWord(): string {
    let words: any = readFileSync('../data_handles/word.json');
    words = JSON.parse(words);
    let ids: string[] = Object.keys(words);
    let random_char_num = getRandomInt(ids.length);
    let char = words[ids[random_char_num]];
    let random_word_num = getRandomInt(char.words.length);
    let char_name = char.char_name;
    console.log(random_word_num);
    if (char.words.length === 0) {
        return `（这个干员没话说）——${char_name}`;
    }
    let title = char.words[random_word_num].title;
    let text = char.words[random_word_num].text;
    return `${text}——${char_name}【${title}】`;
}

function getRandomInt(max_num:number):number {
    return Math.floor(Math.random() * Math.floor(max_num));
}
