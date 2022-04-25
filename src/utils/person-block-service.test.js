const target = require('./person-block-service.js');

describe('from', () => {
  test('0件', () => {
    expect(target.from([])).toEqual([]);
  });

  test('1件', () => {
    const layout = [
      { x: 1, y: 2, id: 'aaa@bbb.com|テスト 太郎'}
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' }
    ];
    expect(target.from(layout)).toEqual(expected);
  });

  test('2件', () => {
    const layout = [
      { x: 1, y: 2, id: 'aaa@bbb.com|テスト 太郎'},
      { x: 2, y: 3, id: 'ccc@ddd.com|テスト 花子'},
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' },
      { x: 2, y: 3, email: 'ccc@ddd.com', name: 'テスト 花子', status: '状態不明' },
    ];
    expect(target.from(layout)).toEqual(expected);
  });

  test('名前に|を含む場合', () => {
    const layout = [
      { x: 1, y: 2, id: 'aaa@bbb.com|テスト 太郎|次郎'}
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎|次郎', status: '状態不明' }
    ];
    expect(target.from(layout)).toEqual(expected);
  });

  test('id が名前だけの時（v1.0.3以前）', () => {
    const layout = [
      { x: 1, y: 2, id: 'テスト 太郎'}
    ];
    const expected = [
      { x: 1, y: 2, email: null, name: 'テスト 太郎', status: '状態不明' }
    ];
    expect(target.from(layout)).toEqual(expected);
  });
});

describe('merge', () => {
  test('blocks、people 両方0件', () => {
    expect(target.merge([], [])).toEqual([]);
  });

  test('people 0件', () => {
    const blocks = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' }
    ];
    expect(target.merge(blocks, [])).toEqual(blocks);
  });

  test('people 該当あり', () => {
    const blocks = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' }
    ];
    const people = [
      { email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' }
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' }
    ];
    expect(target.merge(blocks, people)).toEqual(expected);
  });

  test('people 該当あり（複数）', () => {
    const blocks = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' },
      { x: 2, y: 3, email: 'ccc@ddd.com', name: 'テスト 花子', status: '状態不明' },
    ];
    const people = [
      { email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' },
      { email: 'ccc@ddd.com', name: 'テスト 花子', status: '通話中' },
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' },
      { x: 2, y: 3, email: 'ccc@ddd.com', name: 'テスト 花子', status: '通話中' },
    ];
    expect(target.merge(blocks, people)).toEqual(expected);
  });

  test('people 該当なし', () => {
    const blocks = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' }
    ];
    const people = [
      { email: 'eee@fff.com', name: 'テスト 次郎', status: '連絡可能' }
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' },
      { x: 10, y: 10, email: 'eee@fff.com', name: 'テスト 次郎', status: '連絡可能' }
    ];
    expect(target.merge(blocks, people)).toEqual(expected);
  });

  test('people 該当なし（複数）', () => {
    const blocks = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' }
    ];
    const people = [
      { email: 'eee@fff.com', name: 'テスト 次郎', status: '連絡可能' },
      { email: 'ggg@hhh.com', name: 'テスト 三郎', status: '忙しい' },
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' },
      { x: 10, y: 10, email: 'eee@fff.com', name: 'テスト 次郎', status: '連絡可能' },
      { x: 10, y: 30, email: 'ggg@hhh.com', name: 'テスト 三郎', status: '忙しい' },
    ];
    expect(target.merge(blocks, people)).toEqual(expected);
  });

  test('people 該当ありなし混在', () => {
    const blocks = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '状態不明' }
    ];
    const people = [
      { email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' },
      { email: 'eee@fff.com', name: 'テスト 次郎', status: '通話中' },
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' },
      { x: 10, y: 10, email: 'eee@fff.com', name: 'テスト 次郎', status: '通話中' },
    ];
    expect(target.merge(blocks, people)).toEqual(expected);
  });

  test('blocks 0件', () => {
    const blocks = [];
    const people = [
      { email: 'eee@fff.com', name: 'テスト 次郎', status: '連絡可能' }
    ];
    const expected = [
      { x: 10, y: 10, email: 'eee@fff.com', name: 'テスト 次郎', status: '連絡可能' }
    ];
    expect(target.merge(blocks, people)).toEqual(expected);
  });

  test('blocks 旧データ形式', () => {
    const blocks = [
      { x: 1, y: 2, email: null, name: 'テスト 太郎', status: '状態不明' }
    ];
    const people = [
      { email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' }
    ];
    const expected = [
      { x: 1, y: 2, email: 'aaa@bbb.com', name: 'テスト 太郎', status: '連絡可能' }
    ];
    expect(target.merge(blocks, people)).toEqual(expected);
  });
});