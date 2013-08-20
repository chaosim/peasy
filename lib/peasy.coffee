# Peasy means parsing is easy
# an easy but powerful parser
# With Peasy, you write the parser by hand, just like to write any other kind of program.
# You need not play ![many balls like that any more.](https://github.com/chaosim/daonode/blob/master/ballacrobatics.jpg)
# You just play ![one ball like so!](https://github.com/chaosim/daonode/blob/master/dolphinball.jpg),

# some global variable used by the parser

text = '' # the text which is being parsed, this could be any sequence, not only strincs.
textLength = 0 # the length of text
cursor = 0  # the current position of parsing, use text[cursor] to get current character in parsed stream

grammar = undefined  # the grammar object which contains all of rules defined for the symbol in grammar.
originalRules = {} # saved the original rules of the grammar.
# store for the left recursive symbol the wrapped function to rule, and before entering them, store it in grammar too.
# when entering them, grammar[symbol] is unwrapped to originalRules[symbol] or memorizeRecursives[symbol]
recursiveRules = {}
memorizedRecursivs = {}
memoRules = {}
symbolDescedentsMap = {}

symbolToTagMap = {}  # {symbol: tag}, from rule symbol map to a shorter memo tag, for memory efficeny
tags = {}  # {tag: true}, record tags that has been used to avoid conflict
parseCache = {} # {tag+start: [result, cursor]}, memorized parser result
functionCache = {} # memorized normal function result

hasOwnProperty = Object.hasOwnProperty

exports.initialize = () ->
  parseCache = {}
  functionCache = {}
  originalRules = {}
  recursiveRules = {}
  memorizedRecursivs = {}
  memoRules = {}
  symbolDescedentsMap = {}
  symbolToTagMap = {}
  tags = {}
  parseCache = {}

# parse @data from @root with @aGrammar function @root
exports.parse = (data, aGrammar, root) ->
  text = data
  textLength = text.length
  cursor = 0
  root = root or aGrammar.rootSymbol
  grammar = aGrammar
  grammar[root](0)

# Peasy provided two method to tell which symbol is left recursive.
# method 1: half by hand.
# use addParentChildren(grammar, parentChildrens...) or addRecursiveCircles(grammar, recursiveCircles...)
# to tell the left calling relations between symbols, and then call computeLeftRecursives(grammar).
# Now everything on left recursives symbol is OK.

# addParentChildrens，addRecursiveCircles，computeLeftRecursives is be used to set left recursive symbol in the grammar

# add direct left call parent->children relation for @parentChildrens to global variable symbolToParentsMap
exports.addParentChildrens = (grammar, parentChildrens...) ->
  map = grammar.parentToChildren ?= {}
  for parentChildren in parentChildrens
    for parent, children of parentChildren
      list = map[parent] ?= []
      for name in children
        if name not in list then list.push name
  null

# add left recursive parent->children relation to @symbolToParentsMap for symbols in @recursiveCircles
exports.addRecursiveCircles = (grammar, recursiveCircles...) ->
  map = grammar.parentToChildren ?= {}
  for circle in recursiveCircles
    i = 0
    length = circle.length
    while i<length
      if i==length-1 then j = 0 else j = i+1
      name = circle[i]
      parent = circle[j]
      list = map[parent] ?= []
      if name not in list then list.push name
      i++
  null

# after addParentChildrens and addLeftRecursiveCircles, find the left group and wrap them with recursive function
exports.computeLeftRecursives = (grammar) ->
  parentToChildren = grammar.parentToChildren
  addDescendents = (symbol, meetTable, descedents) ->
    children =  parentToChildren[symbol]
    for child in children
      if child not in descedents then descedents.push child
      if not meetTable[child] then addDescendents(child, meetTable, descedents)
  symbolDescedentsMap = {}
  for symbol of parentToChildren
    meetTable = {}; meetTable[symbol] = true
    descendents = symbolDescedentsMap[symbol] = []
    addDescendents(symbol, meetTable, descendents)
    if symbol in descendents
      originalRules[symbol] = grammar[symbol]
      grammar[symbol] = recursive(symbol)
  symbolDescedentsMap

