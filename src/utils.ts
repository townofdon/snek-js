import P5, { Vector } from "p5";

import {
  ANIMATIONS,
  BUTTON_RELEASE_DAMAGE_DELAY,
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_ULTRA,
  FRAME_DUR_MS,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_STUN_TIME,
  INVINCIBILITY_EXPIRE_FLASH_MS,
  IS_DEV,
  IS_LOCALHOST,
  MAX_APPLES_TO_CLEAR,
  PICKUP_EXPIRE_WARN_MS,
  PICKUP_LIFETIME_MS_EPIC,
  PICKUP_LIFETIME_MS_GALACTIC,
  PICKUP_LIFETIME_MS_LEGENDARY,
  THREAT_LASER_MAX_SPAN,
} from "./constants";
import {
  BARRIER_TYPE_MAX,
  BarrierType,
  DIR,
  Difficulty,
  DifficultyIndex,
  IEnumerator,
  KeyChannel,
  Level,
  MusicTrack,
  Portal,
  PortalChannel,
  PortalExitMode,
  QueryParams,
  Stats,
  PickupRarity,
  PreyType,
  MOVE,
  PickupType,
  PICKUP_TYPE_MAX,
  GameState,
  LoopState,
  ThreatType,
  THREAT_TYPE_MAX,
  LaserCell,
  Orientation,
  LaserType,
  SpritesheetRange,
  SPRITESHEET_RANGE_MAX,
  EngineState,
  ICollection,
  IFlaggable,
  ThreatFlag,
  SwitchType,
  SWITCH_TYPE_MAX,
  SpritesheetImage,
  Image as SnekImage,
  PipeConnection,
  FLAG_NORTH,
  FLAG_SOUTH,
  FLAG_WEST,
  FLAG_EAST,
  DamageType,
  MapAnnotation,
  Episode,
  GameMode,
  WearableFrame,
  Context,
} from "./types";
import { ExtendedSketchData } from "./editor/editorSketch";

export function clamp(val: number, minVal: number, maxVal: number) {
  const clamped = Math.max(Math.min(val, maxVal), minVal);
  return isNaN(clamped) ? minVal : clamped;
}

export function getCoordIndex(vec: Vector | undefined): number {
  if (!vec) return -1;
  return getCoordIndex2(vec.x, vec.y);
}

export function getCoordIndex2(x: number, y: number): number {
  return clamp(Math.floor(x), 0, GRIDCOUNT_X - 1) + clamp(Math.floor(y), 0, GRIDCOUNT_Y - 1) * GRIDCOUNT_X;
}

export function getCoordIndex3(x: number, y: number, resolution: number): number {
  const r = Math.floor(Math.max(resolution, 0));
  return clamp(Math.floor(x), 0, GRIDCOUNT_X * r - 1) + clamp(Math.floor(y), 0, GRIDCOUNT_Y * r - 1) * GRIDCOUNT_X * r;
}

export function getCoordX(coord: number) {
  return Math.floor(coord % GRIDCOUNT_X);
}

export function getCoordY(coord: number) {
  return Math.floor(coord / GRIDCOUNT_X);
}

