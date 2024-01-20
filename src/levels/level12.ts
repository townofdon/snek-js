import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack } from "../types";

const name = 'boxed'

export const LEVEL_12: Level = {
  name,
  timeToClear: 1000 * 60 * 1.7,
  applesToClear: 60,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXX~~    ----    ~~XXXXXXX
XXXXXXX~     ----     ~XXXXXXX
XXXXXX~      ----      ~XXXXXX
X~         ~XXXXXX~         ~X
X          ~DaaaaD~          X
X          ~XXXXXX~          X
d-=====-----_++++_-----=====-d
d-=====------====------=====-d
d-=====------====------=====-d
X                            X
X                            X
X      XXXXDX    XDXXXX      X
X-=    XXXXDX----XDXXXX    =-X
X-=    X__XaX----XaX__X    =-X
X-=    X__XaX----XaX__X    =-X
X-=    XXXXDX----XDXXXX    =-X
X      XXXXDX    XDXXXX      X
X                            X
X          O                 X
d-=====------====------=====-d
d-=====------====------=====-d
d-=====-----_++++_-----=====-d
X          ~XXXXXX~          X
X          ~DaaaaD~          X
X~         ~XXXXXX~         ~X
XXXXXX~      ----      ~XXXXXX
XXXXXXX~     ----     ~XXXXXXX
XXXXXXX~~    ----    ~~XXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: PALETTE.plumsea,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  musicTrack: MusicTrack.shopkeeper,
};
