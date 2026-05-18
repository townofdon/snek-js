import { Vector } from "p5";
import { ANIMATIONS, GRIDCOUNT_X,
GRIDCOUNT_Y, IS_DEV, 
IS_LOCALHOST} from "../constants";
import { getCoordIndex2, getCurrentFrame, getManhattanDistance, isNil, shouldBlinkExpiringPickup } from "../utils";
import { ICollection, IFlaggable, SpritesheetImage, SpritesheetRange } from "../types";

export const INITIAL_ANIMATIONS_POOL_SIZE = GRIDCOUNT_X * GRIDCOUNT_Y;

export enum RemovalReason {
  None = 0,
  LifetimeExpired,
  PickedUp,
  Explode,
}

interface AnimationListConstructorOptions {
  onLifetimeExpire?: (coord: number) => void
  onAdd?: (coord: number, type: number) => void
  onRemove?: (coord: number, reason: RemovalReason) => void
}

interface AddItemOptions {
  /**
   * Optional caller-provided flags to set per animation item.
   */
  flags?: number,
  /**
   * Whether animation is playing. Default=true
   *
   * When false, tick() does not increment elapsed time unless disabledImg is provided.
   */
  enabled?: boolean,
  /**
   * Optional image to use as a replacement when disabled. Otherwise, nothing will show.
   */
  disabledImg?: SpritesheetImage | SpritesheetRange,
}

// INTERNAL FLAGS
const FLAG_ENABLED = 1;
const DEFAULT_INTERNAL_FLAGS = 0 | FLAG_ENABLED;

/**
 * Non-allocating collection of animations.
 * Each property is maintained as a primitive array.
 * Indices and array length are maintained internally.
 * Prevents garbage collection and buffs CPU perf.
 * Simple-to-use interface.
 */
export class AnimationList implements ICollection, IFlaggable {
  private x: Uint8Array;
  private y: Uint8Array;
  private free: Uint8Array;
  private lifetime: Float32Array;
  private elapsed: Float32Array;
  private type: Uint8Array;
  private flags: Uint8Array;
  private internalFlags: Uint8Array;
  private img: Record<number, SpritesheetImage | SpritesheetRange>;
  private disabledImg: Record<number, SpritesheetImage | SpritesheetRange>;
  private activeLength: number;
  private maxLength: number;
  private coordMap: Record<number, boolean>;
  private numTimesDidChange: number;

  private onLifetimeExpire: (coord: number) => void = () => {};
  private onRemove: (coord: number, reason: RemovalReason) => void = () => {};
  private onAdd: (coord: number, type: number) => void = () => {};

