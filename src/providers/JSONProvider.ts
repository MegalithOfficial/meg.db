import { BackupOptions, ProviderOptions, ProviderDefaultOptions, DatabaseMap, DatabaseSignature } from '../main';
import DatabaseError from "../DatabaseError";

import fs from 'graceful-fs';
import cron from "cron";

export class JSONProvider<V extends DatabaseSignature<V> = DatabaseMap> {

  private filePath: string;
  private useExperimentalSaveMethod?: boolean = false;
  private data: {
    Schemas: Map<any, any>;
    default: Map<any, any>;
  };
  private cache: Map<any, any>;
  private backup?: BackupOptions;
  private timer: NodeJS.Timeout | null;

  /**
  * Constructs a new instance of the JSONprovider class.
  */
  public constructor(opt: ProviderOptions = ProviderDefaultOptions) {

    if (typeof opt.filePath != 'string') new DatabaseError({ message: "Invalid type of Filepath", expected: "string", received: typeof opt.filePath })
    if (!opt.filePath.endsWith('.json')) opt.filePath += '.json';

    this.filePath = opt?.filePath ?? "./megdb.json";
    this.useExperimentalSaveMethod = opt?.useExperimentalSaveMethod ?? false;
    if(this.useExperimentalSaveMethod) process.on('beforeExit', () => this.savetofile());

    this.data = { Schemas: new Map(), default: new Map() };
    this.cache = new Map();
    this.timer = null;

    this.backup = opt?.backupOptions ?? ProviderDefaultOptions.backupOptions;

    if (this.filePath && fs.existsSync(this.filePath)) {
      this.read(this.filePath);
    } else {
      this.save();
    };

    if (this.backup?.enabled) {

      if (typeof this.backup.CronJobPattern !== "string") new DatabaseError({ message: "Invalid Cronjob pattern type or Invalid pattern.\nIf you are confused use this site: https://crontab.guru/", expected: "string", received: typeof this.backup.CronJobPattern });
      if (typeof this.backup?.folderPath !== "string") new DatabaseError({ message: "Invalid Folderpath", expected: "string", received: typeof this.backup?.folderPath });
      if (typeof this.backup?.timezone !== "string") new DatabaseError({ message: "Invalid Timezone", expected: "string", received: typeof this.backup?.folderPath });
      if (typeof this.backup?.enabled !== "boolean") new DatabaseError({ message: "Invalid Folderpath", expected: "boolean", received: typeof this.backup?.folderPath });
      
      new cron.CronJob(this.backup.CronJobPattern, () => {
        const sourceFileName = this.filePath.substring(this.filePath.lastIndexOf("/") + 1);
        const regex = /(.+)\.json$/;
        const match = sourceFileName.match(regex);

        if (!match) return new DatabaseError({ message: "Invalid filename format", expected: "string", received: typeof sourceFileName });

        const sourceNameWithoutExtension = match[1];
        const backupFileName = `backup-${sourceNameWithoutExtension}-${new Date().getTime()}.json`;
        const backupFilePath = `${this.backup?.folderPath}/${backupFileName}`;

        try {
          const data = fs.readFileSync(this.filePath, 'utf8');
          // @ts-ignore
          fs.mkdirSync(this.backup.folderPath, { recursive: true });
          return fs.writeFileSync(backupFilePath, data, 'utf8'); 
        } catch (err) {
          throw err
        }
      }, null, true, this.backup.timezone );
    }; 
  };

  public set<K extends keyof V>(key: K, value: V[K]): void {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    this.data.default.set(key, value);
    this.cache.set(key, value);
    this.save();
  };

  public get<K extends keyof V>(key: K): any {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = this.data.default.get(key);
    this.cache.set(key, value);
    return value;
  };

  public delete<K extends keyof V>(key: K): void {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    this.data.default.delete(key);
    this.cache.delete(key);
    this.save();
  };

  public filter<K extends keyof V>(callback: (key: K, value: V[K]) => any): any {
    const filteredData: Record<string, any> = {};
    for (const [key, value] of this.data.default.entries()) {
      if (callback(key, value)) {
        filteredData[key] = value;
      }
    }
    return filteredData;
  };

  public push<K extends keyof V>(key: K, value: V[K]) {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    const array = this.get(key) || [];
    array.push(value);
    this.set(key, array);
  };

  public pull<K extends keyof V>(key: K, value: V[K]) {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    const array = this.get(key) || [];
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
      this.set(key, array);
    };
  };

  public deleteAll(): void {
    this.data.default.clear();
    this.cache.clear();
    this.save();
  };

  public all() {
    return new Map(this.data.default);
  };

  private read(file: string): void {
    const jsonData = JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
    this.data.Schemas = new Map(Object.entries(jsonData.Schemas));
    this.data.default = new Map(Object.entries(jsonData.default));
    this.cache.clear();
  };

  private save(): void {
    if (this.useExperimentalSaveMethod) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        this.savetofile();
      }, 2000);
    } else {
      this.savetofile();
    };
  };

  private savetofile(): void {
    if (this.filePath) {
      const dataToSave = {
        Schemas: Object.fromEntries(this.data.Schemas),
        default: Object.fromEntries(this.data.default),
      };
      const dataString = JSON.stringify(dataToSave);
      fs.writeFileSync(this.filePath, dataString, { encoding: 'utf8' });
    };
  };
};