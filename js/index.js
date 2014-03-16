var exports, module, require; 
(function(require, exports, module) {var ts;if (typeof window === 'object') { ts = twoside('peasy/index.js'), require = ts.require, exports = ts.exports, module = ts.module;} // wrap line by gulp-twoside for providing twoside module; 

var exports, extend;

exports = module.exports = {};

exports.peasy = require('./peasy');

extend = exports.peasy.extend;

extend(exports, exports.peasy);

exports.logicpeasy = require('./logicpeasy');

extend(exports, exports.logicpeasy);

exports.linepeasy = require('./linepeasy');

extend(exports, exports.linepeasy);


})(require, exports, module);// wrap line by gulp-twoside