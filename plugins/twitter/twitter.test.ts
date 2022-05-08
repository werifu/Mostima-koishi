import { extractPictureName } from "./twitter";
test('extract picutre name', () => {
  const urls = [
    'https://pbs.twimg.com/media/FRGEvrRaMAAZG-a.jpg',
    'https://pbs.twimg.com/media/FRCAin8agAIxSmG.png',
  ];
  expect(extractPictureName(urls[0])).toBe('FRGEvrRaMAAZG-a.jpg');
  expect(extractPictureName(urls[1])).toBe('FRCAin8agAIxSmG.png');
})

// test('add from', () => {
//   expect(addFrom(''))
// })