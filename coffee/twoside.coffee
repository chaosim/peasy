### twoside.js(generated from twoside.coffee)
make modules can be used on both server side and client side.
use gulp-twoside to wrap your module.

below is a sample module that have been wrapped by gulp-twoside:

// wrap lines by gulp-twoside for providing twoside module
var exports, module, require;
(function(require, exports, module) {
if (typeof window === 'object') { ts = twoside('twoside-sample/module1.js'), require = ts.require, exports = ts.exports, module = ts.module;}
// module1.js
exports.something = function(){
  console.log('in module1');
  return 'something in module1'
}
// wrap line by gulp-twoside
})(require, exports, module);
###
do ->
#  oldrequire = window.require
#  oldexports = window.exports
#  oldmodule = window.module
  getStackTrace = ->
    obj = {}
    Error.captureStackTrace(obj, getStackTrace)
    obj.stack
  removeExtname = (path) ->
    length = path.length
    if path.slice(length-3)=='.js' then path.slice(0, length-3)
    else if path.slice(length-7)=='.coffee' then path.slice(0, length-7)
    #else if path.slice(length-5)=='.json' then path.slice(length-5)
    else path
  twoside = window.twoside = (path) ->
#    window.require = oldrequire
#    window.exports = oldexports
#    window.module = oldmodule
    # extension name will be removed, so don't make different modules with same path and different extension name.
    lastSlashIndex = path.lastIndexOf("/")
    if lastSlashIndex>=0
      modulePath =  path.slice(0, lastSlashIndex)
      filename = removeExtname(path.slice(lastSlashIndex+1))
    else
      modulePath = path
      filename = ''
    path = removeExtname(normalize(path))
    exports  = {}
    module = twoside._modules[path] = {exports:exports}
    # support folder as module by adding index.js or index.coffee
    if filename=='index' then twoside._modules[modulePath] = module
    require = (path) ->
      requiredModule  = twoside._modules[path]
      if requiredModule then return requiredModule.exports
      path = normalize(modulePath+'/'+removeExtname(path))
      requiredModule = twoside._modules[path]
      if !requiredModule
        console.log(getStackTrace())
        throw path+' is a wrong twoside module path.'
      requiredModule.exports
    {require:require, exports:exports, module:module}
  twoside._modules = {}
  ### we can alias some external modules.###
  twoside.alias = (path, object) -> twoside._modules[path] = object
  #twoside.alias('lodash', _)

  normalize = (path) ->
    if !path || path == '/' then return '/'
    target = []
    for token in path.split('/')
      if token == '..' then target.pop()
      else if token!= '' and token != '.' then target.push(token)
    ### for IE 6 & 7 - use path.charAt(i), not path[i] ###
    head = if path.charAt(0)=='/' or path.charAt(0)=='.' then '/' else ''
    head + target.join('/').replace(/[\/]{2,}/g, '/')
