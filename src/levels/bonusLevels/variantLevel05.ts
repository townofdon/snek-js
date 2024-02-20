import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_06 } from "../level06";
import { MAZE_02_NE } from "../mazes/maze02ne";
import { MAZE_02_NW } from "../mazes/maze02nw";
import { MAZE_02_SE } from "../mazes/maze02se";
import { MAZE_02_SW } from "../mazes/maze02sw";

const name = 'the diamond';

export const VARIANT_LEVEL_05: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 50,
  numApplesStart: 8,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXxdxXXXXXXXXXXXXXX
XXXXXXXXXXXXXXxXXXXXXXXXXXXXXX
XXXXXX_+xKKK~~~~~KKKx+_XXXXXXX
XXXXX~_XXXK~     ~KXXX_~XXXXXX
XXXX~~XXXX~  ---  ~XXXX~~XXXXX
XXX~~XXXX~  -===-  ~XXXX~~XXXX
XX~~XXXX~  -=---=-  ~XXXX~~XXX
+_~XXXX~  -=-   -=-  ~XXXX~~_+
+_XXXX~  -=-     -=-  ~XXXX~_+
XXXXX~  -=-       -=-  ~XXXXXX
XXXX~  -=-         -=-  ~XXXXX
XXX~  -=-  ~~ddd~~  -=-  ~XXXX
XX~  -=-   ~~ddd~~   -=-  ~XXX
XX~  -=-   XXX_XXX   -=-   ~XX
XX~  -=-   XX_k_XX   -=-   ~XX
XX~  -=-   XXX_XXX   -=-   ~XX
XX~  -=-   ~~ddd~~   -=-   ~XX
XX~  -=-   ~~ddd~~   -=-  ~XXX
XXX~  -=-           -=-  ~XXXX
XXXX~  -=-         -=-  ~XXXXX
XXXXX~  -=-  O    -=-  ~XXXXXX
+_XXXX~  -=-     -=-  ~XXXX~_+
+_~XXXX~  -=-   -=-  ~XXXX~~_+
XX~~XXXX~  -=---=-  ~XXXX~~XXX
XXX~~XXXX~  -===-  ~XXXX~~XXXX
XXXX~~XXXX~  ---  ~XXXX~~XXXXX
XXXXX~_XXXK~     ~KXXX_~XXXXXX
XXXXXX_+xKKK~~~~~KKKx+_XXXXXXX
XXXXXXXXXXXXXXxXXXXXXXXXXXXXXX
XXXXXXXXXXXXXxdxXXXXXXXXXXXXXX
`,
  colors: getExtendedPalette(PALETTE.darkStar),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  musicTrack: MusicTrack.lostcolony,
  titleVariant: TitleVariant.GrayBlue,
  nextLevel: LEVEL_06,
  nextLevelMap: {
    [getCoordIndex2(0, 7)]: MAZE_02_NW,
    [getCoordIndex2(0, 8)]: MAZE_02_NW,
    [getCoordIndex2(29, 7)]: MAZE_02_NE,
    [getCoordIndex2(29, 8)]: MAZE_02_NE,
    [getCoordIndex2(0, 21)]: MAZE_02_SW,
    [getCoordIndex2(0, 22)]: MAZE_02_SW,
    [getCoordIndex2(29, 21)]: MAZE_02_SE,
    [getCoordIndex2(29, 22)]: MAZE_02_SE,
  }
};
