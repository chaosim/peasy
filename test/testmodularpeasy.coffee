{recursiveGrammar
} = parser = p  = require "../lib/classpeasy.js"

hasOwnProperty = Object.hasOwnProperty

hasOwnProperty = Object.hasOwnProperty



parse1 = (text) ->
  makeGrammar = (info) ->
    a = char(info, 'a'); b = char(info, 'b'); x = char(info, 'x')
    rules =
      A: (start) ->
        (m = rules.A(start)) and x(p.cur()) and m+'x' or m\
        or a(start)
      __leftRecursives:['A']
    recursiveGrammar(info, rules)
    initialize()
    addRecursiveCircles(rules, ['A'])
    computeLeftRecursives(rules)
    parser.parse(text, rules)

parse2 = (text) ->
  rules =
    A: (start) ->
      (m =  rules.B(start)) and x(p.cur()) and m+'x' or m\
      or a(start)
    B: (start) ->rules.A(start) or b(start)
    rootSymbol: 'A'
  initialize()
  addRecursiveCircles(rules, ['A', 'B'])
  computeLeftRecursives(rules)
  parser.parse(text,  rules)

parse3 = (text) ->
  rules =
    A: (start) ->
      (m =  rules.B(start)) and x(p.cur()) and m+'x' or m\
      or a(start)
    B: (start) -> rules.C(start)
    C: (start) -> rules.A(start) or b(start)
    rootSymbol: 'A'
  initialize()
  addRecursiveCircles(rules, ['A', 'B', 'C'])
  computeLeftRecursives(rules)
  parser.parse(text, rules)

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

#xexports.Test =
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

exports.Test =
  "test class member": (test) ->
    class A
      a: 1
    test.equal A::a, 1
    test.done()
