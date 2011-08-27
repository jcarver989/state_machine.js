    var global = (global != undefined)? global : window

if (global.module == undefined) {
  global.module = function(name, body) {
    var exports = global[name]
    if (exports == undefined) {
    global[name] = exports = {}
    }
    body(exports)
  }
}


    module('State_machine', function(exports) {
      var EventBus, StateMachine;
StateMachine = (function() {
  function StateMachine(initial_state, event_bus) {
    this.ENTER = 0;
    this.EXIT = 1;
    this.current_state = initial_state;
    this.previous_state = initial_state;
    this.enter_bindings = {};
    this.exit_bindings = {};
    this.event_bus = event_bus;
  }
  StateMachine.prototype.initialize = function() {
    return this.transition(initial_state);
  };
  StateMachine.prototype.get_state = function() {
    return this.current_state;
  };
  StateMachine.prototype.get_previous_state = function() {
    return this.previous_state;
  };
  StateMachine.prototype.set_enter_transition = function(state_name, func) {
    return this.enter_bindings[state_name] = func;
  };
  StateMachine.prototype.set_exit_transition = function(state_name, func) {
    return this.exit_bindings[state_name] = func;
  };
  StateMachine.prototype.set_trigger = function(event_name, state_name, conditional_func) {
    var me;
    me = this;
    if (conditional_func) {
      return this.event_bus.bind_event(event_name, function() {
        if (conditional_func()) {
          return me.transition(state_name, arguments);
        }
      });
    } else if (!(conditional_func != null)) {
      return this.event_bus.bind_event(event_name, function() {
        return me.transition(state_name, arguments);
      });
    }
  };
  StateMachine.prototype.transition_to = function(state_name) {
    return this.transition(state_name);
  };
  StateMachine.prototype.transition = function(state_name, args) {
    if (state_name === this.current_state) {
      return;
    }
    this.execute_transition(this.EXIT, this.current_state, args);
    this.execute_transition(this.ENTER, state_name, args);
    this.previous_state = this.current_state;
    return this.current_state = state_name;
  };
  StateMachine.prototype.execute_transition = function(type, state_name, args) {
    var bindings, func;
    bindings = type === this.ENTER ? this.enter_bindings : this.exit_bindings;
    func = bindings[state_name];
    if (func != null) {
      return func.apply(func, args);
    }
  };
  return StateMachine;
})();
exports.StateMachine = StateMachine;
EventBus = (function() {
  function EventBus() {
    this.bindings = {};
  }
  EventBus.prototype.bind_event = function(name, func) {
    if (this.bindings[name] == null) {
      this.bindings[name] = [];
    }
    return this.bindings[name].push(func);
  };
  EventBus.prototype.fire_event = function(name, args) {
    var func, funcs, _i, _len, _results;
    funcs = this.bindings[name];
    if (funcs == null) {
      return;
    }
    _results = [];
    for (_i = 0, _len = funcs.length; _i < _len; _i++) {
      func = funcs[_i];
      _results.push(func.apply(func, args));
    }
    return _results;
  };
  return EventBus;
})();
exports.EventBus = EventBus;
    })
