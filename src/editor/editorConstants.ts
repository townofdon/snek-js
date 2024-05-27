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
    name: 'SNEKBOSS',
    timeToClear: 60,
    applesToClear: 20,
    numApplesStart: 3,
    disableAppleSpawn: false,
    snakeStartSize: 3,
    growthMod: 1,
    extraHurtGraceTime: 0,
    globalLight: 1,
    palette: PALETTE.hospital,
    portalExitConfig: {
      0: PortalExitMode.InvertDirection,
      3: PortalExitMode.InvertDirection,
      1: PortalExitMode.InvertDirection,
      2: PortalExitMode.InvertDirection,
      4: PortalExitMode.InvertDirection,
      5: PortalExitMode.InvertDirection,
      6: PortalExitMode.InvertDirection,
      7: PortalExitMode.InvertDirection,
      8: PortalExitMode.InvertDirection,
      9: PortalExitMode.InvertDirection
    },
  },
}
