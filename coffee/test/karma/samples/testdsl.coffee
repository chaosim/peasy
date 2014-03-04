if typeof window=='object' then {require, exports, module} = twoside('/test/karma//testdsl')
do (require=require, exports=exports, module=module) ->

  peasy = require '../../../peasy'
  console.log 'peasy is required:', peasy
  peasy.testing = true
  {parseTemplate} = require '../../../samples/dsl'

  describe "run samples/testdsl:", ->
    it '', ->

  describe "parse template", ->
    it "parse @) shold throw error", ->
      expect(-> parseTemplate('@)')).toThrow()
    it "parse @x()) shold throw error", ->
      expect(-> parseTemplate('@x())')).toThrow()
    it "should parse 'x'", ->
      expect(parseTemplate('x')).toBe 't.transform(e.x)'
    it "should parse 'x!y'", ->
      expect(parseTemplate('x!y')).toBe 't.transform(e.x),t.transform(e.y)'
    it "should parse '@if_(x!y)'", ->
      expect(parseTemplate('@if_(x!y)')).toBe 't.if_(t.transform(e.x),t.transform(e.y))'
    it "should parse '@if_(x!!!y)'", ->
      expect(parseTemplate('@if_(x!!!y)')).toBe 't.if_(t.transform(e.x),"!",t.transform(e.y))'
    it "should parse '@x", ->
      expect(parseTemplate('@x')).toBe 't.x'
    it "should parse '@x@y", ->
      expect(parseTemplate('@x@y')).toBe 't.x,t.y'
    it "should parsen !)", ->
      expect(parseTemplate('!)')).toBe '")"'
    it "should parsen ;23445", ->
      expect(parseTemplate(';23445')).toBe '";23445"'
    it "should parsen ;23445qwe", ->
      expect(parseTemplate(';23445qwe')).toBe '";23445",t.transform(e.qwe)'
    it "should parsen ;23445!qwe", ->
      expect(parseTemplate(';23445!qwe')).toBe '";23445qwe"'
    it "should parsen ;23445!!qwe", ->
      expect(parseTemplate(';23445!!qwe')).toBe '";23445!",t.transform(e.qwe)'
    it "should parsen @whileLoop(!while @paren(item)\n@block(body))", ->
      expect(parseTemplate('@whileLoop(!while @paren(item)\n@block(body))')).toBe "t.whileLoop(\"while \",t.paren(t.transform(e.item)),\"\\n\",t.block(t.transform(e.body)))"
    it 'should parse "value"', ->
      expect(parseTemplate('"value"')).toBe '\'"\',t.transform(e.value),\'"\''
    it "should parse @array(items)", ->
      expect(parseTemplate('@array(items)')).toBe 't.array(t.transform(e.items))'
    it "should parse @if_(!if @paren(test)\n@block(then_)@may(\n!else @block(else_)))", ->
      expect(parseTemplate('@if_(!if @paren(test)\n@block(then_)@may(\n!else @block(else_)))')).toBe 't.if_("if ",t.paren(t.transform(e.test)),"\\n",t.block(t.transform(e.then_)),t.may("\\nelse ",t.block(t.transform(e.else_))))'
    it "should parse '@forInLoop(!for @paren(item !in range)\n@block(body))'", ->
      expect(parseTemplate('@forInLoop(!for @paren(item !in range)\n@block(body))')).toBe 't.forInLoop("for ",t.paren(t.transform(e.item)," in ",t.transform(e.range)),"\\n",t.block(t.transform(e.body)))'
    it "should parse @whileLoop(!while @paren(item)\n@block(body))", ->
      expect(parseTemplate('@whileLoop(!while @paren(item)\n@block(body))')).toBe 't.whileLoop("while ",t.paren(t.transform(e.item)),"\\n",t.block(t.transform(e.body)))'
    it "should parse @tryCatch(!try @block(test)\ncatcher@may(\n!finally @block(final)))", ->
      expect(parseTemplate('@tryCatch(!try @block(test)\ncatcher@may(\n!finally @block(final)))')).toBe 't.tryCatch("try ",t.block(t.transform(e.test)),"\\n",t.transform(e.catcher),t.may("\\nfinally ",t.block(t.transform(e.final))))'
    it "should parsen !catch @paren(variable@may(!if test))@block(\nbody)", ->
      expect(parseTemplate('!catch @paren(variable@may(!if test))@block(\nbody)')).toBe '"catch ",t.paren(t.transform(e.variable),t.may("if ",t.transform(e.test))),t.block("\\n",t.transform(e.body))'
    it "should parsen !throw value", ->
      expect(parseTemplate('!throw value')).toBe '"throw ",t.transform(e.value)'
    it "should parsen caller@paren(@list(args))", ->
      expect(parseTemplate('caller@paren(@list(args))')).toBe 't.transform(e.caller),t.paren(t.list(t.transform(e.args)))'
    it "should parsen !var @list(vars)", ->
      expect(parseTemplate('left = right')).toBe 't.transform(e.left)," = ",t.transform(e.right)'
    it "left @op(operator) = right", ->
      expect(parseTemplate('left @op(operator) = right')).toBe 't.transform(e.left)," ",t.op(t.transform(e.operator))," = ",t.transform(e.right)'
    it "should parsen @switch_(!switch @paren(expression) \n@block(@list(cases @empty)) @may(\n!default: @block(else)))", ->
      expect(parseTemplate('@switch_(!switch @paren(expression) \n@block(@list(cases @empty)) @may(\n!default: @block(else)))')).toBe 't.switch_("switch ",t.paren(t.transform(e.expression))," \\n",t.block(t.list(t.transform(e.cases)," ",t.empty))," ",t.may("\\ndefault: ",t.block(t.transform(e.else))))'
    it "!case test: \n@block(body)", ->
      expect(parseTemplate('!case test: \n@block(body)')).toBe '"case ",t.transform(e.test),": \\n",t.block(t.transform(e.body))'