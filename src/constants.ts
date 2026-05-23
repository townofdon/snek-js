import P5 from "p5";
import Color from "color";

import {
  AnimationData,
  AnimationDataForRange,
  ButtonSheetFrame,
  Difficulty,
  Image,
  MusicTrack,
  PickupType,
  PortalChannel,
  SpritesheetImage,
  SpritesheetRange,
  Threat16Frame,
  Threat48Frame,
  ThreatSawFrame,
  ThreatWallSpikesFrame,
  WearableFrame,
  WearableType,
} from "./types";

export const TITLE = 'SNEK';

export const SHOW_FPS = false;
export const DEBUG_EASY_LEVEL_EXIT = false;
export const DISABLE_TRANSITIONS = false;
export const RECORD_REPLAY_STATE = false;
export const VERSION = process.env.__VERSION__;
export const COMMIT_HASH = process.env.__COMMIT_HASH__;
export const IS_DEV = window.location.href.includes('localhost') || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
export const IS_LOCALHOST = window.location.href.includes('localhost');
export const IS_NWJS_PACKAGE = process.env.__NWJS_PACKAGE__ || false;
const IS_EDITOR = window.location.pathname.includes('editor') || window.location.pathname.includes('astar-tester');

export const LEADERBOARD_API_HOST = 'https://dontownsendcreative.com/snek-leaderboard';
export const MAP_API_HOST = 'https://dontownsendcreative.com/snek-leaderboard';
// export const LEADERBOARD_API_HOST = 'http://localhost:8000';
// export const MAP_API_HOST = 'http://localhost:8000';

export const MAX_GAIN_MUSIC = 0.6;
export const DEFAULT_VOLUME_SFX = 1;

export const ACCENT_COLOR = "#FFB41F";
export const SECONDARY_ACCENT_COLOR = "#15C2CB";
export const SECONDARY_ACCENT_COLOR_BG = Color("#119DA4").darken(0.4).hex();
export const GLOBAL_LIGHT_DEFAULT = 1;
export const LIGHTMAP_RESOLUTION = 1;

export const FRAMERATE = 90;
export const FRAME_DUR_MS = (1 / FRAMERATE) * 1000;

/**
 * SPRITE SIZE IS TYPICALLY 16X16 - 20x20 WAS LEGACY BUT KEPT FOR EDITOR DIMENSIONS FOR SIMPLICITY
 */
export const DIMENSIONS = IS_EDITOR ? { x: 600, y: 600 } as const : { x: 960, y: 960 } as const;
export const GRIDCOUNT_X = 30;
export const GRIDCOUNT_Y = 30;
export const STROKE_SIZE = IS_EDITOR ? 4 : 8;

export const BLOCK_SIZE_X = IS_EDITOR ? 20 : 32;
export const BLOCK_SIZE_Y = IS_EDITOR ? 20 : 32;
export const MAP_OFFSET = IS_EDITOR ? 2 : 4;
export const IMG_X_OFFSET = IS_EDITOR ? 1 : 0;
export const IMG_SCALE = IS_EDITOR ? 1.01 : 1;

export const MAX_MOVES_GAMEPAD = 8;
export const MAX_MOVES = 5;
export const MAX_LIVES = 3;
export const MAX_SNAKE_SIZE = GRIDCOUNT_X * GRIDCOUNT_Y * 0.40;
export const START_SNAKE_SIZE = 3;
export const SPEED_INCREMENT_SPEED_MS = 600;
export const SPRINT_INCREMENT_SPEED_MS = 250;
export const NUM_APPLES_START = 3;

export const SCORE_INCREMENT = 10;
export const CLEAR_BONUS = 40;
export const LEVEL_BONUS = 500;
export const LIVES_LEFT_BONUS = 1000;
export const ALL_APPLES_BONUS = 2500;
export const ALL_LOCKS_BONUS = 2500;
export const PERFECT_BONUS = 5000;
export const COBRA_SCORE_MOD = 1.2;
export const DEFAULT_PAR_TIME = 60000;

export const PICKUP_INVINCIBILITY_BONUS = 1000;
export const PICKUP_COMMON_BONUS = 500;
export const PICKUP_RARE_BONUS = 1000;
export const PICKUP_EPIC_BONUS = 2000;
export const PICKUP_LEGENDARY_BONUS = 5000;
export const PICKUP_GALACTIC_BONUS = 10000;

export const DROP_LIKELIHOOD_INVINCIBILITY = 0.04;
export const DROP_LIKELIHOOD_MINE = 0.08;
export const DROP_LIKELIHOOD_ARMOR = 0.02;
export const DROP_LIKELIHOOD_HEALTHPACK = 0.08;
export const DROP_LIKELIHOOD_WEIGHTLOSSPILL = 0.08;
export const DROP_LIKELIHOOD_ITEM_COMMON = 0.6;
export const DROP_LIKELIHOOD_ITEM_RARE = 0.03;
export const DROP_LIKELIHOOD_ITEM_EPIC = 0.09;
export const DROP_LIKELIHOOD_ITEM_LEGENDARY = 0.001;

export const PICKUP_LIFETIME_MS = 15000;
export const PICKUP_EXPIRE_WARN_MS = 3500;
export const PICKUP_SPAWN_SFX_DELAY = 200;
export const PICKUP_SPAWN_COOLDOWN = 5000;
export const PICKUP_INVINCIBILITY_SPAWN_COOLDOWN = 10000;
export const PICKUP_WEIGHTLOSSPILL_SPAWN_COOLDOWN = 60000;

