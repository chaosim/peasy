{initialize, char, memo, setRules, addRecursiveCircles, computeLeftRecursives
} = parser  = require "../lib/peasy.js"

parse = (text) ->
  rules =
    rootSymbol: 'Add'
    Add: (start) ->
      (x = memo('Add')(start)) and spaces(cursor) and (op = rules.addOp(cursor))\
      and spaces(cursor) and (y = rules.Mul(start)) and [op, x, y]\
      or x\
      or rules. Mul(start)
    Mul: (start) ->
      (x = memo('Mul')(start)) and spaces(cursor) and (op = rules.MulOp(cursor))\
      and spaces(cursor) (y = rules.Unary(start)) and [op, x, y]\
                         or x\
                         or rules.Unary(start)
    Unary: (start) ->
      (op = rules.unaryOp(start)) and spaces(cursor) and x = rules.Unary(cursor) and [op, x]\
      or char('(')(start) and (x = rules.Add(cursor)) and char(')')(cursor) and x\
      or number(start)
    AddOp:(start) -> char('+')(start) or char('-')(start)
    MulOp:(start) -> char('*')(start) or char('/')(start)
  initialize()
  addRecursiveCircles(rules, ['Add'], ['Mul'])
  computeLeftRecursives(rules)
  parser.parse(text, rules)

number = ( start) ->
  cursor = start
  symbol = ''
  c =  text[cursor++]
  if c=='+' or c=='-' then symbol = c
  while c = text[cursor++]
    if c!=' ' and c!='\t' then break
  if text[cursor++]=='0'
    c = text[cursor++]
    if 'a'<=c<='z' or 'A'<=c<='Z' then base = c; cursor++
  intStart = cursor
  if base=='x'
    while c = text[cursor++]
      if not ('0'<=c<='9' or 'a'<=c<='z' or 'A'<=c<='Z') then break
  else
    while c = text[cursor++]
      if not '0'<=c<='9' then break
  intStop = cursor
  dotStart = cursor
  if text[cursor++]=='.'
    while c = text[cursor++]
      if not '0'<=c<='9' then break
  dotStop = cursor
  powStart = cursor
  c = text[cursor++]
  if c=='E' or c=='e'
    while c = text[cursor++]
      if not '0'<=c<='9' then break
  powStop = cursor
  if base
    if base!='b' and base!='o' and base!='x'
#      base!='B' and  base!='O' and base!='X'
      new ParseError(start, "wrong radix letter:#{base}, \"BbOoXx\" is permitted.")
    if powStop>=powStart+1 or dotStop>dotStart+1
      new ParseError(start, "binary, octal or hexidecimal is not permitted to have decimal fraction or exponent.")
    if base=='b'# or base=='B'
#      base = 'b'
      for c in intPart
        if c>'1' then new ParseError(start, "binary number should have only digit 0 or 1.")
    if base=='o'# or base=='B'
#      base = 'b'
      for c in intPart
        if c>'7' then new ParseError(start, "octal number should have only digit 0, 1, 2, 3, 4, 5, 6, 7.")
    if base=='x'# or base=='B'
#      base = 'b'
      for c in intPart
        if 'g'<=c<='z' or 'G'<=c<='Z'  then new ParseError(start, "hexidecimal number have illgegal letter.")
