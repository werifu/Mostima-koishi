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
    .command('小莫，<prompt>', { minInterval: Time.second * 5 })
    .action(async (_, prompt) => {
      return await chat(prompt);
    });

}

export async function chat(prompt: string) {
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
