# v0.2.0 testing revision

Replaces the first prototype's vector character designs and custom physics with the original C64 program and animations. Keeps the original palette, scenery, HUD, character proportions and sound sequences. Adds optional gentle pixel-contour smoothing, a simpler game-first layout, pause/restart, volume, fullscreen and browser input mappings.

No added music. No itch.io publication. Owner playtesting is required before publishing this revision.

## v0.2.1 — crash and re-entry corrections

- Implemented SID oscillator hard sync (used by the crash sound), triangle ring modulation and 4× waveform oversampling.
- Added a gradual crash-only reduction in level and high-frequency noise; original sound commands and pitch sequence remain in use.
- Fixed VIC display-enable handling: DEN gates opening the vertical border instead of instantly blanking individual pixel spans. Death/re-entry now clears and restores a whole field rather than showing a black sky over a visible lower scene.
- Publish completed video frames through a back buffer to avoid showing half-updated poses.
- Muted browser verification. Regression tests cover hard sync, crash noise attenuation, whole-field re-entry and restart. No itch.io publication.
