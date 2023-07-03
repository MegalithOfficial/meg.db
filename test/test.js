import { BSONprovider, BSONSchema } from "../src/main.js"

const db = new BSONprovider('./data.bson');

db.set('key1', 'value1');
const value = db.get('key1');
console.log(value);

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
}
