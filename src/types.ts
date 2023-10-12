import { Vector } from "p5";

/**
 * USAGE:
 *
 * ```
 * function* testEnumerator(): IEnumerator {
 *   for (let i = 1; i < 11; i++) {
 *     console.log(i);
 *     yield* waitForDuration(1000);
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
  isStarted: boolean,
  isLost: boolean,
  isDoorsOpen: boolean,
  isExitingLevel: boolean,
  isInverted: boolean,
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
  numApplesStart?: number,
  growthMod?: number,
  layout: string,
  colors: Palette,
}
