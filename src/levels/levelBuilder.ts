import P5, { Vector } from "p5";
import { DEFAULT_PORTALS, GRIDCOUNT } from "../constants";
import { KeyChannel, Level, LevelData, LevelType, Portal, PortalChannel, PortalExitMode } from "../types";
import { coordToVec, getCoordIndex } from "../utils";
import { LEVEL_01 } from "./level01";
import { buildMapLayout, decodeMapData } from "../editor/utils/editorUtils";

export function buildLevel(level: Level): LevelData {
  const data: LevelData = {
    barriers: [],
    barriersMap: {},
    passablesMap: {},
    doors: [],
    doorsMap: {},
    apples: [],
    decoratives1: [],
    decoratives1Map: {},
    decoratives2: [],
    decoratives2Map: {},
    nospawns: [],
    nospawnsMap: {},
    playerSpawnPosition: new Vector(15, 15),
    portals: { ...DEFAULT_PORTALS() },
    portalsMap: {},
    keys: [],
    keysMap: {},
    locks: [],
    locksMap: {},
    diffSelectMap: {},
  }

  const passables: Vector[] = []

  // keep track of which group a portal cell belongs to
  const portalGroupIndex: Record<PortalChannel, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0
  };

  const layoutRows = level.layout.split('\n').filter(row => {
    if (!row?.length) return false;
    // a row with all whitespace but less than 30?
    if (!row.replace(/\s/g, '') && row.length < 30) return false;
    return true;
  });

  for (let y = 0; y < layoutRows.length; y++) {
    const rowStr = layoutRows[y];

    for (let x = 0; x < rowStr.length; x++) {
      if (x >= GRIDCOUNT.x) { console.warn("level layout is too wide"); break; }

      const char = rowStr.charAt(x);
      if (char === ' ') {
        continue;
      }

      const vec = new Vector(x, y);
      const coord = getCoordIndex(vec);

      switch (char) {
        case 'X':
        case 'x':
          if (char === 'x') {
            passables.push(vec);
          }
          data.barriers.push(vec);
          break;
        case 'D':
        case 'd':
          data.doors.push(vec);
          // extra decoration for doors, if lowercase
          if (char === 'd') {
            if (level === LEVEL_01) {
              data.decoratives2.push(vec);
            } else {
              data.decoratives1.push(vec);
            }
          }
          break;
        case 'O':
          data.playerSpawnPosition = vec;
          break;

        // no-spawns
        case '~':
          data.nospawns.push(vec);
          break;
        case '_':
          data.decoratives1.push(vec);
          data.nospawns.push(vec);
          break;
        case '+':
          data.decoratives2.push(vec);
          data.nospawns.push(vec);
          break;

        // decorative
        case '-':
          data.decoratives1.push(vec);
          break;
        case '=':
          data.decoratives2.push(vec);
          break;

        // manually-spawned apples
        case 'A':
        case 'a':
          data.nospawns.push(vec);
          data.apples.push(vec);
          break;

        // keys / locks
        case 'u':
          data.keys.push({ position: vec, channel: KeyChannel.Yellow });
          passables.push(vec);
          data.barriers.push(vec);
          break;
        case 'i':
          data.keys.push({ position: vec, channel: KeyChannel.Red });
          passables.push(vec);
          data.barriers.push(vec);
          break;
        case 'o':
          data.keys.push({ position: vec, channel: KeyChannel.Blue });
          passables.push(vec);
          data.barriers.push(vec);
          break;
        case 'j':
          data.keys.push({ position: vec, channel: KeyChannel.Yellow });
          data.nospawns.push(vec);
          break;
        case 'k':
          data.keys.push({ position: vec, channel: KeyChannel.Red });
          data.nospawns.push(vec);
          break;
        case 'l':
          data.keys.push({ position: vec, channel: KeyChannel.Blue });
          data.nospawns.push(vec);
          break;
        case 'J':
          data.locks.push({ position: vec, channel: KeyChannel.Yellow, coord });
          data.nospawns.push(vec);
          data.decoratives2.push(vec);
          break;
        case 'K':
          data.locks.push({ position: vec, channel: KeyChannel.Red, coord });
          data.nospawns.push(vec);
          data.decoratives2.push(vec);
          break;
        case 'L':
          data.locks.push({ position: vec, channel: KeyChannel.Blue, coord });
          data.nospawns.push(vec);
          data.decoratives2.push(vec);
          break;

        // portals
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          if (level.type === LevelType.Maze) {
            const difficultyIndex = parseInt(char, 0);
            if (difficultyIndex < 1 || difficultyIndex > 4) continue;
            data.diffSelectMap[getCoordIndex(vec)] = difficultyIndex;
          } else {
            addPortal(data, vec, char, portalGroupIndex);
          }
          break;
      }
    }
    if (y >= GRIDCOUNT.y) { console.warn("level layout is too tall"); break; }
  }

  passables.forEach(vec => { data.passablesMap[getCoordIndex(vec)] = true; })
  data.nospawns.forEach(vec => { data.nospawnsMap[getCoordIndex(vec)] = true; });
  data.barriers.forEach(vec => { data.barriersMap[getCoordIndex(vec)] = true; });
  data.doors.forEach(vec => { data.doorsMap[getCoordIndex(vec)] = true; });
  data.decoratives1.forEach(vec => { data.decoratives1Map[getCoordIndex(vec)] = true; });
  data.decoratives2.forEach(vec => { data.decoratives2Map[getCoordIndex(vec)] = true; });
  data.nospawns.forEach(vec => { data.nospawnsMap[getCoordIndex(vec)] = true; });
  data.keys.forEach(key => { data.keysMap[getCoordIndex(key.position)] = key; });
  data.locks.forEach(lock => { data.locksMap[getCoordIndex(lock.position)] = lock; });

  linkPortals(data);

  if (level.snakeSpawnPointOverride) {
    data.playerSpawnPosition = coordToVec(level.snakeSpawnPointOverride);
  }

  return data;
}

