import P5 from "p5";

import { FontsInstance, IEnumerator, Scene, SceneCachedCallbacks, SceneCallbacks } from '../types';
import { Coroutines } from "../coroutines";
import { DIMENSIONS } from "../constants";


export interface BaseSceneProps {
  p5: P5
  gfx: P5.Graphics
  cachedCallbacks: SceneCachedCallbacks
  callbacks: SceneCallbacks
  coroutines: Coroutines
  fonts: FontsInstance
}

export abstract class BaseScene implements Scene {
  protected props: BaseSceneProps = {
    p5: null,
    gfx: null,
    cachedCallbacks: {
      draw: () => { },
      keyPressed: () => { },
    },
    callbacks: {
      onSceneEnded: () => { }
    },
    coroutines: null,
    fonts: null,
  };

  private _internalState = {
    isCleaningUp: false,
  }

  constructor(p5: P5, gfx: P5.Graphics, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    this.props.p5 = p5;
    this.props.gfx = gfx;
    this.props.fonts = fonts;
    this.props.callbacks = callbacks;
    this.props.cachedCallbacks.draw = p5.draw;
    this.props.cachedCallbacks.keyPressed = p5.keyPressed;
    this.props.coroutines = new Coroutines(p5);
  }

  /**
   * call in the last line of constructor after super()
   */
  protected bindActions = () => {
    const { p5 } = this.props;
    p5.draw = this.draw;
    p5.keyPressed = this.keyPressed;
    p5.keyIsPressed = false;
    this.stopAllCoroutines();
    this.startCoroutine(this.action());
  }

  /**
   * use this instead of bindActions, e.g. if you DON'T want to bind p5 functions.
   * 
   * note that this scene must be manually ticked by calling the `draw()` function.
   * 
   * make sure to call onSceneEnded callback afterwards :)
   */
  protected startActionsNoBind = () => {
    this.stopAllCoroutines();
    this.startCoroutine(this.action());
  }

  /**
   * declare some async action, and call this.cleanup() as last line
   */
  abstract action(): IEnumerator;

  cleanup = () => {
    if (this._internalState.isCleaningUp) return;
    this._internalState.isCleaningUp = true;
    const { p5, cachedCallbacks, callbacks } = this.props;
    const { draw, keyPressed } = cachedCallbacks;
    if (draw) p5.draw = draw;
    if (keyPressed) p5.keyPressed = keyPressed;
    this.stopAllCoroutines();
    if (callbacks.onSceneEnded) callbacks.onSceneEnded();
    this._internalState.isCleaningUp = false;
  }

  abstract keyPressed: () => void

  abstract draw: () => void

  /**
   * Call as the last line of draw()
   */
  protected tick = () => {
    if (this._internalState.isCleaningUp) return;
    this.tickCoroutines();
  }

  protected drawBackground = (color = '#000', gfx: P5 | P5.Graphics = this.props.p5) => {
    this.props.gfx.clear(0, 0, 0, 0);
    gfx.fill(color);
    gfx.stroke(color);
    gfx.strokeWeight(1);
    gfx.square(-1, -1, Math.max(DIMENSIONS.x, DIMENSIONS.y) + 2);
  }

  protected getPosition = (x: number, y: number): [number, number] => {
    const x1 = DIMENSIONS.x * x;
    const y1 = DIMENSIONS.y * y;
    return [x1, y1];
  }

  protected getRect = (x: number, y: number, width: number, height: number): [number, number, number, number] => {
    const x1 = DIMENSIONS.x * x - width / 2;
    const y1 = DIMENSIONS.y * y - height / 2;
    const x2 = width;
    const y2 = height;
    return [x1, y1, x2, y2];
  }

  private tickCoroutines = () => {
    this.props.coroutines.tick();
  }

  protected startCoroutine = (action: IEnumerator) => {
    return this.props.coroutines.start(action);
  }

  protected stopCoroutine = (id: string) => {
    this.props.coroutines.stop(id);
  }

  protected stopAllCoroutines = () => {
    this.props.coroutines.stopAll();
  }
}
