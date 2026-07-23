---
number: 3
title: Validate system reliability
summary: >-
  Confirm that the integrated fluidic, sensing and logging system behaves
  consistently across repeated parabolas — because an unreliable instrument
  cannot answer the first two questions.
icon: reliability
order: 3
metrics:
  - label: Parabolas
    value: 12 across two flight days
  - label: Coefficient of variation
    value: ≤5% on control loops
  - label: Data loss
    value: <5% per flight day
  - label: Measurement latency
    value: <0.2 s end to end
---

Each parabola subjects the payload to roughly 2 g on the pull-up, then near-zero g,
then 2 g again on the pull-out. Pumps, valves, sensors and the logging chain all
have to behave identically on the twelfth repetition as on the first.

Reproducibility of the control channels is the test: if signals from the saline
loops drift across parabolas, any difference measured in the drug channels cannot be
attributed to gravity with confidence.
