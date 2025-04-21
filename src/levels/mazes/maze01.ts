import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_01_HARD } from "../level01hard";
import { LEVEL_01_ULTRA } from "../level01ultra";

const name = 'maze-01';

export const MAZE_01: Level = {
  id: '',
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
XXXXXXXXXX XXX4XXX XXX XXX XXX
XXXXXXXXXX XXX XXX XXX XXX XXX
XXX        XXX XXX XXX     XXX
XXXXXXXXXXXXXX XXXXXXXXXXXXXXX
XXXDDDDDDDDXXX3XXXXXXXXXXXDDDD
XXXDXXXXXXXX AO    3   4     2
XXXDDDDDDDDXXX3XXX3XXXXXXXDDDD
XXXXXXXXXXXXXX XXX XXXXXXXXXXX
XXX        XXX XXX XXXXX XXXXX
XXX XXXXXXXXXX XXX XXXXX XXXXX
XXX XXXXXXXXXX4XXX XXXXX XXXXX
XXX XXXXXXXXXX XXX XX    XXXXX
XXX       XXXX XXX XX XXXXXXXX
XXX XXXXXXXXXX XXX XX XXXXXXXX
XXX XXXXXXXXXX XXX 4       XXX
XXX XXXXXXXXXX XXX XXXXXXX XXX
XXX XXXXXXXXXX XXX XXXXXXX XXX
XXX        XXX XXX XXXXXXX XXX
XXXXXXXXXXXXXD DXXXXXXXXDD DXX
XXXXXXXXXXXXXD DXXXXXXXXDD DXX
XXXXXXXXXXXXXD3DXXXXXXXXDD4DXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
  renderInstructions: (gfx, renderer, state, palette) => {
    renderer.drawDifficultySelect(gfx, state.isShowingDeathColours ? PALETTE.deathInvert.background : palette.background);
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
  globalLight: 0.4,
};
