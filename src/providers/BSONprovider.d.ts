declare module "bson-provider" {

  type BSONData = Record<string, any>;

  type BSONProviderOptions = {
    filepath?: string;
  };

  class BSONProvider {
    constructor(options?: BSONProviderOptions);

    set(key: string, value: any): void;
    get(key: string): any | undefined;
    exists(key: string): boolean;
    delete(key: string): void;
    push(key: string, value: any): void;
    pull(key: string, value: any): void;
    deleteAll(): void;
    all(): BSONData;
    query(queryExpression: string): any[];

    protected load(): void;
    protected save(): void;
  }

  export default BSONProvider;
}
