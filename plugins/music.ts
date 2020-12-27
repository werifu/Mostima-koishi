import {Context} from 'koishi-core';
import {CQCode} from 'koishi-utils';
import axios from 'axios';
import {owner, polling_period, groups} from '../private_config';
export const name: string = 'music';

interface Music {
    id: number;
    name: string;
    artist: string;
    img_src: string;
}

const cake_time: number = polling_period;
// 塞壬唱片的网易云id
const siren_id: number = 32540734;

export function apply(ctx: Context) {

    ctx.middleware(async (meta, next) => {
        let msg = meta.message;
        let search_exp = /^(！音乐|!音乐).*/;
        if (msg.includes('!音角') || msg.includes('！音角')) {
            return await getRandomArkMusic().then((music: Music)=>{
                let data: string = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><msg serviceID="2" templateID="1" action="web" brief="&#91;分享&#93; ${music.name}" sourceMsgId="0" url="http://music.163.com/m/song/${music.id}" flag="0" adverSign="0" multiMsgFlag="0" ><item layout="2"><audio cover="${music.img_src}" src="https://music.163.com/song/media/outer/url?id=${music.id}.mp3" /><title>${music.name}</title><summary>${music.artist}</summary></item><source name="网易云音乐" icon="https://pic.rmb.bdstatic.com/911423bee2bef937975b29b265d737b3.png" url="http://web.p.qq.com/qqmpmobile/aio/app.html?id=1101079856" action="app" a_actionData="com.netease.cloudmusic" i_actionData="tencent100495085://" appid="100495085" /></msg>`;
                return meta.$send(CQCode.stringify('xml',{data:data}));    
            })
        } else if (msg.match(search_exp)){
            let tag = msg.match(search_exp)[0].substring(3);
            if (tag === '') {
                tag = 'boiling blood';  // 默认歌曲
            }
            return await searchMusic(encodeURI(tag)).then((music:Music)=> {
                if (music.id === -1) {
                    return meta.$send('ないです');
                }
                let data: string = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><msg serviceID="2" templateID="1" action="web" brief="&#91;分享&#93; ${music.name}" sourceMsgId="0" url="http://music.163.com/m/song/${music.id}" flag="0" adverSign="0" multiMsgFlag="0" ><item layout="2"><audio cover="${music.img_src}" src="https://music.163.com/song/media/outer/url?id=${music.id}.mp3" /><title>${music.name}</title><summary>${music.artist}</summary></item><source name="网易云音乐" icon="https://pic.rmb.bdstatic.com/911423bee2bef937975b29b265d737b3.png" url="http://web.p.qq.com/qqmpmobile/aio/app.html?id=1101079856" action="app" a_actionData="com.netease.cloudmusic" i_actionData="tencent100495085://" appid="100495085" /></msg>`;
                return meta.$send(CQCode.stringify('xml',{data:data}));    
            })
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
            await getLastAlbum(siren_id).then(getMusicByAlbumID).then((music:Music)=> {
                if (music.id === -1) return;
                groups.forEach((group: number) => {
                    let data: string = `<?xml version='1.0' encoding='UTF-8' standalone='yes' ?><msg serviceID="2" templateID="1" action="web" brief="&#91;分享&#93; ${music.name}" sourceMsgId="0" url="http://music.163.com/m/song/${music.id}" flag="0" adverSign="0" multiMsgFlag="0" ><item layout="2"><audio cover="${music.img_src}" src="https://music.163.com/song/media/outer/url?id=${music.id}.mp3" /><title>${music.name}</title><summary>${music.artist}</summary></item><source name="网易云音乐" icon="https://pic.rmb.bdstatic.com/911423bee2bef937975b29b265d737b3.png" url="http://web.p.qq.com/qqmpmobile/aio/app.html?id=1101079856" action="app" a_actionData="com.netease.cloudmusic" i_actionData="tencent100495085://" appid="100495085" /></msg>`;
                    ctx.bots[0].sendGroupMsg(group, `自由的鹰角又发歌了`).then(()=>{
                        ctx.bots[0].sendGroupMsg(group, CQCode.stringify('xml',{data:data}))
                    });
                })
            });
            return;
        }, cake_time*1000*60);
    })
}

