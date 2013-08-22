# Peasy: an easy but powerful parser
### Parsing is easy!

With Peasy, you write the parser by hand, just like to write any other kind of program.
You need not play ![many balls like that any more.<br/>](https://raw.github.com/chaosim/peasy/master/doc/ballacrobatics.jpg) <br/><br/>
You just play ![one ball like so: ](https://raw.github.com/chaosim/peasy/master/doc/dolphinball.jpg). <br/><br/>

To use Peasy, just copy the module to your project, read it, modify it, write the grammar rules,, and remove any unnecessary
stuffs in Peasy, and parse with the grammar.<br/>

### Documentation
The [annotated peasy.coffee](http://chaosim.github.io/peasy/doc/peasy.html) is best document for Peasy at the moment.<br/>
If you're a pythoner, maybe you'd like to see the [annotated peasy.py](http://chaosim.github.io/peasy/doc/pypeasy.html).<br/>
See the tests in /test for samples of left recursive grammars and how to parse them.<br/>
See [here](http://chaosim.github.io/peasy/doc/peasy.html#peasysample) for a sample grammar in Peasy.<br/>
For arithemetic expression, [here is a sample:](https://github.com/chaosim/peasy/blob/master/samples/arithmatic.js)<br/>
The sample parser for a real language, here is [my translation from coffeescript's jison grammar:] <br/>
(https://github.com/chaosim/coffee-script/blob/master/src/parser.js) <br/>
and it's transcompiled from [this coffeescript source:] <br/>
(https://github.com/chaosim/coffee-script/blob/master/src/parser.coffee)<br/>
The original grammar.coffee, [from which lib/coffeescript/parser.js is generated:]<br/>
(https://github.com/jashkenas/coffee-script/blob/master/src/grammar.coffee)

### Web sites
the project's repository is on github <https://github.com/chaosim/peasy>.

### Testing
Peasy uses the nodeunit test framework, see the folder "test"

### Bug reports
To report or search for bugs, please goto <https://github.com/chaosim/peasy/issues>, or email to simeon.chaos@gmail.com

### Platform notes
peasy is developed and tested on Windows 7, node.js 0.10.0, coffeescript 1.6.2.

### License
MIT: see LICENSE

