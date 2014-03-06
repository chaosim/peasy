### modules/twoside
# make modules can be used on both server side and client side.
###
do ->
  oldrequire = window.require
  oldexports = window.exports
  oldmodule = window.module
  getStackTrace = ->
    obj = {}
    Error.captureStackTrace(obj, getStackTrace)
    obj.stack
  twoside = window.twoside = (path) ->
    window.require = oldrequire
    window.exports = oldexports
    window.module = oldmodule
    # extension name will be removed, so don't make different modules with same path and different extension name.
    path = normalize(path).slice(0, path.lastIndexOf("."))
    modulePath =  path.slice(0, path.lastIndexOf("/"))
    filename = path.slice(path.lastIndexOf("/")+1)
    exports  = {}
    module = twoside._modules[path] = {exports:exports}
    # support folder as module that is similar to nodejs
    if filename=='index' then twoside._modules[modulePath] = module
    require = (path) ->
      requiredModule  = twoside._modules[path]
      if requiredModule then return requiredModule
      path = path.slice(0, path.lastIndexOf(".")) # remove .js, .coffee, .json extension name
      path = normalize(modulePath+'/'+path)
      requiredModule = twoside._modules[path]
      if !requiredModule
        console.log(getStackTrace())
        throw path+' is a wrong twoside module path.'
      requiredModule.exports
    {require:require, exports:exports, module:module}
  twoside._modules = {}
  ### we can alias some external modules.###
  twoside.alias = (path, object) -> twoside._modules[path] = object
  twoside.alias('lodash', _)

  normalize = (path) ->
    if !path || path == '/' then return '/'
    target = []
    for token in path.split('/')
      if token == '..' then target.pop()
      else if token!= '' and token != '.' then target.push(token)
    ### for IE 6 & 7 - use path.charAt(i), not path[i] ###
    head = if path.charAt(0)=='/' or path.charAt(0)=='.' then '/' else ''
    head + target.join('/').replace(/[\/]{2,}/g, '/')
