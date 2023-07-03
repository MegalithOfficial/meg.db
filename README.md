# meg.db

meg.db is a lightweight, fast, and efficient BSON (Binary JSON) database module for JavaScript. It provides a simple interface to store and retrieve data using BSON files. The module is designed to be efficient, ensuring optimal performance for your database operations.

## Installation

You can install meg.db using npm:

```shell
npm install meg.db
```

## Usage

To use meg.db in your JavaScript project, import the necessary classes and instantiate a `BSONprovider` object with the path to your BSON file:

```javascript
import { BSONProvider } from "meg.db";

const db = new BSONProvider('./data.bson');
```

### Simple Examples

You can set and retrieve key-value pairs using the `set` and `get` methods:

```javascript
db.set('key1', 'value1');
console.log(db.get('key1')); // Output: value1

db.push('array1', ["hi", "hello", 1, null, true ])
console.log(db.get('array1')); // Output: ["hi", "hello", 1, null, true]
db.pull('array1', "hello");
console.log(db.get('array1')); // Output: ["hi", 1, null, true]

// And more...
```

## Features

- **Lightweight**: Designed to have a minimal footprint and low resource usage.
- **Fast**: Optimized for efficient data storage and retrieval operations.
- **Efficient**: Utilizes efficient algorithms and data structures for optimal performance.
- **Easy to use**: Provides a simple and intuitive interface for working with the database.
- **ESM support**: Supports ES modules for modern JavaScript development.

### Database Schemas

Module also supports optional schema validation using the `BSONSchema` class. You can define a schema to enforce a specific structure and data types for a collection, but it is not mandatory.

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

If a schema is defined, meg.db will validate the data against the schema when setting values. If the data does not conform to the schema, an error will be thrown. However, if no schema is defined, no validation will be performed.

## License

This module is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request on the [GitHub repository](https://github.com/MegalithOffical/meg.db/issues).
