# B.C.'s Quest for Tires · A Stone Age Adventure

A Three.js comic fan remake of the C64 classic. Thor has one stone wheel, five spare tires and a sweetheart to rescue. Ride through nine short chapters of rocks, low branches, unreliable turtles, lava, a helpful bird, a cliff jump, volcanic boulders and a dinosaur cave.

**[Play on GitHub Pages](https://andredp-developer.github.io/bc-quest-for-tires/)**

The artwork is newly drawn with outlined vector paths and layered scenery. Three.js renders the illustrations as textured planes in an orthographic scene. Music, comic effects and rolling ambience are synthesized locally through Web Audio. There are no CDN or remote asset dependencies.

## Play

| Control | Action |
| --- | --- |
| Enter | Start / resume |
| Left / Right or A / D | Change position within the screen |
| Up / W / Space | Jump |
| Down / S | Duck |
| Shift + Left / Right | Adjust travel speed |
| P / Escape | Pause / resume |
| M | Sound on/off |
| F | Fullscreen |
| F2 | Practice chapters |

Touch buttons support movement, speed, duck and jump. Standard gamepads use the left stick or D-pad, A to jump, B to duck, triggers to change speed and Start to pause. Physical phone and controller testing has not been performed.

Gold turtle shells warn of a dive. Jump beneath Dooky Bird before the lava to catch a lift. Reach speed 75+ for the long cliff jump, then jump close to the edge. Duck at the far bank of the turtle crossings. Crashes cost one tire and restart the current chapter with its entry score. Rescue awards a spare tire and offers another, faster adventure.

Modern mode adds a short jump input buffer. Classic mode uses direct inputs; both use this remake's new simulation. Settings include separate effects/music/ambience levels and reduced motion. Switching away pauses the game. Practice selection, invulnerability and slow motion mark a run assisted and disable personal-best saving.

## Develop

Node.js 22 or newer:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Development: http://127.0.0.1:5175/ . Production output: `dist/`. Serve over HTTP, not `file://`. Relative asset URLs support GitHub Pages subdirectories and itch.io embeds.

`src/game.js` is a deterministic 120 Hz simulation independent of rendering. `src/course.js` contains the nine chapters. `src/art.js` contains original drawing instructions, rasterized once into textures. `src/renderer.js` handles Three.js presentation; `src/audio.js` handles Web Audio; `src/main.js` connects input and UI.

The practice API is `window.bcQuest`: `snapshot()`, `selectStage(index)`, `pause()`, `resume()` and `step(count, input)`. Stage indices are zero-based. Stage selection and stepping mark the run assisted.

## Fidelity and limits

This is a new interpretation with measured visual references and newly designed obstacle spacing, not an emulator or a port of recovered C64 routines. No C64 executable, system ROM, original sprites or recorded soundtrack is bundled. The reference video was inspected at selected timestamps for visual structure, not exhaustively measured frame by frame. The course is shorter, terrain is physically flat, and restart/scoring/turtle/bird behaviour is newly implemented. Original speed-dependent slope physics and alternating two-player mode are not implemented. Do not treat Classic mode as cycle-exact C64 behaviour.

See [reference notes](docs/REFERENCE.md) and [verification notes](docs/VERIFICATION.md). Automated tests include full adventures using legal input sequences in both modes. That is a simulation-level playability check, not a manual complete browser playthrough.

## Release

GitHub Actions tests, builds and deploys `main` to Pages. The HTML5 ZIP must contain the **contents** of `dist/`, with `index.html` at the ZIP root. See [itch.io listing text](docs/ITCH_LISTING.md).

## Credits

Original B.C. comic and characters: Johnny Hart and their respective rights holders. Original game: Sydney Development / Sierra On-Line. Three.js: the Three.js authors, MIT license. This is an unofficial fan project with no affiliation or endorsement. See [THIRD_PARTY.md](THIRD_PARTY.md).