  constructor(opts: AnimationListConstructorOptions = {}) {
    if (opts.onLifetimeExpire) {
      this.onLifetimeExpire = opts.onLifetimeExpire;
    }
    if (opts.onAdd) {
      this.onAdd = opts.onAdd;
    }
    if (opts.onRemove) {
      this.onRemove = opts.onRemove;
    }
    this.maxLength = INITIAL_ANIMATIONS_POOL_SIZE;
    this.x = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.y = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.free = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(1);
    this.lifetime = new Float32Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.elapsed = new Float32Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.type = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.flags = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.internalFlags = new Uint8Array(INITIAL_ANIMATIONS_POOL_SIZE).fill(0);
    this.activeLength = 0;
    this.coordMap = {};
    this.img = {};
    this.disabledImg = {};
    this.numTimesDidChange = 0;
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
      this.img[i] = undefined;
      this.disabledImg[i] = undefined;
      this.type[i] = 0;
      this.flags[i] = 0;
      this.internalFlags[i] = 0;
    }
    this.activeLength = 0;
    this.numTimesDidChange = 0;
  };

  public fillFromMap = (map: Record<number, boolean>, lifetime: number, img: SpritesheetImage | SpritesheetRange) => {
    this.reset();
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (map[coord]) {
          this.add(x, y, lifetime, img);
        }
      }
    }
  };

  public getLength = () => this.activeLength;
  public getMaxLength = () => this.maxLength;
  public getNumTimesDidChange = () => this.numTimesDidChange;

  public get length() {
    return this.activeLength;
  }

  /**
   * forEach iterator. Use only for tests.
   */
  public forEach(iteratee: (coord: number) => void) {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        const coord = getCoordIndex2(this.x[i], this.y[i]);
        iteratee(coord);
      }
    }
  }

  /**
   * Tick animations. Returns `true` if any animation frame just changed.
   */
  public tick = (deltaTime: number): boolean => {
    let didChange = false;
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        continue;
      }
      const enabled = this._hasInternalFlag(i, FLAG_ENABLED);
      const shouldTick = enabled || !!this.disabledImg[i];
      const prevElapsed = this.elapsed[i];
      if (shouldTick) {
        this.elapsed[i] += deltaTime;
      }
      const sprite = enabled ? this.img[i] : this.disabledImg[i] || this.img[i];
      const framePrev = getCurrentFrame(sprite, prevElapsed);
      const frameCurrent = getCurrentFrame(sprite, this.elapsed[i]);
      if (prevElapsed === 0 || framePrev !== frameCurrent) {
        didChange = true;
      }
      if (shouldBlinkExpiringPickup(this.lifetime[i] - prevElapsed) !== shouldBlinkExpiringPickup(this.lifetime[i] - this.elapsed[i])) {
        didChange = true;
      }
      if (this.elapsed[i] >= this.lifetime[i] || !this.lifetime[i]) {
        const x = this.x[i];
        const y = this.y[i];
        const coord = getCoordIndex2(x, y);
        this.onLifetimeExpire(coord);
        this.removeByIndex(i, RemovalReason.LifetimeExpired);
        didChange = true;
      }
    }
    if (didChange) {
      this.numTimesDidChange++;
    }
    return didChange;
  };

  public add = (
    x: number,
    y: number,
    lifetime: number,
    img: SpritesheetImage | SpritesheetRange,
    type = 0,
    opts: AddItemOptions = {},
  ) => {
    const { disabledImg, enabled = true, flags = 0 } = opts;
    this.validate();
    if (!img) throw new Error(`invalid img value. val=${img}`);
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
        this.img[i] = img;
        this.disabledImg[i] = disabledImg || undefined;
        this.type[i] = type;
        this.flags[i] = flags;
        this.internalFlags[i] = DEFAULT_INTERNAL_FLAGS;
        this.recalculateLength();
        if (!enabled) {
          this._removeInternalFlag(i, FLAG_ENABLED);
        }
        this.onAdd(getCoordIndex2(x, y), type);
        return;
      }
    }
    // no free elements - this should never happen.
    if (IS_LOCALHOST) {
      throw new Error(
        `No more space left in AnimationList. length=${this.free.length},activeLength=${this.activeLength},new_idx=${this.free.length}`,
      );
    }
  };

  public restart = (x: number, y: number) => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        this.elapsed[i] = 0;
        break;
      }
    }
  };

  public removeByCoord = (coord: number, reason: RemovalReason) => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    this.remove(x, y, reason);
  };

  public remove = (x: number, y: number, reason: RemovalReason) => {
    this.validate();
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) {
        continue;
      }
      if (this.x[i] === x && this.y[i] === y) {
        this.removeByIndex(i, reason);
        return;
      }
    }

    // item not found
    if (IS_LOCALHOST) {
      console.warn(
        `[AnimationList] remove() could not find matching item for x=${x},y=${y}`,
      );
    }
  };

  private removeByIndex = (i: number, reason: RemovalReason) => {
    this.validate();
    if (this.free[i]) {
      return;
    }
    const coord = getCoordIndex2(this.x[i], this.y[i]);
    this.coordMap[coord] = false;
    this.x[i] = 0;
    this.y[i] = 0;
    this.free[i] = 1;
    this.elapsed[i] = 0;
    this.lifetime[i] = 0;
    this.img[i] = undefined;
    this.disabledImg[i] = undefined;
    this.type[i] = 0;
    this.flags[i] = 0;
    this.internalFlags[i] = 0;
    this.recalculateLength();
    this.onRemove(coord, reason);
    return;
  };

  public existsAtVec = (vec: Vector): boolean => {
    return this.existsAt(vec.x, vec.y);
  };

  public existsAtCoord = (coord: number, type?: number): boolean => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    return this.existsAt(x, y, type);
  };

  public existsAt = (x: number, y: number, type?: number): boolean => {
    const exists = this.coordMap[getCoordIndex2(x, y)] || false;
    if (isNil(type)) {
      return exists;
    }
    return exists && type === this.getType(x, y);
  };

  public enabledAt = (x: number, y: number): boolean => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return this._hasInternalFlag(i, FLAG_ENABLED);
      }
    }
    return false;
  };

  public enable = (x: number, y: number): void => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        if (this._hasInternalFlag(i, FLAG_ENABLED)) return;
        this._addInternalFlag(i, FLAG_ENABLED);
        this.elapsed[i] = 0;
        return;
      }
    }
  };

  public disable = (x: number, y: number): void => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        if (!this._hasInternalFlag(i, FLAG_ENABLED)) return;
        this._removeInternalFlag(i, FLAG_ENABLED);
        this.elapsed[i] = 0;
      }
    }
  };

  public getElapsedByVec = (vec: Vector): number => {
    return this.getElapsed(vec.x, vec.y);
  };

  public getElapsedByCoord = (coord: number): number => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    return this.getElapsed(x, y);
  };

  public getElapsed = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return this.elapsed[i];
      }
    }
    return -1;
  };

  public getFrame = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        const enabled = this._hasInternalFlag(i, FLAG_ENABLED);
        const sprite = enabled ? this.img[i] : this.disabledImg[i] || this.img[i];
        const frame = getCurrentFrame(sprite, this.elapsed[i]);
        return frame;
      }
    }
    return -1;
  };

  public getLifetime = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return this.lifetime[i];
      }
    }
    return -1;
  };

  public setLifetimeByCoord = (coord: number, lifetime: number) => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    this.setLifetime(x, y, lifetime);
  };

  public setLifetime = (x: number, y: number, lifetime: number) => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        this.lifetime[i] = lifetime;
        this.elapsed[i] = 0;
        break;
      }
    }
  };

  public getTimeRemaining = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return Math.max(this.lifetime[i] - this.elapsed[i], 0);
      }
    }
    return -1;
  };

  public getClosestTraversalDistance = (x: number, y: number): number => {
    this.validate();
    let min = Infinity;
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      const dist = getManhattanDistance(x, y, this.x[i], this.y[i]);
      if (dist < min) {
        min = dist;
      }
    }
    return min;
  };

  public getTypeByCoord = (coord: number): number => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    return this.getType(x, y);
  };

  public getType = (x: number, y: number): number => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return this.type[i];
      }
    }
    return -1;
  };

  public hasFlag = (x: number, y: number, flag: number): boolean => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        return !!(this.flags[i] & flag);
      }
    }
    return false;
  };

  public addFlag = (x: number, y: number, flag: number): void => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        this.flags[i] |= flag;
      }
    }
  };

  public removeFlag = (x: number, y: number, flag: number): void => {
    for (let i = 0; i < this.free.length; i++) {
      if (this.free[i]) continue;
      if (this.x[i] === x && this.y[i] === y) {
        this.flags[i] &= ~flag;
      }
    }
  };

  private _hasInternalFlag = (i: number, flag: number): boolean => {
    if (this.free[i]) return false;
    return !!(this.internalFlags[i] & flag);
  };

  private _addInternalFlag = (i: number, flag: number): void => {
    if (this.free[i]) return;
    this.internalFlags[i] |= flag;
  };

  private _removeInternalFlag = (i: number, flag: number): void => {
    if (this.free[i]) return;
    this.internalFlags[i] &= ~flag;
  };

  private recalculateLength = () => {
    this.validate();
    let numActive = 0;
    for (let i = 0; i < this.free.length; i++) {
      if (!this.free[i]) numActive++;
    }
    this.activeLength = numActive;
  };

  private validate() {
    if (IS_DEV && IS_LOCALHOST) {
      if (this.x.length !== this.y.length) throw new Error(`lengths diverged: x.length=${this.x.length},y.length=${this.y.length}`);
      if (this.x.length !== this.free.length) throw new Error(`lengths diverged: x.length=${this.x.length},free.length=${this.free.length}`);
      if (this.x.length !== this.lifetime.length) throw new Error(`lengths diverged: x.length=${this.x.length},lifetime.length=${this.lifetime.length}`);
      if (this.x.length !== this.elapsed.length) throw new Error(`lengths diverged: x.length=${this.x.length},elapsed.length=${this.elapsed.length}`);
    }
  }
}
