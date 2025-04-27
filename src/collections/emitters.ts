import P5, { Vector } from "p5";

import { IS_DEV } from "../constants";
import { Particles } from "./particles";
import { EmitterOptions } from "../types";

export const INITIAL_POOL_SIZE = 2000;
const ORIGIN_OFFSET_X = 0.33
const ORIGIN_OFFSET_Y = 0.28

const UINT8_MAX = 255;

export class Emitters {
  // GLOBAL
  private p5: P5;
  private particles: Particles;

  // EMITTER PROPERTIES
  private originX: Uint8Array;
  private originY: Uint8Array;
  private timeElapsed: Float32Array;
  private timeTillNextSpawn: Float32Array;
  private options: EmitterOptions[]

  // INTERNAL
  private free: Int8Array;
  private indices: Int16Array;
  private activeLength: number;
  private maxLength: number;

  constructor(p5: P5, particles: Particles) {
    this.p5 = p5;
    this.particles = particles;

    this.maxLength = INITIAL_POOL_SIZE;
    this.doubleSize();
    this.reset();
  }

  public reset = () => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      this.clearEmitter(i);
      this.free[i] = 1;
      this.indices[i] = -1;
    }
    this.activeLength = 0;
  }

  public getLength = (): number => this.activeLength;
  public getMaxLength = () => this.maxLength;

  public get length() {
    return this.activeLength;
  }

  public tick = (deltaTime: number) => {
    let index = 0;
    while (index < this.activeLength) {
      const i = this.indices[index];

      // `return` here was a mistake (should have been `continue`), but results in an interesting visual side-effect
      // of additional particle bursts cascading down the grid, so intentionally keeping
      if (i < 0) return;
      if (this.free[i]) return;

      if (this.options[i] && !this.options[i].loop && this.timeElapsed[i] >= this.options[i].lifetime) {
        // do not increment index, as indices will be shifted upon removal
        this.unallocate(i, index);
        return;
      }

      this.tickEmitter(i, deltaTime);
      index++;
    }
  }

  public add = (x: number, y: number, opt: EmitterOptions) => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        this.free[i] = 0;
        this.indices[this.activeLength] = i;
        this.activeLength++;
        this.addEmitter(i, x, y, opt);
        return i;
      }
    }
    // no free elements; add new one
    const i = this.free.length;
    this.doubleSize();
    this.free[i] = 0;
    this.indices[i] = i;
    this.activeLength++;
    this.addEmitter(i, x, y, opt);
    return i;
  }

  public remove = (index: number): void => {
    if (index < 0) return;
    if (index >= this.activeLength) return;
    this.validate();
    const found = this.indices[index];
    if (found < 0) return;
    this.unallocate(found, index);
  }

  public get = (index: number) => {
    if (index < 0) return;
    if (index >= this.activeLength) return;
    this.validate();
    const i = this.indices[index];
    if (i < 0) return;
    if (this.free[i]) return;
    if (!this.options[i]) return;
    return {
      originX: this.originX[i],
      originY: this.originY[i],
    };
  }

  private addEmitter = (i: number, x: number, y: number, opt: EmitterOptions) => {
    this.originX[i] = x;
    this.originY[i] = y;
    this.timeElapsed[i] = 0;
    this.timeTillNextSpawn[i] = 0;
    this.options[i] = opt;
    if (opt.spawnOverTime > 0) {
      if (opt.spawnDelay) {
        this.timeTillNextSpawn[i] = Math.random() * opt.spawnDelay;
      } else {
        this.timeTillNextSpawn[i] = opt.lifetime / opt.spawnOverTime;
      }
    }
    this.spawnBurst(i);
  }

  private clearEmitter = (i: number) => {
    this.originX[i] = 0;
    this.originY[i] = 0;
    this.timeElapsed[i] = 0;
    this.timeTillNextSpawn[i] = 0;
    this.options[i] = null;
  }

  private unallocate = (i: number, reportedIndex: number) => {
    if (i < 0) return;
    if (reportedIndex < 0) return;
    if (this.free[i]) return;
    this.free[i] = 1;
    this.clearEmitter(i);
    // find the matching index
    let found = -1;
    for (let index = 0; index < this.activeLength; index++) {
      if (this.indices[index] === i) {
        found = index;
        break;
      }
    }
    if (found !== reportedIndex) {
      if (IS_DEV) throw new Error(`[emitter::unallocate] indices did not match: reportedIndex=${reportedIndex},found=${found}`);
      return;
    }
    // shift indices left by 1 starting from `found`
    for (let index = found; index < this.activeLength - 1; index++) {
      this.indices[index] = this.indices[index + 1];
    }
    this.indices[this.activeLength - 1] = -1;
    this.activeLength--;
  }

  private spawnBurst = (i: number) => {
    if (i < 0) return;
    if (this.free[i]) return;
    if (this.originX[i] === UINT8_MAX) return;
    if (this.originY[i] === UINT8_MAX) return;
    if (!this.options[i]) return;
    for (let n = 0; n < this.options[i].burst; n++) {
      this.spawnParticle(this.originX[i], this.originY[i], this.options[i]);
    }
  }

  private tickEmitter = (i: number, deltaTime: number) => {
    if (i < 0) return;
    if (this.free[i]) return;
    if (this.originX[i] === UINT8_MAX) return;
    if (this.originY[i] === UINT8_MAX) return;
    if (!this.options[i]) return;
    if (this.options[i].lifetime <= 0) return;
    if (!this.options[i].loop && this.timeElapsed[i] >= this.options[i].lifetime) return;

    const iterationsPrev = Math.floor(this.timeElapsed[i] / this.options[i].lifetime);
    this.timeElapsed[i] += deltaTime;
    const iterationsCur = Math.floor(this.timeElapsed[i] / this.options[i].lifetime);

    if (this.options[i].spawnOverTime > 0) {
      this.timeTillNextSpawn[i] -= deltaTime;
      while (this.timeTillNextSpawn[i] <= 0) {
        this.spawnParticle(this.originX[i], this.originY[i], this.options[i]);
        this.timeTillNextSpawn[i] += this.options[i].lifetime / this.options[i].spawnOverTime;
      }
    }

    if (this.options[i].loop && iterationsCur !== iterationsPrev && deltaTime > 0) {
      this.spawnBurst(i);
    }
  }

  private spawnParticle = (x: number, y: number, options: EmitterOptions) => {
    const origin = (new Vector(x, y)).add(ORIGIN_OFFSET_X, ORIGIN_OFFSET_Y);
    const randomVector = (scale = 1) => {
      return P5.Vector.random2D().mult(scale);
    }
    const positionStart = origin.copy().add(randomVector(options.originOffset));
    const calcSpeed = Math.abs(options.speed + (this.p5.random(2) - 1) * options.speedVariance);
    const heading = options.speed > 0 ? randomVector(1).normalize() : Vector.sub(origin, positionStart).normalize();
    const positionEnd = positionStart.copy().add(heading.mult(calcSpeed));
    this.particles.spawn({
      originX: x,
      originY: y,
      positionStartX: positionStart.x,
      positionStartY: positionStart.y,
      positionEndX: positionEnd.x,
      positionEndY: positionEnd.y,
      scaleStart: Math.max(options.scaleStart + (this.p5.random(2) - 1) * options.scaleVariance, 0),
      scaleEnd: Math.max(options.scaleEnd + (this.p5.random(2) - 1) * options.scaleVariance, 0),
      lifetime: options.lifetime,
      orbit: options.orbit,
      gradientIndex: options.gradientIndex,
      easing: options.easingFnc,
    });
  }

  private doubleSize = () => {
    const originX = new Uint8Array(this.maxLength).fill(UINT8_MAX);
    const originY = new Uint8Array(this.maxLength).fill(UINT8_MAX);
    const timeElapsed = new Float32Array(this.maxLength).fill(0);
    const timeTillNextSpawn = new Float32Array(this.maxLength).fill(0);
    const options: EmitterOptions[] = new Array(this.maxLength).fill(0)
      // @ts-ignore
      .map(() => null)

    const indices = new Int16Array(this.maxLength).fill(-1);
    const free = new Int8Array(this.maxLength).fill(1);

    if (this.originX) {
      for (let i = 0; i < this.free.length; i++) {
        originX[i] = this.originX[i];
        originY[i] = this.originY[i];
        timeElapsed[i] = this.timeElapsed[i];
        timeTillNextSpawn[i] = this.timeTillNextSpawn[i];
        options[i] = this.options[i];

        indices[i] = this.indices[i];
        free[i] = this.free[i];
      }
    }

    this.originX = originX;
    this.originY = originY;
    this.timeElapsed = timeElapsed;
    this.timeTillNextSpawn = timeTillNextSpawn;
    this.options = options;

    this.indices = indices;
    this.free = free;

    this.maxLength = this.maxLength * 2;
  }

  private validate() {
    if (IS_DEV) {
      if (this.originX.length !== this.free.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},free.length=${this.free.length}`);
      if (this.originX.length !== this.indices.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},indices.length=${this.indices.length}`);
      if (this.originX.length !== this.originY.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},originY.length=${this.originY.length}`);
      if (this.originX.length !== this.timeElapsed.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},timeTillDeath.length=${this.timeElapsed.length}`);
      if (this.originX.length !== this.timeTillNextSpawn.length) throw new Error(`lengths diverged: originX.length=${this.originX.length},timeTillNextSpawn.length=${this.timeTillNextSpawn.length}`);
    }
  }
}
