import fs = require('fs');
import axios from 'axios';
var cheerio = require('cheerio');
class Character {
    char_name: string
    char_id: string
    words:  {
        title: string
        text: string
        text_jp: string
        record_url: string
    }[]
    constructor(char_name: string, char_id: string) {
        this.char_name = char_name;
        this.char_id = char_id;
        this.words = new Array();
    }
}

function updateTable() {
    let character_table_url = `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json`;
    return axios.get(character_table_url).then((res) => {
            let content = res.data;
            fs.writeFileSync('character_table.json', JSON.stringify(content));
        }).catch((err) => console.log(err))

}

function updateWord() {
    let char_obj: any = fs.readFileSync('./character_table.json');

    char_obj = JSON.parse(char_obj);
    
    let words = {};
    for (let i in char_obj) {
        if (!i.match(/^char_/)) continue;
        let char = char_obj[i];
        words[i] = new Character(char.name, i);
    }
    let all_axios = new Array();
    for (let i in words) {
        let char_name = words[i].char_name;
        let record_page_url = `http://prts.wiki/w/${encodeURI(char_name)}/%E8%AF%AD%E9%9F%B3%E8%AE%B0%E5%BD%95`;
        all_axios.push(
            axios.get(record_page_url).then((res) => {
                // console.log(char_name);
                let $ = cheerio.load(res.data);
                let trs = $('tbody').first()[0].children;
                for (let tr of trs) {
                    if (tr.type === 'text') continue;
                    if (tr.type !== 'tag' || tr.name !== 'tr') {
                        console.log(`${char_name} failed`);
                        continue
                    };
                    tr = tr.children;
                    // title 1
                    let title = tr[1].children[0].children[0].data
                    // text 3
                    let text = tr[3].children[1].children[0].data;
                    let text_jp = tr[3].children[0].children[0].data
                    // wav url 5
                    let record_url = tr[5].children[1].children[5].attribs.href;
                    words[i].words.push({title: title, text_jp: text_jp, text: text, record_url: record_url})
                    // console.log(words[i]);
                }
                // console.log(`${char_name} ok`);
            }).catch(error => {
                if (!error.response) {
                    console.log(`response error: ${char_name} ---- ${error}`);
                    return;
                }
                if (error.response.status === 404) {
                    return;
                }
                console.log(`special error: ${char_name} ---- ${error}`);
            })
        )
    }
    return Promise.all(all_axios).then(()=>fs.writeFileSync('word.json', JSON.stringify(words), 'utf8'))

}


updateTable().then(() => {
    updateWord().then(()=>{
        console.log('word update finish')
    }).catch(console.log)
})