export const BASE_PICKUP_RARITY = 0.5;
export const RARITY_COMMON = 0.6;
export const RARITY_RARE = 0.3;
export const RARITY_EPIC = 0.09;
export const RARITY_LEGENDARY = 0.01;
export const PITY_INCREMENT = 1 / 30;


export const INVINCIBILITY_PICKUP_LIFETIME_MS = 8000;
export const INVINCIBILITY_PICKUP_FREEZE_MS = 1000;
export const INVINCIBILITY_EXPIRE_WARN_MS = 2000;
export const INVINCIBILITY_EXPIRE_FLASH_MS = 200;
export const INVINCIBILITY_COLOR_CYCLE_MS = 20;

export const ARMOR_PICKUP_FREEZE_MS = 1400;
export const ELECTROCUTION_DURATION_MS = 1400;
export const ELECTROCUTION_FLASH_RATE = 70;
export const LASER_DIODE_CRIT_LIFETIME = 3000;
export const BARREL_WARN_LIFETIME = 10000;
export const BARREL_CRIT_LIFETIME = 2000;
export const BARREL_CASCADE_LIFETIME = 400;
export const THREAT_LASER_MAX_SPAN = 7;
export const SMOKE_LIFETIME = 4000;
export const BUTTON_RELEASE_DAMAGE_DELAY = 400;

export const TIME_WAIT_BEFORE_REWIND = 80;
export const TIME_REWIND_TAKEOVER_CONTROLS = 200;

const INVINCIBILITY_TIME_EASY = 12000;
const INVINCIBILITY_TIME_MEDIUM = 10000;
const INVINCIBILITY_TIME_HARD = 9000;
const INVINCIBILITY_TIME_ULTRA = 8000;

const BONUS_MOD_EASY = .1;
const BONUS_MOD_MEDIUM = .5;
const BONUS_MOD_HARD = 4;
const BONUS_MOD_ULTRA = 12;

const SCORE_MOD_EASY = .5;
const SCORE_MOD_MEDIUM = 2;
const SCORE_MOD_HARD = 5;
const SCORE_MOD_ULTRA = 10;

const NUM_APPLES_MOD_EASY = .6;
const NUM_APPLES_MOD_MEDIUM = 1;
const NUM_APPLES_MOD_HARD = 1.1;
const NUM_APPLES_MOD_ULTRA = 1.5;

const SPEED_START_EASY = 300;
const SPEED_START_MEDIUM = 260;
const SPEED_START_HARD = 190;
const SPEED_START_ULTRA = 88;

const SPEED_STEPS_EASY = 20;
const SPEED_STEPS_MEDIUM = 20;
const SPEED_STEPS_HARD = 15;
const SPEED_STEPS_ULTRA = 6;

export const SPEED_LIMIT_EASY = 88;
export const SPEED_LIMIT_MEDIUM = 56;
export const SPEED_LIMIT_HARD = 38;
export const SPEED_LIMIT_ULTRA = 25;
export const SPEED_LIMIT_ULTRA_SPRINT = 15;

export const DIFFICULTY_EASY: Difficulty = {
  index: 1,
  applesMod: NUM_APPLES_MOD_EASY,
  scoreMod: SCORE_MOD_EASY,
  bonusMod: BONUS_MOD_EASY,
  speedStart: SPEED_START_EASY,
  speedLimit: SPEED_LIMIT_EASY,
  speedSteps: SPEED_STEPS_EASY,
  sprintLimit: SPEED_LIMIT_HARD,
  invincibilityTime: INVINCIBILITY_TIME_EASY,
} as const
export const DIFFICULTY_MEDIUM: Difficulty = {
  index: 2,
  applesMod: NUM_APPLES_MOD_MEDIUM,
  scoreMod: SCORE_MOD_MEDIUM,
  bonusMod: BONUS_MOD_MEDIUM,
  speedStart: SPEED_START_MEDIUM,
  speedLimit: SPEED_LIMIT_MEDIUM,
  speedSteps: SPEED_STEPS_MEDIUM,
  sprintLimit: SPEED_LIMIT_HARD,
  invincibilityTime: INVINCIBILITY_TIME_MEDIUM,
} as const
export const DIFFICULTY_HARD: Difficulty = {
  index: 3,
  applesMod: NUM_APPLES_MOD_HARD,
  scoreMod: SCORE_MOD_HARD,
  bonusMod: BONUS_MOD_HARD,
  speedStart: SPEED_START_HARD,
  speedLimit: SPEED_LIMIT_HARD,
  speedSteps: SPEED_STEPS_HARD,
  sprintLimit: SPEED_LIMIT_ULTRA,
  invincibilityTime: INVINCIBILITY_TIME_HARD,
} as const
export const DIFFICULTY_ULTRA: Difficulty = {
  index: 4,
  applesMod: NUM_APPLES_MOD_ULTRA,
  scoreMod: SCORE_MOD_ULTRA,
  bonusMod: BONUS_MOD_ULTRA,
  speedStart: SPEED_START_ULTRA,
  speedLimit: SPEED_LIMIT_ULTRA,
  speedSteps: SPEED_STEPS_ULTRA,
  sprintLimit: SPEED_LIMIT_ULTRA_SPRINT,
  invincibilityTime: INVINCIBILITY_TIME_ULTRA,
} as const

