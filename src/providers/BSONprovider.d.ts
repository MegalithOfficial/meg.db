declare module 'Database' {
  export interface DatabaseOptions {
    filepath: string;
  }

  export class Database {
    constructor(options: DatabaseOptions);

    load(): void;
    save(): void;
    set(key: string, value: any): void;
    get(key: string): any;
    delete(key: string): void;
    push(key: string, value: any): void;
    pull(key: string, value: any): void;
    deleteAll(): void;
    all(): {[key: string]: any};
    exists(key: string): boolean;
  }
}