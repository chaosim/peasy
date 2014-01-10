#Peasy ：一个简单而强大的解析器

###Parsing is easy！

有编写解析器的经历吗？有了Peasy ，再也不需要象以前那样玩高难的[抛球杂技](https://raw.github.com/chaosim/peasy/master/doc/ballacrobatics.jpg)了，
现在只需要[象这样](https://raw.github.com/chaosim/peasy/master/doc/dolphinball.jpg)就能把它轻松搞定:)

###**用法**


**浏览器**:
复制twoside.js, peasy.js, logicpeasy.js（如果需要逻辑功能)到项目文件夹，按次序添加到yourpage.html的`<script>`标签。

**node.js**:
除了直接从github复制文件以外，node下也可以通过npm安装：`npm install peasy`

**twoside**:
twoside是我编写的一个小工具，使模块可以同时用于浏览器和node.js。如果不想使用它，直接忽略并删除peasy.js和logicpeasy.js前两行，并删除代码中的exports变量及其引用。
关于twoside的详细信息，请参阅https://github/chaosim/twoside。在无需考虑客户端浏览器的纯node环境下，可以忽略twoside，不影响使用。可以通过npm安装twoside：`npm install twoside`

###介绍
peasy从概念到实现以及使用都极其简单。peasy只包含一个类Parser，该类除了启动解析的parse成员函数以外，只包含两类成员函数，一类叫匹配函数，不带参数，其作用是直接检测被解析数据(data)和调整解析指针(cur)，包括eoi, spaces, spaces1, digit, letter, upper, lower, number, string, identifier, identifierLetter, followIdentifierLetter等。另一类叫组合函数，产生匹配函数作为结果，包括rec, memo, orp, andp, notp, may, any, some, times, list, listn, follow, literal, char, wrap等。其中rec实现左递归功能，使得peasy具有最强的语法表达能力；memo实现缓存功能，尽可能将解析过程保持在最低的时间复杂度上。

logicpeasy 是对peasy的扩展，它使得解析规则可以用逻辑变量作为参数。

###开始编写解析器

推荐如下方法：

新建模块（可以用samples下的某个文件作为模板），require peasy或logicpeasy，以peasy.Parser或logicpeasy.Parser作为基类，建立新Parser类。


建议编写代码以前，先阅读peasy本身的代码以及test和samples中的代码，这些代码都是简单自明的，读过之后您就能直接进入状态了。

为了让大家马上对用peasy编写解析器有个直观感觉，下面列出了samples/arithmatic.coffee的主体内容。为节省篇幅和便于阅读，代码中用...省略了不影响整体结构的段落。

      exports.Parser = class Parser extends peasy.Parser
        constructor: ->
          super # call the constructor of peasy.Parser
          self = @  save 'this' to self in advance, avoid the problem that 'this' may be bound to wrong object.
    
          number = -> ...
          string = -> ...
    
          {orp, list, rec, memo, wrap, char, literal, spaces, eoi, identifier} = self
    
          question = char('?'); colon = char(':'); comma = char(','); dot = char('.')
          lpar = char('('); rpar = char(')')
          lbracket = char('['); rbracket = char(']')
    
          myop = (op) ->
            if op.length==1 then opFn = char(op) else opFn = literal(op)
            if _in_(op[0], identifierCharSet)
              -> spaces() and (op=opFn()) and spaces() and not _in_(data[self.cur], identifierCharSet) and ' '+op+' '
            else -> spaces() and (op=opFn()) and spaces() and op
    
          posNeg = (op) -> ...
          positive = posNeg('+'); negative = posNeg('-')
          ...
          assign = myop('='); ..., bitorassign = myop('|=')
    
          error = (msg) -> throw self.data[self.cur-20..self.cur+20]+' '+self.cur+': '+msg
          expect = (fn, msg) -> fn() or error(msg)
    
          incDec = orp(inc, dec)
          prefixExpr = -> (op=incDec()) and (x=headExpr()) and op+x
          suffixExpr = -> (x=headExpr()) and (op=incDec()) and x+op
    
          paren = (item, left=lpar, right=rpar, msg='expect ) to match (') ->
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
    
          binaryOpPriorityMap = { 5: ['*', '/', '//', '%'], ...}
    
          binaryOpItems = []
          do -> for k, ops of binaryOpPriorityMap
            for op in ops then binaryOpItems.push [op, {text:op, pri:parseInt(k)}]
    
          binarysm = new StateMachine(binaryOpItems)
    
          binaryOperator = memo ->
            m = binarysm.match(self.data, self.cur)
            if m[0] then self.cur = m[1]; m[0]
    
          expr = (n) -> binary = rec ->
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
          assignOperator = orp(assign, addassign, ..., bitorassign)
          assignExpr_ = -> if (v=property()) and (op=assignOperator()) then (e = expect(assignExpr, 'expect the right hand side of assign.')) and v+op+e
          assignExpr = orp(assignExpr_, condition)
          expression_ = list(assignExpr, wrap(comma))
          expression = -> x = expression_(); if x then x.join(',')
    
          @root = -> (x=expression()) and expect(eoi, 'expect end of input') and x
          
在samples/arithmatic2.coffee中，全部代码只有180行，代码又如此简单，能够完整处理javascript这种复杂程度的表达式，还包含了词法分析器的功能，可以说只有peasy能够做到。

上述代码有几点独特之处需要解释一下：
* coffeescript的语法使得规则可读性非常好，不亚于其它任何编译器产生器的规则定义，javascript下则将稍逊一筹。
* 将所有规则在Parser类的constructor中设置为类的实例成员，而不是原型（prototype）成员，可以避免很多可能的与this绑定相关的问题。我曾经试过原型（prototype）成员的方案，测试和调试过程中发现有很多隐患。另外，避免查找prototype继承链，也能提高解析器的速度。
* 关于二元表达式的处理（expr(n)和它生成的binary = rec ...)也是peasy的独特之处。这将在下文中进一步解释。