function getPortalHash(vec: P5.Vector, channel: PortalChannel, group: number) {
  // there are at most 10 channels
  const channelComponent = channel as number;
  // mul by 10 to avoid intersection with channel
  const groupComponent = group * 10;
  // mul by 1000 as impossible for there to exist more than 100 groups (100 * 10)
  const indexComponent = getCoordIndex(vec) * 1000;
  return channelComponent + groupComponent + indexComponent;
}

function addPortal(data: LevelData, vec: Vector, char: string, portalGroupIndex: Record<PortalChannel, number>) {
  data.nospawns.push(vec);
  const channel = parseInt(char, 10) as PortalChannel;
  let group = portalGroupIndex[channel];
  // increment portal index if prev portal cell of same PortalIndex is farther away than 1 unit
  if (data.portals[channel].length) {
    // because of the way we calculate bounds via getCoordIndex(), portals on opposite sides of map could be considered next to each other.
    // an easy fix is to just perform an additional check to make sure that the diff is never more than 1.
    const checkDiffMoreThanOne = (portal: Portal) => {
      const diff = P5.Vector.sub(portal.position, vec);
      diff.x = Math.abs(diff.x);
      diff.y = Math.abs(diff.y);
      if (diff.x > 1 || diff.y > 1 || (diff.x > 0 && diff.y > 0)) return true;
      return false;
    }
    const findAdjacentPortalOfSameIndex = (): Portal | null => {
      // up
      if (vec.y > 0) {
        const other = data.portalsMap[getCoordIndex(vec.copy().add(0, -1))];
        if (other && other.channel === channel && !checkDiffMoreThanOne(other)) return other;
      }
      // down
      if (vec.y < GRIDCOUNT.y) {
        const other = data.portalsMap[getCoordIndex(vec.copy().add(0, 1))];
        if (other && other.channel === channel && !checkDiffMoreThanOne(other)) return other;
      }
      // left
      if (vec.x > 0) {
        const other = data.portalsMap[getCoordIndex(vec.copy().add(-1, 0))];
        if (other && other.channel === channel && !checkDiffMoreThanOne(other)) return other;
      }
      // down
      if (vec.x < GRIDCOUNT.x) {
        const other = data.portalsMap[getCoordIndex(vec.copy().add(1, 0))];
        if (other && other.channel === channel && !checkDiffMoreThanOne(other)) return other;
      }
      return null;
    }
    const otherPortal = findAdjacentPortalOfSameIndex();
    if (otherPortal) {
      group = otherPortal.group;
    } else {
      portalGroupIndex[channel] += 1;
      group = portalGroupIndex[channel];
    }
  }
  data.portals[channel].push(vec);
  data.portalsMap[getCoordIndex(vec)] = {
    position: vec.copy(),
    exitMode: PortalExitMode.InvertDirection,
    channel,
    group,
    hash: getPortalHash(vec, channel, group),
    index: 0,
  };
}

function linkPortals(data: LevelData) {
  for (let i = 0; i <= 9; i++) {
    const channelPortals = data.portals[i as PortalChannel]
      .map(vec => data.portalsMap[getCoordIndex(vec)])
      .filter(portal => !!portal);
    const maxGroup = Math.max(...channelPortals.map(portal => portal.group));
    for (let group = 0; group <= maxGroup; group++) {
      const isSameGroupSet = (sourceGroup: number, targetGroup: number) => {
        return Math.floor(sourceGroup / 2) === Math.floor(targetGroup / 2);
      }
      const sourcePortals = channelPortals.filter(portal => portal.channel === i && portal.group === group);
      const targetPortals = channelPortals.filter(portal => portal.channel === i && portal.group !== group);
      const preferPortals = targetPortals.filter(targetPortal => isSameGroupSet(group, targetPortal.group));
      if (targetPortals.length <= 0) continue;

      for (let j = 0; j < sourcePortals.length; j++) {
        const source = sourcePortals[j];
        const target = targetPortals.length ? targetPortals[Math.min(j, targetPortals.length - 1)] : null;
        const prefer = preferPortals.length ? preferPortals[Math.min(j, preferPortals.length - 1)] : null;
        if (prefer && prefer.channel === source.channel) {
          source.link = prefer.position.copy();
          source.index = j;
        } else if (target && target.channel === source.channel) {
          source.link = target.position.copy();
          source.index = j;
        }
      }
    }
  }
}
