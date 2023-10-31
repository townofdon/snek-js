import P5 from "p5";
import { Difficulty, PortalChannel } from "./types";
import Color from "color";

export const TITLE = 'SNEK';

export const DEBUG_EASY_LEVEL_EXIT = false;
export const RECORD_REPLAY_STATE = false;

const windowWidth = window.innerWidth;

export const FRAMERATE = 90;
export const DIMENSIONS = { x: Math.min(windowWidth, 600), y: Math.min(windowWidth, 600) };
export const GRIDCOUNT = { x: 30, y: 30 };
export const STROKE_SIZE = 4;
export const STRANGELY_NEEDED_OFFSET = { x: STROKE_SIZE / GRIDCOUNT.x, y: STROKE_SIZE / GRIDCOUNT.y };
export const BLOCK_SIZE = { x: DIMENSIONS.x / GRIDCOUNT.x + STRANGELY_NEEDED_OFFSET.x, y: DIMENSIONS.y / GRIDCOUNT.y + STRANGELY_NEEDED_OFFSET.y };
export const BASE_TICK_MS = 300;
export const MAX_MOVES = 4;
export const MAX_LIVES = 3;
export const START_SNAKE_SIZE = 3;
export const SPEED_INCREMENT = 1;
export const NUM_APPLES_START = 3;

export const SCORE_INCREMENT = 10;
export const CLEAR_BONUS = 100;
export const LEVEL_BONUS = 500;
export const LIVES_LEFT_BONUS = 1000;
export const ALL_APPLES_BONUS = 1500;
export const PERFECT_BONUS = 5000;

export const BONUS_MOD_EASY = .1;
export const BONUS_MOD_MEDIUM = .5;
export const BONUS_MOD_HARD = 4;
export const BONUS_MOD_ULTRA = 12;

export const SCORE_MOD_EASY = .5;
export const SCORE_MOD_MEDIUM = 2;
export const SCORE_MOD_HARD = 5;
export const SCORE_MOD_ULTRA = 10;

export const SPEED_MOD_EASY = .45;
export const SPEED_MOD_MEDIUM = .75;
export const SPEED_MOD_HARD = 1.6;
export const SPEED_MOD_ULTRA = 1;

export const NUM_APPLES_MOD_EASY = .5;
export const NUM_APPLES_MOD_MEDIUM = .9;
export const NUM_APPLES_MOD_HARD = 1;
export const NUM_APPLES_MOD_ULTRA = 1.5;

export const SPEED_LIMIT_EASY = 110;
export const SPEED_LIMIT_MEDIUM = 56;
export const SPEED_LIMIT_HARD = 35;
export const SPEED_LIMIT_ULTRA = 25;

export const DIFFICULTY_EASY: Difficulty = {
  index: 1,
  speedMod: SPEED_MOD_EASY,
  applesMod: NUM_APPLES_MOD_EASY,
  scoreMod: SCORE_MOD_EASY,
  bonusMod: BONUS_MOD_EASY,
  speedLimit: SPEED_LIMIT_EASY,
}
export const DIFFICULTY_MEDIUM: Difficulty = {
  index: 2,
  speedMod: SPEED_MOD_MEDIUM,
  applesMod: NUM_APPLES_MOD_MEDIUM,
  scoreMod: SCORE_MOD_MEDIUM,
  bonusMod: BONUS_MOD_MEDIUM,
  speedLimit: SPEED_LIMIT_MEDIUM,
}
export const DIFFICULTY_HARD: Difficulty = {
  index: 3,
  speedMod: SPEED_MOD_HARD,
  applesMod: NUM_APPLES_MOD_HARD,
  scoreMod: SCORE_MOD_HARD,
  bonusMod: BONUS_MOD_HARD,
  speedLimit: SPEED_LIMIT_HARD,
}
export const DIFFICULTY_ULTRA: Difficulty = {
  index: 4,
  speedMod: SPEED_MOD_ULTRA,
  applesMod: NUM_APPLES_MOD_ULTRA,
  scoreMod: SCORE_MOD_ULTRA,
  bonusMod: BONUS_MOD_ULTRA,
  speedLimit: SPEED_LIMIT_ULTRA,
}

export const KEYCODE_W = 87;
export const KEYCODE_A = 65;
export const KEYCODE_S = 83;
export const KEYCODE_D = 68;
export const KEYCODE_J = 74;
export const KEYCODE_0 = 48;
export const KEYCODE_1 = 49;
export const KEYCODE_2 = 50;
export const KEYCODE_3 = 51;
export const KEYCODE_4 = 52;
export const KEYCODE_5 = 53;
export const KEYCODE_6 = 54;
export const KEYCODE_7 = 55;
export const KEYCODE_8 = 56;
export const KEYCODE_9 = 57;
export const KEYCODE_SPACE = 32;

export const SCREEN_SHAKE_DURATION_MS = 1000;
export const SCREEN_SHAKE_MAGNITUDE_PX = 4;

export const HURT_STUN_TIME = 600;
export const HURT_FLASH_RATE = 55;
export const HURT_GRACE_TIME = 30;

export const DEFAULT_PORTALS: Record<PortalChannel, P5.Vector[]> = {
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
}

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
