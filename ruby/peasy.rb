# # Peasy
# ###### Peasy means parsing is easy
# ###### an easy but powerful parser

# To use Peasy, just copy this file to your project, read it, modify it, write the grammar rules,, and
# remove any unnecessary stuffs in Peasy, and parse with the grammar.<br/>
# See [here](#peasysample) for a sample grammar in Peasy.<br/>

# With Peasy, you write the parser by hand, just like to write any other kind of program.<br/>
# You need not play many balls like that any more: <br/><br/>
# ![ballacrobatics.jpg](https://raw.github.com/chaosim/peasy/master/doc/ballacrobatics.jpg)<br/>
# You just play one ball like so: <br/><br/>
# ![dolphinball.jpg](https://raw.github.com/chaosim/peasy/master/doc/dolphinball.jpg)<br/>,

# You can embeded other features in the grammar rules seamless, such as lexer, rewriter, semantic action, error
# process( error reporting, error recovering) or any other tasks; you can dynamicly modify the grammar rules, even
# the parsed object, if you wish.<br/>

# Instead of a tool or a library, Peasy is rather a new method to write parser. As a demonstration, Peasy presents
# itself as a module of single file, which includes some global variables used while parsing, some functions to
# process left recursives symbols, some matchers which parse the text, and some cominators of matchers.<br/>  <br/>

# With the method provided by Peasy, you can parse any object which is not only text, but also array, embedded list,
# binary stream, or other data structures, like tree, graph, and so on.<br/>

# ###### Nothing but the method in Peasy is indispensable:<br/>

# * If there is no left recursive symbol, you can remove the code about that(mainly three functions and 80 lines).<br/>
# * If you don't need memorize the parsed result, you can remove the stuffs about
# memorization(mainly refer to the function `memorize`).<br/>
# * The matchers(e.g. spaces, literal, identifier, etc.) and combinators(e.g. andp, orp, etc) in this module exists just
# for demostrating the method initiated by Peasy. You will see they are all very simple, after seeing them, I bet
# that you would rather to remove them and write them by hand yourself when you write the grammar rules.<br/><br/>

# Peasy provided two method to tell which symbols are left recursive.<br/>
# This module presents the semiautomatic method:<br/>
# At first you write grammar rules in this manner: replace one and only one of
# grmmar.symbol in the grammar rule with memo(symbol) for every left recursive circles. Before parsing, you first call
# intialize(), and tell which symbol are left call or left recursive by calling  addParentChildrens(grammar, parentChildren)
# and/or addRecursiveCircles(grammar, recursiveCircles...), and then call computeLeftRecursives(grammar), now
# everything about left recursive symbols is computed and you can call parse(data, grammar, root) to do the work.

# The notation **@name** in the comment below means a global variable, and **$name** means a parameter. <br/>

# #### global variables<br/>
# It is for the performace reason that I use global variables, and at some time I will provide another version which
# have the class Parser for people who prefer modularization to speed. Of course you can modify the code to have the
# class Parser yourself if you like. It's just a snap to do that.

# some global variable used while parsing<br/>

# the text which is being parsed<br/>
# *Don't be confused by the variable name, it could be not only text strings but also array, sequence, tree, graph,etc.*
text = ''
# the length of @text
textLength = 0
# the current position of parsing, use text[cursor] to get current character in parsed stream
cursor = 0

# the grammar object which contains all of rules defined for the symbol in grammar.
grammar = undefined
# saved the original rules of the grammar.
originalRules = {}

# store the wrapped function to rule of the left recursive symbol with `recursive`, and before entering them, store it in grammar too.
# when entering them, `grammar[symbol]` is unwrapped to `originalRules[symbol]` or `memorizeRecursives[symbol]`
recursiveRules = {}
symbolDescedentsMap = {}

# if you would like to use just symbol itself as the hash head, remove these four lines below and other correlative stuffs.<br/>
# {symbol: tag}, from rule symbol map to a shorter memo tag, for memory efficeny
symbolToTagMap = {}
# {tag: true}, record tags that has been used to avoid conflict
tags = {}

parseCache = {} # {tag+start: [result, cursor]}, memorized parser result
functionCache = {} # memorized normal function result

hasOwnProperty = Object.hasOwnProperty

# #### helper functions
# some functions is helpful to make the parser.

