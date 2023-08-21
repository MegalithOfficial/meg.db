import { JSONProvider, BSONProvider, NBTProvider } from "../main.js";

export class DatabaseMigration {

  /**
   * Class of Database Migration.
   * @param {JSONProvider | BSONProvider | NBTProvider} database Meg.db Database Provider.
   */
  constructor(database) {
    if (!database) throw new Error("No database class not found.");
    
    if (database instanceof JSONProvider || database instanceof BSONProvider || database instanceof NBTProvider) this.database = database
    else throw new Error("Meg.db database class not found.");
  };

  /**
   * Moves Data from other databases to meg.db.
   * @param {{
   *   data: Object | Object[] | Map, 
   *   databaseType: "quick.db" | "wio.db" | "inflames.db" | "all.db" | "ark.db" | "lowdb" | "file-system-db" | "croxy.db" | "Object/Map" | "meg.db"
   *  }} opt 
   * @returns {boolean} Returns true if the operation is successful.
   */
  move(opt = { data, databaseType: "quick.db" }) {
    const { data, databaseType } = opt;

    if (databaseType === "quick.db") {
      if (typeof data !== "object" || Array.isArray(data)) throw new Error("For quick.db, data should be an array.");

      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const entry = data[key];
          if (!entry.id || !entry.value) throw new Error("Each entry in data should have id and value properties.");

          this.database.set(entry.id, entry.value);
        }
      }
      return true;

    } else if (
      databaseType === "wio.db"
      || databaseType === "inflames.db"
      || databaseType === "all.db"
      || databaseType === "ark.db"
      || databaseType === "lowdb"
      || databaseType === "file-system-db"
      || databaseType === "croxy.db"
    ) {

      if (Array.isArray(data)) {
        for (const entry of data) {
          if (!entry.ID || !entry.value) throw new Error(`Each entry in data should have "ID" and "value" properties.`);
          
          this.database.set(entry.ID, entry.value);
        }

      } else if (typeof data === "object") {
        for (const key in data) {
            const value = data[key];
            this.database.set(key, value);
        }
      } else {
        throw new Error(`Unsupported data format for ${databaseType}.`);
      }
    } else if (databaseType === "Object/Map") {

      if (data instanceof Map) {
        for (const [key, value] of data) {
          this.database.set(key, value);
        }
        
        return true;
      } else if (data instanceof Object) {

        for (const key in data) {
            const value = data[key];
            this.database.set(key, value);
        }

        return true;
      } else {
        throw new Error(`Unsupported data format.`);
      }
    } else {
      throw new Error("Unsupported database type. If your current Database Module is missing, please open an issue on the GitHub page.");
    };
  };
};