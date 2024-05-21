import P5, { Vector } from "p5";

import { BLOCK_SIZE, IS_DEV } from "../constants";
import { clamp, lerp } from "../utils";
import { Gradients } from "./gradients";
import { ScreenShakeState } from "../types";

export const INITIAL_POOL_SIZE = 10000;

export interface ParticleOptions {
  originX: number,
  originY: number,
  positionStartX: number,
  positionStartY: number,
  positionEndX: number,
  positionEndY: number,
  scaleStart: number,
  scaleEnd: number,
  birthtime: number,
  lifetime: number,
  orbit: number,
  gradientIndex: number,
  easing?: (val: number) => number,
}

interface DebugParticleOptions extends ParticleOptions {
  id: number,
  free: boolean,
}

const DEFAULT_OPTIONS: ParticleOptions = {
  originX: 29,
  originY: 29,
  positionStartX: 0,
  positionStartY: 0,
  positionEndX: 0,
  positionEndY: 0,
  scaleStart: 0,
  scaleEnd: 0,
  birthtime: 0,
  lifetime: 0,
  orbit: 0,
  gradientIndex: -1,
  easing: undefined,
}

export class Particles {
  // GLOBAL
  private p5: P5;
  private gradients: Gradients;
  private screenShake: ScreenShakeState;
  private timeElapsed: number = 0;

  // PROPERTIES
  private originX: Float32Array = new Float32Array(0);
  private originY: Float32Array = new Float32Array(0);
  private positionStartX: Float32Array = new Float32Array(0);
  private positionStartY: Float32Array = new Float32Array(0);
  private positionEndX: Float32Array = new Float32Array(0);
  private positionEndY: Float32Array = new Float32Array(0);

  private scaleStart: Float32Array = new Float32Array(0);
  private scaleEnd: Float32Array = new Float32Array(0);
  private birthtime: Float32Array = new Float32Array(0);
  private lifetime: Float32Array = new Float32Array(0);
  private orbit: Float32Array = new Float32Array(0);

  private gradientIndex: Uint8Array = new Uint8Array(0);
  private easing: (ParticleOptions['easing'])[] = [];

  // INTERNAL
  private free: Int8Array = new Int8Array;
  private indices: Int16Array = new Int16Array;
  private activeLength: number = 0;
  private maxLength: number;

  constructor(p5: P5, gradients: Gradients, screenShake: ScreenShakeState) {
    this.p5 = p5;
    this.gradients = gradients;
    this.screenShake = screenShake;
    this.maxLength = INITIAL_POOL_SIZE;
    this.doubleSize();
    this.validate();
    this.reset();
  }

