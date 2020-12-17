# Mostima-koishi
主要由TypeScript编写，基于go-cqhttp与koishi框架的舟游bot
## 启动
首先需要go-cqhttp服务器处于运行状态，能正确接收消息，并且将event上报给koishi
将koishi.config.sample.js改名为koishi.config.js，同样地对private_config.sample.ts进行操作。并修改其中的配置。

使用以下指令启动koishi（支持ts插件）
```  
npx koishi start -- -r ts-node/register
```

## DONE

[√] `！新饼 || !新饼`
返回方舟官号最新的b站动态，有图片附带图片，有视频附带视频地址。
[√] `！音角 || !音角`
使用xml卡片消息推歌，网易云，塞壬唱片随机。
[√] `！音乐 || !音乐`
根据tag搜索网易云，返回第一首曲子
[√] `！色图 || !色图`
返回本地色图，考虑开放上传功能。
## TODO

### ！名言 || !名言
使用PRTS随机角色，再随机发言，带姓名