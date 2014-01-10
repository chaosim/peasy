if typeof window=='object' then {require, exports, module} = twoside('/samples/arithmatic')
do (require=require, exports=exports, module=module) ->

  ###https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
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
  15	condition	right-to-left	?:
  16	yield	right-to-left	yield
  17	assignment right-to-left	=  +=  -=  *=  /=  %=  <<=  >>=  >>>=  &=  ^=  |=
  18	comma	left-to-right	,
  ###

  peasy  = require "../peasy"
  {StateMachine} =   require "./statemachine"

  {in_, charset, letterDigits} = peasy
  _in_ = in_
  identifierChars = '$_'+letterDigits
  identifierCharSet = charset(identifierChars)

  exports.Parser = class Parser extends peasy.Parser
    constructor: ->
      super
      self = @

      number = ->
        text = self.data
        start = cur = self.cur
        base = 10
        c =  text[cur]
        if c=='+' or c=='-' then cur++
        if text[cur]=='0'
          c = text[++cur]
          if c=='x' or c=='X' then base = 16; cur++
        if base==16
          while c = text[cur]
            if not ('0'<=c<='9' or 'a'<=c<='f' or 'A'<=c<='F')
              self.cur = cur
              return text[start...cur]
            cur++
        while c = text[cur]
          if not ('0'<=c<='9') then break
          cur++
        if text[cur]=='.'
          cur++
          while c = text[cur]
            if not ('0'<=c<='9') then break
            cur++
          if text[cur-1]=='.' and (c = text[cur-2]) and not ('0'<=c<='9') then return
        c = text[cur]
        if c=='E' or c=='e'
          cur++
          while c = text[cur]
            if not ('0'<=c<='9') then break
            cur++
          if (c =text[cur-1]) and (c=='E' or c=='e') then return
        self.cur = cur
        text[start...cur]

      string = ->
        text = self.data
        cur = self.cur
        c = text[cur]
        if c=='"' or c=="'" then quote = c
        else return
        result = ''
        cur++
        while 1
          c = text[cur]
          if c=='\\' then result += text[cur+1]; cur += 2;
          else if c==quote
            self.cur = cur+1
            return quote+result+quote
          else if not c then error('expect '+quote)
          else result += c; cur++

      {orp, list, rec, memo, wrap, char, literal, spaces, eoi, identifier} = self

      question = char('?'); colon = char(':'); comma = char(','); dot = char('.')
      lpar = char('('); rpar = char(')')
      lbracket = char('['); rbracket = char(']')

      myop = (op) ->
        if op.length==1 then opFn = char(op) else opFn = literal(op)
        if _in_(op[0], identifierCharSet)
          -> spaces() and (op=opFn()) and spaces() and not _in_(data[self.cur], identifierCharSet) and ' '+op+' '
        else -> spaces() and (op=opFn()) and spaces() and op

      posNeg = (op) ->
        opFn = char(op)
        -> spaces() and (op=opFn()) and (c = self.data[self.cur]) and c!='.' and not('0'<=c<='9') and spaces() and op
      positive = posNeg('+'); negative = posNeg('-')
      new_ = myop('new')
      inc = myop('++'); dec = myop('--')
      not1 = orp(myop('!'), myop('not'))
      not_ = -> not1()
      bitnot = myop('~')
      typeof_ = myop('typeof');  void_ = myop('void'); delete_ = myop('delete')
      unaryOp = orp(not_, bitnot, positive, negative, typeof_, void_)
      comma = myop(',')
      assign = myop('=');
      addassign = myop('+='); subassign = myop('-=')
      mulassign = myop('*='); divassign = myop('/='); modassign = myop('%='); idivassign = myop('//=')
      rshiftassign = myop('>>='); lshiftassign = myop('<<='); zrshiftassign = myop('>>>=')
      bitandassign = myop('&='); bitxorassign = myop('^='); bitorassign = myop('|=')

      error = (msg) -> throw self.data[self.cur-20..self.cur+20]+' '+self.cur+': '+msg
      expect = (fn, msg) -> fn() or error(msg)

      incDec = orp(inc, dec)
      prefixExpr = -> (op=incDec()) and (x=headExpr()) and op+x
      suffixExpr = -> (x=headExpr()) and (op=incDec()) and x+op

      paren = (item, left=lpar, right=rpar, msg='expect ) to match (') ->
        if (typeof item)=='string' then left = self.literal(item)
        if (typeof left)=='string' then left = self.literal(left)
        if (typeof right)=='string' then right = self.literal(right)
        -> start=self.cur; left() and (x=item()) and expect(right, msg+' at: '+start) and x

      paren1 = paren(-> (spaces() and (x=expression()) and spaces() and x))
      parenExpr = memo -> (x=paren1()) and '('+x+')'
      atom = memo orp(parenExpr, number, string, identifier)
      newExpr = -> new_() and (x=callProp()) and 'new '+x
      unaryTail = orp(prefixExpr, suffixExpr, atom)
      unaryExpr = -> (op=unaryOp()) and (x=unaryTail()) and op+x

      bracketExpr1 = wrap(paren(wrap(-> commaExpr()), lbracket, rbracket, 'expect ) to match ('))
      bracketExpr = -> (x=bracketExpr1()) and '['+x+']'
      wrapDot = wrap(dot)
      dotIdentifier = -> wrapDot() and (id=expect(identifier, 'expect identifier')) and '.'+id
      attr = orp(bracketExpr, dotIdentifier)
      param = paren -> (spaces() and (x=expression()) and spaces() and expect(rpar,'expect )')) or ' '
      paramExpr = memo -> (x=param()) and '('+x+')'
      callPropTail = orp(paramExpr, attr)
      callPropExpr = rec -> (h=headExpr()) and (((e=callPropTail()) and h+e) or h)
      property = rec -> (h=headExpr()) and (((e=attr()) and h+e) or h)
      headAtom = memo orp(parenExpr, identifier)
      headExpr = memo orp(callPropExpr, headAtom)
      simpleExpr = memo orp(unaryExpr, prefixExpr, suffixExpr, callPropExpr, newExpr, atom)

      binaryOpPriorityMap =
        5: ['*', '/', '//', '%']
        6: ['+', '-']
        7: ['<<', '>>', '>>>']
        8: ['<', '<=', '>', '>=', 'in ', 'in\t', 'instanceof ', 'instanceof\t']
        9: ['==', '!=', '==', '===']
        10: ['&']
        11: ['|']
        12: ['^']
        13: ['&&']
        14: ['||']
        17: [',']

      binaryOpItems = []
      do -> for k, ops of binaryOpPriorityMap
        for op in ops then binaryOpItems.push [op, {text:op, pri:parseInt(k)}]

      binarysm = new StateMachine(binaryOpItems)

      binaryOperator = memo ->
        m = binarysm.match(self.data, self.cur)
        if m[0] then self.cur = m[1]; m[0]

      expr = (n) ->
        binary = rec ->
          if x = binary()
            beforeOp = self.cur
            if (op=binaryOperator()) and (n>=op.pri>=x.pri) and (fn=expr(op.pri)) and y=fn()
              {text: x.text+op.text+y.text, pri:op.pri}
            else self.cur = beforeOp; x
          else if x=simpleExpr() then {text:x, pri:4}

      orBinary = expr(15)
      logicOrExpr = -> (x = orBinary()) and x.text
      wrapQuestion = wrap(question); wrapColon = wrap(colon)
      condition = -> (x=logicOrExpr()) and ((wrapQuestion() and (y=assignExpr()) and expect(wrapColon, 'expect :') and (z=assignExpr()) and x+'? '+y+': '+z) or x)
      assignOperator = orp(assign, addassign, subassign,  mulassign, divassign, modassign, idivassign,
        rshiftassign, lshiftassign, zrshiftassign, bitandassign,  bitxorassign, bitorassign)
      assignExpr_ = -> if (v=property()) and (op=assignOperator()) then (e = expect(assignExpr, 'expect the right hand side of assign.')) and v+op+e
      assignExpr = orp(assignExpr_, condition)
      expression_ = list(assignExpr, wrap(comma))
      expression = -> x = expression_(); if x then x.join(',')

      @root = -> (x=expression()) and expect(eoi, 'expect end of input') and x