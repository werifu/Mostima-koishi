// const { App } = require('koishi')

// // 你需要手动安装适配器
// require('koishi-adapter-cqhttp')

// const app = new App({
//   // 这部分与上面的配置文件作用基本相同
//   type: 'cqhttp:http',
//   port: 8080,
//   selfId: 2842838050,
//   server: 'http://localhost:5700',
//   token: '1145141919810',
// })

// // 注册插件，作用相当于上面配置文件中的 plugins 部分
// app.plugin(require('koishi-plugin-common'))
//     .plugin(require('./plugins/acker.ts'))
//     .plugin(require('./plugins/caker.ts'))
//     .plugin(require('./plugins/char_word.ts'))
//     .plugin(require('./plugins/music.ts'))
//     .plugin(require('./plugins/illustrator.ts'))
//     .plugin(require('./plugins/repeat.ts'))
// app.start()