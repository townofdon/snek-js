import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, PickupType } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { LEVEL_08 } from "../level08";
import { VARIANT_LEVEL_08 } from "./variantLevel08";

const name = 'factory subfloor';

export const VARIANT_LEVEL_07: Level = {
  id: 'C207',
  name,
  timeToClear: 1000 * 60 * 1.8,
  parTime: toTime({ minutes: 1, seconds: 20 }),
  applesToClear: 60,
  numApplesStart: 5,
  layout: `
XXXXXXXXXXXXXXJJXXXXXXXXXXXXXX
X~~ ---~ ~~~~XxxX~~~~  --- ~~X
X~  ===     ~XxxX~     ===  ~X
X~  ---                ---  ~X
X   XXXddJJJJLLLLJJJJddXXX  ~X
X~  X==~---- ---- ----~XXX~  X
X  ~X=X~      l       ~XXX  ~X
X~ ~X=X~              ~XXX~ ~X
X  ~==X~~~ ~    ~ ~ ~~~XXX~ ~X
X   XXXXXXXXXDDDDXXXXXXXXX   X
X~      ~  ~  ~   ~  ~       X
X~                          ~X
X~~~~~~ ---- KKKK ---- ~~~~~~X
XDDDXXX_====-K jK-====_XXXDDDX
X~~~~~~ ---- KKKK ---- ~~~~~~X
X~     O                    ~X
X      ~  ~  ~ ~  ~  ~   ~  ~X
X   XXXXXXXXXDDDDXXXXXXXXX   X
X~  XXX~~~          ~~~XXX  ~X
X  ~XXX~       k      ~XXX~ ~X
X  ~XXX~              ~XXX~ ~X
X~ ~XXX~---- ---- ----~XXX~ ~X
X~  XXXddJJJJLLLLLJJJddXXX   X
X   ---                ---  ~X
X~   =                  =   ~X
X~   =                  =    X
X~   =                  =   ~X
X~~ ---   ~XX~~~~XX~   --- ~~X
XXXXXXX~~~~XXDDDDXX~~~~XXXXXXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.stonelair),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["There are older and fouler things than Snek in the deep places of the world."],
  ],
  musicTrack: MusicTrack.stonemaze,
  globalLight: 0.4,
  nextLevel: LEVEL_08,
  nextLevelMap: {
    [getCoordIndex2(14, 0)]: VARIANT_LEVEL_08,
    [getCoordIndex2(15, 0)]: VARIANT_LEVEL_08,
  },
  pickupDrops: {
    50: { likelihood: 1, type: PickupType.Invincibility },
  },
};
