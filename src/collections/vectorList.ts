import { Vector } from "p5";

import { GRIDCOUNT, IS_DEV } from "../constants";
import { getCoordIndex2 } from "../utils";

export const INITIAL_POINTS_POOL_SIZE = GRIDCOUNT.x * GRIDCOUNT.y;

export class VectorList {
  private points: Vector[];
  private free: Uint8Array;
  private indices: Int16Array;
  private activeLength: number;
  private maxLength: number;
  private coordMap: Record<number, number>;

  constructor() {
    this.maxLength = INITIAL_POINTS_POOL_SIZE;
    this.points = new Array(INITIAL_POINTS_POOL_SIZE).fill(0).map(() => new Vector(0, 0));
    this.indices = new Int16Array(INITIAL_POINTS_POOL_SIZE).fill(-1);
    this.free = new Uint8Array(INITIAL_POINTS_POOL_SIZE).fill(1);
    this.activeLength = 0;
    this.coordMap = {};
    this.reset();
  }

  public reset = () => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      this.free[i] = 1;
      this.points[i].set(0, 0);
      this.coordMap[i] = -1;
      this.indices[i] = -1;
    }
    this.activeLength = 0;
  }

  public getLength = (): number => this.activeLength;
  public getMaxLength = () => this.maxLength;

  public get length() {
    return this.activeLength;
  }

  public add = (x: number, y: number): void => {
    this.validate();
    const coord = getCoordIndex2(x, y);
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        this.free[i] = 0;
        this.points[i].set(x, y);
        this.coordMap[coord] = i;
        this.indices[this.activeLength] = i;
        this.activeLength++;
        return;
      }
    }
    // no free elements; add new one
    const i = this.free.length;
    this.doubleSize();
    this.free[i] = 0;
    this.points[i] = new Vector(x, y);
    this.indices[i] = i;
    this.coordMap[coord] = i;
    this.activeLength++;
  }

  public addVec = (vec: Vector): void => {
    this.add(vec.x, vec.y);
  }

  public remove = (index: number): void => {
    if (index < 0) return;
    this.validate();
    const found = this.indices[index];
    if (found < 0) return;
    this.free[found] = 1;
    this.points[found].set(0, 0);
    // shift indices left by 1 starting from index
    for (let i = index; i < this.activeLength - 1; i++) {
      this.indices[i] = this.indices[i + 1];
    }
    this.indices[this.activeLength - 1] = -1;
    this.activeLength--;
    this.recalculateCoordMap();
  }

  public contains = (x: number, y: number): boolean => {
    return this.coordMap[getCoordIndex2(x, y)] >= 0;
  }

  public containsCoord = (coord: number): boolean => {
    return this.coordMap[coord] >= 0;
  }

  public find = (x: number, y: number): (Vector | undefined) => {
    return this.points[this.coordMap[getCoordIndex2(x, y)]] || undefined;
  }

  public get = (index: number): (Vector | undefined) => {
    if (index < 0) return undefined;
    const found = this.indices[index];
    if (found < 0) return undefined;
    return this.points[found] || undefined;
  }

  public set = (index: number, x: number, y: number) => {
    if (index < 0) return;
    const found = this.indices[index];
    if (found < 0) return;
    if (!this.points[found]) return;
    this.points[found].set(x, y);
    this.recalculateCoordMap();
  }

  public setVec = (index: number, vec: Vector | undefined) => {
    if (!vec) return;
    this.set(index, vec.x, vec.y);
  }

  public every = (predicate: (vec: Vector) => boolean) => {
    this.validate();
    for (let i = 0; i < this.indices.length; i++) {
      const found = this.indices[i];
      if (found < 0) break;
      if (!this.points[found]) continue;
      if (this.free[found]) continue;
      if (!predicate(this.points[found])) return false;
    }
    return true;
  }

  public some = (predicate: (vec: Vector) => boolean) => {
    this.validate();
    for (let i = 0; i < this.indices.length; i++) {
      const found = this.indices[i];
      if (found < 0) break;
      if (!this.points[found]) continue;
      if (this.free[found]) continue;
      if (predicate(this.points[found])) return true;
    }
    return false;
  }

  private recalculateCoordMap = () => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      this.coordMap[i] = -1;
    }
    for (let i = 0; i < this.indices.length; i++) {
      const found = this.indices[i];
      if (found < 0) break;
      if (!this.points[found]) continue;
      if (this.free[found]) continue;
      const coord = getCoordIndex2(this.points[found].x, this.points[found].y);
      this.coordMap[coord] = found;
    }
  }

  private doubleSize = () => {
    this.maxLength = this.maxLength * 2;
    const points = new Array(this.maxLength).fill(0).map(() => new Vector(0, 0));
    const indices = new Int16Array(this.maxLength).fill(-1);
    const free = new Uint8Array(this.maxLength).fill(1);
    for (let i = 0; i < this.free.length; i++) {
      points[i] = this.points[i];
      indices[i] = this.indices[i];
      free[i] = this.free[i];
    }
    this.points = points;
    this.indices = indices;
    this.free = free;
  }

  private validate() {
    if (IS_DEV) {
      if (this.points.length !== this.free.length) throw new Error(`lengths diverged: points.length=${this.points.length},free.length=${this.free.length}`);
      if (this.points.length !== this.indices.length) throw new Error(`lengths diverged: points.length=${this.points.length},indices.length=${this.indices.length}`);
    }
  }
}
