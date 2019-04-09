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
   * @param {object} options - The options for writing to disk.
   * @param {boolean} [options.append] - Whether to append to file. Default is overwrite.
   * @param {boolean} [options.bom] - Append the BOM mark so that Excel shows
   * @param {boolean} [options.allColumns] - Whether to check all items for column names or only the first.  Default is the first.
   * Unicode correctly.
   */
  async toDisk(filename, options) {
    if (!filename) {
      throw new Error('Empty filename when trying to write to disk.');
    }

    let addHeader = false;

    // If the file didn't exist yet or is empty, add the column headers
    // as the first line of the file. Do not add it when we are appending
    // to an existing file.
    const fileNotExists = !fs.existsSync(filename) || fs.statSync(filename).size === 0;
    if (fileNotExists) {
      addHeader = true;
    }

    //if a boolean true is passed, set allColumns to true - else false.
    let allColumns = false;
    if (options.allColumns === true) {
      allColumns = true;
    }

    let data = await this.toString(addHeader,allColumns);
    // Append the BOM mark if requested at the beginning of the file, otherwise
    // Excel won't show Unicode correctly. The actual BOM mark will be EF BB BF,
    // see https://stackoverflow.com/a/27975629/6269864 for details.
    if (options && options.bom && fileNotExists) {
      data = '\ufeff' + data;
    }

    if (options && options.append) {
      return new Promise((resolve, reject) => {
        fs.appendFile(filename, data, 'utf8', (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, 'utf8', (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
    }
  }

  /**
   * Returns the CSV file as string.
   * @param {boolean} header - If false, omit the first row containing the
   * column names.
   * @param {boolean} allColumns - Whether to check all items for column names.  Uses only the first item if false.
   * @returns {string}
   */
  async toString(header = true, allColumns = false) {
    return await convert(this.data, header, allColumns);
  }
}

/**
 * Private method to run the actual conversion of array of objects to CSV data.
 * @param {object[]} data
 * @param {boolean} header - Whether the first line should contain column headers.
 * @param {boolean} allColumns - Whether to check all items for column names.  Uses only the first item if false.
 * @returns {string}
 */
async function convert(data, header = true, allColumns = false) {
  if (data.length === 0) {
    return '';
  }

  // This will hold data in the format that `async-csv` can accept, i.e.
  // an array of arrays.
  let csvInput = [];

  // Figure out the columns from the first item in the array:
  let columnNames = Object.keys(data[0]);

  //if allColumns was set to true, check each item to get all unique keys:
  if (allColumns === true) {
    let columnSet = new Set([]);
    data.forEach((row) => {
      let rowKeys = Object.keys(row);
      rowKeys.forEach((key) => {
        columnSet.add(key);
      });
    });
    //sort columns to keep row order predictable
    columnNames = [...columnSet].sort();
  }

  if (header) {
    // Add header row
    csvInput.push(columnNames);
  }

  // Add all the other rows:
  for (let row of data) {
    let item = columnNames.map(column => row[column]);
    csvInput.push(item);
  }

  return await csv.stringify(csvInput);
}

module.exports = ObjectsToCsv;