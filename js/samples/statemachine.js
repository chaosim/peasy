var exports, module, require, _ref;

if (typeof window === 'object') {
  _ref = twoside('/samples/statemachine'), require = _ref.require, exports = _ref.exports, module = _ref.module;
}

(function(require, exports, module) {
  var StateMachine, hasOwnProperty;
  hasOwnProperty = Object.hasOwnProperty;
  return exports.StateMachine = StateMachine = (function() {
    function StateMachine(items) {
      var item, _i, _len;
      if (items == null) {
        items = [];
      }
      this.index = 1;
      this.stateMap = {};
      this.stateMap[0] = {};
      this.tagMap = {};
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        this.add(item[0], item[1] || item[0]);
      }
    }

    StateMachine.prototype.add = function(word, tag) {
      var c, i, length, newState, s, state, stateMap;
      if (tag == null) {
        tag = word;
      }
      length = word.length;
      state = 0;
      i = 0;
      stateMap = this.stateMap;
      while (i < length - 1) {
        c = word[i++];
        if (hasOwnProperty.call(stateMap[state], c)) {
          state = stateMap[state][c];
          if (state < 0) {
            state = -state;
          }
        } else {
          newState = this.index++;
          stateMap[state][c] = newState;
          stateMap[newState] = {};
          state = newState;
        }
      }
      c = word[i];
      if (hasOwnProperty.call(stateMap[state], c)) {
        s = stateMap[state][c];
        if (s > 0) {
          stateMap[state][c] = -s;
          return this.tagMap[s] = tag;
        }
      } else {
        newState = this.index++;
        stateMap[state][c] = -newState;
        stateMap[newState] = {};
        return this.tagMap[newState] = tag;
      }
    };

    StateMachine.prototype.match = function(text, i) {
      var cursor, length, state, stateMap, succeedState;
      if (i == null) {
        i = 0;
      }
      state = 0;
      length = text.length;
      stateMap = this.stateMap;
      while (i < length) {
        state = stateMap[state][text[i++]];
        if (state === void 0) {
          i--;
          break;
        } else if (state < 0) {
          state = -state;
          succeedState = state;
          cursor = i;
        }
      }
      if (succeedState) {
        return [this.tagMap[succeedState], cursor];
      } else {
        return [null, i];
      }
    };

    return StateMachine;

  })();
})(require, exports, module);