# make @symbol a left recursive symbol, which means to wrap originalRules[symbol] with recursive,
# when recursiv(symbol)(start) is executed,
# restore all other symbol in left recursive cirle,
# and loop computing originalRules[symbol] until no more changes happened
exports.recursive = recursive = (symbol) ->
  (start) ->
    for child in symbolDescedentsMap[symbol]
      grammar[child] = originalRules[child]
    rule = grammar[symbol]
    hash = symbol+start
    m = parseCache[hash] ?= [undefined, -1]
    if m[1]>=0 then cursor = m[1]; return m[0]
    while 1
      result = rule(start)
      if m[1]<0
        m[0] = result
        if result then  m[1] = cursor
        else m[1] = start
        continue
      else
        if m[1]==cursor then m[0] = result; return result
        else if cursor<m[1] then m[0] = result; cursor = m[1]; return result
        else m[0] = result; m[1] = cursor
    for child in symbolDescedentsMap[symbol]
      grammar[child] = recursive(child)
    result

# check whether property = @grammar[@name] is a grammar rule?
# if property is not function, or property(undefined) does not change cursor to a nonzero, then it is not rule.
# the property is a combinator like andp, any and so on, property('') will not touch cursor,
# so cursor should keep its value unchanged.
isRule = (grammar, name) ->
  if hasOwnProperty.call(functionCache, name) then return functionCache[name]
  if not hasOwnProperty.call(grammar, name) then result = false
  else
    property = grammar[name]
    if typeof(property)!= "function"  then result = false
    else
      try if typeof(property(spaces))=="function"  then result = false
      catch e then result =  true
  functionCache[name] = result
  result

# automatic compute left recursive rules
exports.autoComputeLeftRecursives = computeLeftRecursives = (grammar) ->
  originalRules = {}
  for symbol of grammar
    if not isRule(grammar, symbol) then break
    originalRules[symbol] = grammar[symbol]
  parentToChildren = {}
  currentLeftHand = null # declare a closure variable for probe function
  # replace every grammar symbol's rule with a probe function
  # by running this probe function, the parent-children left call relation will be built up automaticlly.
  for symbol of grammar
    if not isRule(grammar, symbol) then break
    do (symbol = symbol) ->
      grammar[symbol] = (start) ->
        if start!=0 then return
        else
          cursor++
          children = parentToChildren[currentLeftHand] ?= []
          if symbol not in children then children.push symbol
  for symbol of grammar
    if not isRule(grammar, symbol) then break
    currentLeftHand = symbol
    originalRules[symbol](0)
  # find all left recursives circles in grammar.
  appendToPaths = (symbol, meetTable, paths) ->
    if not (chidlren = parentToChildren[symbol]) then return
    for child in chidlren
      for path in paths
        length = path.length
        if length>1 and path[length-1]==path[0] then continue
        else if child in path
          if child==path[0] then path.push child
          else continue
        else path.push child
      if not meetTable[child] then appendToPaths(child, meetTable, paths)
  symbolPathsMap = {}
  for symbol of grammar
    if not isRule(grammar, symbol) then break
    meetTable = {}; meetTable[symbol] = true
    paths = symbolPathsMap[symbol] ?= [[symbol]]
    appendToPaths(symbol, meetTable, paths)
    i = 0
    pathsCount = paths.length
    circles = []
    while i<pathsCount
      path = paths[i++]
      length = path.length
      if path[length-1]==symbol then path.pop(); circles.push path
    if circles.length then symbolPathsMap[symbol] = circles
    else delete symbolPathsMap[symbol]
  # examples below should set one and only one of C or D as memo('C') or memo('D')
  # but it is very complicated and errorable to implement this.
  # A: B C D | D C
  # C: D
  # D: C
  for symbol of grammar
    if not isRule(grammar, symbol) then continue
    if not hasOwnProperty.call(symbolPathsMap, symbol)
      grammar[symbol] = originalRules[symbol]
      delete originalRules[symbol]
      continue
    descendents = symbolDescedentsMap[symbol] = []
    grammar[symbol] = recursiveRules[symbol] = autoRecursive(symbol)
    memoRules[symbol] = memo(symbol)
    circles = symbolPathsMap[symbol]
    for circle in circles
      length = circle.length
      memorized = false
      for i in [0...length]
        sym = circle[i]
        if sym not in descendents then descendents.push sym
        if memorizedRecursivs[sym] then memorized = true
        if i==length-1 and not memorized then memorizedRecursivs[sym] = memoAutoRecursive(sym)
  symbolPathsMap = undefined
  functionCache = undefined

