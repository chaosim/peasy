# # Peasy
# ###### Peasy means parsing is easy
# ###### an easy but powerful parser

# To use Peasy, just copy this file to your project, read it, modify it, write the grammar rules, and
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
# and/or addRecursiveCircles(grammar, recursiveCircles...), and: call computeLeftRecursives(grammar), now
# everything about left recursive symbols is computed and you can call parse(data, grammar, root) to do the work.

# The notation **@name** in the comment below means a global variable, and **$name** means a parameter. <br/>

# #### global variables<br/>
# It is for the performace reason that I use global variables, and at some time I will provide another version which
# have the class Parser for people who prefer modularization to speed. Of course you can modify the code to have the
# class Parser yourself if you like. It's just a snap to do that.

# some global variable used while parsing<br/>

# the text which is being parsed<br/>
# *Don't be confused by the variable name, it could be not only text strings but also array, sequence, tree, graph,etc.*
global text
# the length of @text
global textLength
# the current position of parsing, use text[cursor] to get current character in parsed stream
global cursor

# the grammar object which contains all of rules defined for the symbol in grammar.
global grammar
# saved the original rules of the grammar.
global originalRules

# store the wrapped function to rule of the left recursive symbol with `recursive`, and before entering them, store it in grammar too.
# when entering them, `grammar[symbol]` is unwrapped to `originalRules[symbol]` or `memorizeRecursives[symbol]`
global recursiveRules
global symbolDescedentsMap

# if you would like to use just symbol itself as the hash head, remove these four lines below and other correlative stuffs.<br/>
# {symbol: tag}, from rule symbol map to a shorter memo tag, for memory efficeny
global symbolToTagMap
# {tag: True}, record tags that has been used to avoid conflict
global tags

global parseCache # {tag+start: [result, cursor]}, memorized parser result
global functionCache # memorized normal function result

# #### helper functions
# some functions is helpful to make the parser.

# **intialize**: clear global varialbes. you should call `intialize()` at first.
def initialize(aGrammar):
  global grammar, parseCache, functionCache, originalRules, recursiveRules, symbolDescedentsMap,\
         symbolToTagMap, tags
  grammar = aGrammar
  grammar.parentToChildren = {}
  parseCache = {}
  functionCache = {}
  originalRules = {}
  recursiveRules = {}
  symbolDescedentsMap = {}
  symbolToTagMap = {}
  tags = {}

# **_parse**: parse **$data** from **$root** with **$aGrammar**.<br/>
# before parsing, you should tell the informations about left recursion in grammar.
def parse(data, aGrammar, root=None):
  global text, textLength, cursor 
  text = data
  textLength = len(text)
  cursor = 0
  root = root or aGrammar.rootSymbol
  return getattr(grammar, root)(0)

# <a id="peasysample"></a>
# **parse**: this is a sample parse function to demonstrate on how to write your own grammar rules yourself.<br/>
# notice that there exists indirect left recursion in the grammar.
def parseSample(text):
  # generate the matchers by the combinators in advance for better performance.<br/>
  # if you don't mind performance, you can write them in the rule directly.
  a = char('a'); b = char('b'); x = char('x')
  memoA = memo('A')
  # the grammar rules object.
  class rules:
    rootSymbol = 'A'    
    def A(self,start):
      # *add `or memoResult` to prevent executing nonrecursive part more than once.*
      memoResult = m = rules.B(start)
      return (m and x(p.cur()) and m+'x' or memoResult) or a(start)
    def B(self,start): return rules.C(start)
    def C(self,start): return memoA(start) or b(start)
  initialize()
  addRecursiveCircles(rules, ['A', 'B', 'C'])
  computeLeftRecursives(rules)
  parse(text, rules)

# ##### stuffs for left recursives
# use `addParentChildren(grammar, parentChildrens)` or `addRecursiveCircles(grammar, recursiveCircles...)` to tell
# the left calling relations between symbols in the grammar<br/>

# **addParentChildrens**: add direct left call parent->children relation for **$parentChildrens** to **@symbolToParentsMap**<br/>
# e.g. `addRecursiveCircles(grammar, {A:['B'], B:['A', 'B']})`
def addParentChildrens(grammar, parentChildren):
  map = grammar.parentToChildren
  for parent, children in parentChildren:
    list = map.setdefault(parent, [])
    for name in children:
      if name not in list: list.append(name)

