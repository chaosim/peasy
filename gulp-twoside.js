/* jshint node: true */
'use strict';
var path = require('path');
var es = require('event-stream');
var gutil = require('gulp-util');

console.log(__dirname)
var removeExtname = function(path) {
  var length = path.length;
  if (path.slice(length - 3) === '.js') {
    return path.slice(0, length - 3);
  } else if (path.slice(length - 7) === '.coffee') {
    return path.slice(0, length - 7);
  } else { return path; }
};

module.exports = function(basepath, packageName, pathMap) {
  basepath = path.join(__dirname,basepath)
  if (pathMap===undefined) pathMap = {};
  if (packageName===undefined) throw new Error("gulp-twoside: packageName is not provided.");
  return es.through(function(file){
    if (file.isStream()) return this.emit('error', new Error("gulp-twoside: Streaming not supported"));
    var padpath = path.join(packageName, file.path.slice(basepath.length)).replace(/\\/g, '/');
    var slashLastIndex = padpath.lastIndexOf("/");
    var filename = padpath.slice(slashLastIndex+1);
    if (filename==='twoside.js') { this.emit('data', file); return;}
    var mappath = removeExtname(padpath).slice(packageName.length+1);
    //console.log(mappath);
    if (pathMap[mappath]!==undefined)
      if (pathMap[mappath]!=='') padpath = packageName+'/'+pathMap[mappath];
      else padpath = packageName;
    //console.log(padpath);
    var head, foot;
    if (pathMap['only_wrap_for_browser']) {
      head = "(function() {var ts = twoside('" + padpath + "'), require = ts.require, exports = ts.exports, module = ts.module; // wrap line by gulp-twoside for providing twoside module\n\n";
      foot = "\n\n})();// wrap line by gulp-twoside"
    } else {
      head = "var exports, module, require; \n(function(require, exports, module) {var ts;if (typeof window === 'object') { ts = twoside('" + padpath + "'), require = ts.require, exports = ts.exports, module = ts.module;} // wrap line by gulp-twoside for providing twoside module; \n\n";
      foot = "\n\n})(require, exports, module);// wrap line by gulp-twoside"
    }
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
