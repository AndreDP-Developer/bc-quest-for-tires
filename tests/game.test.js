import test from "node:test";
import assert from "node:assert/strict";
import { Game, STEP, JUMP, GRAVITY } from "../src/game.js";
import { STAGES, turtleState, allGaps, birdPosition } from "../src/course.js";
import { playthrough } from "../scripts/playthrough.mjs";
function run(g, n, input = {}) {
  for (let i = 0; i < n; i++)
    g.tick(STEP, typeof input === "function" ? input(g) : input);
}
test("jump arc returns to ground and held jump cannot auto-repeat", () => {
  const g = new Game();
  g.start();
  run(g, 100, { jump: true });
  assert.equal(g.grounded, true);
  assert.equal(g.y, 0);
  assert.equal(g.events.filter((e) => e === "jump").length, 1);
});
test("jump clears a rock while riding into it costs a tire", () => {
  const a = new Game();
  a.start();
  run(a, 400);
  assert.equal(a.lives, 4);
  const b = new Game();
  b.start();
  run(b, 380, (g) => ({ jump: g.x > 806 && g.x < 860 }));
  assert.equal(b.lives, 5);
  assert.ok(b.score > 0);
});
test("duck clears a branch and standing collides", () => {
  const g = new Game();
  g.enter(1);
  g.start();
  g.x = 1060;
  run(g, 75, { duck: true });
  assert.equal(g.lives, 5);
  const h = new Game();
  h.enter(1);
  h.start();
  h.x = 1060;
  run(h, 75);
  assert.equal(h.lives, 4);
});
test("holes cause falls and stage checkpoints restore score without farming", () => {
  const g = new Game();
  g.start();
  g.x = 1900;
  g.score = 30;
  run(g, 100);
  assert.equal(g.lives, 4);
  run(g, 200);
  assert.equal(g.stage, 0);
  assert.equal(g.score, 0);
  assert.ok(g.x < 900);
});
test("turtles warn before submerging; a submerged shell cannot support Thor", () => {
  assert.equal(turtleState(4.2, 0), "warning");
  assert.equal(turtleState(4.8, 0), "down");
  const g = new Game();
  g.enter(2);
  g.start();
  g.x = 730;
  g.time = 4.7;
  g.speed = 10;
  run(g, 26);
  assert.ok(g.y < 0);
});
test("Dooky Bird catches a jump and releases beyond the lava", () => {
  const g = new Game();
  g.enter(4);
  g.start();
  g.x = birdPosition(g).x;
  g.y = 85;
  g.vy = 300;
  g.grounded = false;
  run(g, 2);
  assert.equal(g.carry, true);
  run(g, 450);
  assert.equal(g.carry, false);
  assert.equal(g.lives, 5);
  assert.ok(g.x > 1830);
});
test("cliff requires more travel than a normal-speed jump supplies", () => {
  const duration = (2 * JUMP) / GRAVITY;
  assert.ok(duration * 42 * 6 < 295);
  assert.ok(duration * 80 * 6 > 295);
});
test("pause freezes simulation and practice is visibly assisted", () => {
  const g = new Game();
  g.start();
  run(g, 50);
  g.status = "paused";
  const before = g.snapshot();
  run(g, 100, { jump: true });
  assert.deepEqual(g.snapshot(), before);
  g.practice(7);
  assert.equal(g.stage, 7);
  assert.equal(g.assisted, true);
  assert.equal(g.status, "paused");
});
test("last stage completes the rescue and awards a spare tire", () => {
  const g = new Game();
  g.enter(8);
  g.x = STAGES[8].length - 1;
  g.start();
  run(g, 1);
  assert.equal(g.status, "won");
  assert.equal(g.lives, 6);
});
test("repeated deterministic input produces identical state", () => {
  const a = new Game(),
    b = new Game();
  a.start();
  b.start();
  const input = (g) => ({
    jump: Math.floor(g.time * 2) % 3 === 0,
    duck: Math.floor(g.time) % 5 === 0,
    accel: Math.sin(g.time) > 0 ? 1 : -1,
  });
  run(a, 6000, input);
  run(b, 6000, input);
  assert.deepEqual(a.snapshot(), b.snapshot());
});
for (const mode of ["modern", "classic"])
  test(`complete nine-chapter adventure using only legal inputs (${mode})`, () => {
    const result = playthrough(mode);
    assert.equal(result.state.status, "won");
    assert.equal(result.state.assisted, false);
    assert.ok(result.state.lives > 0);
    assert.equal(
      result.report.filter((r) => r.stage && r.crash === undefined).length,
      9,
    );
  });