export function coordToVec(coord: number): Vector {
  coord = Math.floor(coord);
  const x = Math.floor(coord % GRIDCOUNT_X);
  const y = Math.floor(coord / GRIDCOUNT_X);
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

/**
 * return a new shuffled array without mutating
 */
export function shuffleArray<T>(array: T[]) {
  if (!array || !array.length) return [];
  if (array.length === 1) return [...array];
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i] as T;
    copy[i] = copy[j] as T;
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

export function checkIsMoving(state: GameState, loopState: LoopState): boolean {
  if (!state.isMoving && !state.isRewinding) return false;
  if (state.timeSinceHurt < HURT_STUN_TIME) return false;
  if (state.timeSinceArmorProtection < HURT_STUN_TIME && !state.isRewinding) return false;
  if (loopState.timeScale === 0) return false;
  return true;
}

export function moveToDir(move: MOVE): DIR | null {
  switch (move) {
    case MOVE.UP:
      return DIR.UP;
    case MOVE.DOWN:
      return DIR.DOWN;
    case MOVE.LEFT:
      return DIR.LEFT;
    case MOVE.RIGHT:
      return DIR.RIGHT;
    case MOVE.TURN_R:
    case MOVE.TURN_L:
    case MOVE.UTURN_R:
    case MOVE.UTURN_L:
    case MOVE.STRAFE_R:
    case MOVE.STRAFE_L:
    case MOVE.Nil:
    default:
      return null;
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

export function rotateSystemAfterPortalTraverse(
  prev: DIR,
  current: DIR,
  applyTo: DIR,
) {
  if (prev === current) return applyTo;
  if (!applyTo) return applyTo;
  const diff = (2 * Math.PI + getRotationFromDirection(current) - getRotationFromDirection(prev)) % (2 * Math.PI);
  // rotate counter-clockwise 90 degrees
  if (approximatelyEqual(-Math.PI * .5, diff)) {
    return rotateDirection(applyTo);
  }
  // rotate counter-clockwise 180 degrees
  if (approximatelyEqual(-Math.PI * 1, diff)) {
    return invertDirection(applyTo);
  }
  // rotate counter-clockwise 270 degrees
  if (approximatelyEqual(-Math.PI * 1.5, diff)) {
    return invertDirection(rotateDirection(applyTo));
  }
  // rotate clockwise 90 degrees
  if (approximatelyEqual(Math.PI * .5, diff)) {
    return invertDirection(rotateDirection(applyTo));
  }
  // rotate clockwise 180 degrees
  if (approximatelyEqual(Math.PI * 1, diff)) {
    return invertDirection(applyTo);
  }
  // rotate clockwise 270 degrees
  if (approximatelyEqual(Math.PI * 1.5, diff)) {
    return rotateDirection(applyTo);
  }
  return applyTo;
}

export function approximatelyEqual(v1: number, v2: number, epsilon = 0.001) {
  return Math.abs(v1 - v2) < epsilon;
}

export function getDirectionBetween(from: Vector | undefined, to: Vector | undefined) {
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
    case MusicTrack.full_simpleTime:
      return "Adventurer";
    case MusicTrack.conquerer:
      return "Conquerer";
    case MusicTrack.transient:
    case MusicTrack.full_transient:
      return "Transit";
    case MusicTrack.lordy:
      return "Hotline";
    case MusicTrack.champion:
      return "Snekmaster";
    case MusicTrack.dangerZone:
    case MusicTrack.full_dangerZone:
      return "Sidewinder";
    case MusicTrack.aqueduct:
      return "Aqueduct";
    case MusicTrack.creeplord:
    case MusicTrack.full_creeplord:
      return "Underlair";
    case MusicTrack.moneymaker:
    case MusicTrack.full_moneymaker:
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
    case MusicTrack.full_slyguy:
      return "Resolute";
    case MusicTrack.overture:
      return "Victory!";
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
  let applesToClear = (level.applesToClear * (level.applesModOverride || difficulty.applesMod));
  applesToClear = Math.min(applesToClear, MAX_APPLES_TO_CLEAR);
  return clamp(stats.applesEatenThisLevel / applesToClear, 0, 1);
}

export function toRarity(num: number): PickupRarity {
  if (!num || num <= 0) return PickupRarity.None;
  if (num > PickupRarity.Galactic) return PickupRarity.None;
  return num as PickupRarity;
}

export function toPreyType(num: number): PreyType {
  if (num <= 0) return PreyType.None;
  if (num > PreyType.Grasshopper) return PreyType.None;
  return num as PreyType;
}

export function readablePreyType(preyType: PreyType): string {
  switch (preyType) {
    case PreyType.Grub:
      return "Grub";
    case PreyType.FieldMouse:
      return "Mouse";
    case PreyType.Ant:
      return "Roach";
    case PreyType.Grasshopper:
      return "Grasshopper";
    case PreyType.None:
    default:
      return "None"
  }
}

export function getDropLikelihood(
  dropConf: number | boolean | Record<DifficultyIndex, number | boolean>,
  baseLikelihood: number,
  difficultyIndex: DifficultyIndex,
): number {
  if (IS_DEV && dropConf === undefined) {
    throw new Error(`drop config param was undefined in getDropLikelihood()`);
  }
  if (typeof dropConf === 'number') {
    return dropConf * baseLikelihood;
  }
  if (typeof dropConf === 'boolean') {
    return dropConf ? baseLikelihood : 0;
  }
  if (typeof dropConf?.[difficultyIndex] === 'number') {
    return (dropConf[difficultyIndex] as number) * baseLikelihood;
  }
  return dropConf?.[difficultyIndex] ? baseLikelihood : 0;
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

/**
 * Return the Manhattan Distance between (x0, y0) and (x1, y1)
 */
export function getManhattanDistance(x0: number, y0: number, x1: number, y1: number): number {
  return Math.abs(x0 - x1) + Math.abs(y0 - y1);
}

/**
 * Return the Euclidian Distance between (x0, y0) and (x1, y1)
 */
export function getEuclidianDistance(x0: number, y0: number, x1: number, y1: number): number {
  const dx = (x1 - x0);
  const dy = (y1 - y0);
  return Math.sqrt(dx * dx + dy * dy);
}

export const getRelativeDir = () => {
  if (process.env.NODE_ENV === 'production') return ''
  const rootPath = window.location.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')[0]
  return rootPath ? `/${rootPath}/` : '/';
}

export const getGraphicsDir = (appendPath = '') => {
  return `${getRelativeDir()}/assets/graphics/${appendPath}`;;
}

export function isValidSpritesheetRange(val: any): val is SpritesheetRange {
  if (typeof val !== 'number') return false;
  return Number.isInteger(val) && val >= SpritesheetRange.None && val < SPRITESHEET_RANGE_MAX;
}

export const isValidPortalChannel = (portalChannel: number): portalChannel is PortalChannel => {
  if (portalChannel === null || portalChannel === undefined) return false;
  return Number.isInteger(portalChannel) && portalChannel >= 0 && portalChannel <= 9
}

export const isValidBarrierType = (barrierType: number): barrierType is BarrierType => {
  if (barrierType === null || barrierType === undefined) return false;
  return Number.isInteger(barrierType) && barrierType >= 0 && barrierType < BARRIER_TYPE_MAX;
}

export const isValidPickupType = (pickupType: number): pickupType is PickupType => {
  if (pickupType === null || pickupType === undefined) return false;
  return Number.isInteger(pickupType) && pickupType > 0 && pickupType < PICKUP_TYPE_MAX;
}

export const isValidThreatType = (threatType: number): threatType is ThreatType => {
  if (threatType === null || threatType === undefined) return false;
  return Number.isInteger(threatType) && threatType > 0 && threatType < THREAT_TYPE_MAX;
}

export const isValidSwitchType = (switchType: number): switchType is SwitchType => {
  if (switchType === null || switchType === undefined) return false;
  return Number.isInteger(switchType) && switchType > 0 && switchType < SWITCH_TYPE_MAX;
}

export const isBreakableBarrier = (barrierType: BarrierType): boolean => {
  if (!barrierType) return false;
  return (
    barrierType === BarrierType.Brick ||
    barrierType === BarrierType.BrickThemed ||
    barrierType === BarrierType.BrickWhite ||
    barrierType === BarrierType.Stone ||
    barrierType === BarrierType.StoneThemed
  );
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
  return location.x < 0 || location.x >= GRIDCOUNT_X || location.y < 0 || location.y >= GRIDCOUNT_Y;
}

export function isAtMapEdge(x: number, y: number, distanceTolerance: number = 1) {
  return Math.abs(x) < distanceTolerance
    || Math.abs(GRIDCOUNT_X - 1 - x) < distanceTolerance
    || Math.abs(y) < distanceTolerance
    || Math.abs(GRIDCOUNT_Y - 1 - y) < distanceTolerance
}

export function hasNeighborEdgeDoor(dir: DIR, doorsMap: Record<number, any>, x: number, y: number, distanceTolerance: number = 1) {
  let t = 1;
  const vec = dirToUnitVector(dir);
  while (t <= distanceTolerance) {
    const dx = t * vec.x;
    const dy = t * vec.y;
    const result = doorsMap[getCoordIndex2(x + dx, y + dy)];
    if (result === false || result === undefined || result === null) {
      return false;
    }
    if (isAtMapEdge(x + dx, y + dy, 1)) {
      return true
    }
    t++;
  }
  return false;
}

export function checkHasPortalAtLocation(location: Vector, portalsMap: Record<number, Portal>) {
  return !!portalsMap[getCoordIndex(location)];
}

interface GetBestPortalExitDirectionArgs {
  portalLink: Vector | undefined,
  playerDirection: DIR,
  portalExitMode: PortalExitMode,
  checkCollision: (location: Vector) => DamageType,
  hasPortalAtLocation: (location: Vector) => boolean,
  ignoreBestCheck?: boolean,
}
export function getBestPortalExitDirection({
  portalLink,
  playerDirection,
  portalExitMode,
  checkCollision,
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
  if (!!checkCollision(portalLink.copy().add(dirToUnitVector(DIR.LEFT)))) {
    scoreLeft += 1000;
  }
  if (!!checkCollision(portalLink.copy().add(dirToUnitVector(DIR.RIGHT)))) {
    scoreRight += 1000;
  }
  if (!!checkCollision(portalLink.copy().add(dirToUnitVector(DIR.UP)))) {
    scoreUp += 1000;
  }
  if (!!checkCollision(portalLink.copy().add(dirToUnitVector(DIR.DOWN)))) {
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

export const isNil = (val: any): boolean => val === undefined || val === null;

export const shouldBlinkExpiringPickup = (timeLeft: number, warnTime = PICKUP_EXPIRE_WARN_MS) =>
  !!timeLeft
  && timeLeft <= warnTime
  && Math.floor(timeLeft / INVINCIBILITY_EXPIRE_FLASH_MS) % 2 === 0;

export const getPickupLifetime = (rarityType: PickupRarity): number => {
  switch (rarityType) {
    case PickupRarity.Epic:
      return PICKUP_LIFETIME_MS_EPIC;
    case PickupRarity.Legendary:
      return PICKUP_LIFETIME_MS_LEGENDARY;
    case PickupRarity.Galactic:
      return PICKUP_LIFETIME_MS_GALACTIC;
    case PickupRarity.None:
    case PickupRarity.Common:
    case PickupRarity.Rare:
      return 999999999999;
    default:
      if (IS_LOCALHOST) {
        throw new Error(`Non-rarity-type passed to getPickupLifetime: ${rarityType}`);
      }
      return 999999999999;
  }
}

export const getCurrentFrame = (sprite: SpritesheetImage | SpritesheetRange, elapsed: number): number => {
  if (!sprite) return 0;
  if (!ANIMATIONS[sprite]) throw new Error(`no animation data found for image "${sprite}"`);
  const { frames, timePerFrame, durations, oneShot = false, loopFrameOffset = 0 } = ANIMATIONS[sprite];
  if (!timePerFrame) throw new Error(`timePerFrame cannot be zero. val=${timePerFrame},img=${sprite}`);
  if (!frames || !timePerFrame) return 0;

  const totalDuration = durations?.length ? durations.reduce((a, b) => a + b, 0) : frames * timePerFrame;
  // oneshot: play once through and hold on the last frame
  if (oneShot && elapsed >= totalDuration) {
    return frames - 1;
  }
  // loop offset behavior: play from beginning, loop back to a specific frame offset
  const loopOffset = elapsed >= totalDuration ? loopFrameOffset : 0;
  // default behavior: continuously iterate through frames evenly
  let frame = Math.floor((elapsed - loopOffset * timePerFrame) / timePerFrame) % (frames - loopOffset) + loopOffset;
  // `durations` overrides `frame`, `timePerFrame`
  if (durations?.length) {
    // get the total duration from the loop frame forward
    const loopDuration = durations
      .filter((_, i) => i >= loopOffset)
      .reduce((a, b) => a + b, 0);
    // time cursor
    const t = (elapsed - loopOffset * timePerFrame) % loopDuration;
    // find current frame where time_cursor < current_sum + current_frame_duration
    frame = loopOffset;
    let sum = 0;
    for (let i = loopOffset; i < durations.length; i++) {
      sum += durations[i];
      if (t < sum) {
        frame = i;
        break;
      }
    }
  }
  return frame;
}

export const getFrameOffset = (sprite: SpritesheetImage | SpritesheetRange) => {
  if (!sprite) return 0;
  if (!ANIMATIONS[sprite]) throw new Error(`no animation data found for image "${sprite}"`);
  return isValidSpritesheetRange(sprite) ? (ANIMATIONS[sprite].offset || 0) : 0;
}

export const getDerivedSprite = (sprite: SpritesheetImage | SpritesheetRange): SpritesheetImage => {
  if (!sprite) return SnekImage.__TEST__;
  if (!ANIMATIONS[sprite]) throw new Error(`no animation data found for image "${sprite}"`);
  return isValidSpritesheetRange(sprite) ? (ANIMATIONS[sprite].src || SnekImage.__TEST__) : sprite;
}

export const isSpritesheetImage = (image: SnekImage): image is SpritesheetImage => {
  const animationData = ANIMATIONS[image];
  return !!animationData && !animationData.src;
}

export const getNumFrames = (sprite: SpritesheetImage | SpritesheetRange) => {
  if (!sprite) return 0;
  if (!ANIMATIONS[sprite]) throw new Error(`no animation data found for image "${sprite}"`);
  const { frames, timePerFrame } = ANIMATIONS[sprite];
  if (!timePerFrame) throw new Error(`timePerFrame cannot be zero. val=${timePerFrame},img=${sprite}`);
  const src = isValidSpritesheetRange(sprite) ? (ANIMATIONS[sprite].src || SnekImage.__TEST__) : sprite;
  return ANIMATIONS[src]?.frames || frames;
};

/**
 * Determine which direction a tile should be facing based on its neighbors.
 */
export const getTileDir = (x: number, y: number, es: EngineState | ExtendedSketchData): DIR => {
  if (x < 0 || y < 0 || x >= GRIDCOUNT_X - 1 || y >= GRIDCOUNT_Y - 1) {
    return DIR.RIGHT;
  }
  const valid = (vx: number, vy: number) => {
    const coord = getCoordIndex2(vx, vy);
    return true
      && vx >= 0 && vx <= GRIDCOUNT_X - 1
      && vy >= 0 && vy <= GRIDCOUNT_Y - 1
      && (false
        || es.threatsMap[coord] === ThreatType.LaserDiode
        // || es.threatsMap[coord] === ThreatType.Flamethrower
        || !!es.pipesMap[coord]
        || !!es.barriersMap[coord]
        || !!es.doorsMap[coord]
        || !isNil(es.locksMap[coord])
      );
  }
  let neighbors: PipeConnection = 0;
  if (valid(x, y - 1)) neighbors |= FLAG_NORTH;
  if (valid(x, y + 1)) neighbors |= FLAG_SOUTH;
  if (valid(x - 1, y)) neighbors |= FLAG_WEST;
  if (valid(x + 1, y)) neighbors |= FLAG_EAST;
  switch (neighbors) {
    case PipeConnection.N:
      return DIR.DOWN;
    case PipeConnection.S:
      return DIR.UP;
    case PipeConnection.NS:
      return DIR.RIGHT;
    case PipeConnection.W:
      return DIR.RIGHT;
    case PipeConnection.NW:
      return DIR.RIGHT;
    case PipeConnection.SW:
      return DIR.RIGHT;
    case PipeConnection.NSW:
      return DIR.RIGHT;
    case PipeConnection.E:
      return DIR.LEFT;
    case PipeConnection.NE:
      return DIR.LEFT;
    case PipeConnection.SE:
      return DIR.LEFT;
    case PipeConnection.NSE:
      return DIR.LEFT;
    case PipeConnection.WE:
      return DIR.UP;
    case PipeConnection.NWE:
      return DIR.DOWN;
    case PipeConnection.SWE:
      return DIR.UP;
    case PipeConnection.NSWE:
      return DIR.RIGHT;
    case PipeConnection.Island:
      return DIR.RIGHT;
    case PipeConnection.Unset:
      return DIR.RIGHT;
    default:
      return DIR.RIGHT;
  }
}

export const recalculateFlamesMap = (es: EngineState | ExtendedSketchData) => {
  const setFlame = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= GRIDCOUNT_X || y >= GRIDCOUNT_Y) return;
    es.flamesMap[getCoordIndex2(x, y)] = true;
  }
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      es.flamesMap[getCoordIndex2(x, y)] = undefined;
    }
  }
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      if (es.threatsMap[getCoordIndex2(x, y)] !== ThreatType.Flamethrower) {
        continue;
      }
      const dir = getTileDir(x, y, es);
      switch (dir) {
        case DIR.UP:
          setFlame(x, y - 1);
          setFlame(x, y - 2);
          break;
        case DIR.DOWN:
          setFlame(x, y + 1);
          setFlame(x, y + 2);
          break;
        case DIR.LEFT:
          setFlame(x - 1, y);
          setFlame(x - 2, y);
          break;
        case DIR.RIGHT:
          setFlame(x + 1, y);
          setFlame(x + 2, y);
          break;
      }
    }
  }
};

export const recalculateLasersMap = (es: EngineState | ExtendedSketchData, threats: ICollection & IFlaggable) => {
  const valid = (coord: number) => true
    && es.threatsMap[coord] !== ThreatType.Mine
    && es.threatsMap[coord] !== ThreatType.ExplodableBarrel
    && !es.barriersMap[coord]
    && !es.doorsMap[coord]
    && isNil(es.locksMap[coord])
    && isNil(es.portalsMap[coord]);
  // clear lasers map
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      es.lasersMap[getCoordIndex2(x, y)] = undefined;
    }
  }
  // clear threat sibling flags
  threats.bulkRemoveFlag(ThreatFlag.SiblingN);
  threats.bulkRemoveFlag(ThreatFlag.SiblingS);
  threats.bulkRemoveFlag(ThreatFlag.SiblingW);
  threats.bulkRemoveFlag(ThreatFlag.SiblingE);
  // recalculate relationships
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      if (!valid(getCoordIndex2(x, y))) {
        continue;
      }
      // always start from a diode
      if (es.threatsMap[getCoordIndex2(x, y)] !== ThreatType.LaserDiode) {
        continue;
      }
      const coordDiodeA = getCoordIndex2(x, y);
      // walk right
      let xDiodeRight = -1;
      for (let dx = 1; dx < THREAT_LASER_MAX_SPAN && (x + dx < GRIDCOUNT_X); dx++) {
        const coord = getCoordIndex2(x + dx, y);
        if (!valid(coord)) {
          break;
        }
        if (es.threatsMap[coord] === ThreatType.LaserDiode) {
          xDiodeRight = x + dx;
          break;
        }
      }
      // fill right
      for (let x2 = x + 1; x2 < xDiodeRight; x2++) {
        const coord = getCoordIndex2(x2, y);
        const coordDiodeB = getCoordIndex2(xDiodeRight, y);
        const orientation = es.lasersMap[coord]?.orientation === Orientation.Vertical
          ? Orientation.Mixed
          : Orientation.Horizontal;
        // skip cells if both diodes are crit or off
        const crit = byCoord(coordDiodeA)(threats.hasFlagAt, ThreatFlag.Crit) && byCoord(coordDiodeB)(threats.hasFlagAt, ThreatFlag.Crit);
        const off = !byCoord(coordDiodeA)(threats.enabledAt) || !byCoord(coordDiodeB)(threats.enabledAt);
        if (crit || off) {
          break;
        }
        const activating = byCoord(coordDiodeA)(threats.hasFlagAt, ThreatFlag.Activating) || byCoord(coordDiodeB)(threats.hasFlagAt, ThreatFlag.Activating);
        const red = byCoord(coordDiodeA)(threats.hasFlagAt, ThreatFlag.VariantA) || byCoord(coordDiodeB)(threats.hasFlagAt, ThreatFlag.VariantA);
        es.lasersMap[coord] = {
          orientation,
          type: activating ? LaserType.Warn : (red ? LaserType.Red : LaserType.Blue),
          coordDiodeA,
          coordDiodeB,
          damageActive: !activating,
        } satisfies LaserCell;
        byCoord(coordDiodeA)(threats.addFlagAt, ThreatFlag.SiblingE);
        byCoord(coordDiodeB)(threats.addFlagAt, ThreatFlag.SiblingW);
      }
      // walk down
      let yDiodeDown = -1;
      for (let dy = 1; dy < THREAT_LASER_MAX_SPAN && (y + dy < GRIDCOUNT_Y); dy++) {
        const coord = getCoordIndex2(x, y + dy);
        if (!valid(coord)) {
          break;
        }
        if (es.threatsMap[coord] === ThreatType.LaserDiode) {
          yDiodeDown = y + dy;
          break;
        }
      }
      // fill down
      for (let y2 = y + 1; y2 < yDiodeDown; y2++) {
        const coord = getCoordIndex2(x, y2);
        const coordDiodeB = getCoordIndex2(x, yDiodeDown);
        const orientation = es.lasersMap[coord]?.orientation === Orientation.Horizontal
          ? Orientation.Mixed
          : Orientation.Vertical;
        const crit = byCoord(coordDiodeA)(threats.hasFlagAt, ThreatFlag.Crit) && byCoord(coordDiodeB)(threats.hasFlagAt, ThreatFlag.Crit);
        const off = !byCoord(coordDiodeA)(threats.enabledAt) || !byCoord(coordDiodeB)(threats.enabledAt);
        if (crit || off) {
          break;
        }
        const activating = byCoord(coordDiodeA)(threats.hasFlagAt, ThreatFlag.Activating) || byCoord(coordDiodeB)(threats.hasFlagAt, ThreatFlag.Activating);
        const red = byCoord(coordDiodeA)(threats.hasFlagAt, ThreatFlag.VariantA) || byCoord(coordDiodeB)(threats.hasFlagAt, ThreatFlag.VariantA);
        es.lasersMap[coord] = {
          orientation,
          type: activating ? LaserType.Warn : (red ? LaserType.Red : LaserType.Blue),
          coordDiodeA,
          coordDiodeB,
          damageActive: !activating,
        } satisfies LaserCell;
        byCoord(coordDiodeA)(threats.addFlagAt, ThreatFlag.SiblingS);
        byCoord(coordDiodeB)(threats.addFlagAt, ThreatFlag.SiblingN);
      }
    }
  }
}

