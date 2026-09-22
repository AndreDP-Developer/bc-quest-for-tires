import test from 'node:test';
import assert from 'node:assert/strict';
import { SidOutput } from '../src/audio.js';
test('hard sync resets voice 1 from the rising edge of voice 3', () => {
  const s = new SidOutput(); s.phase = [.2, 0, .499];
  s.regs[4] = 19; s.regs[18] = 16; s.regs[14] = 255; s.regs[15] = 255;
  s.oscillatorSample(); assert.equal(s.phase[0], 0); assert.ok(s.phase[2] > .5);
  s.phase = [.2, 0, .499]; s.regs[4] = 17;
  s.oscillatorSample(); assert.equal(s.phase[0], .2);
});
test('crash treatment lowers both level and high-frequency roughness', () => {
  function measure(crash) {
    const s = new SidOutput(); s.crashTarget = crash;
    s.regs[0] = 0; s.regs[1] = 70; s.regs[4] = 129; s.regs[24] = 15; s.volumes[0] = .8;
    let power = 0, roughness = 0, previous = 0;
    for (let n = 0; n < 16000; n++) {
      const value = s.sample(); assert.ok(Number.isFinite(value));
      if (n > 6000) { power += value * value; roughness += (value - previous) ** 2; }
      previous = value;
    }
    return { power, roughness };
  }
  const normal = measure(0), crash = measure(1);
  assert.ok(crash.power < normal.power * .5);
  assert.ok(crash.roughness < normal.roughness * .3);
  assert.ok(crash.power > 0);
});
