# Peasy: an easy but powerful parser
### Parsing is easy!

With Peasy, you write the parser by hand, just like to write any other kind of program.
You need not play [many balls like that any more.](https://raw.github.com/chaosim/peasy/master/ballacrobatics.jpg)
You just play [one ball like so!](https://raw.github.com/chaosim/peasy/master/dolphinball.jpg),

To use Peasy, just copy this file to your project, read it, modify it, write rules for the grammar, and
remove any unnessary stuffs when you are sure that, and parse the object with the grammar.
See [here](#peasysample) for a sample grammar in Peasy.

### What's new in Peasy
### what's new in 0.2.0
* the functions to gather information about left recursive symbol automaticly
* the functions to help yourself to set left recursive symbol by hand.
* the above utilities use recursive to wrap the left left recursive symbol
* use memorize and memo to help cache the parsing result for any grammar symbol.
* some functions to demonstrate the method to write the matchers for peasy yourself, such as andp, orp, spaces, etc.

### Documentation
The [annotated peasy.coffee](http://http://chaosim.github.io/peasy/doc/peasy.html) is best document for Peasy at the moment.
See the tests in /test, and you'll see some samples of left recursive grammars and how to parse them.

### Web sites
the project's repository is on github <https://github.com/chaosim/peasy>.

### Testing
Peasy uses the nodeunit test framework, see the folder "test"

### Bug reports
To report or search for bugs, please goto <https://github.com/chaosim/peasy>, or email to simeon.chaos@gmail.com

### Platform notes
peasy is developed and tested on Windows 7, node.js 0.10.0, coffeescript 1.6.2.

### License
MIT: see LICENSE

