# Third-party material

## B.C.'s Quest for Tires

- **Johnny Hart** — B.C. comic, characters and original Sierra cover artwork.
- **Rick (Richard) Banks and Michael Bate** — game design.
- **Charles “Chuck” Benton** — Commodore 64 programming.
- **Sydney Development** — original developer.
- **Sierra On-Line** — original publisher, 1983.

Credits cross-checked against [Lemon64](https://www.lemon64.com/game/bcs-quest-for-tires), [C64-Wiki](https://www.c64-wiki.com/wiki/B.C.%27s_Quest_for_Tires) and [Wikipedia](https://en.wikipedia.org/wiki/B.C.%27s_Quest_for_Tires). These credits concern the C64 original and the Sierra cover used as our reference, not the contributors to every later platform port or regional cover.

This is an unofficial fan tribute, not affiliated with or endorsed by the original creators. The hosting account is not the original game's author. The original program, artwork, animations and audio retain their original ownership. This unofficial fan project grants no new rights to those materials.

The gameplay checkpoint in `public/data/start.json` derives from the C64 program preserved in Krisztián Tóth’s C64 archive at https://c64.krissz.hu/quest-for-tires/play-online/ . It starts a normal single-player game; no invulnerability or course modifications are applied. Reference video supplied by the owner: https://www.youtube.com/watch?v=xu2c6-Oa6dY .

`public/data/characters.bin` contains the C64 character font used by the original HUD, sourced from the Viciious character data. It is a third-party legacy font, not part of Viciious's public-domain code dedication. Original ownership remains unchanged.

## Viciious

Hardware runtime from https://github.com/luxocrates/viciious , revision `69f0dc672c1dba46382065f2f4ed1631440f98b0`, reused from the owner's Bruce Lee project.

Upstream places its original emulation code in the public domain. Vendored modules are in `src/vendor/c64`; local changes use explicit `.js` imports. BASIC and KERNAL ROM sources, demos and CPU test programs are not included. The host supplies a minimal IRQ compatibility shim and video/input/audio adapters.

## Three.js

Copyright the Three.js authors; MIT license at `public/THREE-LICENSE.txt`.

## Browser presentation

The browser controls, layout, integration and smoothing shader are new work for this fan project. The contour filter follows the Scale2x neighborhood rule. No project license overrides original game, character or font ownership.

The browser integration, interface, sound refinements and page text were made with AI assistance. The generated splash is inspired by Johnny Hart’s original Sierra cover; it is not a scan or an original illustration by Hart. See [splash provenance](docs/SPLASH_ART.md).
