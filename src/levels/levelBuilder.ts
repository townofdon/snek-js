import P5, { Vector } from "p5";
import { DEFAULT_PORTALS, GRIDCOUNT } from "../constants";
import { Level, Portal, PortalChannel, PortalExitMode } from "../types";
import { getCoordIndex } from "../utils";

interface BuildLevelParams {
  p5: P5
  level: Level
}

interface LevelData {
  barriers: Vector[]
  barriersMap: Record<number, boolean>
  doors: Vector[]
  doorsMap: Record<number, boolean>
  apples: Vector[]
  decoratives1: Vector[]
  decoratives2: Vector[]
  nospawns: Vector[]
  nospawnsMap: Record<number, boolean>
  playerSpawnPosition: Vector
  portalsMap: Record<number, Portal>
  portals: Record<PortalChannel, Vector[]>
}

export function buildLevel({ p5, level }: BuildLevelParams) {
  const data: LevelData = {
    barriers: [],
    barriersMap: {},
    doors: [],
    doorsMap: {},
    apples: [],
    decoratives1: [],
    decoratives2: [],
    nospawns: [],
    nospawnsMap: {},
    playerSpawnPosition: p5.createVector(15, 15),
    portals: { ...DEFAULT_PORTALS },
    portalsMap: {},
  }

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

  const layoutRows = level.layout.trim().split('\n');
  for (let y = 0; y < layoutRows.length; y++) {
    const rowStr = layoutRows[y];

    for (let x = 0; x < rowStr.length; x++) {
      if (x >= GRIDCOUNT.x) { console.warn("level layout is too wide"); break; }

      const char = rowStr.charAt(x);
      if (char === ' ') {
        continue;
      }

      const vec = p5.createVector(x, y);

      switch (char.toLowerCase()) {
        case 'x':
          data.barriers.push(vec);
          data.barriersMap[getCoordIndex(vec)] = true;
          break;
        case 'd':
          data.doors.push(vec);
          data.doorsMap[getCoordIndex(vec)] = true;
          break;
        case 'o':
          data.playerSpawnPosition = vec;
          break;

        // no-spawns
        case '~':
          data.nospawns.push(vec);
          data.nospawnsMap[getCoordIndex(vec)] = true;
          break;
        case '_':
          data.decoratives1.push(vec);
          data.nospawns.push(vec);
          data.nospawnsMap[getCoordIndex(vec)] = true;
          break;
        case '+':
          data.decoratives2.push(vec);
          data.nospawns.push(vec);
          data.nospawnsMap[getCoordIndex(vec)] = true;
          break;

        // decorative
        case '-':
          data.decoratives1.push(vec);
          break;
        case '=':
          data.decoratives2.push(vec);
          break;

        // manually-spawned apples
        case 'a':
          data.nospawns.push(vec);
          data.apples.push(vec);
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
          const channel = parseInt(char, 10) as PortalChannel;
          // increment portal index if prev portal cell of same PortalIndex is farther away than 1 unit
          if (data.portals[channel].length) {
            const lastPortal = data.portals[channel][data.portals[channel].length - 1];
            const diff = P5.Vector.sub(lastPortal, vec);
            diff.x = Math.abs(diff.x);
            diff.y = Math.abs(diff.y);
            if (diff.x > 1 || diff.y > 1 || (diff.x > 0 && diff.y > 0)) {
              portalGroupIndex[channel] += 1;
            }
          }
          data.portals[channel].push(vec);
          data.portalsMap[getCoordIndex(vec)] = {
            position: vec,
            exitMode: PortalExitMode.InvertDirection,
            channel: channel,
            group: portalGroupIndex[channel],
          };
          break;
      }
    }
    if (y >= GRIDCOUNT.y) { console.warn("level layout is too tall"); break; }
  }

  // link portals
  for (let i = 0; i <= 9; i++) {
    const channelPortals = data.portals[i as PortalChannel]
      .map(vec => data.portalsMap[getCoordIndex(vec)])
      .filter(portal => !!portal);
    const maxGroup = Math.max(...channelPortals.map(portal => portal.group));
    for (let group = 0; group <= maxGroup; group++) {
      const sourcePortals = channelPortals.filter(portal => portal.group === group);
      const targetPortals = channelPortals.filter(portal => portal.group !== group);
      if (targetPortals.length <= 0) continue;

      for (let j = 0; j < sourcePortals.length; j++) {
        const source = sourcePortals[j];
        const target = targetPortals[Math.min(j, targetPortals.length - 1)];
        if (!target) continue;
        source.link = target.position;
      }
    }
  }

  return data;
}
