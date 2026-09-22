import './style.css';
import { Game, STEP } from './game.js';
import { Renderer } from './renderer.js';
import { Sound } from './audio.js';
const $ = id => document.getElementById(id), keys = new Set(), touch = new Set();
const sound = new Sound();
let game, view, accumulator = 0, last = 0, padWasPressed = false;
let settings = { smooth: true, sound: false, volume: 75 };
try { settings = { ...settings, ...JSON.parse(localStorage.getItem('bc-original-settings') || '{}') }; } catch {}
function save() { try { localStorage.setItem('bc-original-settings', JSON.stringify(settings)); } catch {} }
function apply() {
  sound.enabled = settings.sound; sound.effectsVolume = settings.volume / 100;
  $('smooth').checked = settings.smooth; $('volume').value = settings.volume;
  $('volumeValue').value = `${settings.volume}%`;
  $('sound').textContent = settings.sound ? 'Sound on' : 'Sound off';
  $('sound').setAttribute('aria-pressed', String(settings.sound));
  view?.render(settings.smooth); sound.update(); save();
}
function clearInput() { keys.clear(); touch.clear(); game?.clearInput(); document.querySelectorAll('.pressed').forEach(el => el.classList.remove('pressed')); }
function refresh() {
  if (!game) return;
  const playing = game.state === 'playing';
  $('notice').hidden = playing;
  $('noticeText').textContent = game.state === 'over' ? 'Game over — one more ride?' : game.state === 'ready' ? 'The original Stone Age adventure.' : 'Paused — ready when you are.';
  $('play').innerHTML = game.state === 'over' ? 'Try again <span>→</span>' : game.state === 'ready' ? 'Let’s roll <span>→</span>' : 'Continue <span>→</span>';
  $('pause').textContent = playing ? 'Pause' : game.state === 'over' ? 'Try again' : game.state === 'ready' ? 'Play' : 'Continue';
  $('status').textContent = playing ? 'Original C64 · Single player' : game.state === 'over' ? 'Game over · Enter to restart' : game.state === 'ready' ? 'Press Enter to play' : 'Paused';
  sound.running = playing; sound.update();
}
function play() { if (!game) return; clearInput(); accumulator = 0; game.start(); sound.unlock().catch(console.error); refresh(); }
function pause() { if (!game) return; game.pause(); clearInput(); refresh(); }
function togglePause() { if (game?.state === 'playing') pause(); else play(); }
function restart() { if (!game) return; pause(); game.reset(); view.render(settings.smooth); play(); }
async function fullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await $('cabinet').requestFullscreen(); } catch { $('status').textContent = 'Fullscreen is unavailable in this browser.'; } }
$('play').onclick = play; $('pause').onclick = togglePause; $('restart').onclick = restart; $('fullscreen').onclick = fullscreen;
$('sound').onclick = () => { settings.sound = !settings.sound; sound.unlock().catch(console.error); apply(); };
$('smooth').onchange = () => { settings.smooth = $('smooth').checked; apply(); };
$('volume').oninput = () => { settings.volume = Number($('volume').value); apply(); };
const mappings = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', ArrowDown: 'duck', KeyS: 'duck', ShiftLeft: 'speed', ShiftRight: 'speed' };
addEventListener('keydown', e => {
  if (e.target instanceof HTMLInputElement) return;
  if (mappings[e.code]) { e.preventDefault(); keys.add(e.code); }
  if (e.repeat) return;
  if (['Enter', 'KeyP', 'Escape', 'F1', 'KeyF', 'KeyM'].includes(e.code)) e.preventDefault();
  if (e.code === 'Enter') play();
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
  if (e.code === 'F1') restart();
  if (e.code === 'KeyF') fullscreen();
  if (e.code === 'KeyM') $('sound').click();
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', pause);
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
for (const b of document.querySelectorAll('[data-key]')) {
  b.onpointerdown = e => { e.preventDefault(); b.setPointerCapture(e.pointerId); touch.add(b.dataset.key); b.classList.add('pressed'); sound.unlock().catch(console.error); };
  const release = () => { touch.delete(b.dataset.key); b.classList.remove('pressed'); };
  b.onpointerup = b.onpointercancel = b.onlostpointercapture = release;
}
function controls() {
  const input = {};
  for (const k of keys) input[mappings[k]] = true;
  for (const k of touch) input[k] = true;
  if (input.slower) { input.left = true; input.speed = true; }
  if (input.faster) { input.right = true; input.speed = true; }
  const pad = [...(navigator.getGamepads?.() || [])].find(p => p?.connected);
  if (pad) {
    input.left ||= pad.axes[0] < -.3 || pad.buttons[14]?.pressed;
    input.right ||= pad.axes[0] > .3 || pad.buttons[15]?.pressed;
    input.jump ||= pad.buttons[0]?.pressed || pad.buttons[12]?.pressed;
    input.duck ||= pad.buttons[1]?.pressed || pad.buttons[13]?.pressed;
    input.speed ||= pad.buttons[4]?.pressed || pad.buttons[5]?.pressed;
    const pressed = !!pad.buttons[9]?.pressed;
    if (pressed && !padWasPressed) togglePause();
    padWasPressed = pressed;
  } else padWasPressed = false;
  return input;
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.08, (now - (last || now)) / 1000); last = now;
  const input = controls();
  if (game.state === 'playing' && !document.hidden) {
    accumulator += dt;
    while (accumulator >= STEP) { game.step(input); accumulator -= STEP; }
    view.render(settings.smooth);
    if (game.state !== 'playing') refresh();
  } else accumulator = 0;
}
async function init() {
  try {
    const [state, charset] = await Promise.all(['start.json', 'characters.bin'].map(async file => {
      const r = await fetch(`${import.meta.env.BASE_URL}data/${file}`); if (!r.ok) throw Error(`Could not load ${file}`);
      return file.endsWith('json') ? r.text() : r.arrayBuffer();
    }));
    game = new Game(state, { character: new Uint8Array(charset), audio: sound.attach });
    view = new Renderer($('scene'), game.pixels);
    apply(); refresh();
    for (const id of ['play', 'pause', 'restart']) $(id).disabled = false;
    window.bcQuest = { snapshot: () => game.snapshot(), pause, resume: play };
    requestAnimationFrame(frame);
  } catch (error) { console.error(error); $('noticeText').textContent = `Could not load the game: ${error.message}`; $('status').textContent = 'Please reload to try again.'; }
}
apply(); init();
