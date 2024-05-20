import { Howl } from 'howler';

import { SFXInstance, SoundVariants } from "./types";
import { setSfxVolume } from './audio';
import { getRelativeDir } from './utils';

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

  private globalVolume = 1;

  private sounds: SoundVariants = {
    death: null,
    doorOpen: null,
    doorOpenHuge: null,
    eat: null,
    hurt1: null,
    hurt2: null,
    hurt3: null,
    hurtSave: null,
    invincibleLoop: null,
    moveStart: null,
    pickup: null,
    pickupInvincibility: null,
    rewindLoop: null,
    step1: null,
    step2: null,
    uiBlip: null,
    uiChip: null,
    uiChipLoop: null,
    uiConfirm: null,
    unlock: null,
    unlockAbility: null,
    warp: null,
    winLevel: null,
    winGame: null,
    xplode: null,
    xplodeLong: null,
    xpound: null,
  }

  setGlobalVolume(volume: number) {
    this.globalVolume = volume;
    setSfxVolume(volume);
  }

  isPlaying(sound: keyof SoundVariants): boolean {
    if (!this.sounds[sound]) return false;
    return this.sounds[sound].playing();
  }

  play(sound: keyof SoundVariants, volume = 1) {
    try {
      if (!this.sounds[sound]) {
        console.warn(`Sound not loaded: ${sound}`);
        return;
      }
      this.sounds[sound].volume(volume * this.globalVolume);
      this.sounds[sound].stop();
      this.sounds[sound].play();
    } catch (err) {
      console.error(err);
    }
  }

  playLoop(sound: keyof SoundVariants, volume = 1) {
    try {
      if (!this.sounds[sound]) {
        console.warn(`Sound not loaded: ${sound}`);
        return;
      }
      this.play(sound, volume);
      this.sounds[sound].loop(true);
    } catch (err) {
      console.error(err);
    }
  }

  stop(sound: keyof SoundVariants) {
    if (!this.sounds[sound]) {
      console.warn(`Sound not loaded: ${sound}`);
      return;
    }
    this.sounds[sound].stop();
  }

  load() {
    try {
      const relativeDir = getRelativeDir();
      const loadSound = (soundFile: string) => new Howl({ src: [`${relativeDir}assets/sounds/${soundFile}`] });
      this.sounds.death = loadSound('death.wav');
      this.sounds.doorOpen = loadSound('door-open.wav');
      this.sounds.doorOpenHuge = loadSound('door-open-huge.wav');
      this.sounds.eat = loadSound('eat.wav');
      this.sounds.hurt1 = loadSound('hurt-1.wav');
      this.sounds.hurt2 = loadSound('hurt-2.wav');
      this.sounds.hurt3 = loadSound('hurt-3.wav');
      this.sounds.hurtSave = loadSound('hurt-save.wav');
      this.sounds.invincibleLoop = loadSound('invincible-loop.wav');
      this.sounds.moveStart = loadSound('move-start.wav');
      this.sounds.pickup = loadSound('pickup.wav');
      this.sounds.pickupInvincibility = loadSound('pickup-invincibility.wav');
      this.sounds.rewindLoop = loadSound('rewind-loop.wav');
      this.sounds.step1 = loadSound('step-1.wav');
      this.sounds.step2 = loadSound('step-2.wav');
      this.sounds.uiBlip = loadSound('ui-blip.wav');
      this.sounds.uiChip = loadSound('ui-chip.wav');
      this.sounds.uiChipLoop = loadSound('ui-chip-loop.wav');
      this.sounds.uiConfirm = loadSound('ui-confirm.wav');
      this.sounds.unlock = loadSound('unlock.wav');
      this.sounds.unlockAbility = loadSound('unlock-ability.wav');
      this.sounds.warp = loadSound('warp.wav');
      this.sounds.winLevel = loadSound('winlevel.wav');
      this.sounds.winGame = loadSound('wingame.wav');
      this.sounds.xplode = loadSound('xplode.wav');
      this.sounds.xplodeLong = loadSound('xplode-long.wav');
      this.sounds.xpound = loadSound('xpound.wav');
    } catch (err) {
      console.error(err);
    }
  }
}
