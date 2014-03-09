# Peasy: a easy but powerful parser

### Parsing is easy!

Have experience to write a parser?  With peasy, no longer need to play the highly difficult [ Juggling like this ](https://raw.github.com/chaosim/peasy/master/doc/ballacrobatics.jpg) as before, and
now only need [ like this ](https://raw.github.com/chaosim/peasy/master/doc/dolphinball.jpg) and easily make it:)

###**Usage**

**browser**:
Copy twoside.js, peasy.js, logicpeasy.js(if logic feature is required) to the project folder, sequentially add `<script>` label in yourpage.html.

**node.js**:
In addition to directly copy the files from github, you can also get peasy by `npm install peasy`

**twoside**:
twoside is a utility that I wrote, so that the module can be used both in the browser and in node.js. In broser,  if you do not want to use twoside, delete the first two lines in peasy.js and logicpeasy.js, exports variable and their references.
For more information about twoside, See https://github/chaosim/twoside. In pure node environment without the browser, twoside can be ignored and peasy will not be effected. You can install twoside through npm: `npm install twoside`

### introduction
From concept to implementation and use, Peasy is extremely simple. Peasy contains only one class **Parser**. In addition to 'parse' member function which starts parsing, Parser contains only two categories of member functions, one is called **matching function**, with no parameters, its role is to operate the parsed data and adjust the parsing pointer, including eoi, spaces, spaces1, digit, letter, upper, lower, number, string, identifier, identifierLetter, followIdentifierLetter, etc. Another is called **combinational functions**, which return matching function as its result, including rec, memo, orp, andp, notp, may, any, some, times, list, listn, follow, literal, char, wrap etc.  Specially, "rec" implements left recursive feature to make peasy have the strongest grammar expressiveness; "memo" implements caching feature, which make peasy can reach minimum time complexity.

logicpeasy is an extension to peasy, it makes logical variable can be used as an argument of the parsing rules.

### Start writing parsers

Recommend the following method:

Create a new module(you can use a file under samples as template ), then require peasy or logicpeasy, create a new Parser class which uses peasy.Parser or logicpeasy.Parser as the base class.

I advice you read the code in /test and /samples, which  are simple and self-interpreting,  before writing code for your own parser. after that you will figure out how to write parser.

In order to immediately have an intuitive feeling on how to write parser in peasy,  the main content of `samples/arithmatic2.coffee` is listed below. To save space and ease of reading, ... is used to omit the the paragraph which do not affect the overall structure.

```coffeescript
exports.Parser = class Parser extends peasy.Parser
  constructor:->
    super # call the constructor of peasy.Parser
    self = @ save 'this' to self in advance, avoid the problem that 'this' may be bound to wrong object.

    number =->...
    string =->...

    {orp, list, rec, memo, wrap, char, literal, spaces, eoi, identifier} = self

    question = char('?'); colon = char(':'); comma = char(','); dot = char('.')
    lpar = char('('); rpar = char(')')
    lbracket = char('['); rbracket = char(']')

    myop =(op)->
      if op.length == 1 then opFn = char(op) else opFn = literal(op)
      if _in_(op [0], identifierCharSet)
        -> Spaces() and(op = opFn()) and spaces() and not _in_(data [self.cur], identifierCharSet) and '' + op + ''
      else-> spaces() and(op = opFn()) and spaces() and op

    posNeg =(op)->...
    positive = posNeg('+'); negative = posNeg('-')
    ...
    assign = myop('=');..., bitorassign = myop('|=')

    error =(msg)-> throw self.data [self.cur-20.. self.cur +20] + '' + self.cur + ':' + msg
    expect =(fn, msg)-> fn() or error(msg)

    incDec = orp(inc, dec)
    prefixExpr =->(op = incDec()) and(x = headExpr()) and op + x
    suffixExpr =->(x = headExpr()) and(op = incDec()) and x + op

    paren =(item, left = lpar, right = rpar, msg = 'expect) to match(')->s
      -> Start = self.cur; left() and(x = item()) and expect(right, msg + 'at:' + start) and x

    paren1 = paren(->(spaces() and(x = expression()) and spaces() and x))
    parenExpr = memo->(x = paren1()) and '(' + x + ')'
    atom = memo orp(parenExpr, number, string, identifier)
    newExpr =-> new_() and(x = callProp()) and 'new' + x
    unaryTail = orp(prefixExpr, suffixExpr, atom)
    unaryExpr =->(op = unaryOp()) and(x = unaryTail()) and op + x

    bracketExpr1 = wrap(paren(wrap(-> commaExpr()), lbracket, rbracket, 'expect ] to match ['))
    bracketExpr =->(x = bracketExpr1()) and '[' + x + ']'
    wrapDot = wrap(dot)
    dotIdentifier =-> wrapDot() and(id = expect(identifier, 'expect identifier')) and + id '.'
    attr = orp(bracketExpr, dotIdentifier)
    param = paren->(spaces() and(x = expression()) and spaces() and expect(rpar, 'expect)')) or ''
    paramExpr = memo->(x = param()) and '(' + x + ')'
    callPropTail = orp(paramExpr, attr)
    callPropExpr = rec->(h = headExpr()) and(((e = callPropTail()) and h + e) ​​or h)
    property = rec->(h = headExpr()) and(((e = attr()) and h + e) ​​or h)
    headAtom = memo orp(parenExpr, identifier)
    headExpr = memo orp(callPropExpr, headAtom)
    simpleExpr = memo orp(unaryExpr, prefixExpr, suffixExpr, callPropExpr, newExpr, atom)

    binaryOpPriorityMap = {5: ['*', '/', '/ /', '%'],...}

    binaryOpItems = []
    do-> for k, ops of binaryOpPriorityMap
      for op in ops then binaryOpItems.push [op, {text: op, pri: parseInt(k)}]

    binarysm = new StateMachine(binaryOpItems)

    binaryOperator = memo->
      m = binarysm.match(self.data, self.cur)
      if m [0] then self.cur = m [1]; m [0]

    expr =(n)-> binary = rec->
        if x = binary()
          beforeOp = self.cur
          if(op = binaryOperator()) and(n> = op.pri> = x.pri) and(fn = expr(op.pri)) and y = fn()
            {text: x.text + op.text + y.text, pri: op.pri}
          else self.cur = beforeOp; x
        else if x = simpleExpr() then {text: x, pri: 4}

    orBinary = expr(15)
    logicOrExpr =->(x = orBinary()) and x.text
    wrapQuestion = wrap(question); wrapColon = wrap(colon)
    '?':- condition =>(x = logicOrExpr()) and((wrapQuestion() and(y = assignExpr()) and expect(wrapColon, 'expect') and(z = assignExpr()) and x + + y + ':' + z) or x)
    assignOperator = orp(assign, addassign,..., bitorassign)
    assignExpr_ =-> if(v = property()) and(op = assignOperator()) then(e = expect(assignExpr, '. expect the right hand side of assign')) and v + op + e
    assignExpr = orp(assignExpr_, condition)
    expression_ = list(assignExpr, wrap(comma))
    expression =-> x = expression_(); if x then x.join(',')

    @ root =->(x = expression()) and expect(eoi, 'expect end of input') and x

```
Samples/arithmatic2.coffee has only 180 lines of code in total, and which also contains lexical process. Able to handle expressions as complex as in javascript, and the code is so simple, I bet that only peasy can make it.

The code has several unique points need to explain:
* Coffeescript syntax makes the rules' readability as good as any other compiler's rule definition, and will be slightly worse under the javascript.
* All the rules are set as instance member of the parser in the constructor, rather than the prototype members, which can avoid many potential problems associated with binding of `this`. I have tried the prototype members solution before, after testing and debugging I found there were many hidden bugs. In addition, the speed of the parser can be improved by avoiding the lookup to prototype inheritance chain.
* The process to binary expression(expr(n), and it generates binary = rec...) is also unique. This will be further explained hereinafter.

You can also start from peasy.coffee(or js) or logicpeasy.coffee(or js), and directly modify until the completion of your own parser.

### Introduction to samples
The project provides several samples, I'd like to explain them as below:

dsl.coffee is what I parse a little language in another project.

arimatic.coffee uses the support for left-recursive to parse javascript expressions. It is characterized by generating left-recursive rules for all priority binary expression with a function. When parsing, It is necessary to go through the call stack with all priorities, from the lowest priority rule(comma expression) to the highest priority rule(atom expression such as number, string, etc). This method is linear time, but because a very long call stack need to be traversed, it will have an impact on the time to run. For example, even for an expression like '1', it must be transformed into a multiplication expressions, add expressions, ..., logical or expressions, conditional expression, and comma expression at last.

arithmatic2.coffee is written to avoid the above problems, by setting expression priority according to the operator. Say, for 1 || 1, it can upgrade directly into an expression with priority of '||'(14 in the sample).

It is unique that the method to parse arithmetic expressions demonstrated by these two modules above, and I still have not found other similar implementations. If you find that there are  similar or better ways, please let me know.

### API

#### class Parser(peasy.coffee/peasy.js): parser base class

##### Data members

`data`: parsed data, common data type is text or string. Can also be other data type, like binary stream, arrays, lists, trees, etc.

`cur`: pointer to the current parsing position

`ruleIndex`: every rule corresponds to only one ruleIndex, if which is wrapped with memo or rec.

`ruleStack`: when executing left-recursive rules(rec(rule)), it is necessary to look ruleStack, see the code for rec

`cache`: save the results for the left-recursive rules(rec(rule)) and caching rules(memo(rule))

##### Member function
The following describes the combinational functions and matching functions in peasy. Just describe a few of the most commonly used, because all functions are very simple, and parallel to each other, the function name is self-explanatory, and most of them can be used, removed, modified freely. The main objective for peasy to contain them, is for demonstration. if necessary, please see codes.

In the following description, To succeed means returning the truth value, including non-zero number, non-empty strings, arrays, objects, etc. To fail means returning falsy value, including undefined, null, 0, '' etc.

`parse(data, root = self.root, cur = 0)`, set the data to be parsed, the initial matching function(default is self.root), start parsing pointer(default is 0).

##### Combinational function

`rec(rule)`: make the rule to be treated as a left-recursive rules. The results generated by the function repeatedly to view the cache, get the initial parsed results, and continue to parse until no more results.

`memo(rule)`: the result function for the rule  will cache and lookup parsed result in the parsed position for rule, to avoid duplication of parsing.

`orp(items...)`: Matching function parses all the items one by one from the same starting position, when any one of the items succeeds, orp(items...) will succeed, unless all of the items failed.

orp may be the most commonly used combinational functions. Because you can not write `item1() or item2()... or itemn()`, but must write `start = self.cur; items() or((self.cur = start) or item2())... or((self.cur = start) or itemn()) `. If this was ignored, it maybe become a trap in the code.

`andp(items...)`: generated matching function sequentially executed item of items, every item parses from the position at which the previous item had stopped. When any item fails,  `andp(items...)` fails, and succeed if all of items succeeed.
   
andp in the actual code is rarely used. Because you can write `item1() and item2()... and itemn()`. And often need to write : `(x = item1()) and(y = item2())... itemn() and doSomeProcess(x, y)`

`literal(item)`: item is string. Generated matching function succeeds if item match the text beginned at parsing pointer, otherwise it fails.

For convenience, some string parmeter x of other combinational function is converted to literal(x). Please see the code to get to know what functions use the literal conversion.

`char(c)`, c is the character. if the character at the parsing pointer is c, it succeeds, otherwise it fails.

`wrap(item, left = spaces, right = spaces)` generated matching function performs the following judgment: `if left() and result = item() and right() then result`


##### Matching function

`eoi`: If end of input is encountered, succeed.

`spaces`: 0 or more spaces. Always succeed, the result is (number of spaces+1).

`spaces1`: 1 or more spaces. The result is the number of spaces. If the number of spaces is 0, then fail.

#### the Parser class in logicpeasy 

Class Members
`trail`: `self.trail = new Trail`, save the variable bindings trail.

##### Unregular matching function

* Matching function described above is regular matching function, which can be used as the parameters of combinational function such as orp. Similarly, Unregular matching function also directly manipulate the parsed data and pointers. But because they have their own parameters, and therefore they can not be used directly as the parameters of combinational function such as orp, unless be converted like so: `-> fn(arg1, arg2,...)`. *

`bind(vari, term)`: bind variables and items

`unify(x, y, equal =((x, y)-> x == y))`: unify x and y.

`unifyList =(xs, ys, equal =((x, y)-> x == y))`: unify list x and list y

##### combinational function
`unifyChar(x)`, `unifyDigit(x)`, `unifyLetter(x)`, `unifyLower(x)`, `unifyUpper(x)`, `unifyIdentifier(x)`:  x can be logic varible.

`orp(items...)`: overloaded orp process trail for logical variables.

##### Logical variables and data types
Var, vars, Dummy, dummy variables are used to construct logic variables.
UObject, uobject, UArray, uarray, Cons, cons, unifiable can contain logical variables and unify correctly.

### what's new in 0.3.2
  * change from gruntjs to gulpjs
  * use gulp-twoside.js to wrap module for browser
  * add lineparser to support lineno and row.

### the origin of peasy project
Peasy project is based on the next-generation programming language project I make in dao(python) and daonode(coffeescript/javascript).
Dao project achieved a natural combination of logic programming paradigm and functional programming paradigm, and fit prolog and lisp language perfectly, and which also includes a built-in parser. Logical variable can be the parameter in the rule of dao or daonode. When the rule of parser can have logic variable parameters, the parser will has a more powerful capability of expressiveness than Chomsky grammars and peg grammar used in traditional compiler and parser. (anyone who is interested in this can read some discussion of compiler theory about 0-4 type of grammar, [like this link](http://ccl.pku.edu.cn/doubtfire/Syntax/Introduction/Chomsky/Chomsky_Hierarchy/Chapter%2024%20The%20Chomsky%20Hierarchy.htm)), and at the meanwhile the minimal time complexity could be keeped.

### Python implementation
The project has an old python implementaion. Because I have no more spare time, api in python implementation is the original one, not updated as the same as with coffee/js version.

### For additional information about Peasy

**Further documentation**: http://chaosim.github.io/peasy/ have more documentation about peasy. A [Chinese version(中文文档)](http://chaosim.github.io/peasy/doc/readme[cn].htm) of  this readme.md is provided. 

**Project site**: github <https://github.com/chaosim/peasy>.

**Test**: Peasy use karma/jasmine and mocha/chai testing framework, see the folder "/test"

**Report bug**: To report or find a bug, please go to <https://github.com/chaosim/peasy/issues>, or email to simeon.chaos @ gmail.com

**Development platform**: Windows 7, node.js of 0.10.0, CoffeeScript 1.6.3.

**license**: MIT, see LICENSE
