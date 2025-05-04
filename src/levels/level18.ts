import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../types";
import { toTime } from "../utils";

const name = 'computer room'

export const LEVEL_18: Level = {
  id: 'C18',
  name,
  timeToClear: 1000 * 60 * 3.0,
  parTime: toTime({ minutes: 1, seconds: 10 }),
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.15,
  extraHurtGraceTime: 25,
  snakeStartSizeOverride: 5,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXX        X5X__k_X6X        X
XXX        X_X_XX_X_X        X
XXX       =X_X_XX_X_X=       X
XXX   === =X_X_XX_X_X= ===   X
XXX   dd=-=X_X_XX_X_X=-=dd   X
X8X   dd=-=ddX1XX3Xdd=-=dd   X
X_X   === =ddXXXXXXdd= ===   X
X_X       ===  --  ===       X
X_X            --            X
XxX            --            X
XxX=       ~~X~__~X~~       =X
XxX==      ~XXLLLLXX~      ==X
XxXXXX     XXXLLLLXXX     XXLX
XdJKLd-----_LLaaaaLL_-----dKlX
XdJKLd-----_LLaaaaLL_-----dK_X
XXXXXX     XXXLLLLXXX     XXLX
X8X==      ~XXLLLLXX~      ==X
X_X=       ~~X~__~X~~       =X
X_X            --            X
X_X    O       --            X
XxX       ===  --  ===       X
XxX   === =JJXXXXXXJJ= ===   X
dxX   dd=-=JJX5XX6XJJ=-=dd   X
dxX   dd=-=X_X_XX_X_X=-=dd   X
XXX   === =X_X_XX_X_X= ===   X
XXX       =X_X_XX_X_X=       X
XXX        X_X_XX_X_X        X
XXX        X1X_j__X3X        X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette({
    ...PALETTE.panopticon,
    apple: PALETTE.violetSunset.apple,
    appleStroke: PALETTE.violetSunset.appleStroke,
    barrier: PALETTE.scienceLab.barrier,
    barrierStroke: PALETTE.scienceLab.barrierStroke,
    door: PALETTE.boxcar.door,
    doorStroke: PALETTE.boxcar.doorStroke,
  }),
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
    2: PortalExitMode.InvertDirection,
    3: PortalExitMode.InvertDirection,
    4: PortalExitMode.InvertDirection,
    5: PortalExitMode.InvertDirection,
    6: PortalExitMode.InvertDirection,
    7: PortalExitMode.InvertDirection,
    8: PortalExitMode.InvertDirection,
    9: PortalExitMode.InvertDirection,
    0: PortalExitMode.InvertDirection,
  },
  showTitle: true,
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.reconstitute,
};
