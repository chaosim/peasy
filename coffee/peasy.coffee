exports.Parser = exports.BaseParser = class Parser
  constructor:  ->
    self = @
    # base collects all members of peasy.Parser, so that the derived parser can be modularized.
    base = @base = {}
    @ruleIndex = 0

    base.parse = @parse = (data, root=self.root, cur=0) ->
      self.data = data
      self.cur = cur
      self.ruleStack = {};
      self.cache = {};
      root()

    # make rule left recursive
    base.rec = @rec = (rule) ->
      tag = self.ruleIndex++
      ->
        ruleStack = self.ruleStack
        cache = self.cache[tag] ?= {}
        start = self.cur
        callStack = ruleStack[start] ?= []
        if tag not in callStack
          callStack.push(tag)
          m = cache[start] ?= [undefined, start]
          while 1
            self.cur = start
            result = rule()
            if not result then result = m[0]; self.cur = m[1]; break
            else if m[1]==self.cur then m[0] = result; break
            else m[0] = result; m[1] = self.cur
          callStack.pop()
          result
        else
          m = cache[start]
          self.cur = m[1]
          m[0]

    base.memo = @memo = (rule) ->
      tag = self.ruleIndex++
      =>
        cache = self.cache[tag] ?= {}
        start = self.cur
        m = cache[start]
        if m then self.cur = m[1]; m[0]
        else
          result = rule()
          self.cache[tag][start] = [result, self.cur]
          result

    # combinator *orp* <br/>
    base.orp = @orp = (items...) ->
      items = for item in items
        if (typeof item)=='string' then self.literal(item) else item
      =>
        start = self.cur
        for item in items
          self.cur = start
          if result = item() then return result

    # #### matchers and combinators<br/>
    base.andp = @andp = (items...) ->
      items = for item in items
        if (typeof item)=='string' then self.literal(item) else item
      ->
        for item in items
          if not (result = item()) then return
        result

    base.notp = @notp = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      -> not item()

    base.may = @may = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      =>
        start = self.cur
        if x = item() then x
        else self.cur = start; true

    # combinator *any*: zero or more times of `item()`
    base.any = @any = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      =>
        result = []
        while (x = item()) then result.push(x)
        result

    # combinator *some*: one or more times of `item()`
    base.some = @some = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      ->
        if not (x = item()) then return
        result = [x]
        while (x = item()) then result.push(x)
        result

    # combinator *times*: match *self.n* times item(), n>=1
    base.times = @times = (item, n) ->
      if (typeof item)=='string' then item = self.literal(item)
      ->
        i = 0
        while i++<n
          if x = item() then result.push(x)
          else return
        result

    # combinator *list*: some times item(), separated by self.separator
    base.list = @list = (item, separator=self.spaces) ->
      if (typeof item)=='string' then item = self.literal(item)
      if (typeof separator)=='string' then separator = self.literal(separator)
      ->
        if not (x = item()) then return
        result = [x]
        while separator() and (x=item()) then result.push(x)
        result

    # combinator *listn*: given self.n times self.item separated by self.separator, n>=1
    base.listn = @listn = (item, n, separator=self.spaces) ->
      if (typeof item)=='string' then item = self.literal(item)
      if (typeof separator)=='string' then separator = self.literal(separator)
      ->
        if not (x = item()) then return
        result = [x]
        i = 1
        while i++<n
          if separator() and (x=item()) then result.push(x)
          else return
        result

    # combinator *follow* <br/>
    base.follow = @follow = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      =>
        start = self.cur
        x = item(); self.cur = start; x

    # matcher *literal*<br/>
    # match a text string.<br/>
    # `notice = some combinators like andp, orp, notp, any, some, etc. use literal to wrap a object which is not a matcher.
    base.literal = @literal = (string) -> ->
      len = string.length
      start = self.cur
      if self.data.slice(start, stop = start+len)==string then self.cur = stop; true

    # matcher *char*: match one character<br/>
    base['char'] = @['char'] = (c) -> -> if self.data[self.cur]==c then self.cur++; c

    # matcher *wrap*<br/>
    # match left, then match item, match right at last
    base.wrap = @wrap = (item, left=self.spaces, right=self.spaces) ->
      if (typeof item)=='string' then item = self.literal(item)
      -> if left() and result = item() and right() then result

    # matcher *spaces*: zero or more whitespaces, ie. space or tab.<br/>
    base.spaces = @spaces = ->
      data = self.data
      len = 0
      cur = self.cur
      while 1
        if ((c=data[cur++]) and (c==' ' or c=='\t')) then len++ else break
      self.cur += len
      len+1

    # matcher *spaces1*<br/>
    # one or more whitespaces, ie. space or tab.<br/>
    base.spaces1 = @spaces1 = ->
      data = self.data
      cur = self.cur
      len = 0
      while 1
        if ((c=data[cur++]) and (c==' ' or c=='\t')) then lent++ else break
      self.cur += len
      len

    base.eoi = @eoi = -> self.cur==self.data.length

    # matcher *identifierLetter* = normal version<br/>
    base.identifierLetter = @identifierLetter = ->
      c = self.data[self.cur]
      if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
        self.cur++; true

    base.followIdentifierLetter = @followIdentifierLetter = ->
      c = self.data[self.cur]
      (c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9') and c

    base.digit = @digit = -> c = self.data[self.cur];  if '0'<=c<='9' then self.cur++; c
    base.letter = @letter = -> c = self.data[self.cur]; if 'a'<=c<='z' or 'A'<=c<='Z' then self.cur++; c
    base.lower = @lower = -> c = self.data[self.cur]; if 'a'<=c<='z' then self.cur++; c
    base.upper = @upper = -> c = self.data[self.cur]; if 'A'<=c<='Z' then self.cur++; c

    base.identifier = @identifier = ->
      data = self.data
      start = cur = self.cur
      c = data[cur]
      if 'a'<=c<='z' or 'A'<=c<='Z' or c=='$' or c=='_' then cur++
      else return
      while 1
        c = data[cur]
        if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or c=='$' or c=='_' then cur++
        else break
      self.cur = cur
      data[start...cur]

    base.number = @number = ->
      data = self.data
      cur = self.cur
      c = data[cur]
      if  '0'<=c<='9' then cur++
      else return
      while 1
        c = data[cur]
        if  '0'<=c<='9' then cur++
        else break
      self.cur = cur
      data[start...cur]

    base.string = @string = ->
      text = self.data
      start = cur = self.cur
      c = text[cur]
      if c=='"'then quote = c; wrap = '"'
      else if c=="'" then quote = c; wrap="'"
      else return
      cur++
      while 1
        c = text[cur]
        if c=='\n' or c=='\r' then self.error('new line is forbidden in single line string.')
        else if c=='\\'
          c1 = text[cur+1]
          if c1=='\n' or c1=='\r' then self.error('new line is forbidden in single line string.')
          else if not c1 then self.error('unexpect end of input, string is not closed')
          else cur += 2
        else if c==quote
          self.cur = cur+1
          return eval(wrap+text[start..cur]+wrap)
        else if not c then self.error('new line is forbidden in string.')
        else cur++

    base.select = @select = (item, actions) ->
      console.log 'select'
      action = actions[item]
      if action then return action()
      defaultAction = actions['default'] or actions['']
      if defaultAction then defaultAction()

    base.selectp = @selectp = (item, actions) -> ->
      test = item()
      if test then self.select actions

exports.debugging = false
exports.testing = false
exports.debug = (message) -> if exports.debugging then console.log message
exports.warn = (message) -> if exports.debugging or exports.testing then console.log message

### some utilities for parsing ###
exports.Charset = (string) ->
    for x in string then @[x] = true
    this
exports.Charset::contain = (ch) -> @hasOwnProperty(ch)
exports.charset = (string) -> new exports.Charset(string)

exports.inCharset = (ch, chars) ->
    exports.warn 'peasy.inCharset(char, set) is deprecated, use set.contain(char) instead.'
    chars.hasOwnProperty(ch)
exports.in_ = exports.inCharset

exports.isdigit = (c) -> '0'<=c<='9'
exports.isletter = (c) -> 'a'<=c<='z' or 'A'<=c<='Z'
exports.islower = (c) -> 'a'<=c<='z'
exports.isupper = (c) ->'A'<=c<='Z'
exports.isIdentifierLetter = (c) -> c=='$' or c=='_' or 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9'

exports.digits = '0123456789'
exports.lowers = 'abcdefghijklmnopqrstuvwxyz'
exports.uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
exports.letters = exports.lowers+exports.uppers
exports.letterDigits = exports.letterDigits

`
// code from lodash.undscore.js
exports.extend =  function (object) {
    if (!object) {
      return object;
    }
    for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {
      var iterable = arguments[argsIndex];
      if (iterable) {
        for (var key in iterable) {
          object[key] = iterable[key];
        }
      }
    }
    return object;
  }

exports.isArray = function(value) {
return value && typeof value == 'object' && typeof value.length == 'number' &&
toString.call(value) == arrayClass || false;
};

exports.isObject = function (value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

`