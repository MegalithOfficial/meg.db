import { clogUtils as Logger } from "clog-utils";

/**
 * Logger instance for logging utility.
 * @type {Logger}
 */
export const clogUtils = new Logger({ disableModification: true });

/**
 * Module exporting various database-related components.
 * @module databaseComponents
 */

/**
 * Export of the base database driver.
 * @type {BaseDriver}
 */
export * from "./baseDriver"

/**
 * Export of the BIN database provider.
 * @type {BINDriver}
 */
export * from "./providers/BIN";

/**
 * Export of the BSON database provider.
 * @type {BSONDriver}
 */
export * from "./providers/BSON";

/**
 * Export of the JSON database provider.
 * @type {JSONDriver}
 */
export * from "./providers/JSON";

/**
 * Export of the database migration utility.
 * @type {DatabaseMigration}
 */
export * from "./utils/databaseMigration";

/**
 * Export of database options interface.
 * @type {DatabaseOptions}
 */
export * from "./interfaces/DatabaseOptions";

/**
 * Export of database signature interface.
 * @type {DatabaseSignature}
 */
export * from './interfaces/DatabaseSignature';