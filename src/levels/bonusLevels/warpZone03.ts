import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_13 } from "../level13";
import { TUTORIAL_LEVEL_40 } from "../tutorialLevel40";

const name = 'warp zone 03';

export const WARP_ZONE_03: Level = {
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
XXXXXXXXXXXXXXXXXxDXDxXXXXXXXX
XXXXXXXXXXXDDDDDXxDXDxXXXXXXXX
XXXXXXXXXXXDXXDDXxDXDxXXXXXXXX
XXXXXXXXXXXDDDXDXxDXDxXXXXXXXX
XXXXXXXXXXXDDXDDDDDXDXXXXXXXXX
XXXXXXXXXXXDXDDDDDDXDXXXXXXXXX
XXXXXXXXXXXDXXXDXXDXDXXXXXXXXX
XXXXXXXXXXXDDDDDXXDXDXXXXDDDDD
XXXXXXDDDDDDDDDDDDDDDXXXXDDXDD
XXXXXXDXXXXXXXXXXXXXXXXXXDXXDD
XXXXXXDXXXXXXXXXXXXXXXXXXDDXDD
XXXXXXDXXXXXXXXXXXXXXXXXXDDXDD
XXXXXXDXXXXXXXXXXXXXXXXXXDXXXD
DDDDDDDXXXXXXXXXXXXXXXXXXDDDDD
==aaaO DDDDDDDDDDDDDDDDDDXXXXX
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
  nextLevel: LEVEL_13,
  nextLevelMap: {
    [getCoordIndex2(19, 29)]: TUTORIAL_LEVEL_40,
  },
};
