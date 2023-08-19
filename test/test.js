import { BSONProvider, NBTProvider, JSONProvider } from "../src/main.js"
import Benchmark from 'hyprbench';
import { QuickDB } from "quick.db";

const dbjson = new JSONProvider({ filePath: "./data.json", useExperimentalSaveMethod: true });
const dbbson = new BSONProvider({ filePath: "./data.bson", useExperimentalSaveMethod: true });
const dbnbt = new NBTProvider({ filePath: "./data.nbt", useExperimentalSaveMethod: true });

const qdb = new QuickDB(); 

const benchmark = new Benchmark();

benchmark.on('complete', (data) => {
  data.sort((a, b) => a.time - b.time);

  data.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name} - Performance: ${item.performance} / Time: ${item.time.toFixed(0)} Milisecond.`);
  });
});

benchmark.set('meg.db-json', () => {
  for (let i = 0; i < 500; i++) {
    dbjson.set(`keyring-${i}`, `${i}`);
  };
});

benchmark.set('meg.db-dbbson', () => {
    for (let i = 0; i < 500; i++) {
      dbbson.set(`keyring-${i}`, `${i}`);
    };
});

benchmark.set('meg.db-nbt', () => {
  for (let i = 0; i < 500; i++) {
    dbnbt.set(`keyring-${i}`, `${i}`);
  };
});

benchmark.set('meg.db-json', () => {
    for (let i = 0; i < 500; i++) {
      dbjson.set(`keyring-${i}`, `${i}`);
    };
});

benchmark.set('quick.db-sqlite', () => {
  for (let i = 0; i < 500; i++) {
    qdb.set(`keyring-${i}`, `${i}`);
  };
});

benchmark.run(2);

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