export const KEYCODE_ALPHA_0 = 48;
export const KEYCODE_ALPHA_1 = 49;
export const KEYCODE_ALPHA_2 = 50;
export const KEYCODE_ALPHA_3 = 51;
export const KEYCODE_ALPHA_4 = 52;
export const KEYCODE_ALPHA_5 = 53;
export const KEYCODE_ALPHA_6 = 54;
export const KEYCODE_ALPHA_7 = 55;
export const KEYCODE_ALPHA_8 = 56;
export const KEYCODE_ALPHA_9 = 57;

export const KEYCODE_NUMPAD_0 = 96;
export const KEYCODE_NUMPAD_1 = 97;
export const KEYCODE_NUMPAD_2 = 98;
export const KEYCODE_NUMPAD_3 = 99;
export const KEYCODE_NUMPAD_4 = 100;
export const KEYCODE_NUMPAD_5 = 101;
export const KEYCODE_NUMPAD_6 = 102;
export const KEYCODE_NUMPAD_7 = 103;
export const KEYCODE_NUMPAD_8 = 104;
export const KEYCODE_NUMPAD_9 = 105;

export const KEYCODE_SPACE = 32;
export const KEYCODE_QUOTE = 222;
export const KEYCODE_ALPHA_A = 65;
export const KEYCODE_ALPHA_C = 67;
export const KEYCODE_ALPHA_D = 68;
export const KEYCODE_ALPHA_J = 74;
export const KEYCODE_ALPHA_L = 76;
export const KEYCODE_ALPHA_M = 77;
export const KEYCODE_ALPHA_P = 80;
export const KEYCODE_ALPHA_R = 82;
export const KEYCODE_ALPHA_S = 83;
export const KEYCODE_ALPHA_W = 87;
export const KEYCODE_F10 = 121;

export const SCREEN_SHAKE_DURATION_MS = 1000;
export const SCREEN_SHAKE_MAGNITUDE_PX = 4;

export const LUNGE_STEPS = 4;
export const LUNGE_COOLDOWN = 300;
export const LUNGE_INPUT_WINDOW = 160;
export const HURT_FORGIVENESS_TIME = 160;
export const HURT_STUN_TIME = 600;
export const HURT_MOVE_RESET_INITIAL_DELAY = 100;
export const HURT_MOVE_RESET_INPUT_DELAY = 400;
export const HURT_FLASH_RATE = 55;
export const HURT_GRACE_TIME = 30;
export const HURT_MUSIC_DUCK_TIME_MS = 1500;
export const HURT_MUSIC_DUCK_VOL = -0.2;

export const PREY_MOVE_TIME_GRUB = 600; // time between prey movements
export const PREY_MOVE_TIME_ANT = 400;
export const PREY_MOVE_TIME_MOUSE = 200;
export const PREY_MOVE_TIME_GRASSHOPPER = 500;
export const PREY_LIFETIME = 20000;
export const PREY_SPAWN_WAIT_TIME_MAX = 1000;
export const PREY_SPAWN_WAIT_TIME_MIN = 220;

// make func to avoid obj mutation
export const DEFAULT_PORTALS: () => Record<PortalChannel, P5.Vector[]> = () => ({
  0: [],
  1: [],
  2: [],
  3: [],
  5: [],
  4: [],
  6: [],
  7: [],
  8: [],
  9: [],
})

export const PORTAL_INDEX_DELAY = 200;
export const PORTAL_FADE_DURATION = 1000;
const filter = (color: string, desaturate = 0.5, lighten = 0.4) => Color(color).desaturate(desaturate).lighten(lighten).hex();
export const PORTAL_CHANNEL_COLORS: Record<PortalChannel, string> = {
  1: filter("#00ffec"),
  2: filter("#ffb000"),
  3: filter("#ff5c00", 0.4, 0.3),
  4: filter("#8a00ff"),
  5: filter("#6dff00"),
  6: filter("#efef00", 0.2, 0.85),
  7: filter("#004dff"),
  8: filter("#ba00ff", 0.5, 0.7),
  9: filter("#aafbd6", 0.1, 0.1),
  0: filter("#fbecaa"), // #fff
} as const;
export const NUM_PORTAL_GRADIENT_COLORS = 4;
export const INVALID_PORTAL_COLOR = "#FFC0CB";
export const SNAKE_INVINCIBLE_COLORS = [
  "#15C2CB",
  "#FCB045",
  "#FD1D1D",
  "#833AB4",
] as const;
export const SNAKE_REWIND_COLORS = [
  "#15C2CB",
  "#04859f",
  "#255c75",
  "#23415d",
  "#255c75",
  "#04859f",
] as const;
export const NUM_SNAKE_INVINCIBLE_COLORS = 20;

export const HIGHSCORE_GRADIENT_CYCLE_TIME_MS = 500;
export const NEW_HIGHSCORE_COLORS = [
  "#833AB4",
  "#FD1D1D",
  "#FCB045",
  "#15C2CB",
] as const;