# **addRecursiveCircles**: add left recursive parent->children relation to `grammar.parentToChildren` for symbols in **@recursiveCircles**<br/>
# e.g. `addRecursiveCircles(grammar, ['A', 'B'], ['B'])` tell the same left recursive relations as above sample.
def addRecursiveCircles(grammar, *recursiveCircles):
  map = grammar.parentToChildren
  for circle in recursiveCircles:
    length = len(circle)
    for i in range(length):
      if i==length-1: j = 0 
      else: j = i+1
      name = circle[i]
      parent = circle[j]
      list = map.setdefault(parent, [])
      if name not in list: list.append(name)

# **computeLeftRecursives**: after telling left recursive relations, compute the left recsives group and wrap symbol in
# them with `recursive` function<br/>
def computeLeftRecursives(grammar):
  global symbolDescedentsMap, originalRules
  parentToChildren = grammar.parentToChildren
  def addDescendents(symbol, meetTable, descedents):
    children =  parentToChildren[symbol]
    for child in children:
      if child not in descedents: descedents.append(child)
      if child not in meetTable: addDescendents(child, meetTable, descedents)
  symbolDescedentsMap = {}
  for symbol in parentToChildren:
    meetTable = {}; meetTable[symbol] = True
    descendents = symbolDescedentsMap[symbol] = []
    addDescendents(symbol, meetTable, descendents)
    if symbol in descendents:
      originalRules[symbol] = getattr(grammar, symbol)
      setattr(grammar, symbol, recursive(symbol))
  symbolDescedentsMap

# **recursive**: this is the key function to left recursive.<br/>
# Make **$symbol** a left recursive symbol, which means to wrap `originalRules[symbol]` with recursive.
# when recursiv(symbol)(start) is executed, first let `rule = grammar[symbol]`, `grammar[symbol] = originalRules[child]` for
# all symbols in left recursive circles and loop computing rule(start) until no changes happened, and
# restore all symbols in left recursive cirle to `recursiveRules[symbol]` at last.,
def recursive(symbol):
  rule = originalRules[symbol]
  def matcher(start):
    global cursor
    for child in symbolDescedentsMap[symbol]:
      setattr(grammar, child, originalRules[child])
    hash = symbol+str(start)
    m = parseCache.setdefault(hash, [None, -1])
    if m[1]>=0: cursor = m[1]; return m[0]
    while 1:
      result = rule(start)
      if m[1]<0:
        m[0] = result
        if result:  m[1] = cursor
        else: m[1] = start
      else:
        if m[1]==cursor: m[0] = result; return result
        elif cursor<m[1]: m[0] = result; cursor = m[1]; return result
        else: m[0] = result; m[1] = cursor
    for child in symbolDescedentsMap[symbol]:
      grammar[child] = recursiveRules[child]
    return result
  return matcher

# ##### memorization

# **memo**: lookup the memorized result and reached cursor for **$symbol** at the position of **$start**<br/>
# It is set up automaticly by `computeLeftRecursives(grammar)` for the symbols which is left recursive.<br/>
# For other symbol, you should be able to call this in rule mannually.
def memo(symbol):
  def matcher(start):
    global parseCache, cursor
    hash = symbol+str(start)
    try: 
      m = parseCache[hash]
      if m: cursor = m[1]; return m[0]
    except: return       
  return matcher

# **setMemorizeRules**: set the symbols in grammar which  memorize their rule's result.<br/>
# this function should be used only for the symbols which is not left recursives.<br/>
# you can do this after `initialize()` and before `parse(...)`.
def setMemorizeRules(grammar, symbols):
  for symbol in symbols:
    originalRules[symbol] = grammar[symbol]
    grammar[symbol] = memorize(symbol)

# **memorize**: memorize result and cursor for **$symbol** which is not left recursive.<br/>
# *The symbols which is left recursive should be wrapped by `recursive(symbol)`, not `memorize(symbol)`!!!*
def memorize(symbol):
  tag = symbolToTagMap[symbol]
  rule = originalRules[symbol]
  def matcher(start):
    hash = tag+start
    m = parseCache[hash]
    if m: cursor = m[1]; return m[0]
    else:
      result = rule(start)
      parseCache[hash] = [result, cursor]
      return result
  return matcher

