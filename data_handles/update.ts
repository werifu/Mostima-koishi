import fs = require('fs');
import axios from 'axios';
class Character {
    char_name: string
    char_id: string
    words:  {
        title: string
        text: string
    }[]
    constructor(char_name: string, char_id: string) {
        this.char_name = char_name;
        this.char_id = char_id;
        this.words = new Array();
    }
}
function updateTable() {
    let character_table_url = `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/character_table.json`;
    let charword_table_url = `https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/master/zh_CN/gamedata/excel/charword_table.json`;
    let all_axios = new Array();
    all_axios.push(
        axios.get(character_table_url).then((res) => {
            let content = res.data;
            fs.writeFileSync('character_table.json', JSON.stringify(content));
        }).catch((err) => console.log(err))
    );
    all_axios.push(
        axios.get(charword_table_url).then((res) => {
        let content = res.data;
        fs.writeFileSync('charword_table.json', JSON.stringify(content));
    }).catch((err) => console.log(err))
    );
    return Promise.all(all_axios)
}

function updateWord() {
    let charword_obj: any = fs.readFileSync('./charword_table.json');
    let char_obj: any = fs.readFileSync('./character_table.json');
    charword_obj = JSON.parse(charword_obj);
    char_obj = JSON.parse(char_obj);
    
    let words = {};
    for (let i in char_obj) {
        if (!i.match(/^char_/)) continue;
        let char = char_obj[i];
        words[i] = new Character(char.name, i);
    }
    
    for (let i in charword_obj) {
        let word = charword_obj[i];
        let char_id: string = word.charId;
        words[char_id].words.push({title: word.voiceTitle, text: word.voiceText})
    }
    // console.log(Object.keys(words));
    fs.writeFileSync('word.json', JSON.stringify(words), 'utf8');
}


updateTable().then(() => {
    updateWord();
})
