import { BSONProvider } from "../BSONprovider.js";
import { SchemaError } from "../../error/CustomError.js"
import stringColorizer from "string-colorizer";

export class BSONSchema extends BSONProvider {
  constructor(filepath, fields) {
    super(filepath);
    this.fields = new Map(Object.entries(fields));
  }

  /**
   * Validates the given document against the schema.
   * @param {Object} document - The document to validate.
   * @throws {SchemaError} If the validation fails.
   */
  validate(document) {
    const colorizer = new stringColorizer();
    const invalidTypes = [];
    const missingFields = [];

    for (const [field, { type, required }] of this.fields) {
      const value = document[field];

      if (required && (value === undefined || value === null)) {
        // missing
        missingFields.push(field);
      }
      if (typeof value !== type) {
        // invalid type
        if(!missingFields.includes(field)) invalidTypes.push({ field: field, expected: type, recived: value });
      }
    }
    let errorMessage = "";


    if (missingFields.length > 0) {
      const formattedMissingFields = missingFields.map(field => `'${field}'`).join(", ");
      errorMessage += `${colorizer.backgroundColors.red("[Schema validation failed]:")} ${missingFields.length + invalidTypes.length} Errors Found.\n${colorizer.foregroundColors.green(`Missing fields:`)} ${colorizer.foregroundColors.red(formattedMissingFields)}`;
    }
    
    if (invalidTypes.length > 0) {
      const formattedInvalidTypes = invalidTypes.map(({ field, expected, received }) => `\n${colorizer.foregroundColors.green(`Invalid field:`)} '${colorizer.foregroundColors.red(field)}'. ${colorizer.foregroundColors.green("Expected:")} ${colorizer.foregroundColors.red(expected)}, ${colorizer.foregroundColors.green("Received:")} ${colorizer.foregroundColors.red(received)}`).join(" | ");
      if (missingFields.length > 0) {
        errorMessage += ". ";
      }
      errorMessage += formattedInvalidTypes;
    }
    
    if (missingFields.length > 0 || invalidTypes.length > 0) {
      throw new SchemaError(errorMessage, { type: "SchemaError" });
    }
    
    return true;
  };
};