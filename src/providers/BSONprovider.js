import BSON from 'bson-ext';
import fs from 'graceful-fs';
import _get from 'lodash.get';
import _set from 'lodash.set';
import _unset from 'lodash.unset';
import _has from 'lodash.has';
import _merge from 'lodash.merge';

export class BSONProvider {

  /**
   * Constructs a new instance of the BSONprovider class.
   * @param {string} filePath - The file path to read and save BSON data.
   */
  constructor(filePath) {
    this.filePath = filePath ?? "./megdb.bson";
    this.data = {
      Schemas: new Map(),
      default: new Map(),
    };
    this.cache = new Map();

    if (filePath && fs.existsSync(filePath)) {
      this.read(filePath);
    } else {
      this.save();
    }
  }

  /**
   * @private
   * Sets the schema for a given schema name.
   * @param {string} schemaName - The name of the schema.
   * @param {object} schema - The schema object.
   */
  setSchema(schemaName, schema) {
    //this.checkparams(schemaName, schema);
    this.data.Schemas.set(schemaName, schema); // Use Map.set() to set schema
    this.save(); // Save after updating the schema
  }

  /**
   * Sets a key-value pair in the default data object.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   */
  set(key, value) {
    //this.checkparams(key, value);
    const schema = this.getSchema(key);
    if (schema) {
      schema.validate(value);
    }
    this.data.default.set(key, value); // Use Map.set() to set the key-value pair
    this.cache.set(key, value); // Cache the updated value
    this.save(); // Save after updating the data
  }

  /**
   * Retrieves the value associated with the specified key from the default data object.
   * @param {string} key - The key to retrieve the value for.
   * @returns {any} The value associated with the key.
   */
  get(key) {
    //this.checkparams(key, 'get');
    if (this.cache.has(key)) {
      return this.cache.get(key); // Return cached value if available
    }
    const value = this.data.default.get(key); // Use Map.get() to retrieve the value
    this.cache.set(key, value); // Cache the value for future use
    return value;
  }


  /**
   * Deletes the key-value pair associated with the specified key from the default data object.
   * @param {string} key - The key to delete.
   */
  delete(key) {
   // this.checkparams(key, 'delete');
    this.data.default.delete(key); 
    this.cache.delete(key); 
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
    const lowerCaseType = type.toLowerCase();
    if (lowerCaseType === 'default') this.data.default = {};
    else if (lowerCaseType === 'schemas') this.data.Schemas = {};
    else throw new Error(`Unknown type: ${type}. Valid types: schemas, default`);

    this.cache = new Map();
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
    if (!data.constructor) throw new Error('Invalid database class.');
    const datas = data.all() || data.getAll();
    for (let key in datas) {
      this.set(key, datas[key]);
    }
    return true;
  }

  /**
   * @private
   * Retrieves the schema associated with the specified schema name.
   * @param {string} schemaName - The name of the schema.
   * @returns {object} The schema associated with the schema name.
   */
  getSchema(schemaName) {
    return _get(this.data, ['Schemas', schemaName]);
  }

  /**
   * Reads BSON data from a file and assigns it to the data property.
   * @param {string} file - The file to read BSON data from.
   */

  read(file) {
    const data = fs.readFileSync(file, { encoding: 'utf8' });
    _merge(this.data, BSON.deserialize(data))
  }


  save() {
    if (this.filePath) {
      const data = BSON.serialize(this.data)
      fs.writeFileSync(this.filePath, data);
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