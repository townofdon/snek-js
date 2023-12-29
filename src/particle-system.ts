
import P5, { Vector, Color } from 'p5';

import { clamp } from './utils';
import { BLOCK_SIZE } from './constants';
import { ScreenShakeState } from './types';

interface ParticleConstructorArgs {
  origin: Vector
  positionStart: Vector
  positionEnd: Vector
  colorStart: Color
  colorEnd: Color
  scaleStart: number
  scaleEnd: number
  birthtime: number
  lifetime: number
  orbit: number
}

class Particle {
  private origin: Vector = null;
  private positionStart: Vector = null;
  private positionEnd: Vector = null;
  private colorStart: Color = null;
  private colorEnd: Color = null;
  private scaleStart = 1;
  private scaleEnd = 1;
  private birthtime = 0;
  private lifetime = 1000;
  private orbit = 0;
  private active = true;

  private radianStart = 0;
  private diffStartFromOrigin: Vector = null;

  constructor({
    origin,
    positionStart,
    positionEnd,
    colorStart,
    colorEnd,
    scaleStart = 1,
    scaleEnd = 1,
    birthtime = 0,
    lifetime = 1000,
    orbit = 0,
  }: ParticleConstructorArgs) {
    this.origin = origin;
    this.positionStart = positionStart;
    this.positionEnd = positionEnd;
    this.colorStart = colorStart;
    this.colorEnd = colorEnd;
    this.scaleStart = scaleStart;
    this.scaleEnd = scaleEnd;
    this.birthtime = birthtime;
    this.lifetime = lifetime;
    this.orbit = orbit;

    if (orbit) {
      const diff = Vector.sub(positionStart, origin);
      this.diffStartFromOrigin = diff;
      this.radianStart = Math.atan2(diff.y, diff.x);
    }
  }

  draw = (p5: P5, screenShake: ScreenShakeState, timeElapsed = 0, easingFnc?: (x: number) => number) => {
    if (!this.colorStart) return;
    if (!p5) return;
    const normalizedTimeElapsed = Math.max((timeElapsed - this.birthtime) / this.lifetime, 0);
    if (normalizedTimeElapsed > 1) {
      this.active = false;
      return;
    }

    const t = easingFnc ? easingFnc(normalizedTimeElapsed) : normalizedTimeElapsed;
    const scale = p5.lerp(this.scaleStart, this.scaleEnd, t);
    const calcColor = p5.lerpColor(this.colorStart, this.colorEnd, clamp(t * 10 - 9, 0, 1));
    const position = Vector.lerp(this.positionStart, this.positionEnd, t);
    const magnitude = Vector.sub(position, this.origin).mag() * BLOCK_SIZE.x;

    const orbitOffset = this.orbit ? {
      x: (Math.cos(t * Math.PI + this.radianStart) - this.diffStartFromOrigin.x) * this.orbit * magnitude,
      y: (Math.sin(t * Math.PI + this.radianStart) - this.diffStartFromOrigin.y) * this.orbit * magnitude,
    } : { x: 0, y: 0 }

    const drawPosition = {
      x: position.x * BLOCK_SIZE.x + screenShake.offset.x + orbitOffset.x,
      y: position.y * BLOCK_SIZE.y + screenShake.offset.y + orbitOffset.y,
    }
    p5.fill(calcColor);
    p5.stroke(calcColor);
    p5.strokeWeight(0);
    p5.square(drawPosition.x, drawPosition.y, BLOCK_SIZE.x * scale);
  }

  isActive = () => {
    return this.active;
  }
}

interface ParticleSystemConstructorArgs {
  p5: P5
  origin: Vector
  originOffset?: number,
  colorStart: Color
  colorEnd: Color
  easingFnc?: (x: number) => number
  lifetime: number
  burst?: number
  spawnOverTime?: number
  speed: number
  speedVariance: number
  scaleStart: number
  scaleEnd: number
  scaleVariance: number
  zIndex?: number
  loop?: boolean
  orbit?: number
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private lifetime = 0;
  private timeElapsed = 0;
  private timeTillNextSpawn = Infinity;
  private destroyed = false;
  private easingFnc?: (x: number) => number;
  private p5: P5;
  private zIndex = 0;
  private burst = 0;
  private spawnOverTime = 0;
  private spawnInterval = Infinity;
  private loop = false;
  private iterations = 0;

  private props: Pick<ParticleSystemConstructorArgs, 'origin' | 'originOffset' | 'speed' | 'speedVariance' | 'lifetime' | 'scaleStart' | 'scaleEnd' | 'scaleVariance'> = {
    origin: null,
    originOffset: 0.25,
    scaleStart: 0,
    scaleEnd: 0,
    scaleVariance: 0,
    speed: 0,
    speedVariance: 0,
    lifetime: 0,
  }

