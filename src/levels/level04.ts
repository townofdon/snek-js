import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";
import { getCoordIndex2 } from "../utils";
import { VARIANT_LEVEL_05 } from "./bonusLevels/variantLevel05";

const name = 'the facility';

export const LEVEL_04: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 60,
  numApplesStart: 5,
  growthMod: 0.6,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X++++==----=====---++++XXXXXXX
X+_----    -----   ---___XXXXX
X+-       -++===-       ~~~XXX
X=-      -+DDXXX+--       ~~~X
X=-      -+DDXXX+++-       ~~X
X=-       -+++++X+++__      ~X
X-   XX~    ---++XXDDD_      X
X-   XX~~      -+XXDDD_      X
X    ~~X~~      -_____       X
X~    ~~XX                   X
X~     ~XX     --      ~~~- -X
X~      dd    -==-     DD+=-=X
X~      dd   -=XX=-    DD+=-=X
XX           -=XX=-    ~XX=-=X
DD            -==-     ~XX=-=X
DD             ==      ~XX=-=X
DD             ==      ~XX=-=X
XX   ======dd====     ~~XX=-=X
X~   ======dd====     ~~XX=-=X
X~   ++               ~~XX=-=X
X~   XX~              XX++=-=X
X~   XX~              XX++=-+X
X~   ~~                ---- ~X
X~                         ~~X
X~    O --                ~~~X
X~~--=====-             ~~~XXX
XXXXXXXXXXX_-         ~~~XXXXX
xxxxxxxxxxx++_---   ~~~XXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`,
  colors: getExtendedPalette(PALETTE.hospital),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  extraLoseMessages: [
    ["I've heard this level makes people irrationally angry."],
  ],
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.conquerer,
  titleVariant: TitleVariant.Yellow,
  nextLevelMap: {
    [getCoordIndex2(0, 28)]: VARIANT_LEVEL_05,
  },
};
