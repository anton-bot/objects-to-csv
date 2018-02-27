'use strict';

const csv = require('async-csv');

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
  toDisk(filename) {

  }

  /**
   * Returns the CSV file as string.
   */
  toString() {

  }
}

/**
 * Private method to run the actual conversion of array of objects to CSV data.
 * @param {object[]} data
 */
function convert(data) {

}

module.exports = ObjectsToCsv;