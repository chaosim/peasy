if typeof window=='object' then {require, exports, module} = twoside('/test/karma/deprecated/testmodularpeasy')
do (require=require, exports=exports, module=module) ->

  {makeInfo, letters, combinators} = require "../../../deprecated/modularpeasy"

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

  describe 'modular peasy', ->
    it "test A: Ax|a", ->
      parse = parse1
      expect(parse('a')).toBe 'a'
      expect(parse('ax')).toBe 'ax'
      expect(parse('axx')).toBe 'axx'
      expect(parse('axxx')).toBe 'axxx'

    it "test A: Bx|a; B:A|b", ->
      parse = parse2
      expect(parse('a')).toBe 'a'
      expect(parse('ax')).toBe 'ax'
      expect(parse('axx')).toBe 'axx'
      expect(parse('axxx')).toBe 'axxx'
      expect(parse('b')).toBe 'b'
      expect(parse('bx')).toBe 'bx'
      expect(parse('bxxx')).toBe 'bxxx'
      expect(parse('bxg')).toBe 'bx'
      expect(parse('bxxg')).toBe 'bxx'
      expect(parse('bxxxg')).toBe 'bxxx'
      expect(parse('fg')).toBe undefined
      expect(parse('')).toBe undefined

    it "test A: Bx|a; B:C; C:A|b", ->
      parse = parse3
      expect(parse('a')).toBe 'a'
      expect(parse('ax')).toBe 'ax'
      expect(parse('axx')).toBe 'axx'
      expect(parse('axxx')).toBe 'axxx'
      expect(parse('b')).toBe 'b'
      expect(parse('bx')).toBe 'bx'
      expect(parse('bxxx')).toBe 'bxxx'
      expect(parse('bxg')).toBe 'bx'
      expect(parse('bxxg')).toBe 'bxx'
      expect(parse('bxxxg')).toBe 'bxxx'
      expect(parse('fg')).toBe undefined
      expect(parse('')).toBe undefined

    it "test A: Bx|a; B:C|Ay; C:A|b", ->
      parse = parse4
      expect(parse('a')).toBe 'a'
      expect(parse('ax')).toBe 'ax'
      expect(parse('axx')).toBe 'axx'
      expect(parse('axxx')).toBe 'axxx'
      expect(parse('ay')).toBe 'ay'
      expect(parse('ayx')).toBe 'ayx'
      expect(parse('ayxyx')).toBe 'ayxyx'
      expect(parse('bxx')).toBe 'bxx'
      expect(parse('ayxxx')).toBe 'ayxxx'
      expect(parse('ayxmxx')).toBe 'ayx'
      expect(parse('b')).toBe 'b'
      expect(parse('bx')).toBe 'bx'
      expect(parse('bxxx')).toBe 'bxxx'
      expect(parse('bxg')).toBe 'bx'
      expect(parse('bxxg')).toBe 'bxx'
      expect(parse('bxxxg')).toBe 'bxxx'
      expect(parse('fg')).toBe undefined
      expect(parse('')).toBe undefined

    it "test Start: Az; A: Bx|a; B:C|Ay; C:A|b", ->
      parse = parse5
      expect(parse('az')).toBe 'az'
      expect(parse('axz')).toBe 'axz'
      expect(parse('axxz')).toBe 'axxz'
      expect(parse('axxxz')).toBe 'axxxz'
      expect(parse('ayz')).toBe 'ayz'
      expect(parse('ayxz')).toBe 'ayxz'
      expect(parse('ayxyxz')).toBe 'ayxyxz'
      expect(parse('bxxz')).toBe 'bxxz'
      expect(parse('ayxxxz')).toBe 'ayxxxz'
      expect(parse('ayxmxxz')).toBe undefined
      expect(parse('bz')).toBe 'bz'
      expect(parse('bxz')).toBe 'bxz'
      expect(parse('bxxxz')).toBe 'bxxxz'
      expect(parse('bxgz')).toBe undefined
      expect(parse('bxxgz')).toBe undefined
      expect(parse('bxxxgz')).toBe undefined
      expect(parse('fg')).toBe undefined
      expect(parse('')).toBe undefined

