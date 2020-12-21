# Mostima-koishi
主要由TypeScript编写，基于[go-cqhttp](https://github.com/Mrs4s/go-cqhttp)与[koishi](https://github.com/koishijs/koishi)框架的舟游bot
## 启动
````
git clone https://github.com/werifu/Mostima-koishi.git

npm i
````

首先需要go-cqhttp服务器处于运行状态，能正确接收消息，并且将event上报给koishi

将koishi.config.sample.js改名为koishi.config.js，同样地对private_config.sample.ts进行操作。并修改其中的配置，具体可参见[koishi文档](koishi.js.org)。

创建pictures和illustrations文件夹，一个存放新饼的图片，一个存放色图（记得把绝对路径前缀写private_config里）

```  
# 启动koishi（支持ts插件）
npx koishi start -- -r ts-node/register
```

## DONE

* 发饼

    对应caker.ts

    抓取方舟b站动态，有主动轮询b站动态，发新动态时会推送至群里。

    ```
    !新饼 [0~9]
    // 支持0~9的索引，默认为0（其实可以超过9但是我写死了XD）
    // 支持全角！和半角!
    ```

* 随机色图

    对应illustration.ts

    使用本地图库~~（这才符合自己XP）~~

    ```
    !色图
    //支持全角！和半角!
    ```

* 音乐

    对应music.ts

    基于网易云的api，有主动轮询塞壬唱片的专辑信息，发新专时会推送至群里。

    ```
    !音角
    // 随机抽网易云塞壬唱片的音乐，用xml推到qq
    !音乐 [search_tag]
    // 返回网易云搜索search_tag的第一个结果
    
    // 支持全角！和半角!
    ```

* 名言

    对应char_word.ts

    随机干员语录，数据来自https://github.com/Kengxxiao/ArknightsGameData

    ```
    !名言
    // 支持全角！和半角!
    ```

* 复读

    好像没什么好说的（），对应repeat.ts

## TODO

ないです