  private particleArgs: Pick<ParticleConstructorArgs, 'colorStart' | 'colorEnd' | 'orbit' | 'lifetime'> = {
    colorStart: null,
    colorEnd: null,
    orbit: 0,
    lifetime: 1000,
  };

  constructor({
    p5,
    origin,
    originOffset = 0.25,
    easingFnc,
    colorStart,
    colorEnd,
    lifetime = 1000,
    burst = 0,
    orbit = 0,
    spawnOverTime = 0,
    speed = 5,
    speedVariance = 0,
    scaleStart = 1,
    scaleEnd = scaleStart,
    scaleVariance = 0,
    zIndex = 0,
    loop = false,
  }: ParticleSystemConstructorArgs) {
    if (origin == null) throw new Error("null origin passed to ParticleSystem constructor");
    if (lifetime <= 0) throw new Error("lifetime must be greater than zero");
    this.p5 = p5;
    this.loop = loop;
    this.destroyed = false;
    this.lifetime = lifetime;
    this.burst = burst;
    this.spawnOverTime = spawnOverTime;
    this.timeElapsed = 0;
    this.particles = [];
    this.easingFnc = easingFnc;
    this.zIndex = zIndex;
    this.particleArgs = {
      colorStart,
      colorEnd,
      orbit,
      lifetime,
    }
    this.props = {
      origin: origin.copy().add(p5.createVector(0.33, 0.28)),
      originOffset,
      scaleStart,
      scaleEnd,
      scaleVariance,
      speed,
      speedVariance,
      lifetime,
    }

    for (let i = 0; i < this.burst; i++) {
      this.spawnParticle();
    }

    if (this.spawnOverTime > 0) {
      this.spawnInterval = this.lifetime / this.spawnOverTime;
      this.timeTillNextSpawn = this.spawnInterval;
    }
  }

  isActive() {
    return !this.destroyed && (this.loop || this.timeElapsed < this.lifetime);
  }

  tick(p5: P5) {
    if (this.destroyed) {
      return;
    }
    if (!this.loop && this.timeElapsed >= this.lifetime) {
      this.destroyed = true;
      return;
    }
    this.timeElapsed += p5.deltaTime;
    if (this.spawnOverTime > 0) {
      this.timeTillNextSpawn -= p5.deltaTime;
      while (this.timeTillNextSpawn <= 0) {
        this.spawnParticle();
        this.timeTillNextSpawn += this.spawnInterval;
      }
    }
    const prevIterations = this.iterations;
    this.iterations = Math.floor(this.timeElapsed / this.lifetime);
    if (this.iterations !== prevIterations) {
      for (let i = 0; i < this.burst; i++) {
        this.spawnParticle();
      }
    }
  }

  spawnParticle = () => {
    const { origin, originOffset, speed, speedVariance, scaleStart, scaleEnd, scaleVariance } = this.props;
    const p5 = this.p5;
    const randomVector = (scale = 1) => {
      // return p5.createVector((p5.random(2) - 1) * scale, (p5.random(2) - 1) * scale);
      return P5.Vector.random2D().mult(scale);
    }
    const positionStart = origin.copy().add(randomVector(originOffset));
    const calcSpeed = Math.abs(speed + (p5.random(2) - 1) * speedVariance);
    const heading = speed > 0 ? randomVector(1).normalize() : Vector.sub(origin, positionStart).normalize();
    const particle = new Particle({
      ...this.particleArgs,
      origin,
      positionStart,
      positionEnd: positionStart.copy().add(heading.mult(calcSpeed)),
      scaleStart: Math.max(scaleStart + (p5.random(2) - 1) * scaleVariance, 0),
      scaleEnd: Math.max(scaleEnd + (p5.random(2) - 1) * scaleVariance, 0),
      birthtime: this.timeElapsed,
    });
    this.particles.push(particle);
  }

  draw(p5: P5, screenShake: ScreenShakeState, zIndexPass = 0) {
    if (this.destroyed || !this.particles) {
      return;
    }
    if (this.zIndex != zIndexPass) return;
    const tempParticles: Particle[] = [];
    for (let i = 0; i < this.particles.length; i++) {
      if (!this.particles[i]?.isActive()) continue;
      this.particles[i].draw(p5, screenShake, this.timeElapsed, this.easingFnc);
      tempParticles.push(this.particles[i]);
    }
    this.particles = tempParticles;
  }
}
