import { ANIMATIONS, PREY_LIFETIME, PREY_MOVE_TIME } from "../constants";
import { AnimationData, Image, PreyType } from "../types";
import { getCoordIndex2, shouldBlinkExpiringPickup } from "../utils";
import { AStar } from "./astar";

const MAX_NUM_PREY = 10;

interface PreyConstructorArgs {
  astar: AStar,
  onLifetimeExpire?: (coord: number) => void
}

export class PreyList {
  private type: PreyType[] = [];
  private coord: Uint16Array = new Uint16Array(MAX_NUM_PREY);
  private timeUntilNextMove: Float32Array = new Float32Array(MAX_NUM_PREY);
  private lifetime: Float32Array = new Float32Array(MAX_NUM_PREY);
  private elapsed: Float32Array = new Float32Array(MAX_NUM_PREY);

  private length: number = 0;

  private astar: AStar;
  private onLifetimeExpire: (coord: number) => void = () => {}

  constructor(args: PreyConstructorArgs) {
    if (args?.onLifetimeExpire) {
      this.onLifetimeExpire = args?.onLifetimeExpire;
    }
    this.astar = args.astar;
    this.reset();
  }

  public reset() {
    for (let i = 0; i < MAX_NUM_PREY; i++) {
      this.type[i] = PreyType.None;
      this.coord[i] = 0;
      this.timeUntilNextMove[i] = 0;
      this.lifetime[i] = 0;
      this.elapsed[i] = 0;
    }
    this.length = 0;
  }

  /**
   * Tick animations. Returns `true` if any animation frame just changed.
   */
  public tick = (deltaTime: number): boolean => {
    const astar = this.astar;
    let didChange = false;
    for (let i = 0; i < this.length; i++) {
      const prevElapsed = this.elapsed[i];
      this.elapsed[i] += deltaTime;
      this.timeUntilNextMove[i] -= deltaTime;
      // handle prey movement
      if (this.timeUntilNextMove[i] <= 0) {
        this.timeUntilNextMove[i] = PREY_MOVE_TIME;
        astar.fleeFromCoord(this.coord[i]);
        this.coord[i] = astar.getNextPathCoord(this.coord[i]);
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
    return idx >= 0 && idx < this.length;
  }

  public existsAtCoord = (coord: number): boolean => {
    const idx = this.coord.indexOf(coord);
    return idx >= 0 && idx < this.length;
  }

  public add = (x: number, y: number, preyType: PreyType): boolean => {
    const coord = getCoordIndex2(x, y);
    if (this.existsAt(x, y)) {
      return false;
    }
    if (this.length === MAX_NUM_PREY) {
      return false;
    }
    this.type[this.length] = preyType;
    this.coord[this.length] = coord;
    this.timeUntilNextMove[this.length] = PREY_MOVE_TIME;
    this.lifetime[this.length] = PREY_LIFETIME;
    this.elapsed[this.length] = 0;
    this.length++;
    this.astar.randomizeWeights();
    return true;
  }

  public removeByCoord = (coord: number) => {
    if (this.length === 0) return;
    const idx = this.coord.indexOf(coord);
    this.removeByIndex(idx);
  }

  public remove = (x: number, y: number) => {
    if (this.length === 0) return;
    const coord = getCoordIndex2(x, y);
    const idx = this.coord.indexOf(coord);
    this.removeByIndex(idx);
  }

  private removeByIndex = (idx: number) => {
    if (idx < 0 || idx >= this.length || idx >= MAX_NUM_PREY) return;
    for (let i = idx; i < this.length - 1; i++) {
      this.type[i] = this.type[i + 1];
      this.coord[i] = this.coord[i + 1];
      this.timeUntilNextMove[i] = this.timeUntilNextMove[i + 1];
      this.lifetime[i] = this.lifetime[i + 1];
      this.elapsed[i] = this.elapsed[i + 1];
    }
    this.type[this.length - 1] = PreyType.None;
    this.coord[this.length - 1] = 0;
    this.timeUntilNextMove[this.length - 1] = 0;
    this.lifetime[this.length - 1] = 0;
    this.elapsed[this.length - 1] = 0;
    this.length--;
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


  private getAnimationDataFromPreyType(preyType: PreyType): AnimationData {
    switch (preyType) {
      case PreyType.FieldMouse:
        return ANIMATIONS[Image.ExplosionSheet];
      default:
        return ANIMATIONS[Image.FireSheet];
    }
  }
}
