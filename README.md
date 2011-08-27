State Machine.js
===============
A finite state machine implementation for Javascript


    function Widget() {
        var bus = new State_machine.EventBus()
        var state_machine = new State_machine.StateMachine("disabled", bus)

        state_machine.set_enter_transition("enabled", function() { 
          turn_on()
        })

        state_machine.set_enter_transition("disabled", function() {
          turn_off()
        })

        state_machine.set_enter_transition("blocked", function() {
          block()
        })

        state_machine.set_exit_transition("blocked",function() {
          unblock()
        })

        
        state_machine.set_trigger("water-is-off", "disabled")
        state_machine.set_trigger("pumping-water", "blocked")
        state_machine.set_trigger("done-pumping-water", "enabled", function() {
          return this.is_ready ? true : false
        })
    }
