import { Context } from 'koishi';
import axios, { AxiosResponse } from 'axios';
import { randomInt, createHash } from 'crypto';
import * as fs from 'fs';
import { RecordPathPrefix } from '../../private_config';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

const recordTypes = [
  '任命助理',
  '交谈1',
  '交谈2',
  '交谈3',
  '晋升后交谈1',
  '晋升后交谈2',
  '信赖提升后交谈1',
  '信赖提升后交谈2',
  '信赖提升后交谈3',
  '闲置',
  '干员报到',
  '观看作战记录',
  '精英化晋升1',
  '精英化晋升2',
  '编入队伍',
  '任命队长',
  '行动出发',
  '行动开始',
  '选中干员1',
  '选中干员2',
  '部署1',
  '部署2',
  '作战中1',
  '作战中2',
  '作战中3',
  '作战中4',
  '4星结束行动',
  '3星结束行动',
  '非3星结束行动',
  '行动失败',
  '进驻设施',
  '戳一下',
  '信赖触摸',
  '标题',
  '问候',
];
type Lang = '中文' | '日文' | '方言';
const voiceLangs = {
  中文: 'voice_cn',
  日文: 'voice',
  方言: 'voice_custom',
};
const charsFile = 'chars.json';
updateCharacters();
export const name = 'voice';
export function apply(ctx: Context) {
  ctx.on('connect', () => {
    setInterval(() => {
      updateCharacters();
    }, 1000 * 60 * 60 * 24); // one day
  });

  ctx
    .command('语音 <name> <lang> <scene>')
    .action(async (_, name, lang, scene) => {
      let char: Character;
      if (scene && !validScene(scene))
        return '无此语音场景, 支持的有：\n' + recordTypes.join('/');
      let chars;
      try {
        chars = getChars(charsFile);
      } catch (e) {
        console.log(e);
        return '角色获取失败';
      }
      if (name && !getChar(chars, name)) {
        return '无此干员';
      }
      char = getChar(chars, name) ?? randomChar(chars);
      const type = randomRecordType();
      if (lang && lang !== '中文' && lang !== '日文' && lang !== '方言')
        return '只支持【中文】、【日文】、【方言】';
      lang = lang ?? '日文';
      // 方言的多了个后缀
      const id = lang === '方言' ? char.id + '_cn_topolect' : char.id;
      return await cqRecord(id, char.name, voiceLangs[lang as Lang], type);
    });
}

// filename: ${voiceLang}_${name}_${recordType}.wav
export async function cqRecord(
  id: string,
  name: string,
  voiceLang: string,
  recordType: string
) {
  const md5 = createHash('md5');
  const fileName =
    md5.update(`${voiceLang}_${name}_${recordType}`).digest('hex') + '.wav';
  if (fs.existsSync('./records/' + fileName)) {
    return `[CQ:record,file=${RecordPathPrefix + fileName}]`;
  } else {
    const recordUrl = `https://static.prts.wiki/${voiceLang}/${id}/${encodeURI(
      name
    )}_${encodeURI(recordType)}.wav`;
    console.log(recordUrl);
    return await axios
      .get(recordUrl, { responseType: 'stream', timeout: 4000 })
      .then((res) => {
        return new Promise((resolve) => {
          const file = fs.createWriteStream('./records/' + fileName);
          res.data.pipe(file);
          file.on('close', () => {
            resolve(null);
          });
        });
      })
      .then(async (_) => {
        return `[CQ:record,file=${RecordPathPrefix + fileName}]`;
      })
      .catch((err) => {
        console.log(err);
        if (err.response && err.response.status === 404) return `不支持此语言`;
        return `语音下载/发送失败`;
      });
  }
}

function randomRecordType(): string {
  return recordTypes[randomInt(recordTypes.length)];
}
function getChars(path: string): Character[] {
  return JSON.parse(fs.readFileSync(path).toString());
}

function randomChar(chars: Character[]): Character {
  return chars[randomInt(chars.length)];
}

function validScene(scene: string): boolean {
  for (let i = 0; i < recordTypes.length; i++) {
    if (recordTypes[i] === scene) return true;
  }
  return false;
}
function getChar(chars: Character[], name: string): Character | null {
  for (let i = 0; i < chars.length; i++) {
    if (name === chars[i].name) return chars[i];
  }
  return null;
}
interface Character {
  name: string;
  id: string;
}

async function updateCharacters() {
  const character_table_url = `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json`;
  return axios
    .get(character_table_url)
    .then((res: AxiosResponse<{ [charId: string]: { name: string } }>) => {
      const content = res.data;
      const chars: Character[] = [];
      for (const id in content) {
        // 排除道具和使魔
        if (!id.startsWith('char_')) continue;
        const name = content[id].name;
        const char: Character = { id, name };
        chars.push(char);
      }
      fs.writeFileSync(charsFile, JSON.stringify(chars), 'utf-8');
    })
    .catch((err) => console.log(err));
}