export const byCoord = (coord: number) => <T, Y extends Array<any>>(thunk: (x: number, y: number, ...params: Y) => T, ...params: Y): T => {
  coord = Math.floor(coord);
  const x = Math.floor(coord % GRIDCOUNT_X);
  const y = Math.floor(coord / GRIDCOUNT_X);
  return thunk(x, y, ...params);
}

export const withFlipx = (gfx: P5 | P5.Graphics, x: number, y: number, flipx: boolean, thunk: (tx: number, ty: number) => void, width = 1) => {
  gfx.push();
  let tx = x;
  if (flipx) {
    gfx.scale(-1, 1);
    tx = -tx - width;
  }
  thunk(tx, y);
  gfx.pop();
}

const FLAG_COLLISION_PIPES = 1 << 0;
export const COLLISION_MASK_ALL = 99999999;
export const COLLISION_MASK_EXCLUDE_PIPES = COLLISION_MASK_ALL & ~FLAG_COLLISION_PIPES;

export function checkCollision(ctx: Context, vec: Vector, mask: number): DamageType {
  const {
    es,
    state,
    player,
    segments,
  } = ctx;
  if (state.isExitingLevel) return DamageType.None;
  if (state.isExited) return DamageType.None;
  if (state.isGameWon) return DamageType.None;
  const coord = getCoordIndex(vec);
  // self
  const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
  const rewindingFromArmor = state.isRewinding && state.timeSinceArmorProtection < es.difficulty.invincibilityTime;
  if (segments.containsCoord(coord) && !invincible && !rewindingFromArmor) {
    return DamageType.HitSelf;
  }
  // clip reality
  if (es.level.disableWallCollision) return DamageType.None;
  // door
  if (es.doorsMap[coord]) {
    return DamageType.HitDoor;
  }
  // barrier
  const isPassableBarrier = state.isDoorsOpen && es.passablesMap[coord];
  if (!isPassableBarrier && es.barriersMap[coord]) {
    return DamageType.HitBarrier;
  }
  // lock
  if (es.locksMap[coord]) {
    if (es.locksMap[coord].channel === KeyChannel.Yellow && state.hasKeyYellow) return DamageType.None;
    if (es.locksMap[coord].channel === KeyChannel.Red && state.hasKeyRed) return DamageType.None;
    if (es.locksMap[coord].channel === KeyChannel.Blue && state.hasKeyBlue) return DamageType.None;
    return DamageType.HitLock;
  }
  // pipe
  if (!!(mask & FLAG_COLLISION_PIPES) && es.pipesMap[coord] && !findPipeExit(ctx, getCoordIndex(vec), player.direction)) {
    return DamageType.HitBarrier;
  }
  if (!(mask & FLAG_COLLISION_PIPES) && es.pipesMap[coord]) {
    return DamageType.HitBarrier;
  }
  // threats
  if (es.threatsMap[coord] === ThreatType.LaserDiode) {
    return DamageType.HitBarrier;
  }
  if (es.threatsMap[coord] === ThreatType.ExplodableBarrel) {
    return DamageType.HitBarrier;
  }
  const checkBarricade = state.timeSinceLastMove < BUTTON_RELEASE_DAMAGE_DELAY && state.timeSinceButtonPressChanged > BUTTON_RELEASE_DAMAGE_DELAY;
  if (checkBarricade && es.threatsMap[coord] === ThreatType.Barricade && !state.isButtonPressed) {
    return DamageType.HitBarrier;
  }
  if (es.threatsMap[coord] === ThreatType.Spikes && !state.isButtonPressed && !invincible) {
    return DamageType.SpikePierce;
  }
  if (es.threatsMap[coord] === ThreatType.WallSpikes && !state.isButtonPressed && !invincible) {
    return DamageType.SpikePierce;
  }
  if (es.threatsMap[coord] === ThreatType.Saw && !state.isButtonPressed && !invincible) {
    return DamageType.SawCut;
  }
  if (es.threatsMap[coord] === ThreatType.Flamethrower) {
    return DamageType.HitBarrier;
  }
  return DamageType.None;
}

