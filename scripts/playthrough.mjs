import { Game, STEP } from "../src/game.js";
import { STAGES, allGaps, turtleState, birdPosition } from "../src/course.js";
// A controller that uses only legal inputs. No warps, invulnerability or state writes.
export function pilot(g) {
  const s = STAGES[g.stage];
  let target = s.turtles ? 50 : s.biome === "cliff" ? 80 : 42;
  let jump = false,
    duck = false;
  for (const o of s.obstacles) {
    const d = o.x - g.x;
    if (
      ["branch", "stalactite", "club", "dino"].includes(o.type) &&
      d < o.w / 2 + 110 &&
      d > -o.w / 2 - 45
    )
      duck = true;
    if (["rock", "log"].includes(o.type) && d < 100 && d > 20) jump = true;
    if (o.type === "falling" && d < 75 && d > 10) jump = true;
  }
  for (const gap of allGaps(s)) {
    if (gap.type === "hole" && gap.x - g.x < 38 && gap.x - g.x > 0) jump = true;
    if (gap.type === "cliff" && gap.x - g.x < 30 && gap.x - g.x > 0)
      jump = true;
    if (gap.type === "water") {
      if (g.x > gap.x - 28 && g.x < gap.x) jump = true;
      if (g.x > gap.x && g.x < gap.x + gap.w - 160) {
        const supported = s.turtles.findIndex(
          (x, i) => Math.abs(g.x - x) < 65 && turtleState(g.time, i) !== "down",
        );
        if (supported >= 0 && g.x > s.turtles[supported] + 8) jump = true;
      }
    }
  }
  if (s.bird && !g.carry) {
    const bird = birdPosition(g);
    if (g.x > 760 && g.x < 1020 && Math.abs(g.x - bird.x) < 85) jump = true;
  }
  return {
    accel: Math.abs(g.speed - target) > 0.3 ? Math.sign(target - g.speed) : 0,
    jump: g.grounded && jump,
    duck,
  };
}
export function playthrough(mode = "modern") {
  const g = new Game();
  g.reset(mode);
  g.start();
  let stage = -1,
    priorLives = 5;
  const report = [];
  for (
    let i = 0;
    i < 120 * 300 && g.status !== "won" && g.status !== "gameover";
    i++
  ) {
    if (g.stage !== stage) {
      stage = g.stage;
      report.push({ stage: stage + 1, time: g.time, x: g.x, lives: g.lives });
    }
    g.tick(STEP, pilot(g));
    if (g.lives !== priorLives) {
      report.push({
        crash: g.reason,
        stage: g.stage + 1,
        x: g.x,
        time: g.time,
      });
      priorLives = g.lives;
    }
  }
  return { state: g.snapshot(), report };
}
if (process.argv[1]?.endsWith("playthrough.mjs"))
  console.log(JSON.stringify(playthrough(), null, 2));
