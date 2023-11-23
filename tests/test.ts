import { Megdb, JSONDriver, BSONDriver, BINDriver } from "../src/main";

const drivers = [JSONDriver, BSONDriver, BINDriver];
const dbs = drivers.map(driver => new Megdb({ driver: new driver({ filePath: "./megdb-test" }) }));

const keyToEnter = "key1";
const valueToEnter = "test_value";

const testCases = [
    { key: "key1", value: { name: "test", age: 30 } },
    { key: "key2", value: { name: "test", address: { city: "test_city", country: "test_country" } } }
];

let queue: Array<() => void> = [];

dbs.forEach((db, i) => {
    queue.push(() => {
        console.log(`\n------ Database ${i} ------`);
        db.set(keyToEnter, valueToEnter);
        const value = db.get(keyToEnter);
        console.log(`🔑 Key: ${keyToEnter}`);
        console.log(`📝 Value: ${value}`);
        console.log(`✅ Is value correct? ${value === valueToEnter}`);
    });
});

testCases.forEach(testCase => {
    dbs.forEach((db, i) => {
        queue.push(() => {
            console.log(`\n------ Database ${i}, Key ${testCase.key} ------`);
            db.set(testCase.key, testCase.value);
            const value = db.get(testCase.key);
            console.log(`🔑 Key: ${testCase.key}`);
            console.log(`📝 Value: ${JSON.stringify(value, null, 2)}`);
            console.log(`✅ Is value correct? ${JSON.stringify(value) === JSON.stringify(testCase.value)}`);
        });
    });
});

while (queue.length > 0) {
    const task = queue.shift();
    if (task) task();
};