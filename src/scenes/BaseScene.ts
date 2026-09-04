import P5 from "p5";

import { FontsInstance, IEnumerator, Scene, SceneCachedBindings, SceneCallbacks } from '../types';
import { Coroutines } from "../engine/coroutines";
import { DIMENSIONS, IS_LOCALHOST } from "../constants";


export interface BaseSceneProps {
  p5: P5
  gfx: P5.Graphics
  callbacks: SceneCallbacks
  coroutines: Coroutines
  fonts: FontsInstance
}

export abstract class BaseScene implements Scene {
  protected props: BaseSceneProps = {
    p5: null,
    gfx: null,
    callbacks: {
      onSceneStart: null,
      onSceneEnded: null,
    },
    coroutines: null,
    fonts: null,
  };

  private readonly cachedBindings: SceneCachedBindings;

  private _internalState = {
    isShowing: false,
  }

  constructor(p5: P5, gfx: P5.Graphics, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    this.props.p5 = p5;
    this.props.gfx = gfx;
    this.props.fonts = fonts;
    this.props.callbacks = callbacks;
    this.cachedBindings = {
      draw: p5.draw,
      keyPressed: p5.keyPressed,
    }
    this.props.coroutines = new Coroutines(p5);
  }

  public isShowing = () => this._internalState.isShowing;

  /**
   * call this to take over the P5 render loop and input handling.
   * e.g. in the last line of constructor after super()
   */
  protected bindActions = () => {
    if (IS_LOCALHOST && this.props.p5.draw === this.draw && this.keyPressed === this.keyPressed) {
      throw new Error('attempted to call bindActions when already bound.');
    }
    if (this.props.callbacks.onSceneStart) this.props.callbacks.onSceneStart();
    this._internalState.isShowing = true;
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
   * note that this scene must be manually ticked by calling the `tick()` function.
   * 
   * make sure to call onSceneEnded callback afterwards :)
   */
  protected startActionsNoBind = () => {
    if (this.props.callbacks.onSceneStart) this.props.callbacks.onSceneStart();
    this._internalState.isShowing = true;
    this.stopAllCoroutines();
    this.startCoroutine(this.action());
  }

  /**
   * declare some async action, and call this.cleanup() as last line
   */
  abstract action(): IEnumerator;

  cleanup = () => {
    const { p5, callbacks } = this.props;
    const { draw, keyPressed } = this.cachedBindings;
    if (draw) p5.draw = draw;
    if (keyPressed) p5.keyPressed = keyPressed;
    this.cachedBindings.keyPressed = null;
    this.cachedBindings.draw = null;
    this.stopAllCoroutines();
    if (callbacks.onSceneEnded) callbacks.onSceneEnded();
    this._internalState.isShowing = false;
  }

  abstract keyPressed: () => void

  abstract draw: () => void

  /**
   * Call as the last line of draw()
   */
  protected tick = () => {
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
    return [x1, y1, width, height];
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

  /**
   * Interpolate between an array of colors, where t[0-1] maps to [color0, color1, ... colorN]
   */
  protected getColor = (t: number, colors: readonly string[]) => {
    if (colors.length === 0) return "pink";
    const { p5 } = this.props;
    const c0 = Math.floor(t * colors.length) % colors.length;
    const c1 = (c0 + 1) % colors.length;
    const t1 = (t - (c0 / colors.length)) * colors.length;
    return p5.lerpColor(p5.color(colors[c0]), p5.color(colors[c1]), t1).toString();
  }
}
