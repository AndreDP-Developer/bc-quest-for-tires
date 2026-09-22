import "./style.css";
import { Game, STEP } from "./game.js";
import { STAGES } from "./course.js";
import { Renderer } from "./renderer.js";
import { AudioEngine } from "./audio.js";
const $ = (id) => document.getElementById(id),
  game = new Game(),
  audio = new AudioEngine();
const keys = new Set(),
  touch = new Set();
let view,
  last = performance.now(),
  accumulator = 0,
  stageTimer = 0,
  hitboxes = false,
  timeScale = 1,
  lastStatus = "",
  pausedByDialog = false,
  best = 0;
let settings = {
  mode: "modern",
  reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
  effects: 55,
  music: 16,
  ambience: 20,
  sound: true,
};
try {
  settings = {
    ...settings,
    ...JSON.parse(localStorage.getItem("bc-settings") || "{}"),
  };
  best = Number(localStorage.getItem("bc-best") || 0);
} catch {}
function save() {
  try {
    localStorage.setItem("bc-settings", JSON.stringify(settings));
  } catch {}
}
function clearInput() {
  keys.clear();
  touch.clear();
  game.lastJump = false;
}
function applySettings() {
  game.mode = settings.mode;
  $("mode").value = settings.mode;
  $("reduced").checked = settings.reduced;
  for (const name of ["effects", "music", "ambience"]) {
    $(name).value = settings[name];
    audio[name] = settings[name] / 100;
  }
  audio.enabled = settings.sound;
  $("soundBtn").innerHTML = settings.sound
    ? "♪ <span>SOUND ON</span>"
    : "♪ <span>SOUND OFF</span>";
  $("soundBtn").setAttribute(
    "aria-label",
    settings.sound ? "Mute sound" : "Enable sound",
  );
}
applySettings();
const touchControls = document.querySelector(".touch-controls");
document.querySelector(".game-toolbar").after(touchControls);
for (const [id, label] of [
  ["settingsBtn", "Settings"],
  ["practiceBtn", "Practice chapters"],
  ["fullBtn", "Fullscreen"],
])
  $(id).setAttribute("aria-label", label);
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === $("shell"))
    $("shell").append(touchControls);
  else document.querySelector(".game-toolbar").after(touchControls);
});
try {
  view = new Renderer($("scene"));
} catch (error) {
  $("failure").hidden = false;
  $("failureText").textContent =
    "This adventure needs WebGL 2. Enable browser hardware acceleration, then reload. " +
    error.message;
}
function start() {
  audio.unlock().catch(() => {});
  audio.next = 0;
  audio.beat = 0;
  clearInput();
  game.reset(settings.mode);
  game.start();
  stageTimer = 2.4;
  timeScale = 1;
  $("timeScale").value = "1";
  $("invulnerable").checked = false;
  updateUI();
  $("scene").focus();
}
function pause() {
  if (game.status === "playing") {
    game.status = "paused";
    clearInput();
  } else if (
    game.status === "paused" &&
    !document.querySelector("dialog[open]")
  ) {
    game.status = "playing";
    audio.unlock().catch(() => {});
  }
  updateUI();
}
function openDialog(id) {
  pausedByDialog = game.status === "playing";
  if (pausedByDialog) {
    game.status = "paused";
    clearInput();
  }
  $(id).showModal();
  updateUI();
}
for (const id of ["settingsDialog", "practiceDialog", "aboutDialog"])
  $(id).addEventListener("close", () => {
    if (pausedByDialog && game.status === "paused") game.status = "playing";
    pausedByDialog = false;
    clearInput();
    updateUI();
  });
$("startBtn").onclick = start;
$("pauseBtn").onclick = pause;
$("restartBtn").onclick = start;
$("resumeBtn").onclick = () => {
  if (game.status === "won") {
    const { loop, lives, score, assisted } = game;
    game.reset(settings.mode, loop + 1);
    game.lives = lives;
    game.score = score;
    game.checkpointScore = score;
    game.assisted = assisted;
    audio.next = 0;
    game.start();
    stageTimer = 2.4;
  } else if (game.status === "gameover") start();
  else pause();
};
$("practiceResume").onclick = pause;
$("settingsBtn").onclick = () => openDialog("settingsDialog");
$("practiceBtn").onclick = () => openDialog("practiceDialog");
$("aboutBtn").onclick = () => openDialog("aboutDialog");
function toggleSound() {
  settings.sound = !settings.sound;
  applySettings();
  save();
  if (settings.sound) audio.unlock().catch(() => {});
}
$("soundBtn").onclick = toggleSound;
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $("shell").requestFullscreen();
  } catch {
    $("runLabel").textContent = "FULLSCREEN UNAVAILABLE IN THIS BROWSER";
  }
}
$("fullBtn").onclick = fullscreen;
$("mode").onchange = () => {
  settings.mode = $("mode").value;
  save();
  game.reset(settings.mode);
  pausedByDialog = false;
  updateUI();
};
for (const name of ["effects", "music", "ambience"])
  $(name).oninput = () => {
    settings[name] = Number($(name).value);
    audio[name] = settings[name] / 100;
    save();
  };
