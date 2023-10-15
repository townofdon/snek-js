import P5, { Vector } from "p5";

/**
 * USAGE:
 *
 * ```
 * function* testEnumerator(): IEnumerator {
 *   for (let i = 1; i < 11; i++) {
 *     console.log(i);
 *     yield* waitForTime(1000);
 *   }
 * }
 * ```
 */
export type IEnumerator = Generator<IEnumerator | null, IEnumerator | void, unknown>

export enum DIR {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface PlayerState {
  position: Vector,
  direction: DIR,
}

export interface ScreenShakeState {
  offset: Vector,
  timeSinceStarted: number,
  timeSinceLastStep: number,
  magnitude: number,
  timeScale: number,
}

export interface Difficulty {
  index: number,
  speedMod: number,
  applesMod: number,
  scoreMod: number,
  speedLimit: number,
}

export interface GameState {
  isPaused: boolean,
  isGameStarted: boolean,
  isTransitionSceneShowing: boolean,
  isMoving: boolean,
  isLost: boolean,
  isDoorsOpen: boolean,
  isExitingLevel: boolean,
  isShowingDeathColours: boolean,
  timeElapsed: number,
  timeSinceLastMove: number,
  timeSinceHurt: number,
  hurtGraceTime: number,
  lives: number,
  speed: number,
  numApplesEaten: number,
}

export interface Palette {
  background: string,
  playerHead: string,
  playerTail: string,
  playerTailStroke: string,
  barrier: string,
  barrierStroke: string,
  apple: string,
  appleStroke: string,
  door: string,
  doorStroke: string,
  deco1: string,
  deco1Stroke: string,
  deco2: string,
  deco2Stroke: string,
}

export interface Level {
  name: string,
  timeToClear: number,
  applesToClear: number,
  layout: string,
  colors: Palette,
  numApplesStart?: number,
  growthMod?: number,
  snakeStartSizeOverride?: number
  disableAppleSpawn?: boolean
  titleScene?: (p5: P5, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene
  storyScene?: (p5: P5, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene
  creditsScene?: (p5: P5, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene
}

export interface FontsInstance {
  variants: FontVariants
  load: () => void
}

export interface FontVariants {
  miniMood: P5.Font
  zicons: P5.Font
}

export interface Scene {
  draw: () => void
  keyPressed: (event?: object) => void
  cleanup: () => void
  action: () => IEnumerator
}

export interface SceneCallbacks {
  onSceneEnded?: () => void
}

export interface SceneCachedCallbacks {
  draw: () => void
  keyPressed: (event?: object) => void
}
