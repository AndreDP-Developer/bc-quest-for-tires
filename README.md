# B.C.'s Quest for Tires

A faithful C64 presentation in Three.js. This revision replaces the first prototype's invented artwork, course simulation and background tune with the original game program, sprites, scenery, animations and sound commands.

**Testing build — itch.io must remain Draft until the owner approves publication after testing.** The public main branch still contains the previous prototype; this revision is on `codex/original-c64-presentation`.

## Play locally

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5175/ . Enter starts or resumes; Restart / F1 starts over. Losing all tires offers a fresh game.

| Control | Action |
| --- | --- |
| Left / Right or A / D | Move Thor within the screen |
| Up / W / Space | Jump |
| Down / S | Duck |
| Shift + Left / Right | Change scrolling speed |
| P / Escape | Pause / resume |
| M | Toggle sound |
| F | Fullscreen |

Touch controls appear on coarse-pointer devices. Standard gamepad: left stick or D-pad to move, A to jump, B to duck, shoulder button plus left/right to change speed, Start to pause. Physical controller and phone testing is pending.

Gentle pixel smoothing uses a Scale2x-style contour filter. Switch it off for raw pixels. It does not change poses, frame timing, collisions or gameplay. The original animation runs at 50 updates per second. Sound starts muted and can be enabled with Sound on. Sound follows the original SID register/envelope stream; there is no replacement music or ambience loop.

## Implementation

- Original single-player C64 gameplay checkpoint, CPU/VIC/CIA/SID runtime adapted from the Bruce Lee project.
- Three.js renders the native 320 × 200 frame at a 4:3 display aspect ratio.
- Minimal IRQ/keyboard compatibility shim replaces BASIC/KERNAL; the C64 character font is included for the original HUD.
- Local assets only; no CDN or remote runtime dependency.
- Web Audio synthesis follows the game's original sound commands. This is not a claim of cycle-exact C64 hardware or analogue SID filter emulation.

The previous custom chapter selector and Modern/Classic physics modes have been removed with the custom simulation. This version starts the original single-player game instead.

## Validate and build

```sh
npm test
npm run build
```

See [verification](docs/VERIFICATION.md) and [credits](THIRD_PARTY.md). `dist/` is the browser build. Zip its contents with `index.html` at the archive root for a future itch.io upload; do not publish without approval.
