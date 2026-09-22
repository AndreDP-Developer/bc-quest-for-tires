# Verification — v0.1.0

## Automated

`npm test`: 12 passing tests. Jump arc and edge-trigger behaviour, obstacle jump, duck collision, gap death and checkpoint score restoration, turtle warning/submersion, bird carry/release, required cliff distance, pause/practice state, rescue transition, deterministic replay, and complete nine-chapter runs in Modern and Classic modes.

The full-course controller in `scripts/playthrough.mjs` uses legal controls only: jump, duck and speed adjustment. It starts from a fresh unassisted game and reaches the rescue with tires remaining, including recovery from failed turtle crossings. No invulnerability or state positioning is used in those full-course runs. Focused unit fixtures do position the rider to isolate individual mechanics.

`npm run build`: production build passes. Runtime is bundled locally. npm audit reported zero vulnerabilities at installation.

## Browser inspection

Inspected the title/start flow and gameplay rendering in the Codex in-app Chromium browser. Checked the practice picker and final cave, and a 390 × 844 phone viewport. Fixed a canvas inline-size bug discovered by that phone test. Touch controls now appear directly beneath the game toolbar, and stay available during fullscreen on coarse-pointer devices. No JavaScript errors or warnings were reported in the inspected browser log.

## Limits

- Full-course completion is verified at simulation level, not by a manual unassisted browser playthrough.
- A physical gamepad and phone have not been tested.
- Synthesized sound is implemented and unlocked by user interaction; perceptual sound quality has not been independently audited by ear.
- Reference frames were sampled; C64 frame-by-frame physics/timing equivalence is not claimed.
- Browser checks do not constitute broad cross-browser compatibility certification.
