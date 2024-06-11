import { Vector } from 'p5';

import { DIR, EditorData, EditorOptions, PortalExitMode } from '../types'
import { PALETTE } from '../palettes';
import { buildLevel } from '../levels/levelBuilder';
import { LEVEL_01 } from '../levels';

const levelData = buildLevel(LEVEL_01);

export const EDITOR_DEFAULTS: { data: EditorData, options: EditorOptions } = {
  data: {
    applesMap: {},
    barriersMap: { ...levelData.barriersMap },
    decoratives1Map: { ...levelData.decoratives1Map },
    decoratives2Map: { ...levelData.decoratives2Map },
    doorsMap: { ...levelData.doorsMap },
    keysMap: {},
    locksMap: {},
    nospawnsMap: {},
    passablesMap: {},
    portalsMap: {},
    playerSpawnPosition: levelData.playerSpawnPosition.copy(),
    startDirection: DIR.RIGHT,
  },
  options: {
    name: 'Untitled Map',
    timeToClear: 120000,
    applesToClear: 20,
    numApplesStart: 3,
    disableAppleSpawn: false,
    snakeStartSize: 3,
    growthMod: 1,
    extraHurtGraceTime: 0,
    globalLight: 1,
    palette: PALETTE.hospital,
    portalExitConfig: {
      0: PortalExitMode.SameDirection,
      1: PortalExitMode.SameDirection,
      2: PortalExitMode.SameDirection,
      3: PortalExitMode.SameDirection,
      4: PortalExitMode.SameDirection,
      5: PortalExitMode.SameDirection,
      6: PortalExitMode.SameDirection,
      7: PortalExitMode.SameDirection,
      8: PortalExitMode.SameDirection,
      9: PortalExitMode.SameDirection,
    },
  },
}
