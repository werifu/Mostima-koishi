// 监听b站大饼
const axios = require('axios');
const fs = require('fs');
const {CQCode} = require('koishi-utils');
module.exports.name = 'caker';
module.exports.apply = (ctx) => {
    ctx.middleware((meta, next) => {
        // console.log(meta);
        if (meta.message === '!新饼' || meta.message === '！新饼') {
            const promises = [];
            promises.push(getDynamics(161775300).then((content)=>{
                let paths = content.picture_paths;
                console.log(content);
                return meta.$send(content.text);
                // for (const path of paths) {
                //     meta.$bot.sendGroupMsg(211768234, CQCode.stringify('image', {file: `file:///D://Node.js/node_save/Mostima-koishi/pictures/${path}}`}));
                // }
            }));
            return meta.$send(CQCode.stringify('image', {file: `file:///D://Node.js/node_save/Mostima-koishi/pictures/22ece7d5df922744b3bb84894ae745db652cd787.jpg`}));
        } else {
            return next();
        }
    })
}


/* 
return {
    text,
    picture_paths,
    vedio_url,
    time,
}
*/
function getDynamics(uid) {
    return get_info(uid).then((content)=>{
        if (content === {}) return {};
        let picture_urls = content.picture_urls;
        let picture_paths = new Array();
        let all_axios = new Array();
        for (const picture_url of picture_urls) {
            all_axios.push(download_picture(picture_url).then(()=>{
                picture_paths.push(`${get_picture_name(picture_url)}`);
            }));
        }
        return Promise.all(all_axios).then(()=> {
            // console.log(picture_paths);
            return {
                text: content.text,
                picture_paths,
                vedio_url: content.vedio_url,
                time: content.time
            }
        });
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
function get_info(uid) {
    let i = 0;
    let info = axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${uid}&offset_dynamic_id=0`)
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
        return {};
    })
    return info;
}

function get_picture_name(picture_url) {
    let name = picture_url.match(/album\/(.*)/s);
    if (name === null) {
        name = picture_url.match(/archive\/(.*)/s);
    }
    return name[1];
}

function download_picture(url) {
    return axios({
        url,
        responseType: 'arraybuffer'
      }).then(({data}) => {
        // console.log('download picture......');
        let name = get_picture_name(url);
        if (!fs.existsSync(`./pictures/${name}`)){
            console.log('download:'+picture_url);
            fs.writeFileSync(`./pictures/${name}`, data, 'binary');
            console.log('download ok!');
        }
    }
    ).catch((err) => {
        console.log('failed download:'+err);
    })
}

function handle_video(content) {
    //content里重要的是dynamic(文字内容),ctime（时间戳）， jump_url(视频链接（内含av号), pic（封面图片链接）
    let text = content.dynamic;
    let av = content.jump_url.match(/video\/(.*)\/\?/s)[1];
    let vedio_url = `https://www.bilibili.com/video/av${av}`;
    let picture_urls = new Array(content.pic); 
    let time = format_time(content.ctime);
    return {
        text,
        picture_urls,
        vedio_url,
        time
    }
}
function handle_daily(content) {
    //已经content = content.item;
    //content里是动态信息（后边几个都在item里），description是文字，upload_time是时间戳，category是daily，pictures是图片信息列表
    
    let description = content.description;
    let pictures = content.pictures;
    let time = format_time(content.upload_time);
    // console.log(content);
    // 忽略转发之类的非正常动态
    
    let picture_urls = new Array();
    for (let i = 0; i < pictures.length; i++) {
        picture_urls.push(pictures[i].img_src);
    }
    // console.log(picture_urls);
    return {
        text: description,
        picture_urls: picture_urls,
        vedio_url: '',
        time: time
    }
}

function handle_rp(content) {
    // content中有timestamp（时间戳）和content(文字内容)
    let text = '转发：\n'+ content.content;
    let time = format_time(content.timestamp);
    return {
        text,
        picture_urls: [],
        vedio_url: '',
        time
    }
}
function format_time(timestamp = +new Date()) {
    timestamp *= 1000;
    let date = new Date(timestamp + 8 * 3600 * 1000);
    return date.toJSON().substr(0, 19).replace('T', ' ');
}
// getDynamics(161775300).then((content)=>{
//     console.log(content);
// });

