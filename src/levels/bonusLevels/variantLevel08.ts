import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_09 } from "../level09";
import { SECRET_LEVEL_20 } from "./secretLevel20";
import { SECRET_LEVEL_21 } from "./secretLevel21";

const name = 'boneyard';

export const VARIANT_LEVEL_08: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 70,
  numApplesStart: 10,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXX~~~~~~~~~~~~~XX~~~XXXXXX
DX~~~~                 ~~~~~XD
DX~~~                     ~~XD
XXX~                      ~XXX
XXX~       _-             ~XXX
XX~~     ~XX=-            ~XXX
XX~~     -XX_             ~~XX
XX_-     -+-        -      ~XX
XX+=-     -        -=-     ~XX
XX+==-             -XX-   ~~~X
XX+--              ~XX=-   ~~X
X__                 -=-    ~~X
X~_       -          -     ~XX
X~~      -=-    ---  -    ~~XX
X~~     -===- --===--=-   ~XXX
X~~     -==-    -=-  -   ~xDDD
X~~     -=-      -       ~xDDD
X~~      -               ~~XXX
X~~               ~       ~XXX
X~~               XX~     ~XXX
X~~              ~XX      ~~XX
XX~                ~      ~~XX
XX~                       ~XXX
XX~                      ~~XXX
DDX~       ~~~~~~~~      ~XXXX
DDX~~~   ~~~X~~~~X~~~   ~~XXXX
XX~~~~~~~~~XXDDDDXX~~~~~~~~XXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
XXXXXXXXXXXXDDDDDDXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.backrooms,
  titleVariant: TitleVariant.Green,
  globalLight: 0.2,
  nextLevel: SECRET_LEVEL_20,
  nextLevelMap: {
    [getCoordIndex2(29, 16)]: SECRET_LEVEL_21,
    [getCoordIndex2(29, 17)]: SECRET_LEVEL_21,
  },
};