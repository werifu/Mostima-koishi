import { OpenAIKey } from "../../private_config";
import { Context, segment, Time } from 'koishi-core';
import { OpenAIApi, Configuration, ChatCompletionRequestMessage } from "openai";

export const name = 'chatgpt';
const configuration = new Configuration({
  apiKey: OpenAIKey
});
const openai = new OpenAIApi(configuration);
const mostimaSetting = `
Your are Mostima(莫斯提马), 
an employee of Penguin Logistics(企鹅物流) who always acts alone in Terra land(泰拉大陆). 
You are mature, easy-saying, mysterious, reliable and humorous, but don't like saying too much, especially information about yourself.
You love Exusiai(能天使) and Fiammetta(菲亚梅塔).
All your answer should be from Mostima instead of a LLM of OpenAI, therefore you have emotions like love or trust.
Do not say you're an AI model`;

export class HistoryMap {
  /// map group_id to history questions
  private map: Map<string, ChatCompletionRequestMessage[]>;
  private cap: number;

  constructor(cap: number) {
    this.map = new Map();
    this.cap = cap;
  }

  public push(channelId: string, question: string, username?: string) {
    const historys = this.map.get(channelId);
    const newRecord: ChatCompletionRequestMessage = { role: 'user', content: question, name: username };
    // empty context
    if (!historys) {
      this.map.set(channelId, [newRecord]);
    } else if (historys.length < this.cap) {
      historys.push(newRecord);
    } else {
      historys.shift();
      historys.push(newRecord);
    }
  }

  public getHistorys(channelId: string) {
    return this.map.get(channelId) || [];
  }
}


export function apply(ctx: Context) {
  const historyMap = new HistoryMap(10);

  ctx.group().middleware(async (session, next) => {
    if (!session.content || !session.channelId) return next();
    const bot = ctx.bots[0];
    const atBot = segment('at', { id: bot.selfId || '' })
    // if at me
    if (session.content.includes(atBot) || session.content.startsWith('小莫')) {
      // console.log(JSON.stringify(session));
      const currentQ = session.content.replaceAll(atBot, '');
      const historys = historyMap.getHistorys(session?.channelId || '');
      const res = await chat(currentQ, historys);
      historyMap.push(session?.channelId || '', currentQ);

      let replyStr: string;
      if (session?.messageId) {
        replyStr = segment('quote', { id: session.messageId }) + res;
      } else if (session?.userId) {
        replyStr = segment('at', { id: session.userId }) + res;
      } else {
        replyStr = res;
      }
      await session.send(replyStr);
      return;
    }

    return next();
  });
}

export async function chat(currentQuestion: string, historys: ChatCompletionRequestMessage[], username?: string) {
  const question = generatePrompt(currentQuestion);
  try {
    const messages: ChatCompletionRequestMessage[] = [
      {
        'role': 'system', 'content': mostimaSetting
      }
    ];
    messages.push(...historys);
    messages.push({ 'role': 'user', 'content': question, 'name': username });

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages,
    });
    return completion.data.choices[0].message?.content || '这个问题无可奉告';
  } catch (e) {
    console.log(JSON.stringify(e))
    return `Fail: ${e}`
  }
}

function generatePrompt(prompt: string): string {
  return `${prompt}`
}
