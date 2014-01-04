if typeof window=='object' then {require, exports, module} = twoside('/test/karma/testlogicpeasy')
do (require=require, exports=exports, module=module) ->

  {vari, cons, uobject, uarray, Trail, Parser} = require '../../logicpeasy'

  describe 'logicpeasy', ->
    orp = unify = null

    beforeEach ->
      parser = new Parser
      parser.trail = new Trail
      unify  = (x, y) -> parser.unify(x,y)
      orp = (items...) -> parser.orp(items...)()

    it "should unify 1 1", ->
      expect( unify(1, 1)).toBe true

    it "should unify 1 2", ->
      expect( unify(1, 2)).toBe false

    it "should unify logicvar", ->
      expect( unify(vari(), 1)).toBe true

    it "should sequential unify logicvar", ->
      expect( ($a=vari()) and  unify($a, 1) and unify($a, 2)).toBe false

    it "should unify logicvar with backtracking", ->
      expect( ($a = vari()) and orp((-> unify($a, 1) and unify($a, 2)), -> unify($a, 2))).toBe true

    it "should unify cons 1", ->
      expect( unify(cons(1, null), cons(1, null))).toBe true

    it "should unify cons 2", ->
      expect( unify(cons(vari(), null), cons(1, null))).toBe true

    it "should unify cons 3", ->
      expect( ($a = vari()) and unify(cons($a, null), cons(1, null)) and unify($a, 2)).toBe false

    it "should unify cons 4", ->
      expect( ($a = vari()) and orp((-> unify(cons($a, null), cons(1, null)) and unify($a, 2)), -> unify($a, 2))).toBe true

    it "should unify uobject 1", ->
      expect( unify(uobject({a: 1}), {a:1})).toBe true

    it "should unify uobject 2", ->
      expect( unify(uobject({a: 1}), {a:2})).toBe false

    it "should unify uobject 3", ->
      expect( unify(uobject({a: vari()}), {a:1})).toBe true

    it "should unify uobject 4", ->
      expect( ($a = vari()) and unify(uobject({a: $a}), {a:1}) and unify($a, 2)).toBe false

    it "should unify uobject 5", ->
      expect( ($a = vari()) and orp((-> unify(uobject({a: $a}), {a:1}) and unify($a, 2)), -> unify($a, 2))).toBe true

    it "should unify array, uarray 1", ->
      expect( unify([], [])).toBe false

    it "should unify array, uarray 2", ->
      expect( unify(uarray([]), [])).toBe true

    it "should unify array, uarray 3", ->
      expect( unify(uarray([vari()]), [])).toBe false

    it "should unify array, uarray 4", ->
      expect( unify(uarray([vari()]), [1])).toBe true

    it "should unify array, uarray 5", ->
      expect( ($a = vari()) and unify(uarray([$a]), [1]) and unify($a, 2)).toBe false

    it "should unify array, uarray 6", ->
      expect( ($a = vari()) and orp((-> unify(uarray([$a]), [1]) and unify($a, 2)), -> unify($a, 2))).toBe true


