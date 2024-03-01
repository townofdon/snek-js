import P5 from 'p5';
import { Level } from '../types';

import { Emitters } from "../collections/emitters";
import { Gradients } from '../collections/gradients';
import { EmitterOptions, ParticleSystem2 } from "../types";
import { Easing } from '../easing';

export class AppleParticleSystem2 implements ParticleSystem2 {
  private p5: P5;
  private emitters: Emitters;
  private gradients: Gradients;

  opt1: EmitterOptions = {
    gradientIndex: 0,
    originOffset: 0,
    lifetime: 500,
    burst: 10,
    spawnOverTime: 0,
    speed: 1,
    speedVariance: 1.5,
    scaleStart: 0.6,
    scaleEnd: 0.3,
    scaleVariance: 0.2,
    loop: false,
    orbit: 0,
    easingFnc: Easing.outCubic,
  }

  opt2: EmitterOptions = {
    gradientIndex: 0,
    originOffset: 0,
    lifetime: 500,
    burst: 3,
    spawnOverTime: 0,
    speed: .4,
    speedVariance: 0.6,
    scaleStart: 0.3,
    scaleEnd: 0.15,
    scaleVariance: 0.1,
    loop: false,
    orbit: 0,
    easingFnc: Easing.outCubic,
  }

  constructor(p5: P5, level: Level, emitters: Emitters, gradients: Gradients) {
    this.p5 = p5;
    this.emitters = emitters;
    this.gradients = gradients;
    this.setColorsFromLevel(level);
  }

  public setColorsFromLevel = (level: Level) => {
    const colorStart = this.p5.color(level.colors.appleStroke);
    const colorEnd = this.p5.color(level.colors.background);
    const gradientIndex = this.gradients.add(colorStart, colorEnd, 10);
    this.opt1.gradientIndex = gradientIndex;
    this.opt2.gradientIndex = gradientIndex;
  }

  emit = (x: number, y: number) => {
    this.emitters.add(x, y, this.opt1);
    this.emitters.add(x, y, this.opt2);
  }
}
