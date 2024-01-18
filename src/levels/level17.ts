import Color from "color";
import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../types";

const name = 'TOURIST'

export const LEVEL_17: Level = {
  name,
  timeToClear: 1000 * 60 * 3.0,
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
X_X            --            X
X_X=       ~~X~__~X~~       =X
X_X==      ~XXLLLLXX~      ==X
X_XXXX     XXXLLLLXXX     XXLX
XdJKLd-----_LLaaaaLL_-----dKlX
XdJKLd-----_LLaaaaLL_-----dK_X
XXXXXX     XXXLLLLXXX     XXLX
X8X==      ~XXLLLLXX~      ==X
X_X=       ~~X~__~X~~       =X
X_X            --            X
X_X    O       --            X
X_X       ===  --  ===       X
X_X   === =JJXXXXXXJJ= ===   X
d_X   dd=-=JJX5XX6XJJ=-=dd   X
d_X   dd=-=X_X_XX_X_X=-=dd   X
XXX   === =X_X_XX_X_X= ===   X
XXX       =X_X_XX_X_X=       X
XXX        X_X_XX_X_X        X
XXX        X1X_j__X3X        X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: {
    ...PALETTE.panopticon,
    apple: PALETTE.violetSunset.apple,
    appleStroke: PALETTE.violetSunset.appleStroke,
    barrier: PALETTE.scienceLab.barrier,
    barrierStroke: PALETTE.scienceLab.barrierStroke,
    // door: PALETTE.panopticon.barrier,
    // doorStroke: PALETTE.panopticon.barrierStroke,
    // door: Color(PALETTE.scienceLab.doorStroke).darken(0.0).saturate(0.6).hex(),
    // doorStroke: Color(PALETTE.scienceLab.doorStroke).darken(0.0).saturate(0.6).hex(),
    door: PALETTE.boxcar.door,
    doorStroke: PALETTE.boxcar.doorStroke,
    // barrier: Color(PALETTE.boxcar.barrier).lighten(0.2).desaturate(0.35).hex(),
    // barrierStroke: Color(PALETTE.boxcar.barrierStroke).lighten(0.2).darken(0.15).desaturate(0.35).hex(),
    // background: PALETTE.darkStar.background,
    // deco1: PALETTE.darkStar.deco1,
    // deco1Stroke: PALETTE.darkStar.deco1Stroke,
    // deco2: PALETTE.darkStar.deco2,
    // deco2Stroke: PALETTE.darkStar.deco2Stroke,
  },
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
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.woorb,
};
