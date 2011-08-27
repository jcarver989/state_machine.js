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


    module('State_machine_tests', function(exports) {
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
describe("StateMachine", function() {
  var bus, counter, state_machine, transition_func;
  bus = void 0;
  state_machine = void 0;
  transition_func = void 0;
  counter = void 0;
  beforeEach(function() {
    bus = new EventBus();
    state_machine = new StateMachine("open", bus);
    counter = 0;
    return transition_func = function() {
      return counter += 1;
    };
  });
  it("should start in initial state", function() {
    return expect(state_machine.get_state()).toEqual("open");
  });
  it("should update previous state", function() {
    state_machine.transition_to("closed");
    state_machine.transition_to("open");
    return expect(state_machine.get_previous_state()).toEqual("closed");
  });
  it("should call enter transitions", function() {
    state_machine.set_enter_transition("closed", transition_func);
    state_machine.transition_to("closed");
    expect(counter).toEqual(1);
    return expect(state_machine.get_state()).toEqual("closed");
  });
  it("should not call enter when state transition is identical", function() {
    state_machine.set_enter_transition("open", transition_func);
    state_machine.set_exit_transition("open", transition_func);
    state_machine.transition_to("open");
    return expect(counter).toEqual(0);
  });
  it("should call exit transitions", function() {
    state_machine.set_exit_transition("open", transition_func);
    state_machine.transition_to("closed");
    return expect(counter).toEqual(1);
  });
  it("should call both transitions", function() {
    state_machine.set_enter_transition("closed", transition_func);
    state_machine.set_exit_transition("open", transition_func);
    state_machine.transition_to("closed");
    return expect(counter).toEqual(2);
  });
  it("should transition from event bus ", function() {
    state_machine.set_trigger("foo", "closed");
    state_machine.set_enter_transition("closed", transition_func);
    bus.fire_event("foo");
    return expect(counter).toEqual(1);
  });
  it("should not transition from an event that is not a trigger", function() {
    state_machine.set_enter_transition("closed", transition_func);
    state_machine.set_trigger("foo", "closed");
    bus.fire_event("boo");
    return expect(counter).toEqual(0);
  });
  it("should transition with a conditonal function", function() {
    state_machine.set_enter_transition("closed", transition_func);
    state_machine.set_trigger("foo", "closed", function() {
      return true;
    });
    bus.fire_event("foo");
    return expect(counter).toEqual(1);
  });
  return it("should not transition from a conditional function that returns false", function() {
    state_machine.set_enter_transition("closed", transition_func);
    state_machine.set_trigger("foo", "closed", function() {
      return false;
    });
    bus.fire_event("foo");
    return expect(counter).toEqual(0);
  });
});
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
describe("EventBus", function() {
  var bus;
  bus = void 0;
  beforeEach(function() {
    return bus = new EventBus();
  });
  it("should bind an event and have the function trigger", function() {
    var counter;
    counter = 0;
    bus.bind_event("foo", function() {
      return counter += 1;
    });
    bus.fire_event("foo");
    return expect(counter).toEqual(1);
  });
  it("should bind and fire multiple events", function() {
    var counter;
    counter = 0;
    bus.bind_event("foo", function() {
      return counter += 1;
    });
    bus.bind_event("foo", function() {
      return counter += 4;
    });
    bus.fire_event("foo");
    return expect(counter).toEqual(5);
  });
  return it("should not fire listeners belonging to other events", function() {
    var counter;
    counter = 0;
    bus.bind_event("foo", function() {
      return counter += 1;
    });
    bus.fire_event("boo");
    return expect(counter).toEqual(0);
  });
});
    })