# **intialize**: clear global varialbes. you should call `intialize()` at first.
exports.initialize = () ->
  parseCache = {}
  functionCache = {}
  originalRules = {}
  recursiveRules = {}
  symbolDescedentsMap = {}
  symbolToTagMap = {}
  tags = {}
  parseCache = {}

# **_parse**: parse **$data** from **$root** with **$aGrammar**.<br/>
# before parsing, you should tell the informations about left recursion in grammar.
exports.parse = _parse = (data, aGrammar, root) ->
  text = data
  textLength = text.length
  cursor = 0
  root = root or aGrammar.rootSymbol
  grammar = aGrammar
  grammar[root](0)

# <a id="peasysample"></a>
# **parse**: this is a sample parse function to demonstrate on how to write your own grammar rules yourself.<br/>
# notice that there exists indirect left recursion in the grammar.
parse = (text) ->
  # generate the matchers by the combinators in advance for better performance.<br/>
  # if you don't mind performance, you can write them in the rule directly.
  a = char('a'); b = char('b'); x = char('x')
  memoA = memo('A')
  # the grammar rules object.
  rules =
    A: (start) ->
      # *add `or memoResult` to prevent executing nonrecursive part more than once.*
      (memoResult = m = rules.B(start)) and x(p.cur()) and m+'x' or memoResult\
      or a(start)
    B: (start) -> rules.C(start)
    C: (start) -> memoA(start) or b(start)
    rootSymbol: 'A'
  initialize()
  addRecursiveCircles(rules, ['A', 'B', 'C'])
  computeLeftRecursives(rules)
  _parse(text, rules)

# ##### stuffs for left recursives
# use `addParentChildren(grammar, parentChildrens)` or `addRecursiveCircles(grammar, recursiveCircles...)` to tell
# the left calling relations between symbols in the grammar<br/>

# **addParentChildrens**: add direct left call parent->children relation for **$parentChildrens** to **@symbolToParentsMap**<br/>
# e.g. `addRecursiveCircles(grammar, {A:['B'], B:['A', 'B']})`
exports.addParentChildrens = (grammar, parentChildren) ->
  map = grammar.parentToChildren ?= {}
  for parent, children of parentChildren
    list = map[parent] ?= []
    for name in children
      if name not in list then list.push name
  null

# **addRecursiveCircles**: add left recursive parent->children relation to `grammar.parentToChildren` for symbols in **@recursiveCircles**<br/>
# e.g. `addRecursiveCircles(grammar, ['A', 'B'], ['B'])` tell the same left recursive relations as above sample.
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

# **computeLeftRecursives**: after telling left recursive relations, compute the left recsives group and wrap symbol in
# them with `recursive` function<br/>
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

# **recursive**: this is the key function to left recursive.<br/>
# Make **$symbol** a left recursive symbol, which means to wrap `originalRules[symbol]` with recursive.
# when recursiv(symbol)(start) is executed, first let `rule = grammar[symbol]`, `grammar[symbol] = originalRules[child]` for
# all symbols in left recursive circles and loop computing rule(start) until no changes happened, and
# restore all symbols in left recursive cirle to `recursiveRules[symbol]` at last.,
exports.recursive = recursive = (symbol) ->
  rule = originalRules[symbol]
  (start) ->
    for child in symbolDescedentsMap[symbol]
      grammar[child] = originalRules[child]
    hash = symbol+start
    m = parseCache[hash] ?= [undefined, -1]
    if m[1]>=0 then cursor = m[1]; return m[0]
    while 1
      result = rule(start)
      if m[1]<0
        m[0] = result
        if result then  m[1] = cursor
        else m[1] = start
      else
        if m[1]==cursor then m[0] = result; return result
        else if cursor<m[1] then m[0] = result; cursor = m[1]; return result
        else m[0] = result; m[1] = cursor
    for child in symbolDescedentsMap[symbol]
      grammar[child] = recursiveRules[child]
    result

# ##### memorization

# **memo**: lookup the memorized result and reached cursor for **$symbol** at the position of **$start**<br/>
# It is set up automaticly by `computeLeftRecursives(grammar)` for the symbols which is left recursive.<br/>
# For other symbol, you should be able to call this in rule mannually.
exports.memo = memo = (symbol) ->
  (start) ->
    hash = symbol+start
    m = parseCache[hash]
    if m then m[0]

