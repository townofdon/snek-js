import { DEFAULT_PORTALS, DIFFICULTY_EASY, MAX_LIVES } from "./constants";
import { MAIN_TITLE_SCREEN_LEVEL } from "./levels/levelConstants";
import {
  AppMode,
  BaseStats,
  EngineState,
  GameMode,
  GameState,
  HeldItems,
  DamageType,
  InputType,
  Mapset,
  Outfit,
  PickupType,
  WearableFrame,
} from "./types";

export const DEFAULT_GAME_STATE: GameState = {
  appMode: AppMode.StartScreen,
  gameMode: GameMode.Normal,
  mapset: Mapset.Campaign,
  isRandomizer: false,
  isPreloaded: false,
  isGameStarted: false,
  isGameStarting: false,
  isPaused: false,
  isMoving: false,
  isSprinting: false,
  isRewinding: false,
  isButtonPressed: false,
  isLost: false,
  isGameWon: false,
  isDoorsOpen: false,
  isExitingLevel: false,
  isExited: false,
  isInvertedColors: false,
  levelIndex: 0,
  actualTimeElapsed: 0,
  timeElapsed: 0,
  timeSinceLastMove: Infinity,
  timeSinceLastTeleport: Infinity,
  timeSinceHurt: Infinity,
  timeSinceHurtForgiveness: Infinity,
  timeSinceLastInput: Infinity,
  timeSinceInvincibleStart: Infinity,
  timeSinceElectrocutionStart: Infinity,
  timeSinceReverseStart: Infinity,
  timeSinceSpawnedWeightLossPillPickup: Infinity,
  timeSinceSpawnedAnyPickup: Infinity,
  timeSinceGraceStarted: 0,
  timeSinceArmorProtection: Infinity,
  timeSinceArmorPickup: Infinity,
  timeSinceLungeStart: Infinity,
  timeSinceButtonPressChanged: Infinity,
  acquireProgression: 0,
  lives: MAX_LIVES,
  collisions: 0,
  targetSpeed: 1,
  currentSpeed: 1,
  pity: 0,
  steps: 0,
  frameCount: 0,
  numTeleports: 0,
  lastHurtBy: DamageType.None,
  hasKeyYellow: false,
  hasKeyRed: false,
  hasKeyBlue: false,
  nextLevel: null,
  inputType: InputType.Keyboard,
} satisfies GameState;

export const DEFAULT_ENGINE_STATE: EngineState = {
  level: MAIN_TITLE_SCREEN_LEVEL,
  difficulty: { ...DIFFICULTY_EASY },
  moves: [],
  recentMoves: [null, null, null, null],
  recentInputs: [null, null, null, null],
  recentInputTimes: [Infinity, Infinity, Infinity, Infinity],
  barriers: [],
  doors: [],
  decoratives1: [],
  decoratives2: [],
  keys: [],
  locks: [],
  passablesMap: {},
  barriersMap: {},
  doorsMap: {},
  pickupsMap: {},
  nospawnsMap: {},
  keysMap: {},
  locksMap: {},
  diffSelectMap: {},
  portals: { ...DEFAULT_PORTALS() },
  portalsMap: {},
  threatsMap: {},
  lasersMap: {},
  switchesMap: {},
} satisfies EngineState;

export const DEFAULT_BASE_STATS = {
  score: 0,
  numDeaths: 0,
  numLevelsCleared: 0,
  numLevelsEverCleared: 0,
  numPointsEverScored: 0,
  numApplesEverEaten: 0,
  totalGameTimeElapsed: 0,
} satisfies BaseStats;

export const DEFAULT_WEARABLES_UNLOCKED: Record<WearableFrame, boolean> = Object.values(WearableFrame)
  .filter(v => typeof v !== 'string')
  .reduce((acc, wearable) => {
    acc[wearable] = false;
    return acc;
  }, {} as Record<WearableFrame, boolean>) satisfies Record<WearableFrame, boolean>;

export const DEFAULT_OUTFIT: Outfit = {
  exclusive: WearableFrame.None,
  hat: WearableFrame.None,
  eyes: WearableFrame.None,
  back: WearableFrame.None,
  hair: WearableFrame.None,
} satisfies Outfit;

export const DEFAULT_HELD_ITEMS = {
  armor: 0,
  reversibles: 0,
} satisfies HeldItems;

export const DEFAULT_PICKUP_TYPES: PickupType[] = [
  PickupType.Cheese,
  PickupType.Carrot,
  PickupType.Potato,
  PickupType.Tomato,
  PickupType.Onion,
  PickupType.Cabbage,
  PickupType.Broccoli,
  PickupType.Mushroom,
  PickupType.BreadLoaf,
  PickupType.Cucumber,
]
