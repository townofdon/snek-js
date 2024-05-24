import { Vector } from 'p5';
import { Buffer } from 'buffer'

import JSONCrush from './JSONCrush/JSONCrush';

import { EditorData, LevelDataItems, Key, KeyChannel, Lock } from '../types'
import { coordToVec, getCoordIndex, getCoordIndex2 } from '../utils';
import { GRIDCOUNT } from '../constants';
import { bton, ntob } from './Base64';

const MASK_BASE_64 = true;
const OUTPUT_BASE_64 = true;

export function encodeMapLayout(layout: string): string {
  return Buffer.from(JSONCrush.crush(layout)).toString('base64url');
}

export function decodeMapLayout(encoded: string): string {
  return JSONCrush.uncrush(Buffer.from(encoded, 'base64url').toString())
}

export function encodeMapData(levelData: LevelDataItems, isOutputBase64 = OUTPUT_BASE_64): string {
  const getByColor = (items: Key[], channel: KeyChannel) => {
    return items.filter(item => item.channel === channel).map(item => item.position);
  }
  const barriers = vectorsToBitmask(levelData.barriers);
  const doors = vectorsToBitmask(levelData.doors);
  const deco1 = vectorsToBitmask(levelData.decoratives1);
  const deco2 = vectorsToBitmask(levelData.decoratives2);
  const nospawns = vectorsToBitmask(levelData.nospawns);
  const apples = vectorsToBitmask(levelData.apples);
  const portals0 = vectorsToBitmask(levelData.portals[0]);
  const portals1 = vectorsToBitmask(levelData.portals[1]);
  const portals2 = vectorsToBitmask(levelData.portals[2]);
  const portals3 = vectorsToBitmask(levelData.portals[3]);
  const portals4 = vectorsToBitmask(levelData.portals[4]);
  const portals5 = vectorsToBitmask(levelData.portals[5]);
  const portals6 = vectorsToBitmask(levelData.portals[6]);
  const portals7 = vectorsToBitmask(levelData.portals[7]);
  const portals8 = vectorsToBitmask(levelData.portals[8]);
  const portals9 = vectorsToBitmask(levelData.portals[9]);
  const keysYellow = vectorsToBitmask(getByColor(levelData.keys, KeyChannel.Yellow));
  const keysRed = vectorsToBitmask(getByColor(levelData.keys, KeyChannel.Red));
  const keysBlue = vectorsToBitmask(getByColor(levelData.keys, KeyChannel.Blue));
  const locksYellow = vectorsToBitmask(getByColor(levelData.locks, KeyChannel.Yellow));
  const locksRed = vectorsToBitmask(getByColor(levelData.locks, KeyChannel.Red));
  const locksBlue = vectorsToBitmask(getByColor(levelData.locks, KeyChannel.Blue));
  const playerSpawnPosition = String(getCoordIndex(levelData.playerSpawnPosition));

  const combined = [
    barriers,
    doors,
    deco1,
    deco2,
    nospawns,
    apples,
    portals0,
    portals1,
    portals2,
    portals3,
    portals4,
    portals5,
    portals6,
    portals7,
    portals8,
    portals9,
    keysYellow,
    keysRed,
    keysBlue,
    locksYellow,
    locksRed,
    locksBlue,
    playerSpawnPosition,
  ].join('|');

  const crushed = JSONCrush.crush(combined);

  if (isOutputBase64) {
    return Buffer.from(crushed).toString('base64url')
  } else {
    return encodeURIComponent(JSONCrush.crush(combined))
  }
}

export function decodeMapData(encoded: string, isOutputBase64 = OUTPUT_BASE_64): LevelDataItems {
  const decoded = (() => {
    if (isOutputBase64) {
      return Buffer.from(encoded, 'base64url').toString()
    } else {
      return decodeURIComponent(encoded);
    }
  })()
  const uncrushed = JSONCrush.uncrush(decoded);
  const parts = uncrushed.split('|');
  const [
    mask_barriers,
    mask_doors,
    mask_deco1,
    mask_deco2,
    mask_nospawns,
    mask_apples,
    mask_portals0,
    mask_portals1,
    mask_portals2,
    mask_portals3,
    mask_portals4,
    mask_portals5,
    mask_portals6,
    mask_portals7,
    mask_portals8,
    mask_portals9,
    mask_keysYellow,
    mask_keysRed,
    mask_keysBlue,
    mask_locksYellow,
    mask_locksRed,
    mask_locksBlue,
    coord_playerSpawnPosition,
  ] = parts;

  const barriers = bitmaskToVectors(mask_barriers);
  const doors = bitmaskToVectors(mask_doors);
  const decoratives1 = bitmaskToVectors(mask_deco1);
  const decoratives2 = bitmaskToVectors(mask_deco2);
  const nospawns = bitmaskToVectors(mask_nospawns);
  const apples = bitmaskToVectors(mask_apples);
  const playerSpawnPosition = coordToVec(Number(coord_playerSpawnPosition));

  const keysYellow: Key[] = bitmaskToVectors(mask_keysYellow).map(key => ({ position: key, channel: KeyChannel.Yellow }))
  const keysRed: Key[] = bitmaskToVectors(mask_keysRed).map(key => ({ position: key, channel: KeyChannel.Red }))
  const keysBlue: Key[] = bitmaskToVectors(mask_keysBlue).map(key => ({ position: key, channel: KeyChannel.Blue }))
  const keys: Key[] = keysYellow.concat(keysRed).concat(keysBlue);
  const locksYellow: Key[] = bitmaskToVectors(mask_locksYellow).map(lock => ({ position: lock, channel: KeyChannel.Yellow }))
  const locksRed: Key[] = bitmaskToVectors(mask_locksRed).map(lock => ({ position: lock, channel: KeyChannel.Red }))
  const locksBlue: Key[] = bitmaskToVectors(mask_locksBlue).map(lock => ({ position: lock, channel: KeyChannel.Blue }))
  const toLock = (key: Key): Lock => ({ ...key, coord: getCoordIndex(key.position) })
  const locks: Lock[] = locksYellow.map(toLock).concat(locksRed.map(toLock)).concat(locksBlue.map(toLock));

  const mapData: LevelDataItems = {
    barriers,
    doors,
    apples,
    decoratives1,
    decoratives2,
    nospawns,
    portals: {
      0: bitmaskToVectors(mask_portals0),
      1: bitmaskToVectors(mask_portals1),
      2: bitmaskToVectors(mask_portals2),
      3: bitmaskToVectors(mask_portals3),
      4: bitmaskToVectors(mask_portals4),
      5: bitmaskToVectors(mask_portals5),
      6: bitmaskToVectors(mask_portals6),
      7: bitmaskToVectors(mask_portals7),
      8: bitmaskToVectors(mask_portals8),
      9: bitmaskToVectors(mask_portals9),
    },
    playerSpawnPosition,
    keys,
    locks,
  }
  return mapData
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
  return chars.map((char, index) => index && index % 30 === 0 ? `\n${char}` : char).join('');
}
