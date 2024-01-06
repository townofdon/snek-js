import Color from "color";
import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../types";

const name = 'gill bates'

export const LEVEL_16: Level = {
  name,
  timeToClear: 1000 * 60 * 1.3,
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.2,
  layout: `
XXXXXXXXXXXX++KK++XXXXXXXXXXXX
X~aaaa~dd~1X++KK++X3~dd~aaaa~X
X~XXXXXXXXXXXXJJXXXXXXXXXXXX~X
X~XX+X+__+X+XXJJXX+X+__+X+XX~X
X~XX+X+__+X+XX__XX+X+__+X+XX~X
X~XXXXXXXXXXXX__XXXXXXXXXXXX~X
X~X           --           X~X
X~X XXXXXXXX==--==XXXXXXXX X~X
X~X XXX~d~XX  --  XX~d~XXX X~X
X~X X3+_j___-=--=-___k_+1X X~X
X~X XXX~d~XX  --  XX~d~XXX X~X
X~X XXXXXXXX==--==XXXXXXXX X~X
X~X           --           X~X
X~X           --           X~X
XaX=-X~       --       ~X-=XaX
XaX=-XX-=     --     =-XX-=XaX
XaX=-X~ -     --     - ~X-=XaX
X~X  -  -     --     -  -  X~X
X~X  =  - ~X  --  X~ -  =  X~X
X~X     =-XX-=--=-XX-=     X~X
X~X  =  - ~X  --  X~ -  =  X~X
X~X  -  -     --     -  -  X~X
XaX=-X~ -     --     - ~X-=XaX
XaX=-XX-=     --     =-XX-=XaX
XaX=-X~       --       ~X-=XaX
X~X           --           X~X
X~X           --           X~X
X~XXXXXXXXXdd+__+ddXXXXXXXXX~X
X~~~~~~~~~~~~~~~~~~~~~~~~~~~~X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: {
    ...PALETTE.boxcar,
    barrier: Color(PALETTE.boxcar.barrier).lighten(0.2).desaturate(0.35).hex(),
    barrierStroke: Color(PALETTE.boxcar.barrierStroke).lighten(0.2).darken(0.15).desaturate(0.35).hex(),
    background: PALETTE.darkStar.background,
    deco1: PALETTE.darkStar.deco1,
    deco1Stroke: PALETTE.darkStar.deco1Stroke,
    deco2: PALETTE.darkStar.deco2,
    deco2Stroke: PALETTE.darkStar.deco2Stroke,
  },
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
    2: PortalExitMode.InvertDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
    5: PortalExitMode.SameDirection,
    6: PortalExitMode.SameDirection,
    7: PortalExitMode.SameDirection,
    8: PortalExitMode.SameDirection,
    9: PortalExitMode.SameDirection,
    0: PortalExitMode.SameDirection,
  },
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.moneymaker,
};
