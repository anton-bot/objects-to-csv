/**
 * Converts an array of objects into a CSV file.
 */
declare class ObjectsToCsv {
    private data;
    /**
     * Creates a new instance of the object array to csv converter.
     * @param {object[]} objectArray
     */
    constructor(objectArray: object[]);
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
    toDisk(filename: string, options?: ToDiskOptions): Promise<string>;
    /**
     * Returns the CSV file as string.
     * @param {boolean} header - If false, omit the first row containing the
     * column names.
     * @param {boolean} allColumns - Whether to check all items for column names.
     *   Uses only the first item if false.
     * @returns {Promise<string>}
     */
    toString(header?: boolean, allColumns?: boolean): Promise<string>;
}
declare type ToDiskOptions = {
    append: boolean;
    bom: boolean;
    allColumns: boolean;
};
export default ObjectsToCsv;