export const OST_TRACK_FADE_DURATION_MS = 10000;
export const CAMPAIGN_TRACKS: MusicTrack[] = [
  MusicTrack.champion,
  MusicTrack.simpleTime,
  MusicTrack.transient,
  MusicTrack.aqueduct,
  MusicTrack.conquerer,
  MusicTrack.observer,
  MusicTrack.lordy,
  MusicTrack.factorio,
  MusicTrack.skycastle,
  MusicTrack.creeplord,
  MusicTrack.dangerZone,
  MusicTrack.stonemaze,
  MusicTrack.shopkeeper,
  MusicTrack.woorb,
  MusicTrack.gravy,
  MusicTrack.lostcolony,
  MusicTrack.backrooms,
  MusicTrack.slyguy,
  MusicTrack.reconstitute,
  MusicTrack.ascension,
  MusicTrack.moneymaker,
  MusicTrack.overture,
];
export const OST_MODE_TRACKS: MusicTrack[] = [
  MusicTrack.champion,
  MusicTrack.full_simpleTime,
  MusicTrack.full_transient,
  MusicTrack.aqueduct,
  MusicTrack.conquerer,
  MusicTrack.observer,
  MusicTrack.lordy,
  MusicTrack.factorio,
  MusicTrack.skycastle,
  MusicTrack.full_creeplord,
  MusicTrack.full_dangerZone,
  MusicTrack.stonemaze,
  MusicTrack.shopkeeper,
  MusicTrack.woorb,
  MusicTrack.gravy,
  MusicTrack.lostcolony,
  MusicTrack.backrooms,
  MusicTrack.full_slyguy,
  MusicTrack.reconstitute,
  MusicTrack.ascension,
  MusicTrack.full_moneymaker,
  MusicTrack.overture,
];
export const OST_MODE_TRACKS_NOTIFY_UNLOCK: MusicTrack[] = [
  MusicTrack.simpleTime,
  MusicTrack.transient,
  MusicTrack.conquerer,
  MusicTrack.observer,
  MusicTrack.lordy,
  MusicTrack.factorio,
  MusicTrack.skycastle,
  MusicTrack.creeplord,
  MusicTrack.dangerZone,
  MusicTrack.stonemaze,
  MusicTrack.shopkeeper,
  MusicTrack.woorb,
  MusicTrack.gravy,
  MusicTrack.lostcolony,
  MusicTrack.slyguy,
  MusicTrack.reconstitute,
  MusicTrack.ascension,
  MusicTrack.moneymaker,
  MusicTrack.overture,
];
export const SLIME_CONTROL_TRACKS: MusicTrack[] = [
  MusicTrack.slime_dangerman,
  MusicTrack.slime_megacreep,
  MusicTrack.slime_monsterdance,
  MusicTrack.slime_exitmusic,
  MusicTrack.slime_rollcredits,
];

