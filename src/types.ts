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
export type IEnumerator = Generator<IEnumerator | null, IEnumerator | void, null | undefined>

export interface QueryParams {
  enableWarp: boolean,
  enableQuoteMode: boolean,
  showFps: boolean,
}

export enum AppMode {
  StartScreen,
  Game,
  Quote,
  OST,
  Leaderboard,
}

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

export interface ClickState {
  x: number,
  y: number,
  didReceiveInput: boolean,
  directionToPoint: DIR,
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
  sprintLimit: number,
}


export enum HitType {
  Unknown,
  HitBarrier,
  HitDoor,
  HitSelf,
  HitLock,
}

export type RecentMoves = [DIR, DIR, DIR, DIR];
export type RecentMoveTimings = [number, number, number, number];

export interface Stats {
  numDeaths: number
  numLevelsCleared: number,
  numLevelsEverCleared: number,
  numPointsEverScored: number, // total points scored, regardless of deaths (resets on new game)
  numApplesEverEaten: number, // total apples eaten, regardless of deaths (resets on new game)
  score: number,
  applesEaten: number,
  applesEatenThisLevel: number,
  totalTimeElapsed: number,
}

export interface GameState {
  appMode: AppMode,
  isPreloaded: boolean,
  isCasualModeEnabled: boolean,
  isGameStarted: boolean,
  isGameStarting: boolean,
  isPaused: boolean,
  isMoving: boolean,
  isSprinting: boolean, // is user holding down shift key?
  isRewinding: boolean,
  isLost: boolean,
  isGameWon: boolean,
  isDoorsOpen: boolean,
  isExitingLevel: boolean,
  isExited: boolean,
  isShowingDeathColours: boolean,
  hasKeyYellow: boolean,
  hasKeyRed: boolean,
  hasKeyBlue: boolean,
  levelIndex: number,
  timeElapsed: number,
  timeSinceLastMove: number,
  timeSinceLastTeleport: number,
  timeSinceHurt: number,
  timeSinceLastInput: number,
  hurtGraceTime: number,
  lives: number,
  targetSpeed: number,
  currentSpeed: number,
  steps: number,
  frameCount: number,
  lastHurtBy: HitType,
}

export interface Tutorial {
  needsMoveControls: boolean,
  needsRewindControls: boolean,
}

