const ObjectsToCsv = require('./index');
const fs = require('fs');

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
  it('must generate a CSV string - normal ASCII text', async () => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const result = await csv.toString();
    expect(result).toEqual('code,name\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must generate a CSV string - no table header', async () => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const result = await csv.toString(false);
    expect(result).toEqual('HK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must generate a CSV string - special alphabets', async () => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const result = await csv.toString();
    expect(result).toEqual('lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });

  it('must generate a CSV file - normal ASCII text', async () => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const testFilename = `deleteme-test-${Date.now()}-1.csv`;
    await csv.toDisk(testFilename);
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    expect(result).toEqual('code,name\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must generate a CSV file - special alphabets', async () => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const testFilename = `deleteme-test-${Date.now()}-2.csv`;
    await csv.toDisk(testFilename);
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    expect(result).toEqual('lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });

  it('must generate a CSV file - special alphabets + BOM', async () => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const testFilename = `deleteme-test-${Date.now()}-3.csv`;
    await csv.toDisk(testFilename, { bom: true });
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    expect(result).toEqual('\ufeff' + 'lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });

  it('must append to CSV file', async () => {
    const csv = new ObjectsToCsv(SAMPLE_ASCII);
    const testFilename = `deleteme-test-${Date.now()}-4.csv`;
    await csv.toDisk(testFilename, { append: true });
    await csv.toDisk(testFilename, { append: true });
    await csv.toDisk(testFilename, { append: true });
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    expect(result).toEqual('code,name\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must append to CSV file + BOM', async () => {
    const csv = new ObjectsToCsv(SAMPLE_UNICODE);
    const testFilename = `deleteme-test-${Date.now()}-5.csv`;
    await csv.toDisk(testFilename, { append: true, bom: true });
    await csv.toDisk(testFilename, { append: true, bom: true });
    const result = fs.readFileSync(testFilename, 'utf8');
    fs.unlinkSync(testFilename);
    expect(result).toEqual('\ufeff' + 'lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });
});
