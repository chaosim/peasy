{makeInfo, letters, combinators} = require "../lib/peasy.js"

parse1 = (text) ->
  makeGrammar = (info) ->
    {a, x} = letters(info)
    {rec, orp} = combinators(info)
    rules = A: rec orp(( -> (m = rules.A()) and x() and m+'x' or m), a)
  grammar = makeGrammar(makeInfo(text))
  grammar.A(0)

parse2 = (text) ->
  makeGrammar = (info) ->
    {a, b, x} = letters(info)
    {rec, orp} = combinators(info)
    rules = {}
    rules.A = rec orp((-> (m =  rules.B()) and x() and m+'x' or m), a)
    rules.B = rec orp(rules.A, b)
    rules
  grammar = makeGrammar(makeInfo(text))
  grammar.A(0)

parse3 = (text) ->
  makeGrammar = (info) ->
    {a, b, x} = letters(info)
    {rec, orp} = combinators(info)
    rules = {}
    rules.A = rec orp((-> (m =  rules.B()) and x() and m+'x' or m), a)
    rules.B = rec -> rules.C()
    rules.C = rec orp(rules.A, b)
    rules
  grammar = makeGrammar(makeInfo(text))
  grammar.A(0)

parse4 = (text) ->
  makeGrammar = (info) ->
    {a, b, x, y} = letters(info)
    {rec, orp} = combinators(info)
    rules =
      A: rec -> orp((-> (m =  rules.B()) and x() and m+'x' or m), a)()
      B: rec -> orp(( -> (m = rules.A())  and y() and m+'y'), rules.C)()
      C: rec -> orp(rules.A, b)()
  grammar = makeGrammar(makeInfo(text))
  grammar.A(0)

parse5 = (text) ->
  makeGrammar = (info) ->
    {a, b, x, y, z} = letters(info)
    {rec, orp} = combinators(info)
    rules =
      Root: -> (m = rules.A()) and z() and m+'z'
      A: rec orp(( -> (m =  rules.B()) and x() and m+'x' or m), a)
      B: rec orp((-> (m = rules.A())  and y() and m+'y'), -> rules.C())
      C: rec orp((-> rules.A()), b)
  grammar = makeGrammar(makeInfo(text))
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
