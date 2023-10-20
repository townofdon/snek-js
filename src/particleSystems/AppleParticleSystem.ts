import P5, { Element, Vector } from 'p5';
import { ParticleSystem } from "../particle-system";
import { Level } from '../types';
import { Easing } from '../easing';

export class AppleParticleSystem extends ParticleSystem {
    /** 
     * @param {P5} p5
     * @param {P5.Vector} origin
     */
    constructor(p5: P5, level: Level, origin: Vector, { spawnMod = 1, speedMod = 1, scaleMod = 1 } = {}) {
        const lifetime = 1000;
        const numParticles = 10 * spawnMod;
        const speed = 1 * speedMod;
        const speedVariance = 1.5 * speedMod;
        const scaleStart = .6 * scaleMod;
        const scaleEnd = 0.3 * scaleMod;
        const scaleVariance = 0.2 * scaleMod;
        const colorStart = level.colors.appleStroke;
        const colorEnd = level.colors.background;
        const easingFnc = Easing.outCubic;
        super({
            p5,
            origin,
            colorStart: p5.color(colorStart),
            colorEnd: p5.color(colorEnd),
            lifetime,
            numParticles,
            speed,
            speedVariance,
            scaleStart,
            scaleEnd,
            scaleVariance,
            easingFnc,
        });
    }
}