const getPipeIdx = (coord: number, pipesMap: Record<number, PipeConnection>): PipeConnection => {
  if (!pipesMap[coord]) return PipeConnection.Unset;
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  const up = y > 0 ? !!pipesMap[getCoordIndex2(x, y - 1)] : false;
  const down = y < GRIDCOUNT_Y - 1 ? !!pipesMap[getCoordIndex2(x, y + 1)] : false;
  const left = x > 0 ? !!pipesMap[getCoordIndex2(x - 1, y)] : false;
  const right = x < GRIDCOUNT_X - 1 ? !!pipesMap[getCoordIndex2(x + 1, y)] : false;
  let idx = 0;
  if (up) idx += FLAG_NORTH;
  if (down) idx += FLAG_SOUTH;
  if (left) idx += FLAG_WEST;
  if (right) idx += FLAG_EAST;
  if (!idx) return PipeConnection.Unset;
  return idx;
}

const getPipeCapIdx = (coord: number, pipesMap: Record<number, PipeConnection>, pipeOverrides: Record<number, PipeConnection>): PipeConnection => {
  let connection = 0;
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  const on = y > 0 ? (pipeOverrides[getCoordIndex2(x, y - 1)] || 0) : 0;
  const os = y < GRIDCOUNT_Y - 1 ? (pipeOverrides[getCoordIndex2(x, y + 1)] || 0) : 0;
  const ow = x > 0 ? (pipeOverrides[getCoordIndex2(x - 1, y)] || 0) : 0;
  const oe = x < GRIDCOUNT_X - 1 ? (pipeOverrides[getCoordIndex2(x + 1, y)] || 0) : 0;
  const n = y > 0 ? pipesMap[getCoordIndex2(x, y - 1)] : PipeConnection.Unset;
  const s = y < GRIDCOUNT_Y - 1 ? pipesMap[getCoordIndex2(x, y + 1)] : PipeConnection.Unset;
  const w = x > 0 ? pipesMap[getCoordIndex2(x - 1, y)] : PipeConnection.Unset;
  const e = x < GRIDCOUNT_X - 1 ? pipesMap[getCoordIndex2(x + 1, y)] : PipeConnection.Unset;
  if (n > 0 && on < PipeConnection.Barrier && normalizePipeConnection(n) & FLAG_SOUTH) connection += FLAG_NORTH;
  if (s > 0 && os < PipeConnection.Barrier && normalizePipeConnection(s) & FLAG_NORTH) connection += FLAG_SOUTH;
  if (w > 0 && ow < PipeConnection.Barrier && normalizePipeConnection(w) & FLAG_EAST) connection += FLAG_WEST;
  if (e > 0 && oe < PipeConnection.Barrier && normalizePipeConnection(e) & FLAG_WEST) connection += FLAG_EAST;
  return connection;
}

