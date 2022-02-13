// b站动态相关
import {
  getDynamic,
  handleDailyCard,
  handleRpCard,
  handleVideoCard,
  extractPictureName,
  downloadPictures,
  matchNewsCmd,
  formatTime,
  handleTextOnlyCard,
} from './utils';
// 日常动态的card str
const cardDaily =
  '{"item":{"at_control":"","category":"daily","description":"#明日方舟#\\n【浊酒澄心】\\n\\/\\/老鲤\\n“我家的雇员承蒙罗德岛照顾了，他们没给诸位添什么麻烦吧？对了，这是事务所的名片，您收好。”\\n\\n____________\\n“欸？老鲤也来这了？事务所这几个月房租水电岂不是白交了？”\\n“肯定又是跑来偷懒的吧。真是的，他什么时候才能变得勤奋一点啊......”\\n“如果他真的很闲的话，希望他能来食堂帮厨啊。”\\n来自侦探事务所的三位干员听到老鲤来到罗德岛的消息时，都没有表现出一星半点的高兴。抱着三份礼物躲在一旁的老鲤则哭丧着脸，连连叹气。\\n......\\n“孩子们都长大了，有自己的生活了，好事，好事......博士，我心里难过，今天的工作就先别找我了，有什么事明天再说吧。”老鲤边这样说着，边在博士的办公室里坐下泡起茶来。\\n不得不说，老鲤泡的茶还是很香的。 ","id":183729882,"is_fav":0,"pictures":[{"img_height":1515,"img_size":952.8466796875,"img_src":"https:\\/\\/i0.hdslb.com\\/bfs\\/album\\/7371752c1993f38d82ae20633d068fd274816a60.jpg","img_tags":null,"img_width":1000},{"img_height":1080,"img_size":1431.580078125,"img_src":"https:\\/\\/i0.hdslb.com\\/bfs\\/album\\/c3f140d7859f205203efd7a4d3f3fade762b8f1b.jpg","img_tags":null,"img_width":1920},{"img_height":816,"img_size":6108.728515625,"img_src":"https:\\/\\/i0.hdslb.com\\/bfs\\/album\\/441829166d971039c15cea01a16f256b72535bdb.gif","img_tags":null,"img_width":499},{"img_height":816,"img_size":4080.5419921875,"img_src":"https:\\/\\/i0.hdslb.com\\/bfs\\/album\\/bc0af4bdf6b6a91a681302da37e2f45a828a60e0.gif","img_tags":null,"img_width":499},{"img_height":816,"img_size":7748.0224609375,"img_src":"https:\\/\\/i0.hdslb.com\\/bfs\\/album\\/d05a6fa7f532766cb6778783dc9ea8b93651ec7c.gif","img_tags":null,"img_width":499},{"img_height":816,"img_size":7974.45703125,"img_src":"https:\\/\\/i0.hdslb.com\\/bfs\\/album\\/b74aae0834566b0bb052689a207789ebe9dd5509.gif","img_tags":null,"img_width":499},{"img_height":816,"img_size":8162.4541015625,"img_src":"https:\\/\\/i0.hdslb.com\\/bfs\\/album\\/a558e1a070936e3d127398aec0b40f0d931c7dc6.gif","img_tags":null,"img_width":499}],"pictures_count":7,"reply":5413,"role":[],"settings":{"copy_forbidden":"0"},"source":[],"title":"","upload_time":1642748707},"user":{"head_url":"https:\\/\\/i0.hdslb.com\\/bfs\\/face\\/89154378c06a5ed332c40c2ca56f50cd641c0c90.jpg","name":"明日方舟","uid":161775300,"vip":{"avatar_subscript":1,"due_date":1648828800000,"label":{"label_theme":"annual_vip","path":"","text":"年度大会员"},"nickname_color":"#FB7299","status":1,"theme_type":0,"type":2,"vip_pay_type":0}}}';
