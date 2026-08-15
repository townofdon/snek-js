import { SFXInstance, SoundVariants } from "../types";
import { loadSfxAudio, setSfxVolume } from '../engine/audio';
import { getRelativeDir } from '../utils';

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

  private sounds: SoundVariants = {
    acquireShield: null,
    acquireHealth: null,
    acquireEpicItem: null,
    acquireRareItem: null,
    acquireLegendaryItem: null,
    alarm: null,
    burn: null,
    death: null,
    doorOpen: null,
    doorOpenHuge: null,
    eat: null,
    electrocuteLoop: null,
    guitarRiff1: null,
    guitarRiff2: null,
    hurt1: null,
    hurt2: null,
    hurt3: null,
    hurtSave: null,
    invincibleLoop: null,
    moveStart: null,
    pickup: null,
    pickupInvincibility: null,
    rewindLoop: null,
    shieldSpawn: null,
    spawnPickup: null,
    stab: null,
    step1: null,
    step2: null,
    uiBlip: null,
    uiChip: null,
    uiChipLoop: null,
    uiConfirm: null,
    unlock: null,
    unlockAbility: null,
    warp: null,
    waterSplash: null,
    winGame: null,
    winLevel: null,
    xplode: null,
    xplode3: null,
    xplodeLong: null,
    xpound: null,
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
      this.sounds[sound].volume(volume);
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
      this.sounds[sound].loop(true);
      this.sounds[sound].stop();
      this.play(sound, volume);
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

  async load() {
    try {
      const relativeDir = getRelativeDir();
      // const loadSound = (soundFile: string) => new Howl({ src: [`${relativeDir}assets/sounds/${soundFile}`] });
      const loadSound = (soundFile: string) => loadSfxAudio({src: [`${relativeDir}assets/sounds/${soundFile}`] })
      this.sounds.acquireShield = await loadSound('acquire-shield.wav');
      this.sounds.acquireHealth = await loadSound('acquire-health.wav');
      this.sounds.acquireEpicItem = await loadSound('acquire-epic-item.wav');
      this.sounds.acquireRareItem = await loadSound('acquire-rare-item.wav');
      this.sounds.acquireLegendaryItem = await loadSound('acquire-legendary.wav');
      this.sounds.alarm = await loadSound('alarm.wav');
      this.sounds.burn = await loadSound('burn-loop.wav');
      this.sounds.death = await loadSound('death.wav');
      this.sounds.doorOpen = await loadSound('door-open.wav');
      this.sounds.doorOpenHuge = await loadSound('door-open-huge.wav');
      this.sounds.eat = await loadSound('eat.wav');
      this.sounds.electrocuteLoop = await loadSound('electrocute.wav');
      this.sounds.guitarRiff1 = await loadSound('guitar-riff-1.wav');
      this.sounds.guitarRiff2 = await loadSound('guitar-riff-2.wav');
      this.sounds.hurt1 = await loadSound('hurt-1.wav');
      this.sounds.hurt2 = await loadSound('hurt-2.wav');
      this.sounds.hurt3 = await loadSound('hurt-3.wav');
      this.sounds.hurtSave = await loadSound('hurt-save.wav');
      this.sounds.invincibleLoop = await loadSound('invincible-loop.wav');
      this.sounds.moveStart = await loadSound('move-start.wav');
      this.sounds.pickup = await loadSound('pickup.wav');
      this.sounds.pickupInvincibility = await loadSound('pickup-invincibility.wav');
      this.sounds.rewindLoop = await loadSound('rewind-loop.wav');
      this.sounds.shieldSpawn = await loadSound('shield-spawn.wav');
      this.sounds.spawnPickup = await loadSound('spawn-pickup.wav');
      this.sounds.stab = await loadSound('stab.wav');
      this.sounds.step1 = await loadSound('step-1.wav');
      this.sounds.step2 = await loadSound('step-2.wav');
      this.sounds.uiBlip = await loadSound('ui-blip.wav');
      this.sounds.uiChip = await loadSound('ui-chip.wav');
      this.sounds.uiChipLoop = await loadSound('ui-chip-loop.wav');
      this.sounds.uiConfirm = await loadSound('ui-confirm.wav');
      this.sounds.unlock = await loadSound('unlock.wav');
      this.sounds.unlockAbility = await loadSound('unlock-ability.wav');
      this.sounds.warp = await loadSound('warp.wav');
      this.sounds.waterSplash = await loadSound('water-splash.wav');
      this.sounds.winLevel = await loadSound('winlevel.wav');
      this.sounds.winGame = await loadSound('wingame.wav');
      this.sounds.xplode = await loadSound('xplode.wav');
      this.sounds.xplode3 = await loadSound('xplode3.wav');
      this.sounds.xplodeLong = await loadSound('xplode-long.wav');
      this.sounds.xpound = await loadSound('xpound.wav');
    } catch (err) {
      console.error(err);
    }
  }
}
