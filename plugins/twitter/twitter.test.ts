import { randomInt } from 'crypto';
import { readdirSync } from 'fs';
import { extractPictureName } from './twitter';
test('extract picutre name', () => {
  const urls = [
    'https://pbs.twimg.com/media/FRGEvrRaMAAZG-a.jpg',
    'https://pbs.twimg.com/media/FRCAin8agAIxSmG.png',
  ];
  expect(extractPictureName(urls[0])).toBe('FRGEvrRaMAAZG-a.jpg');
  expect(extractPictureName(urls[1])).toBe('FRCAin8agAIxSmG.png');
});

// test('', () => {
//   console.log(randomInt(5))
// })
// test('', () => {
//   const picNames = readdirSync('./pictures').filter((file) => {
//     const res = file.match(/\.(gif|jpg|png|jpeg)$/);
//     return res !== null;
//   });
//   console.log(picNames);
// });
