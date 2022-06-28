import { createHash } from 'crypto';
import { RecordPathPrefix } from '../../private_config';
import { cqRecord } from './voice';


test('', () => {
  const md5 = createHash('md5')
  const fileName =
    md5.update(`voice_风笛_作战中1`).digest('hex') + '.wav';
  console.log(fileName)
  
})