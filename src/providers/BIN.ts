import { BackupOptions, DatabaseSignature, clogUtils } from '../main';
import { DatabaseMap } from '../interfaces/DatabaseMap';
import DatabaseError from "../utils/DatabaseError";

import fs from 'graceful-fs';
import cron from "cron";

export interface BINDriverOptions {
    filePath: string;
    backup?: BackupOptions;
};

export class BINDriver<V extends DatabaseSignature<V> = DatabaseMap> {
    /**
     * Magic number for identifying the file format.
     * @type {number}
     * @readonly
     * @private
     */
    private MAGIC_NUMBER = 0xCAFEBABE;

    /**
     * Version of the BIN file format.
     * @type {number}
     * @readonly
     * @private
     */
    private VERSION = 1;

    private filePath: string;
    private backup?: BackupOptions;
    private timer: NodeJS.Timeout | null;

    /**
     * Creates an instance of BINDriver.
     * @param {BINDriverOptions} opt - The options for configuring the BIN database driver.
     */
    public constructor(opt: BINDriverOptions) {
        // Validates and sets the file path.
        if (typeof opt.filePath != 'string') clogUtils.error(new DatabaseError({ message: "Invalid type of Filepath", expected: "string", received: typeof opt.filePath }).toString());
        if (!opt.filePath.endsWith('.bin')) opt.filePath += '.bin';

        this.filePath = opt?.filePath ?? "./megdb.bin";
        this.timer = null;

        // Sets up database backup if specified in options.
        if (this.backup?.enabled) {

            if (typeof this.backup.CronJobPattern !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Cronjob pattern type or Invalid pattern.", expected: "string", received: typeof this.backup.CronJobPattern }).toString());
            if (typeof this.backup?.folderPath !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Folderpath", expected: "string", received: typeof this.backup?.folderPath }).toString());
            if (typeof this.backup?.timezone !== "string") clogUtils.error(new DatabaseError({ message: "Invalid Timezone", expected: "string", received: typeof this.backup?.folderPath }).toString());
            if (typeof this.backup?.enabled !== "boolean") clogUtils.error(new DatabaseError({ message: "Invalid Folderpath", expected: "boolean", received: typeof this.backup?.folderPath }).toString());

            new cron.CronJob(this.backup.CronJobPattern, () => {
                const sourceFileName = this.filePath.substring(this.filePath.lastIndexOf("/") + 1);
                const regex = /(.+)\.bin$/;
                const match = sourceFileName.match(regex);

                if (!match) return new DatabaseError({ message: "Invalid filename format", expected: "string", received: typeof sourceFileName });

                const sourceNameWithoutExtension = match[1];
                const backupFileName = `backup-${sourceNameWithoutExtension}-${new Date().getTime()}.msp`;
                const backupFilePath = `${this.backup?.folderPath}/${backupFileName}`;

                try {
                    const data = this.read();
                    let oldFilePath = this.filePath;
                    this.filePath = backupFilePath;

                    fs.mkdirSync(this.backup!.folderPath, { recursive: true });
                    this.savetofile(data, {});
                    this.filePath = oldFilePath;
                    return true;
                } catch (err) {
                    throw err
                }
            }, null, true, this.backup.timezone);
        };
    };

    /**
     * Reads data from the BIN file.
     * @returns {Record<string, string>} The read data.
     */
    public read(): Record<string, string> {
        if (!fs.existsSync(this.filePath)) this.savetofile({}, {});

        const fileBuffer = fs.readFileSync(this.filePath);
        const data: Record<string, string> = {};

        let offset = 0;
        const magicNumber = fileBuffer.readUInt32LE(offset);
        offset += 4;
        const version = fileBuffer.readUInt32LE(offset);
        offset += 4;

        if (magicNumber !== this.MAGIC_NUMBER || version !== this.VERSION) {
            throw new Error('Invalid file format or version.');
        }

        while (offset < fileBuffer.length) {
            const keyLength = fileBuffer.readUInt32LE(offset);
            offset += 4;
            const valueLength = fileBuffer.readUInt32LE(offset);
            offset += 4;

            const key = fileBuffer.toString('utf8', offset, offset + keyLength);
            offset += keyLength;
            const value = fileBuffer.toString('utf8', offset, offset + valueLength);
            offset += valueLength;

            data[key] = value;
        }

        return data;
    };

    /**
     * Saves data to the BIN file with a delayed timer.
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
     * Saves data to the BIN file immediately.
     * @param {Record<any, any>} data - The data to be saved.
     * @param {Record<any, any>} cache - The cache object.
     * @returns {void}
     */
    public savetofile(data: Record<any, any>, cache: Record<any, any>): void {
        const fileBuffers: Buffer[] = [];

        const headerBuffer = Buffer.alloc(16);
        let offset = 0;
        offset = headerBuffer.writeUInt32LE(this.MAGIC_NUMBER, offset);
        offset = headerBuffer.writeUInt32LE(this.VERSION, offset);
        offset = headerBuffer.writeBigUInt64LE(BigInt(0), offset);
        fileBuffers.push(headerBuffer);

        for (const [key, value] of Object.entries(data)) {
            const keyBuffer = Buffer.from(key, 'utf8');
            const valueBuffer = Buffer.from(JSON.stringify(value), 'utf8');
            const recordBuffer = Buffer.alloc(8 + keyBuffer.length + valueBuffer.length);

            let recordOffset = 0;
            recordOffset = recordBuffer.writeUInt32LE(keyBuffer.length, recordOffset);
            recordOffset = recordBuffer.writeUInt32LE(valueBuffer.length, recordOffset);

            keyBuffer.copy(recordBuffer, recordOffset);
            recordOffset += keyBuffer.length;
            valueBuffer.copy(recordBuffer, recordOffset);

            fileBuffers.push(recordBuffer);
        };

        const finalBuffer = Buffer.concat(fileBuffers);
        fs.writeFileSync(this.filePath, finalBuffer);
        cache = {};
    };
}