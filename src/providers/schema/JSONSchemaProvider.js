import { JSONProvider } from "../JSONprovider.js";
import { SchemaError } from "../../error/CustomError.js"
import stringColorizer from "string-colorizer";

export class JSONSchema extends JSONProvider {
  constructor(filepath, fields) {
    super(filepath);
    this.fields = fields;
  }

  /**
   * Validates the given document against the schema.
   * @param {Object} document - The document to validate.
   * @throws {Error} If the validation fails.
   */
  validate(document) {
    const colorizer = new stringColorizer();
    const invalidTypes = [];
    const missingFields = [];
  
    for (const [field, { type, required, default: defaultValue }] of Object.entries(this.fields)) {
      const value = document[field];
  
      if (value === undefined || value === null) {
        // missing or null value
        if (required) {
          missingFields.push(field);
        } else if (defaultValue !== undefined) {
          // use default value if available
          document[field] = defaultValue;
        }
      } else if (typeof value !== type) {
        // invalid type
        if (required && !missingFields.includes(field)) {
          invalidTypes.push({ field: field, expected: type, received: value });
        }
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
  }
};