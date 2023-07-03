"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stringColorizer = _interopRequireDefault(require("string-colorizer"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class CustomError extends Error {
  /**
   * @param {{
   *    type: string,
   *    stack?: number
   * }} options
   */
  constructor(message, options) {
    const colorizer = new _stringColorizer.default();
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
    });
  }
  throw() {
    throw this;
  }
}
exports.default = CustomError;
;

// "Schema validation failed: Required field 'age' is missing"  bu error mesaj listini oluşturan kodu editlememiz gerek btw