# **setMemorizeRules**: set the symbols in grammar which  memorize their rule's result.<br/>
# this function should be used only for the symbols which is not left recursives.<br/>
# you can do this after `initialize()` and before `parse(...)`.
setMemorizeRules = (grammar, symbols) ->
  for symbol in symbols
    originalRules[symbol] = grammar[symbol]
    grammar[symbol] = memorize(symbol)

# **memorize**: memorize result and cursor for **$symbol** which is not left recursive.<br/>
# *The symbols which is left recursive should be wrapped by `recursive(symbol)`, not `memorize(symbol)`!!!*
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

# **setMemoTag**: find a shorter part of symbol as the head of hash tag to index **@parseCache** <br/>
# It exists just for performance reason. If you don't like this idea, you can remove the stuffs about memo tag yourself and
# just use symbol itself as the head of hash tag.
setMemoTag = (symbol) ->
  i = 1
  while 1
    if hasOwnProperty.call(tags, symbol.slice(0, i)) then i++
    else break
  tag = symbol.slice(0, i)
  symbolToTagMap[symbol] = tag
  tags[tag] = true

# #### matchers and matcher combinators<br/>

# A **matcher** is a function which read the text being parsed and move cursor directly.<br/>
# All matcher should return truth value on succeed, and return falsic value on fail.<br/>
# A **combinator** is a function which receive zero or more matchers as parameter(maybe plus some other parameters
# which are not matchers), and generate a new matchers.<br/>
# there are other matcher generator besides the standard combinators described as above, like `recursive`, `memo`, `memorize`,
# which we have met above.

isMatcher = (item) ->  typeof(item)=="function"

# combinator **andp**<br/>
# execute item(cursor) in sequence, return the result of the last one. <br/>
# when `andp` is used to combined of the matchers, the effect is the same as by using the Short-circuit evaluation, like below:<br/>
# `item1(start) and item2(cursor] ... and itemn(cursor).`  <br/>
# In fact, you maybe would rather like to use `item1(start) and item2(cursor) ..` when you write the grammar rule in the
# manner of Peasy. That would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule, say like below: <br/>
# `if (x=item1(start) and (x>100) and item2(cursor) and not item3(cursor) and (y = item(cursor)) then doSomething()`
exports.andp = (items) ->
  items = for item in items
    if not isMatcher(item) then literal(item) else item
  (start) ->
    cursor = start
    for item in items
      if not(result = item(cursor)) then return
    return result

# combinator **orp** <br/>
# execute `item(start)` one by one, until the first item which is evaluated to truth value and return the value.<br/>
# when orp is used to combined of the matchers, the effect is the same as by using the Short-circuit evaluation, like below:<br/>
# item1(start) or item2(cursor] ... or itemn(cursor) <br/>
# In fact, you maybe would rather like to use `item1(start) or item2(cursor) ..` when you write the grammar rule in the
# manner of Peasy. That would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule, say like below: <br/>
# `if ((x=item1(start) and (x>100)) or (item2(cursor) and not item3(cursor)) or (y = item(cursor)) then doSomething()`
exports.orp = (items...) ->
  items = for item in items
    if not isMatcher(item) then literal(item) else item
  (start) ->
    for item in items
      if result = item(start) then return result
    result

# combinator **notp**<br/>
# `notp` is not useful except being used in other combinators, just like this: `andp(item1, notp(item2))`.<br/>
# *It's unnessary, low effecient and ugly to write `notp(item)(start)`, just write `not item(start)`.*
exports.notp = (item) ->
  if not isMatcher(item) then item = literal(item)
  (start) -> not item(start)

# combinator **any**: zero or more times of `item(cursor)`
exports.any = (item) ->
  if not isMatcher(item) then item = literal(item)
  (start) ->
    result = []; cursor = start
    while ( x = item(cursor)) then result.push(x)
    result

# combinator **some**: one or more times of `item(cursor)`
exports.some = (item) ->
  if not isMatcher(item) then item = literal(item)
  (start) ->
    result = []; cursor = start
    if not (x = item(cursor)) then return x
    while 1
      result.push(x)
      x = item(cursor)
      if not x then break
    result

