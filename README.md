# Convert array of objects into a CSV file #

Converts an array of JavaScript objects into the CSV format. You can
save the CSV to file or return it as a string.

The keys in the first object of the array will be used as column names.

Any special characters in the values (such as commas) will be properly escaped.
Spreadsheet formula escaping is enabled by default for both values and column names.

## Upgrading from 1.x ##

Version 3 requires Node.js 18 or newer. Existing `toString()` and `toDisk()` calls
still work, but strings that could be interpreted as spreadsheet formulas now get
a leading apostrophe. For example, `=1+1` becomes `'=1+1`, and the string `-42`
becomes `'-42`. JavaScript numbers such as `-42` remain numbers in the CSV output.
Null rows, array rows and sparse input arrays are rejected with a clear error.

The version number skips the previously published experimental `2.0.0` on the
`next` npm tag. This release continues the API from stable `1.3.6`.

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

### new ObjectsToCsv(data, options) ###

`data` must be an array of non-null objects. The optional `options` object accepts:

- `escapeFormulas` — defaults to `true`. Prefixes potentially dangerous text with
an apostrophe before CSV quoting. Applies to column names and data in both output
methods, including appended rows. Does not mutate the input objects.

Protection covers `=`, `+`, `-`, `@`, their full-width Unicode variants, and leading
tabs, carriage returns and line feeds. Formula prefixes behind leading whitespace
or ASCII control characters are also escaped. Existing leading apostrophes are
preserved.

Escaping changes the underlying text. To preserve raw values for trusted data or
machine-only processing, explicitly disable it:

```js
const csv = new ObjectsToCsv(trustedData, { escapeFormulas: false });
```

With escaping disabled, untrusted values can become active spreadsheet formulas.
CSV quoting alone does not prevent this. Spreadsheet import settings differ, and
editing, saving and reopening CSV files can remove protective escaping. For a
workflow that must preserve cell types through editing, use a spreadsheet format
with explicitly typed text cells. See [OWASP's CSV injection guidance](https://owasp.org/www-community/attacks/CSV_Injection).

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
The BOM is included when creating or overwriting a file; appending to a non-empty
file does not add another BOM.
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

Resolves to the text written to the file. Await each write before appending again
to the same file. When appending, keep the same column names and order as the
existing CSV; the method does not reconcile schemas.

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

Use Node.js version 18 or above. A currently maintained Node.js release is recommended.

## Development ##

```sh
npm ci
npm test
npm audit
npm pack --dry-run
```

Tests use Node's built-in test runner. CSV formatting is handled by `csv-stringify`,
the only runtime dependency. Publishing runs the tests again through `prepublishOnly`.
