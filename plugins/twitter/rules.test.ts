import { RuleCodec } from './rules';

test('rule codec', () => {
  const builder = new RuleCodec(false);
  const rule = builder.add('user1').add('user2').generate();
  expect(
    rule ===
      {
        value: 'has:images -is:retweet (from:user1 OR from:user2)',
        tag: 'user1;user2',
      }
  );
  const ruleWithArk = builder.add('user1').add('user2').generate();
  expect(
    ruleWithArk ===
      {
        value:
          'has:images -is:retweet (#アークナイツ OR #明日方舟 OR #Arknights) (from:user1 OR from:user2)',
        tag: '[ark]user1;user2',
      }
  );
  const ruleObj = {
    id: '123',
    value:
      'has:images -is:retweet (#アークナイツ OR #明日方舟 OR #Arknights) (from:user1 OR from:user2)',
    tag: '[ark]user1;user2',
  };
  const codec = new RuleCodec();
  expect(codec.parse(ruleObj).getUsernames() === ['user1', 'user2']);
  let reGen = codec.parse(ruleObj).generate();
  expect(reGen.tag === ruleObj.tag && reGen.value === ruleObj.value);
  let add3 = codec.parse(ruleObj).add('user3').generate();
  expect(
    add3.tag === '[ark]user1;user2;user3' &&
      add3.value ===
        'has:images -is:retweet (#アークナイツ OR #明日方舟 OR #Arknights) (from:user1 OR from:user2 OR from:user3)'
  );
  let remove1 = codec.parse(ruleObj).remove('user1').generate();
  expect(
    remove1.tag === '[ark]user2' &&
      remove1.value ===
        'has:images -is:retweet (#アークナイツ OR #明日方舟 OR #Arknights) (from:user2)'
  );

  const ruleObjWithoutArk = {
    id: '123',
    value: 'has:images -is:retweet (from:user1 OR from:user2)',
    tag: '[ark]user1;user2',
  };
  reGen = codec.parse(ruleObj).generate();
  expect(reGen.tag === ruleObj.tag && reGen.value === ruleObj.value);
  add3 = codec.parse(ruleObj).add('user3').generate();
  expect(
    add3.tag === 'user1;user2;user3' &&
      add3.value ===
        'has:images -is:retweet (from:user1 OR from:user2 OR from:user3)'
  );
  remove1 = codec.parse(ruleObj).remove('user1').generate();
  expect(
    remove1.tag === 'user2' &&
      remove1.value === 'has:images -is:retweet (from:user2)'
  );
});
