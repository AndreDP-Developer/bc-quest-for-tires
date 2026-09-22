import * as THREE from "three";
import * as art from "./art.js";
import {
  STAGES,
  allGaps,
  turtleState,
  birdPosition,
  fallingHeight,
} from "./course.js";
export class Renderer {
  constructor(host) {
    this.webgl = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.webgl.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.webgl.setSize(1280, 720, false);
    this.webgl.outputColorSpace = THREE.SRGBColorSpace;
    host.append(this.webgl.domElement);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 1280, 720, 0, 0.1, 100);
    this.camera.position.z = 50;
    this.textures = new Map();
    this.meshes = [];
    this.lastStage = -1;
    this.bg = this.plane(
      art.canvas(1280, 720, (c) => {
        const g = c.createLinearGradient(0, 0, 0, 720);
        g.addColorStop(0, "#efe4ba");
        g.addColorStop(0.7, "#f9efcf");
        g.addColorStop(1, "#d8d69e");
        c.fillStyle = g;
        c.fillRect(0, 0, 1280, 720);
      }),
      1280,
      720,
      640,
      360,
      -20,
    );
    this.sun = this.plane(
      art.canvas(220, 220, (c) => {
        c.fillStyle = "#f9d977";
        c.beginPath();
        c.arc(110, 110, 100, 0, 7);
        c.fill();
        c.strokeStyle = "#ebc568";
        c.lineWidth = 2;
        c.stroke();
      }),
      220,
      220,
      1000,
      565,
      -19,
    );
    this.clouds = Array.from({ length: 5 }, (_, i) =>
      this.plane(
        "cloud",
        160 + (i % 2) * 50,
        70 + (i % 2) * 18,
        80 + i * 295,
        570 + (i % 3) * 36,
        -17,
      ),
    );
    this.mountains = [0, 1, 2].map((i) =>
      this.plane("mountains", 1600, 430, i * 1600 + 800, 320, -15),
    );
    this.hills = [0, 1, 2].map((i) =>
      this.plane(
        art.canvas(1280, 350, (c) => {
          const p = new Path2D(
            "M -30 350 L -30 175 Q 160 21 420 170 Q 690 270 940 95 Q 1110 3 1310 160 L 1310 350 Z",
          );
          c.fillStyle = "#a5b78d";
          c.fill(p);
          c.lineWidth = 2;
          c.strokeStyle = "#748e70";
          c.stroke(p);
          const p2 = new Path2D(
            "M -30 350 L -30 266 Q 330 160 680 267 Q 980 180 1310 237 L 1310 350 Z",
          );
          c.fillStyle = "#bac392";
          c.fill(p2);
        }),
        1280,
        350,
        i * 1280 + 640,
        240,
        -13,
      ),
    );
    this.props = [];
    this.titleDino = this.plane("dinosaur", 510, 378, 1040, 298, -10);
    this.titlePalm = this.plane("palm", 250, 357, 1200, 375, -9);
    this.volcano = this.plane("volcano", 740, 555, 920, 365, -12);
    this.volcano.visible = false;
    this.caveBackdrop = this.plane("cave", 1280, 530, 640, 395, -11);
    this.caveBackdrop.visible = false;
    this.hearts = Array.from({ length: 5 }, (_, i) =>
      this.plane("heart", 27 + (i % 2) * 9, 27 + (i % 2) * 9, 0, 0, 7),
    );
    this.grounds = [0, 1, 2].map((i) =>
      this.plane("ground", 1280, 160, i * 1280 + 640, 60, -3),
    );
    this.hero = this.plane(art.thor(), 128, 171, 270, 225, 6);
    this.shadow = this.plane(
      art.canvas(180, 50, (c) => {
        c.fillStyle = "#3f564c33";
        c.beginPath();
        c.ellipse(90, 25, 83, 17, 0, 0, 7);
        c.fill();
      }),
      110,
      24,
      270,
      142,
      2,
    );
    this.effect = this.plane(art.burst("BONK!"), 245, 118, 360, 370, 9);
    this.effect.visible = false;
    this.bird = this.plane(art.bird(), 170, 106, 850, 400, 7);
    this.bird.visible = false;
    this.sweetheart = this.plane(art.sweetheart(), 135, 195, 1100, 237, 5);
    this.sweetheart.visible = false;
    this.bubble = this.plane(art.speech("MY HERO!"), 270, 80, 1100, 420, 8);
    this.bubble.visible = false;
    this.debug = this.plane(
      art.canvas(100, 160, (c) => {
        c.strokeStyle = "#ed4c64";
        c.lineWidth = 5;
        c.strokeRect(1, 1, 98, 158);
      }),
      34,
      145,
      270,
      210,
      12,
    );
    this.debug.visible = false;
    this.frameTextures = Array.from({ length: 8 }, (_, i) =>
      this.texture(art.thor("ride", i)),
    );
    this.duckTextures = Array.from({ length: 8 }, (_, i) =>
      this.texture(art.thor("duck", i)),
    );
    this.jumpTex = this.texture(art.thor("jump"));
    this.crashTex = this.texture(art.thor("crash"));
    this.birdFrames = [this.texture(art.bird(0)), this.texture(art.bird(1))];
    this.resizeObserver = new ResizeObserver(() => {
      const r = host.getBoundingClientRect();
      this.webgl.setSize(r.width, r.height, false);
    });
    this.resizeObserver.observe(host);
  }
  texture(source) {
    if (typeof source === "string") {
      if (this.textures.has(source)) return this.textures.get(source);
      const tex = this.texture(art[source]());
      this.textures.set(source, tex);
      return tex;
    }
    const tex = new THREE.CanvasTexture(source);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }
  plane(source, w, h, x, y, z) {
    const material = new THREE.MeshBasicMaterial({
      map: this.texture(source),
      transparent: true,
      depthWrite: false,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    m.position.set(x, y, z);
    m.renderOrder = z;
    this.scene.add(m);
    return m;
  }
  remove(m) {
    this.scene.remove(m);
    m.geometry.dispose();
    m.material.dispose();
  }
  build(stageIndex) {
    this.lastStage = stageIndex;
    for (const m of this.meshes) this.remove(m);
    for (const p of this.props) this.remove(p.mesh);
    this.meshes = [];
    this.props = [];
    const s = STAGES[stageIndex];
    for (let i = 0; i < 12; i++) {
      const kind = i % 3 === 0 ? "palm" : "fern",
        w = kind === "palm" ? 190 : 190;
      const h = kind === "palm" ? 310 : 95;
      const m = this.plane(kind, w, h, 0, 140 + h / 2, -6);
      this.props.push({ mesh: m, x: i * 530 + 580, rate: 0.75 });
    }
    this.obstacles = s.obstacles
      .filter((o) => o.type !== "hole")
      .map((o) => {
        let key =
          o.type === "falling"
            ? "rock"
            : o.type === "dino"
              ? "dinosaur"
              : o.type;
        const isHead = ["branch", "stalactite"].includes(o.type);
        const w =
          o.type === "dino"
            ? 420
            : o.type === "club"
              ? 150
              : isHead
                ? 200
                : o.w * 1.25;
        const h =
          o.type === "dino"
            ? 310
            : o.type === "club"
              ? 198
              : isHead
                ? 240
                : o.h * 1.25;
        const source = o.type === "dino" ? art.dinosaur("awake") : key;
        const m = this.plane(source, w, h, 0, 0, 4);
        this.meshes.push(m);
        return { o, m, w, h };
      });
    this.gaps = allGaps(s).map((g) => {
      const water = g.type === "water",
        lava = g.type === "lava";
      const texture = art.canvas(400, 200, (c) => {
        c.fillStyle = water ? "#63a7a1" : lava ? "#d36e45" : "#637d70";
        c.fillRect(0, 0, 400, 200);
        c.strokeStyle = water ? "#d3ebc7" : lava ? "#f7c46c" : "#859a7d";
        c.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
          const x = (i * 73) % 400,
            y = 15 + ((i * 33) % 170);
          c.beginPath();
          c.moveTo(x, y);
          c.quadraticCurveTo(x + 10, y + 4, x + 25, y);
          c.stroke();
        }
      });
      const m = this.plane(texture, g.w, 151, 0, 64, 1);
      this.meshes.push(m);
      return { g, m };
    });
    this.turtles = (s.turtles || []).map((x, i) => {
      const m = this.plane("turtle", 136, 68, 0, 109, 4);
      this.meshes.push(m);
      return { x, i, m };
    });
    this.turtleWarning = this.texture(art.turtle(true));
    this.fallShadows = s.obstacles
      .filter((o) => o.type === "falling")
      .map((o) => {
        const m = this.plane(
          art.canvas(100, 30, (c) => {
            c.fillStyle = "#634c4066";
            c.beginPath();
            c.ellipse(50, 15, 45, 10, 0, 0, 7);
            c.fill();
          }),
          90,
          22,
          0,
          141,
          3,
        );
        this.meshes.push(m);
        return { o, m };
      });
    if (s.gaps) {
      const text = s.bird
        ? "DOOKY AIRWAYS"
        : s.biome === "cliff"
          ? "SPEED 75+  →"
          : "MIND THE TURTLES";
      this.sign = this.plane(art.sign(text), 255, 147, 0, 213, -1);
      this.meshes.push(this.sign);
    } else this.sign = null;
    this.caveCeiling = null;
    if (s.biome === "cave") {
      this.caveCeiling = this.plane(
        art.canvas(1280, 160, (c) => {
          c.fillStyle = "#405b56";
          const p = new Path2D(
            "M 0 0 L 1280 0 L 1280 100 L 1190 80 L 1150 145 L 1070 87 L 890 110 L 820 70 L 610 102 L 420 85 L 300 133 L 220 90 L 0 120 Z",
          );
          c.fill(p);
        }),
        1280,
        160,
        640,
        660,
        -5,
      );
      this.meshes.push(this.caveCeiling);
    }
  }
  render(s, time, { reduced = false, hitboxes = false } = {}) {
    if (this.lastStage !== s.stage) this.build(s.stage);
    const stage = STAGES[s.stage],
      title = s.status === "title";
    const scroll = title ? 0 : s.x - s.screenX;
    this.bg.material.color.set(
      stage.biome === "cave"
        ? "#709b9c"
        : stage.biome === "volcano" || stage.biome === "lava"
          ? "#ffe0bd"
          : "#ffffff",
    );
    this.sun.visible = stage.biome !== "cave";
    this.titleDino.visible =
      title || ["plains", "lagoon", "ridge"].includes(stage.biome);
    this.titlePalm.visible = title || stage.biome === "forest";
    this.titleDino.position.x = title ? 1020 : 1110 - ((scroll * 0.15) % 1900);
    this.titleDino.position.y = title ? 290 : 300;
    for (let i = 0; i < this.clouds.length; i++) {
      const c = this.clouds[i];
      c.position.x =
        ((((80 + i * 295 - scroll * 0.07 - (reduced ? 0 : time * 2)) % 1550) +
          1550) %
          1550) -
        130;
      c.visible = stage.biome !== "cave";
    }
    this.mountains.forEach(
      (m, i) =>
        (m.position.x = i * 1600 + 800 - ((scroll * 0.17) % 1600) - 1600),
    );
    this.hills.forEach(
      (m, i) =>
        (m.position.x = i * 1280 + 640 - ((scroll * 0.32) % 1280) - 1280),
    );
    this.grounds.forEach(
      (m, i) => (m.position.x = i * 1280 + 640 - (scroll % 1280) - 1280),
    );
    for (const p of this.props) {
      p.mesh.position.x = p.x - scroll * p.rate;
      p.mesh.visible =
        !title &&
        p.mesh.position.x > -250 &&
        p.mesh.position.x < 1500 &&
        stage.biome !== "cave";
    }
    for (const { o, m, h } of this.obstacles) {
      m.position.x =
        o.x - scroll + (o.type === "branch" ? 25 : o.type === "dino" ? 105 : 0);
      const bottom = o.type === "falling" ? fallingHeight(s, o) : 0;
      m.position.y = 140 + bottom + h / 2;
      if (o.type === "stalactite") m.position.y = 140 + 76 + h / 2;
      if (o.type === "dino") {
        m.position.y = 239;
        m.scale.x = -1;
      }
      if (o.type === "branch") m.position.y = 208;
      m.visible = !title && m.position.x > -250 && m.position.x < 1500;
    }
    for (const { g, m } of this.gaps) {
      m.position.x = g.x + g.w / 2 - scroll;
      m.visible = !title;
    }
    for (const { o, m } of this.fallShadows) {
      m.position.x = o.x - scroll;
      m.visible = !title;
    }
    for (const { x, i, m } of this.turtles) {
      const state = turtleState(s.time, i);
      m.position.x = x - scroll;
      m.position.y =
        109 +
        (state === "down" ? -27 : reduced ? 0 : Math.sin(s.time * 3 + i) * 2);
      m.material.opacity = state === "down" ? 0.25 : 1;
      m.material.map =
        state === "warning" ? this.turtleWarning : this.texture("turtle");
      m.visible = !title;
    }
    if (this.sign) this.sign.position.x = stage.gaps[0].x - 270 - scroll;
    this.bird.visible = !!stage.bird && !title;
    if (this.bird.visible) {
      const b = birdPosition(s);
      this.bird.position.set(b.x - scroll, b.y + 140, 7);
      this.bird.material.map = this.birdFrames[Math.floor(time * 6) % 2];
    }
    const frame = reduced ? 0 : Math.floor(s.x / 15) % 8;
    this.hero.material.map =
      s.status === "crashed"
        ? this.crashTex
        : s.duck
          ? this.duckTextures[frame]
          : !s.grounded
            ? this.jumpTex
            : this.frameTextures[frame];
    this.hero.scale.setScalar(title ? 1.9 : 1);
    this.hero.position.set(
      title ? 880 : s.screenX,
      140 + (title ? 163 : 85.5) + s.y,
      6,
    );
    this.hero.rotation.z =
      s.status === "crashed" ? Math.sin(s.crashTime * 8) * 0.15 : 0;
    this.shadow.position.x = title ? 880 : s.screenX;
    this.shadow.scale.x = title ? 1.8 : Math.max(0.4, 1 - s.y / 300);
    this.shadow.material.opacity = s.y < 0 ? 0 : 1;
    this.effect.visible = s.status === "crashed";
    this.effect.position.x = s.screenX + 65;
    this.effect.position.y = 380;
    this.sweetheart.visible = s.stage === 8 && s.x > stage.length - 750;
    this.sweetheart.position.x = stage.length + 80 - scroll;
    this.bubble.visible = this.sweetheart.visible;
    this.bubble.position.x = this.sweetheart.position.x - 25;
    this.volcano.visible = ["volcano", "lava", "cliff"].includes(stage.biome);
    this.volcano.position.x = 980 - ((scroll * 0.12) % 1600);
    this.caveBackdrop.visible = stage.biome === "cave";
    this.hearts.forEach((m, i) => {
      m.visible = s.status === "won";
      m.position.x = this.sweetheart.position.x - 80 + i * 32;
      m.position.y =
        350 + (i % 2) * 22 + (reduced ? 0 : Math.sin(time * 2 + i) * 9);
    });
    this.debug.visible = hitboxes && !title;
    this.debug.scale.y = s.duck ? 65 / 145 : 1;
    this.debug.position.set(s.screenX, 140 + s.y + (s.duck ? 32.5 : 72.5), 12);
    this.webgl.render(this.scene, this.camera);
  }
}
