# # Peasy
# ###### Peasy means parsing is easy
# ###### an easy but powerful parser

# To use Peasy, just require or copy this file to your project, read it, modify it, write the grammar rules,, and
# remove any unnecessary stuffs in it, and parse with the data.@<br/>
# See [here](#peasysample) for a sample grammar in Peasy.<br/>

# With Peasy, you write the parser by hand, just like to write any other kind of program.<br/>
# You need not play many balls like that any more: <br/><br/>
# ![ballacrobatics.jpg](https://raw.github.com/chaosim/peasy/master/doc/ballacrobatics.jpg)<br/>
# You just play one ball like so: <br/><br/>
# ![dolphinball.jpg](https://raw.github.com/chaosim/peasy/master/doc/dolphinball.jpg)<br/>,

# You can embeded other features in the grammar rules seamless, such as lexer, rewriter, semantic action, error
# process or any other tasks; you can dynamicly modify the grammar rules, even the parsed object, if you wish.<br/>

# Instead of a tool or a library, Peasy is rather a new method to write parser. As a demonstration, Peasy presents
# itself as a module of single file, which includes some functions to process left recursives symbols, some matchers
# which parse text, and some matchers and cominators.<br/>  <br/>

# With the method provided by Peasy, you can parse any object which is not only text, but also array, embedded list,
# binary stream, or other data structures, like tree, graph, and so on.<br/>

# ###### Nothing but the method in Peasy is indispensable:<br/>

# * If there is no left recursive symbol, you can remove the code about that(mainly refer to the function `recursive` and 20 lines).<br/>
# * If you don't need memorize the parsed result, you can remove the stuffs about
# memorization(mainly refer to the function `memorize`).<br/>
# * The matchers(e.g. spaces, literal, identifier, etc.) and combinators(e.g. andp, orp, etc) in this module exists just
# for demostrating the method initiated by Peasy. You will see they are all very simple, after seeing them, I bet
# that you would rather to remove them and write them by hand yourself when you write the grammar rules.<br/><br/>

# The notation *@name* below means a parameter. <br/>
# all occurences of *@info* refer to the parsed object and the cursor, e.g. it's initial value can be {data: text, cursor:0}

hasOwnProperty = Object.hasOwnProperty

# A *matcher* is a function which matches the data being parsed and move cursor directly.<br/>
isMatcher = (item) ->  typeof(item)=="function"

# setup data structures in *@rules* for left recursive symbols and memorized symbols
exports.setupGrammar = (info, rules) ->
  rules.parseCache = {}
  rules.__parsingSymbols = {}
  if rules.__originalRules then return rules
  originalRules = rules.__originalRules = {}
  recursiveSymbols = rules.__leftRecursives
  if recursiveSymbols
    for symbol in recursiveSymbols
      originalRules[symbol] = rules[symbol]
      rules[symbol] = recursive(info, rules, symbol)
  memorizeSymbols = rules.__memorizeSymbols
  if memorizeSymbols
    for symbol in memorizeSymbols
      originalRules[symbol] = rules[symbol]
      rules[symbol] = memorize(info, rules, symbol)
  rules

# *recursive*: this is the key function to left recursive.<br/>
# Make *@symbol* a left recursive symbol, which means to wrap `@originalRules[symbol]` with recursive.
# when recursiv(info, rules, symbol)(start) is executed, loop computing rule(start) until no changes happened
recursive = (info, rules, symbol) ->
  rule = rules.__originalRules[symbol]
  (start) ->
    hash = symbol+start
    callPath = rules.__parsingSymbols[start] ?= []
    if symbol not in callPath
      callPath.push(symbol)
      m = rules.parseCache[hash] ?= [undefined, start]
      while 1
        result = rule(start)
        if not result then result = m[0]; info.cursor = m[1]; break
        if m[1]==info.cursor then m[0] = result; break
        else m[0] = result; m[1] = info.cursor
      callPath.pop()
      result
    else
      m = rules.parseCache[hash]
      info.cursor = m[1]
      m[0]

# *memorize*: memorize result and @cursor for *@symbol* which is not left recursive.<br/>
# *The symbols which is left recursive should be wrapped by `recursive(symbol)`, not `memorize(symbol)`!!!*
memorize = (info, rules, symbol) ->
  tag = rules.symbolToTagMap[symbol]
  rule = rules.__originalRules[symbol]
  parseCache = rules.parseCache
  (start) ->
    hash = tag+start
    m = parseCache[hash]
    if m then info.cursor = m[1]; m[0]
    else
      result = rule(start)
      parseCache[hash] = [result, info.cursor]
      result

