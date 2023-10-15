

import P5 from "p5"
import 'p5/lib/addons/p5.sound';
import { SFXInstance, SoundVariants } from "./types";

// @ts-ignore
window.p5 = P5

/**
 * Usage
 * 
 * ```
 * const sfx = new SFX(p5);
 * 
 * function preLoad() {
 *   sfx.load();
 * }
 * 
 * function onDamage() {
 *   sfx.playSound(Sound.hurt);
 * }
 * ```
 */
export class SFX implements SFXInstance {
  private _p5: P5;

  private sounds: SoundVariants = {
    death: null,
    doorOpen: null,
    eat: null,
    hurt1: null,
    hurt2: null,
    hurt3: null,
    moveStart: null,
    step1: null,
    step2: null,
    uiChip: null,
    uiConfirm: null,
  }

  constructor(p5: P5) {
    this._p5 = p5;
  }

  play(sound: keyof SoundVariants, volume = 1) {
    if (!this.sounds[sound]) {
      console.warn(`Sound not loaded: ${sound}`);
      return;
    }
    this.sounds[sound].setVolume(volume);
    this.sounds[sound].stop();
    this.sounds[sound].play();
  }

  stop(sound: keyof SoundVariants) {
    if (!this.sounds[sound]) {
      console.warn(`Sound not loaded: ${sound}`);
      return;
    }
    this.sounds[sound].stop();
  }

  load() {
    const p5 = this._p5;
    const loadSound = (soundFile: string) => p5.loadSound(`${window.location.pathname}src/assets/sounds/${soundFile}`);
    this.sounds.death = loadSound('death.wav');
    this.sounds.doorOpen = loadSound('door-open.wav');
    this.sounds.eat = loadSound('eat.wav');
    this.sounds.hurt1 = loadSound('hurt-1.wav');
    this.sounds.hurt2 = loadSound('hurt-2.wav');
    this.sounds.hurt3 = loadSound('hurt-3.wav');
    this.sounds.moveStart = loadSound('move-start.wav');
    this.sounds.step1 = loadSound('step-1.wav');
    this.sounds.step2 = loadSound('step-2.wav');
    this.sounds.uiChip = loadSound('ui-chip.wav');
    this.sounds.uiConfirm = loadSound('ui-confirm.wav');
  }
}
