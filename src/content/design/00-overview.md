---
title: System overview
kicker: The payload
summary: >-
  A closed-loop microfluidic system that perfuses tenecteplase through
  clot-laden microchannels and measures the resulting pressure change in real
  time — the whole thing packed into a single flight case.
hero: ../../assets/design/cad-side-b.png
heroAlt: >-
  CAD render of the CLOT-LESS payload in side view, showing the two peristaltic
  pumps mounted centrally on the aluminium baseplate, the IP65 enclosure housing
  the IV bags above them, and the HDPE plate carrying the microchannels and
  pinch valves at the right-hand edge.
order: 0
stats:
  - value: 13.3 kg
    label: Total mass
    detail: 45 kg limit — 70.5% margin
  - value: 190 W
    label: Peak science power
    detail: 1.91 A of a 5 A supply
  - value: 8
    label: Microfluidic channels
    detail: 4 drug, 4 saline control
  - value: 50 Hz
    label: Pressure sampling
    detail: Minimum acquisition rate
---

Everything lives inside a Pelican 0350 case. A Raspberry Pi 5 runs the experiment;
the operator drives it over VNC from a laptop mounted on the case lid. Once the
fluid is primed and the clots are formed, a full parabola takes **two button
presses**.

That minimalism is deliberate. The usable science window is about twenty seconds
long, the operator is floating, and anything that demands attention during those
twenty seconds is a chance to lose the run. So the Pi automates all valve
sequencing, pump control and logging, and the human commits to one decision:
*start now*, *stop now*.

The payload divides into five subsystems — structure, fluidics, power, command and
data handling, and imaging — described in turn below.