# *setMemoTag*: find a shorter part of symbol as the head of hash tag to index *@parseCache* <br/>
# It exists just for performance reason. If you don't like this idea, you can remove the stuffs about memo tag yourself and
# just use symbol itself as the head of hash tag.
setMemoTag = (rules, symbol) ->
  i = 1
  while 1
    if hasOwnProperty.call(rules.tags, symbol.slice(0, i)) then i++
    else break
  tag = symbol.slice(0, i)
  rules.symbolToTagMap[symbol] = tag
  rules.tags[tag] = true

# #### matchers and combinators<br/>

# A *matcher* is a function which matches the data being parsed and move cursor directly.<br/>
# All matcher should return truth value on succeed, and return falsic value on fail.<br/>
# A *combinator* is a function which receive zero or more matchers as parameter(maybe plus some other parameters
# which are not matchers), and generate a new matchers.<br/>
# there are other matcher generator besides the standard combinators described as above, like `recursive`, `memo`, `memorize`,
# which we have met above.

# combinator *andp*<br/>
# execute item(info.cursor) in sequence, return the result of the last one. <br/>
# when `andp` is used to combined of the matchers, the effect is the same as by using the Short-circuit evaluation, like below:<br/>
# `item1(start) and item2(info.cursor] ... and itemn(info.cursor).`  <br/>
# In fact, you maybe would rather like to use `item1(start) and item2(info.cursor) ..` when you write the grammar rule in the
# manner of Peasy. That would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule, say like below: <br/>
# `if (x=item1(start) and (x>100) and item2(info.cursor) and not item3(info.cursor) and (y = item(info.cursor)) then doSomething()`
exports.andp = (info, items...) ->
  items = for item in items
    if not isMatcher(item) then literal(info, item) else item
  (start) ->
    info.cursor = start
    for item in items
      if not(result = item(info.cursor)) then return
    result

# combinator *orp* <br/>
# execute `item(start)` one by one, until the first item which is evaluated to truth value and return the value.<br/>
# when orp is used to combined of the matchers, the effect is the same as by using the Short-circuit evaluation, like below:<br/>
# item1(start) or item2(info.cursor] ... or itemn(info.cursor) <br/>
# In fact, you maybe would rather like to use `item1(start) or item2(info.cursor) ..` when you write the grammar rule in the
# manner of Peasy. That would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule, say like below: <br/>
# `if ((x=item1(start) and (x>100)) or (item2(info.cursor) and not item3(info.cursor)) or (y = item(info.cursor)) then doSomething()`
exports.orp = (info, items...) ->
  items = for item in items
    if not isMatcher(item) then literal(infor, item) else item
  (start) ->
    for item in items
      info.cursor = start
      if result = item(start) then return result
    result

# combinator *notp*<br/>
# `notp` is not useful except being used in other combinators, just like this = `andp(item1, notp(item2))`.<br/>
# *It's unnessary, low effecient and ugly to write `notp(item)(start)`, just write `not item(start)`.*
exports.notp = (info, item) ->
  if not isMatcher(item) then item = literal(info, item)
  (start) -> not item(start)

# combinator *any*: zero or more times of `item(info.cursor)`
exports.any = (info, item) ->
  if not isMatcher(item) then item = literal(info, item)
  (start) ->
    result = []; info.cursor = start
    while ( x = item(info.cursor)) then result.push(x)
    result

# combinator *some*: one or more times of `item(info.cursor)`
exports.some = (info, item) ->
  if not isMatcher(item) then item = literal(info, item)
  (start) ->
    result = []; info.cursor = start
    if not (x = item(info.cursor)) then return x
    while 1
      result.push(x)
      x = item(info.cursor)
      if not x then break
    result

# combinator  *may*: a.k.a optional <br/>
# try to match `item(info.cursor)`, wether `item(info.cursor)` succeed or not, `maybe(item)(start)` succeed.
exports.may = (info, item) ->
  if not isMatcher(item) then item = literal(info, item)
  (start) ->
    info.cursor = start
    if x = item(info.cursor) then x
    else info.cursor = start; true

# combinator *follow* <br/>
# try to match `item(start)`, if succeed, reset info.cursor and return the value of item(start) <br/>
# whether succeed or not, info.cursor is reset to start
exports.follow = (info, item) ->
  if not isMatcher(item) then item = literal(info, item)
  (start) ->
    info.cursor = start
    if x = item(info.cursor) then info.cursor = start; x

# combinator *times*: match *@n* times item(info.cursor), n>=1
exports.times = (info, item, n) ->
  if not isMatcher(item) then item = literal(info, item)
  (start) ->
    info.cursor = start; i = 0
    while i++<n
      if x = item(info.cursor) then result.push(x)
      else return
    result

