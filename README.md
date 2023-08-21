# meg.db

🚀 **meg.db** is a lightweight, fast, and efficient BSON (Binary JSON), JSON, and NBT database module for JavaScript. It provides a simple interface to store and retrieve data using BSON files. The module is designed to be efficient, ensuring optimal performance for your database operations.

## Features

- **Lightweight**: Engineered for minimal footprint and low resource usage. 🪶
- **Fast**: Optimized for efficient data storage and retrieval operations. ⚡
- **Efficient**: Utilizes efficient algorithms and data structures for optimal performance. 🏎️
- **User-Friendly**: Offers an intuitive interface for smooth interaction with the database. 🤝
- **ESM Support**: Compatible with ES modules for modern JavaScript development. 📦
- **Database Migration**: Seamlessly migrate data from other databases to **meg.db**. 🔄
- **Backup Feature**: Create backups with ease and customize options such as time, timezone, and folder path. 📂🗄️
- **Experimental Save Method**: An advanced saving method for improved performance (use with caution). 🔧⚙️

## Installation

You can easily install **meg.db** using npm:

```shell
npm install meg.db
```

## Usage

To incorporate **meg.db** into your JavaScript project, import the required classes and create an instance of the desired provider, such as `BSONProvider`, `JSONProvider`, or `NBTProvider`. Here are a few examples:

```javascript
import { BSONProvider, JSONProvider, NBTProvider } from "meg.db";

const bsonDB = new BSONProvider({ filepath: "./megdb.bson" });
const jsonDB = new JSONProvider({ filepath: "./megdb.json" });
const nbtDB = new NBTProvider({ filepath: "./megdb.nbt" });
```

### Simple Examples

Key-value pairs can be easily set and retrieved using the `set` and `get` methods:

```javascript
bsonDB.set('key1', 'value1');
console.log(bsonDB.get('key1')); // Output: value1

jsonDB.push('array1', ["hi", "hello", 1, null, true ]);
console.log(jsonDB.get('array1')); // Output: ["hi", "hello", 1, null, true]
jsonDB.pull('array1', "hello");
console.log(jsonDB.get('array1')); // Output: ["hi", 1, null, true]

// And more...
```

## Backup Feature

With **meg.db**, you can effortlessly create backups with a variety of options. Using the built-in cronJob pattern, you can set the time, timezone, and backup folder path.

```javascript
import { JSONProvider } from "meg.db";

const dbjson = new JSONProvider({ 
  filePath: "./data.json", 
  useExperimentalSaveMethod: true,
  backupOptions: {
    enabled: true,
    timezone: "Europe/Istanbul",
    CronJobPattern: "0 00 20 * * *",
    folderPath: "./backups"
  }
});

// Your code ...

```

## Experimental Save Method

All databases come equipped with an advanced saving method that offers significantly improved performance. However, this method is still in development, and while the chance of data loss is minimal, it's recommended to use it at your own risk.

### Activation:

You can enable this method by setting the `useExperimentalSaveMethod` option to `true`.

```javascript
import { JSONProvider } from "meg.db";

const megdb = new JSONProvider({ filepath: "./megdb.json", useExperimentalSaveMethod: true });

// Your code ...
```

## Database Migration

**meg.db** allows you to seamlessly move data from other databases. Here's an example using the quick.db library:

```javascript

import { JSONProvider, DatabaseMigration } from "meg.db";
import { QuickDB } from "quick.db";

const megdb = new JSONProvider({ filepath: "./megdb.json" });
const migration = new DatabaseMigration(megdb);
const quickdb = new QuickDB();

quickdb.set(`hi`, `Hello, world!`);
quickdb.set(`array`, [1, undefined, "hi", true]);
migration.move({ data: await quickdb.all(), databaseType: "quick.db" });

console.log(megdb.all()) // Map(2) { 'hi' => 'Hello, world!', 'array' => [1, undefined, "hi", true] }

```

### Database Schemas (Currently Disabled)

The module offers optional schema validation using the `BSONSchema` class. Schemas can enforce specific structures and data types for collections.

```javascript
import { BSONprovider, BSONSchema } from "meg.db";

const db = new BSONProvider('./data.bson');

const userSchema = new BSONSchema('./data.bson', {
  name: { type: 'string', required: true },
  age: { type: 'number', required: true },
  email: { type: 'string', required: false },
});
db.setSchema('user', userSchema);

db.set('user', { name: 'John Doe', age: 30, email: 'johndoe@example.com' });
console.log(db.get('user'));
```

## License

This module is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvement, please don't hesitate to open an issue or submit a pull request on the [GitHub repository](https://github.com/MegalithOffical/meg.db/issues).
