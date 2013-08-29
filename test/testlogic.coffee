{vari, cons, uarray, uobject, makeInfo} = logic = require "../lib/logic"

xexports = {}

makeCmd = ->
  info = makeInfo('')
  {unify: logic.unify(info), orp: logic.orp(info)}

exports.Test =
#xexports.Test =
  "test unify 1 1, 1 2": (test) ->
    {unify, orp} = makeCmd()
    test.equal  unify(1, 1), true
    {unify, orp} = makeCmd()
    test.equal  unify(1, 2), false
    test.done()

#exports.Test =
  "test unify logicvar": (test) ->
    {unify, orp} = makeCmd()
    test.equal  unify(vari(), 1), true
    {unify, orp} = makeCmd()
    test.equal  ($a=vari()) and  unify($a, 1) and unify($a, 2), false
    {unify, orp} = makeCmd()
    test.equal  ($a = vari()) and orp((-> unify($a, 1) and unify($a, 2)), -> unify($a, 2))(), true
    test.done()

#exports.Test =
  "test unify cons": (test) ->
    {unify, orp} = makeCmd()
    test.equal  unify(cons(1, null), cons(1, null)), true
    {unify, orp} = makeCmd()
    test.equal  unify(cons(vari(), null), cons(1, null)), true
    {unify, orp} = makeCmd()
    test.equal  ($a = vari()) and unify(cons($a, null), cons(1, null)) and unify($a, 2), false
    {unify, orp} = makeCmd()
    test.equal  ($a = vari()) and orp((-> unify(cons($a, null), cons(1, null)) and unify($a, 2)), -> unify($a, 2))(), true
    test.done()

#exports.Test =
  "test unify uobject": (test) ->
    {unify, orp} = makeCmd()
    test.equal  unify(uobject({a: 1}), {a:1}), true
    {unify, orp} = makeCmd()
    test.equal  unify(uobject({a: 1}), {a:2}), false
    {unify, orp} = makeCmd()
    test.equal  unify(uobject({a: vari()}), {a:1}), true
    {unify, orp} = makeCmd()
    test.equal  ($a = vari()) and unify(uobject({a: $a}), {a:1}) and unify($a, 2), false
    {unify, orp} = makeCmd()
    test.equal  ($a = vari()) and orp((-> unify(uobject({a: $a}), {a:1}) and unify($a, 2)), -> unify($a, 2))(), true
    test.done()

#exports.Test =
  "test unify array, uarray": (test) ->
    {unify, orp} = makeCmd()
    test.equal  unify([], []), false
    {unify, orp} = makeCmd()
    test.equal  unify(uarray([]), []), true
    {unify, orp} = makeCmd()
    test.equal  unify(uarray([vari()]), []), false
    {unify, orp} = makeCmd()
    test.equal  unify(uarray([vari()]), [1]), true
    {unify, orp} = makeCmd()
    test.equal  ($a = vari()) and unify(uarray([$a]), [1]) and unify($a, 2), false
    {unify, orp} = makeCmd()
    test.equal  ($a = vari()) and orp((-> unify(uarray([$a]), [1]) and unify($a, 2)), -> unify($a, 2))(), true
    test.done()

