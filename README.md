# Peasy: an easy but powerful parser
### Parsing is easy!

To write parser with Peasy, it's not necessary to play [many balls like that any more.](https://raw.github.com/chaosim/peasy/master/doc/ballacrobatics.jpg) as before,
just to play [one ball like so](https://raw.github.com/chaosim/peasy/master/doc/dolphinball.jpg) instead:)

### usage
#### in browser
  just copy peasy.js and logicpeasy.js(if logic features is useful), twoside.js to your project folder, add them to the script tags in yourpage.html, ensure to put twoside.js before peasy.js.

#### node.js

  npm install peasy

#### twoside
  twoside is a utility I wrote to make module can be used both in browser and node.js. If you don't want to use it, just ignore it and remove the first two lines in peasy.js and logicpeasy.js that wrap the actual code, and remove exports variable and it's occurences.

  for more information, see https://github/chaosim/twoside

  node.js: npm install twoside

### introduction
Peasy is a simple module with only one file. 


### what's new in 0.3.0
  * new class based api
  * samples: arithmatic, arithmatic2, dsl
  * rewrite readme.md
  * grunt work flow
  * rearranges folder, split coffee and js folder.

### information on Peasy
**Web sites**: the project's repository is on github <https://github.com/chaosim/peasy>.

**Testing**: Peasy uses the nodeunit test framework, see the folder "test" 

**Bug reports**: To report or search for bugs, please goto <https://github.com/chaosim/peasy/issues>, or email to simeon.chaos@gmail.com 

**Platform notes**: peasy is developed and tested on Windows 7, node.js 0.10.0, coffeescript 1.6.2.

**License**: MIT, see LICENSE

