import { BSONProvider, NBTProvider, JSONProvider, DatabaseMigration, DatabaseTypes } from "../src/main.js"

const dbjson = new JSONProvider({ 
  filePath: "./data.json", 
  useExperimentalSaveMethod: true,
  backupOptions: {
    enabled: true,
    timezone: "Europe/Istanbul",
    CronJobPattern: "0 05 19 * * *",
    folderPath: "./backups"
  }
});

const dbbson = new BSONProvider({ filePath: "./data.bson", useExperimentalSaveMethod: true });
const dbnbt = new NBTProvider({ filePath: "./data.nbt", useExperimentalSaveMethod: true });

const migrate = new DatabaseMigration(dbjson); 


dbbson.set(`hi`, "hello!")
migrate.move({ data: dbbson.all(), databaseType: "quick.db" })
console.log(dbjson.all())


/*db.set('key1', 'value1');
const value = db.get('key1');
console.log(value);
*/

/*
// Schema
const userSchema = new BSONSchema('./data.bson', {
  name: { type: 'string', required: true },
  age: { type: 'number', required: true },
  email: { type: 'string', required: false },
});
db.setSchema('user', userSchema);

db.set('user', { name: 'John Doe', age: 30, email: 'johndoe@example.com' });
const data = db.get("user");
console.log(data)

try {
  db.set('user', { name: 'Jane Doe' });
} catch (error) {
  console.error(error.message); 
}*/