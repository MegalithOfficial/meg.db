import fs from "node:fs";

export class JSONprovider {

  /**
   * Creates a new instance of the Database class.
   * @param {Object} options - The options for the Database class.
   * @param {string} options.filepath - The file path where the data will be stored.
   */
  constructor(options = { filepath: "./database.json" }) {
    this.filepath = options.filepath;

    /**
    * @private
    */
    this.data = {}
    this.load();
  }

  /**
   * Loads data from the file specified in the constructor.
   * @private
   */
  load() {
    try {
      const readData = fs.readFileSync(this.filepath);
      this.data = JSON.parse(readData);
    } catch (_) {
      this.data = {};
      this.save();
    }
  }

  /** 
   * Saves data to the file specified in the constructor.
   * @private
   */
  save() {
    const data = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(this.filepath, data);
  }

  /**
   * 
   * @param {*} key 
   * @param {*} value 
   */
  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  /**
   * Gets the value for the specified key.
   * @param {string} key - The key to get.
   * @returns {*} The value for the specified key.
   */
  get(key) {
    return this.data[key];
  }

  /**
   * Checks if a key exists in the database.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  exists(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  /**
   * Deletes the value for the specified key.
   * @param {string} key - The key to delete.
   */
  delete(key) {
    delete this.data[key];
    this.save();
  }

  /**
   * Adds a value to an array for the specified key.
   * @param {string} key - The key to push to.
   * @param {*} value - The value to push.
   */
  push(key, value) {
    if (!Array.isArray(this.data[key])) {
      this.data[key] = [];
    }
    this.data[key].push(value);
    this.save();
  }

  /**
   * Removes a value from an array for the specified key.
   * @param {string} key - The key to pull from.
   * @param {*} value - The value to pull.
   */
  pull(key, value) {
    if (Array.isArray(this.data[key])) {
      this.data[key] = this.data[key].filter(item => item !== value);
      this.save();
    }
  }

  /**
   * Deletes all data from the database.
   */
  deleteAll() {
    this.data = {};
    this.save();
  }

  /**
   * Returns all data stored in the database.
   * @returns {Object} All data stored in the database.
   */
  all() {
    return this.data;
  }

  /**
   * Checks is specified key is in the database.
   * @param {String} key 
   * @returns {boolean} 
   */
  exists(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

}

const db = new JSONprovider()
db.set("hi.hi.hi", "hello")
console.log(db.get("hi"));