export const ANIMATIONS: Record<SpritesheetImage, AnimationData> & Record<SpritesheetRange, AnimationDataForRange> = {
  [Image.__TEST__]: {
    frames: 1,
    timePerFrame: 1,
  },
  [Image.ThemedAppleSheet]: {
    frames: 13,
    timePerFrame: 100,
    durations: [
      1000,
      100,
      100,
      100,
      400,
      100,
      100,
      100,
      100,
      100,
      100,
      100,
      9000,
    ],
  } satisfies AnimationData,
  [Image.ThemedPipes1]: {
    frames: 16,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.ThemedPipes2]: {
    frames: 16,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.ThemedPipes3]: {
    frames: 16,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.SegmentsSheet]: {
    frames: 6,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.KeySheet]: {
    frames: 4,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.LockSheet]: {
    frames: 4,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.MineSheet]: {
    frames: 2,
    timePerFrame: 400,
  } satisfies AnimationData,
  [Image.ExplosionSheet]: {
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.Explosion3Sheet]: {
    frames: 11,
    timePerFrame: 140,
  } satisfies AnimationData,
  [Image.SmokeSheet]: {
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.PuffSheet]: {
    frames: 6,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.FireSheet]: {
    frames: 3,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.TileSheet16]: {
    frames: 35,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.TileSheet48]: {
    frames: 7,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.PipesSheet]: {
    frames: 96,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.PickupsSheet]: {
    frames: 57,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.Pickups2Sheet]: {
    frames: 104,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.WearablesSheet]: {
    frames: 27,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.UIKeysSheet]: {
    frames: 5,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.DoorLightSheet]: {
    frames: 9,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.DoorOpenSheet]: {
    frames: 13,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.Points500]: {
    frames: 14,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.Points1000]: {
    frames: 13,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.Points2000]: {
    frames: 13,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.Points5000]: {
    frames: 16,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.Points10000]: {
    frames: 17,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.PreyGrubSheet]: {
    frames: 4,
    timePerFrame: PREY_MOVE_TIME_GRUB / 2,
  } satisfies AnimationData,
  [Image.PreyAntSheet]: {
    frames: 2,
    timePerFrame: PREY_MOVE_TIME_ANT / 2,
  } satisfies AnimationData,
  [Image.PreyMouseSheet]: {
    frames: 4,
    timePerFrame: PREY_MOVE_TIME_MOUSE / 2,
  } satisfies AnimationData,
  [Image.PreyGrasshopperSheet]: {
    frames: 2,
    timePerFrame: PREY_MOVE_TIME_GRASSHOPPER / 2,
  } satisfies AnimationData,
  [Image.Shield]: {
    frames: 6,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.ShieldSpawn]: {
    frames: 13,
    timePerFrame: 100,
  } satisfies AnimationData,
  [Image.PickupOutlineBlueSheet]: {
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.PickupOutlineYellowSheet]: {
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.UIShieldSheet]: {
    frames: 2,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.ThreatSheet16]: {
    frames: 36,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.ThreatSheet48]: {
    frames: 19,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.ButtonSheet]: {
    frames: 20,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.ThreatWallSpikesSheet]: {
    frames: 16,
    timePerFrame: 200,
  } satisfies AnimationData,
  [Image.ThreatSawSheet]: {
    frames: 12,
    timePerFrame: 200,
  } satisfies AnimationData,
  [SpritesheetRange.None]: {
    src: Image.SegmentsSheet,
    offset: 0,
    frames: 1,
    timePerFrame: 100,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.DiodeCrit]: {
    src: Image.ThreatSheet16,
    offset: Threat16Frame.DiodeCrit0 - 1,
    frames: 2,
    timePerFrame: 200,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.DiodeBlue]: {
    src: Image.ThreatSheet16,
    offset: Threat16Frame.DiodeBlue0 - 1,
    frames: 4,
    timePerFrame: 200,
    durations: [400, 200, 200, 200],
  } satisfies AnimationDataForRange,
  [SpritesheetRange.DiodeRed]: {
    src: Image.ThreatSheet16,
    offset: Threat16Frame.DiodeRed0 - 1,
    frames: 4,
    timePerFrame: 200,
    durations: [400, 200, 200, 200],
  } satisfies AnimationDataForRange,
  [SpritesheetRange.LaserBlue]: {
    src: Image.ThreatSheet16,
    offset: Threat16Frame.LaserBlue0 - 1,
    frames: 4,
    timePerFrame: 100,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.LaserRed]: {
    src: Image.ThreatSheet16,
    offset: Threat16Frame.LaserRed0 - 1,
    frames: 4,
    timePerFrame: 100,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.Bomb]: {
    src: Image.ThreatSheet16,
    offset: Threat16Frame.Bomb0 - 1,
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.BombCrit]: {
    src: Image.ThreatSheet16,
    offset: Threat16Frame.BombCrit0 - 1,
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.Barrel]: {
    src: Image.ThreatSheet48,
    offset: Threat48Frame.Barrel - 1,
    frames: 1,
    timePerFrame: 100,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.BarrelFireA]: {
    src: Image.ThreatSheet48,
    offset: Threat48Frame.BarrelFireA0 - 1,
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.BarrelFireB]: {
    src: Image.ThreatSheet48,
    offset: Threat48Frame.BarrelFireB0 - 1,
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.BarrelRupture]: {
    src: Image.ThreatSheet48,
    offset: Threat48Frame.BarrelRupture0 - 1,
    frames: 4,
    timePerFrame: 200,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.BarricadeDeploy]: {
    src: Image.ButtonSheet,
    offset: ButtonSheetFrame.BarricadeActive0 - 1,
    frames: 3,
    timePerFrame: 100,
    oneShot: true,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.BarricadeRetract]: {
    src: Image.ButtonSheet,
    offset: ButtonSheetFrame.BarricadeCollapse0 - 1,
    frames: 3,
    timePerFrame: 100,
    oneShot: true,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.Spikes]: {
    src: Image.ButtonSheet,
    offset: ButtonSheetFrame.SpikeActive0 - 1,
    frames: 6,
    timePerFrame: 100,
    durations: [1200, 100, 100, 100, 100, 100],
  } satisfies AnimationDataForRange,
  [SpritesheetRange.WallSpikesDeploy]: {
    src: Image.ThreatWallSpikesSheet,
    offset: ThreatWallSpikesFrame.Active0 - 1,
    frames: 10,
    timePerFrame: 100,
    loopFrameOffset: 4,
    durations: [200, 200, 100, 100, 1200, 100, 100, 100, 100, 100],
  } satisfies AnimationDataForRange,
  [SpritesheetRange.WallSpikesRetract]: {
    src: Image.ThreatWallSpikesSheet,
    offset: ThreatWallSpikesFrame.Retract0 - 1,
    frames: 4,
    timePerFrame: 100,
    oneShot: true,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.SawActive]: {
    src: Image.ThreatSawSheet,
    offset: ThreatSawFrame.Active0 - 1,
    frames: 9,
    timePerFrame: 100,
    loopFrameOffset: 3,
  } satisfies AnimationDataForRange,
  [SpritesheetRange.SawOff]: {
    src: Image.ThreatSawSheet,
    offset: ThreatSawFrame.Retract0 - 1,
    frames: 2,
    timePerFrame: 100,
    oneShot: true,
  } satisfies AnimationDataForRange,
} satisfies (Record<SpritesheetImage, AnimationData> & Record<SpritesheetRange, AnimationDataForRange>);

// validate ANIMATIONS data
Object.entries(ANIMATIONS).forEach(([key, val]) => {
  const offset = (val as AnimationDataForRange).offset || 0;
  const name = (val as AnimationDataForRange).src || key;
  const add = offset ? ` <${key}>(+${offset})` : ''
  if (!val.timePerFrame) {
    throw new Error(`timePerFrame cannot be zero. val=${val.timePerFrame},img="${name}${add}"`);
  }
  if (val.durations && (val.durations.length !== val.frames)) {
    throw new Error(`Inconsistent animation data for "${name}${add}": num_frames=${val.frames} did not match durations.length=${val.durations.length}`);
  }
})

export const PICKUP_MEAT_ITEMS: PickupType[] = [
  PickupType.Meat1,
  PickupType.Meat2,
  PickupType.Meat3,
  PickupType.Meat4,
  PickupType.Meat5,
  PickupType.Meat6,
  PickupType.Meat7,
  PickupType.Meat8,
  PickupType.Meat9,
  PickupType.Bone,
];

