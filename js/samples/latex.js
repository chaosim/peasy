
/*
{-# LANGUAGE ScopedTypeVariables, OverloadedStrings #-}
{-
Copyright (C) 2006-2012 John MacFarlane <jgm@berkeley.edu>

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
-}

{- |
 Module      : Text.Pandoc.Readers.LaTeX
 Copyright   : Copyright (C) 2006-2012 John MacFarlane
 License     : GNU GPL, version 2 or above

 Maintainer  : John MacFarlane <jgm@berkeley.edu>
 Stability   : alpha
 Portability : portable

Conversion of LaTeX to 'Pandoc' document.
-}
 */
var Parser, StateMachine, charset, identifierCharSet, identifierChars, in_, letterDigits, peasy, _in_,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

peasy = require("../index");

StateMachine = require("./statemachine").StateMachine;

in_ = peasy.in_, charset = peasy.charset, letterDigits = peasy.letterDigits;

_in_ = in_;

identifierChars = '$_' + letterDigits;

identifierCharSet = charset(identifierChars);

exports.Parser = Parser = (function(_super) {
  __extends(Parser, _super);

  function Parser() {
    var anyControlSeq, block, blocks, ch, char, comment, controlSeq, dim, dimenarg, eoi, identifier, isLowerHex, list, literal, mayNewLine, memo, num, orp, percent, rec, self, skipLine, spaces, wrap, _ref;
    Parser.__super__.constructor.apply(this, arguments);
    _ref = self = this, orp = _ref.orp, list = _ref.list, rec = _ref.rec, memo = _ref.memo, wrap = _ref.wrap, char = _ref.char, literal = _ref.literal, spaces = _ref.spaces, eoi = _ref.eoi, identifier = _ref.identifier;
    mayNewLine = may(newline);
    anyControlSeq = function() {
      return slash() && orp(NewLine, anyChar)();
    };
    controlSeq = function(name) {
      return slash();
    };
    dimenarg = (ch = orp("", literal('='))()) && (num = many1(digit)()) && (dim = oneOfStrings("pt", "pc", "in", "bp", "cm", "mm", "dd", "cc", "sp")()) && ch + num + dim;
    isLowerHex = function(x) {
      return x >= '0' && x <= '9' || x >= 'a' && x <= 'f';
    };
    anyCharUnless('\n');
    skipLine = function() {
      var c, cur, text;
      text = self.data;
      cur = self.cur;
      while (1) {
        c = text[cur++];
        if (c === '\n') {
          return true;
        }
      }
    };
    percent = char('%');
    comment = percent() && skipLine();
    block = orp(comment, emptyLines, environment, macro, blockCommand, groupedBlock, paragraph, charAt);
    blocks = any(block);
    this.root = function() {
      var x;
      return (x = blocks()) && x;
    };
  }

  return Parser;

})(peasy.Parser);
