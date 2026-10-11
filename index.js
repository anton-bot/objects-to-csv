'use strict';

const { stringify } = require('csv-stringify');
const fs = require('node:fs/promises');

// Check past leading whitespace/control characters without changing the data.
const FORMULA_PREFIX = /^(?:[\s\x00-\x1f]*[=+\-@\uFF1D\uFF0B\uFF0D\uFF20]|[\t\r\n])/;

function escapeFormula(value) {
  return FORMULA_PREFIX.test(value) ? "'" + value : value;
}

/**
 * Converts an array of objects into a CSV file.
 */
class ObjectsToCsv {
  /**
   * Creates a new instance of the object array to csv converter.
   * @param {object[]} objectArray
   * @param {object} [options]
   * @param {boolean} [options.escapeFormulas=true] - Escape spreadsheet formulas.
   */
  constructor(objectArray, { escapeFormulas = true } = {}) {
    if (!Array.isArray(objectArray)) {
      throw new Error('The input to objects-to-csv must be an array of objects.');
    }

    for (const row of objectArray) {
      if (row === null || typeof row !== 'object' || Array.isArray(row)) {
        throw new Error('The array must contain objects, not other data types.');
      }
    }

    if (typeof escapeFormulas !== 'boolean') {
      throw new TypeError('escapeFormulas must be a boolean.');
    }

    this.data = objectArray;
    this.escapeFormulas = escapeFormulas;
  }

  /**
   * Saves the CSV file to the specified file.
   * @param {string} filename - The path and filename of the new CSV file.
   * @param {object} options - The options for writing to disk.
   * @param {boolean} [options.append] - Whether to append to file. Default is overwrite (false).
   * @param {boolean} [options.bom] - Add a BOM so that Excel shows Unicode correctly.
   * @param {boolean} [options.allColumns] - Whether to check all items for column names or only the first.  Default is the first.
   * @returns {Promise<string>} The CSV text written to disk.
   */
  async toDisk(filename, options) {
    if (!filename) {
      throw new Error('Empty filename when trying to write to disk.');
    }

    const { append = false, bom = false, allColumns = false } = options || {};
    let addHeader = true;
    if (append) {
      try {
        addHeader = (await fs.stat(filename)).size === 0;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }

    let data = await this.toString(addHeader, allColumns);
    if (bom && addHeader) data = '\ufeff' + data;

    await fs.writeFile(filename, data, { encoding: 'utf8', flag: append ? 'a' : 'w' });
    return data;
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
    return convert(this.data, header, allColumns, this.escapeFormulas);
  }
}

/**
 * Private method to run the actual conversion of array of objects to CSV data.
 * @param {object[]} data
 * @param {boolean} header - Whether the first line should contain column headers.
 * @param {boolean} allColumns - Whether to check all items for column names.
 *   Uses only the first item if false.
 * @param {boolean} escapeFormulas - Whether to escape spreadsheet formulas.
 * @returns {Promise<string>}
 */
async function convert(data, header, allColumns, escapeFormulas) {
  if (data.length === 0) {
    return '';
  }

  const columnNames =
    allColumns
      ? [...data
        .reduce((columns, row) => { // check each object to compile a full list of column names
          Object.keys(row).forEach(rowKey => columns.add(rowKey));
          return columns;
        }, new Set())]
      : Object.keys(data[0]); // just figure out columns from the first item in array

  if (allColumns) {
    columnNames.sort(); // for predictable order of columns
  }

  const csvInput = [];
  if (header) {
    csvInput.push(columnNames);
  }

  // Add all other rows:
  for (const row of data) {
    csvInput.push(columnNames.map(column => row[column]));
  }

  return new Promise((resolve, reject) => {
    stringify(csvInput, {
      escape_formulas: escapeFormulas,
      cast: { string: escapeFormulas ? escapeFormula : value => value },
    }, (error, output) => {
      if (error) reject(error);
      else resolve(output);
    });
  });
}

module.exports = ObjectsToCsv;