export interface GameSettings {
  musicVolume: number,
  sfxVolume: number,
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

export enum TitleVariant {
  GrayBlue,
  Gray,
  Green,
  Red,
  Sand,
  Yellow,
}

export enum LevelType {
  Level = 0,
  Maze,
}

export interface Level {
  type?: LevelType,
  name: string,
  timeToClear: number,
  applesToClear: number,
  layout: string,
  colors: Palette,
  numApplesStart?: number,
  growthMod?: number,
  extraHurtGraceTime?: number,
  snakeStartSizeOverride?: number,
  disableAppleSpawn?: boolean,
  disableNormalLoseMessages?: boolean,
  showQuoteOnLevelWin?: boolean,
  isWinGame?: boolean,
  extraLoseMessages?: LoseMessage[],
  portalExitConfig?: Partial<Record<PortalChannel, PortalExitMode>>,
  titleScene?: (p5: p5, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene,
  musicTrack?: MusicTrack,
  titleVariant?: TitleVariant,
  globalLight?: number,
}

export enum KeyChannel {
  Yellow,
  Red,
  Blue,
}

export interface Key {
  channel: KeyChannel,
  position: Vector,
}

export interface Lock extends Key {
  coord: number,
}

export interface LevelData {
  barriers: Vector[],
  barriersMap: Record<number, boolean>,
  doors: Vector[],
  doorsMap: Record<number, boolean>,
  apples: Vector[],
  decoratives1: Vector[],
  decoratives1Map: Record<number, boolean>,
  decoratives2: Vector[],
  decoratives2Map: Record<number, boolean>,
  nospawns: Vector[],
  nospawnsMap: Record<number, boolean>,
  playerSpawnPosition: Vector,
  portalsMap: Record<number, Portal>,
  portals: Record<PortalChannel, Vector[]>,
  keys: Key[],
  keysMap: Record<number, Key>,
  locks: Lock[],
  locksMap: Record<number, Lock>,
  diffSelectMap: Record<number, number>,
}

export interface DynamicLevelData {
  segmentsMap: Record<number, boolean>,
  applesMap: Record<string, number>,
}

export type LoseMessage = [string] | [string, GetShouldShowLoseMessage];
export type GetShouldShowLoseMessage = (state: GameState, stats: Stats, difficulty: Difficulty) => boolean;

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
  casual: p5.Font
}

export interface SFXInstance {
  setGlobalVolume: (volume: number) => void
  play: (sound: keyof SoundVariants, volume?: number) => void
  stop: (sound: keyof SoundVariants) => void
  load: () => void
}


export enum Sound {
  death = 'death',
  doorOpen = 'doorOpen',
  doorOpenHuge = 'doorOpenHuge',
  eat = 'eat',
  hurt1 = 'hurt1',
  hurt2 = 'hurt2',
  hurt3 = 'hurt3',
  moveStart = 'moveStart',
  pickup = 'pickup',
  rewindLoop = 'rewindLoop',
  step1 = 'step1',
  step2 = 'step2',
  uiBlip = 'uiBlip',
  uiChip = 'uiChip',
  uiChipLoop = 'uiChipLoop',
  uiConfirm = 'uiConfirm',
  unlock = 'unlock',
  warp = 'warp',
  winLevel = 'winLevel',
  xplode = 'xplode',
  xplodeLong = 'xplodeLong',
  xpound = 'xpound',
}

export type SoundVariants = Record<keyof typeof Sound, Howl>


export enum MusicTrack {
  None = '__NO_TRACK__',
  simpleTime = '01-simpletime3.wav',
  conquerer = '02-conquerer.wav',
  transient = '03-transient-2.wav',
  lordy = '04-lordy.wav',
  champion = '05-champion-2.wav',
  dangerZone = '06-dangerzone.wav',
  aqueduct = '07-aqueduct.wav',
  creeplord = '08-creeplord.wav',
  moneymaker = '09-snekmoney4.wav',
  factorio = '10-factorio.wav',
  observer = '11-observer.wav',
  skycastle = '12-skycastle.wav',
  shopkeeper = '13-shopkeeper-storyteller.wav',
  stonemaze = '14-stoneways-clausterphobia-2.wav',
  woorb = '15-woorb.wav',
  gravy = '16-gravy.wav',
  lostcolony = '17-lost-colony.wav',
}

export enum Image {
  SnekHead = 'snek-head.png',
  SnekHeadDead = 'snek-head-dead.png',
  SnekButt = 'snek-butt.png',
  ControlsKeyboardMove = 'controls-keyboard-move.png',
  ControlsKeyboardDelete = 'controls-keyboard-delete.png',
  ControlsMouseLeft = 'controls-mouse-left.png',
  KeyGrey = 'snek-key2-grey.png',
  KeyYellow = 'snek-key2-yellow.png',
  KeyRed = 'snek-key2-red.png',
  KeyBlue = 'snek-key2-blue.png',
  LockGrey = 'snek-lock-grey.png',
  LockYellow = 'snek-lock-yellow.png',
  LockRed = 'snek-lock-red.png',
  LockBlue = 'snek-lock-blue.png',
  UIKeyGrey = 'snek-smkey2-grey.png',
  UIKeyYellow = 'snek-smkey2-yellow.png',
  UIKeyRed = 'snek-smkey2-red.png',
  UIKeyBlue = 'snek-smkey2-blue.png',
}

export interface Scene {
  draw: () => void
  keyPressed: (event?: object) => void
  cleanup: () => void
  action: () => IEnumerator
}

export interface SceneCallbacks {
  onSceneEnded?: () => void
  onEscapePress?: () => void
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
