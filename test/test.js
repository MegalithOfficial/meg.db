import { BSONProvider, YAMLProvider, NBTProvider, JSONProvider } from "../src/main.js"
import benchmark from 'benchmark';

//import Database from 'hypr.db';

//const driver = new Database.YAMLDriver();
//const db = new Database({ driver });

const dbjson = new JSONProvider('./data.json');
const dbbson = new BSONProvider('./data.bson');
const dbyaml = new YAMLProvider('./data.yaml');
const dbnbt = new NBTProvider('./data.nbt');


function Benchmark(name, callback) {
  const start = performance.now();
  callback();
  const end = performance.now();

  return console.log(`${name}: ${(end - start).toFixed(0)}ms`);
};

Benchmark('meg.db-dbbson', () => {
    for (let i = 0; i < 500; i++) {
      dbbson.set(`keyring-${i}`, `${i}`);
    };
});

Benchmark('meg.db-dbyaml', () => {
  for (let i = 0; i < 500; i++) {
    dbyaml.set(`keyring-${i}`, `${i}`);
  };
});

Benchmark('meg.db-nbt', () => {
  for (let i = 0; i < 500; i++) {
    dbnbt.set(`keyring-${i}`, `${i}`);
  };
});

Benchmark('meg.db-json', () => {
    for (let i = 0; i < 500; i++) {
      dbjson.set(`keyring-${i}`, `${i}`);
    };
});

/*db.set('key1', 'value1');
const value = db.get('key1');
console.log(value);
*/
/*
// Benchmark
const { Suite } = benchmark;
const suite = new Suite('test');

suite.on('cycle', (event) => console.log(String(event.target)));
suite.on('complete', (event) => event.currentTarget.sort((a, b) => b.hz - a.hz).map((benchmark, index) => console.log(`${index + 1}. ${benchmark.name} - ${benchmark.hz.toFixed(3)}/ops`)));

suite.add('meg.db-json', () => {
  for (let i = 0; i < 500; i++) {
    dbjson.set(`keyring-${i}`, `${i}`);
    dbjson.get(`keyring-${i}`);
  }
});
suite.add('meg.db-bson', () => {
  for (let i = 0; i < 500; i++) {
    dbbson.set(`keyring-${i}`, `${i}`);
    dbbson.get(`keyring-${i}`);
  }
});

suite.run({ async: false })

// MS based Benchmark
function Benchmark(name, callback) {
  const start = performance.now();
  callback();
  const end = performance.now();

  return console.log(`${name}: ${(end - start).toFixed(0)}ms`);
};

Benchmark('meg.db-dbbson', () => {
  for (let i = 0; i < 500; i++) {
    dbbson.set(`keyring-${i}`, `${i}`);
    dbbson.get(`keyring-${i}`);
  }
});

Benchmark('meg.db-json', () => {
  for (let i = 0; i < 500; i++) {
    dbjson.set(`keyring-${i}`, `${i}`);
    dbjson.get(`keyring-${i}`);
  };
});

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