# combinator  **may**: a.k.a optional <br/>
# try to match `item(cursor)`, wether `item(cursor)` succeed or not, `maybe(item)(start)` succeed.
exports.may = exports.optional = (item) ->
  if not isMatcher(item) then item = literal(item)
  (start) ->
    cursor = start
    if x = item(cursor) then x
    else cursor = start; true

# combinator **follow** <br/>
# try to match `item(start)`, if succeed, reset cursor and return the value of item(start) <br/>
# whether succeed or not, cursor is reset to start
exports.follow = (item) ->
  if not isMatcher(item) then item = literal(item)
  (start) ->
    cursor = start
    if x = item(cursor) then cursor = start; x

# combinator **times**: match **$n** times item(cursor), n>=1
exports.times = (item, n) ->
  if not isMatcher(item) then item = literal(item)
  (start) ->
    cursor = start; i = 0
    while i++<n
      if x = item(cursor) then result.push(x)
      else return
    result

# combinator **seperatedList**: some times item(cursor), separated by @separator
exports.seperatedList = (item, separator=spaces) ->
  if not isMatcher(item) then item = literal(item)
  if not isMatcher(separator) then separator = literal(separator)
  (start) ->
    cursor = start
    result = []
    x = item(cursor)
    if not x then return
    while 1
      result.push(x)
      if not(x = item(cursor)) then break
    result

# combinator **timesSeperatedList**: given @n times $item separated by @separator, n>=1
exports.timesSeperatedList = (item, n, separator=spaces) ->
  if not isMatcher(item) then item = literal(item)
  if not isMatcher(separator) then separator = literal(separator)
  (start) ->
    cursor = start
    result = []
    x = item(cursor)
    if not x then return
    i = 1
    while i++<n
      result.push(x)
      if not(x = item(cursor)) then break
    result

# As the same as andp, orp, in the manner of Peasy, you would rather to write youself a loop to do the things, instead
# of useing the combinators like any, some, times, seperatedList,etc. and that would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule so that we can do other things include lexer,
# error report, errer recovery, semantic operatons, and any other things you would like to do. <br/>

# It is for three motives to put all of the stuffs abve here:
# * 1. to demonstrate how to write matcher and grammar rules in the method brought by Peasy
# * 2. to demonstrate that Peasy can implement any component that other combinational parser libaries like pyparsing,
# parsec too, but in a simpler, faster manner.
# * 3. to show that it is how easy to write the matchers in the manner of Peasy.<br/><br/>

# As you have seen above, all of these utilities is so simple that you can write them at home by hand easily. In fact,
# you can write yourself all of the grammar rules in the same manner as above.

# If you like, you can add a faster version for every matcher, which do not pass $start as parameter around.<br/>
# Some of the matchers below have two version, to demonstrate how to do that.
# *Don't use the faster version in orp, any, some, times, separatedList, timesSeparatedList.* <br/><br/>

# #### some other matchers, combinators and predicate<br/>
# A **predicate** is a function which return true or false, usually according to its parameter, but not look at parsed object.
# below is some little utilities may be useful. Three version of some of them is provided.<br/>
# just remove them if you don't need them, except **literal**, which is depended by the matchers above.

# matcher **literal**, normal version<br/>
# match a text string.<br/>
# `notice: some combinators like andp, orp, notp, any, some, etc. use literal to wrap a object which is not a matcher.

exports.literal = literal = (string) -> (start) ->
  len = string.length
  if text.slice(start, stop = start+len)==string then cursor = stop; true

# matcher **literal_**, faster version<br/>
# match a text string.
exports.literal_ = literal_ = (string) -> (start) ->
  len = string.length
  if text.slice(cursor,  stop = cursor+len)==string then cursor = stop; true

# matcher **char**, normal version<br/>
# match one character
exports.char = (c) -> (start) ->
  if text[start]==c then cursor = start+1; return c

# matcher **char_**, normal version <br/>
# match one character
exports.char_ = (c) -> () ->
  if text[cursor]==c then cursor++; return c

# In spaces, spaces_, spaces1, spaces1_, a tat('\t') is seen as tabWidth spaces, <br/>
# which is used in indent style language, such as coffeescript, python, haskell, etc. <br/>
# If you don't need this feature, you can easily rewrite these utilities to remove the code about tab width yourself.<br/><br/>