# **setMemoTag**: find a shorter part of symbol as the head of hash tag to index **@parseCache** <br/>
# It exists just for performance reason. If you don't like this idea, you can remove the stuffs about memo tag yourself and
# just use symbol itself as the head of hash tag.
def setMemoTag(symbol):
  for i in range(len(symbol)):
    if symbol[0:i] not in tags: break
  tag = symbol[0:i]
  symbolToTagMap[symbol] = tag
  tags[tag] = True

# #### matchers and matcher combinators<br/>

# A **matcher** is a function which read the text being parsed and move cursor directly.<br/>
# All matcher should return truth value on succeed, and return falsic value on fail.<br/>
# A **combinator** is a function which receive zero or more matchers as parameter(maybe plus some other parameters
# which are not matchers), and generate a new matchers.<br/>
# there are other matcher generator besides the standard combinators described as above, like `recursive`, `memo`, `memorize`,
# which we have met above.

def isMatcher(item):  return hasattr(obj, '__call__')

# combinator **andp**<br/>
# execute item(cursor) in sequence, return the result of the last one. <br/>
# when `andp` is used to combined of the matchers, the effect is the same as by using the Short-circuit evaluation, like below:<br/>
# `item1(start) and item2(cursor] ... and itemn(cursor).`  <br/>
# In fact, you maybe would rather like to use `item1(start) and item2(cursor) ..` when you write the grammar rule in the
# manner of Peasy. That would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule, say like below: <br/>
# `if (x=item1(start) and (x>100) and item2(cursor) and not item3(cursor) and (y = item(cursor)): doSomething()`
def andp(items):
  items1 = []
  for item in items:
    if not isMatcher(item): items1.append(literal(item))
    else: items1.append(item)
  def matcher(start):
    global cursor
    cursor = start
    for item in items1:
      result = item(cursor)
      if not(result): return
    return result

# combinator **orp** <br/>
# execute `item(start)` one by one, until the first item which is evaluated to truth value and return the value.<br/>
# when orp is used to combined of the matchers, the effect is the same as by using the Short-circuit evaluation, like below:<br/>
# item1(start) or item2(cursor] ... or itemn(cursor) <br/>
# In fact, you maybe would rather like to use `item1(start) or item2(cursor) ..` when you write the grammar rule in the
# manner of Peasy. That would be simpler, faster and more elegant. <br/>
# And in that manner, you would have more control on your grammar rule, say like below: <br/>
# `if ((x=item1(start) and (x>100)) or (item2(cursor) and not item3(cursor)) or (y = item(cursor)): doSomething()`
def orp(*items):
  items1 = []
  for item in items:
    if not isMatcher(item): items1.append(literal(item))
    else: items1.append(item)
  def matcher(start):
    for item in items1:
      result = item(start)
      if result: return result
    return result

# combinator **notp**<br/>
# `notp` is not useful except being used in other combinators, just like this: `andp(item1, notp(item2))`.<br/>
# *It's unnessary, low effecient and ugly to write `notp(item)(start)`, just write `not item(start)`.*
def notp(item):
  if not isMatcher(item): item = literal(item)
  def matcher(start): return not item(start)
  return matcher

# combinator **any**: zero or more times of `item(cursor)`
def any(item):
  if not isMatcher(item): item = literal(item)
  def matcher(start):
    global cursor
    result = []; cursor = start
    while 1:
      x = item(cursor)
      if x: result.append(x)
      else: break
    return result
  return matcher

# combinator **some**: one or more times of `item(cursor)`
def some(item):
  if not isMatcher(item): item = literal(item)
  def matcher(start):
    global cursor
    result = []; cursor = start
    x = item(cursor)
    if not x: return x
    while 1:
      result.append(x)
      x = item(cursor)
      if not x: break
    return result
  return matcher

# combinator  **may**: a.k.a optional <br/>
# try to match `item(cursor)`, wether `item(cursor)` succeed or not, `maybe(item)(start)` succeed.
def optional(item):
  if not isMatcher(item): item = literal(item)
  def matcher(start):
    global cursor
    cursor = start
    x = item(cursor)
    if x: return x
    else: cursor = start; return True
  return matcher

# combinator **follow** <br/>
# try to match `item(start)`, if succeed, reset cursor and return the value of item(start) <br/>
# whether succeed or not, cursor is reset to start
def follow(item):
  if not isMatcher(item): item = literal(item)
  def matcher(start):
    global cursor
    cursor = start
    x = item(cursor)
    if x: cursor = start; return x
  return matcher

