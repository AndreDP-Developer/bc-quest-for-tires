import {attach as wires} from './vendor/c64/target/wires.js';
import {attach as ram} from './vendor/c64/target/ram.js';
import {attach as vic} from './vendor/c64/target/vic.js';
import {attach as sid} from './vendor/c64/target/sid.js';
import {attach as cias} from './vendor/c64/target/cias.js';
import {attach as cpu} from './vendor/c64/target/cpu.js';
import {attach as tape} from './vendor/c64/target/tape.js';
import {bringup} from './vendor/c64/target/bringup.js';
// Start from a single-player gameplay checkpoint. BASIC and KERNAL are
// replaced by a minimal IRQ host; the C64 character font is supplied separately.
const basic=new Uint8Array(8192),kernal=new Uint8Array(8192),character=new Uint8Array(4096);
// IRQ register preservation and dispatch, plus no-key keyboard entry points.
const put=(address,bytes)=>kernal.set(bytes,address-0xe000);
put(0xff00,[0x48,0x8a,0x48,0x98,0x48,0x6c,0x14,0x03]);
put(0xea31,[0xad,0x0d,0xdc,0x4c,0x81,0xea]);
put(0xea81,[0x68,0xa8,0x68,0xaa,0x68,0x40]);
put(0xff9f,[0x60]);
put(0xffe4,[0xa9,0x00,0x60]);
put(0xfffa,[0x00,0xff,0x00,0xff,0x00,0xff]);
export function createMachine({pixel=()=>{},blit=()=>{},audio,roms}={}){
 let joy1=()=>{},joy2=()=>{},keys=()=>{};
 const c64=bringup({target:{wires,ram,vic,sid,cias,cpu,tape,basic:roms?.basic||basic,kernal:roms?.kernal||kernal,character:roms?.character||character},host:{
  video(c){c.video={reset(){},setPixel:pixel,blit};},
  audio:audio||((c)=>{c.audio={reset(){},setVoiceVolume(){},onRegWrite(){}};}),
  joystick(c){c.joystick={setSetJoystick1(fn){joy1=fn;},setSetJoystick2(fn){joy2=fn;}};},
  keyboard(c){c.keyboard={setSetKeyMatrix(fn){keys=fn;}};}
 },attachments:[]});
 c64.frame=()=>{const audioTick=c64.audio.tick;for(let j=0;j<19656;j++){c64.runloop.getState().cycle++;c64.cpu.tick();c64.vic.tick();c64.cias.tick();c64.sid.tick();c64.tape.tick();if(audioTick)audioTick();}c64.audio.endFrame?.();};
 c64.joy=(bits,port=2)=>(port===1?joy1:joy2)((~bits)&255);
 c64.keys=keys;
 return c64;
}
