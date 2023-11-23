import { Megdb, JSONDriver } from "../src/main";

const megdb = new Megdb({ driver: new JSONDriver({ filePath: "./megdb-test" }), garbageCollection: { enabled: true, interval: 4000 } });
console.log(megdb.get("test"))
megdb.delete("test")