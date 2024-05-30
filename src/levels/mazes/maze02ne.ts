import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { LEVEL_06 } from "../level06";

const name = 'maze-02-ne';

export const MAZE_02_NE: Level = {
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
DDDDDXXXXXXXXXXXXXXXXXXXXXXXXX
DD  O =--=  =-=  =--=  =--= DD
DDDDD =--=  =-=  =--=  =--= DD
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
XXXXXXXXXXXXXXXXXXXXXXXXXXX XX
=--=  =DD=DD=-=DD=DD=DD=--= DD
=--=  =AA=AA=-=AA=AA=AA=--= DD
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXX=--=XX XX   XX XX=--=XXXXXX
XXX=--=XX XX-=-XX XX=--=XXXXXX
XXXXXXXXXXXX-=-XXXXXXXXXXXXXXX
XXX=--=XX XX-=-XX XX=--=XXXXXX
XXX=--=XX XX   XX XX=--=XXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
DD-=  =--=  =-=  =--=  =--= DD
DD-=  =--=  =-=  =--=  =--= DD
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
  renderInstructions: (gfx, renderer, state, palette) => {
    renderer.drawSprintControls(gfx, 6, 8);
  },
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
