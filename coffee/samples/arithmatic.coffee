if typeof window=='object' then {require, exports, module} = twoside('/samples/arithmatic')
do (require=require, exports=exports, module=module) ->

  peasy  = require "../peasy"

  exports.Parser = class Parser extends peasy.Parser
    constructor: ->
      super

      {inCharset, charset, letterDigits} = peasy
      identifierChars = '$_'+letterDigits
      identifierCharSet = charset(identifierChars)

      {char, literal, orp, andp, wrap, spaces, spaces1, rec, memo} = @
      space = orp(char(' '), char('t'))
      lpar = char('('); rpar = char(')')
      lbracket = char('['); rbracket = char(']')

      myop = (op) =>
        if op.length==1 then opFn = char(op) else opFn = literal(op)
        if inCharset(op[0], identifierCharSet)
          => spaces() and opFn() and spaces() and not inCharset(@data[@cur], identifierCharSet)
        else => spaces() and opFn() and spaces()

      new_ = myop('new')
      inc = myop('++'); dec = myop('--')
      not_ = orp(myop('!'), myop('not')); bitnot = myop('~')
      typeof_ = myop('typeof');  void_ = myop('void'); delete_ = myop('delete')
      plus = myop('+'); minus = myop('-')
      mul = myop('*'); div = myop('/'); idiv = myop('//')
      lshift = myop('<<'); rshift = myop('>>'); zrshift('>>>')
      lt = myop('<'); le = myop('<='); gt = myop('>'); ge = myop('>=')
      in_ = myop('in'); instanceof_ = myop('instanceof')
      eq = myop('=='); ne = myop('!='); eq2 = myop('==='); ne2 = myop('!==')
      bitand = myop('&'); bitxor = myop('^'); bitor = myop('|')
      and_ = orp(myop('&&'), myop('and')); or_ = orp(myop('||'), myop('or'))
      comma = myop(',')

      error = (msg) => throw @data[@cur-20..@cur+20]+' '+@cur+': '+msg

      getExpr = (n) =>
        operation = operations[n]
        lower = getExpr(n-1)
        if typeof operation == 'function'
          -> operation() or lower()
        else
          operator = if operation.length==1 then operation[0] else orp(operation...)
          left = @rec =>  ((x = left()) and (op = operator()) and (y=lower()) and x+op+y) or lower()

      atom = memo ->
        (lpar() and spaces() and (x = expr()) and spaces() and ((rpar() and x) or error('expect )')))\
        or number()\
        or string()\
        or identifier()

      parenExpr = memo -> lpar() and expr() and rpar()
      headAtom = memo -> parenExpr() or identifier()
      funcall = rec -> (head = headExpr()) and ((e = parenExpr() and head+e) or head)
      property = rec -> (head = headExpr()) and ((e = parenExpr() and head+e) or head) or oneProperty()
      headExpr = orp(headAtom, funcall, property)


      logicOrExpr = getExpr(14)
      conditional_ = -> logicOrExpr() and spaces() and question() and spaces() and assign() and comma() and assign()
      conditional = getExpr(15)
      assign_ = -> assignLeft() and assignOperator() and conditional()
      assign = getExpr(16)
      expr = getExpr(17)
      @root = => x = expr() and @eof() and x

      #https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
      '''
      Precedence	Operator type	Associativity	Individual operators
      1	new	right-to-left	new
      2	function call	left-to-right	()
      property access	left-to-right	.
      left-to-right	[]
      3	 	++  n/a	--
      4	right-to-left	! ~ +	- typeof void delete
      5	* / % //
      6	+ -
      7	<<  >> >>>
      8	<  <=  >  >=  in  instanceof
      9	==  !=  ===  !==
      10	bitwise-and	left-to-right	&
      11	bitwise-xor	left-to-right	^
      12	bitwise-or	left-to-right	|
      13	logical-and	left-to-right	&&
      14	logical-or	left-to-right	||
      15	conditional	right-to-left	?:
      16	yield	right-to-left	yield
      17	assignment right-to-left	=  +  -=  *=  /=  %=  <<=  >>=  >>>=  &=  ^=  |=
      18	comma	left-to-right	,
      '''
      operations =
        0: atom
        1: -> new_() and expr()
        2: orp(funcall, property)
        3: orp(prefixOperation, suffixOperation)
        4: unary_
        5: [mul, div, idiv]
        6: [plus, minus]
        7: [lshift, rshift, zrshift]
        8: [lt, le, gt, ge, in_, instanceof_]
        9: [eq, ne, eq2, ne2]
        10: [bitand]
        11: [bitxor]
        12: [bitor]
        13: [and_]
        14: [or_]
        15: conditional_
        16: assign_
        17: [comma]

    number: ->
      text = @data
      start = cur = @cur
      symbol = ''
      c =  text[cur++]
      if c=='+' or c=='-' then symbol = c
      if text[cur++]=='0'
        c = text[cur++]
        if 'a'<=c<='z' or 'A'<=c<='Z' then base = c; cur++
      intStart = cur
      if base=='x'
        while c = text[cur++]
          if not ('0'<=c<='9' or 'a'<=c<='z' or 'A'<=c<='Z') then break
      else
        while c = text[cur++]
          if not '0'<=c<='9' then break
      intStop = cur
      dotStart = cur
      if text[cur++]=='.'
        while c = text[cur++]
          if not '0'<=c<='9' then break
      dotStop = cur
      powStart = cur
      c = text[cur++]
      if c=='E' or c=='e'
        while c = text[cur++]
          if not '0'<=c<='9' then break
      powStop = cur
      if base
        if base!='b' and base!='o' and base!='x'
    #      base!='B' and  base!='O' and base!='X'
          error(start, "wrong radix letter:#{base}, \"BbOoXx\" is permitted.")
        if powStop>=powStart+1 or dotStop>dotStart+1
          error(start, "binary, octal or hexidecimal is not permitted to have decimal fraction or exponent.")
        if base=='b'# or base=='B'
    #      base = 'b'
          for c in intPart
            if c>'1' then error(start, "binary number should have only digit 0 or 1.")
        if base=='o'# or base=='B'
    #      base = 'b'
          for c in intPart
            if c>'7' then error(start, "octal number should have only digit 0, 1, 2, 3, 4, 5, 6, 7.")
        if base=='x'# or base=='B'
    #      base = 'b'
          for c in intPart
            if 'g'<=c<='z' or 'G'<=c<='Z'  then error(start, "hexidecimal number have illgegal letter.")

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
          else if not c then error('expect '+quote)

  exports.parser = parser = new Parser

  exports.parse = (text) -> parser.parse(text)