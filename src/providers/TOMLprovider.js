import fs from 'fs';
import _ from 'lodash';
import { parse, stringify } from 'toml';

export class TOMLProvider {
  /**
   * Constructs a new instance of the TOMLProvider class.
   * @param {string} filePath - The file path to read and save TOML data.
   */
  constructor(filePath) {
    this.filePath = filePath || './megdb.toml';
    this.data = {
      Schemas: {},
      default: {},
    };

    if (fs.existsSync(this.filePath)) {
      this.read();
    }
  }

  /**
   * Sets the schema for a given schema name.
   * @param {string} schemaName - The name of the schema.
   * @param {object} schema - The schema object.
   */
  setSchema(schemaName, schema) {
    this.checkParams(schemaName, schema);
    _.set(this.data, ['Schemas', schemaName], schema);
    this.save();
  }

  /**
   * Sets a key-value pair in the default data object.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   */
  set(key, value) {
    this.checkParams(key, value);
    const schema = this.getSchema(key);
    if (schema) {
      schema.validate(value);
    }
    _.set(this.data, ['default', key], value);
    this.save();
  }

  /**
   * Retrieves the value associated with the specified key from the default data object.
   * @param {string} key - The key to retrieve the value for.
   * @returns {any} The value associated with the key.
   */
  get(key) {
    this.checkParams(key, 'get');
    return _.get(this.data, ['default', key]);
  }

  /**
   * Deletes the key-value pair associated with the specified key from the default data object.
   * @param {string} key - The key to delete.
   */
  delete(key) {
    this.checkParams(key, 'delete');
    _.unset(this.data, ['default', key]);
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
    this.checkParams(key, value);
    const array = this.get(key) || [];
    array.push(value);
    this.set(key, array);
  }

  /**
   * Removes a value from the array associated with the specified key in the default data object.
   * @param {string} key - The key of the array.
   * @param {any} value - The value to remove from the array.
   */
  pull(key, value) {
    this.checkParams(key, value);
    const array = this.get(key) || [];
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
      this.set(key, array);
    }
  }

  /**
   * Deletes all key-value pairs from the default data object.
   * @param {string} type - The type of data to delete. Valid values are "default" and "schemas".
   */
  deleteAll(type) {
    if (type.toLowerCase() === 'default') {
      this.data.default = {};
    } else if (type.toLowerCase() === 'schemas') {
      this.data.Schemas = {};
    } else {
      throw new Error(`Unknown type: ${type}. Valid types: schemas, default`);
    }
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
   * Moves data from other databases to meg.db.
   * @param {Object} data - The data object from another TOMLProvider instance.
   * @returns {boolean} - Indicates whether the move operation was successful.
   */
  move(data) {
    if (!data.constructor) {
      throw new Error('Invalid database class.');
    }
    const datas = data.all() || data.getAll();
    for (const key in datas) {
      this.set(key, datas[key]);
    }
    return true;
  }

  /**
   * Retrieves the schema associated with the specified schema name.
   * @param {string} schemaName - The name of the schema.
   * @returns {object} The schema associated with the schema name.
   */
  getSchema(schemaName) {
    return _.get(this.data, ['Schemas', schemaName]);
  }

  /**
   * Reads TOML data from the file and assigns it to the data property.
   */
  read() {
    const tomlData = fs.readFileSync(this.filePath, 'utf8');
    this.data = parse(tomlData);
  }

  /**
   * Writes the data property to the TOML file.
   */
  save() {
    const tomlData = stringify(this.data);
    fs.writeFileSync(this.filePath, tomlData);
  }

  /**
   * Checks parameters.
   * @private
   * @param {string} key - The key parameter to validate.
   * @param {any} value - The value parameter to validate.
   * @returns {boolean} - Indicates whether the parameters are valid.
   */
  checkParams(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError('The "key" parameter must be a string.');
    } else if (key.length === 0) {
      throw new Error('The "key" parameter cannot be empty.');
    }
    if (value === undefined) {
      throw new Error('The "value" parameter cannot be undefined.');
    }
    return true;
  }
}
