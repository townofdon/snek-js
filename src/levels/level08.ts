import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, TitleVariant } from "../types";
import { getCoordIndex2 } from "../utils";
import { SECRET_LEVEL_20 } from "./bonusLevels/secretLevel20";

const name = 'courtyard';

export const LEVEL_08: Level = {
  id: 'C08',
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 70,
  numApplesStart: 10,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXX~~~~~~~~~~~~~XX~~~XXXXXX
+X~~~~                 ~~~~~Xx
+X~~~                     ~~Xx
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
X~~     -==-    -=-  -   ~xddd
X~~     -=-      -       ~xddd
X~~      -               ~~XXX
X~~               ~       ~XXX
X~~               XX~     ~XXX
X~~              ~XX      ~~XX
XX~                ~      ~~XX
XX~                       ~XXX
XX~                      ~~XXX
+dX~       ~~~~~~~~      ~XXXX
+dX~~~   ~~~X~~~~X~~~   ~~XXXX
XX~~~~~~~~~XXDDDDXX~~~~~~~~XXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
XXXXXXXXXXXXDDDDDDXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.forest),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.skycastle,
  titleVariant: TitleVariant.Green,
  globalLight: 0.9,
  nextLevelMap: {
    [getCoordIndex2(29, 16)]: SECRET_LEVEL_20,
    [getCoordIndex2(29, 17)]: SECRET_LEVEL_20,
  },
  pickupDrops: {
    30: { likelihood: .1, type: PickupType.Invincibility },
    60: { likelihood: .2, type: PickupType.Invincibility },
    69: { likelihood: .3, type: PickupType.Invincibility },
    99: { likelihood: .3, type: PickupType.Invincibility },
    104: { likelihood: .4, type: PickupType.Invincibility },
  },
};
