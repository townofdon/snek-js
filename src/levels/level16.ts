import Color from "color";
import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../types";

const name = 'bait&switch'

export const LEVEL_16: Level = {
  name,
  timeToClear: 1000 * 60 * 3.0,
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
  pickupDrops: {},
};
