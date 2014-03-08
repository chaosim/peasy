exports = module.exports = {}

exports.peasy = require './peasy'
extend = exports.peasy.extend
extend exports, exports.peasy
exports.logicpeasy = require './logicpeasy'
extend exports, exports.logicpeasy
linepeasy = require './linepeasy'
extend exports, exports.linepeasy
