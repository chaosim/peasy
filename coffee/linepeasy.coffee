### an extended parser with lineno and row support ###

peasy = require "./peasy"
exports = module.exports = {}
peasy.extend exports, peasy

exports.Parser = exports.LineParser = class Parser extends peasy.BaseParser
  constructor: ->
    super
    self = @
    lineparser = @lineparser = {}

    @parse = (data, root=self.root, cur=0, lineno=0, row=0) ->
      self.data = data
      self.cur = cur; self.lineno = lineno; self.row = row
      self.ruleStack = {}
      self.cache = {}
      root()

    # make rule left recursive
    lineparser.rec = @rec = (rule) ->
      tag = self.ruleIndex++
      ->
        ruleStack = self.ruleStack
        cache = self.cache[tag] ?= {}
        start = self.cur; lineno = self.lineno; row = self.row
        callStack = ruleStack[start] ?= []
        if tag not in callStack
          callStack.push(tag)
          m = cache[start] ?= {result:undefined, cur:start, lineno: lineno, row:row}
          while 1
            self.cur = start; self.lineno = lineno; self.row = row
            result = rule()
            if not result then result = m.result; self.cur = m.cur; self.lineno = m.lineno; self.row = m.row; break
            else if m.cur==self.cur then m.result = result; break
            else m.result = result; m.cur = self.cur; m.lineno = self.lineno; m.row = self.row
          callStack.pop()
          result
        else
          m = cache[start]
          self.cur = m.cur; self.lineno = m.lineno; self.row = m.row
          m.result

    lineparser.memo = @memo = (rule) ->
      tag = self.ruleIndex++
      =>
        cache = self.cache[tag] ?= {}
        start = self.cur
        m = cache[start]
        if m then self.cur = m.cur; self.lineno = lineno; self.row = row; m.result
        else
          result = rule()
          self.cache[tag][start] = {result: result, cur: self.cur, lineno: self.lineno, row: self.row}
          result

    # combinator *orp* <br/>
    lineparser.orp = @orp = (items...) ->
      items = for item in items
        if (typeof item)=='string' then self.literal(item) else item
      =>
        start = self.cur; lineno = self.lineno; row = self.row
        for item in items
          self.cur = start; self.lineno = lineno; self.row = row
          if result = item() then return result

    # #### matchers and combinators<br/>
    lineparser.andp = @andp = (items...) ->
      items = for item in items
        if (typeof item)=='string' then self.literal(item) else item
      ->
        for item in items
          if not (result = item()) then return
        result

    lineparser.notp = @notp = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      -> not item()

    lineparser.may = @may = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      =>
        start = self.cur; lineno = self.lineno; row = self.row
        if x = item() then x
        else self.cur = start; self.lineno = lineno; self.row = row; true

    # combinator *any*: zero or more times of `item()`
    lineparser.any = @any

    # combinator *some*: one or more times of `item()`
    lineparser.some = @some

    # combinator *times*: match *self.n* times item(), n>=1
    lineparser.times = @times

    # combinator *list*: some times item(), separated by self.separator
    lineparser.list = @list # = (item, separator=self.spaces) ->

    # combinator *listn*: given self.n times self.item separated by self.separator, n>=1
    lineparser.listn = @listn # = (item, n, separator=self.spaces) ->

    # combinator *follow* <br/>
    lineparser.follow = @follow = (item) ->
      if (typeof item)=='string' then item = self.literal(item)
      =>
        start = self.cur; lineno = self.lineno; row = self.row
        x = item(); self.cur = start; self.lineno = lineno; self.row = row; x

    # matcher *literal*<br/>
    # match a text string.<br/>
    # `notice = some combinators like andp, orp, notp, any, some, etc. use literal to wrap a object which is not a matcher.
    lineparser.literal = @literal = (string) ->
      len = string.length
      ->
        cur = self.cur; lineno = self.lineno; row = self.row; data = self.data
        i = 0
        while i<len
          c = string[i]
          if data[i]==c
            i++; cur++
            if c=='\n' then lineno++; row = 0
            else row++
          else return
        self.cur = cur; self.lineno = lineno; self.row = row
        true

    lineparser.step = @step = ->
      if (c=self.data[self.cur])=='\n' then self.lineno++
      else self.row++
      c

    # matcher *char*: match one character<br/>
    lineparser['char'] = @['char'] = (c) -> ->
      if self.data[self.cur]==c
        self.cur++;
        if c=='\n' then self.lineno++; self.row = 0
        else self.row++
        c

    # matcher *wrap*<br/>
    # match left, then match item, match right at last
    lineparser.wrap = @wrap = (item, left=self.spaces, right=self.spaces) ->
      if (typeof item)=='string' then item = self.literal(item)
      -> if left() and result = item() and right() then result

    # matcher *spaces*: zero or more whitespaces, ie. space or tab.<br/>
    lineparser.spaces = @spaces = ->
      data = self.data
      len = 0
      cur = self.cur
      while 1
        if ((c=data[cur++]) and (c==' ' or c=='\t')) then len++ else break
      self.cur += len; self.row += len
      len+1

    # matcher *spaces1*<br/>
    # one or more whitespaces, ie. space or tab.<br/>
    lineparser.spaces1 = @spaces1 = ->
      data = self.data
      cur = self.cur
      len = 0
      while 1
        if ((c=data[cur++]) and (c==' ' or c=='\t')) then lent++ else break
      self.cur += len; self.row += len
      len

    lineparser.eoi = @eoi = -> self.cur>=self.data.length

    # matcher *identifierLetter* = normal version<br/>
    lineparser.identifierLetter = @identifierLetter = ->
      c = self.data[self.cur]
      if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
        self.cur++; self.row++; true

    lineparser.followIdentifierLetter = @followIdentifierLetter = ->
      c = self.data[self.cur]
      (c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9') and c

    lineparser.digit = @digit = -> c = self.data[self.cur];  if '0'<=c<='9' then self.cur++; self.row++; c
    lineparser.letter = @letter = -> c = self.data[self.cur]; if 'a'<=c<='z' or 'A'<=c<='Z' then self.cur++; self.row++; c
    lineparser.lower = @lower = -> c = self.data[self.cur]; if 'a'<=c<='z' then self.cur++; self.row++; c
    lineparser.upper = @upper = -> c = self.data[self.cur]; if 'A'<=c<='Z' then self.cur++; self.row++; c

    lineparser.identifier = @identifier = ->
      data = self.data
      start = cur = self.cur
      c = data[cur]
      if 'a'<=c<='z' or 'A'<=c<='Z' or c=='$' or c=='_' then cur++
      else return
      while 1
        c = data[cur]
        if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or c=='$' or c=='_' then cur++
        else break
      self.row += cur-self.cur
      self.cur = cur
      data[start...cur]

    lineparser.decimal = @decimal = ->
      data = self.data
      nonZeroStart = start = cur = self.cur
      while 1
        c = data[cur]
        if '0'==c then cur++; nonZeroStart++
        else if '1'<=c<='9' then cur++; break
        else break
      if cur==start then return
      while 1
        c = data[cur]
        if  '0'<=c<='9' then cur++
        else break
      self.row += cur-self.cur
      self.cur = cur
      # use array to hold value to avoid that 0 interrupt parsing
      [parseInt(data[nonZeroStart...cur], 10)]

    # binary, hexidecimal, decimal, scientic float
    lineparser.number = @number = ->
      data = self.data
      # nonZeroStart = undefined # if meet . e E then should be 1, else should be cur+1 of first non zero digit.
      # dot = undefined # dot should be cur+1 of '.'
      base = 10
      start = cur = self.cur
      signNext = 0
      c = data[cur]
      if c=='-' then neg = true; c = data[++cur]; signNext = 1
      else if c=='+' then c = data[++cur]; signNext = 1
      if c=='0' and c2 = data[cur+1]
        if c2=='b' or c2=='B' then base = 2; baseStart = cur += 2; c = data[cur]
        else if c2=='x' or c2=='X' then base = 16; baseStart = cur += 2; c = data[cur]
        else c = data[++cur]; meetDigit = true
      if base==2
        while c
          if c=='0' or c=='1' then c = data[++cur]
          else if '2'<=c<='9'
            throw new NumberFormatError(self, 'number format errer: binary integer followed by digit 2-9')
          else break
      else if base==16
        while c
          if  not('0'<=c<='9' or 'a'<=c<='f' or 'A'<=c<='F') then break
          else c = data[++cur]
      if base==2
        if c=='.' or c=='e' or c=='E'
          throw new NumberFormatError(self, 'number format errer: binary integer followed by . or e or E')
        else if '2'<=c<='9'
          throw new NumberFormatError(self, 'number format errer: binary integer followed by digit 2-9')
      if base==16 and c=='.'
        throw new NumberFormatError(self, 'number format errer: hexadecimal followed by .')
      if base!=10
        if cur==baseStart then return
        self.row = self.row+cur-start; self.cur = cur
        v  =  parseInt(data[baseStart...cur], base)
        if neg then v = -v
        return [v]
      # base==10
      while c
        if c=='0' then meetDigit = true; c = data[++cur]
        else if '1'<=c<='9'
          if nonZeroStart==undefined then nonZeroStart = cur
          meetDigit = true; c = data[++cur]
        else if c=='.'
          if nonZeroStart==undefined then nonZeroStart = cur
          break
        else break
      if c=='.'
        c = data[++cur]
        while c
          if c<'0' or '9'<c then break
          else meetDigit = true; c = data[++cur]
      if c=='e' or c=='E'
        if not meetDigit then return
        c = data[++cur]
        if c=='+' or c=='-'
          c = data[++cur]
          if c and(c<'0' or '9'<c) then cur -= 2
          else
            while c
              c = data[++cur]
              if  c<'0' or '9'<c then break
        else if c and (c<'0' or '9'<c) then cur--
        else
          while c
            c = data[++cur]
            if  c<'0' or '9'<c then break
      if not meetDigit then return
      self.row += cur-start; self.cur = cur
      # 0 is false, so it will make parser fail to continue, use result to hold number value
      v  =  parseFloat(data[nonZeroStart...cur])
      if neg then v = -v
      return [v]

    # 'string' or "string", single line string
    lineparser.string = @string = ->
      text = self.data
      start = cur = self.cur; row = self.row
      # lineno = self.lineno;  # lineno should not be changed in single line string
      c = text[cur]
      if c=='"'then quote = c; wrap = "'"; row++
      else if c=="'" then quote = c; wrap='"'; row++
      else return
      cur++
      while 1
        c = text[cur]
        if c=='\n' or c=='\r' then self.error('new line is forbidden in single line string.')
        else if c=='\\'
          c1 = text[cur+1]
          if c1=='\n' or c1=='\r' then self.error('new line is forbidden in single line string.')
          else if not c1 then self.error('unexpect end of input, string is not closed')
          else cur += 2; row+=2
        else if c==quote
          self.cur = cur+1
          self.row = row+1
          return eval(wrap+text[start..cur]+wrap)
        else if not c then self.error('new line is forbidden in string.')
        else cur++; row++;

    # select one action from actions based on item
    lineparser.select = @select # = (item, actions) ->

    # generate a matcher, which select one action from actions based on item()
    lineparser.selectp = @selectp # = (item, actions) ->

parser = exports.parser = new Parser()

exports.parse = (text, root=parser.root, cursor=0, lineno=0, row=0) ->
  parser.parse(text, root, cursor, lineno, row)

exports.NumberFormatError = class NumberFormatError
  constructor: (parser, message) ->
    @cur = parser.cur; @lineno = parser.lineno; @row = parser.row
    @message = message