import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType } from "../types";
import { toTime } from "../utils";

const name = 'boxed'

export const LEVEL_12: Level = {
  id: 'C12',
  name,
  timeToClear: 1000 * 60 * 1.7,
  parTime: toTime({ minutes: 1, seconds: 23 }),
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
  colors: getExtendedPalette(PALETTE.plumsea),
  showTitle: true,
  musicTrack: MusicTrack.shopkeeper,
  pickupDrops: {
    30: { likelihood: .1, type: PickupType.Invincibility },
    35: { likelihood: .1, type: PickupType.Invincibility },
    40: { likelihood: .2, type: PickupType.Invincibility },
    45: { likelihood: .2, type: PickupType.Invincibility },
    50: { likelihood: .8, type: PickupType.Invincibility },
    55: { likelihood: .3, type: PickupType.Invincibility },
  },
};
