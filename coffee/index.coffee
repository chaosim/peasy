exports = module.exports =
  Parser: require './parser'
  LogicParser: require './logicparser'
  LineParser: require './lineparser'

  debugging: false
  testing: false
  debug: (message) -> if exports.debugging then console.log message
  warn: (message) -> if exports.debugging or exports.testing then console.log message

  ### some utilities for parsing ###
  Charset: (string) ->
    for x in string then @[x] = true
    this
  charset: (string) -> new exports.Charset(string)

  inCharset: (ch, chars) ->
    exports.warn 'peasy.inCharset(char, set) is deprecated, use set.contain(char) instead.'
    chars.hasOwnProperty(ch)
  in_: exports.inCharset

  isdigit: (c) -> '0'<=c<='9'
  isletter: (c) -> 'a'<=c<='z' or 'A'<=c<='Z'
  islower: (c) -> 'a'<=c<='z'
  isupper: (c) ->'A'<=c<='Z'
  isIdentifierLetter: (c) -> c=='$' or c=='_' or 'a'<=c<='z' or 'A'<=c<='Z' or '0'<=c<='9'

  digits: '0123456789'
  lowers: 'abcdefghijklmnopqrstuvwxyz'
  uppers: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  letters: exports.lowers+exports.uppers
  letterDigits: exports.letterDigits

exports.Charset::contain = (ch) -> @hasOwnProperty(ch)
