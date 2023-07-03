import stringColorizer from "string-colorizer";

class CustomError extends Error {
  /**
   * @param {{
   *    type: string,
   *    stack?: number
   * }} options
   */
  constructor(message, options) {
    const colorizer = new stringColorizer();
    super(`${colorizer.styles.bright(colorizer.foregroundColors.yellow(message))}`);
    Object.defineProperty(this, "name", {
      value: colorizer.foregroundColors.red(`${this.constructor.name}[${options.type}]`),
      writable: false,
      configurable: false
    });
    Object.defineProperty(this, "stack", {
      value: options?.stack ?? this.stack,
      writable: false,
      configurable: false
    })
  }
  throw() {
    throw this;
  }
};

export class DatabaseError extends CustomError {}

export class SchemaError extends CustomError {}