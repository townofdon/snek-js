import P5, { Vector } from 'p5';
import { ParticleSystem } from "../particle-system";
import { Easing } from '../easing';
import Color from 'color';

export class PortalParticleSystem extends ParticleSystem {
  /**
   * @param {P5} p5
   * @param {P5.Vector} origin
   */
  constructor(p5: P5, origin: Vector, color: string) {
    const lifetime = 3500;
    super({
      p5,
      origin,
      originOffset: 0.3,
      colorStart: p5.color(color),
      colorEnd: p5.color("#000"),
      lifetime,
      burst: 0,
      spawnOverTime: 1,
      orbit: .1,
      speed: -0.1,
      speedVariance: .01,
      scaleStart: .15,
      scaleEnd: .08,
      scaleVariance: .04,
      easingFnc: Easing.inOutQuad,
      zIndex: 10,
      loop: true,
    });
  }
}

export class PortalVortexParticleSystem extends ParticleSystem {
  /**
   * @param {P5} p5
   * @param {P5.Vector} origin
   */
  constructor(p5: P5, origin: Vector, color: string) {
    const lifetime = 1000;
    super({
      p5,
      origin,
      originOffset: 1,
      colorStart: p5.color(Color(color).alpha(0.75).hexa()),
      colorEnd: p5.color("#000"),
      lifetime,
      burst: 5,
      spawnOverTime: 5,
      orbit: 0,
      speed: -1,
      speedVariance: .01,
      scaleStart: .1,
      scaleEnd: .2,
      scaleVariance: .02,
      easingFnc: Easing.linear,
      zIndex: 0,
      loop: true,
    });
  }
}
