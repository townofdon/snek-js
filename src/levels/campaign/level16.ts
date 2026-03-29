import Color from "color";
import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'bait&switch'

export const LEVEL_16: Level = {
  id: 'C16',
  name,
  timeToClear: 1000 * 60 * 3.0,
  parTime: toTime({ minutes: 0, seconds: 55 }),
  applesToClear: 60,
  numApplesStart: 0,
  growthMod: 0.2,
  extraHurtGraceTime: 20,
  snakeStartSizeOverride: 5,
  layout: `
XXXXXXXXXXXX+_KK_+XXXXXXXXXXXX
X~aaaa~~~~1X+_KK_+X3~~~~aaaa~X
X~XXXXXXXXXXXX__XXXXXXXXXXXX~X
X~XX+X+__+X+XXLLXX+X+__+X+XX~X
X~XX+X+__+X+XXLLXX+X+__+X+XX~X
X~XXXXXXXXXXXX__XXXXXXXXXXXX~X
X~X    j      --           X~X
X~X XXXXXXXX==--==XXXXXXXX X~X
X~X-X_~d~~3X  --  X1~~d~_X-X~X
XJX=K+_l____-=--=-____k_+L=XJX
X~X-XXXdXXXX  --  XXXXdXXX-X~X
X~X XXXXXXXX==--==XXXXXXXX X~X
X~X           --           X~X
X~X           --           X~X
XaX=-X~       --       ~X-=XaX
XaX=-XX-=--=O --  =--=-XX-=XaX
XaX=-X~ -     --     - ~X-=XaX
X~X  -  -     --     -  -  X~X
X~X  =  - ~X  --  X~ -  =  X~X
X~X  -  =-XX-=--=-XX-=  -  X~X
X~X  =  - ~X  --  X~ -  =  X~X
X~X  -  -     --     -  -  X~X
XaX=-X~ -     --     - ~X-=XaX
XaX=-XX-=--=  --  =--=-XX-=XaX
XaX=-X~       --       ~X-=XaX
X~X           --           X~X
X~X           --           X~X
X~XXXXXXXXXdd+__+ddXXXXXXXXX~X
X~~~~~~~~~~~~~~~~~~~~~~~~~~~~X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  layoutV2: 'CmUqbUtLbmUqClgoQUFBQVoxWG1LS25YM1pBQUFBWVgoZSpfX2VYWClPWExMWE8pT1hMTFhPKWVYWF9fZVhYKSEhaiEhIWchIU1XLVhfKGQoKDNYIWdYMSgoZChfWC1YWVhKWD1LbWxfX19fLVAtUF9fX19rbkw9WEpYClh1LSpkKlghZypYZCotV1YpVlhZcCFNZ01OfnVVWHV4ZlN4UFhiLVAtUGJYcVN4ZnhYWXB%252BTiFNZ011VVh1VilWKSoqdnZkZG1uZGR2dioqWFlYWlpaWlpaKCgoWWVlZSoKfDQ2MnxSSUdIVHxiYWl0JnN3aXRjaHwxODAwMHI2cjN8cjV8MC4yfDJyMXwjRTc2RjUxUUUyNEQyOHk3NTA1QVEyRjQ0NER6eTAzNDM2elEyQTlEOEZRMkZCMUEyUUY0QTI2MVFFOUM0NkFRRTlEM0E3fG9vbzF8MTh8MyEgICgsJylYWVh1KlhYWE0hISBOdVV2QXZQYlgtUHEhZ1AtUFhiVXBPWCt2bW52K1hQPS1RLSNTeCkhPSEtIHUhZ1goIC0hPSEpVXF2QXYKViEhIU1nISFNVykgKnYqWD1QcT0qWHYqIClZdQpaKCgoKGUqKipmLU0tLU0tZy0tIW0rX25fK28xLTEtMS1wdkF2UFgocS09cjB8dShYeCEtIXlRMUQyMDIwUTN6UTI2MkEyQn4gZiABfnp5eHVycXBvbm1nZmVaWVdWVVNRUE9OTSopKCFf',
  colors: getExtendedPalette({
    ...PALETTE.boxcar,
    barrier: Color(PALETTE.boxcar.barrier).lighten(0.2).desaturate(0.35).hex(),
    barrierStroke: Color(PALETTE.boxcar.barrierStroke).lighten(0.2).darken(0.15).desaturate(0.35).hex(),
    background: PALETTE.darkStar.background,
    deco1: PALETTE.darkStar.deco1,
    deco1Stroke: PALETTE.darkStar.deco1Stroke,
    deco2: PALETTE.darkStar.deco2,
    deco2Stroke: PALETTE.darkStar.deco2Stroke,
  }),
  portalExitConfig: {
    1: PortalExitMode.SameDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
    5: PortalExitMode.SameDirection,
    6: PortalExitMode.SameDirection,
    7: PortalExitMode.SameDirection,
    8: PortalExitMode.SameDirection,
    9: PortalExitMode.SameDirection,
    0: PortalExitMode.SameDirection,
  },
  showTitle: true,
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.slyguy,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: true,
  },
};
