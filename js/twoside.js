/* modules/twoside
# make modules can be used on both server side and client side.
github.com/chaosim/twoside
npmjs.org/package/twoside
npm install twoside
*/

(function() {
  var getStackTrace, normalize, oldexports, oldmodule, oldrequire, twoside;
  oldrequire = window.require;
  oldexports = window.exports;
  oldmodule = window.module;
  getStackTrace = function() {
    var obj;
    obj = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
  };
  twoside = window.twoside = function(path) {
    var exports, module, modulePath, require;
    window.require = oldrequire;
    window.exports = oldexports;
    window.module = oldmodule;
    path = normalize(path);
    exports = {};
    module = twoside._modules[path] = {
      exports: exports
    };
    modulePath = path.slice(0, path.lastIndexOf("/") + 1);
    require = function(path) {
      module = twoside._modules[path];
      if (module) {
        return module;
      }
      path = normalize(modulePath + path);
      module = twoside._modules[path];
      if (!module) {
        console.log(getStackTrace());
        throw path + ' is a wrong twoside module path.';
      }
      return module.exports;
    };
    return {
      require: require,
      exports: exports,
      module: module
    };
  };
  twoside._modules = {};
  /* we can alias some external modules.*/

  twoside.alias = function(path, object) {
    return twoside._modules[path] = object;
  };
  /* e.g. n browser, if underscore have been imported before, we can alias it like below:*/

  return normalize = function(path) {
    var head, target, token, _i, _len, _ref;
    if (!path || path === '/') {
      return '/';
    }
    target = [];
    _ref = path.split('/');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      token = _ref[_i];
      if (token === '..') {
        target.pop();
      } else if (token !== '' && token !== '.') {
        target.push(token);
      }
    }
    /* for IE 6 & 7 - use path.charAt(i), not path[i]*/

    head = path.charAt(0) === '/' || path.charAt(0) === '.' ? '/' : '';
    return head + target.join('/').replace(/[\/]{2,}/g, '/');
  };
})();

/* javascript sample
if (typeof window==='object'){ var m = twoside('/module1'), exports= m.exports, module = m.module, require = m.module; }
(function(require, exports, module){
  // wrapped module definition
})(require, exports, module);
*/