export const PICKUP_COMMON_ITEMS: PickupType[] = [
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
  PickupType.Turnip,
  PickupType.Eggplant,
  PickupType.Vidalia1,
  PickupType.Vidalia2,
  PickupType.Pickle,
  PickupType.Mushroom2,
  PickupType.Mushroom3,
  PickupType.Tomato2,
  PickupType.Lettuce,
  PickupType.Carrot2,
  PickupType.Garlic,
  PickupType.Celery,
  PickupType.PotatoSprouts,
  PickupType.Mint,
  PickupType.Jalapeño,
  PickupType.Cheese2,
  PickupType.Egg2,
  PickupType.Cracker,
  PickupType.Peanut,
  PickupType.Chestnut,
  PickupType.Walnut,
  PickupType.Butter,
  PickupType.Salt,
];
export const PICKUP_RARE_ITEMS: PickupType[] = [
  PickupType.Pretzel,
  PickupType.Taco,
  PickupType.Drumstick,
  PickupType.Burger,
  PickupType.PizzaSlice,
  PickupType.HotDog,
  PickupType.Egg,
  PickupType.Fries,
  PickupType.Candy,
  PickupType.ChocolateBar,
  PickupType.Popsicle,
  PickupType.Lollipop,
  PickupType.Muffin,
  PickupType.Croisant,
  PickupType.Baguette,
  PickupType.Cupcake,
  PickupType.Habañero,
  PickupType.Burger2,
  PickupType.Taco2,
  PickupType.Burrito,
  PickupType.PizzaSlice2,
  PickupType.PizzaPie,
  PickupType.Quiche1,
  PickupType.Quiche2,
  PickupType.Dish1,
  PickupType.Dish2,
  PickupType.Dish2,
  PickupType.BowlSoup,
  PickupType.Steak,
  PickupType.FishPurple,
  PickupType.ShrimpRaw,
  PickupType.ShrimpCooked,
  PickupType.Shishkabob,
  PickupType.Fish1,
  PickupType.Fish2,
  PickupType.Fish3,
  PickupType.Tuna,
  PickupType.BreadLoaf2,
  PickupType.Coconut,
  PickupType.Honeypot,
  PickupType.Milk,
  PickupType.Coffee,
  PickupType.Latte,
  PickupType.WaterVase,
  PickupType.Peppermint,
  PickupType.CandyGreen,
  ...PICKUP_MEAT_ITEMS,
];
export const PICKUP_EPIC_ITEMS: PickupType[] = [
  PickupType.Donut,
  PickupType.Banana,
  PickupType.Watermelon,
  PickupType.Mango,
  PickupType.Grapes,
  PickupType.Kiwi,
  PickupType.Orange,
  PickupType.Cherries,
  PickupType.Pear,
  PickupType.Peach,
  PickupType.Lemon,
  PickupType.Lime,
  PickupType.BananaBunch,
  PickupType.Apple,
  PickupType.AppleGreen,
  PickupType.Strawberry2,
  PickupType.Grapes2,
  PickupType.Grapes3,
  PickupType.Watermelon2,
  PickupType.Pear2,
  PickupType.Orange2,
  PickupType.Cappuccino,
  PickupType.Beer1,
  PickupType.Beer2,
  PickupType.CherryPie,
  PickupType.ChocolateCake,
  PickupType.Cheesecake,
  PickupType.PumpkinMuffin,
  PickupType.ChocolateMuffin,
  PickupType.ChocolateCupcake,
  PickupType.BigCake,
  PickupType.NeopolitanIceCream,
  PickupType.Popsicle2,
  PickupType.ChocolatePopsicle,
  PickupType.Cupcake2,
  PickupType.StrawberryIceCreamCone,
  PickupType.Donut2,
  PickupType.Donut3,
  PickupType.Oreo,
  PickupType.Cookie,
  PickupType.ChocolateBar2,
  PickupType.Nouget,
  PickupType.Pie1,
  PickupType.Pie2,
  PickupType.Pie3,
  PickupType.Pie4,
  PickupType.Pie5,
];
export const PICKUP_LEGENDARY_ITEMS: PickupType[] = [
  PickupType.Strawberry,
  PickupType.GoldenApple,
  PickupType.RainbowCake,
  PickupType.Sushi,
  PickupType.Sushi2,
  PickupType.Milkshake,
  PickupType.ChiliPepper,
  PickupType.ChiliPepper2,
  PickupType.Eel,
  PickupType.Cocktail,
  PickupType.PotionGreen,
  PickupType.PotionRed,
  PickupType.PotionHealth,
];
// NOTE - this is 1-indexed!!! This is a 1:1 lookup from spritesheet in Aseprite.
export const PICKUP_SPRITE_FRAME_MAP: Record<PickupType, number> = ({
  [PickupType.None]: 0,
  [PickupType.__PICKUPS2_OFFSET__]: 0,
  // snek-pickups.ase
  [PickupType.Invincibility]: 0,
  [PickupType.Reversibility]: 56,
  [PickupType.Armor]: 0,
  [PickupType.HealthPack]: 54,
  [PickupType.WeightLossPill]: 55,
  [PickupType.Cheese]: 1,
  [PickupType.Carrot]: 2,
  [PickupType.Potato]: 3,
  [PickupType.Tomato]: 4,
  [PickupType.Onion]: 5,
  [PickupType.Cabbage]: 6,
  [PickupType.Broccoli]: 7,
  [PickupType.Mushroom]: 8,
  [PickupType.BreadLoaf]: 10,
  [PickupType.Cucumber]: 27,
  [PickupType.Pretzel]: 11,
  [PickupType.Taco]: 12,
  [PickupType.Drumstick]: 13,
  [PickupType.Burger]: 15,
  [PickupType.PizzaSlice]: 14,
  [PickupType.HotDog]: 16,
  [PickupType.Egg]: 17,
  [PickupType.Fries]: 18,
  [PickupType.Candy]: 19,
  [PickupType.ChocolateBar]: 20,
  [PickupType.Popsicle]: 21,
  [PickupType.Lollipop]: 22,
  [PickupType.Muffin]: 23,
  [PickupType.Croisant]: 25,
  [PickupType.Baguette]: 26,
  [PickupType.Cupcake]: 24,
  [PickupType.Donut]: 28,
  [PickupType.Banana]: 29,
  [PickupType.Watermelon]: 30,
  [PickupType.Mango]: 31,
  [PickupType.Grapes]: 32,
  [PickupType.Strawberry]: 33,
  [PickupType.Kiwi]: 34,
  [PickupType.Orange]: 35,
  [PickupType.Cherries]: 36,
  [PickupType.Pear]: 37,
  [PickupType.Peach]: 38,
  [PickupType.Lemon]: 39,
  [PickupType.Lime]: 40,
  [PickupType.GoldenApple]: 42,
  [PickupType.RainbowCake]: 43,
  [PickupType.Sushi]: 45,
  [PickupType.Milkshake]: 46,
  [PickupType.ChiliPepper]: 47,
  [PickupType.CherryPie]: PickupType.CherryPie - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ChocolateCake]: PickupType.ChocolateCake - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Cheesecake]: PickupType.Cheesecake - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.PumpkinMuffin]: PickupType.PumpkinMuffin - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ChocolateMuffin]: PickupType.ChocolateMuffin - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ChocolateCupcake]: PickupType.ChocolateCupcake - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.BigCake]: PickupType.BigCake - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.NeopolitanIceCream]: PickupType.NeopolitanIceCream - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Popsicle2]: PickupType.Popsicle2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ChocolatePopsicle]: PickupType.ChocolatePopsicle - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Cupcake2]: PickupType.Cupcake2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.StrawberryIceCreamCone]: PickupType.StrawberryIceCreamCone - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Donut2]: PickupType.Donut2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Donut3]: PickupType.Donut3 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Peppermint]: PickupType.Peppermint - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.CandyGreen]: PickupType.CandyGreen - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Oreo]: PickupType.Oreo - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Cookie]: PickupType.Cookie - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ChocolateBar2]: PickupType.ChocolateBar2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Nouget]: PickupType.Nouget - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Pie1]: PickupType.Pie1 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Pie2]: PickupType.Pie2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Pie3]: PickupType.Pie3 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Pie4]: PickupType.Pie4 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Pie5]: PickupType.Pie5 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat1]: PickupType.Meat1 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat2]: PickupType.Meat2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat3]: PickupType.Meat3 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat4]: PickupType.Meat4 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat5]: PickupType.Meat5 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat6]: PickupType.Meat6 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat7]: PickupType.Meat7 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat8]: PickupType.Meat8 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Meat9]: PickupType.Meat9 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Bone]: PickupType.Bone - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Turnip]: PickupType.Turnip - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Eggplant]: PickupType.Eggplant - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Mushroom2]: PickupType.Mushroom2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Vidalia1]: PickupType.Vidalia1 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Vidalia2]: PickupType.Vidalia2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Pickle]: PickupType.Pickle - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Mushroom3]: PickupType.Mushroom3 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Tomato2]: PickupType.Tomato2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Lettuce]: PickupType.Lettuce - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Carrot2]: PickupType.Carrot2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Garlic]: PickupType.Garlic - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Celery]: PickupType.Celery - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.PotatoSprouts]: PickupType.PotatoSprouts - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Mint]: PickupType.Mint - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Jalapeño]: PickupType.Jalapeño - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Habañero]: PickupType.Habañero - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ChiliPepper2]: PickupType.ChiliPepper2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Burger2]: PickupType.Burger2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Taco2]: PickupType.Taco2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Burrito]: PickupType.Burrito - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.PizzaSlice2]: PickupType.PizzaSlice2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.PizzaPie]: PickupType.PizzaPie - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Quiche1]: PickupType.Quiche1 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Quiche2]: PickupType.Quiche2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Sushi2]: PickupType.Sushi2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Dish1]: PickupType.Dish1 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Dish2]: PickupType.Dish2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.BowlSoup]: PickupType.BowlSoup - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Steak]: PickupType.Steak - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.FishPurple]: PickupType.FishPurple - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ShrimpRaw]: PickupType.ShrimpRaw - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.ShrimpCooked]: PickupType.ShrimpCooked - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Shishkabob]: PickupType.Shishkabob - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Fish1]: PickupType.Fish1 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Fish2]: PickupType.Fish2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Fish3]: PickupType.Fish3 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Tuna]: PickupType.Tuna - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Eel]: PickupType.Eel - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Cheese2]: PickupType.Cheese2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Egg2]: PickupType.Egg2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.BreadLoaf2]: PickupType.BreadLoaf2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Cracker]: PickupType.Cracker - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Peanut]: PickupType.Peanut - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Chestnut]: PickupType.Chestnut - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Walnut]: PickupType.Walnut - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Coconut]: PickupType.Coconut - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Honeypot]: PickupType.Honeypot - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Butter]: PickupType.Butter - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Salt]: PickupType.Salt - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.BananaBunch]: PickupType.BananaBunch - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Apple]: PickupType.Apple - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.AppleGreen]: PickupType.AppleGreen - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Strawberry2]: PickupType.Strawberry2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Grapes2]: PickupType.Grapes2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Grapes3]: PickupType.Grapes3 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Watermelon2]: PickupType.Watermelon2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Pear2]: PickupType.Pear2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Orange2]: PickupType.Orange2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Milk]: PickupType.Milk - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Cocktail]: PickupType.Cocktail - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Cappuccino]: PickupType.Cappuccino - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Coffee]: PickupType.Coffee - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Latte]: PickupType.Latte - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.WaterVase]: PickupType.WaterVase - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Beer1]: PickupType.Beer1 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.Beer2]: PickupType.Beer2 - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.PotionGreen]: PickupType.PotionGreen - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.PotionRed]: PickupType.PotionRed - PickupType.__PICKUPS2_OFFSET__,
  [PickupType.PotionHealth]: PickupType.PotionHealth - PickupType.__PICKUPS2_OFFSET__,
} satisfies Record<PickupType, number>);

