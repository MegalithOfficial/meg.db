import { BSONprovider } from "../BSONprovider.js";

export class BSONSchema extends BSONprovider {
  constructor(filepath, fields) {
    super(filepath);
    this.fields = new Map(Object.entries(fields));
  }

  /**
   * Validates the given document against the schema.
   * @param {Object} document - The document to validate.
   * @throws {Error} If the validation fails.
   */
  validate(document) {
    const errors = [];
    for (const [field, { type, required }] of this.fields) {
      const value = document[field];
      if (required && (value === undefined || value === null)) {
        errors.push(`Required field '${field}' is missing`);
      }
      if (typeof value !== type) {
        errors.push(`Invalid type for field '${field}'`);
      }
    }
    if (errors.length > 0) {
      throw new Error(`Schema validation failed: ${errors.join(", ")}`);
    }
  }

  /**
   * Inserts a document into the specified collection after validating against the schema.
   * @param {string} collectionName - The name of the collection to insert the document into.
   * @param {Object} document - The document to insert.
   * @throws {Error} If the validation fails.
   */
  insert(collectionName, document) {
    this.validate(document);
    super.set(collectionName, document._id, document);
  }
}
