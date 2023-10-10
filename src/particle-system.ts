
import P5, { Vector, Color } from 'p5';

import { clamp } from './utils';
import { BLOCK_SIZE } from './constants';

import { vecToString } from './utils';

interface ParticleConstructorArgs {
  positionStart: Vector
  positionEnd: Vector
  colorStart: Color
  colorEnd: Color
  scaleStart: number
  scaleEnd: number
  index: number
}

class Particle {
  _positionStart: Vector = null;
  _positionEnd: Vector = null;
  _colorStart: Color = null;
  _colorEnd: Color = null;
  _rotationStart = 0;
  _rotationEnd = 0;
  _scaleStart = 1;
  _scaleEnd = 1;
  _index = -1;

  constructor({
    positionStart,
    positionEnd,
    colorStart,
    colorEnd,
    scaleStart = 1,
    scaleEnd = 1,
    index,
  }: ParticleConstructorArgs) {
    if (index || index === 0) this._index = index;
    this._positionStart = positionStart;
    this._positionEnd = positionEnd;
    this._colorStart = colorStart;
    this._colorEnd = colorEnd;
    this._scaleStart = scaleStart;
    this._scaleEnd = scaleEnd;
  }

  draw(p5: P5, screenShake: any, normalizedTimeElapsed = 0) {
    if (!this._colorStart) return;
    if (!p5) return;
    const scale = p5.lerp(this._scaleStart, this._scaleEnd, normalizedTimeElapsed);
    const calcColor = p5.lerpColor(this._colorStart, this._colorEnd, clamp(normalizedTimeElapsed * 10 - 9, 0, 1));
    const position = Vector.lerp(this._positionStart, this._positionEnd, normalizedTimeElapsed);
    // const position = p5.createVector(
    //   p5.lerp(this._positionStart.x, this._positionEnd.x, normalizedTimeElapsed),
    //   p5.lerp(this._positionStart.y, this._positionEnd.y, normalizedTimeElapsed)
    // );
    const drawPosition = {
      x: position.x * BLOCK_SIZE.x + screenShake.offset.x,
      y: position.y * BLOCK_SIZE.y + screenShake.offset.y,
    }
    p5.fill(calcColor);
    p5.stroke(calcColor);
    p5.strokeWeight(0);
    p5.square(drawPosition.x, drawPosition.y, BLOCK_SIZE.x * scale);

    console.log(drawPosition.x, drawPosition.y, calcColor.toString())
  }
}

interface ParticleSystemConstructorArgs {
  p5: P5
  origin: Vector
  colorStart: Color
  colorEnd: Color
  easingFnc: any
  lifetime: number
  numParticles: number
  speed: number
  speedVariance: number
  scaleStart: number
  scaleEnd: number
  scaleVariance: number
}

export class ParticleSystem {
  _particles: Particle[] = [];
  _lifetime = 0;
  _timeElapsed = 0;
  _destroyed = false;
  _easingFnc;
  _p5: P5;

  constructor({ p5,
    origin,
    easingFnc,
    colorStart,
    colorEnd,
    lifetime = 1000,
    numParticles = 10,
    speed = 5,
    speedVariance = 0,
    scaleStart = 1,
    scaleEnd = scaleStart,
    scaleVariance = 0,
  }: ParticleSystemConstructorArgs) {
    if (origin == null) throw new Error("null origin passed to ParticleSystem constructor");
    this._destroyed = false;
    this._lifetime = lifetime;
    this._timeElapsed = 0;
    this._particles = [];
    this._easingFnc = easingFnc;

    const randomVector = (scale = 1) => {
      return p5.createVector((p5.random(2) - 1) * scale, (p5.random(2) - 1) * scale);
    }

    for (let i = 0; i < numParticles; i++) {
      const positionStart = origin.copy().add(randomVector(0.25));
      const heading = randomVector(1).normalize();
      const calcSpeed = Math.max(speed + (p5.random(2) - 1) * speedVariance, speed * 0.5);
      const particle = new Particle({
        colorStart,
        colorEnd,
        positionStart,
        positionEnd: positionStart.copy().add(heading.mult(calcSpeed * (lifetime / 1000))),
        scaleStart: Math.max(scaleStart + (p5.random(2) - 1) * scaleVariance, 0),
        scaleEnd: Math.max(scaleEnd + (p5.random(2) - 1) * scaleVariance, 0),
        index: i,
      });
      this._particles.push(particle);
    }
  }

  isActive() {
    return !this._destroyed && this._timeElapsed < this._lifetime;
  }

  tick(p5: P5) {
    if (this._destroyed) {
      return;
    }
    if (this._timeElapsed >= this._lifetime) {
      this._destroyed = true;
      return;
    }
    this._timeElapsed += p5.deltaTime;
  }

  draw(p5: P5, screenShake: any) {
    if (this._destroyed || !this._particles) {
      return;
    }
    let normalizedTimeElapsed = clamp(this._timeElapsed / this._lifetime);
    if (this._easingFnc) {
      normalizedTimeElapsed = this._easingFnc(normalizedTimeElapsed);
    }
    for (let i = 0; i < this._particles.length; i++) {
      this._particles[i].draw(p5, screenShake, normalizedTimeElapsed);
    }
  }
}
