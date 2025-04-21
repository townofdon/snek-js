import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_04 } from "../level04";
import { TUTORIAL_LEVEL_20 } from "../tutorialLevel20";
import { TUTORIAL_LEVEL_30 } from "../tutorialLevel30";
import { TUTORIAL_LEVEL_40 } from "../tutorialLevel40";

const name = 'warp zone 01';

export const WARP_ZONE_01: Level = {
  id: '',
  type: LevelType.WarpZone,
  name,
  timeToClear: Infinity,
  applesToClear: Infinity,
  disableAppleSpawn: true,
  numApplesStart: 0,
  // extraHurtGraceTime: 10,
  // snakeStartSizeOverride: 150,
  growthMod: 0,
  layout: `
XXXXXXXXXXXXXXXXX1D D3XXXXXXXX
XXXXXXXXXXXDDDDDX1D D3XXXXXXXX
XXXXXXXXXXXD--DDX1D D3XXXXXXXX
XXXXXXXXXXXDDD-DX1D D3XXXXXXXX
XXXXXXXXXXXDD-DDDDD DXXXXXXXXX
XXXXXXXXXXXD-DDDDDD DXXXXXXXXX
XXXXXXXXXXXD---DXXD DXXXXXXXXX
XXXXXXXXXXXDDDDDXXD DXXXXDDDDD
XXXXX               XXXXXDD-DD
XXXXX  XXXXXXXXXXXXXXXXXXD--DD
XXXXX  XXXXXXXXXXXXXXXXXXDD-DD
XXXXX  XXXXXXXXXXXXXXXXXXDD-DD
XXXXX  XXXXXXXXXXXXXXXXXXD---D
DDDDD  XXXXXXXXXXXXXXXXXXDDDDD
==aaaO                        
DDDDD  XXXXXXXXXXXXXXXXXXDDDDD
XXXXX  XXXXXXXXXXXXXXXXXXXXXXX
XXXXX  XXXXXXXXXXXXXXXXXXXXXXX
XXXXX  XXXXXXXXXXXXXXXXXXXXXXX
XXXXX  XXXXXXXXXXXXXXXXXXXXXXX
XXXXX               XXXXXXXXXX
XXXXXXXXXXXDDDDDXXD DXXXXXXXXX
XXXXXXXXXXXD--DDXXD DXXXXXXXXX
XXXXXXXXXXXDDD-DXXD DXXXXXXXXX
XXXXXXXXXXXDD-DDDDD DXXXXXXXXX
XXXXXXXXXXXDDD-DDDD DXXXXXXXXX
XXXXXXXXXXXD--DDXJD DKXXXXXXXX
XXXXXXXXXXXDDDDDXJD DKXXXXXXXX
XXXXXXXXXXXXXXXXXJD DKXXXXXXXX
XXXXXXXXXXXXXXXXXJD DKXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
  showTitle: true,
  showQuoteOnLevelWin: false,
  portalExitConfig: {
    1: PortalExitMode.SameDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
    5: PortalExitMode.SameDirection,
    6: PortalExitMode.SameDirection,
    7: PortalExitMode.SameDirection,
    8: PortalExitMode.SameDirection,
    9: PortalExitMode.SameDirection,
    0: PortalExitMode.SameDirection,
  },
  musicTrack: MusicTrack.backrooms,
  globalLight: 0.5,
  nextLevel: LEVEL_04,
  nextLevelMap: {
    [getCoordIndex2(29, 14)]: TUTORIAL_LEVEL_20,
    [getCoordIndex2(19, 0)]: TUTORIAL_LEVEL_30,
    [getCoordIndex2(19, 29)]: TUTORIAL_LEVEL_40,
  }
};
