import { Megdb, JSONDriver, BSONDriver, BINDriver } from "../src/main";

const drivers = [JSONDriver, BSONDriver, BINDriver];

const dbs = drivers.map((Driver, i) => ({
    db: new Megdb({ driver: new Driver({ filePath: "./megdb-benchmark" }) }),
    name: `MegDB ${drivers[i].name}`,
}));

const testCases = Array.from({ length: 1000 }, (_, i) => ({
    key: `key${i}`,
    value: `value${Math.random().toString(36).substring(1)}`,
}));

interface BenchmarkResult {
    name: string;
    time: number;
    ops: number;
}

async function benchmark(database: Megdb, name: string): Promise<BenchmarkResult> {
    await database.deleteAll();
    const start = Date.now();

    for (const testCase of testCases) {
        await database.set(testCase.key, testCase.value);
    }

    const end = Date.now();
    const time = end - start;
    const ops = testCases.length / (time / 1000);
    return { name, time, ops };
}

async function runBenchmarks(): Promise<void> {
    const results: BenchmarkResult[] = [];

    for (const { name, db } of dbs) {
        const result = await benchmark(db, name);
        results.push(result);
    }

    results.sort((a, b) => a.time - b.time);

    const tableData = results.map(({ name, time, ops }, index) => ({
        Database: name,
        'Time (ms)': time,
    }));

    console.log("Benchmark Results:");
    console.table(tableData);
}

runBenchmarks();