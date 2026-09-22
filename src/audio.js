export class AudioEngine {
  constructor() {
    this.enabled = true;
    this.effects = 0.55;
    this.music = 0.16;
    this.ambience = 0.2;
    this.beat = 0;
    this.next = 0;
  }
  async unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.65;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }
  tone(freq, end, duration, volume = 0.2, type = "sine", delay = 0) {
    if (!this.ctx || !this.enabled) return;
    const t = this.ctx.currentTime + delay,
      o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration);
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + duration + 0.02);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  effect(name) {
    const v = this.effects;
    if (name === "jump") this.tone(170, 650, 0.16, v * 0.27, "triangle");
    if (name === "land") this.tone(95, 42, 0.1, v * 0.15);
    if (name === "crash") {
      this.tone(160, 32, 0.35, v * 0.5, "triangle");
      this.tone(650, 130, 0.22, v * 0.2, "sawtooth");
    }
    if (name === "splash")
      for (let i = 0; i < 5; i++)
        this.tone(230 + i * 63, 50, 0.22, v * 0.2, "sine", i * 0.06);
    if (name === "bird") {
      this.tone(850, 380, 0.12, v * 0.2);
      this.tone(1000, 440, 0.2, v * 0.2, "sine", 0.16);
    }
    if (name === "clear" || name === "win")
      [262, 330, 392, 524].forEach((f, i) =>
        this.tone(f, f, 0.25, v * 0.25, "triangle", i * 0.12),
      );
  }
  update(time, playing, speed) {
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(
      playing && this.enabled ? 0.65 : 0,
      this.ctx.currentTime,
      0.04,
    );
    if (!playing) return;
    if (time > this.next) {
      this.next = time + 0.27;
      const notes = [
        262, 0, 330, 392, 0, 330, 294, 0, 220, 0, 294, 349, 0, 294, 262, 0,
      ];
      const f = notes[this.beat++ % notes.length];
      if (f) this.tone(f, f * 0.997, 0.19, this.music * 0.18, "triangle");
      this.tone(this.beat % 4 === 0 ? 95 : 160, 45, 0.07, this.music * 0.18);
      if (this.beat % 2 === 0)
        this.tone(70 + speed, 40, 0.035, this.ambience * 0.1, "triangle");
    }
  }
}
