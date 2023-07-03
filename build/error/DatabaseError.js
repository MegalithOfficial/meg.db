"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _CustomError = _interopRequireDefault(require("./CustomError.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class DatabaseError extends _CustomError.default {}
exports.default = DatabaseError;