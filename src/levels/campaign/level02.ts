import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_03 } from "../bonusLevels/variantLevel03";

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
  layoutV2: 'ZXFYdSotXy1TSnZxWlFpWClYb1ViTlhMUExYVSpRa1gpVwp2Y1hoVlYtIUtWaEtYY3YKVylYa1FVKlhMUExYVSpRb2JiWWIhTlgpWGlabThxdSF5LV8tIXl3eHh4OGV8NDM0fFJJR0hUfHBsYXphfDcyMDBmNHJyMC43NXxmMXwjRUZEOUNFT0UxQjdBM2o4RjM5ODVPQTA0MDk1bmozNjNBNTluTzA3QkVCOE8wOEQ5RDJPNzhENUUzTzQ1QzVEOU85OERGRUF8Z2dnZzAtMXwyfDEhICAgKC0tLS0pClhKLWIhWSotSm0qYncrK0stPUwKZHMrdHMtZH5xcXFOLCdPLSNQZEtWKEs9LVhjWEtoLUtWLWRRbVhTKiBVYmItLS1iVj09V3Z0aHMoLUsrWHZZSy0hWlFYdS0qSy1TLUp2WGIhIWV%252BTU1NTQpmMHxnMS0xLWg9KGl1LVNZYi1KdmpPMjUyODNET2tOeSpZU05ObVgKbk8yRjMyNENveVNZISpRcVhYcmYzfHMoKCh0WCt1dkp3IEp5TiF%252BCk0Bfnl3dXRzcnFvbm1ramloZ2ZlYlpZV1ZVU1FQT05NTEtKKikoIV8%253D',
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
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
  },
};
