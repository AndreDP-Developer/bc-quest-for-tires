import { createMachine } from './machine.js';
export const WIDTH = 320, HEIGHT = 200, STEP = 1 / 50;
export class Game {
  constructor(initial, { character, audio } = {}) {
    this.initial = initial;
    this.character = character;
    this.pixels = new Uint8Array(WIDTH * HEIGHT * 4);
    this.revision = 0;
    this.machine = createMachine({
      roms: { character }, audio,
      pixel: (x, y, r, g, b) => {
        if (x < 136 || x >= 456 || y < 51 || y >= 251) return;
        const i = ((y - 51) * WIDTH + x - 136) * 4;
        this.pixels[i] = r; this.pixels[i + 1] = g; this.pixels[i + 2] = b; this.pixels[i + 3] = 255;
      },
      blit: () => this.revision++,
    });
    this.reset();
  }
  reset() {
    this.machine.runloop.deserialize(this.initial);
    this.clearInput();
    this.machine.ram.writeRam(0xc6, 0);
    this.machine.ram.writeRam(0xcb, 64);
    this.frames = 0;
    this.state = 'ready';
    this.machine.frame();
    this.drawHud();
  }
  clearInput() { this.machine.joy(0, 1); this.machine.joy(0, 2); }
  start() { if (this.state === 'over') this.reset(); this.state = 'playing'; }
  pause() { if (this.state === 'playing') this.state = 'paused'; this.clearInput(); }
  step(input = {}) {
    if (this.state !== 'playing') return;
    const bits = (input.jump ? 1 : 0) | (input.duck ? 2 : 0) |
      (input.left ? 4 : 0) | (input.right ? 8 : 0) | (input.speed ? 16 : 0);
    this.machine.joy(bits, 2);
    this.machine.frame();
    this.drawHud();
    this.frames++;
    if (this.machine.ram.readRam(0x120f) === 0) this.state = 'over';
  }
  // The legacy VIC host switches character banks a scanline too late here.
  // Draw the four native text rows from screen RAM, using their original font,
  // instead of exposing a garbled raster split above the score panel.
  drawHud() {
    if (!this.character) return;
    this.pixels.copyWithin(167 * WIDTH * 4, 166 * WIDTH * 4, 167 * WIDTH * 4);
    for (let row = 21; row < 25; row++) for (let col = 0; col < 40; col++) {
      const code = this.machine.ram.readRam(0x400 + row * 40 + col);
      for (let y = 0; y < 8; y++) {
        const bits = this.character[code * 8 + y];
        for (let x = 0; x < 8; x++) {
          const p = ((row * 8 + y) * WIDTH + col * 8 + x) * 4;
          const value = bits & (128 >> x) ? 255 : 0;
          this.pixels[p] = this.pixels[p + 1] = this.pixels[p + 2] = value;
          this.pixels[p + 3] = 255;
        }
      }
    }
  }
  snapshot() { return { state: this.state, frames: this.frames, revision: this.revision }; }
}
