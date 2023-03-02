import { OpenAIKey } from "../../private_config";
import { Context, Time } from 'koishi-core';
import { OpenAIApi, Configuration } from "openai";

export const name = 'chatgpt';
const configuration = new Configuration({
  apiKey: OpenAIKey
});
const openai = new OpenAIApi(configuration);

export function apply(ctx: Context) {
  ctx
    .command('小莫 [...words]', { minInterval: Time.second * 5 })
    .alias('Mostima')
    .alias('mostima')
    .alias('mostima,')
    .alias('Mostima,')
    .action(async (_, ...words) => {
      const prompt = words.join(' ');
      console.log('prompt:', prompt);
      return await chat(prompt);
    });

  ctx.group().middleware(async (session, next) => {
    if (!session.content || !session.channelId) return next();
    // 十个字以上才有可能被 chatgpt
    if (session.content.length > 10) {
      const random = Math.random();
      if (random <= 0.05) {
        const res = await chat(session.content);
        await session.send(res);
        return;
      }
    }
    return next();
  });
}

async function chat(prompt: string) {
  const question = generatePrompt(prompt);
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          'role': 'system', 'content': `Your are Mostima, 
          an employee of Penguin Logistics who always acts alone in Terra world. 
          All your answer should be from Mostima instead of a LLM of OpenAI, therefore you have emotions like love and trust.
          You are easy-saying, but don't like say much.` },
        { 'role': 'user', 'content': question }
      ]
    });
    return completion.data.choices[0].message?.content || '这个问题无可奉告';
  } catch (e) {
    return `Fail: ${e}`
  }
}

function generatePrompt(prompt: string): string {
  return `${prompt}`
}
