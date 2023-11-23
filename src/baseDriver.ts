import { DatabaseMap } from "./interfaces/DatabaseMap";
import { DriverOptions } from "./interfaces/DatabaseOptions";
import { DatabaseSignature, DefaultDriverOptions, GarbageCollectionOptions, clogUtils } from "./main";
import { BSONDriver } from "./providers/BSON";
import { JSONDriver } from "./providers/JSON";
import { BINDriver } from "./providers/BIN";
import DatabaseError from "./utils/DatabaseError";

export class Megdb<V extends DatabaseSignature<V> = DatabaseMap> {

    private cache: Record<string, any>;
    private data: Record<string, any>;
    private driver!: JSONDriver | BSONDriver | BINDriver;
    private garbageCollection: GarbageCollectionOptions | undefined;


    /**
     * Creates an instance of Megdb.
     * @param {DriverOptions} [opt=DefaultDriverOptions] - The options for configuring the database.
     */
    constructor(opt: DriverOptions = DefaultDriverOptions) {
        this.cache = {};
        this.data = {};

        // Validates and sets the database driver.
        if (!opt.driver) {
            clogUtils.error(new DatabaseError({ message: "Invalid Driver", expected: "JSONDriver, BSONDriver or BINDriver", received: typeof opt.driver }));
            return;
        };
        this.driver = opt.driver;
        this.data = this.driver.read();

        // Sets up garbage collection if specified in options.
        if (opt.garbageCollection) {
            this.garbageCollection = { enabled: opt.garbageCollection?.enabled, interval: opt.garbageCollection?.interval };
            setInterval(() => {
                this.runGarbageCollection();
            }, this.garbageCollection.interval);
        };
    };

    /**
     * Sets a value in the database.
     * @param {keyof V} key - The key for the value.
     * @param {any} value - The value to be stored.
     * @param {number} [expirationSeconds] - The expiration time for the value in seconds.
     * @returns {void}
     */
    public set<K extends keyof V>(key: K, value: any, expirationSeconds?: number): void {
        if (typeof key !== 'string') {
            clogUtils.error(new DatabaseError({ expected: 'string', received: typeof key }).toString());
            return;
        };

        const keys = key.split('.');
        let currentLevel = this.data;

        for (let i = 0; i < keys.length - 1; i++) {
            const nestedKey = keys[i];
            if (!currentLevel[nestedKey]) {
                currentLevel[nestedKey] = {};
            };
            currentLevel = currentLevel[nestedKey];
        };

        const lastKey = keys[keys.length - 1];
        if (!currentLevel[lastKey]) {
            currentLevel[lastKey] = {};
        };

        let expiration: number | boolean = false;
        if (expirationSeconds) {
            expiration = (Date.now() + expirationSeconds * 1000);
        };

        if (typeof value === 'object' && value !== null && value.hasOwnProperty('value') && value.hasOwnProperty('_expiration')) {
            currentLevel[lastKey].value = value.value;
            currentLevel[lastKey]._expiration = value._expiration;
        } else {
            currentLevel[lastKey].value = value;
            currentLevel[lastKey]._expiration = expiration;
        };

        this.cache[key] = currentLevel[lastKey];
        this.driver.save(this.data, this.cache);
    };

    /**
     * Sets a value in the database with a time-to-live (TTL) expiration.
     * @param {keyof V} key - The key for the value.
     * @param {V[K]} value - The value to be stored.
     * @param {number} ttl - The time-to-live in milliseconds.
     * @param {Function} [callback] - Callback function to be executed after the TTL expires.
     * @returns {void}
     */
    public setWithTTL<K extends keyof V>(key: K, value: V[K], ttl: number, callback?: Function): void {
        this.set(key, value);

        setTimeout(() => {
            if (callback) callback(key, value);
            this.delete(key as any);
        }, ttl);
    }

    /**
     * Retrieves a value from the database.
     * @param {keyof V} key - The key for the value.
     * @returns {any} The retrieved value.
     */
    public get<K extends keyof V>(key: K): any {
        if (typeof key !== 'string') {
            clogUtils.error(new DatabaseError({ expected: 'string', received: typeof key }).toString());
            return null;
        };

        const keys = key.split('.');
        let value;

        if (this.cache.hasOwnProperty(key)) {
            value = this.cache[key];
        } else {
            value = this.data;
            for (let i = 0; i < keys.length; i++) {
                if (value === undefined) {
                    return null;
                }
                value = value[keys[i]];
            }
            this.cache[key] = value;
        }

        return value && value.value ? value.value : value;
    };

