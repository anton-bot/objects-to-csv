# Convert array of objects into a CSV file #

This class converts an array of JavaScript objects into the CSV format, optionally saving it to a CSV file.

The first object of the array will determine the number of columns and the column names.

Any special characters in the values (such as commas) will be properly escaped.

## Usage ##

```js
const ObjectsToCsv = require('objects-to-csv');

// Sample data - two columns, three rows:
const data = [
  {code: 'HK', name: 'Hong Kong'},
  {code: 'KLN', name: 'Kowloon'},
  {code: 'NT', name: 'New Territories'},
];

// If you use "await", code must be inside an asynchronous function:
(async() =>{
  let csv = new ObjectsToCsv(data);

  // Save to file:
  await csv.toDisk('./test.csv');

  // Return the CSV file as string:
  console.log(await csv.toString());
})();
```

## Methods ##

The class contains two methods, `toDisk(filename)` and `toString()`.

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
- `allColumns` - whether to check all items for keys to convert to columns rather 
than only the first.  This will sort the columns alphabetically.  Default is `false`;
set to `true` to check all items for potential column names.

```js
const ObjectsToCsv = require('objects-to-csv');
const sampleData = [{id: 1, text: "this is a test"}];

// Run asynchronously, without awaiting:
new ObjectsToCsv(sampleData).toDisk('./test.csv');

// Alternatively, you can append to the existing file:
new ObjectsToCsv(sampleData).toDisk('./test.csv', { append: true });
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
const sampleData = [{id: 1, text: "this is a test"}];

async function printCsv(data) {
  console.log(
    await new ObjectsToCsv(data).toString()
  );
}

printCsv(sampleData);
```

## Requirements ##

Use Node.js version 8 or above.