// 转发的card str
const cardRpDaily =
  '{ "user": { "uid": 161775300, "uname": "明日方舟", "face": "https:\\/\\/i0.hdslb.com\\/bfs\\/face\\/89154378c06a5ed332c40c2ca56f50cd641c0c90.jpg" }, "item": { "rp_id": 617671289930360332, "uid": 161775300, "content": "恭喜@某神游的橙味汽水 @悲潮歌咏 @试图尝试改名变欧 等30位同学中奖，已私信通知，详情请点击互动抽奖查看。", "ctrl": "[ { \\"data\\": \\"386372220\\", \\"location\\": 2, \\"length\\": 9, \\"type\\": 1 }, { \\"data\\": \\"104641145\\", \\"location\\": 12, \\"length\\": 5, \\"type\\": 1 }, { \\"data\\": \\"205158908\\", \\"location\\": 18, \\"length\\": 9, \\"type\\": 1 } ]", "orig_dy_id": 612979948691247690, "pre_dy_id": 612979948691247690, "timestamp": 1642651204, "reply": 1163, "orig_type": 2 }, "origin": "{\\"item\\":{\\"at_control\\":\\"[{\\\\\\"data\\\\\\":\\\\\\"5\\\\\\",\\\\\\"length\\\\\\":0,\\\\\\"location\\\\\\":0,\\\\\\"type\\\\\\":2}]\\",\\"category\\":\\"daily\\",\\"description\\":\\"​互动抽奖\\",\\"id\\":182637273,\\"is_fav\\":0,\\"pictures\\":[{\\"img_height\\":1250,\\"img_size\\":119.0537109375,\\"img_src\\":\\"https:\\\\\\/\\\\\\/i0.hdslb.com\\\\\\/bfs\\\\\\/album\\\\\\/43c1791db1f6c18ec280a4a435a5156d4d890f0e.jpg\\",\\"img_tags\\":null,\\"img_width\\":1000}],\\"pictures_count\\":1,\\"reply\\":5844,\\"role\\":[],\\"settings\\":{\\"copy_forbidden\\":\\"0\\"},\\"source\\":[],\\"title\\":\\"\\",\\"upload_time\\":1641558916},\\"user\\":{\\"head_url\\":\\"https:\\\\\\/\\\\\\/i0.hdslb.com\\\\\\/bfs\\\\\\/face\\\\\\/89154378c06a5ed332c40c2ca56f50cd641c0c90.jpg\\",\\"name\\":\\"明日方舟\\",\\"uid\\":161775300,\\"vip\\":{\\"avatar_subscript\\":1,\\"due_date\\":1648828800000,\\"label\\":{\\"label_theme\\":\\"annual_vip\\",\\"path\\":\\"\\",\\"text\\":\\"年度大会员\\"},\\"nickname_color\\":\\"#FB7299\\",\\"status\\":1,\\"theme_type\\":0,\\"type\\":2,\\"vip_pay_type\\":0}}}", "origin_extension": { "lott": "{\\"lottery_id\\":81208}" }, "origin_extend_json": "{\\"\\":{\\"game\\":{\\"game_id\\":101772,\\"platform\\":\\"1,2\\"}},\\"ctrl\\":[{\\"data\\":\\"5\\",\\"length\\":0,\\"location\\":0,\\"type\\":2}],\\"from\\":{\\"emoji_type\\":1,\\"from\\":\\"create.dynamic.web\\",\\"up_close_comment\\":0,\\"verify\\":{\\"cc\\":{\\"vf\\":1}}},\\"like_icon\\":{\\"action\\":\\"\\",\\"action_url\\":\\"\\",\\"end\\":\\"\\",\\"end_url\\":\\"\\",\\"start\\":\\"\\",\\"start_url\\":\\"\\"},\\"lott\\":{\\"lottery_id\\":81208},\\"topic\\":{\\"is_attach_topic\\":1}}", "origin_user": { "info": { "uid": 161775300, "uname": "明日方舟", "face": "https:\\/\\/i0.hdslb.com\\/bfs\\/face\\/89154378c06a5ed332c40c2ca56f50cd641c0c90.jpg", "face_nft": 0 }, "card": { "official_verify": { "type": 1, "desc": "明日方舟官方账号" } }, "vip": { "vipType": 2, "vipDueDate": 1648828800000, "vipStatus": 1, "themeType": 0, "label": { "path": "", "text": "年度大会员", "label_theme": "annual_vip", "text_color": "#FFFFFF", "bg_style": 1, "bg_color": "#FB7299", "border_color": "" }, "avatar_subscript": 1, "nickname_color": "#FB7299", "role": 3, "avatar_subscript_url": "https:\\/\\/i0.hdslb.com\\/bfs\\/vip\\/icon_Certification_big_member_22_3x.png" }, "pendant": { "pid": 5305, "name": "明日方舟音律系列", "image": "https:\\/\\/i0.hdslb.com\\/bfs\\/garb\\/item\\/615a1653281141ddf64cbb98c792ddaee78f7f40.png", "expire": 0, "image_enhance": "https:\\/\\/i0.hdslb.com\\/bfs\\/garb\\/item\\/516ecdf2d495a62f1bac31497c831b711823140c.webp", "image_enhance_frame": "https:\\/\\/i0.hdslb.com\\/bfs\\/garb\\/item\\/c0751afbf950373c260254d02768eabf30ff3906.png" }, "rank": "10000", "sign": "重铸未来 方舟启航", "level_info": { "current_level": 6 } } }';
