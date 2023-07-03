export type SchemaFields = Record<string, { type: string; required?: boolean }>;

export class BSONSchema {
  constructor(fields: SchemaFields, filepath: string);

  validate(document: Record<string, any>): void;
  insert(db: BSONProvider, collectionName: string, document: Record<string, any>): void;
}
