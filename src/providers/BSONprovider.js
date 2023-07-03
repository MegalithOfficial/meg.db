import { BSON } from 'bson';
import fs from 'fs';
import _ from 'lodash';

export class BSONprovider {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { Schemas: {}, default: {} };

    if (filePath && fs.existsSync(filePath)) {
      this.read(filePath);
    }
  }

  setSchema(schemaName, schema) {
    _.set(this.data, ['Schemas', schemaName], schema);
  }

  set(key, value) {
    const schema = this.getSchema(key);
    if (schema) {
      schema.validate(value);
    }
    _.set(this.data, ['default', key], value);
    this.save();
  }

  get(key) {
    return _.get(this.data, ['default', key]);
  }

  delete(key) {
    _.unset(this.data, ['default', key]);
    this.save();
  }

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

  push(key, value) {
    const array = this.get(key) || [];
    array.push(value);
    this.set(key, array);
  }

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

  deleteAll() {
    this.data.default = {};
    this.save();
  }

  all() {
    return this.data.default;
  }

  getSchema(schemaName) {
    return _.get(this.data, ['Schemas', schemaName]);
  }

  read(file) {
    const data = fs.readFileSync(file);
    this.data = BSON.deserialize(data);
  }

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
}

/*const db = new BSONprovider("./data.bson");
db.set("hi", "hello!");
console.log(db.get("hi"))
console.log(db.all())*/