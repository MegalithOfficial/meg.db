declare module "meg.db" {
  export class BSONProvider<T extends DatabaseSignature<T> = DatabaseMap> {
    constructor(filePath?: string);

    public setSchema(schemaName: string, schema: object): void;
    public set<K extends keyof T>(key: K, value: T[K]): void;
    public set(key: string, value: unknown): void;
    public get<K extends keyof T>(key: K): T[K];
    public get(key: string): unknown;
    public delete<K extends keyof T>(key: K): void;
    public delete(key: string): void;
    public filter<K extends keyof T>(callback: (key: K, value: V[K]) => boolean): object;
    public filter(callback: (key: string, value: unknown) => boolean): object;
    public push<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public pull<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public deleteAll(): void;
    public all(): T;
    private getSchema(schemaName: string): DatabaseSchema;
    private read(file: string): void;
    private load(file: string): void;
    private save(): void;
  }; 

  export class JSONProvider<T extends DatabaseSignature<T> = DatabaseMap> {
    constructor(filePath?: string);

    public setSchema(schemaName: string, schema: object): void;
    public set<K extends keyof T>(key: K, value: T[K]): void;
    public set(key: string, value: unknown): void;
    public get<K extends keyof T>(key: K): T[K];
    public get(key: string): unknown;
    public delete<K extends keyof T>(key: K): void;
    public delete(key: string): void;
    public filter<K extends keyof T>(callback: (key: K, value: V[K]) => boolean): object;
    public filter(callback: (key: string, value: unknown) => boolean): object;
    public push<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public pull<K extends keyof T>(key: K, ...values: (T[K])[]): void;
    public deleteAll(): void;
    public all(): T;
    private getSchema(schemaName: string): DatabaseSchema;
    private read(file: string): void;
    private load(file: string): void;
    private save(): void;
  }; 
  export interface DatabaseMap{
    [key: string]: unknown
  } 

  export type DatabaseSignature<V = unknown> = { [key in keyof V]: unknown };

  export interface DatabaseSchema {
    type: string;
    required?: boolean
  };

  export type SchemaFields = Record<string, DatabaseSchema>;

  export class BSONSchema extends BSONProvider {
    constructor(filepath: string, fields: SchemaFields);

    validate(document: Record<string, any>): void;
  };

  export class JSONSchema extends JSONProvider {
    constructor(filepath: string, fields: SchemaFields);

    validate(document: Record<string, any>): void;
  };
};