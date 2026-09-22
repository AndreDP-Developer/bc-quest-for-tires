# B.C.'s Quest for Tires — remake plan

Status: approved design, 22 September 2026. A playable v0.1.0 implementation now exists. This document preserves the design goals; README.md and docs/VERIFICATION.md describe the delivered behaviour and remaining fidelity gaps.

## Goal

Create a browser-playable Three.js remake of the C64 game, following the Bruce Lee and China Miner projects. Preserve the recognizable adventure and timing challenges while redrawing the presentation as a lively prehistoric comic strip. Publish the source and browser build through GitHub, then package the tested build for itch.io.

## References and fidelity

- User's video: https://www.youtube.com/watch?v=xu2c6-Oa6dY . Accessible in the in-app browser despite the web reader failing. Verified title: BC's QUEST FOR TIRES (C64 - FULL GAME), by Zeusdaz, duration 4:43. Visually inspected the opening plains at 0:27: Thor on the stone wheel, rocks on the green path, distant mountains, and wheels/speed/score HUD. A complete timestamped course breakdown and timing verification remain required.
- Original instructions transcribed at https://www.lemon64.com/doc/bcs-quest-for-tires/5 . These document jumping, ducking, horizontal screen position, separate speed adjustment, turtles, bird assistance and the rescue.
- C64 overview: https://www.c64-wiki.com/wiki/BC%27s_Quest_for_Tires . Useful for obstacle types, scoring and crossings. Its summary and the instructions describe some encounters in different orders; settle the sequence against C64 footage before implementing the full course.
- Comic reference: https://www.creators.com/features/bc . Consult actual strips for character silhouettes, facial expressions and economical staging. Newly draw game assets; keep a provenance/credits inventory.
- Local precedents: ../Bruce Lee and ../China Miner. Both use Three.js, Vite, local assets, tests and GitHub Pages. Both preserve original gameplay routines, so fidelity must be assessed explicitly rather than assumed from visual resemblance.

Research deliverable: a course table listing each section, entry/exit conditions, hazard positions, speed, jump duration, turtle cycles, bird windows, failures, checkpoints and scoring. Record which measurements are observed and which are inferred.

## Visual direction

Use a fixed side-on orthographic camera and 2.5D composition. Three.js provides depth, parallax, lighting and effects while silhouettes remain readable like a comic strip. Avoid perspective changes that obscure landing positions.

Thor and his stone unicycle are the visual focus: large expressive face, loose hair, animal-skin clothing, wobbling wheel, pumping legs and exaggerated crash reactions. Build distinct ride, jump, duck, fall, bird-grab and celebration poses. Match visible feet/wheel contact to collision bounds.

Use strong dark outlines, simple shaded colour areas, warm stone and sand, soft greens, turquoise water and controlled volcanic orange. Keep the active path visually clear. Backgrounds may include sleepy dinosaurs, suspicious birds, crooked palms, stone signposts, distant volcanoes and small silent visual jokes. Decorative movement must not resemble an incoming hazard.

Proposed environments: sunny plains, tangled prehistoric forest, turtle river, volcanic country, cliff approach and dinosaur cave. These are art groupings; the verified original sequence determines gameplay order.

UI: a compact comic-style score/speed/spare-tire display, clear pause/settings screens and brief illustrated controls. Comic exclamations such as BONK and SPLASH are optional effects, with reduced-motion support.

## Gameplay

Preserve a finite rescue adventure, with rocks, holes, logs, low branches, turtle crossings, bird-assisted lava travel, a speed-dependent gap, falling rocks and cave hazards as supported by reference research. Include the original ending and investigate the subsequent harder loop.

Retain horizontal position and travel speed as separate controls. Proposed keyboard: arrows/A-D move within the screen; Up/W/Space jumps; Down/S ducks; Shift plus Left/Right adjusts travel speed; Enter starts; Escape/P pauses; M mutes; F requests fullscreen. Touch and gamepad controls should expose the same actions without ambiguous combinations.

Provide a faithful rules mode and, if needed after playtesting, a separately labelled modern mode with small input buffering and gentler restarts. Do not silently change jump arcs or collision margins in faithful mode. First verify the original lives, respawn and scoring rules.

Provide a practice selector, slow motion, hitbox overlay and state snapshot for testing. Assisted sessions must not update normal high scores.

## Implementation

Use a separate project and repository, proposed slug `bc-quest-for-tires`. Reuse the proven Vite/static-hosting pattern, with local Three.js dependencies and relative asset URLs. Proposed development port: 5175, subject to availability.

First investigate whether original gameplay routines can drive semantic game state while permitting replacement art. If viable, isolate that runtime behind a renderer-independent interface. Otherwise implement a deterministic fixed-step simulation using measured reference behaviour, documenting the differences. A clean-room approximation must not be called cycle-exact or fully faithful without evidence.

Keep simulation, course data, input, rendering and audio separate. Render interpolation must not change physics. Pause on focus loss and clear held input. Scale the viewport without altering distances or jump timing. Include a useful WebGL-unavailable message.

## Audio

Create new comic effects: rolling stone chatter, springy jumps, duck swishes, hollow impacts, turtle splashes, bird squawks, bubbling lava and a short rescue flourish. Consider a light original percussion/woodwind music loop once the action effects work. Keep music, effects and ambience independently adjustable. Start browser audio only after user interaction; pause it with the game. Do not use audio extracted from the reference video.

## Delivery milestones

1. Reference specification and art test: inspect the supplied video, resolve course order and timings, and produce one representative scene with Thor, a hazard and layered scenery.
2. Playable opening section: ride, speed adjustment, jump, duck, rock/log/branch collisions, spare tires, restart, pause and new sound effects. Review readability and feel before producing the full asset set.
3. Complete adventure: implement the verified sequence, turtles, bird/lava interaction, cliff jump, volcanic hazards, dinosaur and rescue ending. Add practice tools and touch/gamepad support.
4. Polish and verification: refine character animation, comic backgrounds, sound mix, transitions, accessibility settings and performance.
5. GitHub release: README, controls, credits/asset provenance, reproducible install, CI tests/build, GitHub Pages deployment and a tagged release.
6. itch.io release: ZIP the contents of the production output with index.html at its root. Prepare cover, screenshots, game description and controls. Test the actual embedded upload, fullscreen, audio unlock, keyboard focus and touch layout before final publication.

## Verification gates

- Deterministic simulation tests for jump/duck collisions, turtle support loss, bird pickup and release, gap clearance, scoring, life loss and ending transitions.
- Gameplay comparison at measured speeds and landmarks; document any remaining differences.
- Complete an unassisted run through every encounter. Practice-mode checks alone do not establish that the game is completable.
- Browser smoke tests for start, input, pause, focus loss, restart, audio and resizing; check console errors and failed asset loads.
- Test desktop and phone layouts and the actual GitHub Pages subdirectory and itch.io iframe. Record which devices and controllers were physically tested.
- Confirm that the production ZIP uses local assets and does not rely on files outside the build.

## Current state

Nine chapters, original vector illustrations, Three.js presentation, synthesized audio, keyboard/touch/gamepad input and practice tools are implemented. Twelve tests pass, including complete simulation-level adventures in both play styles. Desktop and phone viewport checks have been performed. The implementation uses new course spacing and physics rather than recovered C64 routines; exact timings, physical slopes, alternating two-player support and full manual playthrough remain outside this first release. See docs/REFERENCE.md for observed reference frames and docs/VERIFICATION.md for testing limits.
