<p align="center">
  <a href="https://github.com/MegalithOfficial/meg.db">
    <img src="https://raw.githubusercontent.com/MegalithOfficial/meg.db/main/Images/megdb-round.png" alt="megdb" style="border-radius: 50%;" width="300" height="300">
  </a>
</p>
<h1 align="center">meg.db - lightweight, fast, and efficient Database module</h1>

🚀 **meg.db** is a lightweight, fast, and efficient BSON (Binary JSON), JSON, and BIN database module for JavaScript and Typescript. It provides a simple interface to store and retrieve data using files. The module is designed to be efficient, ensuring optimal performance for your database operations.

## Features

- **Lightweight**: Engineered for minimal footprint and low resource usage. 🪶
- **Fast**: Optimized for efficient data storage and retrieval operations. ⚡
- **Efficient**: Utilizes efficient algorithms and data structures for optimal performance. 🏎️
- **User-Friendly**: Offers an intuitive interface for smooth interaction with the database. 🤝
- **ESM and CJS Support**: Compatible with ESM Projects, CJS projects and Typescript projects for modern JavaScript development. 📦
- **Database Migration**: Seamlessly migrate data from other databases to **meg.db**. 🔄
- **Backup Feature**: Create backups with ease and customize options such as time, timezone, and folder path. 📂🗄️
- **Temporary Data set**: Create and manage short-term data conveniently without clutter. 🗃️
- **Garbage Collector**: Automatically removes expired or unused temporary data for a clean, optimized database. 🗑️
### Click here to go [Meg.db Documents](https://megdb.js.org/)

## Installation

**meg.db** is designed to work seamlessly with Node.js v14 and above. While it is compatible with Node.js v14 and newer versions, we strongly recommend using the latest available version of Node.js to ensure you benefit from the latest features, performance enhancements, and security updates.

You can easily install **meg.db** using npm:

```shell
npm install meg.db
```

## Usage

To incorporate **meg.db** into your JavaScript/Typescript project, import the required classes and create an instance of the desired driver, such as `BSONDriver`, `BINDriver` or `JSONDriver` Here are a few examples:

```javascript
// For ESM/Typescript
import { Megdb, BSONDriver, JSONDriver, BINDriver } from "meg.db";
// or CJS
const { Megdb, BSONDriver, JSONDriver, BINDriver } = require("meg.db");

const dbbson = new Megdb({ driver: new BSONDriver({ filePath: "./megdb.bson" }) });
const dbjson = new Megdb({ driver: new JSONDriver({ filePath: "./megdb.json" }) });
const dbbin = new Megdb({ driver: new BINDriver({ filePath: "./megdb.bin" }) });

```

### Simple Examples

Key-value pairs can be easily set and retrieved using the `set` and `get` methods:

```javascript
dbbson.set('key1', 'value1');
console.log(dbbson.get('key1')); // Output: value1

dbjson.push('array1', ["hi", "hello", 1, null, true ]);
console.log(dbjson.get('array1')); // Output: ["hi", "hello", 1, null, true]
dbjson.pull('array1', "hello");
console.log(dbjson.get('array1')); // Output: ["hi", 1, null, true]

// And more...
```

## Backup Feature

With **meg.db**, you can effortlessly create backups with a variety of options. Using the built-in cronJob pattern, you can set the time, timezone, and backup folder path.

```javascript

const dbjson = new Megdb({
  driver: new JSONDriver({
  filePath: "./megdb.json",
  backupOptions: {
    enabled: true,
    timezone: "Europe/Istanbul",
    CronJobPattern: "0 00 20 * * *",
    folderPath: "./backups"
  }
 })
});

// Your code ...

```

## Garbage Collector and TTL

Utilize Time-To-Live (TTL) for auto-deletion of temporary data:

```javascript
// Set data to auto-delete in 10 seconds
dbjson.set("hello", "Hi! this will be deleted in 10 seconds!", 10 * 1000);

// Use Callbacks
dbjson.set("hello", "Hi! this will be deleted in 30 seconds!", 30 * 1000, (key, value) => {
  console.log(key + " deleted.");
});
```

or Implement Garbage Collector to manage expired data:

```javascript
const dbjson = new Megdb({
  driver: new JSONDriver({
    filePath: "./megdb.json",
    garbageCollection: {
      enabled: true,
      interval: 1000
    },
 })
});

dbjson.set("Hello", "This won't be deleted");
dbjson.set("Hello2", "This will be deleted in 10 seconds", 10 * 1000); // 10 seconds

// Manually trigger Garbage Collection
dbjson.runGarbageCollection();
```

These methods enable automatic data deletion after a specified time and efficient management of expired data through the Garbage Collector. 🕒✨

## Database Migration

**meg.db** allows you to seamlessly move data from other databases. Here's an example using the quick.db library:

```javascript

import { Megdb, BSONDriver, DatabaseMigration } from "meg.db"; // Version: 3.0.0
import { QuickDB } from "quick.db"; // Version: 9.1.7

const megdb = new Megdb({ driver: new BSONDriver({ filePath: "./megdb.bson" }) });
const migration = new DatabaseMigration(megdb);
const quickdb = new QuickDB();

quickdb.set(`hi`, `Hello, world!`);
quickdb.set(`array`, [1, undefined, "hi", true]);
migration.move(await quickdb.all());

console.log(megdb.all()) // Map(2) { 'hi' => 'Hello, world!', 'array' => [1, undefined, "hi", true] }

```

## License

This module is open source and available under the [Apache 2.0 License](http://www.apache.org/licenses/LICENSE-2.0).

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please don't hesitate to open an issue or submit a pull request on the [GitHub repository](https://github.com/MegalithOffical/meg.db/issues).