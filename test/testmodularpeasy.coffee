{setupGrammar, char} = parser = p  = require "../lib/modularpeasy.js"

hasOwnProperty = Object.hasOwnProperty

parse1 = (text) ->
  makeGrammar = (info) ->
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x')
    rules =
      A: (start) ->
        (m = rules.A(start)) and x(info.cursor) and m+'x' or m\
        or a(start)
      __leftRecursives:['A']
    setupGrammar(info, rules)
  grammar = makeGrammar({data:text, cursor:0})
  grammar.A(0)

parse2 = (text) ->
  makeGrammar = (info) ->
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x')
    rules =
      A: (start) ->
        (m =  rules.B(start)) and x(info.cursor) and m+'x' or m\
        or a(start)
      B: (start) ->rules.A(start) or b(start)
      __leftRecursives:['A', 'B']
    setupGrammar(info, rules)
  grammar = makeGrammar({data:text, cursor:0})
  grammar.A(0)

parse3 = (text) ->
  makeGrammar = (info) ->
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x')
    rules =
      A: (start) ->
        (m =  rules.B(start)) and x(info.cursor) and m+'x' or m\
        or a(start)
      B: (start) -> rules.C(start)
      C: (start) -> rules.A(start) or b(start)
      __leftRecursives:['A', 'B', 'C']
    setupGrammar(info, rules)
  grammar = makeGrammar({data:text, cursor:0})
  grammar.A(0)

xexports = {}

exports.Test =
  "test A: Ax|a": (test) ->
    parse = parse1
    test.equal parse('a'), 'a'
    test.equal parse('ax'), 'ax'
    test.equal parse('axx'), 'axx'
    test.equal parse('axxx'), 'axxx'
    test.done()

#xexports.Test =
  "test A: Bx|a; B:A|b": (test) ->
    parse = parse2
    test.equal parse('a'), 'a'
    test.equal parse('ax'), 'ax'
    test.equal parse('axx'), 'axx'
    test.equal parse('axxx'), 'axxx'
    test.equal parse('b'), 'b'
    test.equal parse('bx'), 'bx'
    test.equal parse('bxxx'), 'bxxx'
    test.equal parse('bxg'), 'bx'
    test.equal parse('bxxg'), 'bxx'
    test.equal parse('bxxxg'), 'bxxx'
    test.equal parse('fg'), undefined
    test.equal parse(''), undefined
    test.done()

#exports.Test =
  "test A: Bx|a; B:C; C:A|b": (test) ->
    parse = parse3
    test.equal parse('a'), 'a'
    test.equal parse('ax'), 'ax'
    test.equal parse('axx'), 'axx'
    test.equal parse('axxx'), 'axxx'
    test.equal parse('b'), 'b'
    test.equal parse('bx'), 'bx'
    test.equal parse('bxxx'), 'bxxx'
    test.equal parse('bxg'), 'bx'
    test.equal parse('bxxg'), 'bxx'
    test.equal parse('bxxxg'), 'bxxx'
    test.equal parse('fg'), undefined
    test.equal parse(''), undefined
    test.done()