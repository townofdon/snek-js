import p5, { Vector } from "p5";
import { Howl } from 'howler';

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
  bonusMod: number,
  speedLimit: number,
}

export enum HitType {
  Unknown,
  HitBarrier,
  HitDoor,
  HitSelf,
}

export interface Stats {
  numDeaths: number
  numLevelsCleared: number,
  numPointsEverScored: number, // total points scored, regardless of deaths (resets on new game)
  numApplesEverEaten: number, // total apples eaten, regardless of deaths (resets on new game)
  score: number,
  applesEaten: number,
  applesEatenThisLevel: number,
  totalTimeElapsed: number,
}

export interface GameState {
  isGameStarted: boolean,
  isGameStarting: boolean,
  isPaused: boolean,
  isMoving: boolean,
  isLost: boolean,
  isDoorsOpen: boolean,
  isExitingLevel: boolean,
  isExited: boolean,
  isShowingDeathColours: boolean,
  timeElapsed: number,
  timeSinceLastMove: number,
  timeSinceHurt: number,
  hurtGraceTime: number,
  lives: number,
  speed: number,
  steps: number,
  frameCount: number,
  lastHurtBy: HitType,
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
  extraHurtGraceTime?: number,
  snakeStartSizeOverride?: number
  disableAppleSpawn?: boolean
  showQuoteOnLevelWin?: boolean
  portalExitConfig?: Partial<Record<PortalChannel, PortalExitMode>>
  titleScene?: (p5: p5, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene
  creditsScene?: (p5: p5, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene
}

export interface Quote {
  message: string[]
  author?: string
}

export interface FontsInstance {
  variants: FontVariants
  load: () => void
}

export interface FontVariants {
  miniMood: p5.Font
  zicons: p5.Font
}

export interface SFXInstance {
  play: (sound: keyof SoundVariants, volume?: number) => void
  stop: (sound: keyof SoundVariants) => void
  load: () => void
}

export enum Sound {
  death = 'death',
  doorOpen = 'doorOpen',
  eat = 'eat',
  hurt1 = 'hurt1',
  hurt2 = 'hurt2',
  hurt3 = 'hurt3',
  moveStart = 'moveStart',
  step1 = 'step1',
  step2 = 'step2',
  uiBlip = 'uiBlip',
  uiChip = 'uiChip',
  uiChipLoop = 'uiChipLoop',
  uiConfirm = 'uiConfirm',
  unlock = 'unlock',
  warp = 'warp',
  xplode = 'xplode',
  xplodeLong = 'xplodeLong',
}

export type SoundVariants = Record<keyof typeof Sound, Howl>

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

export enum ReplayMode {
  Disabled = 'Disabled',
  Capture = 'Capture',
  Playback = 'Playback',
}

export interface Replay {
  mode: ReplayMode,
  levelIndex: number,
  levelName: string,
  difficulty: Difficulty,
  applesToSpawn: [number, number][],
  positions: Record<number, [number, number]>
  timeCaptureStarted: string,
  shouldProceedToNextClip: boolean,
}

export enum PortalExitMode {
  InvertDirection,
  SameDirection,
}

export interface Portal {
  position: Vector
  link?: Vector
  exitMode: PortalExitMode
  channel: PortalChannel
  group: number
  hash: number,
  index: number,
}

export type PortalChannel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
