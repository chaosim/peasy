/* jshint node: true */
'use strict';
var path = require('path');
var es = require('event-stream');
var gutil = require('gulp-util');

module.exports = function(basepath, moduleName) {
  return es.through(function(file){
    if (file.isStream()) return this.emit('error', new Error("gulp-twoside: Streaming not supported"));
    var padpath = path.join(moduleName, file.path.slice(basepath.length)).replace(/\\/g, '/');
    var filename = padpath.slice(padpath.lastIndexOf("/")+1);
    if (filename==='twoside.js') { this.emit('data', file); return;}
//    console.log(filename);
    var head = "// wrap lines by gulp-twoside for providing twoside module\nvar exports, module, require;\n(function(require, exports, module) {var ts;\nif (typeof window === 'object') { ts = twoside('"+padpath+"'), require = ts.require, exports = ts.exports, module = ts.module;} \n";
    var foot = "\n// wrap line by gulp-twoside\n})(require, exports, module);"
    //console.log(file);
    file.contents = Buffer.concat([
      new Buffer(head),
      file.contents,
      new Buffer(foot)
    ]);
    //console.log(file.path);
    this.emit('data', file);
  });
};