// 视频的card str
const cardVideo =
  '{"aid":765679141,"attribute":0,"cid":484535800,"copyright":1,"ctime":1642250118,"desc":"《明日方舟》2022新春前瞻特辑现已结束，感谢大家的支持。\\n更多活动详情内容请见官网、游戏内公告及官方自媒体账号。","dimension":{"height":1080,"rotate":0,"width":1920},"duration":1799,"dynamic":"#明日方舟#\\n《明日方舟》2022新春前瞻特辑现已结束，感谢大家的支持。\\n更多活动详情内容请见官网、游戏内公告及官方自媒体账号。 ","first_frame":"https:\\/\\/i2.hdslb.com\\/bfs\\/storyff\\/n220115a21dd92s3xxu6p21l1gfhhtvf_firsti.jpg","jump_url":"bilibili:\\/\\/video\\/765679141\\/?page=1&player_preload=null&player_width=1920&player_height=1080&player_rotate=0","owner":{"face":"https:\\/\\/i0.hdslb.com\\/bfs\\/face\\/89154378c06a5ed332c40c2ca56f50cd641c0c90.jpg","mid":161775300,"name":"明日方舟"},"pic":"https:\\/\\/i0.hdslb.com\\/bfs\\/archive\\/1a94bc6016d0282e9b3c5aa4589fb323bcba7d99.jpg","player_info":null,"pubdate":1642250118,"rights":{"autoplay":1,"bp":0,"download":0,"elec":0,"hd5":1,"is_cooperation":0,"movie":0,"no_background":0,"no_reprint":1,"pay":0,"ugc_pay":0,"ugc_pay_preview":0},"share_subtitle":"已观看133.0万次","short_link":"https:\\/\\/b23.tv\\/BV1fr4y1v78Z","short_link_v2":"https:\\/\\/b23.tv\\/BV1fr4y1v78Z","stat":{"aid":765679141,"coin":53252,"danmaku":42110,"dislike":0,"favorite":24290,"his_rank":0,"like":123483,"now_rank":0,"reply":19155,"share":16169,"view":1336416},"state":0,"tid":172,"title":"《明日方舟》2022新春前瞻特辑视频","tname":"手机游戏","videos":1}';
// 专栏的card str

