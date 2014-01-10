if typeof window=='object' then {require, exports, module} = twoside('/samples/statemachine')
do (require=require, exports=exports, module=module) ->

  hasOwnProperty = Object.hasOwnProperty

  exports.StateMachine =  class StateMachine
    constructor: (items=[]) ->
      @index = 1
      @stateMap = {}
      @stateMap[0] = {}
      @tagMap = {}
      for item in items then @add(item[0], item[1] or item[0])

    add: (word, tag=word) ->
      length = word.length
      state = 0
      i = 0
      stateMap = @stateMap
      while i<length-1
        c = word[i++]
        if hasOwnProperty.call(stateMap[state], c)
          state = stateMap[state][c]
          if state < 0 then state = -state
        else
          newState = @index++
          stateMap[state][c] = newState
          stateMap[newState] = {}
          state = newState
      c = word[i]
      if hasOwnProperty.call(stateMap[state], c)
        s = stateMap[state][c]
        if s>0
          stateMap[state][c] = -s
          @tagMap[s] = tag
      else
        newState = @index++
        stateMap[state][c] = -newState
        stateMap[newState] = {}
        @tagMap[newState] = tag

    match: (text, i=0) ->
      state = 0
      length = text.length
      stateMap = @stateMap
      while i<length
        state = stateMap[state][text[i++]]
        if state is undefined then i--; break
        else if state<0 then state = -state; succeedState = state; cursor = i
      if succeedState then return [@tagMap[succeedState], cursor]
      else return [null, i]