if typeof window=='object' then {require, exports, module} = twoside('/peasy')
do (require=require, exports=exports, module=module) ->
# The two lines above make this module can be used both in browser(with twoside.js) and on node.js

  exports.isMatcher = isMatcher = (item) ->  typeof(item)=="function"

  exports.charset = charset = (string) ->
    dict = {}
    for x in string then dict[x] = true
    dict

  exports.inCharset = (c, set) -> set.hasOwnProperty(c)

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

  exports.Parser = class Parser
    constructor:  -> @ruleIndex = 0

    parse: (@data, root=@root, @cur=0) -> @ruleStack = {}; @cache = {}; root()

    # make rule left recursive
    rec: (rule) ->
      tag = @ruleIndex++
      =>
        ruleStack = @ruleStack
        cache = @cache[tag] ?= {}
        start = @cur
        callStack = ruleStack[start] ?= []
        if tag not in callStack
          callStack.push(tag)
          m = cache[start] ?= [undefined, start]
          while 1
            @cur = start
            result = rule()
            if not result then result = m[0]; @cur = m[1]; break
            if m[1]==@cur then m[0] = result; break
            m[0] = result; m[1] = @cur
          callStack.pop()
          result
        else
          m = cache[start]
          @cur = m[1]
          m[0]

    memo: (rule) ->
      tag = @ruleIndex++
      =>
        cache = @cache[tag] ?= {}
        start = @cur
        m = cache[start]
        if m then @cur = m[1]; m[0]
        else
          result = rule()
          @cache[tag][start] = [result, @cur]
          result

    # #### matchers and combinators<br/>
    andp: (items...) ->
      items = for item in items
        if not isMatcher(item) then @literal(item) else item
      ->
        for item in items
          if not (result = item()) then return
        result

    # combinator *orp* <br/>
    orp: (items...) ->
      items = for item in items
        if not isMatcher(item) then @literal(item) else item
      =>
        start = @cur
        length = items.length
        for item in items
          @cur = start
          if result = item() then return result

    notp: (item) ->
      if not isMatcher(item) then item = @literal(item)
      -> not item()

    may: (item) ->
      if not isMatcher(item) then item = @literal(item)
      =>
        start = @cur
        if x = item() then x
        else @cur = start; true

    # combinator *any*: zero or more times of `item()`
    any: (item) ->
      if not isMatcher(item) then item = @literal(item)
      =>
        result = []
        while (x = item()) then result.push(x)
        result

    # combinator *some*: one or more times of `item()`
    some: (item) ->
      if not isMatcher(item) then item = @literal(item)
      ->
        if not (x = item()) then return
        result = [x]
        while (x = item()) then result.push(x)
        result

    # combinator *times*: match *@n* times item(), n>=1
    times: (item, n) ->
      if not isMatcher(item) then item = @literal(item)
      ->
        i = 0
        while i++<n
          if x = item() then result.push(x)
          else return
        result

    # combinator *list*: some times item(), separated by @separator
    list: (item, separator=@spaces) ->
      if not isMatcher(item) then item = @literal(item)
      if not isMatcher(separator) then separator = @literal(separator)
      ->
        if not (x = item()) then return
        result = [x]
        while separator() and (x=item()) then result.push(x)
        result

    # combinator *listn*: given @n times @item separated by @separator, n>=1
    listn: (item, n, separator=@spaces) ->
      if not isMatcher(item) then item = @literal(item)
      if not isMatcher(separator) then separator = @literal(separator)
      ->
        if not (x = item()) then return
        result = [x]
        i = 1
        while i++<n
          if separator() and (x=item()) then result.push(x)
          else return
        result

    # combinator *follow* <br/>
    follow: (item) ->
      if not isMatcher(item) then item = @literal(item)
      =>
        start = @cur
        x = item(); @cur = start; x

    # matcher *literal*<br/>
    # match a text string.<br/>
    # `notice = some combinators like andp, orp, notp, any, some, etc. use literal to wrap a object which is not a matcher.
    literal: (string) -> =>
      len = string.length
      start = @cur
      if @data.slice(start, stop = start+len)==string then @cur = stop; true

    # matcher *char*: match one character<br/>
    char: (c) ->  => if @data[@cur]==c then @cur++; c

    # matcher *spaces*: zero or more whitespaces, ie. space or tab.<br/>
    spaces: ->
      data = @data
      len = 0
      cur = @cur
      while 1
        switch data[cur++]
          when ' ' then len++
          when '\t' then len++
          else break
      @cur += len
      len+1

    # matcher *spaces1*<br/>
    # one or more whitespaces, ie. space or tab.<br/>
    spaces1: ->
      data = @data
      cur = @cur
      len = 0
      while 1
        switch data[cur++]
          when ' ' then len++
          when '\t' then len++
          else break
      @cur += len
      len

    eoi: => @cur==@data.length

    # matcher *wrap*<br/>
    # match left, then match item, match right at last
    wrap: (item, left=@spaces, right=@spaces) ->
      if not isMatcher(item) then item = @literal(item)
      ->
         if left() and result = item() and right() then result

    # matcher *identifierLetter* = normal version<br/>
    identifierLetter: ->
      c = @data[@cur]
      if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
        @cur++; true

    followIdentifierLetter_: ->
      c = @data[@cur]
      (c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9') and c

    digit: -> c = @data[@cur];  if '0'<=c<='9' then @cur++; c
    letter: -> c = @data[@cur]; if 'a'<=c<='z' or 'A'<=c<='Z' then @cur++; c
    lower: -> c = @data[@cur]; if 'a'<=c<='z' then @cur++; c
    upper: -> c = @data[@cur]; if 'A'<=c<='Z' then @cur++; c

    identifier: ->
      data = @data
      start = cur = @cur
      c = data[cur]
      if 'a'<=c<='z' or 'A'<=c<='Z' or c=='$' or c=='_' then cur++
      else return
      while 1
        c = data[cur]
        if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or c=='$' or c=='_' then cur++
        else break
      @cur = cur
      data[start...cur]

    number: ->
      data = @data
      cur = @cur
      c = data[cur]
      if  '0'<=c<='9' then cur++
      else return
      while 1
        c = data[cur]
        if  '0'<=c<='9' then cur++
        else break
      @cur = cur
      data[start...cur]

    string: ->
      text = @data
      start = cur = @cur
      c = text[cur]
      if c=='"' or c=="'" then quote = c
      else return
      cur++
      while 1
        c = text[cur]
        if c=='\\' then cur += 2
        else if c==quote
          @cur = cur+1
          return text[start..cur]
        else if not c then return