# combinator **times**: match **$n** times item(cursor), n>=1
def times(item, n):
  if not isMatcher(item): item = literal(item)
  def matcher(start):
    global cursor
    cursor = start
    for i in range(n):
      x = item(cursor)
      if x: result.append(x)
      else: return
    return result
  return matcher

# combinator **seperatedList**: some times item(cursor), separated by @separator
def seperatedList(item, separator=None):
  if separator is None: separator = spaces
  if not isMatcher(item): item = literal(item)
  if not isMatcher(separator): separator = literal(separator)
  def matcher(start):
    global cursor
    cursor = start
    result = []
    x = item(cursor)
    if not x: return
    while 1:
      result.append(x)
      x = item(cursor)
      if not(x): break
    return result
  return matcher

# combinator **timesSeperatedList**: given @n times $item separated by @separator, n>=1
def timesSeperatedList(item, n, separator=None):
  if separator is None: separator = spaces
  if not isMatcher(item): item = literal(item)
  if not isMatcher(separator): separator = literal(separator)
  def matcher(start):
    global cursor
    cursor = start
    result = []
    x = item(cursor)
    if not x: return
    for i in ranges(n-1):
      result.append(x)
      x = item(cursor)
      if not x: break
    return result
  return matcher

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
# A **predicate** is a function which return True or False, usually according to its parameter, but not look at parsed object.
# below is some little utilities may be useful. Three version of some of them is provided.<br/>
# just remove them if you don't need them, except **literal**, which is depended by the matchers above.

# matcher **literal**, normal version<br/>
# match a text string.<br/>
# `notice: some combinators like andp, orp, notp, any, some, etc. use literal to wrap a object which is not a matcher.

def literal(string): 
  def matcher(start):
    global cursor
    len = string.length
    stop = start+len
    if text[start:stop]==string: cursor = stop; return True

# matcher **literal_**, faster version<br/>
# match a text string.
def iteral_(string): 
  def matcher(start):
    global cursor
    len = string.length
    if text.slice(cursor,  stop = cursor+len)==string: 
      cursor = stop; return True
  return matcher

# matcher **char**, normal version<br/>
# match one character
def char(c): 
  def matcher(start):
    global cursor
    if start>=textLength: return
    if text[start]==c: cursor = start+1; return c
  return matcher

# matcher **char_**, normal version <br/>
# match one character
def char_(c): 
  def matcher():
    global cursor
    if text[cursor]==c: cursor += 1; return c
  return matcher

# In spaces, spaces_, spaces1, spaces1_, a tat('\t') is seen as tabWidth spaces, <br/>
# which is used in indent style language, such as coffeescript, python, haskell, etc. <br/>
# If you don't need this feature, you can easily rewrite these utilities to remove the code about tab width yourself.<br/><br/>

# matcher **spaces**, normal version<br/>
# zero or more whitespaces, ie. space or tab.<br/>
def spaces(start):
  global cursor
  len = 0
  cursor = start
  text = text
  while 1:
    c = text[cursor]
    cursor += 1
    if c==' ': len += 1
    elif c=='\t': len += tabWidth
    else: break
  return len

# matcher **spaces_**, faster version<br/>
# zero or more whitespaces, ie. space or tab.
def spaces_():
  global cursor
  len = 0
  text = text
  while 1:
    c = text[cursor]
    cursor += 1
    if c==' ': len += 1
    elif c=='\t': len += tabWidth
    else: break
  return len

# matcher **spaces1**, normal version<br/>
# one or more whitespaces, ie. space or tab.<br/>
def spaces1(start):
  global cursor
  len = 0
  cursor = start
  text = text
  while 1:
    c = text[cursor]
    cursor += 1
    if c==' ': len += 1
    elif c=='\t': len += tabWidth
    else: break
  if len: return len

# matcher **spaces1_**, faster version<br/>
# one or more whitespaces, ie. space or tab.
def spaces1_():
  global cursor
  len = 0
  while 1:
    c = text[cursor]
    cursor += 1
    if c==' ': len += 1
    elif c=='\t': len += tabWidth
    else: break
  if len: return len

# matcher **wrap**, normal version<br/>
# match left,: match item, match right at last
def wrap(item, left=spaces, right=spaces):
  if not isMatcher(item): item = literal(item)
  def matcher(start):
    global cursor
    if not left(start): return
    result = item(cursor)
    if result and right(cursor): return result
  return matcher