# combinator *seperatedList*: some times item(info.cursor), separated by info.separator
exports.seperatedList = (info, item, separator=spaces) ->
  if not isMatcher(item) then item = literal(info, item)
  if not isMatcher(separator) then separator = literal(separator)
  (start) ->
    info.cursor = start
    result = []
    x = item(info.cursor)
    if not x then return
    while 1
      result.push(x)
      if not(x = item(info.cursor)) then break
    result

# combinator *timesSeperatedList*: given info.n times @item separated by info.separator, n>=1
exports.timesSeperatedList = (info, item, n, separator=spaces) ->
  if not isMatcher(item) then item = literal(info, item)
  if not isMatcher(separator) then separator = literal(separator)
  (start) ->
    info.cursor = start
    result = []
    x = item(info.cursor)
    if not x then return
    i = 1
    while i++<n
      result.push(x)
      if not(x = item(info.cursor)) then break
    result

# As the same as andp, orp, in the manner of Peasy, you would rather to write youself a loop to do the things, instead
# of useing the combinators like any, some, times, seperatedList,etc. and that would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule so that we can do other things include lexer,
# error report, errer recovery, semantic operatons, and any other things you would like to do. <br/>

# It is for three motives to put all of the stuffs abve here:
# * 1. to demonstrate how to write matcher and grammar rules in the method brought by Peasy
# * 2. to demonstrate that Peasy can also implement any component that other combinational parser libaries like pyparsing,
# parsec, but in a simpler, faster manner.
# * 3. to show that it is how easy to write the combinators in the manner of Peasy.<br/><br/>

# As you have seen above, all of these utilities is so simple that you can write them at home by hand easily. In fact,
# you can write yourself all of the grammar rules in the same manner as above.

# If you like, you can add a faster version for every matcher, which do not pass *@start* as parameter around.<br/>
# Some of the matchers below have two version, to demonstrate how to do that.
# *Don't use the faster version in orp, any, some, times, separatedList, timesSeparatedList.* <br/><br/>

# #### other predicates, matchers, and combinators <br/>
# below is some little utilities which may be useful. Some of them is provided with both normal and faster version.<br/>
# just remove them if you don't need them, except *literal*, which is depended by the combinators above.

# predicate
# A *predicate* is a function which return true or false.
exports.isdigit = (c) -> '0'<=c<='9'
exports.isletter = (c) -> 'a'<=c<='z' or 'A'<=c<='Z'
exports.islower = (c) -> 'a'<=c<='z'
exports.isupper = (c) ->'A'<=c<='Z'
exports.isIdentifierLetter = (c) -> 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='@' or 'c'=='_'

# matcher *literal*, normal version<br/>
# match a text string.<br/>
# `notice = some combinators like andp, orp, notp, any, some, etc. use literal to wrap a object which is not a matcher.
exports.literal = (info, string) -> (start) ->
  len = string.length
  if info.data.slice(start, stop = start+len)==string then info.cursor = stop; true

# matcher *literal_*, faster version<br/>
# match a text string.
exports.literal_ = (info, string) -> (start) ->
  len = string.length
  if info.data.slice(info.cursor,  stop = info.cursor+len)==string then info.cursor = stop; true

# matcher *char*, normal version<br/>
# match one character
exports.char = char = (info, c) -> (start) -> if info.data[start]==c then info.cursor = start+1; return c

# matcher *char_*, normal version <br/>
# match one character
exports.char_ = (info, c) -> () -> if info.data[info.cursor]==c then info.cursor++; return c

# In spaces, spaces_, spaces1, spaces1_, a tat('\t') is seen as tabWidth spaces, <br/>
# which is used in indent style language, such as coffeescript, python, haskell, etc. <br/>
# If you don't need this feature, you can easily rewrite these utilities to remove the code about tab width yourself.<br/><br/>

