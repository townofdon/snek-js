import { GRIDCOUNT } from "../../constants";
import { DIR, EditorData, EditorDataSlice, KeyChannel, PortalChannel } from "../../types";
import { Tile } from "../editorTypes";
import { getCoordIndex2, isValidKeyChannel, isValidPortalChannel } from "../../utils";
import { deepCloneData } from "./editorUtils";
import { Vector } from "p5";


enum FloodFillTile {
  Ignore,
  Passable,
  Barrier,
  Door,
  Deco1,
  Deco2,
  Apple,
  Portal0,
  Portal1,
  Portal2,
  Portal3,
  Portal4,
  Portal5,
  Portal6,
  Portal7,
  Portal8,
  Portal9,
  KeyYellow,
  KeyRed,
  KeyBlue,
  LockYellow,
  LockRed,
  LockBlue,
  Nospawn,
}

interface GetTileArgs {
  tile: Tile;
  portalChannel?: PortalChannel;
  keyChannel?: KeyChannel;
}
function getTile({ tile, portalChannel, keyChannel }: GetTileArgs) {
  if (tile === Tile.Passable) return FloodFillTile.Passable;
  if (tile === Tile.Barrier) return FloodFillTile.Barrier;
  if (tile === Tile.Door) return FloodFillTile.Door;
  if (tile === Tile.Apple) return FloodFillTile.Apple;
  if (tile === Tile.Deco2) return FloodFillTile.Deco2;
  if (tile === Tile.Deco1) return FloodFillTile.Deco1;
  if (tile === Tile.Portal && isValidPortalChannel(portalChannel)) {
    switch (portalChannel) {
      case 0:
        return FloodFillTile.Portal0;
      case 1:
        return FloodFillTile.Portal1;
      case 2:
        return FloodFillTile.Portal2;
      case 3:
        return FloodFillTile.Portal3;
      case 4:
        return FloodFillTile.Portal4;
      case 5:
        return FloodFillTile.Portal5;
      case 6:
        return FloodFillTile.Portal6;
      case 7:
        return FloodFillTile.Portal7;
      case 8:
        return FloodFillTile.Portal8;
      case 9:
        return FloodFillTile.Portal9;
      default:
        return FloodFillTile.Portal0;
    }
  }
  if (tile === Tile.Lock && isValidKeyChannel(keyChannel)) {
    switch (keyChannel) {
      case KeyChannel.Yellow:
        return FloodFillTile.LockYellow;
      case KeyChannel.Red:
        return FloodFillTile.LockRed;
      case KeyChannel.Blue:
        return FloodFillTile.LockBlue;
      default:
        return FloodFillTile.LockYellow;
    }
  }
  if (tile === Tile.Key && isValidKeyChannel(keyChannel)) {
    switch (keyChannel) {
      case KeyChannel.Yellow:
        return FloodFillTile.KeyYellow;
      case KeyChannel.Red:
        return FloodFillTile.KeyRed;
      case KeyChannel.Blue:
        return FloodFillTile.KeyBlue;
      default:
        return FloodFillTile.KeyYellow;
    }
  }
  if (tile === Tile.Nospawn) return FloodFillTile.Nospawn;
  return FloodFillTile.Ignore;
}

function getTileAtLocation(coord: number, data: EditorData): FloodFillTile {
  if (data.passablesMap[coord]) return getTile({ tile: Tile.Passable });
  if (data.barriersMap[coord]) return getTile({ tile: Tile.Barrier });
  if (data.doorsMap[coord]) return getTile({ tile: Tile.Door });
  if (data.applesMap[coord]) return getTile({ tile: Tile.Apple });
  if (data.decoratives2Map[coord]) return getTile({ tile: Tile.Deco2 });
  if (data.decoratives1Map[coord]) return getTile({ tile: Tile.Deco1 });
  const portalChannel = data.portalsMap[coord];
  const keyChannel = data.keysMap[coord];
  const lockChannel = data.locksMap[coord];
  if (isValidPortalChannel(portalChannel)) {
    return getTile({ tile: Tile.Portal, portalChannel });
  }
  if (isValidKeyChannel(lockChannel)) {
    return getTile({ tile: Tile.Lock, keyChannel: lockChannel });
  };
  if (isValidKeyChannel(keyChannel)) {
    return getTile({ tile: Tile.Key, keyChannel });
  };
  if (data.nospawnsMap[coord]) return getTile({ tile: Tile.Nospawn });
  return FloodFillTile.Ignore;
}

