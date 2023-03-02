# Mostima-koishi
主要由TypeScript编写，基于[go-cqhttp](https://github.com/Mrs4s/go-cqhttp)与[koishi](https://github.com/koishijs/koishi)框架的舟游bot
## 启动

````
git clone https://github.com/werifu/Mostima-koishi.git

npm i
````

首先需要go-cqhttp服务器处于运行状态，能正确接收消息，并且将event上报给koishi

改名：private_config.sample.ts => private_config.ts

修改其中的配置

创建pictures、illusts、records文件夹

需要自己的推特开发者token


```  
# 启动koishi
ts-node app.ts
```

## DONE

* 发饼 bilibili

    抓取方舟b站动态，主动轮询b站动态，发新动态时会推送至群里。

    ```
    !新饼 [0~9]
    // 支持0~9的索引，默认为0（其实可以超过9但是我写死了XD）
    // 支持全角！和半角!
    ```

* 语音 voice

    随机干员语录，数据来自https://github.com/Kengxxiao/ArknightsGameData和[PRTS wiki](prts.wiki)

    ```
    语音 [角色名] [中文|日文|方言]
    ```
    参数可选，默认随机

    语音文件如：[夕的语音](https://static.prts.wiki/voice_custom/char_2015_dusk_cn_topolect/%E5%A4%95_%E4%BB%BB%E5%91%BD%E5%8A%A9%E7%90%86.wav)

* 搜图
    ```
    搜图
    ```
    使用koishi现成轮子

* 推特关注
  ```
  !twi-list // 查看关注列表
  !twi-sub @twitter_id [--ark]  // 带--ark参数只转发带方舟tag的图，@后为推特的username(而不是昵称)
  !twi-td @twitter_id   // 退订
  !twitter // 打开help
  ```
  使用推特开发者平台的HTTP2 rule stream实现

  自己维护了规则
* 来点色图（非R18)
  ```
  来点色图
  ```
  从推特历史图库里找

* chatGPT
  ```
  小莫，xxxxx
  ```
  xxxxx 即为你想问的

## TODO
[ ] 容器化  // 现在是用systemd跑的（懒得更了
