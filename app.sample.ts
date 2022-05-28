// 注册插件，作用相当于上面配置文件中的 plugins 部分
import { App, Time } from 'koishi';
// import * as bili from './plugins/bilibili'
import * as bili from './plugins/bilibili/bilibili';
import * as search from 'koishi-plugin-image-search';
import * as repeat from './plugins/repeat';
import * as twitter from './plugins/twitter/twitter';
import * as voice from './plugins/voice/voice';
import { SaucenaoApiKey, BotId, TwitterAccessToken } from './private_config';
import 'koishi-adapter-onebot';
// 创建一个 Koishi 应用
const app = new App({
  type: 'onebot:ws',
  selfId: BotId.toString(),
  server: 'ws://127.0.0.1:6700',
  delay: {
    message: 0.1 * Time.second,
  },
});

app
  .plugin(bili)
  .plugin(search, {
    lowSimilarity: 20,
    highSimilarity: 40,
    saucenaoApiKey: SaucenaoApiKey,
  })
  .plugin(repeat)
  .plugin(twitter, { accessToken: TwitterAccessToken })
  .plugin(voice);
// 启动应用
app.start();