    /**
     * Creates a snapshot of the current database state.
     * @returns {Record<string, V>} The snapshot of the database.
     */
    snapshot(): Record<string, V> {
        const snapshot: Record<string, V> = { ...this.data };

        for (const key in snapshot) {
            if (Object.prototype.hasOwnProperty.call(snapshot, key) && typeof snapshot[key] === 'object') {
                snapshot[key] = JSON.parse(JSON.stringify(snapshot[key]));
            };
        };

        return snapshot;
    };

    /**
     * Deletes a value from the database.
     * @param {string} path - The path to the value to be deleted.
     * @returns {void}
     */
    public delete(path: string): void {
        const pathParts = path.split('.');
        let currentPart = this.data;

        for (let i = 0; i < pathParts.length - 1; i++) {
            currentPart = currentPart[pathParts[i]];
        }

        delete currentPart[pathParts[pathParts.length - 1]];
    }

    /**
     * Filters the database based on a callback function.
     * @param {(key: any, value: V[keyof V]) => any} callback - The callback function for filtering.
     * @returns {any} The filtered data.
     */
    public filter<K extends keyof V>(callback: (key: any, value: V[K]) => any): any {
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(this.data)) {
            if (callback(key as any, value.value as any)) {
                filteredData[key] = value;
            };
        };
        return filteredData;
    };

    /**
     * Appends a value to an array in the database.
     * @param {keyof V} key - The key for the array.
     * @param {V[K]} value - The value to be appended.
     * @param {number} [expirationSeconds] - The expiration time for the array in seconds.
     * @returns {void}
     */
    public push<K extends keyof V>(key: K, value: V[K], expirationSeconds?: number): void {
        if (typeof key !== 'string') {
            clogUtils.error(new DatabaseError({ expected: 'string', received: typeof key }).toString());
            return;
        };

        let data = this.get(key);
        let array = data && data.value ? data.value : data || [];
        array.push(value);

        let expiration: number | boolean = false;
        if (expirationSeconds) expiration = (Date.now() + expirationSeconds * 1000);

        this.set(key, { value: array, _expiration: expiration });
    };

    /**
     * Removes a value from an array in the database.
     * @param {keyof V} key - The key for the array.
     * @param {V[K]} value - The value to be removed.
     * @returns {void}
     */
    public pull<K extends keyof V>(key: K, value: V[K]): void {
        if (typeof key !== 'string') {
            clogUtils.error(new DatabaseError({ expected: 'string', received: typeof key }).toString());
            return;
        };

        const array = this.get(key) || [];
        const index = array.indexOf(value);
        if (index > -1) {
            array.splice(index, 1);
            this.set(key, array);
        };
    };

    /**
     * Deletes all data from the database.
     * @returns {void}
     */
    public deleteAll(): void {
        this.data = {};
        this.cache = {};
        this.driver.save(this.data, this.cache);
    };

    /**
     * Retrieves all data from the database.
     * @returns {Record<string, any>} All data from the database.
     */
    public all(): Record<string, any> {
        return this.data;
    };

    /**
     * Runs garbage collection to remove expired data.
     * @returns {void}
     */
    public runGarbageCollection(): void {
        const now = Date.now();

        const checkExpiration = (obj: any, path: string) => {
            //console.log('Checking object:', obj, 'at path:', path);
            if (obj && typeof obj === 'object') {
                for (const k in obj) {
                    const newPath = path ? `${path}.${k}` : k;
                    //console.log('New path:', newPath, 'Value:', obj[k]);
                    if (k === '_expiration' && typeof obj[k] === 'number' && obj[k] < now) {
                        //console.log('Found expired object at path:', path);
                        this.delete(path.split('.')[0]);
                        return true;
                    } else if (obj[k] && typeof obj[k] === 'object') {
                        if (checkExpiration(obj[k], newPath)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };

        for (const key in this.data) {
            //console.log('Checking key:', key);
            checkExpiration(this.data[key], key);
        }

        //console.log('Saving data:', this.data);
        this.driver.save(this.data, this.cache);
    };

}