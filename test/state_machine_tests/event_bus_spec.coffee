# @import ../../lib/state_machine/event_bus.coffee 

describe("EventBus", () ->
  bus = undefined

  beforeEach(() -> bus = new EventBus())

  it("should bind an event and have the function trigger", () ->
    counter = 0
    bus.bind_event("foo", () -> counter += 1 )
    bus.fire_event("foo")
    expect(counter).toEqual(1)
  )

  it("should bind and fire multiple events", () ->
    counter = 0
    bus.bind_event("foo", () -> counter += 1)
    bus.bind_event("foo", () -> counter += 4)
    bus.fire_event("foo")
    expect(counter).toEqual(5)
  )

  it("should not fire listeners belonging to other events", () ->
    counter = 0
    bus.bind_event("foo", () -> counter += 1)
    bus.fire_event("boo")
    expect(counter).toEqual(0)
  )
)

