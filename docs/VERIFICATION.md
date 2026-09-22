# Verification — v0.2.0 testing revision

## Automated

`npm test` exercises the original program through its CPU/input/render/audio host:

- Animation and scrolling advance from the normal single-player checkpoint.
- Jump and duck enter the original, distinct pose states and change the rendered frame.
- Fire + right changes the native speed state.
- SID register/envelope output produces finite, non-silent samples with a peak below clipping.
- Pause freezes frame advancement and releases joystick input.
- An unattended game loses its tires, reaches game over and restarts with the native entry speed and riding pose.

`npm run build` creates a fully local HTML5 bundle.

## Browser checks

Local desktop browser: original game field and HUD render; start, keyboard jump input, pause, restart, sound controls and smoothing toggle exercised; no browser errors or warnings observed. Both raw-pixel and smoothed output inspected. A late character-bank switch in the runtime produced a garbled score-heading row; the host now renders the original four HUD rows directly from screen RAM and the original font. Sound defaults to muted.

## Limits

Original program execution is a substantial change from the first prototype. This revision has not yet been played through every crossing and the final rescue. Original gameplay routines are used, but the Viciious runtime and the small IRQ shim are not claimed to be cycle-exact hardware. SID waveform synthesis follows original register/envelope commands, without a full analogue filter model. Physical phone and gamepad testing is pending. Smoothing affects pixel contours, not the original animation cadence.

The previous custom-simulation full-course test does not validate this revision and has been removed. Owner playtesting is required before publication. Itch.io remains Draft; this revision is kept off main/GitHub Pages pending review.

## Crash / re-entry follow-up

Ten automated checks pass, including oscillator hard sync, measured crash-noise attenuation and repeated death/re-entry. The re-entry regression samples the upper, middle and lower field during the original closed-border interval, then checks that the full scenery and riding pose return. Video writes now go to a back buffer and become visible only at the frame-completion callback. Browser gameplay checked with sound off; subjective sound preference remains for owner testing.

VIC DEN behavior checked against Christian Bauer's VIC-II documentation, section on border generation: https://www.zimmers.net/cbmpics/cbm/c64/vic-ii.txt . The host previously treated DEN as an immediate pixel mute. This fix does not claim to implement all VIC timing details.
