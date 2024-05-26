import { Vector } from 'p5';
import { Buffer } from 'buffer'

import JSONCrush from './JSONCrush/JSONCrush';

import { DIR, EditorData, EditorOptions, KeyChannel, Level, Palette, PortalChannel, PortalExitMode } from '../../types'
import { coordToVec, getCoordIndex, getCoordIndex2, toDIR } from '../../utils';
import { GRIDCOUNT } from '../../constants';
import { bton, ntob } from './Base64';
import { buildLevel } from '../../levels/levelBuilder';
import { LEVEL_01 } from '../../levels';
import { EDITOR_DEFAULTS } from '../editorConstants';

const MASK_BASE_64 = true;

export function encode(layout: string): string {
  return Buffer.from(JSONCrush.crush(layout)).toString('base64url');
}

export function decode(encoded: string): string {
  return JSONCrush.uncrush(Buffer.from(encoded, 'base64url').toString())
}

export function encodeMapData(data: EditorData, options: EditorOptions): string {
  const layout = buildMapLayout(data);
  const playerSpawnPositionStr = String(getCoordIndex(data.playerSpawnPosition));
  const paletteStr = [
    options.palette.apple,
    options.palette.appleStroke,
    options.palette.background,
    options.palette.barrier,
    options.palette.barrierStroke,
    options.palette.deco1,
    options.palette.deco1Stroke,
    options.palette.deco2,
    options.palette.deco2Stroke,
    options.palette.door,
    options.palette.doorStroke,
    options.palette.playerHead,
    options.palette.playerTail,
    options.palette.playerTailStroke,
  ].join('-')
  const portalExitConfigStr = [
    options.portalExitConfig[0],
    options.portalExitConfig[1],
    options.portalExitConfig[2],
    options.portalExitConfig[3],
    options.portalExitConfig[4],
    options.portalExitConfig[5],
    options.portalExitConfig[6],
    options.portalExitConfig[7],
    options.portalExitConfig[8],
    options.portalExitConfig[9],
  ].join('-');
  const parts = [
    layout,
    playerSpawnPositionStr,
    data.startDirection,
    options.name,
    options.timeToClear,
    options.applesToClear,
    options.numApplesStart,
    options.disableAppleSpawn ? 1 : 0,
    options.snakeStartSize,
    options.growthMod,
    options.extraHurtGraceTime,
    options.globalLight,
    paletteStr,
    portalExitConfigStr,
  ].join('|');
  return encode(parts);
}

export function decodeMapData(encoded: string): [EditorData, EditorOptions] {
  const decoded = decode(encoded);
  const parts = decoded.split('|');
  const [
    layout,
    playerSpawnPositionStr,
    startDirectionStr,
    name,
    timeToClear,
    applesToClear,
    numApplesStart,
    disableAppleSpawn,
    snakeStartSize,
    growthMod,
    extraHurtGraceTime,
    globalLight,
    paletteStr,
    portalExitConfigStr,
  ] = parts;

  const playerSpawnPosition = coordToVec(NumberOrDefault(playerSpawnPositionStr, 15 + 15 * 30));
  const startDirection = toDIR(startDirectionStr);

  const defaultPalette = { ...EDITOR_DEFAULTS.options.palette };
  const palette: Palette = defaultPalette;
  [
    palette.apple = defaultPalette.apple,
    palette.appleStroke = defaultPalette.appleStroke,
    palette.background = defaultPalette.background,
    palette.barrier = defaultPalette.barrier,
    palette.barrierStroke = defaultPalette.barrierStroke,
    palette.deco1 = defaultPalette.deco1,
    palette.deco1Stroke = defaultPalette.deco1Stroke,
    palette.deco2 = defaultPalette.deco2,
    palette.deco2Stroke = defaultPalette.deco2Stroke,
    palette.door = defaultPalette.door,
    palette.doorStroke = defaultPalette.doorStroke,
    palette.playerHead = defaultPalette.playerHead,
    palette.playerTail = defaultPalette.playerTail,
    palette.playerTailStroke = defaultPalette.playerTailStroke,
  ] = paletteStr.split('-').concat(Array.from({ length: 14 }, () => undefined));

  const portalExitConfig = { ...EDITOR_DEFAULTS.options.portalExitConfig };
  const portalExitConfigParsed = portalExitConfigStr.split('-').map(mode => NumberOrDefault(mode, 0) as PortalExitMode)
  for (let i = 0; i < 10; i++) {
    portalExitConfig[i as PortalChannel] = portalExitConfigParsed[i] ?? PortalExitMode.InvertDirection
  }

  const options: EditorOptions = {
    name,
    timeToClear: NumberOrDefault(timeToClear, 60),
    applesToClear: NumberOrDefault(applesToClear, 20),
    numApplesStart: NumberOrDefault(numApplesStart, 3),
    disableAppleSpawn: Boolean(NumberOrDefault(disableAppleSpawn, 0)),
    snakeStartSize: NumberOrDefault(snakeStartSize, 3),
    growthMod: NumberOrDefault(growthMod, 1),
    extraHurtGraceTime: NumberOrDefault(extraHurtGraceTime, 0),
    globalLight: NumberOrDefault(globalLight, 1),
    palette,
    portalExitConfig,
  }
  const data = getEditorDataFromLayout(layout || LEVEL_01.layout, playerSpawnPosition, startDirection)
  return [data, options];
}