export const buildPipesMap = (pipes: Vector[], pipesMap: Record<number, PipeConnection>, pipeOverrides: Record<number, PipeConnection>) => {
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    pipesMap[coord] = undefined;
  }
  // first, add all pipes to map
  pipes.forEach(pipe => {
    pipesMap[getCoordIndex(pipe)] = PipeConnection.Island;
  })
  // assign island type by neighbor
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      const coord = getCoordIndex2(x, y);
      if (!pipesMap[coord]) continue;
      const connection = getPipeIdx(coord, pipesMap);
      let override = pipeOverrides[coord];
      if (override === PipeConnection.Barrier || override === PipeConnection.Door) {
        if (false
          || connection === PipeConnection.N
          || connection === PipeConnection.S
          || connection === PipeConnection.W
          || connection === PipeConnection.E
          || connection === PipeConnection.NS
          || connection === PipeConnection.WE
        ) {
          override = PipeConnection.NSWE;
        } else {
          override = 0;
        }
      }
      const idx = override || connection;
      if (!idx) continue;
      pipesMap[coord] = idx;
    }
  }
}

export const buildCappedPipes = (pipeCapsMap: Record<number, PipeConnection>, pipesMap: Record<number, PipeConnection>, pipeOverrides: Record<number, PipeConnection>) => {
  const seen: Record<number, boolean> = {};
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    pipeCapsMap[coord] = undefined;
  }
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      const coord = getCoordIndex2(x, y);
      if (!pipesMap[coord]) continue;
      if (seen[coord]) continue;
      if (pipeOverrides[coord] !== PipeConnection.Door) continue;
      // set flag on pipe cell
      pipeCapsMap[coord] = PipeConnection.Barrier;
      // flood fill out
      const candidates: number[] = [coord];
      while (candidates.length) {
        const current = candidates.pop();
        if (seen[current]) continue;
        if (outOfBoundsCoord(current)) continue;
        seen[current] = true;
        const x = getCoordX(current);
        const y = getCoordY(current);
        const n = getCoordIndex2(x, y - 1);
        const s = getCoordIndex2(x, y + 1);
        const w = getCoordIndex2(x - 1, y);
        const e = getCoordIndex2(x + 1, y);
        if (!pipesMap[current]) {
          // set pipe cap
          const connection = getPipeCapIdx(current, pipesMap, pipeOverrides);
          if (connection) pipeCapsMap[current] = connection;
          continue;
        }
        pipeCapsMap[current] = PipeConnection.Barrier;
        if (!seen[n]) candidates.push(n);
        if (!seen[s]) candidates.push(s);
        if (!seen[w]) candidates.push(w);
        if (!seen[e]) candidates.push(e);
      };
    }
  }
}

