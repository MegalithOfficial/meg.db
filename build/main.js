"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _BSONSchemaProvider = require("./providers/schema/BSONSchemaProvider.js");
Object.keys(_BSONSchemaProvider).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _BSONSchemaProvider[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _BSONSchemaProvider[key];
    }
  });
});
var _BSONprovider = require("./providers/BSONprovider.js");
Object.keys(_BSONprovider).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _BSONprovider[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _BSONprovider[key];
    }
  });
});