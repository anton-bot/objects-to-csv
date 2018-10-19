const ObjectsToCsv = require('./index');

describe('Object to CSV converter', () => {
  it('must generate a CSV string - normal ASCII text', async () => {
    const data = [
      { code: 'HK', name: 'Hong Kong' },
      { code: 'KLN', name: 'Kowloon' },
      { code: 'NT', name: 'New Territories' },
    ];

    const csv = new ObjectsToCsv(data);
    const result = await csv.toString();
    expect(result).toEqual('code,name\nHK,Hong Kong\nKLN,Kowloon\nNT,New Territories\n');
  });

  it('must generate a CSV string - special alphabets', async () => {
    const data = [
      { lang: 'Russian', text: 'Привет, как дела?' },
      { lang: 'Chinese', text: '冇問題' },
      { lang: 'Danish', text: 'Characters like Æ, Ø and Å' },
    ];

    const csv = new ObjectsToCsv(data);
    const result = await csv.toString();
    expect(result).toEqual('lang,text\nRussian,"Привет, как дела?"\nChinese,冇問題\nDanish,"Characters like Æ, Ø and Å"\n');
  });
});
