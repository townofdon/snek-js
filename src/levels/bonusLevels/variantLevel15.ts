import Color from "color";
import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../../types";
import { TUTORIAL_LEVEL_40 } from "../tutorialLevel40";

const name = 'phased reality'

export const VARIANT_LEVEL_15: Level = {
  name,
  timeToClear: 1000 * 60 * 1.3,
  applesToClear: 1,
  numApplesStart: 30,
  growthMod: 0.8,
  disableWallCollision: true,
  layout: `
xxxxxxxxxxxxDDDxxxxxxxxxxxxxxx
xxXXXXXXXXXXDDDxxxxxxxxxxxxxxx
xx  ------~~xxxx~~        ~~xx
xx  ------~~xxxx~          ~xx
xx  ======--XAX-            xx
+x--=-==-=--XAX-----=-  -=-__x
+x--==--==--XAX-------  ----_x
+x--==--==--XAX-------  ----_x
+x--=-==-=--XAX-----=-  -=-__x
xx  ==--==--XAX-            xx
xx  ==--==--XAX-            xx
xx  =-==-=~~xxxx            xx
xx~~======~~xxxx~          ~xx
xx~~------~~xxxxxxxxxxxxxxxx+_
xx~~------~~xaaaaxxxxxxxxxxx+_
_+xxxxxxxxxxxa__ax~~------~~xx
_+xxxxxxxxxxxx++xx~~------~~xx
xx~~~~    ~~~~xxxx~ ======~~xx
xx~          ~xxxx~ =-==-=  xx
xx~           -XAX- ==--==  xx
xx  aO        -XAX- ==--==  xx
x__-=-  -=-----XAX--=-==-=--x+
x_----  -------XAX--==--==--x+
x_----  -------XAX--==--==--x+
x__-=-  -=-----XAX--=-==-=--x+
xx           --XAX- ======~ xx
xx~          ~xxxx~~------~ xx
xx~~~       ~~xxxx~~------~ xx
xxxxxxxxxxxxxxxDDDXXXXXXXXXXxx
xxxxxxxxxxxxxxxDDDxxxxxxxxxxxx
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
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.backrooms,
  globalLight: 0.5,
  nextLevel: TUTORIAL_LEVEL_40,
};