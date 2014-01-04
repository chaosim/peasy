if typeof window=='object' then {require, exports, module} = twoside('/test/karma/testarithmatic')
do (require=require, exports=exports, module=module) ->

  {parse} = arithmatic = require '../../../samples/arithmatic'

  console.log arithmatic

  describe "run samples/testarithmatic:", ->
    it '', ->

  describe "parse", ->
    it "parse @) shold throw error", ->
      expect(parse('1')).toBe 1