$("reduced").onchange = () => {
  settings.reduced = $("reduced").checked;
  save();
};
$("hitboxes").onchange = () => (hitboxes = $("hitboxes").checked);
$("invulnerable").onchange = () => {
  game.invulnerable = $("invulnerable").checked;
  if (game.invulnerable) game.assisted = true;
};
$("timeScale").onchange = () => {
  timeScale = Number($("timeScale").value);
  if (timeScale !== 1) game.assisted = true;
};
STAGES.forEach((s, i) => {
  const b = document.createElement("button");
  b.innerHTML = `<small>CHAPTER ${String(i + 1).padStart(2, "0")}</small>${s.name}`;
  b.onclick = () => {
    game.practice(i);
    timeScale = 1;
    $("timeScale").value = "1";
    $("invulnerable").checked = false;
    pausedByDialog = false;
    $("practiceDialog").close();
    stageTimer = 2.4;
    updateUI();
  };
  $("chapterList").append(b);
});
const consumed = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "Enter",
  "Escape",
  "KeyP",
  "KeyM",
  "KeyF",
  "F2",
]);
window.addEventListener("keydown", (e) => {
  if (document.querySelector("dialog[open]")) return;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
  if (consumed.has(e.code)) e.preventDefault();
  keys.add(e.code);
  if (e.repeat) return;
  if (e.code === "Enter") {
    if (["title", "gameover"].includes(game.status)) start();
    else if (game.status === "paused") pause();
    else if (game.status === "won") $("resumeBtn").click();
  }
  if (["Escape", "KeyP"].includes(e.code)) pause();
  if (e.code === "KeyM") toggleSound();
  if (e.code === "KeyF") fullscreen();
  if (e.code === "F2") openDialog("practiceDialog");
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
window.addEventListener("blur", () => {
  clearInput();
  if (game.status === "playing") game.status = "paused";
  updateUI();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInput();
    if (game.status === "playing") game.status = "paused";
    updateUI();
  }
});
document.querySelectorAll("[data-hold]").forEach((b) => {
  b.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    b.setPointerCapture(e.pointerId);
    touch.add(b.dataset.hold);
    audio.unlock().catch(() => {});
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    b.addEventListener(event, () => touch.delete(b.dataset.hold));
});
let padStart = false;
function input() {
  let left = keys.has("ArrowLeft") || keys.has("KeyA") || touch.has("left"),
    right = keys.has("ArrowRight") || keys.has("KeyD") || touch.has("right"),
    shift = keys.has("ShiftLeft") || keys.has("ShiftRight");
  let move = Number(right) - Number(left),
    accel =
      (shift ? move : 0) +
      Number(touch.has("faster")) -
      Number(touch.has("slower"));
  if (shift) move = 0;
  let jump =
      keys.has("Space") ||
      keys.has("ArrowUp") ||
      keys.has("KeyW") ||
      touch.has("jump"),
    duck = keys.has("ArrowDown") || keys.has("KeyS") || touch.has("duck");
  const pad = navigator.getGamepads?.()[0];
  if (pad) {
    move +=
      Math.abs(pad.axes[0]) > 0.2
        ? pad.axes[0]
        : Number(pad.buttons[15]?.pressed) - Number(pad.buttons[14]?.pressed);
    jump ||= pad.buttons[0]?.pressed;
    duck ||= pad.buttons[1]?.pressed;
    accel += (pad.buttons[7]?.value || 0) - (pad.buttons[6]?.value || 0);
    const start = pad.buttons[9]?.pressed;
    if (start && !padStart) {
      if (game.status === "title") $("startBtn").click();
      else pause();
    }
    padStart = start;
  }
  return { move, accel, jump, duck };
}
function updateUI() {
  const title = game.status === "title",
    s = STAGES[game.stage];
  for (const id of ["titleScreen", "heroCaption", "stamp"])
    $(id).hidden = !title;
  for (const id of ["hud", "hint", "progress"]) $(id).hidden = title;
  $("stageTag").textContent = s.tag;
  $("stageTitle").textContent = s.name;
  $("score").textContent = String(game.score).padStart(5, "0");
  $("lives").textContent = "● ".repeat(Math.max(0, game.lives)).trim() || "—";
  $("speed").textContent = String(Math.round(game.speed)).padStart(2, "0");
  $("speedBar").style.width = (game.speed / 80) * 100 + "%";
  $("hint").textContent =
    game.status === "crashed"
      ? {
          water: "SPLASH! Those turtles never signed a reliability agreement.",
          lava: "TOASTY! Jump beneath Dooky Bird before the lava.",
          cliff: "More speed! Reach 75+ and jump right at the edge.",
          hole: "Mind the gap. Jump a little later.",
          branch: "BONK! Hold ↓ beneath low branches.",
          stalactite: "BONK! Duck beneath the stalactites.",
        }[game.reason] || "BONK! One tire down. Let’s try that again."
      : s.hint;
  $("progressFill").style.width =
    ((game.stage + Math.min(1, game.x / s.length)) / STAGES.length) * 100 + "%";
  $("assisted").hidden = !game.assisted;
  $("stageToast").hidden =
    title || stageTimer <= 0 || game.status !== "playing";
  $("chapterNumber").textContent =
    `CHAPTER ${String(game.stage + 1).padStart(2, "0")} / 09`;
  $("chapterName").textContent = s.name;
  const practicePaused = game.status === "paused" && game.assisted;
  $("practiceResume").hidden = !practicePaused || !!document.querySelector("dialog[open]");
  const overlay = ["paused", "gameover", "won"].includes(game.status) && !practicePaused;
  $("overlay").hidden = !overlay || !!document.querySelector("dialog[open]");
  if (overlay) {
    const won = game.status === "won",
      over = game.status === "gameover";
    $("overlayEyebrow").textContent = won
      ? "LOVE CONQUERS ALL. EVEN BAD TRANSPORT."
      : over
        ? "THAT’S PREHISTORY FOR YOU"
        : "TAKE A BREATHER";
    $("overlayTitle").textContent = won
      ? "Wheel done, Thor!"
      : over
        ? "Out of spare tires."
        : "Stone still.";
    $("overlayText").textContent = won
      ? `Sweetheart rescued! ${game.score} points. ${game.assisted ? "Practice run complete." : "A stone-age love story with a happy ending."}`
      : over
        ? `${game.score} points. The road to true love could use some maintenance.`
        : "Even prehistoric legs need a rest.";
    $("resumeBtn").textContent = won
      ? "ROLL AGAIN · HARDER →"
      : over
        ? "ONE MORE TRY →"
        : "KEEP ROLLING →";
    $("restartBtn").hidden = over;
  }
  $("runLabel").textContent = title
    ? "A COMIC CLASSIC, BACK ON ITS WHEEL"
    : game.assisted
      ? "PRACTICE · PERSONAL BEST DISABLED"
      : `ADVENTURE ${game.loop + 1} · PERSONAL BEST ${String(best).padStart(5, "0")}`;
  if (game.status === "won" && lastStatus !== "won" && !game.assisted) {
    best = Math.max(best, game.score);
    try {
      localStorage.setItem("bc-best", String(best));
    } catch {}
  }
  lastStatus = game.status;
}
let uiTime = 0;
function frame(now) {
  const elapsed = Math.min(0.05, (now - last) / 1000);
  last = now;
  const controls = input();
  accumulator += elapsed * timeScale;
  while (accumulator >= STEP) {
    game.tick(STEP, controls);
    accumulator -= STEP;
    if (game.status === "playing") stageTimer = Math.max(0, stageTimer - STEP);
  }
  for (const e of game.events) {
    audio.effect(e);
    if (e === "stage") stageTimer = 2.4;
  }
  game.events.length = 0;
  audio.update(game.time, game.status === "playing", game.speed);
  view?.render(game, now / 1000, { reduced: settings.reduced, hitboxes });
  uiTime += elapsed;
  if (uiTime > 0.08) {
    updateUI();
    uiTime = 0;
  }
  requestAnimationFrame(frame);
}
updateUI();
requestAnimationFrame(frame);
// Explicit testing/practice API. All mutation methods mark a run assisted.
window.bcQuest = {
  snapshot: () => game.snapshot(),
  selectStage: (i) => {
    game.practice(i);
    stageTimer = 2.4;
    updateUI();
  },
  resume: () => {
    if (game.status === "paused") {
      game.status = "playing";
      updateUI();
    }
  },
  pause: () => {
    if (game.status === "playing") game.status = "paused";
    updateUI();
  },
  step: (n = 1, controls = {}) => {
    game.assisted = true;
    const status = game.status;
    game.status = "playing";
    for (let i = 0; i < Math.min(10000, n); i++) game.tick(STEP, controls);
    if (game.status === "playing") game.status = status;
    updateUI();
    return game.snapshot();
  },
  version: "0.1.0",
};
