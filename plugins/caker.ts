// 监听b站大饼
import axios from 'axios';
import {Context} from 'koishi-core';
import {existsSync, writeFileSync} from 'fs';
import {CQCode} from 'koishi-utils';
import {groups, picture_path_prefix} from '../private_config';
module.exports.name = 'caker';

interface Content {
    text: string,
    pictures: string[],
    vedio_url: string,
    time: number,
}

const cake_time: number = 1;     //minutes
const bili_uid = 161775300;        // b站号


export function apply(ctx: Context) {
    ctx.middleware(async (meta, next) => {
        // console.log(meta);
        let time_str:string;
        if (meta.message === '!新饼' || meta.message === '！新饼') {
            const promises = [];
            promises.push(getDynamics(bili_uid).then((content: Content)=>{
                let paths = content.pictures;
                console.log(content);
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
            let now = new Date().getTime();
            now /= 1000;
            const promises = [];
            let time_str:string;
            promises.push(getDynamics(bili_uid).then((content: Content)=>{
                // console.log(now-content.time);
                if (now - content.time < cake_time*60) {
                    let bot = ctx.bots[0];
                    let paths = content.pictures;
                    console.log(content);
                    bot.sendGroupMsg(groups[0], content.text)
                    for (const path of paths) {
                        bot.sendGroupMsg(groups[0],CQCode.stringify('image', {file: picture_path_prefix+path}));
                    }
                    if (content.vedio_url !== '') {
                        bot.sendGroupMsg(groups[0],content.vedio_url);
                    }
                    time_str = format_time(content.time);
                    bot.sendGroupMsg(groups[0],`发饼时间：${time_str}`);
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
function getDynamics(uid: number):Promise<Content>{
    return get_info(uid).then(async (content: Content):Promise<Content>=>{
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
function get_info(uid: number): Promise<Content> {
    let i = 0;
    return axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}&offset_dynamic_id=0`)
    .then((res)=>{
        let content = JSON.parse(res.data.data.cards[i].card);
        if (content.dynamic !== undefined) {    // 说明发视频了
            return handle_video(content);
        } else if (content.item !== undefined) {
            content = content.item;
            if (content.category === 'daily') { // 说明是动态
                return handle_daily(content);
            } else if (content.rp_id !== 0) {   // 说明是转发
                return handle_rp(content);
            }
        }
        return {text:'', pictures:[] as string[], vedio_url:'', time:0};
    })
}

function get_picture_name(picture_url: string):string {
    let name = picture_url.match(/album\/(.*)/s);
    if (name === null) {
        name = picture_url.match(/archive\/(.*)/s);
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
            console.log('download:'+url);
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
    //已经content = content.item;
    //content里是动态信息（后边几个都在item里），description是文字，upload_time是时间戳，category是daily，pictures是图片信息列表
    
    let description:string = content.description;
    let pictures:any = content.pictures;
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

function format_time(timestamp = +new Date()):string {
    timestamp *= 1000;
    let date = new Date(timestamp + 8 * 3600 * 1000);
    return date.toJSON().substr(0, 19).replace('T', ' ');
}