function validPipeMove(ctx: Context, fromCoord: number, toCoord: number): boolean {
  if (fromCoord === toCoord) return false;
  if (outOfBoundsCoord(fromCoord) || outOfBoundsCoord(toCoord)) return false;
  const state = ctx.state;
  const es = ctx.es;
  const frx = getCoordX(fromCoord);
  const fry = getCoordY(fromCoord);
  const tox = getCoordX(toCoord);
  const toy = getCoordY(toCoord);
  const dx = tox - frx;
  const dy = toy - fry;
  if (getManhattanDistance(frx, fry, tox, toy) !== 1) {
    return false;
  }
  let from = normalizePipeConnection(es.pipeOverrides[fromCoord] || es.pipesMap[fromCoord]) || 0;
  let to = normalizePipeConnection(es.pipeOverrides[toCoord] || es.pipesMap[toCoord]) || 0;
  // capped pipe
  const fromCap = es.pipeCapsMap[fromCoord];
  const toCap = es.pipeCapsMap[toCoord];
  if (!state.isDoorsOpen && ((from && fromCap) || (to && toCap))) {
    return false;
  }
  // potential exit
  if (!to) {
    if (from === PipeConnection.Barrier || from === PipeConnection.Door) {
      from = normalizePipeConnection(es.pipesMap[fromCoord]);
    };
    const validFrom =  !!(
      (FLAG_NORTH & from && dy === -1) ||
      (FLAG_SOUTH & from && dy === 1) ||
      (FLAG_WEST & from && dx === -1) ||
      (FLAG_EAST & from && dx === 1)
    );
    return (validFrom && !checkCollision(ctx, coordToVec(toCoord), COLLISION_MASK_EXCLUDE_PIPES));
  }
  if (!from || !to) {
    return false;
  }
  if (to === PipeConnection.Barrier) {
    return false;
  }
  if (!state.isDoorsOpen && to === PipeConnection.Door) {
    return false;
  }
  if (from === PipeConnection.Barrier || from === PipeConnection.Door) from = es.pipesMap[fromCoord];
  if (to === PipeConnection.Barrier || to === PipeConnection.Door) to = es.pipesMap[toCoord];
  if (FLAG_NORTH & from && FLAG_SOUTH & to) return true;
  if (FLAG_SOUTH & from && FLAG_NORTH & to) return true;
  if (FLAG_WEST & from && FLAG_EAST & to) return true;
  if (FLAG_EAST & from && FLAG_WEST & to) return true;
  return false;
}

function normalizePipeConnection(conn: PipeConnection): PipeConnection {
  if (!conn) return 0;
  switch (conn) {
    case PipeConnection.N:
      return FLAG_NORTH | FLAG_SOUTH;
    case PipeConnection.S:
      return FLAG_NORTH | FLAG_SOUTH;
    case PipeConnection.W:
      return FLAG_EAST | FLAG_WEST;
    case PipeConnection.E:
      return FLAG_EAST | FLAG_WEST;
    case PipeConnection.Island:
      return FLAG_NORTH | FLAG_SOUTH;
    default:
      return conn;
  }
}

