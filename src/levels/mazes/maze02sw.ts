import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { LEVEL_06 } from "../level06";

const name = 'maze-02-sw';

export const MAZE_02_SW: Level = {
  type: LevelType.Maze,
  name,
  timeToClear: Infinity,
  applesToClear: Infinity,
  disableAppleSpawn: true,
  numApplesStart: 0,
  // extraHurtGraceTime: 10,
  snakeStartSizeOverride: 150,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DD =--=  =--=  =-=  =--=  =-DD
DD =--=  =--=  =-=  =--=  =-DD
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXX=--=XX XX XX   XX XX=--=XXX
XXX=--=XX XX XX-=-XX XX=--=XXX
XXXXXXXXXXXXXXX-=-XXXXXXXXXXXX
XXX=--=XX XX XX-=-XX XX=--=XXX
XXX=--=XX XX XX   XX XX=--=XXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DD =--=  =--=  =-=  =--=  =--=
DD =--=  =--=  =-=  =--=  =--=
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
XX XXXXXXXXXXXXXXXXXXXXXXXXXXX
DD =--=  =--=  =-=  =--=  =-XX
DD =--=  =--=  =-=  =--=  =-XX
XXXXXXXXXXXXXXXXXXXXXXXDD  OXX
XXXXXXXXXXXXXXXXXXXXXXXDDDDDXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
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
  globalLight: 0.2,
  nextLevel: LEVEL_06,
};
