import fs from "node:fs";
import { BSON } from "bson";

export class BSONprovider {

  /**
   * Creates a new instance of the Database class.
   * @param {Object} options - The options for the Database class.
   * @param {string} options.filepath - The file path where the data will be stored.
   */
  constructor(options = { filepath: "./database.bson" }) {
    this.filepath = options.filepath;
    this.data = new Map();
    this.schemas = new Map();
    this.load();
  }
  /**
   * Loads data from the file specified in the constructor.
   * @private
   */
  load() {
    try {
      const readData = fs.readFileSync(this.filepath);
      const deserializedData = BSON.deserialize(readData);
      this.data = new Map(Object.entries(deserializedData.data || {}));
      this.schemas = new Map(Object.entries(deserializedData.schemas || {}));
    } catch (_) {
      this.data = new Map();
      this.schemas = new Map();
      this.save();
    }
  }

  /** 
   * Saves data to the file specified in the constructor.
   * @private
   */
  save() {
    const data = {
      data: Object.fromEntries(this.data),
      schemas: Object.fromEntries(this.schemas),
    };
    const serializedData = BSON.serialize(data);
    fs.writeFileSync(this.filepath, serializedData);
  }

  /**
   * 
   * @param {*} key 
   * @param {*} value 
   */
  set(key, value) {
    this.data.set(key, value);
    this.save();
  }

  /**
   * Gets the value for the specified key.
   * @param {string} key - The key to get.
   * @returns {*} The value for the specified key.
   */
  get(key) {
    return this.data.get(key);
  }

  /**
   * Checks if a key exists in the database.
   * @param {string} key - The key to check.
   * @returns {boolean} True if the key exists, false otherwise.
   */
  exists(key) {
    return this.data.has(key);
  }

  /**
   * Deletes the value for the specified key.
   * @param {string} key - The key to delete.
   */
  delete(key) {
    this.data.delete(key);
    this.save();
  }

  /**
   * Adds a value to an array for the specified key.
   * @param {string} key - The key to push to.
   * @param {*} value - The value to push.
   */
  push(key, value) {
    if (!Array.isArray(this.data.get(key))) {
      this.data.set(key, []);
    }
    this.data.get(key).push(value);
    this.save();
  }

  /**
   * Removes a value from an array for the specified key.
   * @param {string} key - The key to pull from.
   * @param {*} value - The value to pull.
   */
  pull(key, value) {
    if (Array.isArray(this.data.get(key))) {
      const updated = this.data.get(key).filter((item) => item !== value);
      this.data.set(key, updated);
      this.save();
    }
  }


  /**
   * Deletes all data from the database.
   */
  deleteAll() {
    this.data = new Map();
    this.save();
  }

  /**
   * Returns all data stored in the database.
   * @returns {Object} All data stored in the database.
   */
  all() {
    return Object.fromEntries(this.data);
  }
  /**
   * Checks is specified key is in the database.
   * @param {String} key 
   * @returns {boolean} 
   */
  query(queryExpression) {
    const queryFunction = new Function("data", `return ${queryExpression};`);
    return Array.from(this.data.values()).filter(queryFunction);
  }

}

const db = new BSONprovider({ filepath: "./data.bson" });
db.set("hi", "hello!");
console.log(db.get("hi"))
console.log(db.all())