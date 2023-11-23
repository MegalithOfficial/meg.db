import { Megdb } from "../baseDriver";
import { clogUtils } from "../main";
import DatabaseError from "./DatabaseError";

export class DatabaseMigration {

    private database!: Megdb;

    /**
     * Creates an instance of DatabaseMigration.
     * @param {Megdb} database - The Megdb instance to be used for migration.
     */
    constructor(database: Megdb) {

        // Checks if the provided database is valid.
        if (!database) {
            clogUtils.error(new DatabaseError({ message: "No database class not found.", expected: typeof this, received: typeof database }).toString())
            return;
        };

        // Assigns the database instance if it is an instance of Megdb.
        if (database instanceof Megdb) {
            this.database = database;
        } else {
            clogUtils.error(new DatabaseError({ message: "Meg.db database class not found.", expected: "Megdb", received: typeof database }).toString())
            return;
        };
    };

    /**
     * Moves data from the provided structure to the Megdb database.
     * @param {Map<any, any> | object | Array<object>} data - The data to be migrated.
     * @returns {boolean} - Returns true if the migration is successful.
     */
    move(data: Map<any, any> | object | Array<object>): boolean {
        // Converts the input data to a Map and saves it to the Megdb database.
        const map = this.toMap(data);
        for (const [key, value] of map) {
            if (!key) clogUtils.error(new DatabaseError({ message: "Unexpected Error happened while saving Converted data into Database.", expected: "string", received: undefined }).toString())
            this.database.set(key, value);
        }
        return true;
    };

    /**
     * Converts various data structures to a Map.
     * @param {Map<any, any> | object | Array<object>} input - The input data to be converted.
     * @returns {Map<any, any>} - The converted Map.
     * @private
     */
    private toMap(input: Map<any, any> | object | Array<object>): Map<any, any> {
        let map = new Map<any, any>();

        // Handles conversion based on the type of input.
        if (Array.isArray(input)) {
            for (let index = 0; index < input.length; index++) {
                let item = input[index];
                if (typeof item !== 'object' && item === null) {
                    clogUtils.error(new DatabaseError({ message: "Unexpected Error happened while converting item Data into Map.", expected: "object", received: typeof item }).toString())
                    return map;
                };

                const keys = Object.keys(item);
                const idKey = keys.find(key => ['id', 'ID', 'Id'].includes(key));

                if (idKey && keys.includes('value')) {
                    map.set(item[idKey], item.value)
                } else {
                    clogUtils.error(new DatabaseError({ message: "Unexpected Error happened while converting Data into Map." }).toString())
                    return map;
                };
            };

        } else if (input instanceof Map) {
            for (let [key, value] of input.entries()) {
                if (typeof value === 'object' && value !== null) {
                    map.set(key, this.toMap(value));
                } else {
                    map.set(key, value);
                }
            }
        } else if (typeof input === 'object' && input !== null) {
            for (let key in input) {
                if (input.hasOwnProperty(key)) {
                    if (typeof input[key] === 'object' && input[key] !== null) {
                        map.set(key, this.toMap(input[key]));
                    } else {
                        map.set(key, input[key]);
                    }
                }
            }
        }

        return map;
    };


};