// Use a flood-fill-like algorithm to find the best pipe exit. Prefer straightest path.
export const findPipeExit = (ctx: Context, entryCoord: number, entryDir: DIR): ([number, DIR] | false) => {
  const es = ctx.es;
  if (!es.pipesMap) return false;
  if (!es.pipesMap[entryCoord]) return false;
  const entrance = normalizePipeConnection(es.pipeOverrides[entryCoord] || es.pipesMap[entryCoord]);
  if (entrance === PipeConnection.Barrier || entrance === PipeConnection.Door) {
    return false;
  }
  const entranceValid = !!(
    (entryDir === DIR.UP && entrance & FLAG_SOUTH) ||
    (entryDir === DIR.DOWN && entrance & FLAG_NORTH) ||
    (entryDir === DIR.RIGHT && entrance & FLAG_WEST) ||
    (entryDir === DIR.LEFT && entrance & FLAG_EAST)
  );
  if (!entranceValid) {
    return false;
  }

  const beforeEntryCoord = getCoordIndex(coordToVec(entryCoord).sub(dirToUnitVector(entryDir)));
  const visited: Record<number, boolean> = {
    [beforeEntryCoord]: true,
  };
  const candidates: [number, DIR][] = ([
    [entryCoord, entryDir],
  ]);
  while (candidates.length) {
    const [candidate, dir] = candidates.pop();
    if (candidate < 0) continue;
    if (visited[candidate]) continue;
    if (outOfBoundsCoord(candidate)) continue;
    visited[candidate] = true;
    // check for exit
    if (!es.pipesMap[candidate]) {
      return [candidate, dir];
    }
    let next = -1; // next traversal continuing in the same direction
    const x = getCoordX(candidate);
    const y = getCoordY(candidate);
    const n = getCoordIndex2(x, y - 1);
    const s = getCoordIndex2(x, y + 1);
    const w = getCoordIndex2(x - 1, y);
    const e = getCoordIndex2(x + 1, y);
    if (dir === DIR.N && !visited[n] && validPipeMove(ctx, candidate, n)) next = n;
    if (dir === DIR.E && !visited[e] && validPipeMove(ctx, candidate, e)) next = e;
    if (dir === DIR.S && !visited[s] && validPipeMove(ctx, candidate, s)) next = s;
    if (dir === DIR.W && !visited[w] && validPipeMove(ctx, candidate, w)) next = w;
    const maybeAddCandidate = (target: number, targetDir: DIR) => {
      if (target !== next && !visited[target] && validPipeMove(ctx, candidate, target)) {
        candidates.push([target, targetDir]);
      }
    }
    // add candidates in reverse order of priority
    const annotation = es.annotations[candidate];
    if (annotation === MapAnnotation.ForceDirE) {
      maybeAddCandidate(n, DIR.N);
      maybeAddCandidate(w, DIR.W);
      maybeAddCandidate(s, DIR.S);
      maybeAddCandidate(e, DIR.E);
    } else if (annotation === MapAnnotation.ForceDirW) {
      maybeAddCandidate(s, DIR.S);
      maybeAddCandidate(e, DIR.E);
      maybeAddCandidate(n, DIR.N);
      maybeAddCandidate(w, DIR.W);
    } else if (annotation === MapAnnotation.ForceDirN) {
      maybeAddCandidate(w, DIR.W);
      maybeAddCandidate(s, DIR.S);
      maybeAddCandidate(e, DIR.E);
      maybeAddCandidate(n, DIR.N);
    } else if (annotation === MapAnnotation.ForceDirS) {
      maybeAddCandidate(e, DIR.E);
      maybeAddCandidate(n, DIR.N);
      maybeAddCandidate(w, DIR.W);
      maybeAddCandidate(s, DIR.S);
    } else if (dir === DIR.N) {
      maybeAddCandidate(n, DIR.N);
      maybeAddCandidate(w, DIR.W);
      maybeAddCandidate(s, DIR.S);
      maybeAddCandidate(e, DIR.E);
    } else if (dir === DIR.S) {
      maybeAddCandidate(s, DIR.S);
      maybeAddCandidate(e, DIR.E);
      maybeAddCandidate(n, DIR.N);
      maybeAddCandidate(w, DIR.W);
    } else if (dir === DIR.W) {
      maybeAddCandidate(w, DIR.W);
      maybeAddCandidate(s, DIR.S);
      maybeAddCandidate(e, DIR.E);
      maybeAddCandidate(n, DIR.N);
    } else if (dir === DIR.E) {
      maybeAddCandidate(e, DIR.E);
      maybeAddCandidate(n, DIR.N);
      maybeAddCandidate(w, DIR.W);
      maybeAddCandidate(s, DIR.S);
    }
    if (next >= 0) {
      candidates.push([next, dir]);
    }
  }
  return false;
}

export function getAnnotationSlice(annotations: Record<number, MapAnnotation>, type: MapAnnotation): Record<number, boolean> {
  if (!annotations) throw new Error(`annotations param required. got: ${annotations}`);
  const out: Record<number, boolean> = {};
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    if (annotations[coord] && annotations[coord] === type) {
      out[coord] = true;
    }
  }
  return out;
}

export function makeCheckPreyCollision(es: EngineState, state: GameState, segments: ICollection, playerPosition: Vector) {
  return (location: Vector): DamageType => {
    const coord = getCoordIndex(location);
    if (segments.existsAtCoord(coord)
      || location.equals(playerPosition)
      || (es.barriersMap[coord] && !(es.passablesMap[coord] && state.isDoorsOpen))
      || (es.doorsMap[coord] && !state.isDoorsOpen)
      || es.locksMap[coord]
      || es.portalsMap[coord]
      || es.pipesMap[coord]
      || (es.threatsMap[coord] <= ThreatType.ExplodableBarrel)
      || (es.threatsMap[coord] > ThreatType.ExplodableBarrel && !state.isButtonPressed)
      || (es.lasersMap[coord] && !state.isButtonPressed)
      || (es.flamesMap[coord] && !state.isButtonPressed)
    ) {
      return DamageType.HitBarrier;
    }
    return DamageType.None;
  }
}

// Flood-fill Trapped Check
export function buildTrappedFloodGrid(checkCollision: (location: Vector) => DamageType, ctx: Context, checkPlayer: boolean): Record<number, number> {
  const grid: Record<number, number> = {};
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    grid[coord] = 0;
    if (checkPlayer && ctx.es.portalsMap[coord] && ctx.es.portalsMap[coord].link) {
      grid[coord] = 4000;
    } else if (checkPlayer && ctx.es.pickupsMap[coord]?.type === PickupType.Invincibility) {
      grid[coord] = 5000;
    } else if (ctx.segments.existsAtCoord(coord)) {
      grid[coord] = 1000 + ctx.segments.getIndexAtCoord(coord);
    } else if (getCoordIndex(ctx.player.position) === coord) {
      grid[coord] = 2000;
    } else if (checkCollision(coordToVec(coord))) {
      grid[coord] = 3000;
    }
  }
  return grid;
}
interface FloodFillTrappedResult {
  didFill: boolean,
  touchesPortal: boolean,
  touchesInvincibility: boolean,
  maxSegmentIndex: number,
  traversalCount: number,
}
export function floodFillTrapped(
  initialCoord: number,
  maxTraversals: number,
  grid: Record<number, number>,
  out_visited: Record<number, boolean>,
  checkDiagonal: boolean,
  excludeSelf: boolean
): FloodFillTrappedResult {
  let maxSegmentIndex = -1;
  let traversalCount = 0;
  let touchesPortal = false;
  let touchesInvincibility = false;
  const candidates = [initialCoord];
  outer:
  for (let i = 0; i < maxTraversals && candidates.length > 0; i++) {
    const current = candidates.pop();
    const cx = getCoordX(current);
    const cy = getCoordY(current);
    const inBounds = cx >= 0 && cy >= 0 && cx < GRIDCOUNT_X && cy < GRIDCOUNT_Y;
    if (!inBounds) {
      continue;
    }
    out_visited[current] = true;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (excludeSelf && dx === 0 && dy === 0) {
          continue;
        }
        if (!checkDiagonal && dx !== 0 && dy !== 0) {
          continue;
        }
        const x = cx + dx;
        const y = cy + dy;
        const inBounds = x >= 0 && y >= 0 && x < GRIDCOUNT_X && y < GRIDCOUNT_Y;
        if (!inBounds) {
          continue;
        }
        const coord = getCoordIndex2(x, y);
        const tile = grid[coord];
        if (tile && tile >= 1000 && tile < 2000 && tile - 1000 > maxSegmentIndex) {
          maxSegmentIndex = tile - 1000;
        }
        if (tile === 4000) {
          touchesPortal = true;
        }
        if (tile === 5000) {
          touchesInvincibility = true;
        }
        if (touchesPortal || touchesInvincibility) {
          break outer;
        }
        const valid = !out_visited[coord] && (!tile || tile === 4000 || tile === 5000);
        if (valid) {
          traversalCount++;
          candidates.push(coord);
          out_visited[coord] = true;
        }
      }
    }
  }
  const didFill = traversalCount >= maxTraversals;
  return {
    didFill,
    touchesPortal,
    touchesInvincibility,
    maxSegmentIndex,
    traversalCount,
  } satisfies FloodFillTrappedResult;
}
export function analyzeFloodFillTrappedResult(result: FloodFillTrappedResult, segmentsLength: number): boolean {
  if (result.didFill) {
    return false;
  }
  if (result.touchesPortal) {
    return false;
  }
  if (result.touchesInvincibility) {
    return false;
  }
  if (result.maxSegmentIndex >= 0 && result.maxSegmentIndex < segmentsLength && segmentsLength - result.maxSegmentIndex < result.traversalCount) {
    return false;
  }
  return true;
}

