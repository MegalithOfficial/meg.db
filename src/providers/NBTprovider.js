
import fs from 'graceful-fs';
import _get from 'lodash.get';
import _set from 'lodash.set';
import _unset from 'lodash.unset';
import _has from 'lodash.has';
import _merge from 'lodash.merge';
import JSONStream from 'JSONStream';
import { Transform } from 'node:stream';
import nbt from "prismarine-nbt";
import { kMaxLength } from 'node:buffer';
import { inspect } from 'node:util';

export class NBTProvider {

  /**
   * Constructs a new instance of the BSONprovider class.
   * @param {string} filePath - The file path to read and save NBT data.
   */
  constructor(filePath) {
    this.filePath = filePath ?? "./megdb.nbt";
    this.data = {
      values: {}
    }
    this.cache = {};

    if (filePath && fs.existsSync(filePath)) {
      this.read(filePath);
    } else {
      let data = {
        type: nbt.TagType.Compound,
        name: '',
        value: {}
      }
      const buffer = nbt.writeUncompressed(data);
      fs.writeFileSync(filePath, buffer);    
    }
  };

  /**
    * Sets a key-value pair in the default data object.
    * @param {string} key - The key to set.
    * @param {any} value - The value to set.
    */
  set(key, value) {
    this.checkparams(key);
    _set(this.data, ['values', key], value);
    this.cache[key] = value;
    this.save();
  }

  /**
   * Retrieves the value associated with the specified key from the default data object.
   * @param {string} key - The key to retrieve the value for.
   * @returns {any} The value associated with the key.
   */

  get(key) {
    this.checkparams(key);
    if (key in this.cache) {
      return this.cache[key];
    }
    const value = _get(this.data, ['values', key]);
    this.cache[key] = value;
    return value;
  }

  /**
   * Deletes the key-value pair associated with the specified key from the default data object.
   * @param {string} key - The key to delete.
   */
  delete(key) {
    this.checkparams(key, 'delete');
    _unset(this.data, ['values', key]);
    delete this.cache[key];
    this.save();
  }

  /**
   * Filters the default data object based on the provided callback function.
   * @param {function} callback - The callback function that determines whether to include a key-value pair in the filtered data.
   * @returns {object} The filtered data object.
   */
  filter(callback) {
    const filteredData = {};
    for (const key in this.data.values) {
      const value = this.data.values[key];
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
  deleteAll() {
    this.data.values = {};
    this.cache = {};
    this.save();
  }


  /**
   * Retrieves all key-value pairs from the default data object.
   * @returns {object} The default data object.
   */
  all() {
    return this.data.values;
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
   * Reads JSON data from a file and assigns it to the data property.
   * @param {string} file - The file to read JSON data from.
   */
  read(file) {
    const rawData = fs.readFileSync(file);
    let parsedData = nbt.parseUncompressed(rawData);
    let simplified = nbt.simplify(parsedData)
    _set(this.data, ["values"], simplified);
  }

  /**
   * Converts Object into NBT formatted Object.
   * @param {Object} data 
   * @returns {Object} The converted object.
   */
  convertToNbtFormat(data) {
    const nbtData = {
      type: nbt.TagType.Compound,
      name: '',
      value: {},
    };
  
    for (const [key, value] of Object.entries(data["values"])) {
      let nbtValue = this.toNBT(value);
      //console.log(nbtValue)
      nbtData.value[`${key}`] = nbtValue;
    }
  
    return nbtData;
  }

  /**
   * Converts any data completely to NBT format
   * @param {any} value 
   * @returns {nbt.NBT} The converted object.
   */
  toNBT(value) {
    const getTypeAndValue = (val) => {
      let type;
      let newValue = val;
  
      switch (typeof val) {
        case "string":
          type = nbt.TagType.String;
          break;
    
        case "number":
          if (!isNaN(value) && Number.isInteger(value)) {
            type = nbt.TagType.Int;
          } else if (!isNaN(value)) {
            type = nbt.TagType.Float
          } else {
            throw new TypeError("Number data cannot be NaN")
          }
          break;
    
        case "boolean":
          type = nbt.TagType.Byte;
          newValue = Number(val);
          break;
    
        case "object":
          if (val === null) {
            throw new TypeError("Data cannot be null.")
          } else if (Array.isArray(val)) {

          if (val.every((e) => typeof e !== typeof val[0])) {
              throw new TypeError("All elements in the array must have the same type.");
          }
            if (typeof val[0] === "object") {
              newValue = val.map((e) => this.toNBT(e).value);
            }
            newValue = { type: this.toNBT(val[0]).type, value: newValue };
            type = nbt.TagType.List;

          } else if (val instanceof Map) {

            const entries = Array.from(val.entries()).map(([k, v]) => [k, this.toNBT(v)]);
            newValue = Object.fromEntries(entries);
            type = nbt.TagType.Compound;

          } else if (val instanceof Set) {

            const array = Array.from(val);
            if (array.every((e) => typeof e !== typeof array[0])) {
              throw new TypeError("All elements in the set must have the same type.");
            }
            if (typeof array[0] === "object") {
              newValue = array.map((e) => this.toNBT(e).value);
            }
            newValue = { type: this.toNBT(array[0]).type, value: newValue };
            type = nbt.TagType.List;

          } else if (val instanceof RegExp) {

            newValue = String(val);
            type = nbt.TagType.String;

          } else if (val instanceof Object) {

            const entries = Object.entries(val).map(([k, v]) => [k, this.toNBT(v)]);
            newValue = Object.fromEntries(entries);
            type = nbt.TagType.Compound;

          }
          break;

          case "undefined":
            throw new TypeError("Data cannot be undefined.")
      }
  
      return { type, value: newValue };
    };
  
    return getTypeAndValue(value);
  }
  

  /**
   * Asynchronously saves JSON data.
   * @param {string} file - The file to save JSON data.
   */
  async save() {
    const nbtData = this.convertToNbtFormat(this.data);
    const buffer = nbt.writeUncompressed(nbtData);
    fs.writeFile(this.filePath, buffer, (error) => {
      if (error) {
        throw error;
      }
    });
  }
  /**
   * Checks params.
   * @private
   * @param {string} key 
   * @param {any} value 
   * @returns {boolean}
   */
  checkparams(key) {
    if (typeof key !== 'string') {
      throw new TypeError('The "key" parameter must be a string.');
    } else if (key.length === 0) {
      throw new Error('The "key" parameter cannot be empty.');
    }
  
    return true;
  };
};