---
title: Power systems
kicker: Subsystem 03
summary: >-
  Aircraft mains distributed to four dedicated supplies, a 24 V bus for the
  valves and heaters, and a thermal loop holding the fluids at body temperature.
order: 3
specs:
  - label: Input
    value: 115 VAC aircraft supply
    note: Through a hardwired E-stop to a 9-way surge-protected bar
  - label: Pump supply
    value: 115 VAC → 24 VDC
    note: Pump 2 daisy-chained from Pump 1
  - label: Controller supply
    value: 5 V / 3 A USB-C
    note: Official Raspberry Pi PSU
  - label: Valve and heater supply
    value: ALITOVE 24 V 5 A (120 W)
    note: Distributed via two 12-position terminal blocks
  - label: Valve switching
    value: ELEGOO 8-channel relay
    note: 5 V logic, active-low
  - label: Thermal control
    value: 3 × DS18B20 on a 1-Wire bus
    note: PID on the drug bag and tubing; logging on saline
  - label: Peak draw
    value: ~190 W / 1.91 A
    note: Against a 600 W, 5 A limit
---

Power enters at 115 VAC through the emergency stop and a nine-way surge-protected
bar, then splits to four dedicated supplies: the pump adapter, the Raspberry Pi PSU,
the camera supply, and a 24 V rail for the valves and heaters. The 24 V rail is
distributed through paired terminal blocks forming a positive and a negative bus.

A separate thermal loop keeps the tenecteplase and saline at **37 °C**. Three
waterproof temperature probes share a 1-Wire bus — one in the drug IV bag under PID
control, one in the saline bag for logging, one on the drug tubing under PID control
— with MOSFET switch modules driving the heater pads under PWM from the Pi.

The reason is straightforward: thrombolysis is an enzymatic process, and enzyme
kinetics are temperature-dependent. Running the fluids at body temperature keeps the
measured lysis rates physiologically meaningful, and holding that temperature
constant means gravity stays the only variable in play.