// 转发视频的card str
const cardRpVideo =
  '{ "user": { "uid": 15147239, "uname": "-NAY-", "face": "https:\\/\\/i2.hdslb.com\\/bfs\\/face\\/abb9ac934a647f21c5ce16a039636a5a091df6ab.jpg" }, "item": { "rp_id": 618999457028044085, "uid": 15147239, "content": "太能画了！\\/\\/@折砚之折砚:重新投了！太emo了……我的评论我的弹幕我的三连呜呜呜呜呜呜呜", "ctrl": "[{\\"type\\":1,\\"location\\":7,\\"length\\":6,\\"data\\":\\"37052532\\"}]", "orig_dy_id": 618740642301946759, "pre_dy_id": 618741896429258570, "timestamp": 1642960442, "at_uids": [ 37052532 ], "reply": 3, "orig_type": 8 }, "origin": "{\\"aid\\":935757717,\\"attribute\\":0,\\"cid\\":490432730,\\"copyright\\":1,\\"ctime\\":1642900182,\\"desc\\":\\"【是重投】之前因为内容原因被驳回了，打码提升画质后选择了重投！感谢在之前评论和点赞支持我的大家！\\",\\"dimension\\":{\\"height\\":1080,\\"rotate\\":0,\\"width\\":1440},\\"duration\\":1902,\\"dynamic\\":\\"\\",\\"first_frame\\":\\"https:\\\\\\/\\\\\\/i1.hdslb.com\\\\\\/bfs\\\\\\/storyff\\\\\\/n220123qnw0si5piflazvngg3ztm6w00_firsti.jpg\\",\\"jump_url\\":\\"bilibili:\\\\\\/\\\\\\/video\\\\\\/935757717\\\\\\/?page=1&player_preload=null&player_width=1440&player_height=1080&player_rotate=0\\",\\"mission_id\\":360675,\\"owner\\":{\\"face\\":\\"https:\\\\\\/\\\\\\/i0.hdslb.com\\\\\\/bfs\\\\\\/face\\\\\\/0d4e71eea8ce7e083d75d57d3866f80e272d78c4.jpg\\",\\"mid\\":37052532,\\"name\\":\\"折砚之折砚\\"},\\"pic\\":\\"https:\\\\\\/\\\\\\/i0.hdslb.com\\\\\\/bfs\\\\\\/archive\\\\\\/452e200dd3c211a0bd8992599d6389e16629d23e.jpg\\",\\"player_info\\":null,\\"pubdate\\":1642900182,\\"rights\\":{\\"autoplay\\":1,\\"bp\\":0,\\"download\\":0,\\"elec\\":0,\\"hd5\\":1,\\"is_cooperation\\":0,\\"movie\\":0,\\"no_background\\":0,\\"no_reprint\\":1,\\"pay\\":0,\\"ugc_pay\\":0,\\"ugc_pay_preview\\":0},\\"short_link\\":\\"https:\\\\\\/\\\\\\/b23.tv\\\\\\/BV1AT4y127RM\\",\\"short_link_v2\\":\\"https:\\\\\\/\\\\\\/b23.tv\\\\\\/BV1AT4y127RM\\",\\"stat\\":{\\"aid\\":935757717,\\"coin\\":694,\\"danmaku\\":148,\\"dislike\\":0,\\"favorite\\":2692,\\"his_rank\\":0,\\"like\\":4637,\\"now_rank\\":0,\\"reply\\":102,\\"share\\":30,\\"view\\":38448},\\"state\\":0,\\"tid\\":162,\\"title\\":\\"【翻翻乐（超长）】从高二开始的摸鱼本\\",\\"tname\\":\\"绘画\\",\\"up_from_v2\\":28,\\"videos\\":2}", "origin_extend_json": "{\\"like_icon\\":{\\"action\\":\\"\\",\\"action_url\\":\\"\\",\\"end\\":\\"\\",\\"end_url\\":\\"\\",\\"start\\":\\"\\",\\"start_url\\":\\"\\"},\\"topic\\":{\\"is_attach_topic\\":1}}", "origin_user": { "info": { "uid": 37052532, "uname": "折砚之折砚", "face": "https:\\/\\/i0.hdslb.com\\/bfs\\/face\\/0d4e71eea8ce7e083d75d57d3866f80e272d78c4.jpg", "face_nft": 0 }, "card": { "official_verify": { "type": -1, "desc": "" } }, "vip": { "vipType": 2, "vipDueDate": 1645804800000, "vipStatus": 1, "themeType": 0, "label": { "path": "", "text": "年度大会员", "label_theme": "annual_vip", "text_color": "#FFFFFF", "bg_style": 1, "bg_color": "#FB7299", "border_color": "" }, "avatar_subscript": 1, "nickname_color": "#FB7299", "role": 3, "avatar_subscript_url": "https:\\/\\/i0.hdslb.com\\/bfs\\/vip\\/icon_Certification_big_member_22_3x.png" }, "pendant": { "pid": 0, "name": "", "image": "", "expire": 0, "image_enhance": "", "image_enhance_frame": "" }, "rank": "10000", "sign": "不要放弃思考。禁止临摹描改\\n搭档：绘阳子\\nlofter：逐风去\\n私信几乎不回，看到不适的评论会删掉", "level_info": { "current_level": 6 } } }';

  // 纯文本动态
  const cardTextOnly =
    '{ "user": { "uid": 4433342, "uname": "Werifu", "face": "https:\\/\\/i1.hdslb.com\\/bfs\\/face\\/145198d8d9efebbe761ef4dc07b7fffd50fccf7f.jpg" }, "item": { "rp_id": 621841179191626454, "uid": 4433342, "content": "test", "ctrl": "", "orig_dy_id": 0, "pre_dy_id": 0, "timestamp": 1643622082, "reply": 0 } }';
