# v0.2.0 testing revision

Replaces the first prototype's vector character designs and custom physics with the original C64 program and animations. Keeps the original palette, scenery, HUD, character proportions and sound sequences. Adds optional gentle pixel-contour smoothing, a simpler game-first layout, pause/restart, volume, fullscreen and browser input mappings.

No added music. No itch.io publication. Owner playtesting is required before publishing this revision.

## v0.2.1 — crash and re-entry corrections

- Implemented SID oscillator hard sync (used by the crash sound), triangle ring modulation and 4× waveform oversampling.
- Added a gradual crash-only reduction in level and high-frequency noise; original sound commands and pitch sequence remain in use.
- Fixed VIC display-enable handling: DEN gates opening the vertical border instead of instantly blanking individual pixel spans. Death/re-entry now clears and restores a whole field rather than showing a black sky over a visible lower scene.
- Publish completed video frames through a back buffer to avoid showing half-updated poses.
- Muted browser verification. Regression tests cover hard sync, crash noise attenuation, whole-field re-entry and restart. No itch.io publication.

## Publication

Owner approved v0.2.1 after testing on 22 September 2026. Uploaded the tested ZIP to itch.io, selected it as the browser build, updated description/cover/screenshot, set visibility Public, and verified it loads muted. https://fabrulana.itch.io/bc-quest-for-tires

## v0.2.2 � welcome screen and sound default

Added a comic-cover splash screen with the original animated Thor sprite, Play and sound controls. Sound is enabled by default and starts on Play. Explicit new mute choices are remembered; the old automatic mute preference is migrated. No sound plays on page load.

## v0.2.3 - cover splash and woodland pixel fix

Replaced the first splash with a landscape illustration based on the original box cover. The girl calls HELP from the dinosaur's cave; Thor approaches from the opposite cliff. Sound remains enabled by default after Play.

Fixed the woodland flash: a mid-scanline fine-scroll change could exhaust the eight-pixel background queue, producing undefined RGB values rendered black. Empty dots now use the background colour. No changes to original gameplay, collision code or timing. A 1,000-frame woodland regression and the existing audio, animation, re-entry and restart checks pass (11 tests).

The regression bypasses obstacle collisions only in its isolated test run to reach the woodland. This bypass is not part of the game build.

Published v0.2.3 to itch.io on 23 September 2026 and verified the public splash, sound-on default and version description. Production build and all 11 tests passed; browser verification was muted.
