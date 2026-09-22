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
