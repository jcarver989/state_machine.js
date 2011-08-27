# @import ../../lib/state_machine/state_machine.coffee 

describe("StateMachine", ->
  bus = undefined
  state_machine = undefined
  transition_func = undefined
  counter = undefined

  beforeEach( ->
    bus = new EventBus()
    state_machine = new StateMachine("open", bus)
    counter = 0
    transition_func = -> counter += 1
  )

  it("should start in initial state", ->
    expect(state_machine.get_state()).toEqual("open")
  )

  it("should update previous state", ->
    state_machine.transition_to("closed")
    state_machine.transition_to("open")
    expect(state_machine.get_previous_state()).toEqual("closed")
  )

  it("should call enter transitions", ->
    state_machine.set_enter_transition("closed", transition_func) 
    state_machine.transition_to("closed")
    expect(counter).toEqual(1)
    expect(state_machine.get_state()).toEqual("closed")
  )

  it("should not call enter when state transition is identical", ->
    state_machine.set_enter_transition("open", transition_func)
    state_machine.set_exit_transition("open", transition_func)
    state_machine.transition_to("open")
    expect(counter).toEqual(0)
  )

  it("should call exit transitions", ->
    state_machine.set_exit_transition("open", transition_func)
    state_machine.transition_to("closed")
    expect(counter).toEqual(1)
  )

  it("should call both transitions", ->
    state_machine.set_enter_transition("closed", transition_func)
    state_machine.set_exit_transition("open", transition_func)
    state_machine.transition_to("closed")
    expect(counter).toEqual(2)
  )

  it("should transition from event bus ", ->
    state_machine.set_trigger("foo", "closed")
    state_machine.set_enter_transition("closed", transition_func)
    bus.fire_event("foo")
    expect(counter).toEqual(1)
  )

  it("should not transition from an event that is not a trigger", ->
    state_machine.set_enter_transition("closed", transition_func)
    state_machine.set_trigger("foo", "closed")
    bus.fire_event("boo")
    expect(counter).toEqual(0)
  )

  it("should transition with a conditonal function", ->
    state_machine.set_enter_transition("closed", transition_func)
    state_machine.set_trigger("foo", "closed", -> return true)
    bus.fire_event("foo")
    expect(counter).toEqual(1)
  )

  it("should not transition from a conditional function that returns false", ->
    state_machine.set_enter_transition("closed", transition_func)
    state_machine.set_trigger("foo", "closed", -> return false)
    bus.fire_event("foo")
    expect(counter).toEqual(0)
  )
)



