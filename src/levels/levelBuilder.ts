import P5, { Vector } from "p5";
import { GRIDCOUNT } from "../constants";
import { Level } from "../types";
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
  }

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
          data.apples.push(vec);
      }
    }
    if (y >= GRIDCOUNT.y) { console.warn("level layout is too tall"); break; }
  }

  return data;
}
