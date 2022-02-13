import axios from 'axios';
import { existsSync, writeFileSync } from 'fs';

// 一条动态必须满足以下格式（无论是转发/视频/动态/专栏
export interface Dynamic {
  username: string;
  uid: number;
  time: Date;
  text: string;
  pictures?: string[];
  video?: string;
}

enum Type {
  Rp = 1,
  Daily = 2,
  Artical = 64,
  Video = 8,
  TextOnly = 4,
}

export async function getDynamic(
  uid: number,
  offset: number
): Promise<Dynamic> {
  const url = `https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}`;
  return axios.get(url).then(async (res) => {
    const cards = res.data.data.cards;
    const desc = cards[offset].desc;
    const { text, pictures, video } = handleCard(cards[offset].card, desc.type);
    let names: string[] = [];
    if (pictures) {
      names = await downloadPictures(pictures);
    }
    return {
      username: desc.user_profile.info.uname,
      uid,
      time: new Date(desc.timestamp * 1000),
      text,
      pictures: names,
      video,
    } as Dynamic;
  });
}

interface CardContent {
  text: string;
  pictures?: string[];
  video?: string;
}

export function handleCard(cardStr: string, type: number): CardContent {
  switch (type) {
    case Type.Daily: // 动态
      return handleDailyCard(cardStr);
    case Type.Artical: // 专栏
      return handleArticleCard(cardStr);
    case Type.Video: // 视频
      return handleVideoCard(cardStr);
    case Type.Rp: // 转发
      return handleRpCard(cardStr);
    case Type.TextOnly: // 纯文本动态
      return handleTextOnlyCard(cardStr);
    default:
      return {
        text: '遇到未知动态类型，通知维护者',
      };
  }
}

export function handleDailyCard(cardStr: string): CardContent {
  const card = JSON.parse(cardStr);
  const text: string = card.item.description;
  const pictureUrls = (card.item.pictures as Array<{ img_src: string }>).map(
    (pic) => pic.img_src
  );
  return {
    text,
    pictures: pictureUrls,
  };
}

export function handleTextOnlyCard(cardStr: string): CardContent {
  const card = JSON.parse(cardStr);
  const text: string = card.item.content;
  return {
    text,
  };
}
export function handleVideoCard(cardStr: string): CardContent {
  const card = JSON.parse(cardStr);
  const text = card.dynamic ? `${card.title}\n${card.dynamic}` : card.title;
  // 封面
  const cover = card.pic;
  // 视频短链
  const video = card.short_link;
  return {
    text,
    pictures: [cover],
    video,
  };
}

export function handleArticleCard(cardStr: string): CardContent {
  const card = JSON.parse(cardStr);
  // 重要的是title+summary(文字内容),
  // publish_time（时间戳）, image_urls（封面图片链接[]）,ud 即cv号
  const text =
    `【专栏】\n【${card.title}】\n` +
    `${card.summary}\n` +
    `详情点击` +
    `https://www.bilibili.com/read/cv${card.id}`;
  const pictures = card.image_urls;
  return {
    text,
    pictures,
  };
}
export function handleRpCard(cardStr: string): CardContent {
  const card = JSON.parse(cardStr);
  let text = '转发: ' + card.item.content;
  const origType = card.item.orig_type;
  const origin = handleCard(card.origin, origType);
  const origUname = card.origin_user.info.uname;
  return {
    text: `${text}\n原文来自账号@${origUname}: ${origin.text}`,
    pictures: origin.pictures,
    video: origin.video,
  };
}

export async function downloadPictures(urls: string[]): Promise<Array<string>> {
  let names: string[] = [];
  let tasks: Promise<void>[] = [];
  urls.forEach((url) => {
    tasks.push(
      downloadPicture(url)
        .then((name) => {
          names.push(name);
        })
        .catch(console.log)
    );
  });
  await Promise.all(tasks);
  return names;
}

// returns true if succeed, false if failed
export async function downloadPicture(url: string): Promise<string> {
  return axios({
    url,
    responseType: 'arraybuffer',
  }).then(({ data }) => {
    // console.log('download picture......');
    let name = extractPictureName(url);
    if (!existsSync(`./pictures/${name}`)) {
      console.log('caker:download:' + url);
      writeFileSync(`./pictures/${name}`, data, 'binary');
      // console.log('download ok!');
    }
    return name;
  });
}

export function extractPictureName(url: string): string {
  let name = url.match(/album\/(.*)/s);
  if (name === null) {
    name = url.match(/archive\/(.*)/s);
  }
  if (name === null) {
    name = url.match(/article\/(.*)/s);
  }
  if (name === null) {
    console.log('cannot analyse the picture url: ' + url);
    return '';
  }
  return name[1];
}

/**
 *
 * @param cmd
 * @returns -1 if not match, 0 default, or an offset number
 */
export function matchNewsCmd(cmd: string): number {
  const regexp = /^(！新饼|!新饼) *([0-9]*)$/;
  const result = regexp.exec(cmd);
  if (result === null) return -1;
  // 缺省
  if (result[2] === '') return 0;
  const num = parseInt(result[2]);
  // 只允许0~11
  if (num < 0 || num >= 11) return -1;
  return num;
  // assert that result is matched
}

/**
 *
 * @param time
 * @returns yyyy-mm-dd hh:mm:ss
 */
export function formatTime(time: Date): string {
  // 将时间后推8h到东八区
  return new Date(time.getTime() + 8 * 3600 * 1000)
    .toJSON()
    .replace('T', ' ')
    .substring(0, 19);
}