export function getEditorDataFromLayout(layout: string, playerSpawnPosition: Vector, startDirection: DIR): EditorData {
  const level: Level = {
    name: undefined,
    layout,
    timeToClear: undefined,
    applesToClear: undefined,
    colors: undefined,
  }
  const levelData = buildLevel(level)
  const data: EditorData = {
    barriersMap: { ...levelData.barriersMap },
    passablesMap: { ...levelData.passablesMap },
    doorsMap: { ...levelData.doorsMap },
    decoratives1Map: { ...levelData.decoratives1Map },
    decoratives2Map: { ...levelData.decoratives2Map },
    nospawnsMap: { ...levelData.nospawnsMap },
    applesMap: {},
    keysMap: {},
    locksMap: {},
    portalsMap: {},
    playerSpawnPosition,
    startDirection,
  }
  for (let y = 0; y < GRIDCOUNT.y; y++) {
    for (let x = 0; x < GRIDCOUNT.x; x++) {
      const coord = getCoordIndex2(x, y);
      if (levelData.portalsMap[coord]) {
        data.portalsMap[coord] = levelData.portalsMap[coord].channel;
      }
      if (levelData.keysMap[coord]) {
        data.keysMap[coord] = levelData.keysMap[coord].channel;
      }
      if (levelData.locksMap[coord]) {
        data.locksMap[coord] = levelData.locksMap[coord].channel;
      }
    }
  }
  levelData.apples.forEach(apple => {
    const coord = getCoordIndex2(apple.x, apple.y);
    data.applesMap[coord] = true;
  });
  return data;
}

export function vectorsToBitmask(vectors: Vector[]): string {
  const bitmasks = new Uint32Array(30);
  for (let i = 0; i < vectors.length; i++) {
    const { x, y } = vectors[i];
    bitmasks[y] |= 1 << x;
  }
  const parts: string[] = []
  for (let i = 0; i < bitmasks.length; i++) {
    if (MASK_BASE_64) {
      parts.push(ntob(bitmasks[i]))
    } else {
      parts.push(bitmasks[i].toString())
    }
  }
  return parts.join('-');
}

export function bitmaskToVectors(encoded: string): Vector[] {
  const parts = encoded.split('-');
  const bitmasks = new Uint32Array(30);
  for (let i = 0; i < bitmasks.length; i++) {
    if (MASK_BASE_64) {
      bitmasks[i] = parts[i]?.length ? bton(parts[i]) : 0
    } else {
      bitmasks[i] = Number(parts[i]) || 0
    }
  }
  const vectors: Vector[] = []
  for (let y = 0; y < GRIDCOUNT.y; y++) {
    for (let x = 0; x < GRIDCOUNT.x; x++) {
      if (bitmasks[y] && (bitmasks[y] & (1 << x))) {
        vectors.push(new Vector(x, y));
      }
    }
  }
  return vectors;
}

const NumberOrDefault = (val: string, defaultVal: number) => {
  if (val === '' || val === undefined) return defaultVal;
  const num = Number(val);
  if (Number.isNaN(num)) return defaultVal;
  return num;
}

export function buildMapLayout(data: EditorData): string {
  const chars: string[] = []
  const getCharFromCoord = (coord: number) => {
    if (data.keysMap[coord] != undefined) {
      const keyChannel = data.keysMap[coord];
      if (data.barriersMap[coord]) {
        return {
          [KeyChannel.Yellow]: 'u',
          [KeyChannel.Red]: 'i',
          [KeyChannel.Blue]: 'o',
        }[keyChannel] ?? '?';
      }
      return {
        [KeyChannel.Yellow]: 'j',
        [KeyChannel.Red]: 'k',
        [KeyChannel.Blue]: 'l',
      }[keyChannel] ?? '?';
    }
    if (data.locksMap[coord] != undefined) {
      const keyChannel = data.locksMap[coord];
      return {
        [KeyChannel.Yellow]: 'J',
        [KeyChannel.Red]: 'K',
        [KeyChannel.Blue]: 'L',
      }[keyChannel] ?? '?';
    }
    if (data.portalsMap[coord] != undefined) {
      const portalChannel = data.portalsMap[coord];
      return portalChannel.toString();
    }
    if (data.barriersMap[coord]) {
      if (data.passablesMap[coord]) {
        return 'x';
      }
      return 'X';
    }
    if (data.doorsMap[coord]) {
      if (data.decoratives1Map[coord]) {
        return 'd';
      }
      return 'D';
    }
    if (data.applesMap[coord]) {
      return 'A';
    }
    if (data.decoratives1Map[coord]) {
      if (data.nospawnsMap[coord]) {
        return '_';
      }
      return '-';
    }
    if (data.decoratives2Map[coord]) {
      if (data.nospawnsMap[coord]) {
        return '+';
      }
      return '=';
    }
    if (data.nospawnsMap[coord]) {
      return '~';
    }
    return ' ';
  }
  for (let y = 0; y < GRIDCOUNT.y; y++) {
    for (let x = 0; x < GRIDCOUNT.x; x++) {
      const coord = getCoordIndex2(x, y);
      chars.push(getCharFromCoord(coord));
    }
  }
  const layout = chars.map((char, index) => index && index % 30 === 0 ? `\n${char}` : char).join('');
  return '\n' + layout + '\n';
}

export function printLayout(layout: string) {
  console.log(layout.replace(/ /g, '.'));
}
