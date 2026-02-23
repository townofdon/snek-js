import { Vector } from "p5";
import { GRIDCOUNT, IS_DEV } from "../constants";
import { getCoordIndex2, getTraversalDistance } from "../utils";

export const INITIAL_ANIMATIONS_POOL_SIZE = GRIDCOUNT.x * GRIDCOUNT.y;

/**
 * Non-allocating collection of animations.
 * Each property is maintained as a primitive array.
 * Indices and array length are maintained internally.
 * Prevents garbage collection and buffs CPU perf.
 * Simple-to-use interface.
 */
export class AnimationList {
  private x: Uint8Array;
  private y: Uint8Array;
  private free: Uint8Array;
  private lifetime: Float32Array;
  private elapsed: Float32Array;
  private frames: Uint8Array;
  private timePerFrame: Float32Array;
  private activeLength: number;
  private maxLength: number;
  private coordMap: Record<number, boolean>;


  constructor() {
    this.maxLength = INITIAL_ANIMATIONS_POOL_SIZE;
    this.x = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.y = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.free = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(1);
    this.lifetime = new Float32Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.elapsed = new Float32Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.frames = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(1);
    this.timePerFrame = new Float32Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.activeLength = 0;
    this.coordMap = {};
    this.reset();
  }

  public reset = () => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      this.x[i] = 0;
      this.y[i] = 0;
      this.free[i] = 1;
      this.elapsed[i] = 0;
      this.coordMap[i] = false;
      this.lifetime[i] = 0;
    }
    this.activeLength = 0;
  }

  public getLength = () => this.activeLength;
  public getMaxLength = () => this.maxLength;

  public get length() {
    return this.activeLength;
  }

  /**
   * Tick animations. Returns `true` if any animation frame just changed.
   */
  public tick = (deltaTime: number): boolean => {
    let didAnyFrameChange = false;
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        continue;
      }
      const prevElapsed = this.elapsed[i];
      this.elapsed[i] += deltaTime;
      const framePrev = Math.floor(prevElapsed / this.timePerFrame[i]) % this.frames[i];
      const frameCurrent = Math.floor(this.elapsed[i] / this.timePerFrame[i]) % this.frames[i];
      if (framePrev !== frameCurrent) {
        didAnyFrameChange = true;
      }
      if (this.elapsed[i] > this.lifetime[i] || !this.lifetime[i]) {
        this.removeByIndex(i);
        didAnyFrameChange = true;
      }
    }
    return didAnyFrameChange;
  }

  public add = (x: number, y: number, lifetime: number, frames: number, timePerFrame: number) => {
    this.validate();
    if (!frames) throw new Error(`invalid frames value. val=${frames}`)
    if (!timePerFrame) throw new Error(`invalid timePerFrame value. val=${timePerFrame}`)
    const coord = getCoordIndex2(x, y);
    if (this.existsAt(x, y)) {
      return;
    }
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        this.x[i] = x;
        this.y[i] = y;
        this.free[i] = 0;
        this.elapsed[i] = 0;
        this.coordMap[coord] = true;
        this.lifetime[i] = lifetime;
        this.frames[i] = frames;
        this.timePerFrame[i] = timePerFrame;
        this.recalculateLength();
        return;
      }
    }
    // no free elements; add one
    const i = this.free.length;
    this.doubleSize();
    this.x[i] = x;
    this.y[i] = y;
    this.free[i] = 0;
    this.elapsed[i] = 0;
    this.coordMap[coord] = true;
    this.lifetime[i] = lifetime;
    this.frames[i] = frames;
    this.timePerFrame[i] = timePerFrame;
    this.recalculateLength();
  }

  public removeByCoord = (coord: number) => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT.x);
    const y = Math.floor(coord / GRIDCOUNT.x);
    this.remove(x, y);
  }

  public remove = (x: number, y: number) => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        continue;
      }
      if (this.x[i] === x && this.y[i] === y) {
        this.removeByIndex(i);
        return;
      }
    }

    // apple not found
    if (IS_DEV) {
      console.warn(`removeApple could not find matching apple for x=${x},y=${y}`);
    }
  }

  private removeByIndex = (i: number) => {
    this.validate();
    if (this.free[i]) {
      return;
    }
    this.coordMap[getCoordIndex2(this.x[i], this.y[i])] = false;
    this.x[i] = 0;
    this.y[i] = 0;
    this.free[i] = 1;
    this.elapsed[i] = 0;
    this.lifetime[i] = 0;
    this.recalculateLength();
    return;
  }

  public existsAtVec = (vec: Vector): boolean => {
    return this.existsAt(vec.x, vec.y);
  }

  public existsAtCoord = (coord: number): boolean => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT.x);
    const y = Math.floor(coord / GRIDCOUNT.x);
    return this.existsAt(x, y);
  }

  public existsAt = (x: number, y: number): boolean => {
    return this.coordMap[getCoordIndex2(x, y)] || false;
  }

  public getElapsedByVec = (vec: Vector): number => {
    return this.getElapsed(vec.x, vec.y);
  }

  public getElapsedByCoord = (coord: number): number => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT.x);
    const y = Math.floor(coord / GRIDCOUNT.x);
    return this.getElapsed(x, y);
  }

  public getElapsed = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return this.elapsed[i];
      }
    }
    return -1;
  }

  public getLifetime = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return this.lifetime[i];
      }
    }
    return -1;
  }

  public getTimeRemaining = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return Math.max(this.lifetime[i] - this.elapsed[i], 0);
      }
    }
    return -1;
  }

  public getClosestTraversalDistance = (x: number, y: number): number => {
    this.validate();
    let min = Infinity;
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      const dist = getTraversalDistance(x, y, this.x[i], this.y[i]);
      if (dist < min) {
        min = dist;
      }
    }
    return min;
  }

  private recalculateLength = () => {
    this.validate();
    let numActive = 0;
    for (let i = 0; i < this.free.length; i++) {
      if (!this.free[i]) numActive++;
    }
    this.activeLength = numActive;
  }

  private doubleSize = () => {
    this.maxLength = this.maxLength * 2;
    const x = new Uint8Array(this.maxLength).fill(0);
    const y = new Uint8Array(this.maxLength).fill(0);
    const free = new Uint8Array(this.maxLength).fill(1);
    const lifetime = new Float32Array(this.maxLength).fill(0);
    const elapsed = new Float32Array(this.maxLength).fill(0);
    const frames = new Uint8Array(this.maxLength).fill(1);
    const timePerFrame = new Float32Array(this.maxLength).fill(0);

    for (let i = 0; i < this.free.length; i++) {
      x[i] = this.x[i];
      y[i] = this.y[i];
      free[i] = this.free[i];
      lifetime[i] = this.lifetime[i];
      elapsed[i] = this.elapsed[i];
      frames[i] = this.frames[i];
      timePerFrame[i] = this.timePerFrame[i];
    }
    this.x = x;
    this.y = y;
    this.free = free;
    this.lifetime = lifetime;
    this.elapsed = elapsed;
    this.frames = frames;
    this.timePerFrame = timePerFrame;
  }

  private validate() {
    if (IS_DEV) {
      if (this.x.length !== this.y.length) throw new Error(`lengths diverged: x.length=${this.x.length},y.length=${this.y.length}`);
      if (this.x.length !== this.free.length) throw new Error(`lengths diverged: x.length=${this.x.length},free.length=${this.free.length}`);
      if (this.x.length !== this.lifetime.length) throw new Error(`lengths diverged: x.length=${this.x.length},lifetime.length=${this.lifetime.length}`);
      if (this.x.length !== this.elapsed.length) throw new Error(`lengths diverged: x.length=${this.x.length},elapsed.length=${this.elapsed.length}`);
      if (this.x.length !== this.frames.length) throw new Error(`lengths diverged: x.length=${this.x.length},frames.length=${this.frames.length}`);
      if (this.x.length !== this.timePerFrame.length) throw new Error(`lengths diverged: x.length=${this.x.length},timePerFrame.length=${this.timePerFrame.length}`);
    }
  }
}
