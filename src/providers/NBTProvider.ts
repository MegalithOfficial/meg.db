import DatabaseError from "../DatabaseError";
import { ProviderDefaultOptions, ProviderOptions, DatabaseSignature, DatabaseMap, BackupOptions } from "../main";

import fs from 'graceful-fs';
import nbt, { TagType, NBT } from "prismarine-nbt";
import cron from "node-cron";

export class NBTProvider<V extends DatabaseSignature<V> = DatabaseMap> { 

  private filePath: string;
  private useExperimentalSaveMethod?: boolean = false;
  private data: { 
    values: Map<any, any>;
  };
  private cache: Map<any, any>;
  private backup?: BackupOptions;
  private timer: NodeJS.Timeout | null;

  constructor(opt: ProviderOptions = ProviderDefaultOptions) {

    if (typeof opt.filePath != 'string') new DatabaseError({ message: "Invalid type of Filepath", expected: "string", received: typeof opt.filePath })
    if (!opt.filePath.endsWith('.nbt')) opt.filePath += '.nbt';

    this.filePath = opt?.filePath ?? "./megdb.nbt";
    this.useExperimentalSaveMethod = opt?.useExperimentalSaveMethod ?? false;
    if(this.useExperimentalSaveMethod) process.on('beforeExit', () => this.savetofile());

    this.data = {  values: new Map() };
    this.cache = new Map();
    this.timer = null;

    this.backup = opt?.backupOptions ?? ProviderDefaultOptions.backupOptions;

    if (this.filePath && fs.existsSync(this.filePath)) {
      this.read(this.filePath);
    } else {
      let data: NBT = { type: TagType.Compound, name: '', value: {} } as NBT;

      const buffer = nbt.writeUncompressed(data);
      fs.writeFileSync(this.filePath, buffer);    
    }
    
    if (this.backup?.enabled) {
      if (!cron.validate(this.backup?.CronJobPattern) || typeof this.backup.CronJobPattern !== "string") new DatabaseError({ message: "Invalid Cronjob pattern type or Invalid pattern", expected: "string", received: typeof this.backup.CronJobPattern });
      if (typeof this.backup?.folderPath !== "string") new DatabaseError({ message: "Invalid Folderpath", expected: "string", received: typeof this.backup?.folderPath });
      if (typeof this.backup?.timezone !== "string") new DatabaseError({ message: "Invalid Timezone", expected: "string", received: typeof this.backup?.folderPath });
      if (typeof this.backup?.enabled !== "boolean") new DatabaseError({ message: "Invalid Folderpath", expected: "boolean", received: typeof this.backup?.folderPath });
      
      cron.schedule(this.backup.CronJobPattern, () => {
        const sourceFileName = this.filePath.substring(this.filePath.lastIndexOf("/") + 1);
        const regex = /(.+)\.json$/;
        const match = sourceFileName.match(regex);

        if (!match) return new DatabaseError({ message: "Invalid filename format", expected: "string", received: typeof sourceFileName });

        const sourceNameWithoutExtension = match[1];
        const backupFileName = `backup-${sourceNameWithoutExtension}-${new Date().getTime()}.nbt`;
        const backupFilePath = `${this.backup?.folderPath}/${backupFileName}`;

        try {
          const data = fs.readFileSync(this.filePath, 'utf8');
          // @ts-ignore
          fs.mkdirSync(this.backup.folderPath, { recursive: true });
          return fs.writeFileSync(backupFilePath, data, 'utf8'); 
        } catch (err) {
          throw err
        }
      }, { timezone: this.backup.timezone });
    }; 

  }

  public set<K extends keyof V>(key: K, value: V[K]): void {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    this.data.values.set(key, value);
    this.cache.set(key, value);
    this.save();
  };

  public get<K extends keyof V>(key: K): any {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const value = this.data.values.get(key);
    this.cache.set(key, value);
    return value;
  };

  public delete<K extends keyof V>(key: K): void {
    if (typeof key != 'string') new DatabaseError({ expected: 'string', received: typeof key });

    this.data.values.delete(key);
    this.cache.delete(key);
    this.save();
  };

  public filter<K extends keyof V>(callback: (key: K, value: V[K]) => any): any {
    const filteredData: Record<string, any> = {};
    for (const [key, value] of this.data.values.entries()) {
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
    this.data.values.clear();
    this.cache.clear();
    this.save();
  };

  public all() {
    return new Map(this.data.values);
  };

  private read(file: string): void {
    const rawData = fs.readFileSync(file);
    let parsedData = nbt.parseUncompressed(rawData);
    let simplified = nbt.simplify(parsedData)
    for (const [key, value] of Object.entries(simplified)) {
      //@ts-ignore
      this.set(key, value);
    }
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

  private toNBT(value) {
    const getTypeAndValue = (val) => {
      let type;
      let newValue = val;
  
      switch (typeof val) {
        case "string":
          type = nbt.TagType.String;
          break;
    
        case "number":
          if (!isNaN(val) && Number.isInteger(val)) {
            type = nbt.TagType.Int;
          } else if (!isNaN(val)) {
            type = nbt.TagType.Float
          } else {
            throw new TypeError("Number data cannot be NaN")
          }
          break;
    
        case "boolean":
          type = nbt.TagType.Byte;
          newValue = Number(val);
          break;
    
        case "object":
          if (val === null) {
            throw new TypeError("Data cannot be null.")
          } else if (Array.isArray(val)) {

          if (val.every((e) => typeof e !== typeof val[0])) {
              throw new TypeError("All elements in the array must have the same type.");
          }
            if (typeof val[0] === "object") {
              newValue = val.map((e) => this.toNBT(e).value);
            }
            newValue = { type: this.toNBT(val[0]).type, value: newValue };
            type = nbt.TagType.List;

          } else if (val instanceof Map) {

            const entries = Array.from(val.entries()).map(([k, v]) => [k, this.toNBT(v)]);
            newValue = Object.fromEntries(entries);
            type = nbt.TagType.Compound;

          } else if (val instanceof Set) {

            const array = Array.from(val);
            if (array.every((e) => typeof e !== typeof array[0])) {
              throw new TypeError("All elements in the set must have the same type.");
            }
            if (typeof array[0] === "object") {
              newValue = array.map((e) => this.toNBT(e).value);
            }
            newValue = { type: this.toNBT(array[0]).type, value: newValue };
            type = nbt.TagType.List;

          } else if (val instanceof RegExp) {

            newValue = String(val);
            type = nbt.TagType.String;

          } else if (val instanceof Object) {

            const entries = Object.entries(val).map(([k, v]) => [k, this.toNBT(v)]);
            newValue = Object.fromEntries(entries);
            type = nbt.TagType.Compound;

          }
          break;

          case "undefined":
            throw new TypeError("Data cannot be undefined.")
      }
  
      return { type, value: newValue };
    };
  
    return getTypeAndValue(value);
  };

  private convertToNbtFormat(data) {
    const nbtData: NBT = {
      type: nbt.TagType.Compound,
      name: '',
      value: {},
    } as NBT;
  
    for (const [key, value] of Object.entries(data)) {
      let nbtValue = this.toNBT(value);
      nbtData.value[`${key}`] = nbtValue;
    }
  
    return nbtData;
  }

  async savetofile() {
    const nbtData = this.convertToNbtFormat(Object.fromEntries(this.data.values));
    const buffer = nbt.writeUncompressed(nbtData);
    fs.writeFile(this.filePath, buffer, (error) => {
      if (error) {
        throw error;
      }
    });
  }

}
