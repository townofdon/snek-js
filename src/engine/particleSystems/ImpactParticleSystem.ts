import P5, { Vector } from 'p5';

import { ParticleSystem } from "./particle-system";
import { Level } from '../../types';
import { Easing } from '../../easing';

export class ImpactParticleSystem extends ParticleSystem {
  /**
   * @param {P5} p5
   * @param {P5.Vector} origin
   */
  constructor(p5: P5, level: Level, origin: Vector, { spawnMod = 1, speedMod = 1, scaleMod = 1 } = {}) {
    const lifetime = 1500;
    const numParticles = 15 * spawnMod;
    const speed = 0.1 * speedMod;
    const speedVariance = 0.5 * speedMod;
    const scaleStart = .6 * scaleMod;
    const scaleEnd = 0.3 * scaleMod;
    const scaleVariance = 0.2 * scaleMod;
    const colorStart = "#ddd";
    const colorEnd = level.colors.background;
    const easingFnc = Easing.outCubic;
    super({
      p5,
      origin,
      colorStart: p5.color(colorStart),
      colorEnd: p5.color(colorEnd),
      lifetime,
      burst: numParticles,
      speed,
      speedVariance,
      scaleStart,
      scaleEnd,
      scaleVariance,
      easingFnc,
      zIndex: 10,
    });
  }
}