test('测试getDynamic', async () => {
  await getDynamic(161775300, 0).then((dynamic) => {
    console.log(dynamic);
  });
});
test('测试处理日常动态', async () => {
  expect(handleDailyCard(cardDaily)).toStrictEqual({
    text:
      '#明日方舟#\n' +
      '【浊酒澄心】\n' +
      '//老鲤\n' +
      '“我家的雇员承蒙罗德岛照顾了，他们没给诸位添什么麻烦吧？对了，这是事务所的名片，您收好。”\n' +
      '\n' +
      '____________\n' +
      '“欸？老鲤也来这了？事务所这几个月房租水电岂不是白交了？”\n' +
      '“肯定又是跑来偷懒的吧。真是的，他什么时候才能变得勤奋一点啊......”\n' +
      '“如果他真的很闲的话，希望他能来食堂帮厨啊。”\n' +
      '来自侦探事务所的三位干员听到老鲤来到罗德岛的消息时，都没有表现出一星半点的高兴。抱着三份礼物躲在一旁的老鲤则哭丧着脸，连连叹气。\n' +
      '......\n' +
      '“孩子们都长大了，有自己的生活了，好事，好事......博士，我心里难过，今天的工作就先别找我了，有什么事明天再说吧。”老鲤边这样说着，边在博士的办公室里坐下泡起茶来。\n' +
      '不得不说，老鲤泡的茶还是很香的。 ',
    pictures: [
      'https://i0.hdslb.com/bfs/album/7371752c1993f38d82ae20633d068fd274816a60.jpg',
      'https://i0.hdslb.com/bfs/album/c3f140d7859f205203efd7a4d3f3fade762b8f1b.jpg',
      'https://i0.hdslb.com/bfs/album/441829166d971039c15cea01a16f256b72535bdb.gif',
      'https://i0.hdslb.com/bfs/album/bc0af4bdf6b6a91a681302da37e2f45a828a60e0.gif',
      'https://i0.hdslb.com/bfs/album/d05a6fa7f532766cb6778783dc9ea8b93651ec7c.gif',
      'https://i0.hdslb.com/bfs/album/b74aae0834566b0bb052689a207789ebe9dd5509.gif',
      'https://i0.hdslb.com/bfs/album/a558e1a070936e3d127398aec0b40f0d931c7dc6.gif',
    ],
  });
});

