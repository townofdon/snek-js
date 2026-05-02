import { ANIMATIONS, GRIDCOUNT_X, PREY_LIFETIME, PREY_MOVE_TIME_ANT, PREY_MOVE_TIME_GRASSHOPPER, PREY_MOVE_TIME_GRUB, PREY_MOVE_TIME_MOUSE } from "../constants";
import { AnimationData, ICollection, Image, PreyType } from "../types";
import { getCoordIndex2, getCoordX, getCoordY, getManhattanDistance, shouldBlinkExpiringPickup } from "../utils";
import { AStar, AStarSearchOptions } from "../astar/astar";

export const MAX_NUM_PREY = 10;

interface PreyConstructorArgs {
  astar: AStar,
  onLifetimeExpire?: (coord: number) => void
}

export class PreyList implements ICollection {
  private type: PreyType[] = [];
  private targetCoord: Int16Array = new Int16Array(MAX_NUM_PREY);
  private coord: Uint16Array = new Uint16Array(MAX_NUM_PREY);
  private prevCoord: Int16Array = new Int16Array(MAX_NUM_PREY);
  private seed: Float32Array = new Float32Array(MAX_NUM_PREY);
  private timeUntilNextMove: Float32Array = new Float32Array(MAX_NUM_PREY);
  private timeSinceLastMove: Float32Array = new Float32Array(MAX_NUM_PREY);
  private lifetime: Float32Array = new Float32Array(MAX_NUM_PREY);
  private elapsed: Float32Array = new Float32Array(MAX_NUM_PREY);
  private flipx: Uint8Array = new Uint8Array(MAX_NUM_PREY);

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
      this.targetCoord[i] = -1;
      this.coord[i] = 0;
      this.prevCoord[i] = -1;
      this.timeUntilNextMove[i] = 0;
      this.timeSinceLastMove[i] = Infinity;
      this.lifetime[i] = 0;
      this.elapsed[i] = 0;
      this.flipx[i] = 0;
      this.seed[i] = 0;
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
      this.timeSinceLastMove[i] += deltaTime;
      this.timeUntilNextMove[i] -= deltaTime;
      // handle prey movement
      if (this.timeUntilNextMove[i] <= 0) {
        const preyType = this.type[i];
        this.timeUntilNextMove[i] += this.moveTime(preyType);
        const searchOpts: AStarSearchOptions = {
          seed: this.seed[i],
          sightRange: this.sightRange(preyType),
          ignoreThreats: preyType === PreyType.Ant || preyType === PreyType.Grub,
          allowDiagonals: preyType !== PreyType.Ant,
          ignoreObstacles: preyType === PreyType.FieldMouse,
        } satisfies AStarSearchOptions;
        let solutionFound = false;
        if (this.targetCoord[i] >= 0 && this.targetCoord[i] !== this.coord[i]) {
          // seek target
          const px = getCoordX(this.coord[i]);
          const py = getCoordY(this.coord[i]);
          const tx = getCoordX(this.targetCoord[i]);
          const ty = getCoordY(this.targetCoord[i]);
          solutionFound = astar.search(px, py, tx, ty, searchOpts);
        } else {
          // flee to acquire a target
          solutionFound = astar.fleeFromCoord(this.coord[i], { ...searchOpts, sightRange: 99 });
        }
        if (solutionFound) {
          // move along astar solution path
          this.targetCoord[i] = astar.getFinalPathCoord();
          const coord = this.coord[i];
          this.coord[i] = astar.getNextPathCoord(this.coord[i]);
          if (preyType === PreyType.Grasshopper) {
            // move a second time
            this.coord[i] = astar.getNextPathCoord(this.coord[i]);
          }
          if (coord === this.coord[i] || this.coord[i] === this.targetCoord[i]) {
            this.targetCoord[i] = -1;
          } else {
            const dx = astar.getNextDirX(this.coord[i]);
            if (this.flipx[i] && dx > 0) {
              this.flipx[i] = 0;
            } else if (!this.flipx[i] && dx < 0) {
              this.flipx[i] = 1;
            }
          }
          didChange = coord !== this.coord[i];
          if (didChange) {
            this.prevCoord[i] = coord;
            this.timeSinceLastMove[i] = 0;
          }
        }
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

  public wasAt = (x: number, y: number, timeWindow: number): number => {
    return this.wasAtCoord(getCoordIndex2(x, y), timeWindow);
  }

  public wasAtCoord = (coord: number, timeWindow: number): number => {
    const idx = this.prevCoord.indexOf(coord);
    const exists = idx >= 0 && idx < this._length;
    if (!exists) {
      return -1;
    }
    if (this.timeSinceLastMove[idx] > timeWindow) {
      return -1;
    }
    return this.coord[idx];
  }

  public getClosestTraversalDistance = (x: number, y: number): number => {
    let min = Infinity;
    for (let i = 0; i < this._length; i++) {
      const coord = this.coord[i];
      const px = Math.floor(coord % GRIDCOUNT_X);
      const py = Math.floor(coord / GRIDCOUNT_X);
      const dist = getManhattanDistance(x, y, px, py);
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
    this.targetCoord[this._length] = -1;
    this.prevCoord[this._length] = -1;
    this.coord[this._length] = coord;
    this.timeUntilNextMove[this._length] = this.moveTime(preyType);
    this.timeSinceLastMove[this._length] = Infinity;
    this.lifetime[this._length] = PREY_LIFETIME;
    this.elapsed[this._length] = 0;
    this.flipx[this._length] = 0;
    this.seed[this._length] = Math.random() * 10000;
    this._length++;
    return true;
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
      this.targetCoord[i] = this.coord[i + 1];
      this.prevCoord[i] = this.coord[i + 1];
      this.timeUntilNextMove[i] = this.timeUntilNextMove[i + 1];
      this.timeSinceLastMove[i] = this.timeSinceLastMove[i + 1];
      this.lifetime[i] = this.lifetime[i + 1];
      this.elapsed[i] = this.elapsed[i + 1];
      this.flipx[i] = this.flipx[i + 1];
      this.seed[i] = this.seed[i + 1];
    }
    this.type[this._length - 1] = PreyType.None;
    this.coord[this._length - 1] = 0;
    this.targetCoord[this._length - 1] = -1;
    this.prevCoord[this._length - 1] = -1;
    this.timeUntilNextMove[this._length - 1] = 0;
    this.timeSinceLastMove[this._length - 1] = Infinity;
    this.lifetime[this._length - 1] = 0;
    this.elapsed[this._length - 1] = 0;
    this.flipx[this._length - 1] = 0;
    this.seed[this._length - 1] = 0;
    this._length--;
  }

  public getFlipX = (x: number, y: number): boolean => {
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    if (idx < 0) {
      return false;
    }
    return this.flipx[idx] > 0;
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

  private moveTime = (preyType: PreyType) => {
    switch (preyType) {
      case PreyType.Grub:
        return PREY_MOVE_TIME_GRUB;
      case PreyType.FieldMouse:
        return PREY_MOVE_TIME_MOUSE;
      case PreyType.Ant:
        return PREY_MOVE_TIME_ANT;
      case PreyType.Grasshopper:
        return PREY_MOVE_TIME_GRASSHOPPER;
      case PreyType.None:
      default:
        return 20;
    }
  }

  private sightRange = (preyType: PreyType) => {
    switch (preyType) {
      case PreyType.Grub:
        return 0;
      case PreyType.FieldMouse:
        return 10;
      case PreyType.Ant:
        return 0;
      case PreyType.Grasshopper:
        return 10;
      case PreyType.None:
      default:
        return 20;
    }
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
