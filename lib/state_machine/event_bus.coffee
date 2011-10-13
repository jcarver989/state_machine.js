#Simple object to bind an event name to a function
class EventBus
  constructor: () ->
    @bindings = {}

  bind_event: (name, func) ->
    @bindings[name] = [] unless @bindings[name]?
    @bindings[name].push(func)

  fire_event: (name, args = []) ->
    funcs = @bindings[name]
    return unless funcs?
    func.apply(func, args) for func in funcs

exports.EventBus = EventBus
