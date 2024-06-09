import P5 from 'p5';

import { Emitters } from "../../collections/emitters";
import { Gradients } from '../../collections/gradients';
import { Level, EmitterOptions, ParticleSystem2 } from "../../types";
import { Easing } from '../../easing';

const DEFAULT_EMITTER_OPTIONS: EmitterOptions = {
  gradientIndex: 0,
  originOffset: 0,
  lifetime: 750,
  burst: 15,
  spawnOverTime: 0,
  speed: 0.1,
  speedVariance: 0.5,
  scaleStart: 0.6,
  scaleEnd: 0.3,
  scaleVariance: 0.2,
  orbit: 0,
  loop: false,
  easingFnc: Easing.outCubic,
};
const SPAWN_MOD = 0.3;
const SPEED_MOD = 1.5;
const SCALE_MOD = 0.5;

export class ImpactParticleSystem2 implements ParticleSystem2 {
  private p5: P5;
  private emitters: Emitters;
  private gradients: Gradients;

  opt1: EmitterOptions = {
    ...DEFAULT_EMITTER_OPTIONS,
  }

  opt2: EmitterOptions = {
    ...DEFAULT_EMITTER_OPTIONS,
    burst: DEFAULT_EMITTER_OPTIONS.burst * SPAWN_MOD,
    spawnOverTime: DEFAULT_EMITTER_OPTIONS.spawnOverTime * SPAWN_MOD,
    speed: DEFAULT_EMITTER_OPTIONS.speed * SPEED_MOD,
    speedVariance: DEFAULT_EMITTER_OPTIONS.speedVariance * SPEED_MOD,
    scaleStart: DEFAULT_EMITTER_OPTIONS.scaleStart * SCALE_MOD,
    scaleEnd: DEFAULT_EMITTER_OPTIONS.scaleEnd * SCALE_MOD,
    scaleVariance: DEFAULT_EMITTER_OPTIONS.scaleVariance * SCALE_MOD,
  }

  constructor(p5: P5, emitters: Emitters, gradients: Gradients) {
    this.p5 = p5;
    this.emitters = emitters;
    this.gradients = gradients;
  }

  public setColorsFromLevel = (level: Level) => {
    const colorStart = this.p5.color("#ddd");
    const colorEnd = this.p5.color(level.colors.background);
    const gradientIndex = this.gradients.add(colorStart, colorEnd, 20);
    this.opt1.gradientIndex = gradientIndex;
    this.opt2.gradientIndex = gradientIndex;
  }

  emit = (x: number, y: number) => {
    this.emitters.add(x, y, this.opt1);
    this.emitters.add(x, y, this.opt2);
  }
}