也可以从peasy.coffee(或js)或logicpeasy.coffee(或js)开始，直接在其中进行修改直到完成自己的解析器。


### 实例介绍
项目中带有几个实例，解说一下：

dsl.coffee 是我在另一项目中利用peasy解析小语言的实例。

arimatic.coffee利用peasy对左递归的支持完成了javascript表达式的解析。它的特点是用一个函数生成所有优先级二元表达式的左递归规则。解析的时候从最低优先级的规则（逗号表达式）开始，调用栈经历所有优先级后得到最终结果。这种方法是线性时间的，但因为要经历很长的调用栈，对效率会有所影响。比如即使象1这样的表达式，也要变换成乘法式，加法式，...，逻辑或表达式，条件式，逗号式。

arithmatic2.coffee避免了上述问题，可以根据运算符跨越式提升表达式优先级。比如 1 || 1，可以直接将1提升成或表达式的优先级。

这两个模块演示的算术表达式的解析方法都是独特的，我尚没有发现其它类似的实现。如果您发现有相近或更好的方法，请告诉我。

### api

####class Parser(peasy.coffee/peasy.js): 解析器基类

#####数据成员

`data`：被解析数据，常见数据类型是文本，字符串。也可以用peasy解析二进制流，数组，列表，树等其他数据

`cur`：解析指针，指向当前解析位置

`ruleIndex`: 每一个rec和memo的匹配函数（rule参数）都对应唯一的一个ruleIndex

`ruleStack`: 左递归规则(rec(rule))执行的时候需要查看ruleStack，请参看rec的代码

`cache`: 保存左递归规则(rec(rule))和缓存规则(memo(rule))已经解析到的结果

##### 成员函数
以下介绍peasy的组合函数和匹配函数。这里只列举最常用的几个，因为所有的函数都很简单，函数名都是自我解释性的，而且彼此平行，都可以根据需要使用、删除，修改。把它们包含在peasy中，主要起到示范的作用，如果需要用到，请参看实现代码。

以下说明中，成功指返回真值，包括非0数字，非空字符串，数组，对象等。失败指返回假值，包括undefined, null, 0, ''等。

`parse(data, root=self.root, cur=0)`, 设置被解析数据data，起始匹配函数（默认为self.root）, 开始解析指针（默认为0）.

#####组合函数

`rec(rule)`, 将rule作为左递归规则处理。产生的结果函数将反复查看缓存，获取初始解析结果，并一直扩展到没有更多的结果为止。

`memo(rule)`，产生的结果函数将查看并缓存rule在每一个位置的解析结果，避免重复解析。

`orp(items...)`。产生的匹配函数依次从同一开始位置执行items中的项，当某一项解析成功则返回该项结果表示整体成功，所有项失败才失败。

orp可能是最常用到的组合函数。因为不能够写`item1() or item2() ... or itemn()`, 而必须写`start=self.cur; items() or ((self.cur=start) or item2()) ...  or ((self.cur=start) or itemn())`。如果忽视这一点，这将会成为代码中的一个陷阱。

