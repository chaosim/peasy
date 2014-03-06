###
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
###

peasy  = require "../index"
{StateMachine} =   require "./statemachine"

{in_, charset, letterDigits} = peasy
_in_ = in_
identifierChars = '$_'+letterDigits
identifierCharSet = charset(identifierChars)

exports.Parser = class Parser extends peasy.Parser
  constructor: ->
    super
    {orp, list, rec, memo, wrap, char, literal, spaces, eoi, identifier} = self = @
    mayNewLine = may(newline)
    anyControlSeq = -> slash() and orp(NewLine, anyChar)()
    controlSeq = (name) -> slash()
    dimenarg = (ch=orp("", literal('='))()) and (num=many1(digit)()) and (dim=oneOfStrings("pt","pc","in","bp","cm","mm","dd","cc","sp")()) and ch+num+dim
    isLowerHex = (x) -> (x >= '0' && x <= '9' || x >= 'a' && x <= 'f')
    anyCharUnless('\n')
    skipLine = ->
      text = self.data
      cur = self.cur
      while 1
        c = text[cur++]
        if c=='\n' then return true
    percent = char('%')
    comment = percent() and skipLine()
    block = orp(comment, emptyLines, environment, macro, blockCommand, groupedBlock, paragraph, charAt)
    blocks = any(block)
    @root = -> (x = blocks()) and x