  public reset = () => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      this.set(i, DEFAULT_OPTIONS);
      this.free[i] = 1;
      this.indices[i] = -1;
    }
    this.activeLength = 0;
    this.timeElapsed = 0;
  }

  public getLength = (): number => this.activeLength;
  public getMaxLength = () => this.maxLength;

  public get length() {
    return this.activeLength;
  }

  public get _internalLength() {
    return this.free.length;
  }

  public get _timeElapsed() {
    return this.timeElapsed;
  }

  public tick = (deltaTime: number) => {
    this.timeElapsed += deltaTime;
    let index = 0;
    while (index < this.indices.length) {
      const i = this.indices[index];
      if (i < 0) return;
      if (this.free[i]) return;

      if (this.timeElapsed > (this.birthtime[i] + this.lifetime[i])) {
        this.remove(index);
        // do not increment index, as removal will shift by one
        continue;
      }

      this.drawParticle(i);
      index++;
    }
  }

  public spawn = (options: Omit<ParticleOptions, 'birthtime'>): void => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        this.free[i] = 0;
        this.indices[this.activeLength] = i;
        this.activeLength++;
        this.set(i, options);
        return;
      }
    }
    // no free elements; add new one
    const i = this.free.length;
    this.doubleSize();
    this.free[i] = 0;
    this.indices[i] = i;
    this.activeLength++;
    this.set(i, options);
  }

  public get = (index: number): DebugParticleOptions | undefined => {
    if (index < 0) return;
    if (index >= this.activeLength) return;
    this.validate();
    const i = this.indices[index];
    if (i < 0) return;
    if (this.free[i]) return;
    return {
      id: i,
      free: !!this.free[i],
      originX: this.originX[i],
      originY: this.originY[i],
      positionStartX: this.positionStartX[i],
      positionStartY: this.positionStartY[i],
      positionEndX: this.positionEndX[i],
      positionEndY: this.positionEndY[i],
      scaleStart: this.scaleStart[i],
      scaleEnd: this.scaleEnd[i],
      birthtime: this.birthtime[i],
      lifetime: this.lifetime[i],
      orbit: this.orbit[i],
      gradientIndex: this.gradientIndex[i],
      easing: this.easing[i],
    };
  }

  private set = (i: number, options: Omit<ParticleOptions, 'birthtime'>) => {
    this.originX[i] = options.originX;
    this.originY[i] = options.originY;
    this.positionStartX[i] = options.positionStartX;
    this.positionStartY[i] = options.positionStartY;
    this.positionEndX[i] = options.positionEndX;
    this.positionEndY[i] = options.positionEndY;

    this.scaleStart[i] = options.scaleStart;
    this.scaleEnd[i] = options.scaleEnd;
    this.birthtime[i] = this.timeElapsed;
    this.lifetime[i] = options.lifetime;
    this.orbit[i] = options.orbit;

    this.gradientIndex[i] = options.gradientIndex;
    this.easing[i] = options.easing;
  }

  public remove = (index: number): void => {
    if (index < 0) return;
    this.validate();
    const found = this.indices[index];
    if (found < 0) return;
    this.free[found] = 1;
    this.set(found, DEFAULT_OPTIONS);
    // shift indices left by 1 starting from index
    for (let i = index; i < this.activeLength - 1; i++) {
      this.indices[i] = this.indices[i + 1];
    }
    this.indices[this.activeLength - 1] = -1;
    this.activeLength--;
  }

  private drawParticle = (i: number): void => {
    if (!this.lifetime[i]) return;
    const normalizedTimeElapsed = Math.max((this.timeElapsed - this.birthtime[i]) / this.lifetime[i], 0);
    const t = this.easing[i] ? this.easing[i](normalizedTimeElapsed) : normalizedTimeElapsed;
    const scale = lerp(this.scaleStart[i], this.scaleEnd[i], t);
    // const calcColor = p5.lerpColor(this.colorStart, this.colorEnd, clamp(t * 10 - 9, 0, 1));
    const color = this.gradients.calc(this.gradientIndex[i], clamp(t * 10 - 9, 0, 1));
    const origin = this.p5.createVector(this.originX[i], this.originY[i]);
    const positionStart = this.p5.createVector(this.positionStartX[i], this.positionStartY[i]);
    const positionEnd = this.p5.createVector(this.positionEndX[i], this.positionEndY[i]);
    const position = Vector.lerp(positionStart, positionEnd, t);

    const orbitOffset = this.getOrbitOffset(this.orbit[i], origin, positionStart, position, t);
    const x = position.x * BLOCK_SIZE.x + this.screenShake.offset.x + orbitOffset.x;
    const y = position.y * BLOCK_SIZE.y + this.screenShake.offset.y + orbitOffset.y;
    this.p5.fill(color);
    this.p5.stroke(color);
    this.p5.strokeWeight(0);
    this.p5.square(x, y, BLOCK_SIZE.x * scale);
  }

  private getOrbitOffset = (orbit: number, origin: Vector, positionStart: Vector, position: Vector, t: number): { x: number, y: number } => {
    if (!orbit) {
      return { x: 0, y: 0 };
    }
    const diff = Vector.sub(positionStart, origin);
    const diffStartFromOrigin = diff;
    const radianStart = Math.atan2(diff.y, diff.x);
    const magnitude = Vector.sub(position, origin).mag() * BLOCK_SIZE.x;
    const orbitOffset = {
      x: (Math.cos(t * Math.PI + radianStart) - diffStartFromOrigin.x) * orbit * magnitude,
      y: (Math.sin(t * Math.PI + radianStart) - diffStartFromOrigin.y) * orbit * magnitude,
    }
    return orbitOffset;
  }

  private doubleSize = () => {
    const originX = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.originX);
    const originY = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.originY);
    const positionStartX = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.positionStartX);
    const positionStartY = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.positionStartY);
    const positionEndX = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.positionEndX);
    const positionEndY = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.positionEndY);

    const scaleStart = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.scaleStart);
    const scaleEnd = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.scaleEnd);
    const birthtime = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.birthtime);
    const lifetime = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.lifetime);
    const orbit = new Float32Array(this.maxLength).fill(DEFAULT_OPTIONS.orbit);

    const gradientIndex = new Uint8Array(this.maxLength).fill(DEFAULT_OPTIONS.gradientIndex);
    const easing: ParticleOptions['easing'][] = new Array(this.maxLength).fill(0).map(() => DEFAULT_OPTIONS.easing);

    const indices = new Int16Array(this.maxLength).fill(-1);
    const free = new Int8Array(this.maxLength).fill(1);

    if (this.originX) {
      for (let i = 0; i < this.free.length; i++) {
        originX[i] = this.originX[i];
        originY[i] = this.originY[i];
        positionStartX[i] = this.positionStartX[i];
        positionStartY[i] = this.positionStartY[i];
        positionEndX[i] = this.positionEndX[i];
        positionEndY[i] = this.positionEndY[i];

        scaleStart[i] = this.scaleStart[i];
        scaleEnd[i] = this.scaleEnd[i];
        birthtime[i] = this.birthtime[i];
        lifetime[i] = this.lifetime[i];
        orbit[i] = this.orbit[i];

        gradientIndex[i] = this.gradientIndex[i];
        easing[i] = this.easing[i];

        indices[i] = this.indices[i];
        free[i] = this.free[i];
      }
    }

    this.originX = originX;
    this.originY = originY;
    this.positionStartX = positionStartX;
    this.positionStartY = positionStartY;
    this.positionEndX = positionEndX;
    this.positionEndY = positionEndY;

    this.scaleStart = scaleStart;
    this.scaleEnd = scaleEnd;
    this.birthtime = birthtime;
    this.lifetime = lifetime;
    this.orbit = orbit;

    this.gradientIndex = gradientIndex;
    this.easing = easing;

    this.indices = indices;
    this.free = free;

    this.maxLength = this.maxLength * 2;
  }

  private validate() {
    if (IS_DEV) {
      if (this.originX.length !== this.free.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},free.length=${this.free.length}`);
      if (this.originX.length !== this.indices.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},indices.length=${this.indices.length}`);
      if (this.originX.length !== this.originY.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},originY.length=${this.originY.length}`);
      if (this.originX.length !== this.positionStartX.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},positionStartX.length=${this.positionStartX.length}`);
      if (this.originX.length !== this.positionStartY.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},positionStartY.length=${this.positionStartY.length}`);
      if (this.originX.length !== this.positionEndX.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},positionEndX.length=${this.positionEndX.length}`);
      if (this.originX.length !== this.positionEndY.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},positionEndY.length=${this.positionEndY.length}`);
      if (this.originX.length !== this.scaleStart.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},scaleStart.length=${this.scaleStart.length}`);
      if (this.originX.length !== this.scaleEnd.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},scaleEnd.length=${this.scaleEnd.length}`);
      if (this.originX.length !== this.birthtime.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},birthtime.length=${this.birthtime.length}`);
      if (this.originX.length !== this.lifetime.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},lifetime.length=${this.lifetime.length}`);
      if (this.originX.length !== this.orbit.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},orbit.length=${this.orbit.length}`);
      if (this.originX.length !== this.gradientIndex.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},gradientIndex.length=${this.gradientIndex.length}`);
      if (this.originX.length !== this.easing.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},easing.length=${this.easing.length}`);
    }
  }
}
