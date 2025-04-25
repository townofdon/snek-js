import P5, { Vector } from "p5";
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
export type IEnumerator = Generator<IEnumerator | null, IEnumerator | void, null | undefined>;

export enum Action {
  FadeMusic = 'FadeMusic',
  ExecuteQuotesMode = 'ExecuteQuotesMode',
  SetTitleVariant = 'SetTitleVariant',
  ChangeMusicLowpass = 'ChangeMusicLowpass',
  GameOver = 'GameOver',
  Invincibility = 'Invincibility',
}

export type ActionKey = keyof typeof Action
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

export enum Mapset {
  Campaign,
  Challenge,
}

export enum GameMode {
  Normal,
  Casual,
  Cobra,
}

export enum DIR {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum MOVE {
  Nil = 0,
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4,
  TURN_R = 5,
  TURN_L = 6,
  UTURN_R = 7,
  UTURN_L = 8,
  STRAFE_R = 9,
  STRAFE_L = 10,
}

export interface PlayerState {
  position: Vector,
  direction: DIR,
  directionToFirstSegment: DIR,
  directionLastHit: DIR,
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

/**
   * 1 => easy
   *
   * 2 => medium
   *
   * 3 => hard
   *
   * 4 => ultra
   */
export type DifficultyIndex = 1 | 2 | 3 | 4;

export interface Difficulty {
  /**
   * 1 => easy
   *
   * 2 => medium
   *
   * 3 => hard
   *
   * 4 => ultra
   */
  index: DifficultyIndex,
  applesMod: number,
  scoreMod: number,
  bonusMod: number,
  speedStart: number,
  speedLimit: number,
  speedSteps: number,
  sprintLimit: number,
  invincibilityTime: number,
}


export enum HitType {
  Unknown,
  HitBarrier,
  HitDoor,
  HitSelf,
  HitLock,
  QuantumEntanglement,
}

export type RecentMove = DIR | null
export type RecentMoves = [RecentMove, RecentMove, RecentMove, RecentMove];
export type RecentMoveTimings = [number, number, number, number];

export interface Stats {
  numDeaths: number
  numLevelsCleared: number,
  numLevelsEverCleared: number,
  /**
   * total points scored, regardless of deaths (resets on new game)
   */
  numPointsEverScored: number,
  /**
   * total apples eaten, regardless of deaths (resets on new game)
   */
  numApplesEverEaten: number,
  score: number,
  applesEatenThisLevel: number,
  totalGameTimeElapsed: number,
  totalLevelTimeElapsed: number,
}

export interface GameState {
  appMode: AppMode,
  gameMode: GameMode,
  mapset: Mapset,
  isRandomizer: boolean,
  isPreloaded: boolean,
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
  /**
   * The actual time elapsed from the start of the level
   */
  actualTimeElapsed: number,
  /**
   * The time elapsed since the player started moving
   */
  timeElapsed: number,
  timeSinceLastMove: number,
  timeSinceLastTeleport: number,
  timeSinceHurt: number,
  timeSinceHurtForgiveness: number,
  timeSinceLastInput: number,
  timeSinceInvincibleStart: number,
  timeSinceSpawnedPickup: number,
  hurtGraceTime: number,
  lives: number,
  /**
   * The number of collisions the player has accumulated since the start of the level
   */
  collisions: number,
  targetSpeed: number,
  currentSpeed: number,
  steps: number,
  frameCount: number,
  numTeleports: number,
  lastHurtBy: HitType,
  nextLevel: Level | null,
}

export interface DrawState {
  shouldDrawApples: boolean,
  shouldDrawKeysLocks: boolean,
}

export interface LoopState {
  interval: NodeJS.Timeout | null,
  timePrevMs: number,
  timeAccumulatedMs: number,
  timeScale: number,
  deltaTime: number,
}

export interface Tutorial {
  needsMoveControls: boolean,
  needsRewindControls: boolean,
}

export interface GameSettings {
  musicVolume: number,
  sfxVolume: number,
  isScreenShakeDisabled: boolean,
}

export type LevelId = string;

export interface SaveData {
  isCobraModeUnlocked: boolean,
  completion: Record<LevelId, Record<DifficultyIndex, LevelCompletion>>
}

export interface LevelCompletion {
  completed: boolean
  perfect: boolean
  bestTime: number
}

export interface EditorStoreData {
  author: string,
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

export interface ExtendedPalette extends Palette {
  barrierBorderLight: string,
  barrierBorderDark: string,
  passable: string,
  passableStroke: string,
  passableBorderLight: string,
  passableBorderDark: string,
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
  WarpZone,
}

export interface Area {
  name: string;
  levels: Level[];
}

export interface Level {
  id: string,
  type?: LevelType,
  name: string,
  timeToClear: number,
  applesToClear: number,
  layout: string,
  layoutV2?: string,
  colors: ExtendedPalette,
  numApplesStart?: number,
  growthMod?: number,
  growthOverride?: number,
  extraHurtGraceTime?: number,
  snakeStartSizeOverride?: number,
  snakeStartDirectionOverride?: DIR,
  snakeSpawnPointOverride?: number,
  disableAppleSpawn?: boolean,
  disableNormalLoseMessages?: boolean,
  disableWallCollision?: boolean,
  showTitle?: boolean,
  showQuoteOnLevelWin?: boolean,
  isWinGame?: boolean,
  playWinSound?: boolean,
  extraLoseMessages?: LoseMessage[],
  portalExitConfig?: Partial<Record<PortalChannel, PortalExitMode>>,
  // titleScene?: (p5: P5, gfx: P5.Graphics, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks) => Scene,
  renderInstructions?: (gfx: P5 | P5.Graphics, renderer: IRenderer, state: GameState, palette: Palette) => void
  musicTrack?: MusicTrack,
  titleVariant?: TitleVariant,
  globalLight?: number,
  nextLevelMap?: Record<number, Level>,
  nextLevel?: Level,
  appleSlowdownMod?: number,
  applesModOverride?: number,
  pickupDrops?: Record<number, PickupDrop>,
  recordProgressAsLevel?: Level,
  author?: string,
  numLocks?: number;
}

export interface IRenderer {
  reset: () => void
  tick: () => void
  drawBackground: (color: string, gfxBG: P5.Graphics, gfxFG: P5.Graphics) => void
  drawStaticGraphics: (gfx: P5.Graphics) => void
  invalidateStaticCache: () => void
  clearGraphicalComponent: (component: P5.Graphics) => void
  drawGraphicalComponent: (component: P5.Graphics, x: number, y: number) => void
  drawGraphicalComponentStatic: (gfx: P5.Graphics, component: P5.Graphics, x: number, y: number) => void
  drawSquare: (x: number, y: number, background: string, lineColor: string, options: DrawSquareOptions) => void
  drawSquareStatic: (gfx: P5.Graphics, x: number, y: number, background: string, lineColor: string, options: DrawSquareOptions) => void
  drawSquareCustom: (component: P5 | P5.Graphics, x: number, y: number, background: string, lineColor: string, options: DrawSquareOptions) => void
  drawSquareBorder: (x: number, y: number, mode: 'light' | 'dark', strokeColor: string, overrideColor: boolean) => void
  drawSquareBorderStatic: (gfx: P5.Graphics, x: number, y: number, mode: 'light' | 'dark', strokeColor: string, overrideColor: boolean) => void
  drawSquareBorderCustom: (component: P5 | P5.Graphics, x: number, y: number, mode: 'light' | 'dark', strokeColor: string, overrideColor: boolean) => void
  drawX: (x: number, y: number, color: string, blockDivisions: number) => void
  drawXStatic: (gfx: P5.Graphics, x: number, y: number, color: string, blockDivisions: number) => void
  drawXCustom: (component: P5 | P5.Graphics, x: number, y: number, color: string, blockDivisions: number) => void
  drawBasicSquare: (x: number, y: number, color: P5.Color, size: number) => void
  drawCaptureMode: () => void
  drawPlayerMoveArrows: (gfx: P5 | P5.Graphics, vec: Vector, currentMove: DIR) => void
  drawTutorialMoveControls: (gfx: P5 | P5.Graphics) => void
  drawTutorialRewindControls: (gfx: P5 | P5.Graphics, playerPosition: Vector, canRewind: () => boolean) => void
  drawSprintControls: (gfx: P5 | P5.Graphics, x: number, y: number) => void
  drawDifficultySelect: (gfx: P5 | P5.Graphics, backgroundColor: string) => void
  drawDifficultySelectCobra: (gfx: P5 | P5.Graphics, backgroundColor: string) => void
  drawUIKeys: (gfx: P5 | P5.Graphics) => void
  drawPortal: (portal: Portal, showDeathColours: boolean, options: DrawSquareOptions) => void
}

export interface DrawSquareOptions {
  is3d?: boolean,
  size?: number,
  strokeSize?: number,
  optimize?: boolean,
  screenshakeMul?: number,
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

export enum InputAction {
  HideStartScreen,
  ShowMainMenu,
  ConfirmShowMainMenu,
  ShowSettingsMenu,
  HideSettingsMenu,
  ShowLevelSelectMenu,
  HideLevelSelectMenu,
  RetryLevel,
  ChooseGameMode,
  CancelChooseGameMode,
  StartGame,
  ToggleCasualMode,
  ToggleCobraMode,
  ToggleScreenshakeDisabled,
  ShowLeaderboard,
  EnterQuoteMode,
  EnterOstMode,
  ProceedToNextReplayClip,
  Pause,
  UnPause,
  StartMoving,
  StartRewinding,
  GotoCommunityPage,
}

export interface EditorOptions {
  name: string,
  timeToClear: number, // default: 60
  applesToClear: number, // default: 20
  numApplesStart: number, // default: 3
  disableAppleSpawn: boolean, // default: false
  snakeStartSize: number, // default: START_SNAKE_SIZE
  growthMod: number, // default: 1
  extraHurtGraceTime: number, // default: 0
  globalLight: number, // default: 1
  palette: Palette,
  portalExitConfig: Record<PortalChannel, PortalExitMode>,
  musicTrack: MusicTrack,
}

export type Maybe<T> = T | null | undefined;

export interface EditorData {
  applesMap: Record<number, Maybe<boolean>>,
  barriersMap: Record<number, Maybe<boolean>>,
  decoratives1Map: Record<number, Maybe<boolean>>,
  decoratives2Map: Record<number, Maybe<boolean>>,
  doorsMap: Record<number, Maybe<boolean>>,
  keysMap: Record<number, Maybe<KeyChannel>>,
  locksMap: Record<number, Maybe<KeyChannel>>,
  nospawnsMap: Record<number, Maybe<boolean>>,
  passablesMap: Record<number, Maybe<boolean>>,
  portalsMap: Record<number, Maybe<PortalChannel>>,
  playerSpawnPosition: Vector,
  startDirection: DIR,
}

export interface EditorDataSlice {
  coord: number,
  apple: Maybe<boolean>,
  barrier: Maybe<boolean>,
  deco1: Maybe<boolean>,
  deco2: Maybe<boolean>,
  door: Maybe<boolean>,
  key: Maybe<KeyChannel>,
  lock: Maybe<KeyChannel>,
  nospawn: Maybe<boolean>,
  passable: Maybe<boolean>,
  portal: Maybe<PortalChannel>,
  playerSpawnPosition: Vector,
  startDirection: DIR,
}

export interface LevelData {
  barriers: Vector[],
  doors: Vector[],
  apples: Vector[],
  decoratives1: Vector[],
  decoratives2: Vector[],
  nospawns: Vector[],
  portals: Record<PortalChannel, Vector[]>,
  playerSpawnPosition: Vector,
  keys: Key[],
  locks: Lock[],
  barriersMap: Record<number, boolean>,
  passablesMap: Record<number, boolean>,
  doorsMap: Record<number, boolean>,
  decoratives1Map: Record<number, boolean>,
  decoratives2Map: Record<number, boolean>,
  nospawnsMap: Record<number, boolean>,
  keysMap: Record<number, Key>,
  locksMap: Record<number, Lock>,
  portalsMap: Record<number, Portal>,
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
  miniMood: P5.Font
  zicons: P5.Font
  casual: P5.Font
}

export interface SFXInstance {
  setGlobalVolume: (volume: number) => void
  play: (sound: keyof SoundVariants, volume?: number) => void
  playLoop: (sound: keyof SoundVariants, volume?: number) => void
  stop: (sound: keyof SoundVariants) => void
  load: () => void
  isPlaying: (sound: keyof SoundVariants) => boolean
}

export enum Sound {
  death = 'death',
  doorOpen = 'doorOpen',
  doorOpenHuge = 'doorOpenHuge',
  eat = 'eat',
  hurt1 = 'hurt1',
  hurt2 = 'hurt2',
  hurt3 = 'hurt3',
  hurtSave = 'hurtSave',
  invincibleLoop = 'invincibleLoop',
  moveStart = 'moveStart',
  pickup = 'pickup',
  pickupInvincibility = 'pickupInvincibility',
  rewindLoop = 'rewindLoop',
  step1 = 'step1',
  step2 = 'step2',
  uiBlip = 'uiBlip',
  uiChip = 'uiChip',
  uiChipLoop = 'uiChipLoop',
  uiConfirm = 'uiConfirm',
  unlock = 'unlock',
  unlockAbility = 'unlockAbility',
  warp = 'warp',
  winLevel = 'winLevel',
  winGame = 'winGame',
  xplode = 'xplode',
  xplodeLong = 'xplodeLong',
  xpound = 'xpound',
}

export type SoundVariants = Record<keyof typeof Sound, Howl>


export enum MusicTrack {
  None = '__NO_TRACK__',
  simpleTime = '01-simpletime5.wav',
  conquerer = '02-conquerer.wav',
  transient = '03-transient-4-LOOP.wav',
  lordy = '04-lordy.wav',
  champion = '05-champion-2.wav',
  dangerZone = '06-dangerzone-2.wav',
  aqueduct = '07-aqueduct.wav',
  creeplord = '08-creeplord-2.wav',
  moneymaker = '09-snekmoney5.wav',
  factorio = '10-factorio2.wav',
  observer = '11-observer.wav',
  skycastle = '12-skycastle.wav',
  shopkeeper = '13-shopkeeper-storyteller.wav',
  stonemaze = '14-stoneways-clausterphobia-2.wav',
  woorb = '15-woorb.wav',
  gravy = '16-gravy.wav',
  lostcolony = '17-lost-colony.wav',
  reconstitute = '18-reconstitute.wav',
  ascension = '19-ascension.wav',
  backrooms = '20-dillema.wav',
  slyguy = '21-slyguy.wav',
  overture = '22-snek-overture.wav',
  drone = '00-drone.wav',
  slime_dangerman = '90-dangerman_180.mp3',
  slime_exitmusic = '91-exitmusic_245.mp3',
  slime_megacreep = '92-megacreep_120.mp3',
  slime_monsterdance = '93-monsterdance_150.mp3',
  slime_rollcredits = '94-rollcredits_110.mp3',
}

export type UnlockedMusicTracks = Record<MusicTrack, boolean>

export enum Image {
  SnekHead = 'snek-head.png',
  SnekHeadDead = 'snek-head-dead.png',
  SnekButt = 'snek-butt.png',
  ControlsKeyboardMove = 'controls-keyboard-move.png',
  ControlsKeyboardDelete = 'controls-keyboard-delete.png',
  ControlsKeyboardSprint = 'controls-keyboard-sprint.png',
  ControlsMouseLeft = 'controls-mouse-left.png',
  KeyGrey = 'snek-key2-grey.png',
  KeyYellow = 'snek-key2-yellow.png',
  KeyRed = 'snek-key2-red.png',
  KeyBlue = 'snek-key2-blue.png',
  LockGrey = 'snek-lock-grey.png',
  LockYellow = 'snek-lock-yellow.png',
  LockRed = 'snek-lock-red.png',
  LockBlue = 'snek-lock-blue.png',
  PickupArrows = 'pickup-arrows.png',
  UIKeyGrey = 'snek-smkey2-grey.png',
  UIKeyYellow = 'snek-smkey2-yellow.png',
  UIKeyRed = 'snek-smkey2-red.png',
  UIKeyBlue = 'snek-smkey2-blue.png',
  UILocked = 'ui-locked.png',
  Darken = 'darken2.png',
  EditorSelection = 'editor-selection.png',
  EditorSelectionBlue = 'editor-selection-blue.png',
  EditorSelectionRed = 'editor-selection-red.png',
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
  lastFrame: number,
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

export enum UISection {
  MainMenu,
  Settings,
  SettingsInGame,
  PauseMenu,
}

export enum UINavDir {
  Prev,
  Next,
  Up,
  Down,
  Left,
  Right,
}

export type UINavEventHandler = (navDir: UINavDir) => boolean;
export type UIInteractHandler = () => boolean;
export type UICancelHandler = () => boolean;
export interface UIHandler {
  handleUINavigation: UINavEventHandler,
  handleUIInteract: UIInteractHandler,
  handleUICancel: UICancelHandler,
}

export interface GraphicalComponents {
  deco1: P5.Graphics,
  deco2: P5.Graphics,
  barrier: P5.Graphics,
  barrierPassable: P5.Graphics,
  door: P5.Graphics,
  apple: P5.Graphics,
  snakeHead: P5.Graphics,
  snakeSegment: P5.Graphics,
}

export interface EditorGraphicalComponents extends GraphicalComponents {
  nospawn: P5.Graphics,
}

export interface ParticleSystem2 {
  emit: (x: number, y: number) => void,
  opt1: EmitterOptions,
  opt2?: EmitterOptions,
  opt3?: EmitterOptions,
}

export interface EmitterOptions {
  gradientIndex: number,
  originOffset: number,
  lifetime: number,
  burst: number,
  spawnDelay: number,
  spawnOverTime: number,
  speed: number,
  speedVariance: number,
  scaleStart: number,
  scaleEnd: number,
  scaleVariance: number,
  loop: boolean,
  orbit: number,
  easingFnc?: (x: number) => number,
}

export enum PickupType {
  None = 0,
  Invincibility,
}

export interface Pickup {
  timeTillDeath: number,
  type: PickupType,
}

export interface PickupDrop {
  likelihood: number,
  type: PickupType,
}

export enum SNEKALYTICS_EVENT_TYPE {
  DEATH = 'DEATH',
  WARP = 'WARP',
  WIN_LEVEL = 'WIN_LEVEL',
  WIN_GAME = 'WIN_GAME',
  QUIT_GAME = 'QUIT_GAME',
}
