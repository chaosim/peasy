// wrap lines by gulp-twoside for providing twoside module
var exports, module, require, ts;
if (typeof window === 'object') { ts = twoside('peasy/lineparser.js'), require = ts.require, exports = ts.exports, module = ts.module;} 
(function(require, exports, module) {

/* an extended parser with lineno and row support */
var BaseParser, Parser, exports,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseParser = require("./parser");

exports = module.exports = Parser = (function(_super) {
  __extends(Parser, _super);

  function Parser() {
    var self;
    Parser.__super__.constructor.apply(this, arguments);
    self = this;
    this.parse = function(data, root, cur, lineno, row) {
      if (root == null) {
        root = self.root;
      }
      if (cur == null) {
        cur = 0;
      }
      if (lineno == null) {
        lineno = 0;
      }
      if (row == null) {
        row = 0;
      }
      self.data = data;
      self.cur = cur;
      self.trail = new Trail;
      self.ruleStack = {};
      self.cache = {};
      return root();
    };
  }

  return Parser;

})(BaseParser);
})(require, exports, module); // wrap line by gulp-twoside