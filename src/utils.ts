import { Vector } from "p5";

import {
  DIFFICULTY_EASY,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
  DIFFICULTY_ULTRA,
  ELECTROCUTION_DURATION_MS,
  FRAME_DUR_MS,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_STUN_TIME,
  INVINCIBILITY_EXPIRE_FLASH_MS,
  IS_DEV,
  PICKUP_EXPIRE_WARN_MS,
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
  ItemDropType,
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
  AnimationData,
  SpritesheetRange,
  SPRITESHEET_RANGE_MAX,
  EngineState,
  ICollection,
  IFlaggable,
  ThreatFlag,
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

export function shuffleArray<T>(array: T[]) {
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
  return clamp(stats.applesEatenThisLevel / (level.applesToClear * (level.applesModOverride || difficulty.applesMod)), 0, 1);
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
  return Math.hypot((x1 - x0), (y1 - y0));
  // return Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
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
  checkHasHit: (location: Vector, updateLastHurtBy?: boolean) => boolean,
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
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.LEFT)), false)) {
    scoreLeft += 1000;
  }
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.RIGHT)), false)) {
    scoreRight += 1000;
  }
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.UP)), false)) {
    scoreUp += 1000;
  }
  if (checkHasHit(portalLink.copy().add(dirToUnitVector(DIR.DOWN)), false)) {
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

export const getCurrentFrame = (frames: number, timePerFrame: number, durations: number[] | undefined, elapsed: number): number => {
  if (!frames || !timePerFrame) return 0;
  let frame = Math.floor(elapsed / timePerFrame) % frames;
  // `durations` overrides `frame`, `timePerFrame`
  if (durations?.length) {
    const totalDuration = durations.reduce((a, b) => a + b, 0);
    const t = elapsed % totalDuration;
    // get current frame
    frame = 0;
    let sum = 0;
    for (let i = 0; i < durations.length; i++) {
      sum += durations[i];
      if (t < sum) {
        frame = i;
        break;
      }
    }
  }
  return frame;
}

export const recalculateLasersMap = (es: EngineState | ExtendedSketchData, threats: ICollection & IFlaggable) => {
  const valid = (coord: number) => true
    && es.threatsMap[coord] !== ThreatType.Mine
    && es.threatsMap[coord] !== ThreatType.ExplodableBarrel
    && !es.barriersMap[coord]
    && !es.doorsMap[coord]
    && isNil(es.locksMap[coord])
    && isNil(es.portalsMap[coord]);
  // first clear map
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      // skip laser cells that are about to be removed in electrocutionRoutine
      if (es.lasersMap[getCoordIndex2(x, y)] && !es.lasersMap[getCoordIndex2(x, y)].damageActive) {
        continue;
      }
      es.lasersMap[getCoordIndex2(x, y)] = undefined;
    }
  }
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
        const damageActive = es.lasersMap[coord]?.damageActive ?? true;
        const orientation = es.lasersMap[coord]?.orientation === Orientation.Vertical
          ? Orientation.Mixed
          : Orientation.Horizontal;
        // skip cells if both diodes are crit
        const crit = byCoord(coordDiodeA)(threats.hasFlag, ThreatFlag.Crit) && byCoord(coordDiodeB)(threats.hasFlag, ThreatFlag.Crit);
        if (crit) {
          break;
        }
        es.lasersMap[coord] = {
          orientation: orientation,
          type: LaserType.Blue,
          coordDiodeA,
          coordDiodeB,
          damageActive,
        } satisfies LaserCell;
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
        const damageActive = es.lasersMap[coord]?.damageActive ?? true;
        const orientation = es.lasersMap[coord]?.orientation === Orientation.Horizontal
          ? Orientation.Mixed
          : Orientation.Vertical;
        const crit = byCoord(coordDiodeA)(threats.hasFlag, ThreatFlag.Crit) && byCoord(coordDiodeB)(threats.hasFlag, ThreatFlag.Crit);
        if (crit) {
          break;
        }
        es.lasersMap[coord] = {
          orientation: orientation,
          type: LaserType.Blue,
          coordDiodeA,
          coordDiodeB,
          damageActive,
        } satisfies LaserCell;
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
