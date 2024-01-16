import P5, { Vector } from "p5";
import {
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_ULTRA,
  GRIDCOUNT,
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
  LEVEL_11,
  LEVEL_12,
  LEVEL_13,
  LEVEL_14,
  LEVEL_15,
  LEVEL_16,
  LEVEL_99,
} from './levels';
import { DIR, MusicTrack, QueryParams } from "./types";
import { TUTORIAL_LEVEL_10 } from "./levels/tutorialLevel10";
import { TUTORIAL_LEVEL_20 } from "./levels/tutorialLevel20";
import { TUTORIAL_LEVEL_30 } from "./levels/tutorialLevel30";
import { TUTORIAL_LEVEL_40 } from "./levels/tutorialLevel40";

export function clamp(val: number, minVal: number, maxVal: number) {
  const clamped = Math.max(Math.min(val, maxVal), minVal);
  return isNaN(clamped) ? minVal : clamped;
}

export function getCoordIndex(vec: Vector): number {
  return clamp(vec.x, 0, GRIDCOUNT.x - 1) + clamp(vec.y, 0, GRIDCOUNT.y - 1) * GRIDCOUNT.x
}

export function coordToVec(p5: P5, index: number): Vector {
  index = Math.floor(index);
  const x = Math.floor(index % GRIDCOUNT.x);
  const y = Math.floor(index / GRIDCOUNT.x) * GRIDCOUNT.y;
  return p5.createVector(x, y);
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
    case 11:
      return LEVEL_11;
    case 12:
      return LEVEL_12;
    case 13:
      return LEVEL_13;
    case 14:
      return LEVEL_14;
    case 15:
      return LEVEL_15;
    case 16:
      return LEVEL_16;
    case 99:
      return LEVEL_99;
    case 110:
      return TUTORIAL_LEVEL_10;
    case 120:
      return TUTORIAL_LEVEL_20;
    case 130:
      return TUTORIAL_LEVEL_30;
    case 140:
      return TUTORIAL_LEVEL_40;
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

export function invertDirection(dir: DIR) {
  if (dir === DIR.UP) return DIR.DOWN;
  if (dir === DIR.DOWN) return DIR.UP;
  if (dir === DIR.LEFT) return DIR.RIGHT;
  if (dir === DIR.RIGHT) return DIR.LEFT;
  return dir;
}

export function rotateDirection(dir: DIR) {
  if (dir === DIR.UP) return DIR.LEFT;
  if (dir === DIR.LEFT) return DIR.DOWN;
  if (dir === DIR.DOWN) return DIR.RIGHT;
  if (dir === DIR.RIGHT) return DIR.UP;
  return dir;
}

export function getRotationFromDirection(direction: DIR) {
  switch (direction) {
    case DIR.UP:
      return Math.PI * 1.5;
    case DIR.DOWN:
      return Math.PI * .5;
    case DIR.LEFT:
      return Math.PI * 1;
    case DIR.RIGHT:
      return 0;
  }
}

export function dirToUnitVector(p5: P5, dir: DIR): Vector {
  switch (dir) {
    case DIR.LEFT:
      return p5.createVector(-1, 0);
    case DIR.RIGHT:
      return p5.createVector(1, 0);
    case DIR.UP:
      return p5.createVector(0, -1);
    case DIR.DOWN:
      return p5.createVector(0, 1);
    default:
      return p5.createVector(0, 0);
  }
}

export function isSameDirection(a: DIR, b: DIR): boolean {
  return a && b && a === b;
}

export function isOppositeDirection(a: DIR, b: DIR): boolean {
  return a && b && a === invertDirection(b);
}

export function isOrthogonalDirection(a: DIR, b: DIR): boolean {
  return a && b && a === rotateDirection(b) || a === invertDirection(rotateDirection(b));
}

/**
 * Get the closest direction that fits a vector
 */
export function vectorToDir(x: number, y: number): DIR {
  if (x == 0 && y == 0) return null;
  if (Math.abs(x) >= Math.abs(y)) {
    if (x >= 0) {
      return DIR.RIGHT;
    } else {
      return DIR.LEFT;
    }
  } else {
    if (y >= 0) {
      return DIR.DOWN;
    } else {
      return DIR.UP;
    }
  }
}

export function indexToDir(index: number): DIR {
  if (index <= 1) return DIR.RIGHT;
  if (index <= 2) return DIR.UP;
  if (index <= 3) return DIR.LEFT;
  return DIR.DOWN;
}

// triangle wave algorithm
export function oscilateLinear(num: number) {
  return 1 - Math.abs(num % 2 - 1);
}

export function parseUrlQueryParams(): QueryParams {
  const query = new URLSearchParams(window.location.search);
  const params: QueryParams = {
    enableQuoteMode: query.get("enableQuoteMode")?.toLowerCase() === 'true',
    enableWarp: query.get("enableWarp")?.toLowerCase() === 'true',
    showFps: query.get("showFps")?.toLowerCase() === 'true',
  }
  return params;
}

export function getTrackName(track?: MusicTrack) {
  if (!track) return "No Track";
  switch (track) {
    case MusicTrack.simpleTime:
      return "Adventuring";
    case MusicTrack.conquerer:
      return "Conquerer";
    case MusicTrack.transient:
      return "Transit";
    case MusicTrack.lordy:
      return "Hotline";
    case MusicTrack.champion:
      return "Snekmaster";
    case MusicTrack.dangerZone:
      return "Sidewinder";
    case MusicTrack.aqueduct:
      return "Aqueduct";
    case MusicTrack.creeplord:
      return "Underlair";
    case MusicTrack.moneymaker:
      return "Supersnek";
    case MusicTrack.factorio:
      return "Manufactory";
    case MusicTrack.observer:
      return "Observer";
    case MusicTrack.skycastle:
      return "Skycastle";
    case MusicTrack.shopkeeper:
      return "Shopkeeper";
    case MusicTrack.stonemaze:
      return "Darkstone";
    case MusicTrack.woorb:
      return "Hightech";
    case MusicTrack.gravy:
      return "Snekraid";
    default:
      return "Unknown";
  }
}

export function getElementPosition(el: HTMLElement) {
  var xPosition = 0;
  var yPosition = 0;
  while (el) {
    if (el.tagName === "BODY") {
      // deal with browser quirks with body/window/document and page scroll
      var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
      var yScrollPos = el.scrollTop || document.documentElement.scrollTop;

      xPosition += (el.offsetLeft - xScrollPos + el.clientLeft);
      yPosition += (el.offsetTop - yScrollPos + el.clientTop);
    } else {
      xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent as HTMLElement;
  }
  return {
    x: xPosition,
    y: yPosition
  };
}

export function lerp(a: number, b: number, t: number) {
  return (1.0 - clamp(t, 0, 1)) * a + b * clamp(t, 0, 1);
}

export function inverseLerp(a: number, b: number, v: number, shouldClamp = true) {
  const val = (v - a) / (b - a);
  return shouldClamp ? clamp(val, 0, 1) : val;
}

export function remap(iMin: number, iMax: number, oMin: number, oMax: number, v: number) {
  return lerp(oMin, oMax, inverseLerp(iMin, iMax, v));
}

export function round(num: number, precision = 2) {
  return Math.round((num + Number.EPSILON) * (10 ^ precision)) / (10 ^ precision);
}

export function isWithinBlockDistance(a: Vector, b: Vector, distance: number = 1) {
  return Math.abs(a.x - b.x) <= distance && Math.abs(a.y - b.y) <= distance;
}
