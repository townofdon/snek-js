import P5 from "p5";

import { FontsInstance, IEnumerator, Scene, SceneCachedBindings, SceneCallbacks } from '../types';
import { Coroutines } from "../engine/coroutines";
import { DIMENSIONS } from "../constants";

export interface BaseSceneProps {
  p5: P5
  gfx: P5.Graphics
  callbacks: SceneCallbacks
  coroutines: Coroutines
  fonts: FontsInstance
}

export abstract class BaseScene implements Scene {
  protected readonly props: BaseSceneProps = {
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

  private _active = false;
  private _boundOnce = false;

  constructor(p5: P5, gfx: P5.Graphics, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    if (!p5) {
      throw new Error('p5 not set');
    }
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

  public isShowing = () => this._active;

  /**
   * call this to take over the P5 render loop and input handling.
   * e.g. in the last line of constructor after super().
   * Note to future homer: welcome to the painful, painful world of closures.
   */
  protected bindActions = () => {
    if (!this.props.p5.draw) {
      throw new Error('p5.draw not set');
    }
    if (!this.props.p5.keyPressed) {
      throw new Error('p5.keyPressed not set');
    }
    if (!this.draw) {
      throw new Error('scene.draw not set');
    }
    if (!this.keyPressed) {
      throw new Error('scene.keyPressed not set');
    }
    if (this._boundOnce) {
      throw new Error('illegal: cannot call bindActions() when already bound.');
    }
    if (this.props.p5.draw === this.draw && this.keyPressed === this.keyPressed) {
      throw new Error('illegal: cannot call bindActions() when already bound (2).');
    }
    if ((!this.cachedBindings.draw || !this.cachedBindings.keyPressed)) {
      throw new Error('illegal: cannot call bindActions() on an already-cleaned-up scene.');
    }
    this.props.callbacks.onSceneStart?.();
    this._active = true;
    this._boundOnce = true;
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
    this.props.callbacks.onSceneStart?.();
    this._active = true;
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
    callbacks.onSceneEnded?.();
    callbacks.onSceneEnded = null;
    this._active = false;
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
