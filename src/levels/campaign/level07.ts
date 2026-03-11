import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_08 } from "../bonusLevels/variantLevel08";

const name = 'factory floor';

export const LEVEL_07: Level = {
  id: 'C07',
  name,
  timeToClear: 1000 * 60 * 1.7,
  parTime: toTime({ minutes: 0, seconds: 55 }),
  applesToClear: 40,
  numApplesStart: 5,
  layout: `
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X~~  ~ ~ ~~~~XDDX~~~~  ~ ~ ~~X
X~          ~XDDX~          ~X
X~                          ~X
X   XXX_====-====-====_XXX  ~X
X~  XXX~---- ---- ----~XXX~  X
X  ~XXX~              ~XXX  ~X
X~ ~XXX~              ~XXX~ ~X
X  ~XXX~~~ ~    ~ ~ ~~~XXX~ ~X
X~ ~XXXXXXXXXDDDDXXXXXXXXX~  X
X~      ~  ~  ~   ~  ~       X
X~                          ~X
X~~~~~~ ---- ---- ---- ~~~~~~X
XDDDXXX_====-====-====_XXXDDDx
X~~~~~~ ---- ---- ---- ~~~~~~X
X~     O                    ~X
X      ~  ~  ~ ~  ~  ~   ~  ~X
X   XXXXXXXXXDDDDXXXXXXXXX~  X
X~  XXX~~~          ~~~XXX  ~X
X  ~XXX~              ~XXX~ ~X
X  ~XXX~              ~XXX~ ~X
X~ ~XXX~---- ---- ----~XXX~ ~X
X~  XXX_====-====-====_XXX   X
X                           ~X
X~                          ~X
X~                           X
X~                          ~X
X~~       ~XX~~~~XX~       ~~X
XXXXXXX~~~~XXDDDDXX~~~~XXXXXXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.violetSunset),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["Hang in there, it gets harder."],
  ],
  musicTrack: MusicTrack.factorio,
  globalLight: 0.75,
  nextLevelMap: {
    [getCoordIndex2(29, 13)]: VARIANT_LEVEL_08,
  },
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: 2,
  },
  pickupDropsByFrame: {
    11: { likelihood: .9, type: ItemDropType.Mine },
    15: { likelihood: .1, type: ItemDropType.Invincibility },
    17: { likelihood: .8, type: ItemDropType.Mine },
    20: { likelihood: .2, type: ItemDropType.Invincibility },
    21: { likelihood: .9, type: ItemDropType.Mine },
    25: { likelihood: .8, type: ItemDropType.Mine },
    27: { likelihood: .8, type: ItemDropType.Mine },
    30: { likelihood: .3, type: ItemDropType.Invincibility },
    32: { likelihood: .8, type: ItemDropType.Mine },
    35: { likelihood: .8, type: ItemDropType.Mine },
    36: { likelihood: .8, type: ItemDropType.Mine },
    42: { likelihood: .8, type: ItemDropType.Mine },
    48: { likelihood: .9, type: ItemDropType.Mine },
    50: { likelihood: .8, type: ItemDropType.Invincibility },
  },
};