# matcher **identifierLetter**: normal version<br/>
# is a letter than can be used in identifer?<br/>
# javascript style, '$' is a identifierLetter_<br/>
def identifierLetter(start):
  global cursor
  cursor = start
  c = text[cursor]
  if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9':
    cursor += 1; 
    return True

# matcher **identifierLetter_**, version<br/>
# is a letter that can be used in identifer? <br/>
# javascript style, '$' is a identifierLetter_
def identifierLetter_():
  global cursor
  c = text[cursor]
  if c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9':
    cursor += 1; 
    return True

# matcher **followIdentifierLetter_**, faster version<br/>
# lookahead whether the following character is a letter used in identifer. don't change cursor. <br/>
# javascript style, '$' is a identifierLetter_
def followIdentifierLetter_():
  c = text[cursor]
  return c is '$' or c is '_' or 'a'<=c<'z' or 'A'<=c<='Z' or '0'<=c<='9'

def isIdentifierLetter(c): return 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_'

# predicate isdigit<br/>
def isdigit(c): return '0'<=c<='9'
# matcher digit, normal version<br/>
def digit(start):
  global cursor
  c = text[start];  
  if '0'<=c<='9': cursor = start+1; return True
# matcher digit_, faster version<br/>
def digit_():
  global cursor
  c = text[cursor];  
  if '0'<=c<='9': cursor += 1; return True

# predicate isletter<br/>
def isalpha(c): return 'a'<=c<='z' or 'A'<=c<='Z'
isletter = isalpha
# matcher letter, normal version<br/>
def alpha(start):
  global cursor
  c = text[start]; 
  if 'a'<=c<='z' or 'A'<=c<='Z': cursor = start+1; return True
letter = alpha

# matcher letter, faster version<br/>
def alpha_():
  global cursor
  c = text[cursor]; 
  if 'a'<=c<='z' or 'A'<=c<='Z': cursor += 1; return True
letter_ = alpha_

# predicate: islower
def islower(c): return 'a'<=c<='z'
# matcher lower, normal version
def lower(start):
  global cursor
  c = text[start]; 
  if 'a'<=c<='z': cursor = start+1; return True
#matcher lower_, faster version
def lower_():
  global cursor
  c = text[cursor]; 
  if 'a'<=c<='z': cursor += 1; return True

def isupper(c): return 'A'<=c<='Z'
# matcher upper, normal version
def upper(start): 
  global cursor
  c = text[start]; 
  if 'A'<=c<='Z': cursor = start+1
#matcher upper_, faster version
def upper_(start): 
  global cursor
  c = text[cursor]; 
  if 'A'<=c<='Z': cursor += 1

# matcher identifier, normal version
def identifier(start):
  global cursor
  cursor = start
  c = text[cursor]
  if 'a'<=c<='z' or 'A'<=c<='Z' or 'c'=='$' or 'c'=='_': cursor += 1
  else: return
  while 1:
    c = text[cursor]
    if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_': cursor += 1
    else: break
  True

# matcher identifier_, faster version
def identifier_(start):
  global cursor
  c = text[cursor]
  if 'a'<=c<='z' or 'A'<=c<='Z' or 'c'=='$' or 'c'=='_': cursor += 1
  else: return
  while 1:
    c = text[cursor]
    if 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9' or 'c'=='$' or 'c'=='_': cursor += 1
    else: break
  True

# The utilites above is just for providing some examples on how to write matchers for Peasy.<br/>
# In fact, It's realy easy peasy to write the matchers for your grammar rule yourself.<br/>
# see [easy peasy]( http://en.wiktionary.org/wiki/easy_peasy ) <br/>

# These utilities below exists for people who want to use these file a independent module, and put the grammar rule in
# another separated file.<br/>

# gettext: get the being pased text<br/>
# If you use this file to contain the grammar rules, just directly use `text`<br/>
# and use `text[cursor]` to get current character, `text.slice(cursor, cursor+n)` to get substring of the text, if
# text is a string object.
def gettext(): return text

# If you use this file to contain the grammar rules, just directly use `cursor` or `cursor = n` or `cursor += 1` or `cursor--`
def cur(): return cursor
def setcur(pos): 
  global cursor
  cursor = pos
  return cursor


