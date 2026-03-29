import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType } from "../../types";
import { toTime } from "../../utils";

const name = 'boxed'

export const LEVEL_12: Level = {
  id: 'C12',
  name,
  timeToClear: 1000 * 60 * 1.7,
  parTime: toTime({ minutes: 1, seconds: 25 }),
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
  layoutV2: 'Cm0pa1ZmYVl1T0tLCnZqdgpYalVuSn50WFpaUVdYdFdKZ1VqTHZqdktLTwp1CllhKWZWa218NThwUklHSFR8Ym94ZWR8MTAyMDBoNmhxaHEwLjc1fGhwI0VGRDlDRU5FMUI3QTNsOEYzOTg1TkEwNDA5NXJsMzYzQTU5ck4wN0JFQjhOMDhEOUQyTjc4RDVFM040NUM1RDlOOThERkVBfGNjY3AxcTIhICAobj09PSl%252BVyosJ3chS2koTS0oZ2R5Ck0tLS0tTi0jT2lfc3NfTShnZFAqV3Z2VypTUVhKZ3luSlhTSkpVeXd%252BZFhKWGR%252Bd3lWKVgqSiBNSnopTClXWFhZWFMhKmRBQUFBZCpTIUxaUV9fdkF2TXZBdl9fYVgqUyBQekxjMS0xLTEtZip3TXcqKQpnPS1oMHxpCmQoPU0talNTU0prWCoqSk1KKiopTGxOMjUyODNETm0pKSkpKQpuLT1wMXxxM3xyTjJGMzI0Q3MrK3RkWE1YZFd1dlMhUCF2d0oheUxYeiAqfldXAX56eXd1dHNycXBubWxramloZ2ZjYVpZV1ZVU1FQT05NTEtKKikoIV8%253D',
  colors: getExtendedPalette(PALETTE.plumsea),
  showTitle: true,
  musicTrack: MusicTrack.shopkeeper,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Mine]: true,
  },
  pickupDropsByFrame: {
    30: { likelihood: .1, type: ItemDropType.Invincibility },
    35: { likelihood: .1, type: ItemDropType.Invincibility },
    40: { likelihood: .2, type: ItemDropType.Invincibility },
    45: { likelihood: .2, type: ItemDropType.Invincibility },
    50: { likelihood: .8, type: ItemDropType.Invincibility },
    55: { likelihood: .3, type: ItemDropType.Invincibility },
  },
};
