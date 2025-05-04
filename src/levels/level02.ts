import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, PortalExitMode, TitleVariant } from "../types";
import { getCoordIndex2, toTime } from "../utils";
import { VARIANT_LEVEL_03 } from "./bonusLevels/variantLevel03";

const name = 'plaza'

export const LEVEL_02: Level = {
  id: 'C02',
  name,
  timeToClear: 1000 * 60 * 1.2,
  parTime: toTime({ minutes: 0, seconds: 50 }),
  applesToClear: 40,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXX++       -_-        ++XXXX
XXX++-       -=-        -++XXX
XX++-        -=-         -++XX
X++-         -=-          -++X
X~           -=-             X
X            ---            ~X
d------------+X+-------------d
d-===-----==-XXX-==------===-d
d------------+X+-------------d
X            ---             X
X~~          -=-           ~~X
X++-         -=-          -++X
XX+=----------------------=+XX
XXX=----====- O -====-----=XXX
XX+=----------------------=+XX
X++-         -=-          -++X
X~~          -=-           ~~X
X            ---             X
d------------+X+-------------d
d-===-----==-XXX-==------===-d
d------------+X+-------------d
X            ---             X
X~           -=-             X
X            -=-            ~X
X++-         -=-          -++X
XX++-        -=-         -++XX
XXX++-       -=-        -++XXX
8XXX++   ~   -_-   ~    ++xxx8
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.plumsea),
  showTitle: true,
  musicTrack: MusicTrack.simpleTime,
  titleVariant: TitleVariant.Green,
  nextLevelMap: {
    [getCoordIndex2(1, 28)]: VARIANT_LEVEL_03,
    [getCoordIndex2(28, 28)]: VARIANT_LEVEL_03,
  },
  portalExitConfig: {
    8: PortalExitMode.InvertDirection,
  },
  pickupDrops: {},
};
