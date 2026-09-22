import {
  STAGES,
  allGaps,
  turtleState,
  birdPosition,
  fallingHeight,
} from "./course.js";
export const STEP = 1 / 120,
  GRAVITY = 1750,
  JUMP = 660;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export class Game {
  constructor() {
    this.reset();
  }
  reset(mode = "modern", loop = 0) {
    this.mode = mode;
    this.stage = 0;
    this.lives = 5;
    this.score = 0;
    this.loop = loop;
    this.time = 0;
    this.status = "title";
    this.assisted = false;
    this.invulnerable = false;
    this.events = [];
    this.enter(0);
  }
  enter(index) {
    this.stage = clamp(index, 0, STAGES.length - 1);
    this.x = 250;
    this.screenX = 270;
    this.y = 0;
    this.vy = 0;
    this.speed = 42;
    this.carry = false;
    this.grounded = true;
    this.duck = false;
    this.crashTime = 0;
    this.buffer = 0;
    this.lastJump = false;
    this.cleared = new Set();
    this.checkpointScore = this.score;
    this.events.push("stage");
  }
  start() {
    this.status = "playing";
  }
  practice(index) {
    this.reset(this.mode);
    this.assisted = true;
    this.enter(index);
    this.status = "paused";
  }
  hurt(reason) {
    if (this.invulnerable) {
      this.assisted = true;
      if (this.y < 0) {
        this.y = 0;
        this.vy = JUMP;
        this.grounded = false;
      }
      return;
    }
    if (this.status !== "playing") return;
    this.reason = reason;
    this.status = "crashed";
    this.crashTime = 0;
    this.lives--;
    this.events.push(reason === "water" ? "splash" : "crash");
  }
  retry() {
    this.score = this.checkpointScore;
    this.enter(this.stage);
    this.status = "playing";
  }
  tick(dt, input = {}) {
    if (this.status === "crashed") {
      this.crashTime += dt;
      if (this.crashTime > 1.35) {
        if (this.lives > 0) this.retry();
        else this.status = "gameover";
      }
      return;
    }
    if (this.status !== "playing") return;
    this.time += dt;
    const stage = STAGES[this.stage];
    const move = clamp(input.move || 0, -1, 1),
      accel = clamp(input.accel || 0, -1, 1);
    this.speed = clamp(this.speed + accel * dt * 38, 10, 80);
    const shift =
      clamp(this.screenX + move * 210 * dt, 150, 650) - this.screenX;
    this.screenX += shift;
    this.x += Math.max(0, 6 * this.speed * (1 + this.loop * 0.08) * dt + shift);
    const pressed = !!input.jump && !this.lastJump;
    this.lastJump = !!input.jump;
    if (pressed) this.buffer = this.mode === "modern" ? 0.13 : dt;
    this.duck = !!input.duck && !this.carry;
    if (this.buffer > 0 && this.grounded && !this.duck) {
      this.vy = JUMP;
      this.grounded = false;
      this.buffer = 0;
      this.events.push("jump");
    }
    this.buffer = Math.max(0, this.buffer - dt);
    if (this.carry) {
      this.x += 180 * dt;
      this.y = birdPosition(this).y - 142;
      this.vy = 0;
      this.grounded = false;
      if (this.x > stage.gaps[0].x + stage.gaps[0].w + 60) {
        this.carry = false;
        this.events.push("release");
      }
    } else {
      const oldY = this.y;
      this.vy -= GRAVITY * dt;
      this.y += this.vy * dt;
      const gap = allGaps(stage).find(
        (g) => this.x > g.x + 8 && this.x < g.x + g.w - 8,
      );
      let ground = gap ? null : 0;
      if (gap && stage.turtles)
        for (let i = 0; i < stage.turtles.length; i++) {
          if (
            Math.abs(this.x - stage.turtles[i]) < 65 &&
            turtleState(this.time, i) !== "down"
          )
            ground = 0;
        }
      if (
        ground !== null &&
        this.y <= ground &&
        oldY >= ground - 3 &&
        this.vy <= 0
      ) {
        this.y = ground;
        this.vy = 0;
        if (!this.grounded) this.events.push("land");
        this.grounded = true;
      } else this.grounded = false;
      if (stage.bird && this.x < stage.gaps[0].x + 70 && this.y > 55) {
        const b = birdPosition(this);
        if (Math.abs(this.x - b.x) < 87 && this.y + 142 > b.y - 40) {
          this.carry = true;
          this.events.push("bird");
        }
      }
      if (this.y < -42 && !this.carry) this.hurt(gap?.type || "hole");
    }
    const playerHeight = this.duck ? 65 : 145;
    for (let i = 0; i < stage.obstacles.length; i++) {
      const o = stage.obstacles[i];
      if (o.type === "hole") continue;
      const bottom =
        o.type === "falling" ? fallingHeight(this, o) : o.bottom || 0;
      if (
        Math.abs(this.x - o.x) < o.w / 2 + 17 &&
        this.y < bottom + (o.h || 45) - 5 &&
        this.y + playerHeight > bottom + 5
      )
        this.hurt(o.type);
      if (this.x > o.x + o.w / 2 + 20 && !this.cleared.has(i)) {
        this.cleared.add(i);
        this.score +=
          (o.type === "falling" ? 15 : 10) *
          Math.max(1, Math.floor(this.speed / 20));
        this.events.push("point");
      }
    }
    if (this.x > stage.length && this.status === "playing") {
      this.score += stage.gaps ? 200 : 100;
      this.events.push("clear");
      if (this.stage === STAGES.length - 1) {
        this.status = "won";
        this.lives++;
        this.events.push("win");
      } else this.enter(this.stage + 1);
    }
  }
  snapshot() {
    return {
      stage: this.stage,
      x: this.x,
      y: this.y,
      vy: this.vy,
      speed: this.speed,
      lives: this.lives,
      score: this.score,
      status: this.status,
      time: this.time,
      assisted: this.assisted,
      carry: this.carry,
      mode: this.mode,
    };
  }
}
