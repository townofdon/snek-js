
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
  _origin: Vector = null;
  _positionStart: Vector = null;
  _positionEnd: Vector = null;
  _colorStart: Color = null;
  _colorEnd: Color = null;
  _rotationStart = 0;
  _rotationEnd = 0;
  _scaleStart = 1;
  _scaleEnd = 1;
  _birthtime = 0;
  _lifetime = 1000;
  _orbit = 0;
  _active = true;

  _radianStart = 0;
  _diffStartFromOrigin: Vector = null;

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
    this._origin = origin;
    this._positionStart = positionStart;
    this._positionEnd = positionEnd;
    this._colorStart = colorStart;
    this._colorEnd = colorEnd;
    this._scaleStart = scaleStart;
    this._scaleEnd = scaleEnd;
    this._birthtime = birthtime;
    this._lifetime = lifetime;
    this._orbit = orbit;

    if (orbit) {
      const diff = Vector.sub(positionStart, origin);
      this._diffStartFromOrigin = diff;
      this._radianStart = Math.atan2(diff.y, diff.x);
    }
  }

  draw = (p5: P5, screenShake: ScreenShakeState, timeElapsed = 0, easingFnc?: (x: number) => number) => {
    if (!this._colorStart) return;
    if (!p5) return;
    const normalizedTimeElapsed = Math.max((timeElapsed - this._birthtime) / this._lifetime, 0);
    if (normalizedTimeElapsed > 1) {
      this._active = false;
      return;
    }

    const t = easingFnc ? easingFnc(normalizedTimeElapsed) : normalizedTimeElapsed;
    const scale = p5.lerp(this._scaleStart, this._scaleEnd, t);
    const calcColor = p5.lerpColor(this._colorStart, this._colorEnd, clamp(t * 10 - 9, 0, 1));
    const position = Vector.lerp(this._positionStart, this._positionEnd, t);
    const magnitude = Vector.sub(position, this._origin).mag() * BLOCK_SIZE.x;

    const orbitOffset = this._orbit ? {
      x: (Math.cos(t * Math.PI + this._radianStart) - this._diffStartFromOrigin.x) * this._orbit * magnitude,
      y: (Math.sin(t * Math.PI + this._radianStart) - this._diffStartFromOrigin.y) * this._orbit * magnitude,
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
    return this._active;
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
  _particles: Particle[] = [];
  _lifetime = 0;
  _timeElapsed = 0;
  _timeTillNextSpawn = Infinity;
  _destroyed = false;
  _easingFnc?: (x: number) => number;
  _p5: P5;
  _zIndex = 0;
  _burst = 0;
  _spawnOverTime = 0;
  _spawnInterval = Infinity;
  _loop = false;
  _iterations = 0;

  props: Pick<ParticleSystemConstructorArgs, 'origin' | 'originOffset' | 'speed' | 'speedVariance' | 'lifetime' | 'scaleStart' | 'scaleEnd' | 'scaleVariance'> = {
    origin: null,
    originOffset: 0.25,
    scaleStart: 0,
    scaleEnd: 0,
    scaleVariance: 0,
    speed: 0,
    speedVariance: 0,
    lifetime: 0,
  }

  _particleArgs: Pick<ParticleConstructorArgs, 'colorStart' | 'colorEnd' | 'orbit' | 'lifetime'> = {
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
    this._p5 = p5;
    this._loop = loop;
    this._destroyed = false;
    this._lifetime = lifetime;
    this._burst = burst;
    this._spawnOverTime = spawnOverTime;
    this._timeElapsed = 0;
    this._particles = [];
    this._easingFnc = easingFnc;
    this._zIndex = zIndex;
    this._particleArgs = {
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

    for (let i = 0; i < this._burst; i++) {
      this.spawnParticle();
    }

    if (this._spawnOverTime > 0) {
      this._spawnInterval = this._lifetime / this._spawnOverTime;
      this._timeTillNextSpawn = this._spawnInterval;
    }
  }

  isActive() {
    return !this._destroyed && (this._loop || this._timeElapsed < this._lifetime);
  }

  tick(p5: P5) {
    if (this._destroyed) {
      return;
    }
    if (!this._loop && this._timeElapsed >= this._lifetime) {
      this._destroyed = true;
      return;
    }
    this._timeElapsed += p5.deltaTime;
    if (this._spawnOverTime > 0) {
      this._timeTillNextSpawn -= p5.deltaTime;
      while (this._timeTillNextSpawn <= 0) {
        this.spawnParticle();
        this._timeTillNextSpawn += this._spawnInterval;
      }
    }
    const prevIterations = this._iterations;
    this._iterations = Math.floor(this._timeElapsed / this._lifetime);
    if (this._iterations !== prevIterations) {
      for (let i = 0; i < this._burst; i++) {
        this.spawnParticle();
      }
    }
  }

  spawnParticle = () => {
    const { origin, originOffset, speed, speedVariance, scaleStart, scaleEnd, scaleVariance } = this.props;
    const p5 = this._p5;
    const randomVector = (scale = 1) => {
      // return p5.createVector((p5.random(2) - 1) * scale, (p5.random(2) - 1) * scale);
      return P5.Vector.random2D().mult(scale);
    }
    const positionStart = origin.copy().add(randomVector(originOffset));
    const calcSpeed = Math.abs(speed + (p5.random(2) - 1) * speedVariance);
    const heading = speed > 0 ? randomVector(1).normalize() : Vector.sub(origin, positionStart).normalize();
    const particle = new Particle({
      ...this._particleArgs,
      origin,
      positionStart,
      positionEnd: positionStart.copy().add(heading.mult(calcSpeed)),
      scaleStart: Math.max(scaleStart + (p5.random(2) - 1) * scaleVariance, 0),
      scaleEnd: Math.max(scaleEnd + (p5.random(2) - 1) * scaleVariance, 0),
      birthtime: this._timeElapsed,
    });
    this._particles.push(particle);
  }

  draw(p5: P5, screenShake: ScreenShakeState, zIndexPass = 0) {
    if (this._destroyed || !this._particles) {
      return;
    }
    if (this._zIndex != zIndexPass) return;
    const tempParticles: Particle[] = [];
    for (let i = 0; i < this._particles.length; i++) {
      if (!this._particles[i]?.isActive()) continue;
      this._particles[i].draw(p5, screenShake, this._timeElapsed, this._easingFnc);
      tempParticles.push(this._particles[i]);
    }
    this._particles = tempParticles;
  }
}
