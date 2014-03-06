
/* modules/twoside
 * make modules can be used on both server side and client side.
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
    var exports, filename, module, modulePath, require;
    window.require = oldrequire;
    window.exports = oldexports;
    window.module = oldmodule;
    path = normalize(path).slice(0, path.lastIndexOf("."));
    modulePath = path.slice(0, path.lastIndexOf("/"));
    filename = path.slice(path.lastIndexOf("/") + 1);
    exports = {};
    module = twoside._modules[path] = {
      exports: exports
    };
    if (filename === 'index') {
      twoside._modules[modulePath] = module;
    }
    require = function(path) {
      var requiredModule;
      requiredModule = twoside._modules[path];
      if (requiredModule) {
        return requiredModule;
      }
      path = path.slice(0, path.lastIndexOf("."));
      path = normalize(modulePath + '/' + path);
      requiredModule = twoside._modules[path];
      if (!requiredModule) {
        console.log(getStackTrace());
        throw path + ' is a wrong twoside module path.';
      }
      return requiredModule.exports;
    };
    return {
      require: require,
      exports: exports,
      module: module
    };
  };
  twoside._modules = {};

  /* we can alias some external modules. */
  twoside.alias = function(path, object) {
    return twoside._modules[path] = object;
  };
  twoside.alias('lodash', _);
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

    /* for IE 6 & 7 - use path.charAt(i), not path[i] */
    head = path.charAt(0) === '/' || path.charAt(0) === '.' ? '/' : '';
    return head + target.join('/').replace(/[\/]{2,}/g, '/');
  };
})();
