/* wrap line by gulp-twoside for providing twoside module*/; (function() {var ts = twoside('peasy/index.js'), require = ts.require, exports = ts.exports, module = ts.module; 

var exports, extend, linepeasy;

exports = module.exports = {};

exports.peasy = require('./peasy');

extend = exports.peasy.extend;

extend(exports, exports.peasy);

exports.logicpeasy = require('./logicpeasy');

extend(exports, exports.logicpeasy);

linepeasy = require('./linepeasy');

extend(exports, exports.linepeasy);


})();// wrap line by gulp-twoside