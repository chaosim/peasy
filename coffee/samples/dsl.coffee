if typeof window=='object' then {require, exports, module} = twoside('/samples/dsl')
do (require=require, exports=exports, module=module) ->

  {inCharset, letters, charset} = peasy = require '../peasy'

  identifierHeadChars = '$_'+letters
  endTextCharset = charset(')@'+identifierHeadChars)
  identifierHeadCharset = charset(identifierHeadChars)

  exports.TemplateParser = class TemplateParser extends peasy.Parser
    constructor: ->
      super

      [at, lpar, rpar, exclam] = for c in '@()!' then do(c=c) => @char(c)

      mayExclam = @may(exclam)

      error = (msg) => throw @data[@cur-20..@cur+20]+' '+@cur+': '+msg

      tcall = => (f = tfield()) and lpar() and (args = template()) and ((rpar() and f+'('+args+')') or error('expect )'))

      tfield = @memo(=> at() and (((id=@identifier()) and mayExclam() and 't.'+id) or error('expect @identifier')))

      field = => (id=@identifier()) and mayExclam() and "t.transform(e.#{id})"

      text = =>
        data = @data
        start = cur = @cur
        result = ''
        while 1
          c = data[cur]
          if (not c) then break
          else if c=='!'
            cur++
            c = data[cur]
            if inCharset(c, identifierHeadCharset)
              @cur = cur
              id = @identifier()
              cur = @cur
              result += id
            else if c=='!' or c=='@' or c==')'
              result += c
              cur++
            else if c
              result += '!'+c
              cur++
            else break
          else if c=='\n' then cur++; result +='\\n'
          else if inCharset(c, endTextCharset) then break
          else result += c; cur++
        if cur==start then return
        @cur = cur
        if '"' in result then "'"+result+"'"
        else '"'+result+'"'

      anySegment = @any(@orp(tcall, tfield, field, text))
      template = => (x = anySegment()) and x.join(',')
      @root = => (t = template()) and ((@eoi() and t) or error('unexpected )'))

  templateParser = new TemplateParser

  exports.parseTemplate = parseTemplate = (text) -> templateParser.parse(text)