function getLastAlbum(artist_id): Promise<number> {
    let artist_albums_api: string = `http://music.163.com/api/artist/albums/${artist_id}?id=${artist_id}&offset=0&total=true&limit=1`
    return axios.get(artist_albums_api).then((res) => {
        if (res.data.hotAlbums.length === 0) return -1;
        let album: any = res.data.hotAlbums[0];
        let now = new Date().getTime();
        console.log(`现在是${now}, 上一次发饼是${album.publishTime}, 距离上一次发饼是${(now-album.publishTime)/1000}秒`);
        if (now - album.publishTime < cake_time * 60 * 1000) {
            return album.id;
        }
        return -1;
    })
}


function getRandomArkAlbum() :Promise<number> {
    let limit: number = 200;
    let artist_id: number = siren_id;
    let artist_albums_api: string = `http://music.163.com/api/artist/albums/${artist_id}?id=${artist_id}&offset=0&total=true&limit=${limit}`
    return axios.get(artist_albums_api).then((res:any)=>{
        let album: any = res.data.hotAlbums[getRandomInt(res.data.hotAlbums.length)];
        // console.log(album.id);
        return album.id;
    })
}

function getRandomArkMusic(): Promise<Music> {

    return getRandomArkAlbum().then(getMusicByAlbumID);
}

function searchMusic(tag: string): Promise<Music> {
    let search_api: string = `http://music.163.com/api/search/get/web?csrf_token=hlpretag=&hlposttag=&s=${tag}&type=1&offset=0&total=true&limit=1`
    let music = {id: -1, name: "", artist: "", img_src: ""};
    return axios.get(search_api).then((res:any)=> {
        res = res.data.result;
        // console.log(res);
        if (res.songCount === 0) {
            console.log("song count = 0:", res);
            return music;
        } else {
            console.log(res);
            let song: any = res.songs[0];
            
            return getAlbumImgUrl(song.album.id).then((imgUrl) => {
                music.id = song.id;
                music.name = song.name;
                music.artist = formatArtists(song.artists);
                music.img_src = imgUrl;
                return music;
            });
        }
    }).catch((err)=>{
        console.log(err);
        return music;
    });
}

function getRandomInt(max_num:number):number {
    return Math.floor(Math.random() * Math.floor(max_num));
}

function formatArtists(artists: any[]):string {
    let artist_names: string[] = new Array();
    artists.forEach((artist:any)=> {
        artist_names.push(artist.name);
    });
    let format: string = artist_names.join('/');
    return format;
}

function getAlbumImgUrl(album_id: number):Promise<string> {
    let album_songs_api: string = `http://music.163.com/api/album/${album_id}?ext=true&id=${album_id}&offset=0&total=true&limit=1`
    return axios.get(album_songs_api).then((res)=>{
        return res.data.album.picUrl as string;
    })
}

function getMusicByAlbumID(album_id: number): Promise<Music>{
    let music = {id: -1, name: "", artist: "", img_src: ""};
    if (album_id === -1) return new Promise(()=>{return music});
    let limit: number = 200;
    let album_songs_api: string = `http://music.163.com/api/album/${album_id}?ext=true&id=${album_id}&offset=0&total=true&limit=${limit}`
    return axios.get(album_songs_api).then((res:any)=> {
        res = res.data;
        // console.log(res.album.picUrl);
        music.img_src = res.album.picUrl;
        let songs: any = res.album.songs;
        let song: any = songs[getRandomInt(songs.length)];
        music.name = song.name;
        music.id = song.id;
        let artists: any = song.artists;
        music.artist = formatArtists(artists);
        
        return music;
    })
}