# make @symbol a left recursive symbol, which means to wrap originalRules[symbol] with recursive,
# when recursiv(symbol)(start) is executed,
# restore all other symbol in left recursive cirle,
# and loop computing originalRules[symbol] until no more changes happened
autoRecursive = (symbol) ->
  (start) ->
    for child in symbolDescedentsMap[symbol]
      memoRule =  memorizedRecursivs[child]
      if memoRule then grammar[child] = memoRule
      else grammar[child] = originalRules[child]
    hash = symbol+start
    m = parseCache[hash] ?= [undefined, -1]
    if m[1]>=0 then cursor = m[1]; return m[0]
    rule = grammar[symbol]
    while 1
      result = rule(start)
      if m[1]<0
        m[0] = result
        if result then  m[1] = cursor
        else m[1] = start
        continue
      else
        if m[1]==cursor then m[0] = result; return result
        else if cursor<m[1] then m[0] = result; cursor = m[1]; return result
        else m[0] = result; m[1] = cursor
    for child in symbolDescedentsMap[symbol]
      grammar[child] = recursiveRules[child]
    result

memoAutoRecursive = (symbol) ->
  rule = originalRules[symbol]
  (start) ->
    descendents = symbolDescedentsMap[symbol]
    for child in descendents
      grammar[child] = memoRules[child]
    result = rule(start)
    for child in descendents
      memoRecursive =  memorizedRecursivs[child]
      if memoRecursive then grammar[child] = memoRecursive
      else grammar[child] = originalRules[child]
    result


# some utilities used by the parser
# on succeed any matcher should not return a value which is not null or undefined, except the root symbol.

# set a shorter start part of symbol as the tag used in parseCache
setMemoTag = (symbol) ->
  i = 1
  while 1
    if hasOwnProperty.call(tags, symbol.slice(0, i)) in tags then i++
    else break
  tag = symbol.slice(0, i)
  symbolToTagMap[symbol] = tag
  tags[tag] = true

# set the symbols in grammar which  memorize their rule's result.
setMemorizeRules = (grammar, symbols) ->
  for symbol in symbols
    originalRules[symbol] = grammar[symbol]
    grammar[symbol] = memorize(symbol)

# memorize result and cursor for @symbol which is not left recursive.
# left recursive should be wrapped by recursive(symbol)!!!
memorize = (symbol) ->
  tag = symbolToTagMap[symbol]
  rule = originalRules[symbol]
  (start) ->
    hash = tag+start
    m = parseCache[hash]
    if m then cursor = m[1]; m[0]
    else
      result = rule(start)
      parseCache[hash] = [result, cursor]
      result

# lookup the memorized result and reached cursor for @symbol at the position of @start
exports.memo = memo = (symbol) ->
  (start) ->
    hash = symbol+start
    m = parseCache[hash]
    if m then m[0]

# compute exps in sequence, return the result of the last one.
# andp and orp are used to compose the matchers
# the effect is the same as by using the Short-circuit evaluation, like below:
# exps[0](start) and exps[2](cursor] ... and exps[exps.length-1](cursor)
exports.andp = (exps) ->
  exps = for exp in exps
    if isString(exp) then literal(exp) else exp
  (start) ->
    cursor = start
    for exp in exps
      if not(result = exp(cursor)) then return
    return result

