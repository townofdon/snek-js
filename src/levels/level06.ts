import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, PortalExitMode } from "../types";
import { getCoordIndex2, toTime } from "../utils";
import { VARIANT_LEVEL_07 } from "./bonusLevels/variantLevel07";

const name = 'lobby';

export const LEVEL_06: Level = {
  id: 'C06',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 0, seconds: 50 }),
  applesToClear: 40,
  numApplesStart: 5,
  growthMod: 0.9,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXX~~~ ~  ~ ~  ~  ~  ~ ~~XXXX
XXXX    ------  ------    XXXX
XXXX   -======--======-   XXXX
XXXX~ -+DDDDDD++DDDDDD+- ~XXXX
X~~~   -======--======--  ~~~X
X~      ------  ------      ~X
X~                          ~X
X~    ~X_+__      __+_X~    ~X
X~    ~XX_+_      _+_XX~    ~X
X~   ~~XXX_+      +_XXX~~   ~X
XX   ~~XXXX_      _XXXX~~   XX
XX   XXXXXXX      XXXXXXX   XX
D~     ~   ~       ~   ~    ~D
D~         O                ~D
D~     ~ ~        ~ ~   ~   ~D
XX   XXXXXXX      XXXXXXX   XX
XX   ~~XXXX_      _XXXX~~   XX
X~   ~~XXX_+      +_XXX~~   ~X
X~    ~XX_+_      _+_XX~    ~X
X~    ~X_+__      __+_X~    ~X
X~                          ~X
X~      ------  ------      ~X
X~~~   -=+==+=--=+==+=-    ~~X
XXXX~ -+DDDDDD++DDDDDD+- ~XXXX
Xxxx~  -=+=+==--==+=+=-  ~xxxX
XxXX~   ------  ------   ~XXxX
XxXX~~~ ~  ~   ~  ~ ~  ~~~XXxX
XxXXXXXXXXXXXXXXXXXXXXXXXXXXxX
XxXXXXXXXXXXXXXXXXXXXXXXXXXXxX
  `,
  colors: getExtendedPalette(PALETTE.cornflower),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.lordy,
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
  },
  nextLevelMap: {
    [getCoordIndex2(1, 29)]: VARIANT_LEVEL_07,
    [getCoordIndex2(28, 29)]: VARIANT_LEVEL_07,
  },
  pickupDrops: {
    39: { likelihood: 1, type: PickupType.Invincibility },
    59: { likelihood: .8, type: PickupType.Invincibility },
  },
};
