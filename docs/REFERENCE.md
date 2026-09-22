# Reference inspection and implementation decisions

User reference: [BC's QUEST FOR TIRES (C64 - FULL GAME), Zeusdaz](https://www.youtube.com/watch?v=xu2c6-Oa6dY), 4:43. The video plays in the in-app browser; the text-only web fetch failed. Selected paused frames were visually inspected. The table is an observation record, not a frame-exact reconstruction.

| Video position | Observed |
| --- | --- |
| 0:27 | Plains, rocks, Thor's unicycle; wheels, speed and score HUD |
| 0:47 | Forest ceiling and ground logs |
| 1:07 | Low tree obstacle in the forest |
| 1:24 | Turtle river, woman with club on far bank, jump prompt |
| 1:27 | Thor at the far river bank near the club wielder |
| 1:47 and 2:07 | Rising grassy terrain with rocks |
| 2:21 and 2:27 | Bird above Thor; holes and rescue prompt |
| 2:47 and 3:07 | Descending terrain and broken ground |
| 3:18 | Ground boulders |
| 3:27 | Crash reaction with stars |
| 3:47 | Open ground and rescue prompt |
| 4:07, 4:17, 4:27 | Cave with hanging stalactites |

Other references:

- [Original instruction transcription](https://www.lemon64.com/doc/bcs-quest-for-tires/5): jump, duck, horizontal position and separate speed adjustment; turtles and bird-assisted crossing.
- [C64 Wiki overview](https://www.c64-wiki.com/wiki/BC%27s_Quest_for_Tires): encounters and scoring description. Some overview ordering differs from the instruction transcription.
- [B.C. at Creators Syndicate](https://www.creators.com/features/bc): comic provenance. A direct strip page was attempted but timed out during this session; no strip image is bundled.

## Runtime decision

The earlier local Bruce Lee and China Miner remakes have game-specific recovered routines. Those are not a reusable B.C. game-state implementation, and no B.C. executable or disassembly was available in the new project. This release therefore uses a separate deterministic simulation, making replacement characters and semantic obstacle states straightforward. It must be described as a new interpretation, not preservation of original gameplay code.

## Newly designed quantities

All world positions, widths, jump/gravity constants, encounter spacing, turtle phases, bird pickup windows and checkpoint rules in `src/course.js` and `src/game.js` are new design values. They have not been measured from the original's instruction cycles. The 120 Hz timestep makes replay deterministic, not C64 cycle-exact.

The nine named chapters are a new presentation of the familiar encounter types. Plains → forest → first turtles → ridge → bird/lava → cliff → volcanic boulders → dinosaur/turtles → cave/rescue. Stage boundaries, obstacle counts and overall duration are redesigned. Terrain currently stays flat for physics; the original slopes remain a fidelity gap.
