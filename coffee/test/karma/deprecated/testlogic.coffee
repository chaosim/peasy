if typeof window=='object' then {require, exports, module} = twoside('/test/karma/deprecated/testlogic')
do (require=require, exports=exports, module=module) ->

  {vari, cons, uarray, uobject, makeInfo} = logic = require "../../../deprecated/logic"

  makeCmd = ->
    info = makeInfo('')
    {unify: logic.unify(info), orp: logic.orp(info)}

  describe 'logic', ->
    it "test unify 1 1, 1 2", ->
      {unify, orp} = makeCmd()
      expect( unify(1, 1)).toBe true
      {unify, orp} = makeCmd()
      expect( unify(1, 2)).toBe false

    it "test unify logicvar", ->
      {unify, orp} = makeCmd()
      expect( unify(vari(), 1)).toBe true
      {unify, orp} = makeCmd()
      expect( ($a=vari()) and  unify($a, 1) and unify($a, 2)).toBe false
      {unify, orp} = makeCmd()
      expect( ($a = vari()) and orp((-> unify($a, 1) and unify($a, 2)), -> unify($a, 2))()).toBe true

    it "test unify cons", ->
      {unify, orp} = makeCmd()
      expect( unify(cons(1, null), cons(1, null))).toBe true
      {unify, orp} = makeCmd()
      expect( unify(cons(vari(), null), cons(1, null))).toBe true
      {unify, orp} = makeCmd()
      expect( ($a = vari()) and unify(cons($a, null), cons(1, null)) and unify($a, 2)).toBe false
      {unify, orp} = makeCmd()
      expect( ($a = vari()) and orp((-> unify(cons($a, null), cons(1, null)) and unify($a, 2)), -> unify($a, 2))()).toBe true

    it "test unify uobject", ->
      {unify, orp} = makeCmd()
      expect( unify(uobject({a: 1}), {a:1})).toBe true
      {unify, orp} = makeCmd()
      expect( unify(uobject({a: 1}), {a:2})).toBe false
      {unify, orp} = makeCmd()
      expect( unify(uobject({a: vari()}), {a:1})).toBe true
      {unify, orp} = makeCmd()
      expect( ($a = vari()) and unify(uobject({a: $a}), {a:1}) and unify($a, 2)).toBe false
      {unify, orp} = makeCmd()
      expect( ($a = vari()) and orp((-> unify(uobject({a: $a}), {a:1}) and unify($a, 2)), -> unify($a, 2))()).toBe true

    it "test unify array, uarray", ->
      {unify, orp} = makeCmd()
      expect( unify([], [])).toBe false
      {unify, orp} = makeCmd()
      expect( unify(uarray([]), [])).toBe true
      {unify, orp} = makeCmd()
      expect( unify(uarray([vari()]), [])).toBe false
      {unify, orp} = makeCmd()
      expect( unify(uarray([vari()]), [1])).toBe true
      {unify, orp} = makeCmd()
      expect( ($a = vari()) and unify(uarray([$a]), [1]) and unify($a, 2)).toBe false
      {unify, orp} = makeCmd()
      expect( ($a = vari()) and orp((-> unify(uarray([$a]), [1]) and unify($a, 2)), -> unify($a, 2))()).toBe true


