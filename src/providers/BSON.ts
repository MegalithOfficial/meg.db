import { BackupOptions, DatabaseSignature, clogUtils } from '../main';
import { DatabaseMap } from '../interfaces/DatabaseMap';
import DatabaseError from "../utils/DatabaseError";

import BSON from 'bson';
import fs from 'graceful-fs';
import cron from "cron";
import path from 'path';

export interface BSONDriverOptions {
    filePath: string;
    backup?: BackupOptions;
};

export class BSONDriver<V extends DatabaseSignature<V> = DatabaseMap> {

    private filePath: string;
    private backup?: BackupOptions;
    private timer: NodeJS.Timeout | null;

    /**
     * Creates an instance of BSONDriver.
     * @param {BSONDriverOptions} opt - The options for configuring the BSON database driver.
     */
    public constructor(opt: BSONDriverOptions) {
        // Validates and sets the file path.
        if (typeof opt.filePath != 'string') clogUtils.error(new DatabaseError({ message: "Invalid type of Filepath", expected: "string", received: typeof opt.filePath }).toString());
        if (!opt.filePath.endsWith('.bson')) opt.filePath += '.bson';

        this.filePath = opt?.filePath ?? "./megdb.bson";
        this.timer = null;

        // Sets up database backup if specified in options.
        if (this.backup?.enabled) {

            if (typeof this.backup.CronJobPattern !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Cronjob pattern type or Invalid pattern.", expected: "string", received: typeof this.backup.CronJobPattern }).toString());
            if (typeof this.backup?.folderPath !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Folderpath", expected: "string", received: typeof this.backup?.folderPath }).toString());
            if (typeof this.backup?.timezone !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Timezone", expected: "string", received: typeof this.backup?.folderPath }).toString());
            if (typeof this.backup?.enabled !== "boolean") clogUtils.error(new DatabaseError({ message: "Invalid Folderpath", expected: "boolean", received: typeof this.backup?.folderPath }).toString());

            new cron.CronJob(this.backup.CronJobPattern, () => {
                const sourceFileName = this.filePath.substring(this.filePath.lastIndexOf("/") + 1);
                const regex = /(.+)\.bson$/;
                const match = sourceFileName.match(regex);

                if (!match) return new DatabaseError({ message: "Invalid filename format", expected: "string", received: typeof sourceFileName });

                const sourceNameWithoutExtension = match[1];
                const backupFileName = `backup-${sourceNameWithoutExtension}-${new Date().getTime()}.bson`;
                const backupFilePath = `${this.backup?.folderPath}/${backupFileName}`;

                try {
                    const data = fs.readFileSync(this.filePath);

                    fs.mkdirSync(this.backup!.folderPath, { recursive: true });
                    return fs.writeFileSync(backupFilePath, BSON.serialize(data));
                } catch (err) {
                    throw err
                }
            }, null, true, this.backup.timezone);
        };
    };

    /**
     * Reads data from the BSON file.
     * @returns {Object | any} The read data.
     */
    public read(): object | any {
        const filePath = path.resolve(this.filePath);
        try {
            if (!fs.existsSync(this.filePath)) this.savetofile({}, {});
            const rawData = fs.readFileSync(this.filePath) || {};
            return BSON.deserialize(rawData);
        } catch (error) {
            return clogUtils.error(`Error reading file ${filePath}: ${error}`)
        }
    }

    /**
     * Saves data to the JSON file with a delayed timer.
     * @param {object} data - The data to be saved.
     * @param {object} cache - The cache object.
     * @returns {void}
     */
    public save(data: object, cache: object): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            this.savetofile(data, cache);
        }, 2000);
    }

    /**
     * Saves data to the JSON file immediately.
     * @param {object} data - The data to be saved.
     * @param {object} cache - The cache object.
     * @returns {void}
     */
    public savetofile(data: object, cache: object): void {
        if (this.filePath) {
            cache = {};
            const bsonData = BSON.serialize(data);
            fs.writeFileSync(this.filePath, bsonData);
        }
    }
};