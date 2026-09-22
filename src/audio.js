// Original SID register/envelope stream, oversampled to reduce aliasing.
export class SidOutput {
  constructor() {
    this.regs = new Uint8Array(32);
    this.volumes = [0, 0, 0];
    this.phase = [0, 0, 0];
    this.noisePhase = [0, 0, 0];
    this.noise = [0x7ffff8, 0x5ffff8, 0x3ffff8];
    this.clock = 0; this.samples = []; this.dc = 0;
    this.crashTarget = 0; this.crashMix = 0; this.low1 = 0; this.low2 = 0;
  }
  tick() {
    this.clock += 44100;
    if (this.clock < 982800) return;
    this.clock -= 982800;
    this.samples.push(this.sample());
  }
  oscillatorSample() {
    const rising = [false, false, false];
    // Update every oscillator before applying synchronization. SID voice 1 is
    // synchronized by voice 3, voice 2 by voice 1, and voice 3 by voice 2.
    for (let i = 0; i < 3; i++) {
      const r = i * 7, control = this.regs[r + 4];
      if (control & 8) { this.phase[i] = 0; this.noisePhase[i] = 0; this.noise[i] = 0x7ffff8; continue; }
      const increment = (this.regs[r] + 256 * this.regs[r + 1]) * 985248 / 16777216 / (44100 * 4);
      const before = this.phase[i];
      this.phase[i] = (before + increment) % 1;
      rising[i] = before < .5 && before + increment >= .5;
      this.noisePhase[i] += increment * 16;
      while (this.noisePhase[i] >= 1) {
        this.noisePhase[i]--;
        const n = this.noise[i];
        this.noise[i] = ((n << 1) | (((n >>> 22) ^ (n >>> 17)) & 1)) & 0x7fffff;
      }
    }
    for (let i = 0; i < 3; i++) {
      const source = (i + 2) % 3, sourceSource = (source + 2) % 3;
      if ((this.regs[i * 7 + 4] & 2) && rising[source] &&
          !((this.regs[source * 7 + 4] & 2) && rising[sourceSource])) this.phase[i] = 0;
    }
    let mixed = 0;
    for (let i = 0; i < 3; i++) {
      const r = i * 7, control = this.regs[r + 4], p = this.phase[i];
      if (control & 8) continue;
      let value = 0, count = 0;
      if (control & 16) {
        const ring = (control & 4) && this.phase[(i + 2) % 3] >= .5 ? -1 : 1;
        value += (1 - 4 * Math.abs(p - .5)) * ring; count++;
      }
      if (control & 32) { value += 2 * p - 1; count++; }
      if (control & 64) { value += p < (this.regs[r + 2] + 256 * (this.regs[r + 3] & 15)) / 4096 ? 1 : -1; count++; }
      if (control & 128) {
        const n = this.noise[i];
        const bits = (((n >>> 22) & 1) << 7) | (((n >>> 20) & 1) << 6) | (((n >>> 16) & 1) << 5) | (((n >>> 13) & 1) << 4) | (((n >>> 11) & 1) << 3) | (((n >>> 7) & 1) << 2) | (((n >>> 4) & 1) << 1) | ((n >>> 2) & 1);
        value += bits / 127.5 - 1; count++;
      }
      if (count && !(i === 2 && (this.regs[24] & 128))) mixed += value / count * Math.max(0, Math.min(1, this.volumes[i]));
    }
    return mixed * (this.regs[24] & 15) / 15 * .26;
  }
  sample() {
    let value = 0;
    for (let n = 0; n < 4; n++) value += this.oscillatorSample() / 4;
    // A short gain/filter ramp takes the sting out of the death noise without
    // replacing its original pitch sequence or changing the other effects.
    this.crashMix += (this.crashTarget - this.crashMix) * .0006;
    const cutoff = 6500 - 4500 * this.crashMix;
    const alpha = 1 - Math.exp(-2 * Math.PI * cutoff / 44100);
    this.low1 += alpha * (value - this.low1);
    this.low2 += alpha * (this.low1 - this.low2);
    value = this.low2 * (1 - .45 * this.crashMix);
    this.dc += .002 * (value - this.dc);
    return value - this.dc;
  }
  take() { const block = Float32Array.from(this.samples); this.samples.length = 0; return block; }
}

export class Sound {
 constructor(){this.synth=new SidOutput();this.enabled=true;this.running=false;this.effectsVolume=.8;this.sources=new Set();this.nextTime=0;}
 attach=(c)=>{c.audio={reset:()=>{this.synth=new SidOutput();},onRegWrite:(r,v)=>{this.synth.regs[r]=v;},setVoiceVolume:(i,v)=>{this.synth.volumes[i]=v;},setCrash:(active)=>{this.synth.crashTarget=active?1:0;},tick:()=>this.synth.tick(),endFrame:()=>this.enqueue(this.synth.take())};};
 async unlock(){if(!this.context){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=this.context=new C();this.master=c.createGain();this.master.gain.value=0;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=11000;filter.Q.value=.5;this.master.connect(filter);filter.connect(c.destination);}await this.context.resume();}
 enqueue(samples){if(!this.context||!this.running||!this.enabled||!samples.length)return;const c=this.context;
  if(this.nextTime<c.currentTime||this.nextTime>c.currentTime+.15)this.nextTime=c.currentTime+.025;
  const buffer=c.createBuffer(1,samples.length,44100);buffer.getChannelData(0).set(samples);const source=c.createBufferSource();source.buffer=buffer;source.connect(this.master);source.start(this.nextTime);this.nextTime+=samples.length/44100;this.sources.add(source);source.onended=()=>{source.disconnect();this.sources.delete(source);};
 }
 update(){if(!this.context)return;const active=this.enabled&&this.running;this.master.gain.setTargetAtTime(active?this.effectsVolume:0,this.context.currentTime,.006);if(!active){for(const source of this.sources){try{source.stop();}catch{}}this.sources.clear();this.nextTime=0;}}
}
