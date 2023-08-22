import { JSONProvider, BSONProvider, NBTProvider } from "./main";
import DatabaseError from "./DatabaseError";

export class DatabaseMigration {

  private database: JSONProvider | BSONProvider

  /**
   * Class of Database Migration.
   */
  constructor(database: JSONProvider | BSONProvider) {
    if (!database) throw new DatabaseError({ message: "No database class not found.", expected: typeof this, received: typeof database });

    if (database instanceof JSONProvider || database instanceof BSONProvider) this.database = database;
    else throw new DatabaseError({ message: "Meg.db database class not found.", expected: "JSONProvider or BSONProvider or NBTProvider", received: typeof database })
  };

  move(data: Map<any, any> | object | Array<object>): boolean {
    const map = this.toMap(data);
    for (const [key, value] of map) {
      if(!key) new DatabaseError({ message: "Unexpected Error happened while saving Converted data into Database.", expected: "string", received: undefined })
      this.database.set(key, value);
    }
    return true;
  };

  private toMap(input: Map<any, any> | object | Array<object>): Map<any, any> {
    let map = new Map<any, any>();

    if (Array.isArray(input)) {
      for (let index = 0; index < input.length; index++) {
        let item = input[index];
        if (typeof item !== 'object' && item === null) new DatabaseError({ message: "Unexpected Error happened while converting item Data into Map.", expected: "object", received: typeof item });

        const keys = Object.keys(item);
        const idKey = keys.find(key => ['id', 'ID', 'Id'].includes(key));

        if (idKey && keys.includes('value')) map.set(item[idKey], item.value);
        else throw new DatabaseError({ message: "Unexpected Error happened while converting Data into Map." })
      }
    } else if (input instanceof Map) {
      for (let [key, value] of input.entries()) {
        if (typeof value === 'object' && value !== null) {
          map.set(key, this.toMap(value));
        } else {
          map.set(key, value);
        }
      }
    } else if (typeof input === 'object' && input !== null) {
      for (let key in input) {
        if (input.hasOwnProperty(key)) {
          if (typeof input[key] === 'object' && input[key] !== null) {
            map.set(key, this.toMap(input[key]));
          } else {
            map.set(key, input[key]);
          }
        }
      }
    }

    return map;
  };


};