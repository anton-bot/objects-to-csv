'use strict';

const csv = require('async-csv');
const fs = require('fs');

/**
 * Converts an array of objects into a CSV file.
 */
class ObjectsToCsv {
  /**
   * Creates a new instance of the object array to csv converter.
   * @param {object[]} objectArray
   */
  constructor(objectArray) {
    if (!Array.isArray(objectArray)) {
      throw new Error('The input to objects-to-csv must be an array of objects.');
    }

    if (objectArray.length > 0) {
      if (typeof objectArray[0] !== 'object') {
        throw new Error('The array must contain objects, not other data types.');
      }
    }

    this.data = objectArray;
  }

  /**
   * Saves the CSV file to the specified file.
   * @param {string} filename - The path and filename of the new CSV file.
   */
  async toDisk(filename) {
    if (!filename) {
      throw new Error('Empty filename when trying to write to disk.');
    }

    fs.writeFileSync(filename, await this.toString());
  }

  /**
   * Returns the CSV file as string.
   */
  async toString() {
    return await convert(this.data);
  }
}

/**
 * Private method to run the actual conversion of array of objects to CSV data.
 * @param {object[]} data
 */
async function convert(data) {
  if (data.length === 0) {
    return '';
  }

  // This will hold data in the format that `async-csv` can accept, i.e.
  // an array of arrays.
  let csvInput = [];

  // Figure out the columns from the first item in the array:
  let columnNames = Object.keys(data[0]);

  // Add header row
  csvInput.push(columnNames);

  // Add all the other rows:
  for (let row of data) {
    let item = columnNames.map(column => row[column]);
    csvInput.push(item);
  }

  return await csv.stringify(csvInput);
}

module.exports = ObjectsToCsv;