# matcher *spaces*, normal version<br/>
# zero or more whitespaces, ie. space or tab.<br/>
exports.spaces = (info) -> (start) ->
  len = 0
  info.cursor = start
  while 1
    switch info.data[info.cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  return len

# matcher *spaces_*, faster version<br/>
# zero or more whitespaces, ie. space or tab.
exports.spaces_ = (info) -> () ->
  len = 0
  while 1
    switch info.data[info.cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  len

# matcher *spaces1*, normal version<br/>
# one or more whitespaces, ie. space or tab.<br/>
exports.spaces1 = (info) -> (start) ->
  len = 0
  info.cursor = start
  while 1
    switch info.data[info.cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  if len then return info.cursor = info.cursor; len

# matcher *spaces1_*, faster version<br/>
# one or more whitespaces, ie. space or tab.
exports.spaces1_ = (info) -> () ->
  len = 0
  info.cursor = start
  while 1
    switch info.data[info.cursor++]
      when ' ' then len++
      when '\t' then len += tabWidth
      else break
  if len then return info.cursor = info.cursor; len

# matcher *wrap*, normal version<br/>
# match left, then match item, match right at last
exports.wrap = (info) -> (item, left=spaces, right=spaces) ->
  if not isMatcher(item) then item = literal(info, item)
  (start) ->
     if left(start) and result = item(info.cursor) and right(info.cursor) then result

# matcher *identifierLetter* = normal version<br/>
# is a letter than can be used in identifer?<br/>
# javascript style, '@' is a identifierLetter_<br/>
exports.identifierLetter = (info) -> (start) ->
  start = info.cursor
  c = info.data[info.cursor]
  if c is '@' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
    info.cursor++; true

# matcher *identifierLetter_*, version<br/>
# is a letter that can be used in identifer? <br/>
# javascript style, '@' is a identifierLetter_
exports.identifierLetter_ = (info) -> () ->
  c = info.data[info.cursor]
  if c is '@' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'
    info.cursor++; true

# matcher *followIdentifierLetter_*, faster version<br/>
# lookahead whether the following character is a letter used in identifer. don't change info.cursor. <br/>
# javascript style, '@' is a identifierLetter_
exports.followIdentifierLetter_ = (info) -> () ->
  c = info.data[info.cursor]
  c is '@' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'

# matcher digit_, normal version<br/>
exports.digit = (info) -> (start) -> c = info.data[start];  if '0'<=c<='9' then info.cursor = start+1
# matcher digit_, faster version<br/>
exports.digit_ = (info) -> () -> c = info.data[info.cursor];  if '0'<=c<='9' then info.cursor++

# matcher letter, normal version<br/>
exports.letter = (info) -> (start) -> c = info.data[start]; if 'a'<=c<='z' or 'A'<=c<='Z' then info.cursor = start+1
# matcher letter, faster version<br/>
exports.letter_ = (info) -> () -> c = info.data[info.cursor]; if 'a'<=c<='z' or 'A'<=c<='Z' then info.cursor++

# matcher lower, normal version
exports.lower = (info) -> (start) -> c = info.data[start]; if 'a'<=c<='z' then info.cursor = start+1
#matcher lower_, faster version
exports.lower_ = (info) -> () -> c = info.data[info.cursor]; if 'a'<=c<='z' then info.cursor++

# matcher upper, normal version
exports.upper = (info) -> (start) ->  c = info.data[start]; if 'A'<=c<='Z' then info.cursor = start+1
#matcher upper_, faster version
exports.upper_ = (info) -> () -> c = info.data[info.cursor]; if 'A'<=c<='Z' then info.cursor++

# matcher identifier, normal version
exports.identifier = (info) -> (start) ->
  info.cursor = start
  c = info.data[info.cursor]
  if 'a'<=c<='z' or 'A'<=c<='Z' or 'c'=='@' or 'c'=='_' then info.cursor++
  else return
  while 1
    c = info.data[info.cursor]
    if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='@' or 'c'=='_' then info.cursor++
    else break
  true

# matcher identifier_, faster version
exports.identifier_ = (info) -> () ->
  c = info.data[info.cursor]
  if 'a'<=c<='z' or 'A'<=c<='Z' or 'c'=='@' or 'c'=='_' then info.cursor++
  else return
  while 1
    c = info.data[info.cursor]
    if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='@' or 'c'=='_' then info.cursor++
    else break
  true

# The utilites above is just for providing some examples on how to write matchers for Peasy.<br/>
# In fact, It's realy easy peasy to write the matchers for your grammar rule yourself.<br/>
# see [easy peasy]( http://en.wiktionary.org/wiki/easy_peasy ) <br/>

# <a id="peasysample"></a>
# *parse*: this is a sample parse function to demonstrate on how to write your own grammar rules yourself.<br/>
# notice that there exists indirect left recursion in the rules
parse = (text) ->
  makeGrammar = (info) ->
    # generate the matchers by the combinators in advance for better performance.<br/>
    # if you don't mind performance, you can write them in the rule directly.
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x'); z = char(info, 'z')
    # the grammar rules object.
    rules =
      Root: (start) -> (m = rules.A(start)) and z(info.cursor) and m+'z'
      A: (start) ->
        (m =  rules.B(start)) and x(info.cursor) and m+'x' or m\
        or a(start)
      B: (start) ->(m = rules.A(start))  and y(info.cursor) and m+'y'or rules.C(start)
      C: (start) -> rules.A(start) or b(start)
      __leftRecursives: ['A', 'B', 'C']
    exports.setupGrammar(info, rules)
  grammar = makeGrammar({data:text, cursor:0})
  grammar.Root(0)
