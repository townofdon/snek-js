import { Vector } from "p5";
import {
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_ULTRA,
  GRIDCOUNT,
  NUM_APPLES_MOD_EASY,
  NUM_APPLES_MOD_HARD,
  NUM_APPLES_MOD_MEDIUM,
  NUM_APPLES_MOD_ULTRA,
  SCORE_MOD_EASY,
  SCORE_MOD_HARD,
  SCORE_MOD_MEDIUM,
  SCORE_MOD_ULTRA,
  SPEED_LIMIT_EASY,
  SPEED_LIMIT_HARD,
  SPEED_LIMIT_MEDIUM,
  SPEED_LIMIT_ULTRA,
  SPEED_MOD_EASY,
  SPEED_MOD_HARD,
  SPEED_MOD_MEDIUM,
  SPEED_MOD_ULTRA
} from "./constants";
import {
  LEVEL_01,
  LEVEL_02,
  LEVEL_03,
  LEVEL_04,
  LEVEL_05,
  LEVEL_06,
  LEVEL_07,
  LEVEL_08,
  LEVEL_09,
  LEVEL_10,
  LEVEL_99,
} from './levels';

export function clamp(val: number, minVal: number, maxVal: number) {
  const clamped = Math.max(Math.min(val, maxVal), minVal);
  return isNaN(clamped) ? minVal : clamped;
}

export function getCoordIndex(vec: Vector): number {
  return clamp(vec.x, 0, GRIDCOUNT.x - 1) + clamp(vec.y, 0, GRIDCOUNT.y - 1) * GRIDCOUNT.x
}

export function vecToString(vec: Vector) {
  return vec ? `(${vec.x}, ${vec.y})` : 'Nil';
}

export function removeArrayElement<T>(items: T[], index = -1): T[] {
  if (index < 0) return items;
  if (index >= items.length) return items;
  return items.slice(0, index).concat(items.slice(index + 1))
}

export function stripLeadingSlash(str: string): string {
  return str.replace(/^\//, '');
}

export function shuffleArray<T>(array: T[]) {
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export function getWarpLevelFromNum(levelNum: number) {
  switch (levelNum) {
    case 1:
      return LEVEL_01;
    case 2:
      return LEVEL_02;
    case 3:
      return LEVEL_03;
    case 4:
      return LEVEL_04;
    case 5:
      return LEVEL_05;
    case 6:
      return LEVEL_06;
    case 7:
      return LEVEL_07;
    case 8:
      return LEVEL_08;
    case 9:
      return LEVEL_09;
    case 10:
      return LEVEL_10;
    case 99:
      return LEVEL_99;
    default:
      return LEVEL_01;
  }
}

export function getDifficultyFromIndex(index: number) {
  index = clamp(index, 1, 4);
  switch (index) {
    case 1:
      return { ...DIFFICULTY_EASY };
    case 2:
      return { ...DIFFICULTY_MEDIUM };
    case 3:
      return { ...DIFFICULTY_HARD };
    case 4:
      return { ...DIFFICULTY_ULTRA };
    default:
      throw new Error(`Unexpected difficulty index: ${index}`)
  }
}
