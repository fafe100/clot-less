---
title: Fluidics
kicker: Subsystem 02
summary: >-
  Two independent fluid paths — one carrying tenecteplase, one carrying saline —
  feeding eight clot-laden microchannels through individually addressable pinch
  valves.
hero: ../../assets/design/cad-side-a.png
heroAlt: >-
  CAD render of the payload from the opposite side, showing the HDPE plate
  holding the ibidi microchannels at the left edge, the central controller
  module, and the camera and macro lens assembly aimed at the channels.
order: 2
specs:
  - label: Pumps
    value: 2 × Kamoer M1-STP peristaltic
    note: Drug line and control line, independently driven
  - label: Channels
    value: 8 × ibidi µ-Slide I 0.4 Luer
    note: Collagen-coated; 4 drug, 4 saline control
  - label: Valves
    value: 8 × SMC LPV22-5K-T4A
    note: Normally-open solenoid pinch valves
  - label: Reservoirs
    value: 2 × 100 mL IV bag, 1 × 250 mL waste
    note: Tenecteplase in normal saline; saline control
  - label: Flow setpoints
    value: 2.5 and 5.0 mL/min
    note: Stability within ±5%
  - label: Backflow protection
    value: 8 × one-way check valve
    note: Plus Y-site connectors merging to waste
---

The fluid path runs: **IV bag → pump → sensor tap A → four-way Luer splitter → pinch
valve → ibidi µ-Slide → check valve → sensor tap B → four-way splitter → waste bag.**

The two sensor taps are the measurement. One sits upstream of the channel, one
downstream; the difference between them is the pressure drop across the clot, and
watching that difference collapse is watching the clot dissolve.

Valve choice carries a safety argument. The pinch valves are **normally open**, which
means that when they lose power the tubes spring open rather than clamping shut. With
the pumps also stopped, there is no driving pressure anywhere in the system and the
fluid simply goes still. The failure mode is nothing happening — which, on an
aircraft, is the correct one.

Clots are formed in place: porcine blood is loaded into each channel and recalcified
with calcium chloride so it clots against the collagen-coated wall, the same morning
as the flight.
