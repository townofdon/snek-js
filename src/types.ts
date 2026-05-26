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
export type IEnumerator = Generator<IEnumerator | null, IEnumerator | void, null | undefined>;

export enum Orientation {
  Vertical,
  Horizontal,
  Mixed,
}

/**
 * actions are unique, singleton coroutines, meaning that only one coroutine of a type can run at a time
 */
export enum Action {
  FadeMusic = 'FadeMusic',
  ExecuteQuotesMode = 'ExecuteQuotesMode',
  SetTitleVariant = 'SetTitleVariant',
  ChangeMusicLowpass = 'ChangeMusicLowpass',
  GameOver = 'GameOver',
  Invincibility = 'Invincibility',
  AcquireArmor = 'AcquireArmor',
  WeightLoss = 'WeightLoss',
  Electrocution = 'Electrocution',
  Burnination = 'Burnination',
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


export enum DamageType {
  None,
  HitBarrier,
  HitDoor,
  HitSelf,
  HitLock,
  QuantumEntanglement,
  HitMine,
  Explosive,
  Electrocution,
  SpikePierce,
  SawCut,
  Burn,
}

export enum InputType {
  Keyboard,
  Gamepad,
}

export type RecentMove = DIR | null
export type RecentMoves = [RecentMove, RecentMove, RecentMove, RecentMove];
export type RecentMoveTimings = [number, number, number, number];

/**
 * Stats that are unique to a save slot.
 */
export interface BaseStats {
  score: number,
  numDeaths: number,
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
  totalGameTimeElapsed: number,
}

/**
 * Stats for a current game session.
 */
export interface Stats extends BaseStats {
  applesEatenThisLevel: number,
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
  isButtonPressed: boolean,
  isLost: boolean,
  isGameWon: boolean,
  isDoorsOpen: boolean,
  isExitingLevel: boolean,
  isExited: boolean,
  isInvertedColors: boolean,
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
  timeSinceElectrocutionStart: number,
  timeSinceBurnStart: number,
  timeSinceButtonPressChanged: number,
  timeSinceLungeStart: number,
  /**
   * Time elapsed since the player initiated a reversal (via the Reversible pickup)
   */
  timeSinceReverseStart: number,
  timeSinceSpawnedWeightLossPillPickup: number,
  timeSinceSpawnedAnyPickup: number,
  /**
   * Time elapsed since the player would have moved into an obstacle (hit grace period).
  */
  timeSinceGraceStarted: number,
  /**
    * Time since the player was protected from a hit by armor
    */
  timeSinceArmorProtection: number,
  /**
   * The time elapsed since the player picked up armor
   */
  timeSinceArmorPickup: number,
  /**
  * The progression amount for acquiring an item: range [0, 1]
  */
  acquireProgression: number,
  lives: number,
  /**
   * The number of collisions the player has accumulated since the start of the level
   */
  collisions: number,
  /**
   * desired speed
   */
  targetSpeed: number,
  /**
   * actual speed
   */
  currentSpeed: number,
  /**
   * Number of snake movements (used for cycling footstep sounds)
   */
  steps: number,
  /**
   * Number of lunge steps remaining
   */
  lungeStepsRemaining: number,
  /**
   * Pity system for pickup spawns [0-1]
   */
  pity: number,
  frameCount: number,
  numTeleports: number,
  lastHurtBy: DamageType,
  nextLevel: Level | null,
  inputType: InputType,
}

export interface EngineState {
  level: Level,
  difficulty: Difficulty,
  moves: DIR[], // moves that the player has queued up
  recentMoves: RecentMoves, // most recent moves that the snake has performed
  recentMoveInputs: RecentMoves, // most recent inputs that the player has performed that would result in a move. Discards duplicate move attempts.
  recentInputs: RecentMoves, // most recent player inputs (always captured, never filtered or discarded)
  recentInputTimes: RecentMoveTimings, // timing of the most recent inputs that the player has performed (always captured)
  barriers: Barrier[], // permanent structures that damage the snake
  doors: Vector[], // like barriers, except that they disappear once the player has "cleared" a level (player must still exit the level though)
  decoratives1: Vector[], // bg decorative elements
  decoratives2: Vector[], // bg decorative elements
  keys: Key[], // unlock locks
  locks: Lock[], // unlockable barriers
  passablesMap: Record<number, boolean>, // map of barriers that become passable when doors open
  barriersMap: Record<number, BarrierType>, // map of barriers (obstacles or walls that the snake can hit)
  doorsMap: Record<number, boolean>, // map of doors - blocks that disappear once conditions are met
  pickupsMap: Record<number, Pickup | null>, // map of pickup items, powerups, etc.
  nospawnsMap: Record<number, boolean>, // no-spawns are designated spots on the map where an apple cannot spawn
  keysMap: Record<number, Key | null>,
  locksMap: Record<number, Lock | null>,
  diffSelectMap: Record<number, number>,
  portals: Record<PortalChannel, Vector[]>,
  portalsMap: Record<number, Portal>,
  threatsMap: Record<number, ThreatType>,
  lasersMap: Record<number, LaserCell>,
  switchesMap: Record<number, SwitchType>,
  pipesMap: Record<number, PipeConnection>,
  flamesMap: Record<number, boolean>,
}

export interface Outfit {
  exclusive: WearableFrame, // pirate costume, luchador masks, etc.
  hat: WearableFrame,
  eyes: WearableFrame,
  back: WearableFrame,
  hair: WearableFrame,
}

export interface HeldItems {
  armor: number,
  reversibles: number,
}

export interface DrawState {
  shouldDrawApples: boolean,
  shouldDrawKeysLocks: boolean,
  shouldDrawActionFG: boolean,
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

export enum ResolutionMode {
  None = 0,
  PixelPerfect,
  FillScreen,
}

export interface GameSettings {
  musicVolume: number,
  sfxVolume: number,
  isScreenShakeDisabled: boolean,
  resolutionMode: ResolutionMode,
  fullScreen: boolean,
}

export type LevelId = string;

export interface SaveSlotData {
  currentLevel: number,
  gameMode: GameMode,
  difficulty: DifficultyIndex,
  wearablesUnlocked: Record<WearableFrame, boolean>,
  stats: BaseStats,
  heldItems: HeldItems,
}

export enum SaveSlot {
  Unset = 0,
  Slot0,
  Slot1,
  Slot2,
}

export interface SaveData {
  isCobraModeUnlocked: boolean,
  /**
   * History of levels completed during any play session
   */
  completion: Record<LevelId, Record<DifficultyIndex, LevelCompletion>>,
  slot0: SaveSlotData | null,
  slot1: SaveSlotData | null,
  slot2: SaveSlotData | null,
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

export interface ColorReplacementPalette {
  dark: P5.Color,
  main: P5.Color,
  light: P5.Color,
  alt: P5.Color,
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
  /**
   * pickup drop config by "frame" (number of apples eaten)
   */
  pickupDropsByFrame?: Record<number, PickupDrop>,
  /**
   * general pickup drop configs by item type
   *
   * usage:
   * ```
   * pickupDrops: {
   *   [ItemDropType.Invincibility]: true, // use base likelihood (default 1)
   *   [ItemDropType.Mine]: 2, // likelihood multiplier
   *   [ItemDropType.Armor]: { 1: true, 2: true, 3: 0.5, 4: false }, // by difficulty
   * },
   * ```
   */
  pickupDrops?: Partial<Record<ItemDropType, boolean | number | Record<DifficultyIndex, boolean | number>>>,
  pickupTypes?: PickupType[],
  /**
   * coord for armor drop when all items are eaten
   */
  armorDrop?: number,
  recordProgressAsLevel?: Level,
  author?: string,
  numLocks?: number;
  /**
   * Par level finish time in milliseconds
   */
  parTime?: number;
  pipeVariant?: PipeVariant;
  /**
   * Field mutated during runtime - keep track of snek death locations (used to draw gore fx)
   */
  deathLocations?: Record<number, boolean>,
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
  drawTutorialRewindControls: (gfx: P5 | P5.Graphics, playerPosition: Vector, canRewind: boolean) => void
  drawTutorialTurnControls: (gfx: P5 | P5.Graphics, x: number, y: number) => void
  drawSprintControls: (gfx: P5 | P5.Graphics, x: number, y: number) => void
  drawDifficultySelect: (gfx: P5 | P5.Graphics, backgroundColor: string) => void
  drawDifficultySelectCobra: (gfx: P5 | P5.Graphics, backgroundColor: string) => void
  drawRightUI: (gfx: P5 | P5.Graphics, armorCount: number, reversablesCount: number) => void
  drawPortal: (portal: Portal, showDeathColours: boolean, options: DrawSquareOptions) => void
}

export interface DrawSquareOptions {
  is3d?: boolean,
  size?: number,
  rotation?: number,
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

export enum BarrierType {
  Unset = 0,
  Default,
  Skull,
  SkullThemed,
  Indent,
  IndentThemed,
  FireTile,
  Flat,
  FlatThemed,
  Pyramid,
  PyramidThemed,
  ExitSign,
  Radar,
  ComputerChip,
  MetalPlate,
  Panel0,
  Panel1,
  Panel2,
  Panel3,
  Panel4,
  Panel5,
  Brick,
  BrickWhite,
  BrickThemed,
  Stone,
  StoneThemed,
  PanelWhite,
  CompPanel,
  GrateWhite,
  GrateYellow,
  Ruby,
  FanDuct,
  ExhaustPlate,
  MetalPlate2,
}
export const BARRIER_TYPE_MAX = Math.max(...Object.values(BarrierType).filter(v => typeof v === 'number')) + 1;

export interface Barrier {
  type: BarrierType,
  vec: Vector,
}

export enum SwitchType {
  None = 0,
  Button,
}
export const SWITCH_TYPE_MAX = Math.max(...Object.values(SwitchType).filter(v => typeof v === 'number')) + 1;

export enum PipeVariant {
  None = 0,
  Green,
  Orange,
  White,
  Cobalt,
  Flat,
  Themed1,
  Themed2,
  Themed3,
}

export const FLAG_NORTH = 1;
export const FLAG_SOUTH = 2;
export const FLAG_WEST = 4;
export const FLAG_EAST = 8;

// note - ordering based on bitmask
export enum PipeConnection {
  Unset = 0,
  N,
  S,
  NS,
  W,
  NW,
  SW,
  NSW,
  E,
  NE,
  SE,
  NSE,
  WE,
  NWE,
  SWE,
  NSWE,
  Island, // no neighbors
}

export interface LevelPickup {
  type: PickupType,
  vec: Vector,
}

export interface LevelThreat {
  type: ThreatType,
  vec: Vector,
}

export interface LevelSwitch {
  type: SwitchType,
  vec: Vector,
}

export enum ThreatType {
  None = 0,
  Mine,
  Bomb,
  LaserDiode,
  ExplodableBarrel,
  Barricade,
  Spikes,
  WallSpikes,
  Saw,
  Flamethrower,
}
export const THREAT_TYPE_MAX = Math.max(...Object.values(ThreatType).filter(v => typeof v === 'number')) + 1;

export enum ThreatFlag {
  None = 0, // default
  Crit = 1,
  SiblingN = 2,
  SiblingS = 4,
  SiblingW = 8,
  SiblingE = 16,
}

export enum LaserType {
  None = 0,
  Red,
  Blue,
}

export interface LaserCell {
  orientation: Orientation,
  type: LaserType,
  coordDiodeA: number,
  coordDiodeB: number,
  damageActive: boolean,
}

export enum FloodFillTile {
  None,
  Passable,
  Barrier,
  BarrierSkull,
  BarrierSkullThemed,
  BarrierIndent,
  BarrierIndentThemed,
  BarrierFireTile,
  BarrierFlat,
  BarrierFlatThemed,
  BarrierPyramid,
  BarrierPyramidThemed,
  BarrierExitSign,
  BarrierRadar,
  BarrierComputerChip,
  BarrierMetalPlate,
  BarrierPanel0,
  BarrierPanel1,
  BarrierPanel2,
  BarrierPanel3,
  BarrierPanel4,
  BarrierPanel5,
  BarrierBrick,
  BarrierBrickWhite,
  BarrierBrickThemed,
  BarrierStone,
  BarrierStoneThemed,
  BarrierPanelWhite,
  BarrierCompPanel,
  BarrierGrateWhite,
  BarrierGrateYellow,
  BarrierRuby,
  BarrierFanDuct,
  BarrierExhaustPlate,
  BarrierMetalPlate2,
  Door,
  Deco1,
  Deco2,
  Apple,
  Portal0,
  Portal1,
  Portal2,
  Portal3,
  Portal4,
  Portal5,
  Portal6,
  Portal7,
  Portal8,
  Portal9,
  KeyYellow,
  KeyRed,
  KeyBlue,
  LockYellow,
  LockRed,
  LockBlue,
  Nospawn,
  ThreatMine,
  ThreatBomb,
  ThreatLaserDiode,
  ThreatExplodableBarrel,
  ThreatBarricade,
  ThreatSpikes,
  ThreatWallSpikes,
  ThreatSaw,
  ThreatFlamethrower,
  PickupInvincibility,
  PickupReversibility,
  PickupArmor,
  PickupHealthPack,
  PickupWeightLossPill,
  SwitchButton,
  Pipe,
};

export enum Initiator {
  None = 0,
  UI,
  User,
  MainMenu,
  SettingsMenu,
  LevelSelectMenu,
  GameModeMenu,
}

export enum InputAction {
  None = 0,
  ForceRerender,
  HideStartScreen,
  ShowMainMenu,
  HideMainMenu,
  ConfirmGotoMainMenu,
  ConfirmQuitGame,
  ShowSettingsMenu,
  HideSettingsMenu,
  ShowLevelSelectMenu,
  HideLevelSelectMenu,
  ShowGameModeMenu,
  HideGameModeMenu,
  RetryLevel,
  StartGame,
  // TODO: REMOVE THESE TOGGLE INPUT ACTIONS??
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
  spawnInvincibilityPickups: boolean, // default: false
  spawnMines: boolean, // default: false
  spawnBombs: boolean, // default: false
  spawnBarrels: boolean, // default: false
  spawnLasers: boolean, // default: false
  snakeStartSize: number, // default: START_SNAKE_SIZE
  growthMod: number, // default: 1
  extraHurtGraceTime: number, // default: 0
  globalLight: number, // default: 1
  pipeVariant: PipeVariant,
  palette: Palette,
  portalExitConfig: Record<PortalChannel, PortalExitMode>,
  musicTrack: MusicTrack,
}

export type Maybe<T> = T | null | undefined;

export interface EditorData {
  applesMap: Record<number, Maybe<boolean>>,
  threatsMap: Record<number, Maybe<ThreatType>>,
  switchesMap: Record<number, Maybe<SwitchType>>,
  pipesMap: Record<number, Maybe<boolean>>,
  pickupsMap: Record<number, PickupType>,
  barriersMap: Record<number, Maybe<BarrierType>>,
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
  threat: Maybe<ThreatType>,
  switch: Maybe<SwitchType>,
  pipe: Maybe<boolean>,
  pickup: Maybe<PickupType>,
  barrier: Maybe<BarrierType>,
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
  barriers: Barrier[],
  doors: Vector[],
  apples: Vector[],
  threats: LevelThreat[],
  pickups: LevelPickup[],
  switches: LevelSwitch[],
  pipes: Vector[],
  fireTiles: Vector[],
  decoratives1: Vector[],
  decoratives2: Vector[],
  nospawns: Vector[],
  portals: Record<PortalChannel, Vector[]>,
  playerSpawnPosition: Vector,
  keys: Key[],
  locks: Lock[],
  barriersMap: Record<number, BarrierType>,
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
  acquireShield = 'acquireShield',
  acquireHealth = 'acquireHealth',
  acquireEpicItem = 'acquireEpicItem',
  acquireRareItem = 'acquireRareItem',
  acquireLegendaryItem = 'acquireLegendaryItem',
  alarm = 'alarm',
  burn = 'burn',
  death = 'death',
  doorOpen = 'doorOpen',
  doorOpenHuge = 'doorOpenHuge',
  eat = 'eat',
  electrocuteLoop = 'electrocuteLoop',
  guitarRiff1 = 'guitarRiff1',
  guitarRiff2 = 'guitarRiff2',
  hurt1 = 'hurt1',
  hurt2 = 'hurt2',
  hurt3 = 'hurt3',
  hurtSave = 'hurtSave',
  invincibleLoop = 'invincibleLoop',
  moveStart = 'moveStart',
  pickup = 'pickup',
  pickupInvincibility = 'pickupInvincibility',
  rewindLoop = 'rewindLoop',
  shieldSpawn = 'shieldSpawn',
  spawnPickup = 'spawnPickup',
  step1 = 'step1',
  step2 = 'step2',
  uiBlip = 'uiBlip',
  uiChip = 'uiChip',
  uiChipLoop = 'uiChipLoop',
  uiConfirm = 'uiConfirm',
  unlock = 'unlock',
  unlockAbility = 'unlockAbility',
  warp = 'warp',
  waterSplash = 'waterSplash',
  winGame = 'winGame',
  winLevel = 'winLevel',
  xplode = 'xplode',
  xplode3 = 'xplode3',
  xplodeLong = 'xplodeLong',
  xpound = 'xpound',
}

export interface SfxSound {
  play: () => void
  stop: () => void
  volume: ((volume?: number) => number)
  loop: ((val?: boolean) => boolean)
  playing: () => boolean
}

export interface AudioInfo {
  path: string,
  /**
   * duration in seconds
   */
  durationMs: number,
  loop: boolean,
}

// export type SoundVariants = Record<keyof typeof Sound, Howl>
export type SoundVariants = Record<keyof typeof Sound, SfxSound>


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
  full_simpleTime = '01-simpletime5-full.wav',
  full_transient = '03-transient-4-FULL.wav',
  full_dangerZone = '06-dangerzone-FULL.wav',
  full_creeplord = '08-creeplord-FULL-2.wav',
  full_slyguy = '21-slyguy-FULL.wav',
  full_moneymaker = '09-snekmoney-FULL3.wav',
  slime_dangerman = '90-dangerman_180.mp3',
  slime_exitmusic = '91-exitmusic_245.mp3',
  slime_megacreep = '92-megacreep_120.mp3',
  slime_monsterdance = '93-monsterdance_150.mp3',
  slime_rollcredits = '94-rollcredits_110.mp3',
}

export type UnlockedMusicTracks = Record<MusicTrack, boolean>

export interface AnimationData {
  frames: number,
  timePerFrame: number,
  /**
   * Set explicit time per each frame. Array length must match number of frames.
   */
  durations?: number[],
  /**
   * Whether animation plays once and stops on the last frame. Default=false
   */
  oneShot?: boolean,
  /**
   * Specify which frame to cycle back to for animation loop
   */
  loopFrameOffset?: number,
  /**
   * Specify explicit frame width
   */
  frameWidth?: number,
  /**
   * Specify explicit frame height
   */
  frameHeight?: number,
}

export interface AnimationDataForRange extends AnimationData {
  src: SpritesheetImage,
  offset: number,
}

export enum Image {
  __TEST__ = '__TEST__',
  ThemedAppleSheet = '__apple-sheet-rendered-at-runtime__',
  ThemedBarrierSkull = '__barrier-skull-rendered-at-runtime__',
  ThemedBarrierIndent = '__barrier-indent-rendered-at-runtime__',
  ThemedBarrierFlat = '__barrier-flat-rendered-at-runtime__',
  ThemedBarrierPyramid = '__barrier-pyramid-rendered-at-runtime__',
  ThemedBarrierBrick = '__barrier-bricks-rendered-at-runtime__',
  ThemedBarrierStone = '__barrier-stone-rendered-at-runtime__',
  ThemedPortalColumns = '__barrier-portal-columns-rendered-at-runtime__',
  ThemedPipes1 = '__pipes1-rendered-at-runtime__',
  ThemedPipes2 = '__pipes2-rendered-at-runtime__',
  ThemedPipes3 = '__pipes3-rendered-at-runtime__',
  ThemedDoor = '__door-rendered-at-runtime__',
  ThemedDoorAlt = '__door-alt-rendered-at-runtime__',
  ThemedSegmentNE = '__segment-ne-rendered-at-runtime__',
  ThemedSegmentSE = '__segment-se-rendered-at-runtime__',
  ThemedSegmentSW = '__segment-sw-rendered-at-runtime__',
  ThemedSegmentNW = '__segment-nw-rendered-at-runtime__',
  AppleTemplateSheet = 'snek-apple-sheet.png',
  SnekHead = 'snek-head.png',
  SnekHeadDead = 'snek-head-dead.png',
  SnekSegmentDark = 'snek-segment-dark.png',
  SnekSegmentB = 'snek-segment-b.png',
  SnekSegmentD = 'snek-segment-d.png',
  SnekSegmentE = 'snek-segment-e.png',
  SegmentsSheet = 'snek-segments-sheet.png',
  SnekButt = 'snek-butt.png',
  ControlsKeyboardMove = 'controls-keyboard-move2.png',
  ControlsKeyboardTurn = 'controls-keyboard-turn2.png',
  ControlsKeyboardDelete = 'controls-keyboard-delete.png',
  ControlsKeyboardSprint = 'controls-keyboard-sprint.png',
  ControlsGamepadMove = 'controls-gamepad-move.png',
  ControlsGamepadTurn = 'controls-gamepad-turn.png',
  ControlsGamepadRewind = 'controls-gamepad-rewind.png',
  ControlsGamepadSprint = 'controls-gamepad-sprint.png',
  ControlsMouseLeft = 'controls-mouse-left.png',
  KeySheet = 'snek-key2.png',
  LockSheet = 'snek-lock.png',
  Shield = 'snek-shield.png',
  ShieldSpawn = 'snek-shield-spawn.png',
  PickupArrows = 'pickup-arrows.png',
  UIKeysSheet = 'snek-smkey2-sheet.png',
  UIShieldSheet = 'snek-shield-sm.png',
  UILocked = 'ui-locked.png',
  UIFlamesheet = 'ui-flame-sheet-2.png',
  Darken = 'darken2.png',
  EditorSelection = 'editor-selection.png',
  EditorSelectionBlue = 'editor-selection-blue.png',
  EditorSelectionRed = 'editor-selection-red.png',
  MineSheet = 'snek-mine-sheet.png',
  ThreatSheet16 = 'snek-threats-16.png',
  ThreatSheet48 = 'snek-threats-48.png',
  ButtonSheet = 'snek-button.png',
  ThreatWallSpikesSheet = 'snek-threat-wall-blades.png',
  ThreatSawSheet = 'snek-threat-saw-blade-16.png',
  ThreatFlameSheet = 'snek-threat-flame.png',
  ExplosionSheet = 'snek-explosion-sheet.png',
  Explosion3Sheet = 'snek-explosion-3.png',
  SmokeSheet = 'snek-smoke.png',
  BigSmokeSheet = 'snek-smoke-big.png',
  PuffSheet = 'snek-puff.png',
  WearablesSheet = 'snek-wearables.png',
  DoorLightSheet = 'snek-door-light-sheet.png',
  DoorOpenSheet = 'snek-door-open.png',
  PreyGrubSheet = 'snek-prey-grub.png',
  PreyAntSheet = 'snek-prey-ant.png',
  PreyMouseSheet = 'snek-prey-mouse.png',
  PreyGrasshopperSheet = 'snek-prey-grasshopper.png',
  FireSheet = 'snek-fire6.png',
  TileSheet16 = 'snek-tiles-16.png',
  TileSheet48 = 'snek-tiles-48.png',
  PipesSheet = 'snek-pipes.png',
  PickupsSheet = 'snek-pickups.png',
  Pickups2Sheet = 'snek-pickups-2.png',
  PickupOutlineYellowSheet = 'snek-pickup-outline-yellow.png',
  PickupOutlineBlueSheet = 'snek-pickup-outline-blue.png',
  Points500 = 'snek-points-500.png',
  Points1000 = 'snek-points-1000.png',
  Points2000 = 'snek-points-2000.png',
  Points5000 = 'snek-points-5000.png',
  Points10000 = 'snek-points-10000.png',
}

export type ThemedImage =
  | Image.ThemedAppleSheet
  | Image.ThemedBarrierIndent
  | Image.ThemedBarrierSkull
  | Image.ThemedBarrierFlat
  | Image.ThemedBarrierPyramid
  | Image.ThemedBarrierBrick
  | Image.ThemedBarrierStone
  | Image.ThemedPortalColumns
  | Image.ThemedDoor
  | Image.ThemedDoorAlt
  | Image.ThemedSegmentNE
  | Image.ThemedSegmentSE
  | Image.ThemedSegmentSW
  | Image.ThemedSegmentNW
  | Image.ThemedPipes1
  | Image.ThemedPipes2
  | Image.ThemedPipes3
;

// a range of sprites selected from a larger spritesheet
export enum SpritesheetRange {
  None = 1000, // segment test
  DiodeCrit,
  DiodeBlue,
  DiodeRed,
  LaserBlue,
  LaserRed,
  Bomb,
  BombCrit,
  Barrel,
  BarrelFireA,
  BarrelFireB,
  BarrelRupture,
  BarricadeDeploy,
  BarricadeRetract,
  Spikes,
  WallSpikesDeploy,
  WallSpikesRetract,
  SawActive,
  SawOff,
  FireTile,
  FlamethrowerActive,
  FlamethrowerOff,
  BigSmokeActive,
  BigSmokeOff,
  Burn,
}
export const SPRITESHEET_RANGE_MAX = Math.max(...Object.values(SpritesheetRange).filter(v => typeof v === 'number')) + 1;

export type SpritesheetImage =
  | Image.__TEST__
  | Image.ThemedAppleSheet
  | Image.ThemedPipes1
  | Image.ThemedPipes2
  | Image.ThemedPipes3
  | Image.DoorOpenSheet
  | Image.KeySheet
  | Image.LockSheet
  | Image.SegmentsSheet
  | Image.MineSheet
  | Image.ExplosionSheet
  | Image.Explosion3Sheet
  | Image.SmokeSheet
  | Image.BigSmokeSheet
  | Image.PuffSheet
  | Image.FireSheet
  | Image.TileSheet16
  | Image.TileSheet48
  | Image.PipesSheet
  | Image.PickupsSheet
  | Image.Pickups2Sheet
  | Image.UIKeysSheet
  | Image.WearablesSheet
  | Image.DoorLightSheet
  | Image.PreyGrubSheet
  | Image.PreyAntSheet
  | Image.PreyMouseSheet
  | Image.PreyGrasshopperSheet
  | Image.Points500
  | Image.Points1000
  | Image.Points2000
  | Image.Points5000
  | Image.Points10000
  | Image.Shield
  | Image.ShieldSpawn
  | Image.PickupOutlineYellowSheet
  | Image.PickupOutlineBlueSheet
  | Image.UIShieldSheet
  | Image.ThreatSheet16
  | Image.ThreatSheet48
  | Image.ButtonSheet
  | Image.ThreatWallSpikesSheet
  | Image.ThreatSawSheet
  | Image.ThreatFlameSheet
;

export enum Threat48Frame {
  None = 0,
  RedTarget0,
  RedTarget1,
  RedTarget2,
  YellowTarget0,
  YellowTarget1,
  YellowTarget2,
  Barrel,
  BarrelFireA0,
  BarrelFireA1,
  BarrelFireA2,
  BarrelFireA3,
  BarrelFireB0,
  BarrelFireB1,
  BarrelFireB2,
  BarrelFireB3,
  BarrelRupture0,
  BarrelRupture1,
  BarrelRupture2,
  BarrelRupture3,
  Burn0,
  Burn1,
  Burn2,
  Burn3,
}
export const FRAME_COUNT_THREAT_48 = Math.max(...Object.values(Threat48Frame).filter(v => typeof v === 'number'));

export enum Threat16Frame {
  None = 0,
  DiodeOff,
  DiodeCrit0,
  DiodeCrit1,
  DiodeLightRed,
  DiodeLightBlue,
  DiodeRed0,
  DiodeRed1,
  DiodeRed2,
  DiodeRed3,
  DiodeBlue0,
  DiodeBlue1,
  DiodeBlue2,
  DiodeBlue3,
  LaserRed0,
  LaserRed1,
  LaserRed2,
  LaserRed3,
  LaserBlue0,
  LaserBlue1,
  LaserBlue2,
  LaserBlue3,
  ClawMount,
  ClawArm,
  ClawOpen,
  ClawClosed,
  Bomb0,
  Bomb1,
  Bomb2,
  Bomb3,
  BombCrit0,
  BombCrit1,
  BombCrit2,
  BombCrit3,
  FlamethrowerActive,
  FlamethrowerOff,
  WarningSignYellow,
  WarningSignRed0,
  WarningSignRed1,
}
export const FRAME_COUNT_THREAT_16 = Math.max(...Object.values(Threat16Frame).filter(v => typeof v === 'number'));

export enum ButtonSheetFrame {
  None = 0,
  Button1Ready,
  Button1Off,
  Button2Ready,
  Button2Off,
  BarricadeActive0,
  BarricadeActive1,
  BarricadeActive2,
  BarricadeCollapse0,
  BarricadeCollapse1,
  BarricadeCollapse2,
  SpikeDeathOverlay,
  SpikeBlood,
  SpikeBloodRetracted,
  SpikeRetracted,
  SpikeActive0,
  SpikeActive1,
  SpikeActive2,
  SpikeActive3,
  SpikeActive4,
  SpikeActive5,
}

export enum ThreatWallSpikesFrame {
  None = 0,
  Retracted,
  Active0,
  Active1,
  Active2,
  Active3,
  Active4,
  Active5,
  Active6,
  Active7,
  Active8,
  Active9,
  Retract0,
  Retract1,
  Retract2,
  Retract3,
  DeathOverlay,
}

export enum ThreatSawFrame {
  None = 0,
  Retracted,
  Active0,
  Active1,
  Active2,
  Active3,
  Active4,
  Active5,
  Active6,
  Active7,
  Active8,
  Retract0,
  Retract1,
}

export enum ThreatFlameFrame {
  None = 0,
  Start0,
  Start1,
  Active0,
  Active1,
  Active2,
  Active3,
  Off0,
  Off1,
  Off2,
  Off3,
}

export enum SegmentFrame {
  None = 0,
  Test,
  Path,
  SkelSegment1,
  SkelSegment2,
  SkelSegTurn,
  SkelHead,
}

export enum WearableFrame {
  None = 0,
  CowboyHat = 1,
  ChefHat = 2,
  IndianaJonesHat = 3,
  Sunglasses = 4,
  Monocle = 5,
  TechVisor = 6,
  Glasses = 7,
  Mustache = 9,
  BanditMask = 10,
  PirateOutfit = 11,
  CatEars = 12,
  Horns = 13,
  NinjaBlue = 14,
  NinjaPurple = 15,
  BaseballCap = 16,
  VikingHelmet = 17,
  LuchadoreMaskRed = 18,
  LuchadoreMaskBlue = 19,
  MexicanBlanket = 20,
  RoyalCape = 21,
  Crown = 22,
  Cone = 23,
  Crusher = 24,
  CrusherSeg1 = 25,
  CrusherSeg2 = 26,
}

export enum WearableType {
  None = 0,
  Exclusive, // pirate costume, luchador masks, etc.
  Hat,
  Eyes,
  Back,
  Hair,
}

export enum ExplosionType {
  None = 0,
  Small = 1,
  Large = 2,
}

export enum SmokeType {
  None = 0,
  Small = 1,
  Large = 2,
  LargeDissipate = 3,
}

export interface Scene {
  draw: () => void
  keyPressed: (event?: object) => void
  cleanup: () => void
  action: () => IEnumerator
}

export interface SceneCallbacks {
  onSceneStart?: () => void
  onSceneEnded?: () => void
  onEscapePress?: () => void
}

export interface SceneCachedBindings {
  readonly draw: () => void
  readonly keyPressed: (event?: object) => void
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
  randomizeSpawnPos?: boolean,
  easingFnc?: (x: number) => number,
}

export enum ItemDropType {
  None = 0,
  Invincibility,
  Armor,
  Mine,
  Bomb,
  ExplodableBarrel,
  LaserDiode,
  Spikes,
  HealthPack,
  WeightLossPill,
  Reversibility,
  Pickup,
}

export enum PickupRarity {
  None = 0,
  Common, // 100
  Rare, // 500
  Epic, // 2000
  Legendary, // 5000
  Galactic, // 10000
}

export enum PickupType {
  None = 0,
  // --- snek-pickups.ase ---
  Invincibility,
  Reversibility,
  Armor,
  HealthPack,
  WeightLossPill,
  // common items
  Cheese,
  Carrot,
  Potato,
  Tomato,
  Onion,
  Cabbage,
  Broccoli,
  Mushroom,
  BreadLoaf,
  Cucumber,
  // rare items
  Pretzel,
  Taco,
  Drumstick,
  Burger,
  PizzaSlice,
  HotDog,
  Egg,
  Fries,
  Candy,
  ChocolateBar,
  Popsicle,
  Lollipop,
  Muffin,
  Croisant,
  Baguette,
  Cupcake,
  Donut,
  // epic items
  Banana,
  Watermelon,
  Mango,
  Grapes,
  Kiwi,
  Orange,
  Cherries,
  Pear,
  Peach,
  Lemon,
  Lime,
  // legendary items
  Strawberry,
  GoldenApple,
  RainbowCake,
  Sushi,
  Milkshake,
  ChiliPepper,
  // --- snek-pickups-2.ase ---
  __PICKUPS2_OFFSET__,
  // sweet treats
  CherryPie,
  ChocolateCake,
  Cheesecake,
  PumpkinMuffin,
  ChocolateMuffin,
  ChocolateCupcake,
  BigCake,
  NeopolitanIceCream,
  Popsicle2,
  ChocolatePopsicle,
  Cupcake2,
  StrawberryIceCreamCone,
  Donut2,
  Donut3,
  Peppermint,
  CandyGreen,
  Oreo,
  Cookie,
  ChocolateBar2,
  Nouget,
  Pie1, // dutch apple
  Pie2, // pecan
  Pie3, // pumpkin
  Pie4,
  Pie5,
  // meats
  Meat1,
  Meat2,
  Meat3,
  Meat4,
  Meat5,
  Meat6,
  Meat7,
  Meat8,
  Meat9,
  Bone,
  // vegetables
  Turnip,
  Eggplant,
  Mushroom2,
  Vidalia1,
  Vidalia2,
  Pickle,
  Mushroom3,
  Tomato2,
  Lettuce,
  Carrot2,
  Garlic,
  Celery,
  PotatoSprouts,
  Mint,
  Jalapeño,
  Habañero,
  ChiliPepper2,
  Burger2,
  Taco2,
  Burrito,
  PizzaSlice2,
  PizzaPie,
  Quiche1,
  Quiche2,
  Sushi2,
  Dish1,
  Dish2,
  BowlSoup,
  Steak,
  FishPurple,
  ShrimpRaw,
  ShrimpCooked,
  Shishkabob,
  Fish1,
  Fish2,
  Fish3,
  Tuna,
  Eel,
  Cheese2,
  Egg2,
  BreadLoaf2,
  Cracker,
  Peanut,
  Chestnut,
  Walnut,
  Coconut,
  Honeypot,
  Butter,
  Salt,
  // fruits
  BananaBunch,
  Apple,
  AppleGreen,
  Strawberry2,
  Grapes2, // green
  Grapes3, // red
  Watermelon2,
  Pear2,
  Orange2,
  // drinks
  Milk,
  Cocktail,
  Cappuccino,
  Coffee,
  Latte,
  WaterVase,
  Beer1,
  Beer2,
  // potions
  PotionGreen,
  PotionRed,
  PotionHealth,
}
export const PICKUP_TYPE_MAX = Math.max(...Object.values(PickupType).filter(v => typeof v === 'number')) + 1;

export enum PreyType {
  None = 0,
  Grub,
  FieldMouse,
  Ant,
  Grasshopper,
}

export interface PreySpawn {
  /**
   * Define prey spawns - drops are by num apples eaten, not frame
   */
  dropsByFrame: Record<number, PreyType> | undefined,
}

export interface WithLifetime<T> {
  lifetime: number,
  type: T,
}

export interface Pickup extends WithLifetime<PickupType> {}

export interface PickupDrop {
  likelihood: number,
  type: ItemDropType,
}

export interface ICollection {
  existsAt: (x: number, y: number) => boolean,
  existsAtCoord: (coord: number) => boolean,
  getClosestTraversalDistance: (x: number, y: number) => number,
}

export interface IFlaggable {
  hasFlagAt: (x: number, y: number, flag: number) => boolean,
  addFlagAt: (x: number, y: number, flag: number) => void,
  removeFlagAt: (x: number, y: number, flag: number) => void,
  bulkAddFlag: (flag: number) => void;
  bulkRemoveFlag: (flag: number) => void;
}

export enum SNEKALYTICS_EVENT_TYPE {
  DEATH = 'DEATH',
  WARP = 'WARP',
  WIN_LEVEL = 'WIN_LEVEL',
  WIN_GAME = 'WIN_GAME',
  NEW_GAME = 'NEW_GAME',
  QUIT_GAME = 'QUIT_GAME',
}
