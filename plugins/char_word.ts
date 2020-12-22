import {readFileSync} from 'fs';
import {Context} from 'koishi-core';
import {CQCode} from 'koishi-utils';
import {record_path_prefix} from '../private_config';
export const name: string = 'char_word';

export class Word {
    title: string
    from: string
    text: string
    text_jp: string
    file_name: string
    record_url: string
}

export function apply(ctx: Context) {
    ctx.middleware((meta, next) => {
        let msg:string = meta.message;
        //console.log(msg);
        if (msg === '！名言 完整' || msg === '!名言 完整') {
            let word = getRandomWord();
            
            if (word.title === ``) {
                return meta.$send(word.text+'——'+word.from);
            }

            return meta.$send(word.text).then(()=> {
                meta.$send(`${word.text_jp}——${word.from}【${word.title}】`)
            }).then(()=>{
                meta.$send(CQCode.stringify('record', {file: word.record_url}));
            })
        }else if (msg.includes('!名言') || msg.includes('！名言')) {
            let word = getRandomWord();
            return meta.$send(word.text).then(()=>{
                meta.$send(`from ${word.from}【${word.title}】`)
            });
            
        }
        return next();
    })
}


function getRandomWord(): Word {
    let words: any = readFileSync('data_handles/word.json');
    words = JSON.parse(words);
    let ids: string[] = Object.keys(words);
    let random_char_num = getRandomInt(ids.length);
    let char = words[ids[random_char_num]];
    let random_word_num = getRandomInt(char.words.length);
    let char_name = char.char_name;
    // console.log(random_word_num);
    if (char.words.length === 0) {
        return {text:`（这个干员没话说）`, from: char_name, title: ``, text_jp: ``, file_name: ``, record_url: ``};
    }
    let title = char.words[random_word_num].title;
    let text = char.words[random_word_num].text;
    let from = char_name;
    let text_jp = char.words[random_word_num].text_jp;
    let file_name = `${from}_${title}.wav`;
    let record_url = char.words[random_word_num].record_url;
    return {text: text, from: from, title: title, text_jp: text_jp, file_name: file_name, record_url: record_url};
}

function getRandomInt(max_num:number):number {
    return Math.floor(Math.random() * Math.floor(max_num));
}

