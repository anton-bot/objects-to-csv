'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const path = require('node:path');
const ObjectsToCsv = require('./index');
const fs = require('node:fs');

function temporaryFile(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'objects-to-csv-test-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return path.join(directory, 'output.csv');
}

const SAMPLE_ASCII = [
  { code: 'HK', name: 'Hong Kong' },
  { code: 'KLN', name: 'Kowloon' },
  { code: 'NT', name: 'New Territories' },
];

const SAMPLE_UNICODE = [
  { lang: 'Russian', text: 'Привет, как дела?' },
  { lang: 'Chinese', text: '冇問題' },
  { lang: 'Danish', text: 'Characters like Æ, Ø and Å' },
];

describe('Object to CSV converter', () => {
  it('must generate a CSV string - normal ASCII text', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const result = await csv.toString();
    assert.equal(result, 'code,name\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must generate a CSV string - no table header', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const result = await csv.toString(false);
    assert.equal(result, 'HK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must generate a CSV string - special alphabets', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const result = await csv.toString();
    assert.equal(result, 'lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });

  it('must generate a CSV file - normal ASCII text', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const testFilename = temporaryFile(t);
    await csv.toDisk(testFilename);
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    assert.equal(result, 'code,name\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must generate a CSV file - special alphabets', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const testFilename = temporaryFile(t);
    await csv.toDisk(testFilename);
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    assert.equal(result, 'lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });

  it('must generate a CSV file - special alphabets + BOM', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const testFilename = temporaryFile(t);
    await csv.toDisk(testFilename, { bom: true });
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    assert.equal(result, '\ufeff' + 'lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });

  it('must append to CSV file', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const testFilename = temporaryFile(t);
    await csv.toDisk(testFilename, { append: true });
    await csv.toDisk(testFilename, { append: true });
    await csv.toDisk(testFilename, { append: true });
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    assert.equal(result, 'code,name\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must append to CSV file + BOM', async (t) => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const testFilename = temporaryFile(t);
    await csv.toDisk(testFilename, { append: true, bom: true });
    await csv.toDisk(testFilename, { append: true, bom: true });
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    assert.equal(result, '\ufeff' + 'lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });
});

describe('Formula escaping', () => {
  const cases = [
    ['=1+1', "'=1+1\n"],
    ['+1+1', "'+1+1\n"],
    ['-1+1', "'-1+1\n"],
    ['@SUM(1,2)', '"\'@SUM(1,2)"\n'],
    ['\t=1+1', "'\t=1+1\n"],
    ['\r=1+1', '"\'\r=1+1"\n'],
    ['\n=1+1', '"\'\n=1+1"\n'],
    ['  =1+1', "'  =1+1\n"],
    ['\u0000=1+1', "'\u0000=1+1\n"],
    ['\u000b +1+1', "'\u000b +1+1\n"],
    ['\uFEFF=1+1', "'\uFEFF=1+1\n"],
    ['\u00a0=1+1', "'\u00a0=1+1\n"],
    ['\uFF1D1+1', "'\uFF1D1+1\n"],
    ['\uFF0B1+1', "'\uFF0B1+1\n"],
    ['\uFF0D1+1', "'\uFF0D1+1\n"],
    ['\uFF201+1', "'\uFF201+1\n"],
    ['-42', "'-42\n"],
    ['+123456789', "'+123456789\n"],
  ];

  for (const [value, expected] of cases) {
    it(`escapes the value and header ${JSON.stringify(value)}`, async () => {
      assert.equal(await new ObjectsToCsv([{ value }]).toString(false), expected);
      assert.equal(await new ObjectsToCsv([{ [value]: 'safe' }]).toString(), expected + 'safe\n');
    });
  }

  it('escapes every string in a multi-column export without changing the source', async () => {
    const row = Object.freeze({ '=column': '=1+1', other: '+2+2' });
    const data = Object.freeze([row]);
    const csv = new ObjectsToCsv(data);
    const expected = "'=column,other\n'=1+1,'+2+2\n";
    assert.equal(await csv.toString(), expected);
    assert.equal(await csv.toString(), expected);
    assert.equal(row['=column'], '=1+1');
  });

  it('uses original keys when collecting and sorting all columns', async () => {
    const csv = new ObjectsToCsv([{ z: 'safe' }, { '=column': '=1+1' }]);
    assert.equal(await csv.toString(true, true), "'=column,z\n,safe\n'=1+1,\n");
  });

  it('preserves numeric values and strings already escaped', async () => {
    const csv = new ObjectsToCsv([
      { number: -42, text: "'=1+1" },
      { number: -10n, text: 'ordinary text' },
      { number: 0, text: '  ordinary text' },
    ]);
    assert.equal(await csv.toString(false), "-42,'=1+1\n-10,ordinary text\n0,  ordinary text\n");
  });

  it('keeps quotes, commas and newlines inside their original cell', async () => {
    const csv = new ObjectsToCsv([{ value: '=1+1",=2+2\r\n@SUM(1,2)', next: 'safe' }]);
    assert.equal(await csv.toString(false), '"\'=1+1"",=2+2\r\n@SUM(1,2)",safe\n');
  });

  it('does not expose formulas inside serialized objects', async () => {
    const csv = new ObjectsToCsv([{ value: { toJSON: () => '=1+1' } }]);
    assert.equal(await csv.toString(false), '"""=1+1"""\n');
  });

  it('can explicitly preserve raw formulas in both headers and values', async () => {
    const csv = new ObjectsToCsv([{ '=column': '=1+1' }], { escapeFormulas: false });
    assert.equal(await csv.toString(), '=column\n=1+1\n');
  });

  it('escapes disk output when creating and appending with a BOM', async (t) => {
    const filename = temporaryFile(t);
    const csv = new ObjectsToCsv([{ '=column': '=1+1' }]);
    assert.equal(await csv.toDisk(filename, { append: true, bom: true }), "\ufeff'=column\n'=1+1\n");
    assert.equal(await csv.toDisk(filename, { append: true, bom: true }), "'=1+1\n");
    assert.equal(fs.readFileSync(filename, 'utf8'), "\ufeff'=column\n'=1+1\n'=1+1\n");
  });

  it('honors the explicit opt-out when writing to disk', async (t) => {
    const filename = temporaryFile(t);
    await new ObjectsToCsv([{ '=column': '=1+1' }], { escapeFormulas: false }).toDisk(filename);
    assert.equal(fs.readFileSync(filename, 'utf8'), '=column\n=1+1\n');
  });
});

describe('CSV compatibility and errors', () => {
  it('preserves existing value serialization', async () => {
    const values = [0, -42, 1.5, true, false, null, undefined, '', 'text', 'a,b', 'a"b', 'a\nb',
      new Date('2020-01-01T00:00:00Z'), { a: 1 }, [1, 2], Buffer.from('test')];
    const csv = new ObjectsToCsv([Object.fromEntries(values.map((value, i) => [i, value]))]);
    assert.equal(await csv.toString(false),
      '0,-42,1.5,1,,,,,text,"a,b","a""b","a\nb",1577836800000,"{""a"":1}","[1,2]","{""type"":""Buffer"",""data"":[116,101,115,116]}"\n');
  });

  it('returns an empty string for an empty input', async () => {
    assert.equal(await new ObjectsToCsv([]).toString(), '');
    assert.equal(await new ObjectsToCsv([]).toString(false, true), '');
  });

  it('only uses the first row for columns by default', async () => {
    assert.equal(await new ObjectsToCsv([{ a: 1 }, { b: 2 }]).toString(), 'a\n1\n\n');
  });

  it('collects all columns without adding a header', async () => {
    assert.equal(await new ObjectsToCsv([{ z: 1 }, { a: 2 }]).toString(false, true), ',1\n2,\n');
  });

  it('writes all columns to disk', async (t) => {
    const filename = temporaryFile(t);
    await new ObjectsToCsv([{ z: 1 }, { a: 2 }]).toDisk(filename, { allColumns: true });
    assert.equal(fs.readFileSync(filename, 'utf8'), 'a,z\n,1\n2,\n');
  });

  it('restores the BOM when overwriting an existing file', async (t) => {
    const filename = temporaryFile(t);
    fs.writeFileSync(filename, 'old contents');
    await new ObjectsToCsv([{ value: 'text' }]).toDisk(filename, { bom: true });
    assert.equal(fs.readFileSync(filename, 'utf8'), '\ufeffvalue\ntext\n');
  });

  it('adds a header when appending to an empty file', async (t) => {
    const filename = temporaryFile(t);
    fs.writeFileSync(filename, '');
    await new ObjectsToCsv([{ value: 'text' }]).toDisk(filename, { append: true });
    assert.equal(fs.readFileSync(filename, 'utf8'), 'value\ntext\n');
  });

  it('does not exceed the argument limit for large exports', async () => {
    const result = await new ObjectsToCsv(Array.from({ length: 150000 }, (_, i) => ({ i }))).toString();
    assert.equal(result.split('\n').length, 150002);
    assert.ok(result.startsWith('i\n0\n1\n'));
    assert.ok(result.endsWith('149999\n'));
  });

  it('rejects non-array input', () => {
    for (const value of [null, undefined, 'text', 42, {}]) {
      assert.throws(() => new ObjectsToCsv(value), /must be an array of objects/);
    }
  });

  it('rejects null, arrays, primitives and holes as rows', () => {
    for (const data of [[null], [[]], [1], ['text'], [true], [undefined], Array(1)]) {
      assert.throws(() => new ObjectsToCsv(data), /must contain objects/);
    }
  });

  it('rejects an invalid escapeFormulas option', () => {
    for (const escapeFormulas of ['false', null, 0]) {
      assert.throws(() => new ObjectsToCsv([], { escapeFormulas }), /must be a boolean/);
    }
  });

  it('propagates serialization errors', async () => {
    const circular = {};
    circular.self = circular;
    await assert.rejects(new ObjectsToCsv([{ value: circular }]).toString(), /circular/i);
  });

  it('rejects empty filenames and filesystem errors', async (t) => {
    const csv = new ObjectsToCsv([{ a: 1 }]);
    await assert.rejects(csv.toDisk(''), /Empty filename/);
    await assert.rejects(csv.toDisk(path.join(temporaryFile(t), 'missing.csv')), { code: 'ENOENT' });
    await assert.rejects(csv.toDisk(path.dirname(temporaryFile(t))), { code: 'EISDIR' });
    await assert.rejects(csv.toDisk(path.dirname(temporaryFile(t)), { append: true }), { code: 'EISDIR' });
  });
});
