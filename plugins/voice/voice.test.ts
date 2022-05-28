import { RecordPathPrefix } from '../../private_config';
import { cqRecord } from './voice';

test('file', async () => {
  expect(
    await cqRecord('char_263_skadi', '斯卡蒂', 'voice', '晋升后交谈1')
  ).toBe(encodeURI(`[CQ:record,file=${RecordPathPrefix}voice_斯卡蒂_晋升后交谈1.wav]`));
});
