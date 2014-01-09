if typeof window=='object' then {require, exports, module} = twoside('/peasy')
do (require=require, exports=exports, module=module) ->
# The two lines above make this module can be used both in browser(with twoside.js) and on node.js

  exports.Parser = class Parser

    constructor:  ->
      self = @
      @ruleIndex = 0

      @parse = (data, root=self.root, cur=0) ->
        self.data = data
        self.cur = cur
        self.ruleStack = {};
        self.cache = {};
        root()

      # make rule left recursive
      @rec = (rule) ->
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
              if m[1]==self.cur then m[0] = result; break
              m[0] = result; m[1] = self.cur
            callStack.pop()
            result
          else
            m = cache[start]
            self.cur = m[1]
            m[0]

      @memo = (rule) ->
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
      @orp = (items...) ->
        items = for item in items
          if (typeof item)=='string' then self.literal(item) else item
        =>
          start = self.cur
          length = items.length
          for item in items
            self.cur = start
            if result = item() then return result

      # #### matchers and combinators<br/>
      @andp = (items...) ->
        items = for item in items
          if (typeof item)=='string' then self.literal(item) else item
        ->
          for item in items
            if not (result = item()) then return
          result

      @notp = (item) ->
        if (typeof item)=='string' then item = self.literal(item)
        -> not item()

      @may = (item) ->
        if (typeof item)=='string' then item = self.literal(item)
        =>
          start = self.cur
          if x = item() then x
          else self.cur = start; true

      # combinator *any*: zero or more times of `item()`
      @any = (item) ->
        if (typeof item)=='string' then item = self.literal(item)
        =>
          result = []
          while (x = item()) then result.push(x)
          result

      # combinator *some*: one or more times of `item()`
      some = (item) ->
        if (typeof item)=='string' then item = self.literal(item)
        ->
          if not (x = item()) then return
          result = [x]
          while (x = item()) then result.push(x)
          result

      # combinator *times*: match *self.n* times item(), n>=1
      @times = (item, n) ->
        if (typeof item)=='string' then item = self.literal(item)
        ->
          i = 0
          while i++<n
            if x = item() then result.push(x)
            else return
          result

      # combinator *list*: some times item(), separated by self.separator
      @list = (item, separator=self.spaces) ->
        if (typeof item)=='string' then item = self.literal(item)
        if (typeof separator)=='string' then separator = self.literal(separator)
        ->
          if not (x = item()) then return
          result = [x]
          while separator() and (x=item()) then result.push(x)
          result

      # combinator *listn*: given self.n times self.item separated by self.separator, n>=1
      @listn = (item, n, separator=self.spaces) ->
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
      @follow = (item) ->
        if (typeof item)=='string' then item = self.literal(item)
        =>
          start = self.cur
          x = item(); self.cur = start; x

      # matcher *literal*<br/>
      # match a text string.<br/>
      # `notice = some combinators like andp, orp, notp, any, some, etc. use literal to wrap a object which is not a matcher.
      @literal = (string) -> ->
        len = string.length
        start = self.cur
        if self.data.slice(start, stop = start+len)==string then self.cur = stop; true

      # matcher *char*: match one character<br/>
      @char = (c) -> -> if self.data[self.cur]==c then self.cur++; c

      # matcher *spaces*: zero or more whitespaces, ie. space or tab.<br/>
      @spaces = ->
        data = self.data
        len = 0
        cur = self.cur
        while 1
          if ((c=data[cur++]) and (c==' ' or c=='\t')) then len++ else break
        self.cur += len
        len+1

      # matcher *spaces1*<br/>
      # one or more whitespaces, ie. space or tab.<br/>
      @spaces1 = ->
        data = self.data
        cur = self.cur
        len = 0
        while 1
          if ((c=data[cur++]) and (c==' ' or c=='\t')) then lent++ else break
        self.cur += len
        len

      @eoi = -> self.cur==self.data.length

      # matcher *wrap*<br/>
      # match left, then match item, match right at last
      @wrap = (item, left=self.spaces, right=self.spaces) ->
        if (typeof item)=='string' then item = self.literal(item)
        -> if left() and result = item() and right() then result

      # matcher *identifierLetter* = normal version<br/>
      @identifierLetter = ->
        c = self.data[self.cur]
        if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
          self.cur++; true

      @followIdentifierLetter_ = ->
        c = self.data[self.cur]
        (c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9') and c

      @digit = -> c = self.data[self.cur];  if '0'<=c<='9' then self.cur++; c
      @letter = -> c = self.data[self.cur]; if 'a'<=c<='z' or 'A'<=c<='Z' then self.cur++; c
      @lower = -> c = self.data[self.cur]; if 'a'<=c<='z' then self.cur++; c
      @upper = -> c = self.data[self.cur]; if 'A'<=c<='Z' then self.cur++; c

      @identifier = ->
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

      @number = ->
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

      @string = ->
        text = self.data
        start = cur = self.cur
        c = text[cur]
        if c=='"' or c=="'" then quote = c
        else return
        cur++
        while 1
          c = text[cur]
          if c=='\\' then cur += 2
          else if c==quote
            self.cur = cur+1
            return text[start..cur]
          else if not c then return

  ### some utilities for parsing ###
  exports.charset = charset = (string) ->
    dict = {}
    for x in string then dict[x] = true
    dict

  exports.inCharset = exports.in_ = (c, set) -> set.hasOwnProperty(c)

  exports.isdigit = (c) -> '0'<=c<='9'
  exports.isletter = (c) -> 'a'<=c<='z' or 'A'<=c<='Z'
  exports.islower = (c) -> 'a'<=c<='z'
  exports.isupper = (c) ->'A'<=c<='Z'
  exports.isIdentifierLetter = (c) -> c=='$' or c=='_' or 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9'

  exports.digits = digits = '0123456789'
  exports.lowers = lowers = 'abcdefghijklmnopqrstuvwxyz'
  exports.uppers = uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  exports.letters = letters = lowers+uppers
  exports.letterDigits = letterDigits = letterDigits

