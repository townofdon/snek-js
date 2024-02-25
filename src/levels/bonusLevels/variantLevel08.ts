import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../../types";
import { LEVEL_09 } from "../level09";

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
X~~     -==-    -=-  -   ~XDDD
X~~     -=-      -       ~XDDD
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
  nextLevel: LEVEL_09,
};
