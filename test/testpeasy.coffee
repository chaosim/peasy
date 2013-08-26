{setupGrammar, char} = parser = p  = require "../lib/peasy.js"

hasOwnProperty = Object.hasOwnProperty

parse1 = (text) ->
  makeGrammar = (info) ->
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x')
    rules =
      A: (start) ->
        (m = rules.A(start)) and x(info.cursor) and m+'x' or m\
        or a(start)
      __leftRecursives: ['A']
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
      B: (start) -> rules.A(start) or b(start)
      __leftRecursives: ['A', 'B']
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
      __leftRecursives: ['A', 'B', 'C']
    setupGrammar(info, rules)
  grammar = makeGrammar({data:text, cursor:0})
  grammar.A(0)

parse4 = (text) ->
  makeGrammar = (info) ->
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x'); y = char(info, 'y')
    rules =
      A: (start) ->
        (m =  rules.B(start)) and x(info.cursor) and m+'x' or m\
        or a(start)
      B: (start) ->(m = rules.A(start))  and y(info.cursor) and m+'y'or rules.C(start)
      C: (start) -> rules.A(start) or b(start)
      __leftRecursives: ['A', 'B', 'C']
    setupGrammar(info, rules)
  grammar = makeGrammar({data:text, cursor:0})
  grammar.A(0)

parse5 = (text) ->
  makeGrammar = (info) ->
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x'); y = char(info, 'y'); z = char(info, 'z')
    rules =
      Root: (start) -> (m = rules.A(start)) and z(info.cursor) and m+'z'
      A: (start) ->
        (m =  rules.B(start)) and x(info.cursor) and m+'x' or m\
        or a(start)
      B: (start) ->(m = rules.A(start))  and y(info.cursor) and m+'y'or rules.C(start)
      C: (start) -> rules.A(start) or b(start)
      __leftRecursives: ['A', 'B', 'C']
    setupGrammar(info, rules)
  grammar = makeGrammar({data:text, cursor:0})
  grammar.Root(0)

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

#exports.Test =
  "test A: Bx|a; B:C|Ay; C:A|b": (test) ->
    parse = parse4
    test.equal parse('a'), 'a'
    test.equal parse('ax'), 'ax'
    test.equal parse('axx'), 'axx'
    test.equal parse('axxx'), 'axxx'
    test.equal parse('ay'), 'ay'
    test.equal parse('ayx'), 'ayx'
    test.equal parse('ayxyx'), 'ayxyx'
    test.equal parse('bxx'), 'bxx'# Bx Cx Ax Bxx Cxx bxx
    test.equal parse('ayxxx'), 'ayxxx'# Bx Cx Ax Bxx Cxx Axx Bxxx Ayxxx ayxxx
    test.equal parse('ayxmxx'), 'ayx'
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
  "test Start: Az; A: Bx|a; B:C|Ay; C:A|b": (test) ->
    parse = parse5
    test.equal parse('az'), 'az'
    test.equal parse('axz'), 'axz'
    test.equal parse('axxz'), 'axxz'
    test.equal parse('axxxz'), 'axxxz'
    test.equal parse('ayz'), 'ayz'
    test.equal parse('ayxz'), 'ayxz'
    test.equal parse('ayxyxz'), 'ayxyxz'
    test.equal parse('bxxz'), 'bxxz'
    test.equal parse('ayxxxz'), 'ayxxxz'
    test.equal parse('ayxmxxz'), undefined
    test.equal parse('bz'), 'bz'
    test.equal parse('bxz'), 'bxz'
    test.equal parse('bxxxz'), 'bxxxz'
    test.equal parse('bxgz'), undefined
    test.equal parse('bxxgz'), undefined
    test.equal parse('bxxxgz'), undefined
    test.equal parse('fg'), undefined
    test.equal parse(''), undefined
    test.done()
