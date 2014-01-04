if typeof window=='object' then {require, exports, module} = twoside('/test/karma/deprecated/testnonmodularpeasy')
do (require=require, exports=exports, module=module) ->

  {initialize, char, memo, setRules, addRecursiveCircles, computeLeftRecursives
  } = parser = p  = require "../../../deprecated/nonmodularpeasy"

  hasOwnProperty = Object.hasOwnProperty

  a = char('a'); b = char('b'); x = char('x')

  memoA = memo('A')

  parse1 = (text) ->
    rules =
      A: (start) ->
        (m = memoA(start)) and x(p.cur()) and m+'x' or m\
        or a(start)
      rootSymbol: 'A'
    initialize()
    addRecursiveCircles(rules, ['A'])
    computeLeftRecursives(rules)
    parser.parse(text, rules)

  parse2 = (text) ->
    rules =
      A: (start) ->
        (m =  rules.B(start)) and x(p.cur()) and m+'x' or m\
        or a(start)
      B: (start) ->memoA(start) or b(start)
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
      C: (start) -> memoA(start) or b(start)
      rootSymbol: 'A'
    initialize()
    addRecursiveCircles(rules, ['A', 'B', 'C'])
    computeLeftRecursives(rules)
    parser.parse(text, rules)

  describe 'non modular peasy', ->
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

