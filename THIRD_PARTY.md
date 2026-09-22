# Third-party material

## B.C.'s Quest for Tires

Original game: Sydney Development / Sierra On-Line, 1983. Original comic and characters: Johnny Hart. The original program, artwork, animations and audio retain their original ownership. This unofficial fan project grants no new rights to those materials.

The gameplay checkpoint in `public/data/start.json` derives from the C64 program available at https://c64.krissz.hu/quest-for-tires/play-online/ . It starts a normal single-player game; no invulnerability or course modifications are applied. Reference video supplied by the owner: https://www.youtube.com/watch?v=xu2c6-Oa6dY .

`public/data/characters.bin` contains the C64 character font used by the original HUD, sourced from the Viciious character data. It is a third-party legacy font, not part of Viciious's public-domain code dedication. Original ownership remains unchanged.

## Viciious

Hardware runtime from https://github.com/luxocrates/viciious , revision `69f0dc672c1dba46382065f2f4ed1631440f98b0`, reused from the owner's Bruce Lee project.

Upstream places its original emulation code in the public domain. Vendored modules are in `src/vendor/c64`; local changes use explicit `.js` imports. BASIC and KERNAL ROM sources, demos and CPU test programs are not included. The host supplies a minimal IRQ compatibility shim and video/input/audio adapters.

## Three.js

Copyright the Three.js authors; MIT license at `public/THREE-LICENSE.txt`.

## Browser presentation

The browser controls, layout, integration and smoothing shader are new work for this fan project. The contour filter follows the Scale2x neighborhood rule. No project license overrides original game, character or font ownership.
