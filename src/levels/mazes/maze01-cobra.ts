import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_01_HARD } from "../level01hard";
import { LEVEL_01_ULTRA } from "../level01ultra";

const name = 'cobra mode';

export const MAZE_01_COBRA: Level = {
  type: LevelType.Maze,
  name,
  timeToClear: Infinity,
  applesToClear: Infinity,
  disableAppleSpawn: true,
  numApplesStart: 0,
  // extraHurtGraceTime: 10,
  snakeStartSizeOverride: 150,
  layout: `
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX
XXX        XXXDXXX       XXXXX
XXX XXXXXX XXXDXXX XXXXXX XXXX
XXX XXXXXXXXXXDXXX XXXXXX XXXX
XXX XXXXXXXXXXDXXX XXXXXX XXXX
XXX XXXXXXXXXXDXXX       XXXXX
XXX XXXXXXXXXXDXXX XXXXXX XXXX
XXX XXXXXXXXXXDXXX XXXXXX XXXX
XXX XXXXXX XXXDXXX XXXXXX XXXX
XXX        XXXDXXX       XXXXX
XXXXXXXXXXXXXX XXXXXXXXXXXXXXX
DDDXXXXXXXXXXX XXXXXXXXXXXDDDD
DDDDDDDDDDDD AO3   4         3
DDDXXXXXXXXXXX3XXXXXXXXXXXDDDD
XXXXXXXXXXXXXX XXXXXXXXXXXXXXX
XXX       XXXX XXXX      XXXXX
XXX XXXXXX XXX XXX XXXXXX XXXX
XXX XXXXXX XXX4XXX XXXXXX XXXX
XXX XXXXXX XXX XXX XXXXXX XXXX
XXX       XXXX XXX        XXXX
XXX XXXXXX XXX XXX XXXXXX XXXX
XXX XXXXXX XXX XXX XXXXXX XXXX
XXX XXXXXX XXX XXX XXXXXX XXXX
XXX XXXXXX XXX XXX XXXXXX XXXX
XXX XXXXXX XXX XXX XXXXXX XXXX
XXXXXXXXXXXXXD DXXXXXXXXXXXXXX
XXXXXXXXXXXXXD DXXXXXXXXXXXXXX
XXXXXXXXXXXXXD4DXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
  renderInstructions: (renderer, state, palette) => {
    renderer.drawDifficultySelectCobra(state.isShowingDeathColours ? PALETTE.deathInvert.background : palette.background);
  },
  showQuoteOnLevelWin: false,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
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
  musicTrack: MusicTrack.drone,
  globalLight: 0.4,
  nextLevelMap: {
    [getCoordIndex2(29, 14)]: LEVEL_01_HARD,
    [getCoordIndex2(14, 29)]: LEVEL_01_ULTRA,
  },
};