interface ToTimeParams {
  minutes: number,
  seconds: number,
  ms?: number,
}
/**
 * Convert to milliseconds
 */
export const toTime = ({ minutes = 0, seconds = 0, ms = 0}: ToTimeParams) => {
  return (minutes || 0) * 1000 * 60 + (seconds || 0) * 1000 + ms;
}

// see: https://gist.github.com/townofdon/1ef62e3eabddf347aa2f1f86aecc83ba
export const performAction = (action: IEnumerator, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const res = action.next();
      if (res.done) {
        return resolve();
      }
      // use setInterval instead of requestAnimationFrame to continue running even if the browser tab is inactive.
      const interval = setInterval(() => {
        if (signal?.aborted) {
          action.return();
          // see: https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort#:~:text=with%20name%20AbortError.
          return reject(new DOMException('aborted', 'AbortError'));
        }
        const res = action.next();
        if (res.done) {
          clearInterval(interval);
          return resolve();
        }
      }, FRAME_DUR_MS);
    } catch (err) {
      return reject(err);
    }
  });
};

export const outOfBounds = (x: number, y: number): boolean => {
  return x < 0 || y < 0 || x >= GRIDCOUNT_X || y >= GRIDCOUNT_Y;
}

export const outOfBoundsCoord = (coord: number): boolean => {
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  return x < 0 || y < 0 || x >= GRIDCOUNT_X || y >= GRIDCOUNT_Y;
}

export const neighborly = (coord: number, map: Record<number, any>): boolean => {
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  if (map[coord]) return true;
  if (!outOfBounds(x+1, y) && map[getCoordIndex2(x+1, y)]) return true;
  if (!outOfBounds(x-1, y) && map[getCoordIndex2(x-1, y)]) return true;
  if (!outOfBounds(x, y+1) && map[getCoordIndex2(x, y+1)]) return true;
  if (!outOfBounds(x, y-1) && map[getCoordIndex2(x, y-1)]) return true;
  return false;
}

export const sluggify = (val: string) => {
  return String(val || '').toLowerCase().trim().replace(/[^\w\s]/g, '').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
}

export function episodeDisplay(episode: Episode): string {
  switch (episode) {
    case Episode.E1:
      return 'E1: Knee-Deep In The SNEK';
    case Episode.E2:
      return 'E2: Live and Let SNEK';
    case Episode.E3:
      return 'E3: Quantum Snekanics';
      // return 'E3: The Lord of the SNEK';
      // return 'E3: Truth and Snekonciliation';
      // return 'E3: The Silent SNEKographer';
      // return 'E3: Moonsnekker';
    case Episode.None:
      return 'ERR: The Good, The Bad, and The Snekly';
  }
}

export function difficultyDisplay(difficulty: DifficultyIndex, gameMode: GameMode): string {
  let text = 'UNKNOWN';
  if (difficulty >= 1) text = 'EASY';
  if (difficulty >= 2) text = 'MEDIUM';
  if (difficulty >= 3) text = gameMode === GameMode.Cobra ? 'KING' : 'HARD';
  if (difficulty >= 4) text = 'ULTRA';
  // if (gameMode === GameMode.Casual) text += ' CASUAL';
  // if (gameMode === GameMode.Cobra) text += ' COBRA';
  return text;
}

export function episodeAbbrev(episode: Episode): string {
  switch (episode) {
    case Episode.E1:
      return 'e1';
    case Episode.E2:
      return 'e2';
    case Episode.E3:
      return 'e3';
    case Episode.None:
      return '';
  }
}

export function wearableDisplay(item: WearableFrame): string {
  switch (item) {
    case WearableFrame.CowboyHat:
      return "Straw Hat";
    case WearableFrame.ChefHat:
      return "Chef Hat";
    case WearableFrame.IndianaJonesHat:
      return "Cowboy Jones";
    case WearableFrame.Sunglasses:
      return "Deal with it";
    case WearableFrame.Monocle:
      return "Monocle";
    case WearableFrame.TechVisor:
      return "TechVisor";
    case WearableFrame.Glasses:
      return "Glasses";
    case WearableFrame.Mustache:
      return "Mustache";
    case WearableFrame.BanditMask:
      return "Bandit Mask";
    case WearableFrame.PirateOutfit:
      return "Pirate Outfit";
    case WearableFrame.CatEars:
      return "Cat Ears";
    case WearableFrame.Horns:
      return "Horns";
    case WearableFrame.NinjaBlue:
      return "Ninja Blue";
    case WearableFrame.NinjaPurple:
      return "Ninja Purple";
    case WearableFrame.BaseballCap:
      return "Baseball Cap";
    case WearableFrame.VikingHelmet:
      return "Viking Helmet";
    case WearableFrame.LuchadoreMaskRed:
      return "Luchadore Red";
    case WearableFrame.LuchadoreMaskBlue:
      return "Luchadore Blue";
    case WearableFrame.MexicanBlanket:
      return "Multicolored Cape";
    case WearableFrame.RoyalCape:
      return "Royal Cape";
    case WearableFrame.Crown:
      return "Crown";
    case WearableFrame.Cone:
      return "Cone";
    case WearableFrame.Crusher:
      return "Crusher";
    case WearableFrame.CrusherSeg1:
      return "CrusherSeg1";
    case WearableFrame.CrusherSeg2:
      return "CrusherSeg2";
    case WearableFrame.Aviators:
      return "Aviators";
    case WearableFrame._ThinGlasses:
      return "Thin Glasses";
    case WearableFrame.None:
      return "None";
    default:
      return "Unknown";
  }
}
