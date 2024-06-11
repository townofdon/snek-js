import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType } from "../types";
import { getCoordIndex2 } from "../utils";
import { VARIANT_LEVEL_08 } from "./bonusLevels/variantLevel08";

const name = 'factory floor';

export const LEVEL_07: Level = {
  name,
  timeToClear: 1000 * 60 * 1.7,
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
    15: { likelihood: .4, type: PickupType.Invincibility },
    20: { likelihood: .4, type: PickupType.Invincibility },
    30: { likelihood: .4, type: PickupType.Invincibility },
    50: { likelihood: 1, type: PickupType.Invincibility },
  },
};
