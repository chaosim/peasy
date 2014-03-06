### an extended parser with lineno and row support ###

BaseParser = require "./parser"

exports = module.exports = class Parser extends BaseParser
  constructor: ->
    super
    self = @

    @parse = (data, root=self.root, cur=0, lineno=0, row=0) ->
      self.data = data
      self.cur = cur
      self.trail = new Trail
      self.ruleStack = {}
      self.cache = {}
      root()