function commitTile(tile: FloodFillTile, coord: number, data: EditorData): void {
  const slice: EditorDataSlice = {
    coord,
    apple: undefined,
    barrier: undefined,
    deco1: undefined,
    deco2: undefined,
    door: undefined,
    key: undefined,
    lock: undefined,
    nospawn: undefined,
    passable: undefined,
    portal: undefined,
    playerSpawnPosition: data.playerSpawnPosition,
    startDirection: data.startDirection,
  }
  switch (tile) {
    case FloodFillTile.Ignore:
      break;
    case FloodFillTile.Passable:
      slice.passable = true;
      slice.barrier = true;
      break;
    case FloodFillTile.Barrier:
      slice.barrier = true;
      break;
    case FloodFillTile.Door:
      slice.door = true;
      break;
    case FloodFillTile.Deco1:
      slice.deco1 = true;
      break;
    case FloodFillTile.Deco2:
      slice.deco2 = true;
      break;
    case FloodFillTile.Apple:
      slice.apple = true;
      break;
    case FloodFillTile.Portal0:
      slice.portal = 0;
      break;
    case FloodFillTile.Portal1:
      slice.portal = 1;
      break;
    case FloodFillTile.Portal2:
      slice.portal = 2;
      break;
    case FloodFillTile.Portal3:
      slice.portal = 3;
      break;
    case FloodFillTile.Portal4:
      slice.portal = 4;
      break;
    case FloodFillTile.Portal5:
      slice.portal = 5;
      break;
    case FloodFillTile.Portal6:
      slice.portal = 6;
      break;
    case FloodFillTile.Portal7:
      slice.portal = 7;
      break;
    case FloodFillTile.Portal8:
      slice.portal = 8;
      break;
    case FloodFillTile.Portal9:
      slice.portal = 9;
      break;
    case FloodFillTile.KeyYellow:
      slice.key = KeyChannel.Yellow;
      break;
    case FloodFillTile.KeyRed:
      slice.key = KeyChannel.Red;
      break;
    case FloodFillTile.KeyBlue:
      slice.key = KeyChannel.Blue;
      break;
    case FloodFillTile.LockYellow:
      slice.lock = KeyChannel.Yellow;
      break;
    case FloodFillTile.LockRed:
      slice.lock = KeyChannel.Red;
      break;
    case FloodFillTile.LockBlue:
      slice.lock = KeyChannel.Blue;
      break;
    case FloodFillTile.Nospawn:
      slice.nospawn = true;
      if (data.decoratives1Map[coord]) {
        slice.deco1 = true;
      }
      if (data.decoratives2Map[coord]) {
        slice.deco2 = true;
      }
      break;
    default:
      break;
  }
  data.applesMap[coord] = slice.apple;
  data.barriersMap[coord] = slice.barrier;
  data.decoratives1Map[coord] = slice.deco1;
  data.decoratives2Map[coord] = slice.deco2;
  data.doorsMap[coord] = slice.door;
  data.keysMap[coord] = slice.key;
  data.locksMap[coord] = slice.lock;
  data.nospawnsMap[coord] = slice.nospawn;
  data.passablesMap[coord] = slice.passable;
  data.portalsMap[coord] = slice.portal;
  data.nospawnsMap[coord] = slice.nospawn;
}

export function tileFloodFill(
  tileToSet: Tile,
  x: number,
  y: number,
  portalChannel: PortalChannel,
  keyChannel: KeyChannel,
  data: EditorData,
): EditorData {
  const prev = getTileAtLocation(getCoordIndex2(x, y), data);
  const next = getTile({ tile: tileToSet, portalChannel, keyChannel });
  const newData = deepCloneData(data);

  if (prev === next) {
    return newData;
  }

  const screen: FloodFillTile[][] = [];
  for (let y0 = 0; y0 < GRIDCOUNT.y; y0++) {
    for (let x0 = 0; x0 < GRIDCOUNT.x; x0++) {
      if (!screen[x0]) {
        screen[x0] = [];
      }
      const coord = getCoordIndex2(x0, y0);
      screen[x0][y0] = getTileAtLocation(coord, newData);
      // const tile = getTileAtLocation(coord, newData);
      // if (tile !== prev && tile !== next) {
      //   screen[x0][y0] = FloodFillTile.Ignore;
      // } else if (tile === next) {
      //   screen[x0][y0] = next;
      // } else {
      //   screen[x0][y0] = prev;
      // }
    }
  }

  floodFill(screen, GRIDCOUNT.y, GRIDCOUNT.x, x, y, prev, next);

  for (let y0 = 0; y0 < GRIDCOUNT.y; y0++) {
    for (let x0 = 0; x0 < GRIDCOUNT.x; x0++) {
      const coord = getCoordIndex2(x0, y0);
      const screenTile = screen[x0][y0];
      const compare = getTileAtLocation(coord, newData);
      if (screenTile === next && screenTile !== compare && compare === prev) {
        commitTile(next, coord, newData);
      }
    }
  }

  return newData;
}


/**
 * See: https://www.geeksforgeeks.org/flood-fill-algorithm/
 */
function floodFill<T>(screen: T[][], m: number, n: number, x: number, y: number, prev: T, next: T) {
  function isValid(x: number, y: number) {
    if (
      x < 0 ||
      x >= m ||
      y < 0 ||
      y >= n ||
      screen[x][y] != prev ||
      screen[x][y] == next
    )
      return false;
    return true;
  }

  const queue: [number, number][] = [];
  queue.push([x, y]);
  screen[x][y] = next;

  while (queue.length > 0) {
    const currPixel = queue[queue.length - 1];
    queue.pop();

    let posX = currPixel[0];
    let posY = currPixel[1];

    if (isValid(posX + 1, posY)) {
      screen[posX + 1][posY] = next;
      queue.push([posX + 1, posY]);
    }
    if (isValid(posX - 1, posY)) {
      screen[posX - 1][posY] = next;
      queue.push([posX - 1, posY]);
    }
    if (isValid(posX, posY + 1)) {
      screen[posX][posY + 1] = next;
      queue.push([posX, posY + 1]);
    }
    if (isValid(posX, posY - 1)) {
      screen[posX][posY - 1] = next;
      queue.push([posX, posY - 1]);
    }
  }
}
