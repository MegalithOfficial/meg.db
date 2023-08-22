import { BSONProvider, DatabaseMigration, JSONProvider, NBTProvider } from "../src/main";

const nbtdb = new NBTProvider({ filePath: "./megdb.nbt", useExperimentalSaveMethod: true, backupOptions: { timezone: "Europe/Istanbul", enabled: true, CronJobPattern: "0 0 0 * * *", folderPath: "./backups" } })
const jsondb = new JSONProvider({ filePath: "./megdb.json", useExperimentalSaveMethod: true, backupOptions: { timezone: "Europe/Istanbul", enabled: true, CronJobPattern: "0 0 0 * * *", folderPath: "./backups" } })
const bsondb = new BSONProvider({ filePath: "./megdb.bson", useExperimentalSaveMethod: true, backupOptions: { timezone: "Europe/Istanbul", enabled: true, CronJobPattern: "0 0 0 * * *", folderPath: "./backups" } })

function Benchmark(name: any, fn: any): void {
  const start = process.hrtime();

  for (let i = 0; i < 1000; i++) fn(i);
  const end = process.hrtime(start);
  const elapsedTime = ((end[0] * 1e9 + end[1]) / 1e6).toFixed(0);

  return console.log(`${name}: ${elapsedTime}ms (1000 runs sampled.)`);
}


//@ts-ignore
Benchmark('meg.db-nbt', (i) => {
  //@ts-ignore
  nbtdb.set(`keyring-${i * 2}`, `${i}`)
});

Benchmark('meg.db-json', (i) => {
  //@ts-ignore
  jsondb.set(`keyring-${i * 2}`, `${i}`)
});

Benchmark('meg.db-bson', (i) => {
  //@ts-ignore
  bsondb.set(`keyring-${i * 2}`, `${i}`)
});