# matcher **spaces**, normal version<br/>
# zero or more whitespaces, ie. space or tab.<br/>
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

# matcher **spaces_**, faster version<br/>
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

# matcher **spaces1**, normal version<br/>
# one or more whitespaces, ie. space or tab.<br/>
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

# matcher **spaces1_**, faster version<br/>
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

# matcher **wrap**, normal version<br/>
# match left, then match item, match right at last
exports.wrap = (item, left=spaces, right=spaces) ->
  if not isMatcher(item) then item = literal(item)
  (start) ->
     if left(start) and result = item(cursor) and right(cursor) then result

# matcher **identifierLetter**: normal version<br/>
# is a letter than can be used in identifer?<br/>
# javascript style, '$' is a identifierLetter_<br/>
identifierLetter = (start) ->
  start = cursor
  c = text[cursor]
  if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
    cursor++; true

# matcher **identifierLetter_**, version<br/>
# is a letter that can be used in identifer? <br/>
# javascript style, '$' is a identifierLetter_
identifierLetter_ = () ->
  c = text[cursor]
  if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
    cursor++; true

# matcher **followIdentifierLetter_**, faster version<br/>
# lookahead whether the following character is a letter used in identifer. don't change cursor. <br/>
# javascript style, '$' is a identifierLetter_
followIdentifierLetter_ = () ->
  c = text[cursor]
  c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'

isIdentifierLetter = (c) -> 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_'

# predicate isdigit<br/>
exports.isdigit = (c) -> '0'<=c<='9'
# matcher digit, normal version<br/>
exports.digit = (start) ->
  c = text[start];  if '0'<=c<='9' then cursor = start+1
# matcher digit_, faster version<br/>
exports.digit_ = () ->
  c = text[cursor];  if '0'<=c<='9' then cursor++

# predicate isletter<br/>
exports.isletter = exports.isalpha = (c) -> 'a'<=c<='z' or 'A'<=c<='Z'
# matcher letter, normal version<br/>
exports.letter = exports.alpha = (start) ->
  c = text[start]; if 'a'<=c<='z' or 'A'<=c<='Z' then cursor = start+1
# matcher letter, faster version<br/>
exports.letter_ = exports.alpha_ = () ->
  c = text[cursor]; if 'a'<=c<='z' or 'A'<=c<='Z' then cursor++

# predicate: islower
exports.islower = (c) -> 'a'<=c<='z'
# matcher lower, normal version
exports.lower = (start) ->
  c = text[start]; if 'a'<=c<='z' then cursor = start+1
#matcher lower_, faster version
exports.lower_ = () ->
  c = text[cursor]; if 'a'<=c<='z' then cursor++

exports.isupper = (c) ->'A'<=c<='Z'
# matcher upper, normal version
exports.upper = (start) ->  c = text[start]; if 'A'<=c<='Z' then cursor = start+1
#matcher upper_, faster version
exports.upper_ = (start) -> c = text[cursor]; if 'A'<=c<='Z' then cursor++

# matcher identifier, normal version
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

# matcher identifier_, faster version
exports.identifier_ = (start) ->
  c = text[cursor]
  if 'a'<=c<='z' or 'A'<=c<='Z' or 'c'=='$' or 'c'=='_' then cursor++
  else return
  while 1
    c = text[cursor]
    if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_' then cursor++
    else break
  true

# The utilites above is just for providing some examples on how to write matchers for Peasy.<br/>
# In fact, It's realy easy peasy to write the matchers for your grammar rule yourself.<br/>
# see [easy peasy]( http://en.wiktionary.org/wiki/easy_peasy ) <br/>

# These utilities below exists for people who want to use these file a independent module, and put the grammar rule in
# another separated file.<br/>

# gettext: get the being pased text<br/>
# If you use this file to contain the grammar rules, just directly use `text`<br/>
# and use `text[cursor]` to get current character, `text.slice(cursor, cursor+n)` to get substring of the text, if
# text is a string object.
exports.gettext = () -> text

# If you use this file to contain the grammar rules, just directly use `cursor` or `cursor = n` or `cursor++` or `cursor--`
exports.getcursor = exports.cur = () -> cursor
exports.setcursor = exports.setcur = (pos) -> cursor = pos


