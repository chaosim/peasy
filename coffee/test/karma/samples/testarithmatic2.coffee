if typeof window=='object' then {require, exports, module} = twoside('/test/mocha/samples/testarithmatic2')
do (require=require, exports=exports, module=module) ->

  {Parser} = require '../../../samples/arithmatic2'

  parser = new Parser

  parse = (text) -> parser.parse(text)

  describe "run samples/testarithmatic2:", ->
    it '', ->

  describe "testarithmatic2", ->
    it "testaritmatic2: parse number", ->
      expect(parse('1')).toBe '1'
      expect(parse('01')).toBe '01'
      expect(parse('0x01')).toBe '0x01'
      expect(parse('.1')).toBe '.1'
      expect(parse('1.')).toBe '1.'
      expect(parse('+1.')).toBe '+1.'
      expect(parse('+1.e0')).toBe '+1.e0'
      expect(parse('+1.e023')).toBe '+1.e023'
      expect(parse('+1.e')).toBe undefined
      expect(parse('+.e')).toBe undefined
      expect(parse('+.')).toBe undefined
      expect(parse('-.')).toBe undefined
      expect(parse('-.1')).toBe '-.1'
    it "testaritmatic2: parse identifier", ->
      expect(parse('a')).toBe 'a'
      expect(parse('$a')).toBe '$a'
      expect(parse('$a_')).toBe '$a_'
      expect(parse('$a_1')).toBe '$a_1'
      expect(parse('_1')).toBe '_1'
    it "testaritmatic2: parse string", ->
      expect(parse('"a\\"b"')).toBe '"a\"b"'
      expect(parse('"a"')).toBe '"a"'
      expect(parse("'a'")).toBe "'a'"
    it "testaritmatic2: parse a.b", ->
      expect(parse('a.b')).toBe 'a.b'
    it "testaritmatic2: parse 1+1", ->
      expect(parse('1+1')).toBe '1+1'
    it "testaritmatic2: parse 1+1*1", ->
      expect(parse('1+1*1')).toBe '1+1*1'
    it "testaritmatic2: parse 1*1+1", ->
      expect(parse('1*1+1')).toBe '1*1+1'
    it "testaritmatic2: parse 1*1", ->
      expect(parse('1*1')).toBe '1*1'
    it "testaritmatic2: parse 1*1*1  ", ->
      expect(parse('1*1*1')).toBe '1*1*1'
    it "testaritmatic2: parse (1*1)  ", ->
      expect(parse('(1*1)')).toBe '(1*1)'
    it "testaritmatic2: parse (1*1)", ->
      expect(parse('(1*1)')).toBe '(1*1)'
    it "testaritmatic2: parse (1*1)+(2*3)", ->
      expect(parse('(1*1)+(2*3)')).toBe '(1*1)+(2*3)'
    it "testaritmatic2: parse a=1", ->
      expect(parse('a=1')).toBe 'a=1'
    it "testaritmatic2: parse a  = 1", ->
      expect(parse('a  = 1')).toBe 'a=1'
    it "testaritmatic2: parse a  = b = 1", ->
      expect(parse('a  = b = 1')).toBe 'a=b=1'
    it "testaritmatic2: parse 1?  a = 3:  b = 4", ->
      expect(parse('1?  a = 3:  b = 4')).toBe '1? a=3: b=4'
    it "testaritmatic2: parse 1?a=3:b=4", ->
      expect(parse('1?a=3:b=4')).toBe '1? a=3: b=4'