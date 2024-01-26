import { PALETTE } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";

const name = 'maze-01';

export const MAZE_01: Level = {
  type: LevelType.Maze,
  name,
  timeToClear: Infinity,
  applesToClear: Infinity,
  disableAppleSpawn: true,
  numApplesStart: 0,
  // extraHurtGraceTime: 10,
  snakeStartSizeOverride: 150,
  layout: `
XXXXXXXXXXXXXD1DXXXXXXXXXXXXXX
XXXXXXXXXXXXXD DXXXXXXXXXXXXXX
XXXXXXXXXXXXXD DXXXXXXXXXXXXXX
XXX        XXX XXX     XXX XXX
XXX XXXXXXXXXX XXX XXX XXX XXX
XXX XXXXXXXXXX XXX XXX XXX XXX
XXX XXXXXXXXXX XXX XXX XXX XXX
XXX        XXX XXX XXX XXX XXX
XXXXXXXXXX XXX XXX XXX XXX XXX
XXXXXXXXXX XXX XXX XXX XXX XXX
XXXXXXXXXX XXX XXX XXX XXX XXX
XXX        XXX XXX XXX     XXX
XXXXXXXXXXXXXX XXXXXXXXXXXXXXX
XXXDDDDDDDDDDD XXXXXXXXXXXXDDD
XXXDXXXXXXXX Ao              2
XXXDDDDDDDDDDD XXX XXXXXXXXDDD
XXXXXXXXXXXXXX3XXX3XXXXXXXXXXX
XXX        XXX XXX XXXXX XXXXX
XXX XXXXXXXXXX XXX XXXXX XXXXX
XXX XXXXXXXXXX XXX XXXXX XXXXX
XXX XXXXXXXXXX XXX XX    XXXXX
XXX       XXXX XXX XX XXXXXXXX
XXX XXXXXXXXXX XXX XX XXXXXXXX
XXX XXXXXXXXXX XXX  4      XXX
XXX XXXXXXXXXX XXX XXXXXXX XXX
XXX XXXXXXXXXX XXX XXXXXXX XXX
XXX        XXX XXX XXXXXXX XXX
XXXXXXXXXXXXXD DXXXXXXXXXD DXX
XXXXXXXXXXXXXD DXXXXXXXXXD DXX
XXXXXXXXXXXXXD3DXXXXXXXXXD4DXX
  `,
  colors: PALETTE.gravChamber,
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
  musicTrack: MusicTrack.None,
  globalLight: 0.4,
};
