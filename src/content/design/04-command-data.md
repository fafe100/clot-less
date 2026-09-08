---
title: Command and data handling
kicker: Subsystem 04
summary: >-
  A Raspberry Pi 5 sequencing every valve and pump, reading both pressure
  sensors over I²C, and timestamping the result — with the operator reduced to
  two buttons.
hero: ../../assets/design/pressure-sensors-annotated.png
heroAlt: Annotated photograph identifying Honeywell ABP2 differential pressure sensors and microbore IV tubing.
order: 4
specs:
  - label: Controller
    value: Raspberry Pi 5
    note: Operator interface over VNC on Ethernet
  - label: Pressure sensors
    value: 2 × Honeywell ABP2DRRT100MD2A3XX
    note: Differential, I²C, 14-bit
  - label: Sensor range
    value: ±100 mbar (±1.45 psi)
    note: Total error band ≤ ±2% FSS
  - label: Sampling
    value: ≥50 Hz continuous
    note: End-to-end latency under 0.2 s
  - label: Valve control
    value: 8 × GPIO → relay module
    note: Active-low; LOW energises and pinches the tube closed
  - label: Pump control
    value: 2 × GPIO → dedicated relays
    note: Dry-contact closure into each pump's foot-switch input
---

The Pi drives eight GPIO lines into the relay module, one per pinch valve, plus two
more into dedicated pump relays that close a dry contact across each pump's
foot-switch input — a deliberately dumb, hard-to-misfire interface.

Both differential pressure sensors sit on the I²C bus and are sampled continuously at
50 Hz or better. Every reading is timestamped and logged locally.

**During a parabola:** about two seconds before microgravity onset the operator
presses Button A. That single command opens the pinch valve for the assigned channel
and starts the corresponding pump at its setpoint. Fluid flows through the clot for
the whole microgravity window and into the pull-out; a second press stops the pump
and re-energises the valve, isolating the channel. Parabolas 1–6 run on Button A;
7–12 run on Button B against the second set of channels.

If something goes wrong there is a three-level response — reset the affected
component in software, skip the channel for the rest of the flight, or pause all
triggering and hold until the next level-flight period to diagnose.
