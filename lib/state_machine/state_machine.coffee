class StateMachine
  constructor: (initial_state, event_bus) ->
    @ENTER = 0
    @EXIT  = 1
    @current_state  = initial_state
    @previous_state = initial_state
    @enter_bindings = {}
    @exit_bindings  = {}
    @event_bus = event_bus

  initialize: () -> @transition(initial_state)

  get_state: () -> @current_state
  get_previous_state: () -> @previous_state

  set_enter_transition: (state_name, func) -> @enter_bindings[state_name] = func
  set_exit_transition:  (state_name, func) -> @exit_bindings[state_name]  = func

  set_trigger: (event_name, state_name, conditional_func) ->
    me = this

    if (conditional_func)
      @event_bus.bind_event(event_name, -> 
        me.transition(state_name, arguments) if conditional_func())

    else if !conditional_func?
      @event_bus.bind_event(event_name, -> 
        me.transition(state_name, arguments))

  transition_to: (state_name) -> @transition(state_name)

  transition: (state_name, args) ->
    return if (state_name == @current_state)
    @execute_transition(@EXIT, @current_state, args)
    @execute_transition(@ENTER, state_name, args)
    @previous_state = @current_state
    @current_state  = state_name

  execute_transition:  (type, state_name, args) ->
    bindings = if (type == @ENTER) then @enter_bindings else @exit_bindings
    func = bindings[state_name]
    func.apply(func, args) if func?

exports.StateMachine = StateMachine
