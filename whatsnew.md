## What's new in peasy

### what's new in 0.2.8
  * add logic features

### what's new in 0.2.7
  * remove the parameter `start` from the matcher functions
  * `orp` play well in testpeasy

### what's new in 0.2.6
  * better support to modular grammar
  * simpler method to declare left recursive rule and memorized rule

### what's new in 0.2.5
  * classpeasy become modular Peasy, and becomes the default module peasy.js(peasy.coffee for coffeescript)
  * original peasy.js(coffee) become nonmodularpeasy.js(coffee)
  * document on modular [Peasy](http://chaosim.github.io/peasy/doc/peasy.html)
  * document on nonmodular [Peasy](http://chaosim.github.io/peasy/doc/nonmodularpeasy.html)

### what's new in 0.2.4
  * classpeasy: which provides class Parser and TextParser

### what's new in 0.2.3
  * just for test npm readme

### what's new in 0.2.2
  * just for test npm readme

### what's new in 0.2.2
* split peasy.coffe to peasy.coffee and autopeasy.coffee
* more combinators: optional, any, some, times, separatedList, timesSeparatedList, follow
* document: annotated peasy.coffee

### what's new in 0.2.0
* the functions to gather information about left recursive symbol automaticly
* the functions to help yourself to set left recursive symbol by hand.
* the above utilities use recursive to wrap the left left recursive symbol
* use memorize and memo to help cache the parsing result for any grammar symbol.
* some functions to demonstrate the method to write the matchers for peasy yourself, such as andp, orp, spaces, etc.
