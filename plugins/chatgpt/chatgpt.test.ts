import { HistoryMap } from "./chatgpt";

test('context queue', () => {
  const historyMap = new HistoryMap(3);
  historyMap.push('1', 'q1-1');
  historyMap.push('2', 'q2-1');
  expect(historyMap.getHistorys('1').length).toBe(1);
  historyMap.push('1', 'q1-2');
  historyMap.push('1', 'q1-3');
  historyMap.push('1', 'q1-4');

  const his1 = historyMap.getHistorys('1');
  expect(his1.length).toBe(3);
  expect(his1[0].content).toBe('q1-2');
  expect(his1[1].content).toBe('q1-3');
  expect(his1[2].content).toBe('q1-4');

  expect(historyMap.getHistorys('3')).toStrictEqual([]);
});