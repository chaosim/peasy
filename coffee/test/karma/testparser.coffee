peasy = require '../../index.js'

describe "run testparser:", ->
  it '', ->

describe "peasy", ->
  it "should parse with A: Ax|a",  ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        x = @char('x')
        @A = @rec @orp(( => (m = @A()) and x() and m+'x' or m), a)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
    expect(parse('a')).toBe 'a'
    expect(parse('ax')).toBe 'ax'
    expect(parse('axx')).toBe 'axx'
    expect(parse('axxx')).toBe 'axxx'

  it "should parse with A: Bx|a; B:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        @A = @rec @orp((=> (m =  B()) and x() and m+'x' or m), a)
        B = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
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

  it "should parse with A: Bx|a; B:C; C:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        @A = @rec @orp((=> (m =  B()) and x() and m+'x' or m), a)
        B = @rec -> C()
        C = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
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

  it "should parse with A: Bx|a; B:C|Ay; C:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        y = @char('y')
        @A = @rec @orp((=> (m =  B()) and x() and m+'x' or m), a)
        B = @rec @orp(( => (m = @A())  and y() and m+'y'), -> C())
        C = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text, parser.A)
    expect(parse('a')).toBe 'a'
    expect(parse('ax')).toBe 'ax'
    expect(parse('axx')).toBe 'axx'
    expect(parse('axxx')).toBe 'axxx'
    expect(parse('ay')).toBe 'ay'
    expect(parse('ayx')).toBe 'ayx'
    expect(parse('ayxyx')).toBe 'ayxyx'
    expect(parse('bxx')).toBe 'bxx'# Bx Cx Ax Bxx Cxx bxx
    expect(parse('ayxxx')).toBe 'ayxxx'# Bx Cx Ax Bxx Cxx Axx Bxxx Ayxxx ayxxx
    expect(parse('ayxmxx')).toBe 'ayx'
    expect(parse('b')).toBe 'b'
    expect(parse('bx')).toBe 'bx'
    expect(parse('bxxx')).toBe 'bxxx'
    expect(parse('bxg')).toBe 'bx'
    expect(parse('bxxg')).toBe 'bxx'
    expect(parse('bxxxg')).toBe 'bxxx'
    expect(parse('fg')).toBe undefined
    expect(parse('')).toBe undefined

  it "should parse with Root: Az; A: Bx|a; B:C|Ay; C:A|b", ->
    class Parser extends peasy.Parser
      constructor: ->
        super
        a = @char('a')
        b = @char('b')
        x = @char('x')
        y = @char('y')
        z = @char('z')
        @root = => (m = @A()) and z() and m+'z'
        @A = @rec @orp(( => (m =  B()) and x() and m+'x' or m), a)
        B = @rec @orp((=> (m = @A())  and y() and m+'y'), -> C())
        C = @rec @orp(@A, b)
    parser = new Parser()
    parse = (text) -> parser.parse(text)
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