// validate PickupType rarities
const pickupTypeDuplicates: Partial<Record<PickupType, boolean>> = {};
const errors = Object.entries(PickupType).map(([key, pickupType]) => {
  try {
    if (typeof pickupType === 'string') return;
    if ([
      PickupType.None,
      PickupType.Invincibility,
      PickupType.Reversibility,
      PickupType.Armor,
      PickupType.HealthPack,
      PickupType.WeightLossPill,
      PickupType.__PICKUPS2_OFFSET__,
    ].includes(pickupType)) return;
    if (pickupTypeDuplicates[pickupType]) {
      throw new Error(`Duplicate PickupType ${key} (${pickupType})`);
    }
    pickupTypeDuplicates[pickupType] = true;
    if (PICKUP_COMMON_ITEMS.includes(pickupType)) return;
    if (PICKUP_RARE_ITEMS.includes(pickupType)) return;
    if (PICKUP_EPIC_ITEMS.includes(pickupType)) return;
    if (PICKUP_LEGENDARY_ITEMS.includes(pickupType)) return;
    throw new Error(`PickupType ${key} (${pickupType}) is missing from all rarity lists.`);
    return null;
  } catch (error) {
    return error;
  }
}).filter(err => !!err);
if (errors.length) {
  throw new Error('Validation errors:\n' + errors.join('\n'));
}

