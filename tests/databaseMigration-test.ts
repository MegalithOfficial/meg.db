import { DatabaseMigration } from "../src/utils/databaseMigration";
import { Megdb, JSONDriver } from "../src/main";
import { QuickDB } from "quick.db";

const megdb = new Megdb({ driver: new JSONDriver({ filePath: "./megdb-migration" }) });
const quickdb = new QuickDB();

const migration = new DatabaseMigration(megdb);

async function run() {

    quickdb.set(`hi`, `Hello, world!`);
    quickdb.set(`array`, [1, undefined, "hi", true]);

    migration.move(await quickdb.all());

    console.log(megdb.all());
}
run();