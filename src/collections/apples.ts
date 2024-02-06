import { Vector } from "p5";
import { GRIDCOUNT, IS_DEV } from "../constants";
import { getCoordIndex2 } from "../utils";

const INITIAL_APPLE_POOL_SIZE = GRIDCOUNT.x * GRIDCOUNT.y;

/**
 * Non-allocating collection of apples.
 * Each property is maintained as a primitive array.
 * Indices and array length are maintained internally.
 * Prevents garbage collection and buffs CPU perf.
 * Simple-to-use interface.
 */
export class Apples {
  private x: number[];
  private y: number[];
  private free: boolean[];
  private activeLength: number;
  private coordMap: Record<number, boolean>;

  constructor() {
    this.x = new Array(INITIAL_APPLE_POOL_SIZE).fill(0);
    this.y = new Array(INITIAL_APPLE_POOL_SIZE).fill(0);
    this.free = new Array(INITIAL_APPLE_POOL_SIZE).fill(true);
    this.activeLength = 0;
    this.coordMap = {};
    this.reset();
  }

  public reset = () => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      this.x[i] = 0;
      this.y[i] = 0;
      this.free[i] = true;
      this.coordMap[i] = false;
    }
    this.activeLength = 0;
  }

  public getLength = () => this.activeLength;

  public add = (x: number, y: number) => {
    this.validate();
    const coord = getCoordIndex2(x, y);
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        this.x[i] = x;
        this.y[i] = y;
        this.free[i] = false;
        this.coordMap[coord] = true;
        this.recalculateLength();
        return;
      }
    }
    // no free elements; add one
    this.x.push(x);
    this.y.push(y);
    this.free.push(false);
    this.coordMap[coord] = true;
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
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        this.x[i] = 0;
        this.y[i] = 0;
        this.free[i] = true;
        this.coordMap[getCoordIndex2(x, y)] = this.internalExistsAt(x, y);
        this.recalculateLength();
        return;
      }
    }

    // apple not found
    if (IS_DEV) {
      console.warn(`removeApple could not find matching apple for x=${x},y=${y}`);
    }
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

  private internalExistsAt = (x: number, y: number): boolean => {
    for (let i = 0; i < this.free.length; i++) {
      if (!this.free[i] && this.x[i] === x && this.y[i] === y) {
        return true;
      }
    }
    return false;
  }

  private recalculateLength = () => {
    this.validate();
    let numActive = 0;
    for (let i = 0; i < this.free.length; i++) {
      if (!this.free[i]) numActive++;
    }
    this.activeLength = numActive;
  }

  private validate() {
    if (IS_DEV) {
      if (this.x.length !== this.y.length) throw new Error(`lengths diverged: x.length=${this.x.length},y.length=${this.y.length}`);
      if (this.x.length !== this.free.length) throw new Error(`lengths diverged: x.length=${this.x.length},free.length=${this.free.length}`);
    }
  }
}
