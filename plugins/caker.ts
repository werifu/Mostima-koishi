// 监听b站大饼
import axios from 'axios';
import {Context} from 'koishi-core';
import {existsSync, writeFileSync} from 'fs';
import {CQCode} from 'koishi-utils';
import {groups, picture_path_prefix, polling_period} from '../private_config';
export const name = 'caker';

interface Content {
    text: string,
    pictures: string[],
    vedio_url: string,
    time: number,
}

const cake_time: number = polling_period;     //minutes
const bili_uid = 161775300;        // b站号,明日方舟：161775300


export function apply(ctx: Context) {
    ctx.middleware(async (meta, next) => {
        // console.log(meta);
        let time_str:string;
        let search_exp = /^(！新饼|!新饼).*/;
        if (meta.message.match(search_exp)) {
            let opt_i = meta.message.match(search_exp)[0].substring(3);
            if (opt_i === '') opt_i = '0';
            let index = parseInt(opt_i, 10);
            if (isNaN(index) || index < 0 || index > 9) {
                return meta.$send('只支持数字0~9噢');
            }
            
            // console.log(index);
            const promises = [];
            promises.push(getDynamics(bili_uid, index).then((content: Content)=>{
                let paths = content.pictures;
                // console.log(content);
                meta.$send(content.text)
                for (const path of paths) {
                    meta.$send(CQCode.stringify('image', {file: picture_path_prefix+path}));        //cqhttp需要知道绝对路径
                }
                if (content.vedio_url !== '') {
                    meta.$send(content.vedio_url);
                }
                time_str = format_time(content.time);
            }));
            await Promise.all(promises);
            return meta.$send(`发饼时间：${time_str}`);
        } else {
            return next();
        }
    })

    ctx.on('connect', async()=>{
        setInterval(async()=>{
            const promises = [];
            let time_str:string;
            promises.push(getDynamics(bili_uid, 0).then((content: Content)=>{
                let now = new Date().getTime();
                now /= 1000;
                
                console.log(`主动轮询：现在是${now},上一次饼发生距离现在${now-content.time}秒`);
                if (now - content.time < cake_time*60) {
                    let bot = ctx.bots[0];
                    let paths = content.pictures;
                    time_str = format_time(content.time);
                    // console.log(content);
                    groups.forEach((group) => {
                        bot.sendGroupMsg(group,`发饼时间：${time_str}`).then(()=>{
                            bot.sendGroupMsg(group, content.text)}
                        )
                        for (const path of paths) {
                            bot.sendGroupMsg(group,CQCode.stringify('image', {file: picture_path_prefix+path}));
                        }
                        if (content.vedio_url !== '') {
                            bot.sendGroupMsg(group,content.vedio_url);
                        }
                        time_str = format_time(content.time);
                        
                    })
                }
            }));
            await Promise.all(promises);
            return;
        }, cake_time*1000*60);
    })
}



/* 
return {
    text,
    pictures,
    vedio_url,
    time,
}
*/
function getDynamics(uid: number, i: number):Promise<Content>{
    return get_info(uid, i).then(async (content: Content):Promise<Content>=>{
        let picture_urls = content.pictures;
        let picture_paths:string[] = new Array();
        let all_axios = new Array();
        let pictures: string[] = new Array();
        for (const picture_url of picture_urls) {
            all_axios.push(download_picture(picture_url).then(()=>{
                picture_paths.push(`${get_picture_name(picture_url)}`);
            }));
            pictures.push(get_picture_name(picture_url));
        }
        
        let dynamics = await Promise.all(all_axios).then(()=> {
            // console.log(picture_paths);
            return {
                text: content.text,
                pictures: pictures,
                vedio_url: content.vedio_url,
                time: content.time
            }
        });
        return dynamics;
    })
}



/* 
return {
    text,
    picture_urls,
    vedio_url,
    time,
}
*/
function get_info(uid: number, i: number): Promise<Content> {
    return axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}&offset_dynamic_id=0`)
    .then((res)=>{
        // console.log(res.data.data.cards[i].desc)
        let content = JSON.parse(res.data.data.cards[i].card);
        // console.log(content);
        switch (res.data.data.cards[i].desc.type) {
            case 64: // 专栏
                return handle_article(content);
            case 2: // 动态
                return handle_daily(content);
            case 8: // 视频
                return handle_video(content);
            default:    // 转发
                return handle_rp(content);    
        }
        return {text:'', pictures:[] as string[], vedio_url:'', time:0};
    })
}

function get_picture_name(picture_url: string):string {
    // console.log(picture_url);
    let name = picture_url.match(/album\/(.*)/s);
    if (name === null) {
        name = picture_url.match(/archive\/(.*)/s);
    } 
    if (name === null) {
        name = picture_url.match(/article\/(.*)/s)
    }
    return name[1];
}

function download_picture(url: string):Promise<any> {
    return axios({
        url,
        responseType: 'arraybuffer'
      }).then(({data}) => {
        // console.log('download picture......');
        let name = get_picture_name(url);
        if (!existsSync(`./pictures/${name}`)){
            console.log(
                'caker:download:'+url);
            writeFileSync(`./pictures/${name}`, data, 'binary');
            // console.log('download ok!');
        }
    }
    ).catch((err) => {
        console.log('failed download:'+err);
    })
}

function handle_video(content:any):Content {
    //content里重要的是dynamic(文字内容),ctime（时间戳）， jump_url(视频链接（内含av号), pic（封面图片链接）
    let text:string = content.dynamic;
    let av = content.jump_url.match(/video\/(.*)\/\?/s)[1];
    let vedio_url = `https://www.bilibili.com/video/av${av}`;
    let picture_urls:string[] = new Array(content.pic); 
    let time:number = content.ctime;
    return {
        text: text,
        pictures:picture_urls,
        vedio_url,
        time
    }
}
function handle_daily(content:any):Content {
    //content里是动态信息（后边几个都在item里），description是文字，upload_time是时间戳，category是daily，pictures是图片信息列表
    content = content.item;
    let description:string = content.description;
    
    let pictures:any = content.pictures;
    // console.log(pictures);
    let time:number = content.upload_time;
    // console.log(content);
    // 忽略转发之类的非正常动态
    
    let picture_urls:string[] = new Array();
    for (let i = 0; i < pictures.length; i++) {
        picture_urls.push(pictures[i].img_src);
    }
    // console.log(picture_urls);
    return {
        text: description,
        pictures: picture_urls,
        vedio_url: '',
        time
    }
}

function handle_rp(content:any):Content {
    // content中有timestamp（时间戳）和content(文字内容)
    let text:string = '转发：\n'+ content.content;
    let time:number = content.timestamp;
    return {
        text,
        pictures: [] as string[],
        vedio_url: '',
        time
    }
}

function handle_article(content:any):Content {
    //content里重要的是title+summary(文字内容),publish_time（时间戳）, image_urls（封面图片链接[]）,ud 即cv号
    let text:string = `专栏大饼！！\n【${content.title}】\n${content.summary}`;
    let cv = content.id;
    let cv_url = `https://www.bilibili.com/read/cv${cv}`;
    let picture_urls:string[] = content.image_urls; 
    let time:number = content.publish_time;
    return {
        text: text,
        pictures:picture_urls,
        vedio_url: cv_url,
        time
    }
}

function format_time(timestamp = +new Date()):string {
    timestamp *= 1000;
    let date = new Date(timestamp + 8 * 3600 * 1000);
    return date.toJSON().substr(0, 19).replace('T', ' ');
}