# compute exps in parallel, return the result of the first which is not evaluated to false.
# the effect is the same as by using the Short-circuit evaluation, like below:
# exps[0](start) or exps[2](cursor] ... or exps[exps.length-1](cursor)
exports.orp = (exps...) ->
  exps = for exp in exps
    if isString(exp) then literal(exp) else exp
  (start) ->
    for exp in exps
      if result = exp(start) then return result
      return result

# applicaton of not operation
# notp is not useful  except to compose the matchers.
# It's not unnessary, low effecient and ugly to write "notp(exp)(start)",
# so don't write "notp(exp)(start)", instead "not exp(start)".
exports.notp = (exp) ->
  if isString(exp) then exp = literal(exp)
  (start) -> not exp(start)

# any: zero or more times of @exp(start)
exports.any = (exp) ->
  if isString(exp) then exp = literal(exp)
  (start) ->
    result = []; cursor = start
    while ( x = exp(cursor)) then result.push(x)
    result

# any: one or more times of @exp(start)
exports.some = (exp) ->
  if isString(exp) then exp = literal(exp)
  (start) ->
    result = []; cursor = start

    if not (x = exp(cursor)) then return x
    while 1
      result.push(x)
      x = exp(cursor)
      if not x then break
    result

# maybe exp(start)
exports.may = exports.optional = (exp) ->
  if isString(exp) then exp = literal(exp)
  (start) ->
    cursor = start
    if x = exp(cursor) then x
    else cursor = start; true

# follow exp(start)?
# whether succeed or not, cursor is reset to start
exports.follow = (exp) ->
  if isString(exp) then exp = literal(exp)
  (start) ->
    cursor = start
    if x = exp(cursor) then cursor = start; x

# given @n times @exp, n>=1
exports.times = (exp, n) ->
  if isString(exp) then exp = literal(exp)
  (start) ->
    cursor = start; i = 0
    while i++<n
      if x = exp(cursor) then result.push(x)
      else return
    return result

# some times @exp separated by @separator
exports.seperatedList = (exp, separator=spaces) ->
  if isString(exp) then exp = literal(exp)
  if isString(separator) then separator = literal(separator)
  (start) ->
    cursor = start
    result = []
    x = exp(cursor)
    if not x then return
    while 1
      result.push(x)
      if not(x = exp(cursor)) then break
    result

# given @n times @exp separated by @separator, n>=1
exports.timesSeperatedList = (exp, n, separator=spaces) ->
  if isString(exp) then exp = literal(exp)
  if isString(separator) then separator = literal(separator)
  (start) ->
    cursor = start
    result = []
    x = exp(cursor)
    if not x then return
    i = 1
    while i++<n
      result.push(x)
      if not(x = exp(cursor)) then break
    result

# As you have seen above, all of these utilities is so simple that you can write them at home by hand.
# To put it them here, it is just being used to demonstrate how easy to write matcher in the method brought by Peasy.

# If you like, you can add a faster version for every matcher, which do not pass @start as parameter
# Don't use the faster version in orp(exps...)!!!

# match one character
exports.char = (c) -> (start) ->
  if text[start]==c then cursor = start+1; return c

exports.char_ = (c) -> () ->
  if text[cursor]==c then cursor++; return c

# match a literal string.
exports.literal = literal = (string) -> (start) ->
  len = string.length
  if text.slice(start,  stop = start+len)==string then cursor = stop; true

exports.literal_ = literal_ = (string) -> (start) ->
  len = string.length
  if text.slice(cursor,  stop = cursor+len)==string then cursor = stop; true

# In spaces, spaces_, spaces1, spaces1_, a tat('\t') is seen as tabWidth spaces,
# which is used in indent style language, such as coffeescript, python, haskell, etc.
# If you don't need this feature, you can rewrite these utilities to remove the code about tab width by yourself easily.

