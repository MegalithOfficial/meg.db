import { BSON } from 'bson';
import fs from 'graceful-fs';
import _ from 'lodash';

export class BSONProvider {


  /**
   * Constructs a new instance of the BSONprovider class.
   * @param {string} filePath - The file path to read and save BSON data.
   */
  constructor(filePath) {
    this.filepath = filePath ?? "./megdb.bson";

    this.data = { Schemas: {}, default: {} };

    if (filePath && fs.existsSync(filePath)) {
      this.read(filePath);
    }
  }

  /**
   * Sets the schema for a given schema name.
   * @param {string} schemaName - The name of the schema.
   * @param {object} schema - The schema object.
   */
  setSchema(schemaName, schema) {
    this.checkparams(schemaName, schema);
    _.set(this.data, ['Schemas', schemaName], schema);
  }

  /**
   * Sets a key-value pair in the default data object.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   */
  set(key, value) {
    this.checkparams(key, value);
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
    this.checkparams(key, "get");
    return _.get(this.data, ['default', key]);
  }

  /**
   * Deletes the key-value pair associated with the specified key from the default data object.
   * @param {string} key - The key to delete.
   */
  delete(key) {
    this.checkparams(key, "delete");
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
    this.checkparams(key, value);
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
    this.checkparams(key, value);
    const array = this.get(key) || [];
    array.push(value);
    this.set(key, array);
  }

  /**
   * 
   * @param {*} key 
   * @param {*} value 
   */
  pull(key, value) {
    this.checkparams(key, value);
    const array = this.get(key) || [];
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
      this.set(key, array);
    }
  }

  /**
   * Deletes all key-value pairs from the default data object.
   * @param {String} type
   */
  deleteAll(type) {
    if (type.toLocaleLowerCase() === "default") this.data.default = {};
    else if (type.toLocaleLowerCase() === "schemas") this.data.Schemas = {};
    else throw new Error("Unknown type: " + type + ". Valid types: schemas, default");
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
   * @param {Object} opt 
   * @returns {boolean}
   */
  move(data) {
    if (!data.constructor) throw new Error("Invalid database class.")
    const datas = data.all() ?? data.getAll();
    for (let key in datas) {
      this.set(key, datas[key]);
    };
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
   * Reads BSON data from a file and assigns it to the data property.
   * @param {string} file - The file to read BSON data from.
   */
  read(file) {
    const data = fs.readFileSync(file);
    this.data = BSON.deserialize(data);
  }

  /**
   * Asynchronously reads BSON data from a file and merges it into the data property.
   * @param {string} file - The file to read BSON data from.
   */
  load(file) {
    fs.readFile(file, (err, data) => {
      if (err) throw err;
      _.merge(this.data, BSON.deserialize(data));
      this.save();
    });
  }

  save() {
    if (this.filePath) {
      fs.writeFileSync(this.filePath, BSON.serialize(this.data));
    }
  }

  /**
   * Checks params.
   * @private
   * @param {string} key 
   * @param {any} value 
   * @returns {boolean}
   */
  checkparams(key, value) {
    if (typeof key !== 'string') {
      throw new TypeError('The "key" parameter must be a string.');
    } else if (key.length === 0) {
      throw new Error('The "key" parameter cannot be empty.');
    }
    if (!value) {
      throw new Error('The "value" parameter cannot be empty.');
    }
    return true;
  }
}