test('测试视频动态', async () => {
  expect(handleVideoCard(cardVideo)).toStrictEqual({
    text: '《明日方舟》2022新春前瞻特辑视频\n#明日方舟#\n《明日方舟》2022新春前瞻特辑现已结束，感谢大家的支持。\n更多活动详情内容请见官网、游戏内公告及官方自媒体账号。 ',
    pictures: [
      'https://i0.hdslb.com/bfs/archive/1a94bc6016d0282e9b3c5aa4589fb323bcba7d99.jpg',
    ],
    video: 'https://b23.tv/BV1fr4y1v78Z',
  });
});

test('测试转发动态', async () => {
  expect(handleRpCard(cardRpDaily)).toStrictEqual({
    text: '转发: 恭喜@某神游的橙味汽水 @悲潮歌咏 @试图尝试改名变欧 等30位同学中奖，已私信通知，详情请点击互动抽奖查看。\n原文来自账号@明日方舟: ​互动抽奖',
    pictures: [
      'https://i0.hdslb.com/bfs/album/43c1791db1f6c18ec280a4a435a5156d4d890f0e.jpg',
    ],
    video: undefined,
  });
});

test('测试转发视频', async () => {
  expect(handleRpCard(cardRpVideo)).toStrictEqual({
    text: '转发: 太能画了！//@折砚之折砚:重新投了！太emo了……我的评论我的弹幕我的三连呜呜呜呜呜呜呜\n原文来自账号@折砚之折砚: 【翻翻乐（超长）】从高二开始的摸鱼本',
    pictures: [
      'https://i0.hdslb.com/bfs/archive/452e200dd3c211a0bd8992599d6389e16629d23e.jpg',
    ],
    video: 'https://b23.tv/BV1AT4y127RM',
  });
});

test('测试纯文本动态', async () => {
    expect(handleTextOnlyCard(cardTextOnly)).toStrictEqual({
        text: 'test'
    })
})
test('测试extractPictureName', async () => {
  const achiveUrl =
    'https://i0.hdslb.com/bfs/archive/1a94bc6016d0282e9b3c5aa4589fb323bcba7d99.jpg';
  const albumUrl =
    'https://i0.hdslb.com/bfs/album/7371752c1993f38d82ae20633d068fd274816a60.jpg';

  expect(extractPictureName(achiveUrl)).toBe(
    '1a94bc6016d0282e9b3c5aa4589fb323bcba7d99.jpg'
  );
  expect(extractPictureName(albumUrl)).toBe(
    '7371752c1993f38d82ae20633d068fd274816a60.jpg'
  );
});

test('测试下载图片', async () => {
  let pics = [
    'https://i0.hdslb.com/bfs/album/7371752c1993f38d82ae20633d068fd274816a60.jpg',
  ];
  expect(await downloadPictures(pics)).toStrictEqual([
    '7371752c1993f38d82ae20633d068fd274816a60.jpg',
  ]);
});

test('测试新饼命令的正则', () => {
  expect(matchNewsCmd('!新饼')).toBe(0);
  expect(matchNewsCmd('！新饼 114514')).toBe(-1);
  expect(matchNewsCmd('！新饼 2')).toBe(2);
  expect(matchNewsCmd('！新饼 0')).toBe(0);
  expect(matchNewsCmd('！新饼 鬼')).toBe(-1);
});

test('测试时间格式化', () => {
  expect(formatTime(new Date(1642846511717))).toBe('2022-01-22 18:15:11');
  expect(formatTime(new Date(0))).toBe('1970-01-01 08:00:00');
});
