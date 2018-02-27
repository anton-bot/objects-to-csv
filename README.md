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

// Function must be asynchronous:
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

### async toDisk(filename) ###

Converts the data and saves the CSV file to disk. The `filename` must include the
path as well.

```js
const ObjectsToCsv = require('objects-to-csv');
const sampleData = [{id: 1, text: "this is a test"}];

// Run asynchronously, without awaiting:
new ObjectsToCsv(sampleData).toDisk('./test.csv');
```

### async toString() ###

Returns the CSV file as a string.

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

Tested with Node 8.9. You must use a version of Node.js that supports ES7's async-await.