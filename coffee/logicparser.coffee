### an extended parser with logic features ###

BaseParser = require "./parser"

exports = module.exports = class Parser extends BaseParser
  constructor: ->
    super
    self = @

    @parse = (data, root=self.root, cur=0) ->
      self.data = data
      self.cur = cur
      self.trail = new Trail
      self.ruleStack = {}
      self.cache = {}
      root()

    @bind = (vari, term) ->
      vari.bind(self.trail.deref(term))
      true

    @unify = (x, y, equal=((x, y) -> x==y)) ->
      self.trail.unify(x, y, equal)

    @unifyList = (xs, ys, equal=((x, y) -> x==y)) ->
      xlen = xs.length
      if ys.length isnt xlen then return false
      else
        _unify =  self.trail.unify
        for i in [0...xlen]
          if not _unify(xs[i], ys[i], equal) then return false
      true

    # combinator *orp* <br/>
    @orp = (items...) ->
      items = for item in items then (if (typeof item)=='string' then self.literal(item) else item)
      ->
        start = self.cur
        length = items.length
        for i in [0...length]
          self.cur = start
          self.trail = new Trail
          if result = items[i]() then return result
          if i!= length-1 then self.trail.undo()
        result

    # matcher *char*: match one character<br/>
    @unifyChar = (x) -> ->
      x = self.trail.deref(x)
      if x instanceof Var then c = self.data[self.cur++]; x.bind(c); c
      else if self.data[self.cur]==x then self.cur++; x

    @unifyDigit = (x) -> ->
      c = self.data[self.cur]
      if '0'<=c<='9'
        x = self.trail.deref(x)
        if x instanceof Var then self.cur++; x.bind(c); c
        else if x==c then self.cur++; c

    @unifyLetter = (x) -> ->
      c = self.data[self.cur]
      if 'a'<=x<='z' or 'A'<=x<='Z'
        x = self.trail.deref(x)
        if x instanceof Va then x.bind(c); self.cur++; c
        else if x==c then self.cur++; c

    @unifyLower = (x) -> ->
      c = self.data[self.cur];
      if 'a'<=x<='z'
        x = self.trail.deref(x)
        if x instanceof Var then x.bind(c); self.cur++; c
        else if x==c then self.cur++; c

    @unifyUpper = (x) -> ->
      c = self.data[self.cur]
      if  'A'<=x<='Z'
        x = self.trail.deref(x)
        if x instanceof Var then x.bind(c); self.cur++; c
        else if x==c then self.cur++; c

    @unifyIdentifier = (x) -> ->
        if n = self.identifier() and self.unify(x, n) then n

exports.Error = class Error
  constructor: (@exp, @message='', @stack = @) ->  # @stack: to make webstorm nodeunit happy.
  toString: () -> "#{@constructor.name}: #{@exp} >>> #{@message}"

exports.BindingError = class BindingError extends Error

# record the trail for variable binding <br/>
#  when multiple choices exist, a new Trail for current branch is constructored, <br/>
#  when backtracking, undo the trail to restore the previous variable binding
exports.Trail = class Trail
  constructor: (@data={}) ->
  copy: () -> new Trail(_.extend({},@data))
  set: (vari, value) ->
    data = @data
    if not data.hasOwnProperty(vari.name)
      data[vari.name] = [vari, value]

  undo: () -> for nam, pair of  @data then pair[0].binding = pair[1]

  deref: (x) -> x?.deref?(@) or x
  getvalue: (x, memo={}) ->
    getvalue =  x?.getvalue
    if getvalue then getvalue.call(x, @, memo)
    else x
  unify: (x, y, equal) ->
    x = @deref(x); y = @deref(y)
    if x instanceof Var then @set(x, x.binding); x.binding = y; true;
    else if y instanceof Var then @set(y, y.binding); y.binding = x; true;
    else x?.unify?(y, @) or y?.unify?(x, @) or equal(x, y)

