import { BackupOptions, DatabaseSignature, clogUtils } from '../main';
import { DatabaseMap } from '../interfaces/DatabaseMap';
import DatabaseError from "../utils/DatabaseError";

import fs from 'graceful-fs';
import cron from "cron";
import path from 'path';

export interface JSONDriverOptions {
    filePath: string;
    backup?: BackupOptions;
};

export class JSONDriver<V extends DatabaseSignature<V> = DatabaseMap> {

    private filePath: string;
    private backup?: BackupOptions;
    private timer: NodeJS.Timeout | null;

    /**
     * Creates an instance of JSONDriver.
     * @param {JSONDriverOptions} opt - The options for configuring the JSON database driver.
     */
    public constructor(opt: JSONDriverOptions) {
        // Validates and sets the file path.
        if (typeof opt.filePath != 'string') clogUtils.error(new DatabaseError({ message: "Invalid type of Filepath", expected: "string", received: typeof opt.filePath }).toString());
        if (!opt.filePath.endsWith('.json')) opt.filePath += '.json';

        this.filePath = opt?.filePath ?? "./megdb.json";
        this.timer = null;

        // Sets up database backup if specified in options.
        if (this.backup?.enabled) {

            if (typeof this.backup.CronJobPattern !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Cronjob pattern type or Invalid pattern.", expected: "string", received: typeof this.backup.CronJobPattern }).toString());
            if (typeof this.backup?.folderPath !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Folderpath", expected: "string", received: typeof this.backup?.folderPath }).toString());
            if (typeof this.backup?.timezone !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Timezone", expected: "string", received: typeof this.backup?.folderPath }).toString());
            if (typeof this.backup?.enabled !== "boolean") clogUtils.error(new DatabaseError({ message: "Invalid Folderpath", expected: "boolean", received: typeof this.backup?.folderPath }).toString());

            new cron.CronJob(this.backup.CronJobPattern, (): void => {
                const sourceFileName = this.filePath.substring(this.filePath.lastIndexOf("/") + 1);
                const regex = /(.+)\.json$/;
                const match = sourceFileName.match(regex);

                if (!match) {
                    clogUtils.error(new DatabaseError({ message: "Invalid filename format", expected: "string", received: typeof sourceFileName }));
                    return void 0;
                };

                const sourceNameWithoutExtension = match[1];
                const backupFileName = `backup-${sourceNameWithoutExtension}-${new Date().getTime()}.json`;
                const backupFilePath = `${this.backup?.folderPath}/${backupFileName}`;

                try {
                    const data = fs.readFileSync(this.filePath, 'utf8');

                    fs.mkdirSync(this.backup!.folderPath, { recursive: true });
                    fs.writeFileSync(backupFilePath, data, 'utf8');
                    return void 0;
                } catch (err) {
                    throw err
                }
            }, null, true, this.backup.timezone);
        };
    };

    /**
     * Reads data from the JSON file.
     * @returns {Object | any} The read data.
     */
    public read(): Object | any {
        const filePath = path.resolve(this.filePath);
        try {
            if (!fs.existsSync(this.filePath)) this.savetofile({}, {});
            const jsonData = require(filePath) || {};
            return jsonData;
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
    };

    /**
     * Saves data to the JSON file immediately.
     * @param {object} data - The data to be saved.
     * @param {object} cache - The cache object.
     * @returns {void}
     */
    public savetofile(data: object, cache: object): void {
        if (this.filePath) {
            cache = {};
            const dataString = JSON.stringify(data, null, 2);
            fs.writeFileSync(this.filePath, dataString, { encoding: 'utf8' });
        };
    };
};