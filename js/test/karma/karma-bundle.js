// wrap lines by gulp-twoside for providing twoside module
var exports, module, require, ts;
if (typeof window === 'object') { ts = twoside('peasy/test/karma/karma-bundle.js'), require = ts.require, exports = ts.exports, module = ts.module;} 
(function(require, exports, module) {
require('./testparser.js');

require('./testlogicparser');

require('./samples/testdsl');

require('./samples/testarithmatic');

require('./samples/testarithmatic2');
})(require, exports, module); // wrap line by gulp-twoside