# ####class Var
# Var for logic bindings, used in unify, lisp.assign, inc/dec, parser operation, etc.
exports.Var = class Var
  constructor: (@name='', @binding = @) ->
  deref: (trail) ->
    v = @
    next = @binding
    if next is @ or next not instanceof Var then next
    else
      chains = [v]
      length = 1
      while 1
        chains.push(next)
        v = next; next = v.binding
        length++
        if next is v
          for i in [0...chains.length-2]
            x = chains[i]
            x.binding = next
            trail.set(x, chains[i+1])
          return next
        else if next not instanceof Var
          for i in [0...chains.length-1]
            x = chains[i]
            x.binding = next
            trail.set(x, chains[i+1])
          return next

  bind: (value, trail) ->
    trail.set(@, @binding)
    @binding = trail.deref(value)

  getvalue: (trail, memo={}) ->
    name = @name
    if memo.hasOwnProperty(name) then return memo[name]
    result = @deref(trail)
    if result instanceof Var
      memo[name] = result
      result
    else
      result = trail.getvalue(result, memo)
      memo[name] = result
      result

  toString:() -> "vari(#{@name})"

reElements = /\s*,\s*|\s+/

# utilities for new variables
# sometiems, say in macro, we need unique var to avoid name conflict
nameToIndexMap = {}
exports.vari = (name='') ->
  index = nameToIndexMap[name] or 1
  nameToIndexMap[name] = index+1
  new Var(name+index)

exports.vars = (names) -> vari(name) for name in split names, reElements

# DummyVar never fail when it unify. see tests on any/some/times in test_parser for examples
exports.DummyVar = class DummyVar extends Var
  constructor: (name) -> @name = '_$'+name
  deref: (trail) -> @
  getvalue: (trail, memo={}) ->
    name = @name
    if memo.hasOwnProperty(name) then return memo[name]
    result = @binding
    if result is @
      memo[name] = result
      result
    else
      result = trail.getvalue(result, memo)
      memo[name] = result
      result

# nottodo: variable's applyCont:: canceled. lisp1 should be good.
exports.dummy = dummy = (name) ->
  index = nameToIndexMap[name] or 1
  nameToIndexMap[name] = index+1
  new exports.DummyVar(name+index)
exports.dummies = (names) -> new dummy(name) for name in split names,  reElements

exports.UObject = class UObject
  constructor: (@data) ->

  getvalue: (trail, memo) ->
    result = {}
    changed = false
    for key, value of @data
      v = trail.getvalue(value, memo)
      if v isnt value then changed = true
      result[key] = v
    if changed then new UObject(result)
    else @

  unify: (y, trail, equal=(x, y) -> x==y) ->
    xdata = @data
    ydata = if y instanceof UObject then y.data else y
    ykeys = Object.keys(y)
    for key of xdata
      index = ykeys.indexOf(key)
      if index==-1 then return false
      if not trail.unify(xdata[key], ydata[key], equal) then return false
      ykeys.splice(index, 1);
    if ykeys.length isnt 0 then return false
    true

# make unifable object
exports.uobject = (x) -> new UObject(x)

exports.UArray = class UArray
  constructor: (@data) ->

  getvalue: (trail, memo={}) ->
    result = []
    changed = false
    for x in @data
      v = trail.getvalue(x, memo)
      if v isnt x then changed = true
      result.push(v)
    if changed then new UArray(result)
    else @

  unify: (y, trail, equal=(x, y) -> x==y) ->
    xdata = @data; ydata = y.data or y
    length = @data.length
    if length!=y.length then return false
    for i in [0...length]
      if not trail.unify(xdata[i], ydata[i], equal) then return false
    true

  toString: () -> @data.toString()

# make unifable array
exports.uarray = uarray = (x) -> new UArray(x)

exports.Cons = class Cons
  constructor: (@head, @tail) ->

  getvalue: (trail, memo={}) ->
    head = @head; tail = @tail
    head1  = trail.getvalue(head, memo)
    tail1  = trail.getvalue(tail, memo)
    if head1 is head and tail1 is tail then @
    else new Cons(head1, tail1)

  unify: (y, trail, equal=(x, y) -> x==y) ->
   if y not instanceof Cons then false
   else if not trail.unify(@head, y.head, equal) then false
   else trail.unify(@tail, y.tail, equal)

  flatString: () ->
    result = "#{@head}"
    tail = @tail
    if tail is null then result += ''
    else if tail instanceof Cons
      result += ','
      result += tail.flatString()
    else result += tail.toString()
    result

  toString: () -> "cons(#{@head}, #{@tail})"

# cons, like pair in lisp
exports.cons = (x, y) -> new Cons(x, y)

# conslist, like list in lisp
exports.conslist = (args...) ->
  result = null
  for i in [args.length-1..0] by -1
    result = new Cons([args[i], result])
  result

# make unifiable array or unifiable object
exports.unifiable = (x) ->
  if _.isArray(x) then new UArray(x)
  else if _.isObject(x) then new UObject(x)
  else x