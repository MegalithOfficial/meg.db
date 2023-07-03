"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BSONprovider = void 0;
var _bson = require("bson");
var _fs = _interopRequireDefault(require("fs"));
var _lodash = _interopRequireDefault(require("lodash"));
var _stringColorizer = _interopRequireDefault(require("string-colorizer"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class BSONprovider {
  /**
   * Constructs a new instance of the BSONprovider class.
   * @param {string} filePath - The file path to read and save BSON data.
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      Schemas: {},
      default: {}
    };
    if (filePath && _fs.default.existsSync(filePath)) {
      this.read(filePath);
    }
  }

  /**
   * Sets the schema for a given schema name.
   * @param {string} schemaName - The name of the schema.
   * @param {object} schema - The schema object.
   */
  setSchema(schemaName, schema) {
    _lodash.default.set(this.data, ['Schemas', schemaName], schema);
  }

  /**
   * Sets a key-value pair in the default data object.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   */
  set(key, value) {
    const schema = this.getSchema(key);
    if (schema) {
      schema.validate(value);
    }
    _lodash.default.set(this.data, ['default', key], value);
    this.save();
  }

  /**
   * Retrieves the value associated with the specified key from the default data object.
   * @param {string} key - The key to retrieve the value for.
   * @returns {any} The value associated with the key.
   */
  get(key) {
    return _lodash.default.get(this.data, ['default', key]);
  }

  /**
   * Deletes the key-value pair associated with the specified key from the default data object.
   * @param {string} key - The key to delete.
   */
  delete(key) {
    _lodash.default.unset(this.data, ['default', key]);
    this.save();
  }

  /**
   * Filters the default data object based on the provided callback function.
   * @param {function} callback - The callback function that determines whether to include a key-value pair in the filtered data.
   * @returns {object} The filtered data object.
   */
  filter(callback) {
    const filteredData = {};
    for (const key in this.data.default) {
      const value = this.data.default[key];
      if (callback(key, value)) {
        filteredData[key] = value;
      }
    }
    return filteredData;
  }

  /**
   * Adds a value to an array associated with the specified key in the default data object.
   * @param {string} key - The key of the array.
   * @param {any} value - The value to add to the array.
   */
  push(key, value) {
    const array = this.get(key) || [];
    array.push(value);
    this.set(key, array);
  }

  /**
   * Removes a value from the array associated with the specified key in the default data object.
   * @param {string} key - The key of the array.
   * @param {any} value - The value to remove from the array.
   */
  push(key, value) {
    const array = this.get(key) || [];
    array.push(value);
    this.set(key, array);
  }
  pull(key, value) {
    const array = this.get(key) || [];
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
      this.set(key, array);
    }
  }

  /**
   * Deletes all key-value pairs from the default data object.
   */
  deleteAll() {
    this.data.default = {};
    this.save();
  }

  /**
   * Retrieves all key-value pairs from the default data object.
   * @returns {object} The default data object.
   */
  all() {
    return this.data.default;
  }

  /**
   * Retrieves the schema associated with the specified schema name.
   * @param {string} schemaName - The name of the schema.
   * @returns {object} The schema associated with the schema name.
   */
  getSchema(schemaName) {
    return _lodash.default.get(this.data, ['Schemas', schemaName]);
  }

  /**
   * Reads BSON data from a file and assigns it to the data property.
   * @param {string} file - The file to read BSON data from.
   */
  read(file) {
    const data = _fs.default.readFileSync(file);
    this.data = _bson.BSON.deserialize(data);
  }

  /**
   * Asynchronously reads BSON data from a file and merges it into the data property.
   * @param {string} file - The file to read BSON data from.
   */
  load(file) {
    _fs.default.readFile(file, (err, data) => {
      if (err) throw err;
      _lodash.default.merge(this.data, _bson.BSON.deserialize(data));
      this.save();
    });
  }
  save() {
    if (this.filePath) {
      _fs.default.writeFileSync(this.filePath, _bson.BSON.serialize(this.data));
    }
  }
}

/*const db = new BSONprovider("./data.bson");
db.set("hi", "hello!");
console.log(db.get("hi"))
console.log(db.all())*/
exports.BSONprovider = BSONprovider;