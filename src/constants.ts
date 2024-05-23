import P5 from "p5";
import Color from "color";

import { Difficulty, MusicTrack, PortalChannel } from "./types";

export const TITLE = 'SNEK';

export const SHOW_FPS = false;
export const DEBUG_EASY_LEVEL_EXIT = false;
export const DISABLE_TRANSITIONS = false;
export const RECORD_REPLAY_STATE = false;
export const IS_DEV = window.location.href.includes('localhost') || process.env.NODE_ENV === 'test';

export const LEADERBOARD_HOST = 'https://dontownsendcreative.com/snek-leaderboard';
// export const LEADERBOARD_HOST = 'http://localhost:8000';

export const MAX_GAIN_MUSIC = 0.6;
export const DEFAULT_VOLUME_SFX = 1;

export const ACCENT_COLOR = "#FFB41F";
export const SECONDARY_ACCENT_COLOR = "#15C2CB";
export const SECONDARY_ACCENT_COLOR_BG = Color("#119DA4").darken(0.4).hex();
export const GLOBAL_LIGHT_DEFAULT = 1;
export const LIGHTMAP_RESOLUTION = 1;

export const FRAMERATE = 90;
export const FRAME_DUR_MS = (1 / FRAMERATE) * 1000;
export const DIMENSIONS = { x: Math.min(window.innerWidth, 600), y: Math.min(window.innerWidth, 600) };
export const GRIDCOUNT = { x: 30, y: 30 };
export const STROKE_SIZE = 4;
export const STRANGELY_NEEDED_OFFSET = { x: STROKE_SIZE / GRIDCOUNT.x, y: STROKE_SIZE / GRIDCOUNT.y };
/**
 * Typically { x: 20, y: 20 }
 */
export const BLOCK_SIZE = { x: DIMENSIONS.x / GRIDCOUNT.x + STRANGELY_NEEDED_OFFSET.x, y: DIMENSIONS.y / GRIDCOUNT.y + STRANGELY_NEEDED_OFFSET.y };
export const MAX_MOVES = 4;
export const MAX_LIVES = 3;
export const MAX_SNAKE_SIZE = GRIDCOUNT.x * GRIDCOUNT.y * 0.50;
export const START_SNAKE_SIZE = 3;
export const SPEED_INCREMENT_SPEED_MS = 600;
export const SPRINT_INCREMENT_SPEED_MS = 250;
export const NUM_APPLES_START = 3;

export const SCORE_INCREMENT = 10;
export const CLEAR_BONUS = 100;
export const LEVEL_BONUS = 500;
export const LIVES_LEFT_BONUS = 1000;
export const ALL_APPLES_BONUS = 2500;
export const PERFECT_BONUS = 5000;
export const COBRA_SCORE_MOD = 1.5;
export const PICKUP_INVINCIBILITY_BONUS = 200;

export const PICKUP_DROP_LIKELIHOOD = 0.04;
export const PICKUP_LIFETIME_MS = 10000;
export const PICKUP_EXPIRE_WARN_MS = 3500;
export const PICKUP_SPAWN_COOLDOWN = 15000;

export const INVINCIBILITY_PICKUP_FREEZE_MS = 1000;
export const INVINCIBILITY_EXPIRE_WARN_MS = 2000;
export const INVINCIBILITY_EXPIRE_FLASH_MS = 200;
export const INVINCIBILITY_COLOR_CYCLE_MS = 20;

const INVINCIBILITY_TIME_EASY = 12000;
const INVINCIBILITY_TIME_MEDIUM = 10000;
const INVINCIBILITY_TIME_HARD = 8000;
const INVINCIBILITY_TIME_ULTRA = 6000;

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
const SPEED_START_ULTRA = 110;

const SPEED_STEPS_EASY = 20;
const SPEED_STEPS_MEDIUM = 20;
const SPEED_STEPS_HARD = 10;
const SPEED_STEPS_ULTRA = 4;

export const SPEED_LIMIT_EASY = 110;
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
  sprintLimit: SPEED_LIMIT_MEDIUM,
  invincibilityTime: INVINCIBILITY_TIME_EASY,
}
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
}
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
}
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
}

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

export const SCREEN_SHAKE_DURATION_MS = 1000;
export const SCREEN_SHAKE_MAGNITUDE_PX = 4;

export const HURT_FORGIVENESS_TIME = 160;
export const HURT_STUN_TIME = 600;
export const HURT_FLASH_RATE = 55;
export const HURT_GRACE_TIME = 30;
export const HURT_MUSIC_DUCK_TIME_MS = 1500;
export const HURT_MUSIC_DUCK_VOL = -0.2;

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

export const PORTAL_INDEX_DELAY = 100;
export const PORTAL_FADE_DURATION = 500;
export const filter = (color: string) => Color(color).desaturate(0.5).lighten(0.4).hex();
export const PORTAL_CHANNEL_COLORS: Record<PortalChannel, string> = {
  1: filter("#00ffec"),
  2: filter("#ffb000"),
  3: filter("#ff5c00"),
  4: filter("#8a00ff"),
  5: filter("#6dff00"),
  6: filter("#efff00"),
  7: filter("#004dff"),
  8: filter("#ba00ff"),
  9: filter("#aafbd6"),
  0: filter("#fbecaa"),
};
export const NUM_PORTAL_GRADIENT_COLORS = 4;
export const INVALID_PORTAL_COLOR = "#FFC0CB";
export const SNAKE_INVINCIBLE_COLORS = [
  "#15C2CB",
  "#FCB045",
  "#FD1D1D",
  "#833AB4",
];
export const NUM_SNAKE_INVINCIBLE_COLORS = 20;

export const OST_MODE_TRACKS: MusicTrack[] = [
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
