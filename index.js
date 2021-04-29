'use strict';

const csv = require('async-csv');
const fs = require('fs');

/**
 * @typedef {{value: string, quote: boolean}|string} CastResult
 */

/**
 * @typedef {object} CsvOptions
 * @property {{boolean: function(boolean):CastResult, date: function(date):CastResult, number: function(number):CastResult, object:function(object):CastResult}} cast Defines custom cast for certain data types.
 * @property {array|object} columns List of properties when records are provided as objects; work with records in the form of arrays based on index position; order matters; auto discovered in the first record when the user write objects, can refer to nested properties of the input JSON, see the "header" option on how to print columns names on the first line.
 * @property {string} delimiter Set the field delimiter, one or multiple characters, defaults to a comma.
 * @property {boolean} eof Add the value of "options.record_delimiter" on the last line, default to true.
 * @property {string|Buffer} escape Single character used for escaping; only apply to characters matching the quote and the escape options default to ".
 * @property {boolean} header Display the column names on the first line if the columns option is provided or discovered.
 * @property {string|Buffer|boolean} quote The quote characters, defaults to the ", an empty quote value will preserve the original field.
 * @property {boolean} quoted Boolean, default to false, quote all the non-empty fields even if not required.
 * @property {boolean} quoted_empty Quote empty strings and overrides quoted_string on empty strings when defined; default is false.
 * @property {boolean} quoted_match Quote all fields matching a regular expression; default is false.
 * @property {boolean} quoted_string Quote all fields of type string even if not required; default is false.
 * @property {string|Buffer} record_delimiter String used to delimit record rows or a special value; special values are 'auto', 'unix', 'mac', 'windows', 'ascii', 'unicode'; defaults to 'auto' (discovered in source or 'unix' if no source is specified)
 */

/**
 * Converts an array of objects into a CSV file.
 */
class ObjectsToCsv {
  /**
   * Creates a new instance of the object array to csv converter.
   * @param {object[]} objectArray
   * @param {CsvOptions} csvOptions Options passed to the csv stringify, see (https://csv.js.org/stringify/options/)
   */
  constructor(objectArray, csvOptions = {}) {
    if (!Array.isArray(objectArray)) {
      throw new Error('The input to objects-to-csv must be an array of objects.');
    }

    if (objectArray.length > 0) {
      if (objectArray.some(row => typeof row !== 'object')) {
        throw new Error('The array must contain objects, not other data types.');
      }
    }

    this.data = objectArray;
    this.csvOptions = csvOptions;
  }

  /**
   * Saves the CSV file to the specified file.
   * @param {string} filename - The path and filename of the new CSV file.
   * @param {object} options - The options for writing to disk.
   * @param {boolean} [options.append] - Whether to append to file. Default is overwrite (false).
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
    if (fileNotExists || !options || !options.append) {
      addHeader = true;
    }

    const allColumns = options && options.allColumns
      ? options.allColumns
      : false;

    let data = await this.toString(addHeader, allColumns);
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
   * @param {boolean} allColumns - Whether to check all items for column names.
   *   Uses only the first item if false.
   * @returns {Promise<string>}
   */
  async toString(header = true, allColumns = false) {
    return await convert(this.data, header, allColumns, this.csvOptions);
  }
}

/**
 * Private method to run the actual conversion of array of objects to CSV data.
 * @param {object[]} data
 * @param {boolean} header - Whether the first line should contain column headers.
 * @param {boolean} allColumns - Whether to check all items for column names.
 *   Uses only the first item if false.
 * @param {CsvOptions} options
 * @returns {string}
 */
async function convert(data, header = true, allColumns = false, options = {}) {
  if (data.length === 0) {
    return '';
  }

  const columnNames =
    allColumns
      ? [...data
        .reduce((columns, row) => { // check each object to compile a full list of column names
          Object.keys(row).map(rowKey => columns.add(rowKey));
          return columns;
        }, new Set())]
      : Object.keys(data[0]); // just figure out columns from the first item in array

  if (allColumns) {
    columnNames.sort(); // for predictable order of columns
  }

  // This will hold data in the format that `async-csv` can accept, i.e.
  // an array of arrays.
  let csvInput = [];
  if (header) {
    csvInput.push(columnNames);
  }

  // Add all other rows:
  csvInput.push(
    ...data.map(row => columnNames.map(column => row[column])),
  );

  return await csv.stringify(csvInput, options);
}

module.exports = ObjectsToCsv;