# zero or more whitespaces, ie. space or tab.
exports.spaces = (start) ->
  len = 0
  cursor = start
  text = text
  while 1
    switch text[cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  return len

# faster version, do not pass @start as parameter
# zero or more whitespaces, ie. space or tab.
exports.spaces_ = () ->
  len = 0
  text = text
  while 1
    switch text[cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  len

# one or more whitespaces, ie. space or tab.
exports.spaces1 = (start) ->
  len = 0
  cursor = start
  text = text
  while 1
    switch text[cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  if len then return cursor = cursor; len

# faster version, do not pass @start as parameter
# one or more whitespaces, ie. space or tab.
exports.spaces1_ = () ->
  len = 0
  cursor = start
  while 1
    switch text[cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  if len then return cursor = cursor; len

exports.wrap = (item, left=spaces, right=spaces) ->
  if isString(item) then item = literal(item)
  (start) ->
     if left(start) and result = item(cursor) and right(cursor) then result

exports.getcursor = exports.cur = () -> cursor

exports.setcursor = exports.setcur = (pos) -> cursor = pos

# is a letter used in identifer?
# follow word such as return, break, etc.
# javascript style, '$' is a identifierLetter_
identifierLetter = (start) ->
  start = cursor
  c = text[cursor]
  if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
    cursor++; true

# is a letter used in identifer?
# javascript style, '$' is a identifierLetter_
identifierLetter_ = () ->
  c = text[cursor]
  if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
    cursor++; true

# lookahead whether the following character is a letter used in identifer, don't change cursor?
# javascript style, '$' is a identifierLetter_
followIdentifierLetter_ = () ->
  c = text[cursor]
  c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'

isIdentifierLetter = (c) -> 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_'

ObjecttoString = Object.prototype.toString
exports.isString = isString = (x) -> ObjecttoString.call(x) is '[object String]'

exports.isdigit = (c) -> '0'<=c<='9'
exports.digit = (start) ->
  c = text[start];  if '0'<=c<='9' then cursor = start+1
#faster version, do not pass @start as parameter
exports.digit_ = () ->
  c = text[cursor];  if '0'<=c<='9' then cursor++

exports.isletter = exports.isalpha = (c) -> 'a'<=c<='z' or 'A'<=c<='Z'
exports.letter = exports.alpha = (start) ->
  c = text[start]; if 'a'<=c<='z' or 'A'<=c<='Z' then cursor = start+1
#faster version, do not pass @start as parameter
exports.letter_ = exports.alpha_ = () ->
  c = text[cursor]; if 'a'<=c<='z' or 'A'<=c<='Z' then cursor++

exports.islower = (c) -> 'a'<=c<='z'
exports.lower = (start) ->
  c = text[start]; if 'a'<=c<='z' then cursor = start+1
#faster version, do not pass @start as parameter
exports.lower_ = () ->
  c = text[cursor]; if 'a'<=c<='z' then cursor++

exports.isupper = (c) ->'A'<=c<='Z'
exports.upper = (start) ->
  c = text[start]; if 'A'<=c<='Z' then cursor = start+1
#faster version, do not pass @start as parameter
exports.upper_ = (start) ->
  c = text[cursor]; if 'A'<=c<='Z' then cursor++

exports.identifier = (start) ->
  cursor = start
  c = text[cursor]
  if 'a'<=c<='z' or 'A'<=c<='Z' or 'c'=='$' or 'c'=='_' then cursor++
  else return
  while 1
    c = text[cursor]
    if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_' then cursor++
    else break
  true

# faster version, do not pass @start as parameter
exports.identifier = (start) ->
  c = text[cursor]
  if 'a'<=c<='z' or 'A'<=c<='Z' or 'c'=='$' or 'c'=='_' then cursor++
  else return
  while 1
    c = text[cursor]
    if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_' then cursor++
    else break
  true

# The untilites above is just for providing some examples on how to write matchers for Peasy.
# In fact, It's realy easy peasy to write any matchers for your grammar.
# http://en.wiktionary.org/wiki/easy_peasy
# you can embedde your grammar rules with other features seamless,
# such as lexer, rewriter, semantic action, error process( error reporting, error recovering)
# you can dynamicly modify your parser's grammar rules, dynamic update the parsed text, if you wish.

# With the method provided by Peasy, you can parse stream which is not text or stream,
# including list, binary stream, or other data structure, like tree, graph, and so on.
