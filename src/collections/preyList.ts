import { ANIMATIONS, GRIDCOUNT_X,
GRIDCOUNT_Y, PREY_LIFETIME, PREY_MOVE_TIME } from "../constants";
import { AnimationData, ICollection, Image, PreyType } from "../types";
import { getCoordIndex2, getTraversalDistance, shouldBlinkExpiringPickup } from "../utils";
import { AStar } from "../astar/astar";

export const MAX_NUM_PREY = 10;

interface PreyConstructorArgs {
  astar: AStar,
  onLifetimeExpire?: (coord: number) => void
}

export class PreyList implements ICollection {
  private type: PreyType[] = [];
  private coord: Uint16Array = new Uint16Array(MAX_NUM_PREY);
  private seed: Uint16Array = new Uint16Array(MAX_NUM_PREY);
  private numMoves: Uint16Array = new Uint16Array(MAX_NUM_PREY);
  private timeUntilNextMove: Float32Array = new Float32Array(MAX_NUM_PREY);
  private lifetime: Float32Array = new Float32Array(MAX_NUM_PREY);
  private elapsed: Float32Array = new Float32Array(MAX_NUM_PREY);

  private _length: number = 0;

  private astar: AStar;
  private onLifetimeExpire: (coord: number) => void = () => {}

  constructor(args: PreyConstructorArgs) {
    if (args?.onLifetimeExpire) {
      this.onLifetimeExpire = args?.onLifetimeExpire;
    }
    this.astar = args.astar;
    this.reset();
  }

  public get length() {
    return this._length;
  }

  public reset() {
    for (let i = 0; i < MAX_NUM_PREY; i++) {
      this.type[i] = PreyType.None;
      this.coord[i] = 0;
      this.timeUntilNextMove[i] = 0;
      this.lifetime[i] = 0;
      this.elapsed[i] = 0;
      this.seed[i] = 0;
      this.numMoves[i] = 0;
    }
    this._length = 0;
  }

  /**
   * Tick animations. Returns `true` if any animation frame just changed.
   */
  public tick = (deltaTime: number): boolean => {
    const astar = this.astar;
    let didChange = false;
    for (let i = 0; i < this._length; i++) {
      const prevElapsed = this.elapsed[i];
      this.elapsed[i] += deltaTime;
      this.timeUntilNextMove[i] -= deltaTime;
      // handle prey movement
      if (this.timeUntilNextMove[i] <= 0) {
        this.timeUntilNextMove[i] = PREY_MOVE_TIME;
        const type = this.type[i];
        const farsighted = type >= PreyType.Cockroach;
        // avoid settling into a local minimum
        if (this.numMoves[i] % 10 === 0) {
          this.seed[i] = this.getSeed();
        }
        astar.fleeFromCoord(this.coord[i], this.seed[i], farsighted);
        this.coord[i] = astar.getNextPathCoord(this.coord[i]);
        if (type === PreyType.Grasshopper) {
          // move a second time
          this.coord[i] = astar.getNextPathCoord(this.coord[i]);
        }
        this.numMoves[i] += 1;
        didChange = true;
      };
      // determine did animation frame change
      const animationData = this.getAnimationDataFromPreyType(this.type[i]);
      const framePrev = Math.floor(prevElapsed / animationData.timePerFrame) % animationData.frames;
      const frameCurrent = Math.floor(this.elapsed[i] / animationData.timePerFrame) % animationData.frames;
      if (framePrev !== frameCurrent) {
        didChange = true;
      }
      if (shouldBlinkExpiringPickup(this.lifetime[i] - prevElapsed) !== shouldBlinkExpiringPickup(this.lifetime[i] - this.elapsed[i])) {
        didChange = true;
      }
      if (this.elapsed[i] > this.lifetime[i] || !this.lifetime[i]) {
        this.onLifetimeExpire(this.coord[i]);
        this.removeByIndex(i);
        didChange = true;
      }
    }
    return didChange;
  }

  public existsAt = (x: number, y: number): boolean => {
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    return idx >= 0 && idx < this._length;
  }

  public existsAtCoord = (coord: number): boolean => {
    const idx = this.coord.indexOf(coord);
    return idx >= 0 && idx < this._length;
  }

  public getClosestTraversalDistance = (x: number, y: number): number => {
    let min = Infinity;
    for (let i = 0; i < this._length; i++) {
      const coord = this.coord[i];
      const px = Math.floor(coord % GRIDCOUNT_X);
      const py = Math.floor(coord / GRIDCOUNT_X);
      const dist = getTraversalDistance(x, y, px, py);
      if (dist < min) {
        min = dist;
      }
    }
    return min;
  }

  public add = (x: number, y: number, preyType: PreyType): boolean => {
    const coord = getCoordIndex2(x, y);
    if (this.existsAt(x, y)) {
      return false;
    }
    if (this._length === MAX_NUM_PREY) {
      return false;
    }
    this.type[this._length] = preyType;
    this.coord[this._length] = coord;
    this.timeUntilNextMove[this._length] = PREY_MOVE_TIME;
    this.lifetime[this._length] = PREY_LIFETIME;
    this.elapsed[this._length] = 0;
    this.seed[this._length] = this.getSeed();
    this.numMoves[this._length] = 0;
    this._length++;
    return true;
  }

  private getSeed() {
    return Math.floor(Date.now() % 10000);
  }

  public removeByCoord = (coord: number) => {
    if (this._length === 0) return;
    const idx = this.coord.indexOf(coord);
    this.removeByIndex(idx);
  }

  public remove = (x: number, y: number) => {
    if (this._length === 0) return;
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    this.removeByIndex(idx);
  }

  private removeByIndex = (idx: number) => {
    if (idx < 0 || idx >= this._length || idx >= MAX_NUM_PREY) return;
    for (let i = idx; i < this._length - 1; i++) {
      this.type[i] = this.type[i + 1];
      this.coord[i] = this.coord[i + 1];
      this.timeUntilNextMove[i] = this.timeUntilNextMove[i + 1];
      this.lifetime[i] = this.lifetime[i + 1];
      this.elapsed[i] = this.elapsed[i + 1];
      this.seed[i] = this.seed[i + 1];
      this.numMoves[i] = this.numMoves[i + 1];
    }
    this.type[this._length - 1] = PreyType.None;
    this.coord[this._length - 1] = 0;
    this.timeUntilNextMove[this._length - 1] = 0;
    this.lifetime[this._length - 1] = 0;
    this.elapsed[this._length - 1] = 0;
    this.seed[this._length - 1] = 0;
    this.numMoves[this._length - 1] = 0;
    this._length--;
  }

  public getElapsed = (x: number, y: number): number => {
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    if (idx < 0) {
      return -1;
    }
    return this.elapsed[idx];
  }

  public getLifetime = (x: number, y: number): number => {
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    if (idx < 0) {
      return -1;
    }
    return this.lifetime[idx];
  }

  public getTimeRemaining = (x: number, y: number): number => {
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    if (idx < 0) {
      return -1;
    }
    return Math.max(this.lifetime[idx] - this.elapsed[idx], 0);
  }

  public getTypeByCoord = (coord: number) => {
    coord = Math.floor(coord);
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    return this.getType(x, y);
  }

  public getType = (x: number, y: number) => {
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    if (idx < 0) {
      return PreyType.None;
    }
    return this.type[idx];
  }


  private getAnimationDataFromPreyType(preyType: PreyType): AnimationData {
    switch (preyType) {
      case PreyType.FieldMouse:
        return ANIMATIONS[Image.ExplosionSheet];
      default:
        return ANIMATIONS[Image.FireSheet];
    }
  }
}
