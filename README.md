# Convert array of objects into a CSV file #

Converts an array of JavaScript objects into the CSV format. You can
save the CSV to file or return it as a string.

The keys in the first object of the array will be used as column names.

Any special characters in the values (such as commas) will be properly escaped.

## Usage ##

```js
const ObjectsToCsv = require('objects-to-csv');

// Sample data - two columns, three rows:
const data = [
  {code: 'CA', name: 'California'},
  {code: 'TX', name: 'Texas'},
  {code: 'NY', name: 'New York'},
];

// If you use "await", code must be inside an asynchronous function:
(async () => {
  const csv = new ObjectsToCsv(data);

  // Save to file:
  await csv.toDisk('./test.csv');

  // Return the CSV file as string:
  console.log(await csv.toString());
})();
```

## Methods ##

There are two methods, `toDisk(filename)` and `toString()`.

### async toDisk(filename, options) ###

Converts the data and saves the CSV file to disk. The `filename` must include the
path as well.

The `options` is an optional parameter which is an object that contains the 
settings. Supported options:

- `append` - whether to append to the file. Default is `false` (overwrite the file).
Set to `true` to append. Column names will be added only once at the beginning
of the file. If the file does not exist, it will be created.
- `bom` - whether to add the Unicode Byte Order Mark at the beginning of the
file. Default is `false`; set to `true` to be able to view Unicode in Excel
properly. Otherwise Excel will display Unicode incorrectly.
- `allColumns` - whether to check all array items for keys to convert to columns rather 
than only the first. This will sort the columns alphabetically. Default is `false`;
set to `true` to check all items for potential column names.

```js
const ObjectsToCsv = require('objects-to-csv');
const sampleData = [{ id: 1, text: 'this is a test' }];

// Run asynchronously, without awaiting:
new ObjectsToCsv(sampleData).toDisk('./test.csv');

// Alternatively, you can append to the existing file:
new ObjectsToCsv(sampleData).toDisk('./test.csv', { append: true });

// `allColumns: true` collects column names from all objects in the array,
// instead of only using the first one. In this case the CSV file will
// contain three columns:
const mixedData = [
  { id: 1, name: 'California' },
  { id: 2, description: 'A long description.' },
];
new ObjectsToCsv(mixedData).toDisk('./test.csv', { allColumns: true });
```

### async toString(header = true, allColumns = false) ###

Returns the CSV file as a string.

Two optional parameters are available:

- `header` controls whether the column names will be
returned as the first row of the file. Default is `true`. Set it to `false` to
get only the data rows, without the column names.
- `allColumns` controls whether to check every item for potential keys to process,
rather than only the first item; this will sort the columns alphabetically by key name.
Default is `false`. Set it to `true` to process keys that may not be present
in the first object of the array.

```js
const ObjectsToCsv = require('objects-to-csv');
const sampleData = [{ id: 1, text: 'this is a test' }];

async function printCsv(data) {
  console.log(
    await new ObjectsToCsv(data).toString()
  );
}

printCsv(sampleData);
```

## Requirements ##

Use Node.js version 8 or above.