`andp(items...)`, 产生的匹配函数依次执行items中的项，每一次都从前一项的到达位置继续执行，当某一项解析失败则立即返回undefined并表示整体失败，所有项成功才成功并返回最后一项的结果。
   
andp在实际的代码中很少用到。因为可以写`item1() and item2() ... and itemn()`。 而且经常需要这样写：` (x=item1()) and (y=item2()) ... itemn() and doSomeProcess(x, y)`

`literal: literal(item)`, item是字符串。产生的匹配函数将判断以解析指针开始的字符串是否与item匹配。如果匹配则成功，否则失败。

出于方便，其它组合函数会根据需要将它们的字符串类型的参数x转换为literal(x)。请根据源码查看哪些函数用到了literal转换。

`char(c)`, c是字符。产生的匹配函数将判断以解析指针开始的字符是否为c。如果匹配则成功，否则失败。

`wrap(item, left=spaces, right=spaces)` 产生的匹配函数执行如下判断`if left() and result = item() and right() then result`


#####匹配函数

`eoi`: 如果遇到数据结束(end of input), 则成功。

`spaces`：0个或多个空格。总是成功，结果为（空格个数+1）。

`spaces1`: 1个或多个空格。结果为空格个数。如果空格个数为0，则失败。

####logicpeasy的Parser类

类成员
`trail`：`self.trail = new Trail`, 保存了变量绑定踪迹。

#####非正规匹配函数

*前面介绍的匹配函数是正规的匹配函数，可以作为象orp这样的组合函数的参数。非正规匹配函数和匹配函数类似，也直接操作解析数据和指针。但是因为带有参数，因而不能直接作为orp之类组合函数的参数，如果必要，可以转换为 `-> fn(arg1, arg2, ...)`。*

`bind(vari, term)`: 绑定变量和项

`unify(x, y, equal=((x, y) -> x==y))`: 以equal作为相等函数，合一x和y

`unifyList = (xs, ys, equal=((x, y) -> x==y))`: 以equal作为相等函数，合一两个列表x和y

#####组合函数
`unifyChar(x)`， `unifyDigit(x)`, `unifyLetter(x)`,  `unifyLower(x)`, `unifyUpper(x)`, `unifyIdentifier(x)`：这些函数与peasy中的类似名称的函数功能相近，所不同之处是参数x可以是逻辑变量。

`orp(items...)`: 重载的orp扩展了与逻辑变量有关的trail处理。

#####逻辑变量与可以进行合一的数据类型
Var，vars，Dummy, dummy用来构造逻辑变量。
UObject, uobject, UArray, uarray, Cons, cons, unifiable用来构造可以包含逻辑变量并合一的值。

### 0.3.0 新功能
* 新的基于类的API
* 示例：arithmatic，arithmatic2，dsl
* 重写readme.md
* 新增readme[cn].md
* grunt 工作流
* 重新组织文件夹，分离coffee和js文件夹。

###peasy项目的由来
peasy项目是以本人的下一代编程语言项目dao(python)和daonode（coffeescript/javascript）的解析特性为基础移植而来的。dao项目实现了逻辑编程范式和函数编程范式的自然结合，是lisp和prolog语言的合体，并且内置包含了解析器功能。以逻辑变量作为参数编写文法规是dao项目的独创，这种逻辑参数文法具有强大的能力，具有超越传统编译原理所基于的乔姆斯基文法（包括上下文无关文法cfg、上下文相关文法csg以及0型文法）以及现在流行的解析表达式文法（peg)的表达能力（有兴趣的可以查阅编译原理中有关0-4型文法表达能力的一些论述，[比如这个链接](http://ccl.pku.edu.cn/doubtfire/Syntax/Introduction/Chomsky/Chomsky_Hierarchy/Chapter%2024%20The%20Chomsky%20Hierarchy.htm)），同时无损于解析算法的时间复杂度。

### python实现
本项目有peasy的老版本python实现，因为时间问题，没有与coffee/js版本同步更新。

### 关于Peasy的其它信息
**更多文档**：http://chaosim.github.io/peasy/ 有更多关于peasy的文档。

**项目站点**：github <https://github.com/chaosim/peasy> 。

**测试** ： Peasy使用karma/jasmine和mocha/chai进行测试框架，请看文件夹“/test”

**报告bug** ：要报告或查找bug，请转到<https://github.com/chaosim/peasy/issues> ，或电邮至simeon.chaos @ gmail.com

**开发平台** ： Windows 7， node.js的0.10.0， CoffeeScript的1.6.3 。

**许可证(license)** ：MIT，请看LICENSE