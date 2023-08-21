
import fs from 'graceful-fs';
import _get from 'lodash.get';
import _merge from 'lodash.merge';
import cron from "node-cron";

export class JSONProvider {

  /**
   * Constructs a new instance of the JSONprovider class.
   * @param {{filePath: string, useExperimentalSaveMethod: boolean, backupOptions: { enabled: boolean; CronJobPattern: string; folderPath: string; timezone: import("../global").Timezones }}} opt Options for JSONProvider
   */
  constructor(opt = { filePath: "./megdb.json", useExperimentalSaveMethod: false, backupOptions: { enabled: false, CronJobPattern: " 0 0 * * * *", timezone: "Europe/Istanbul", folderPath: "./backups" } }) {

    /**
     * @type {string} 
     * @readonly
     * @private
     */
    this.filePath = opt.filePath ?? "./megdb.json";

    /**
     * @type {Boolean}
     * @readonly
     * @private
     */
    this.useExperimentalSaveMethod = opt.useExperimentalSaveMethod ?? false;

    /**
     * Container for holding data, including schemas and default values.
     * @type {Object}
     * @property {Map<string, any>} Schemas - A map to store schema data.
     * @property {Map<string, any>} default - A map to store default data.
     * @private
     */
    this.data = {
      Schemas: new Map(),
      default: new Map(),
    };

    /**
     * @type {Map}
     * @private
     */
    this.cache = new Map();

    /**
     * @type {Object}
     * @private
     */
    this.backup = opt.backupOptions ?? { enabled: false, CronJobPattern: " * 0 0 * * *", timezone: "Europe/Istanbul", folderPath: "./backups" };

    /**
     * @type {null}
     * @private
     */
    this.timer = null;

    if (this.filePath && fs.existsSync(this.filePath)) {
      this.read(this.filePath);
    } else {
      this.save();
    }

    if (this.backup.enabled) {
      if (!cron.validate(this.backup.CronJobPattern)) throw new Error("Invalid Cronjob pattern.");

      cron.schedule(this.backup.CronJobPattern, () => {
        const sourceFileName = this.filePath.substring(this.filePath.lastIndexOf('/') + 1);
        const regex = /(.+)\.json$/;
        const match = sourceFileName.match(regex);

        if (!match) throw new Error("File name is not in the expected format.");

          const sourceNameWithoutExtension = match[1];
          const backupFileName = `backup-${sourceNameWithoutExtension}-${new Date().getTime()}.json`;
          const backupFilePath = `${this.backup.folderPath}/${backupFileName}`;

          try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            fs.mkdirSync(this.backup.folderPath, { recursive: true });
            fs.writeFileSync(backupFilePath, data, 'utf8');
          } catch (err) { throw new Error(err) };
    
      }, { timezone: this.backup.timezone });
    }
  };

  /**
   * Sets a key-value pair in the default data object.
   * @param {string} key - The key to set.
   * @param {any} value - The value to set.
   */
  set(key, value) {
    this.data.default.set(key, value);
    this.cache.set(key, value);
    this.save();
  }

  /**
   * Retrieves the value associated with the specified key from the default data object.
   * @param {string} key - The key to retrieve the value for.
   * @returns {any} The value associated with the key.
   */
  get(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = this.data.default.get(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Deletes the key-value pair associated with the specified key from the default data object.
   * @param {string} key - The key to delete.
   */
  delete(key) {
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
    this.data.default.clear();
    this.cache.clear();
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
  async move(data) {
    let datas = {};

    if (data instanceof Map) {
      datas = Object.fromEntries(data.entries());
    } else if (typeof data === 'object') {
      datas = data;
    } else {
      throw new Error('Invalid data type.');
    }

    for (const key in datas) {
      if (datas.hasOwnProperty(key)) {
        this.set(datas[key].id, datas[key].value);
      }
    }

    return true;
  };

  /**
   * Reads JSON data from a file and assigns it to the data property.
   * @param {string} file - The file to read JSON data from.
   */
  read(file) {
    const jsonData = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
    this.data.Schemas = new Map(Object.entries(jsonData.Schemas));
    this.data.default = new Map(Object.entries(jsonData.default));
    this.cache.clear();
  }

  /**
   * Asynchronously saves JSON data.
   */
  save() {
    if (this.useExperimentalSaveMethod) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.savetofile();
      }, 2000);

    } else this.savetofile();
  };

  /**
   * Asynchronously saves JSON data.
   * @private
   */
  savetofile() {
    if (this.filePath) {
      const dataToSave = {
        Schemas: Object.fromEntries(this.data.Schemas),
        default: Object.fromEntries(this.data.default),
      };
      const dataString = JSON.stringify(dataToSave);
      fs.writeFileSync(this.filePath, dataString, { encoding: 'utf8' });
    }
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