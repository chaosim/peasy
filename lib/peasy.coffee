# Peasy means parsing is easy
# an easy but powerful parser
# With Peasy, you write the parser by hand, just like to write any other kind of program.
# You need not play ![many balls like that any more.](https://github.com/chaosim/daonode/blob/master/ballacrobatics.jpg)
# You just play ![one ball like so!](https://github.com/chaosim/daonode/blob/master/dolphinball.jpg),

# some global variable used by the parser
grammar = undefined  # the grammar object which contains all of rules defined for the symbol in grammar.
originalRules = {} # saved the original rules of the grammar.

# some global variable used by the parser
text = '' # the text which is being parsed, this could be any sequence, not only strincs.
textLength = 0 # the length of text
cursor = 0  # the current position of parsing, use text[cursor] to get current character in parsed stream
symbolDescedentsMap = {}
memoCache = {}

symbolToTagMap = {}  # {symbol: tag}, from rule symbol map to a shorter memo tag, for memory efficeny
tags = {}  # {tag: true}, record tags that has been used to avoid conflict
_memo = {} # {tag+start: [result, cursor]}, memorized parser result

hasOwnProperty = Object.hasOwnProperty

# parse @data from @start with @aGrammar function @start
exports.parse = (data, aGrammar, start) ->
  start = start or aGrammar.rootSymbol
  text = data
  textLength = text.length
  cursor = 0
  memoCache = {}
  grammar = aGrammar
  grammar[start](0)

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

# initialize: clear originalRules and set originalRules to grammar's rules
# and then automatic compute left recursives
exports.prepareGrammar = prepareGrammar = (grammar) ->
  originalRules = {}
  autoComputeLeftRecursives(grammar)

# automatic compute left recursive rules
exports.autoComputeLeftRecursives = computeLeftRecursives = (grammar) ->
  currentLeftHand = null
  # replace every grammar symbol's rule with a probe function
  # by running this probe function, the parent-children left call relation will be built up automaticlly.
  for symbol of grammar
    if hasOwnProperty.call(grammar, symbol)
      do (symbol = symbol) ->
        grammar[symbol] = (start) ->
          if start!=0 then return
          else
            cursor++
            children = parentToChildren[currentLeftHand] ?= []
            if symbol not in children then children.push symbol
  for symbol of grammar
    currentLeftHand = symbol
    originalRules[symbol](0)
  # find all left recursives circles in grammar.
  addDescendents = (symbol, meetTable, descedents) ->
    if not (chidlren = parentToChildren[symbol]) then return
    for child in chidlren
      if child not in descedents then descedents.push child
      if not meetTable[child] then addDescendents(child, meetTable, descedents)
  symbolDescedentsMap = {}
  for symbol of grammar
    meetTable = {}; meetTable[symbol] = true
    descendents = symbolDescedentsMap[symbol] = []
    addDescendents(symbol, meetTable, descendents)
    if symbol in descendents
      grammar[symbol] = recursiveRules[symbol] = recursive(symbol)
      memoRules[symbol] = memo(symbol)
      recRules[symbol] = rec(symbol)
    else grammar[symbol] = originalRules[symbol]
  # remove unnessary entry for symbol in grammar
  for symbol of grammar
    if not hasOwnProperty.call(recursiveRules, symbol)
      delete symbolDescedentsMap[symbol]
    else
      descendents = symbolDescedentsMap[symbol]
      symbolDescedentsMap[symbol] = (symbol for symbol in descendents if hasOwnProperty.call(recursiveRules, symbol))
  return symbolDescedentsMap

# make @symbol a left recursive symbol, which means to wrap originalRules[symbol] with recursive,
# when recursiv(symbol)(start) is executed,
# restore all other symbol in left recursive cirle,
# and loop computing originalRules[symbol] until no more changes happened
exports.recursive = recursive = (symbol) ->
  originalRule = originalRules[symbol]
  (start) ->
    for child in symbolDescedentsMap[symbol]
      if child isnt symbol then grammar[child] = originalRules[child]
    hash = symbol+start
    m = memoCache[hash] ?= [undefined, -1]
    if m[1]>=0 then cursor = m[1]; return m[0]
    while 1
      result = originalRule(start)
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
      if child isnt symbol then grammar[child] = recursive(child)
    result

# some utilities used by the parser
# on succeed any matcher should not return a value which is not null or undefined, except the root symbol.

# set a shorter start part of symbol as the tag used in _memo
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
    m = _memo[hash]
    if m then cursor = m[1]; m[0]
    else
      result = rule(start)
      _memo[hash] = [result, cursor]
      result

# lookup the memorized result and reached cursor for @symbol at the position of @start
exports.memo = memo = (symbol) ->
  (start) ->
    hash = symbol+start
    m = memoCache[hash]
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
orp = (exps...) ->
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
notp = (exp) ->
  if isString(exp) then exp = literal(exp)
  (start) -> not exp(start)

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
