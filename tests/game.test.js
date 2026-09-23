import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { Game } from '../src/game.js';
import { SidOutput } from '../src/audio.js';
const initial = fs.readFileSync(new URL('../public/data/start.json', import.meta.url), 'utf8');
const character = fs.readFileSync(new URL('../public/data/characters.bin', import.meta.url));
const hash = pixels => createHash('sha256').update(pixels).digest('hex');
// Hardware modules are singleton devices: run all cases serially on one machine.
test('original game, animation, input, SID audio and restart', async t => {
  const synth = new SidOutput(); let peak = 0, sampleCount = 0;
  const game = new Game(initial, { character, audio(c) { c.audio = {
    reset() {}, onRegWrite(r, v) { synth.regs[r] = v; },
    setVoiceVolume(i, v) { synth.volumes[i] = v; }, tick() { synth.tick(); },
    endFrame() { for (const v of synth.take()) { assert.ok(Number.isFinite(v)); peak = Math.max(peak, Math.abs(v)); sampleCount++; } },
  }; } });
  const run = (n, input = {}) => { for (let i = 0; i < n; i++) game.step(input); };
  let baseline;
  await t.test('scrolling and pedalling advance from the original checkpoint', () => {
    const ready = hash(game.pixels); game.start(); run(30); baseline = hash(game.pixels);
    assert.notEqual(baseline, ready); assert.equal(game.frames, 30);
    assert.equal(game.machine.ram.readRam(0x120e), 0, 'single-player mode');
  });
  await t.test('jump and duck invoke distinct original animation routines', () => {
    game.reset(); game.start(); run(30, { jump: true }); const jump = hash(game.pixels); assert.equal(game.machine.ram.readRam(0x4039), 1);
    game.reset(); game.start(); run(30, { duck: true }); const duck = hash(game.pixels); assert.equal(game.machine.ram.readRam(0x4039), 2);
    assert.notEqual(jump, baseline); assert.notEqual(duck, baseline); assert.notEqual(jump, duck);
  });
  await t.test('speed modifier changes scrolling without replacing game physics', () => {
    game.reset(); game.start(); run(90); const normal = hash(game.pixels), speed = game.machine.ram.readRam(0x4024);
    game.reset(); game.start(); run(90, { right: true, speed: true });
    assert.notEqual(hash(game.pixels), normal);
    assert.ok(game.machine.ram.readRam(0x4024) < speed);
  });
  await t.test('original SID writes produce finite, non-silent audio', () => {
    assert.ok(sampleCount > 100000); assert.ok(peak > .01); assert.ok(peak < 1);
  });
  await t.test('pausing freezes the machine and clears held input', () => {
    game.pause(); const before = hash(game.pixels), frames = game.frames; run(30, { jump: true });
    assert.equal(game.frames, frames); assert.equal(hash(game.pixels), before);
    const cia = JSON.parse(game.machine.cias.serialize()); assert.equal(cia.joystick2, 255);
  });
  await t.test('re-entry blanks the whole field and restores a complete scene', () => {
    game.reset(); game.start(); let blankFrames = 0, returned = false;
    for (let f = 0; f < 800; f++) {
      game.step(); const entry = game.machine.ram.readRam(0x405e);
      if (entry > 40 && entry < 160) {
        for (const y of [20, 100, 150]) {
          const p = (y * 320 + 20) * 4;
          assert.deepEqual([...game.pixels.slice(p, p + 3)], [0, 0, 0], 'no partial scenery during the closed-border interval');
        }
        blankFrames++;
      }
      if (blankFrames && entry === 0) { run(2); returned = true; break; }
    }
    assert.ok(blankFrames > 10); assert.ok(returned);
    assert.equal(game.machine.ram.readRam(0x4039), 0);
    assert.ok(game.pixels[(20 * 320 + 20) * 4 + 2] > 50, 'sky restored');
    assert.ok(game.pixels[(100 * 320 + 20) * 4] > 200, 'field restored');
  });
  await t.test('woodland scroll stays coherent without canopy shake or black flashes', () => {
    game.reset(); game.start();
    // Test-only bypass of the original obstacle collision routine lets the
    // unmodified scrolling program reach and traverse the woodland reliably.
    const collisionOpcode = game.machine.ram.readRam(0x9861);
    game.machine.ram.writeRam(0x9861, 0x60);
    try {
      run(90, { right: true, speed: true }); run(660);
      let first, previousCanopy;
      for (let f = 0; f < 1000; f++) {
        game.step();
        if (!f) first = hash(game.pixels);
        const canopy = game.pixels.slice(62 * 320 * 4, 63 * 320 * 4);
        if (previousCanopy) {
          // Every interior canopy pixel must match a forward translation of
          // the previous frame. Coarse/fine mismatch used to jump -4 then +9.
          let best = Infinity;
          for (let shift = 0; shift <= 8; shift++) {
            let mismatches = 0;
            for (let x = 25; x < 290; x++) for (let c = 0; c < 3; c++)
              mismatches += canopy[x * 4 + c] !== previousCanopy[(x + shift) * 4 + c];
            best = Math.min(best, mismatches);
          }
          assert.equal(best, 0, `canopy scrolls forward without tearing at frame ${f}`);
        }
        previousCanopy = canopy;
        for (let x = 8; x < 312; x++) {
          const p = (87 * 320 + x) * 4;
          assert.ok(game.pixels[p] + game.pixels[p + 1] + game.pixels[p + 2] > 0,
            `no empty-buffer black pixel at woodland frame ${f}, x=${x}`);
        }
      }
      assert.notEqual(hash(game.pixels), first, 'scenery continues scrolling');
    } finally { game.machine.ram.writeRam(0x9861, collisionOpcode); }
  });
  await t.test('five lost tires reach game over and Enter can start a fresh game', () => {
    game.reset(); game.start(); run(100, { right: true, speed: true }); run(4000);
    assert.equal(game.state, 'over');
    assert.equal(game.machine.ram.readRam(0x120f), 0);
    game.start(); assert.equal(game.state, 'playing'); assert.equal(game.frames, 0);
    assert.equal(game.machine.ram.readRam(0x120f), 1);
    const fresh = hash(game.pixels); run(30);
    assert.notEqual(hash(game.pixels), fresh);
    assert.equal(game.machine.ram.readRam(0x4039), 0);
    assert.equal(game.machine.ram.readRam(0x4024), 39);
  });
});
