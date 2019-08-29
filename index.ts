import { stringify } from 'async-csv';
import { existsSync, statSync, appendFile, writeFile } from 'fs';

/**
 * Converts an array of objects into a CSV file.
 */
class ObjectsToCsv {
  private data: object[] = [];

  /**
   * Creates a new instance of the object array to csv converter.
   * @param {object[]} objectArray
   */
  constructor(objectArray: object[]) {
    if (!Array.isArray(objectArray)) {
      throw new Error('The input to objects-to-csv must be an array of objects.');
    }

    if (objectArray.length > 0) {
      if (objectArray.some(row => typeof row !== 'object')) {
        throw new Error('The array must contain objects, not other data types.');
      }
    }

    this.data = objectArray;
  }

  /**
   * Saves the CSV file to the specified file.
   * @param {string} filename - The path and filename of the new CSV file.
   * @param {object} options - The options for writing to disk.
   * @param {boolean} [options.append] - Whether to append to file. Default is overwrite (false).
   * @param {boolean} [options.bom] - Append the BOM mark so that Excel shows
   * @param {boolean} [options.allColumns] - Whether to check all items for column names or only the first.  Default is the first.
   * Unicode correctly.
   * @returns {string} The saved CSV string;
   */
  async toDisk(filename: string, options?: ToDiskOptions): Promise<string> {
    if (!filename) {
      throw new Error('Empty filename when trying to write to disk.');
    }

    let addHeader = false;

    // If the file didn't exist yet or is empty, add the column headers
    // as the first line of the file. Do not add it when we are appending
    // to an existing file.
    const fileNotExists = !existsSync(filename) || statSync(filename).size === 0;
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
        appendFile(filename, data, 'utf8', (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(data);
          }
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        writeFile(filename, data, 'utf8', (error) => {
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
  async toString(header: boolean = true, allColumns: boolean = false): Promise<string> {
    return await convert(this.data, header, allColumns);
  }
}

/**
 * Private method to run the actual conversion of array of objects to CSV data.
 * @param {object[]} data
 * @param {boolean} header - Whether the first line should contain column headers.
 * @param {boolean} allColumns - Whether to check all items for column names.
 *   Uses only the first item if false.
 * @returns {string}
 */
async function convert(data: object[], header: boolean = true, allColumns: boolean = false): Promise<string> {
  if (data.length === 0) {
    return '';
  }

  const columnNames: string[] =
    allColumns
      ? [...data
        .reduce<Set<string>>((columns, row) => { // check each object to compile a full list of column names
          Object.keys(row).map(rowKey => columns.add(rowKey));
          return columns;
        }, new Set())]
      : Object.keys(data[0]); // just figure out columns from the first item in array

  if (allColumns) {
    columnNames.sort(); // for predictable order of columns
  }

  // This will hold data in the format that `async-csv` can accept, i.e.
  // an array of arrays.
  const csvInput = [];
  if (header) {
    csvInput.push(columnNames);
  }

  // Add all other rows:
  csvInput.push(
    ...data.map((row: Record<string, any>) => columnNames.map(column => row[column])),
  );

  return await stringify(csvInput);
}

type ToDiskOptions = {
  append: boolean;
  bom: boolean;
  allColumns: boolean;
};

export default ObjectsToCsv;