export const PICKUP_TYPE_RARITY_MAP: Record<PickupType, number> = Object.values(PickupType)
  .filter(v => typeof v !== 'string')
  .reduce((acc, pickupType) => {
    let rarity = 0;
    if (PICKUP_COMMON_ITEMS.includes(pickupType)) rarity = RARITY_COMMON;
    else if (PICKUP_RARE_ITEMS.includes(pickupType)) rarity = RARITY_RARE;
    else if (PICKUP_EPIC_ITEMS.includes(pickupType)) rarity = RARITY_EPIC;
    else if (PICKUP_LEGENDARY_ITEMS.includes(pickupType)) rarity = RARITY_LEGENDARY;
    acc[pickupType] = rarity;
    return acc;
  }, {} as Record<PickupType, number>);

export const WEARABLE_TYPE_MAP = {
  [WearableFrame.None]: WearableType.None,
  [WearableFrame.CowboyHat]: WearableType.Hat,
  [WearableFrame.ChefHat]: WearableType.Hat,
  [WearableFrame.IndianaJonesHat]: WearableType.Hat,
  [WearableFrame.Sunglasses]: WearableType.Eyes,
  [WearableFrame.Monocle]: WearableType.Eyes,
  [WearableFrame.TechVisor]: WearableType.Eyes,
  [WearableFrame.Glasses]: WearableType.Eyes,
  [WearableFrame.Mustache]: WearableType.Hair,
  [WearableFrame.BanditMask]: WearableType.Eyes,
  [WearableFrame.PirateOutfit]: WearableType.Exclusive,
  [WearableFrame.CatEars]: WearableType.Hat,
  [WearableFrame.Horns]: WearableType.Hat,
  [WearableFrame.NinjaBlue]: WearableType.Exclusive,
  [WearableFrame.NinjaPurple]: WearableType.Exclusive,
  [WearableFrame.BaseballCap]: WearableType.Hat,
  [WearableFrame.VikingHelmet]: WearableType.Hat,
  [WearableFrame.LuchadoreMaskRed]: WearableType.Exclusive,
  [WearableFrame.LuchadoreMaskBlue]: WearableType.Exclusive,
  [WearableFrame.MexicanBlanket]: WearableType.Back,
  [WearableFrame.RoyalCape]: WearableType.Back,
  [WearableFrame.Crown]: WearableType.Hat,
  [WearableFrame.Cone]: WearableType.Hat,
  [WearableFrame.Crusher]: WearableType.None,
  [WearableFrame.CrusherSeg1]: WearableType.None,
  [WearableFrame.CrusherSeg2]: WearableType.None,
} satisfies Record<WearableFrame, WearableType>;
