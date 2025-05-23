import { Vector } from "p5";

import {
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_ULTRA,
  GRIDCOUNT,
  INVINCIBILITY_EXPIRE_FLASH_MS,
  PICKUP_EXPIRE_WARN_MS,
} from "./constants";
import {
  DIR,
  Difficulty,
  KeyChannel,
  Level,
  MusicTrack,
  Portal,
  PortalChannel,
  PortalExitMode,
  QueryParams,
  Stats,
} from "./types";

export function clamp(val: number, minVal: number, maxVal: number) {
  const clamped = Math.max(Math.min(val, maxVal), minVal);
  return isNaN(clamped) ? minVal : clamped;
}

export function getCoordIndex(vec: Vector | undefined): number {
  if (!vec) return -1;
  return getCoordIndex2(vec.x, vec.y);
}

export function getCoordIndex2(x: number, y: number): number {
  return clamp(Math.floor(x), 0, GRIDCOUNT.x - 1) + clamp(Math.floor(y), 0, GRIDCOUNT.y - 1) * GRIDCOUNT.x
}

export function coordToVec(index: number): Vector {
  index = Math.floor(index);
  const x = Math.floor(index % GRIDCOUNT.x);
  const y = Math.floor(index / GRIDCOUNT.x);
  return new Vector(x, y);
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

export function getDifficultyName(index: number) {
  index = clamp(index, 1, 4);
  switch (index) {
    case 1:
      return 'EASY';
    case 2:
      return 'MEDIUM';
    case 3:
      return 'HARD';
    case 4:
      return 'ULTRA';
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

/**
 * rotate direction counter-clockwise
 */
export function rotateDirection(dir: DIR) {
  if (dir === DIR.UP) return DIR.LEFT;
  if (dir === DIR.LEFT) return DIR.DOWN;
  if (dir === DIR.DOWN) return DIR.RIGHT;
  if (dir === DIR.RIGHT) return DIR.UP;
  return dir;
}

export function getDirectionBetween(from: Vector, to: Vector) {
  if (!from || !to) return DIR.RIGHT;
  const diffX = clamp(from.x - to.x, -1, 1);
  const diffY = clamp(from.y - to.y, -1, 1);
  if (diffX === -1) return DIR.LEFT;
  if (diffX === 1) return DIR.RIGHT;
  if (diffY === -1) return DIR.UP;
  if (diffY === 1) return DIR.DOWN;
  return DIR.RIGHT;
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

export function dirToUnitVector(dir: DIR): Vector {
  switch (dir) {
    case DIR.LEFT:
      return new Vector(-1, 0);
    case DIR.RIGHT:
      return new Vector(1, 0);
    case DIR.UP:
      return new Vector(0, -1);
    case DIR.DOWN:
      return new Vector(0, 1);
    default:
      return new Vector(0, 0);
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
  if (x == 0 && y == 0) return DIR.RIGHT;
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
    case MusicTrack.None:
      return 'None';
    case MusicTrack.simpleTime:
      return "Adventurer";
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
      return "Outlast";
    case MusicTrack.factorio:
      return "Manufactory";
    case MusicTrack.observer:
      return "Observer";
    case MusicTrack.skycastle:
      return "Skycastle";
    case MusicTrack.shopkeeper:
      return "Loomspin";
    case MusicTrack.stonemaze:
      return "Darkstone";
    case MusicTrack.woorb:
      return "Hightech";
    case MusicTrack.gravy:
      return "Snektroid";
    case MusicTrack.lostcolony:
      return "Warpcore";
    case MusicTrack.reconstitute:
      return "Reconstitute";
    case MusicTrack.ascension:
      return "Ascension";
    case MusicTrack.backrooms:
      return "Backrooms";
    case MusicTrack.slyguy:
      return "Resolute";
    case MusicTrack.overture:
      return "Overture";
    case MusicTrack.drone:
      return "Drone";
    case MusicTrack.slime_dangerman:
      return "SC_Mind Control";
    case MusicTrack.slime_exitmusic:
      return "SC_The Underground";
    case MusicTrack.slime_megacreep:
      return "SC_Lights Out";
    case MusicTrack.slime_monsterdance:
      return "SC_Unlikely Foe";
    case MusicTrack.slime_rollcredits:
      return "SC_Roll Credits";
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

export function getLevelProgress(stats: Stats, level: Level, difficulty: Difficulty) {
  return clamp(stats.applesEatenThisLevel / (level.applesToClear * (level.applesModOverride || difficulty.applesMod)), 0, 1);
}

/**
 * produces an output continously going from -1 to 1, starting at 0
 */
export function sawtooth(t: number, offset = 0) {
  const t0 = (t || 0) + (offset || 0);
  return 2 * (t0 - Math.floor(t0) - 0.5);
}

/**
 * produces an output oscilating between 0 and 1, linearly.
 *
 * highest point: t=1
 */
export function triangle(t: number) {
  return Math.abs(sawtooth((t || 0) * 0.5, 0.5));
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

export function getTraversalDistance(x0: number, y0: number, x1: number, y1: number): number {
  return Math.abs(x0 - x1) + Math.abs(y0 - y1);
}

export const getRelativeDir = () => {
  if (process.env.NODE_ENV === 'production') return ''
  const rootPath = window.location.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')[0]
  return rootPath ? `/${rootPath}/` : '/';
}

export const getGraphicsDir = (appendPath = '') => {
  return `${getRelativeDir()}/assets/graphics/${appendPath}`;;
}

export const isValidPortalChannel = (portalChannel: number): portalChannel is PortalChannel => {
  if (portalChannel === null || portalChannel === undefined) return false;
  return Number.isInteger(portalChannel) && portalChannel >= 0 && portalChannel <= 9
}

export const isValidKeyChannel = (channel: number): channel is KeyChannel => {
  if (channel === null || channel === undefined) return false;
  return Number.isInteger(channel) && channel >= 0 && channel <= 2
}

export const toDIR = (dir: string): DIR => {
  switch (String(dir).toUpperCase()) {
    case DIR.DOWN:
      return DIR.DOWN;
    case DIR.UP:
      return DIR.UP;
    case DIR.LEFT:
      return DIR.LEFT;
    case DIR.RIGHT:
    default:
      return DIR.RIGHT;
  }
}

export function isOutsideMap(location: Vector) {
  return location.x < 0 || location.x >= GRIDCOUNT.x || location.y < 0 || location.y >= GRIDCOUNT.y;
}

export function checkHasPortalAtLocation(location: Vector, portalsMap: Record<number, Portal>) {
  return !!portalsMap[getCoordIndex(location)];
}

interface GetBestPortalExitDirectionArgs {
  portalLink: Vector | undefined,
  playerDirection: DIR,
  portalExitMode: PortalExitMode,
  checkHasHit: (location: Vector) => boolean,
  hasPortalAtLocation: (location: Vector) => boolean,
  ignoreBestCheck?: boolean,
}
export function getBestPortalExitDirection({
  portalLink,
  playerDirection,
  portalExitMode,
  checkHasHit,
  hasPortalAtLocation,
  ignoreBestCheck,
}: GetBestPortalExitDirectionArgs) {
  if (!portalLink) return playerDirection;
  const newDir = portalExitMode === PortalExitMode.InvertDirection
    ? invertDirection(playerDirection)
    : playerDirection;
  if (ignoreBestCheck) {
    return newDir;
  }
  let scoreLeft = 0, scoreRight = 0, scoreUp = 0, scoreDown = 0;
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.LEFT)))) {
    scoreLeft += 1000;
  }
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.RIGHT)))) {
    scoreRight += 1000;
  }
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.UP)))) {
    scoreUp += 1000;
  }
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.DOWN)))) {
    scoreDown += 1000;
  }
  if (isOutsideMap(portalLink.copy().add(dirToUnitVector(DIR.LEFT)))) {
    scoreLeft += 100;
  }
  if (isOutsideMap(portalLink.copy().add(dirToUnitVector(DIR.RIGHT)))) {
    scoreRight += 100;
  }
  if (isOutsideMap(portalLink.copy().add(dirToUnitVector(DIR.UP)))) {
    scoreUp += 100;
  }
  if (isOutsideMap(portalLink.copy().add(dirToUnitVector(DIR.DOWN)))) {
    scoreDown += 100;
  }
  if (hasPortalAtLocation(portalLink.copy().add(dirToUnitVector(DIR.LEFT)))) {
    scoreLeft += 10;
  }
  if (hasPortalAtLocation(portalLink.copy().add(dirToUnitVector(DIR.RIGHT)))) {
    scoreRight += 10;
  }
  if (hasPortalAtLocation(portalLink.copy().add(dirToUnitVector(DIR.UP)))) {
    scoreUp += 10;
  }
  if (hasPortalAtLocation(portalLink.copy().add(dirToUnitVector(DIR.DOWN)))) {
    scoreDown += 10;
  }
  if (newDir !== DIR.LEFT) {
    scoreLeft += 1;
  }
  if (newDir !== DIR.RIGHT) {
    scoreRight += 1;
  }
  if (newDir !== DIR.UP) {
    scoreUp += 1;
  }
  if (newDir !== DIR.DOWN) {
    scoreDown += 1;
  }
  const lowestScore = Math.min(scoreLeft, scoreRight, scoreUp, scoreDown);
  switch (lowestScore) {
    case scoreLeft:
      return DIR.LEFT;
    case scoreRight:
      return DIR.RIGHT;
    case scoreUp:
      return DIR.UP;
    case scoreDown:
      return DIR.DOWN;
    default:
      return newDir;
  }
}

export function preloadImage(url: string)
{
  return new Promise((resolve, reject) => {
    try {
      const image = new Image();
      const onLoad = () => {
        cleanup();
        resolve(image);
      }
      const onError = (err: ErrorEvent) => {
        cleanup();
        reject(err.error);
      }
      const cleanup = () => {
        image.removeEventListener("load", onLoad);
        image.removeEventListener("error", onError)
      }
      image.addEventListener("load", onLoad);
      image.addEventListener("error", onError)
      image.src = url;      
    } catch (err) {
      reject(err);
    }
  });
}

export function wait(duration: number) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, duration);
  })
}

export const shouldBlinkExpiringPickup = (timeLeft: number) => !!timeLeft && timeLeft <= PICKUP_EXPIRE_WARN_MS && Math.floor(timeLeft / INVINCIBILITY_EXPIRE_FLASH_MS) % 2 === 0

interface ToTimeParams {
  minutes: number,
  seconds: number,
  ms?: number,
}
export const toTime = ({ minutes = 0, seconds = 0, ms = 0}: ToTimeParams) => {
  return (minutes || 0) * 1000 * 60 + (seconds || 0) * 1000 + ms;
}
