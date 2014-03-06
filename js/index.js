// wrap lines by gulp-twoside for providing twoside module
var exports, module, require, ts;
if (typeof window === 'object') { ts = twoside('peasy/index.js'), require = ts.require, exports = ts.exports, module = ts.module;} 
(function(require, exports, module) {
var exports;

exports = module.exports = {
  Parser: require('./parser'),
  LogicParser: require('./logicparser'),
  LineParser: require('./lineparser'),
  debugging: false,
  testing: false,
  debug: function(message) {
    if (exports.debugging) {
      return console.log(message);
    }
  },
  warn: function(message) {
    if (exports.debugging || exports.testing) {
      return console.log(message);
    }
  },

  /* some utilities for parsing */
  Charset: function(string) {
    var x, _i, _len;
    for (_i = 0, _len = string.length; _i < _len; _i++) {
      x = string[_i];
      this[x] = true;
    }
    return this;
  },
  charset: function(string) {
    return new exports.Charset(string);
  },
  inCharset: function(ch, chars) {
    exports.warn('peasy.inCharset(char, set) is deprecated, use set.contain(char) instead.');
    return chars.hasOwnProperty(ch);
  },
  in_: exports.inCharset,
  isdigit: function(c) {
    return ('0' <= c && c <= '9');
  },
  isletter: function(c) {
    return ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z');
  },
  islower: function(c) {
    return ('a' <= c && c <= 'z');
  },
  isupper: function(c) {
    return ('A' <= c && c <= 'Z');
  },
  isIdentifierLetter: function(c) {
    return c === '$' || c === '_' || ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9');
  },
  digits: '0123456789',
  lowers: 'abcdefghijklmnopqrstuvwxyz',
  uppers: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  letters: exports.lowers + exports.uppers,
  letterDigits: exports.letterDigits
};

exports.Charset.prototype.contain = function(ch) {
  return this.hasOwnProperty(ch);
};
})(require, exports, module); // wrap line by gulp-twoside