import Color from "color";
import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, PortalExitMode } from "../types";

const name = 'quantum mirror'

export const LEVEL_15: Level = {
  name,
  timeToClear: 1000 * 60 * 1.7,
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.25,
  layout: `
XXX++++++++X__XXXXXXXXXXXXXXXX
XXX91111111X++XXXXXXXXXXXXXXXX
XX~~------~~XX              XX
XX~~------~~XX              XX
+5  ======~~X2--            XX
+5--=-==-=~~X2------=-  -=--_D
+5--==--==~~X2--------  ----_D
+5--==--==~~X2--------  ----_D
+5--=-==-=~~X2------=-  -=--_D
+5  ======~~X2--            XX
+5  ------  X2              XX
XX  ------  XX              XX
XX~~------~~XX              XX
XX~~------~~DDDDDXXXXXXXXXXX+_
XX~~------~~DaaaDXX44444444X+_
_+X44444444XDa~aD~~~------~~XX
_+XXXXXXXXXXDD~DD~~~------~~XX
XX~~~~    ~~~~~XX~~~------~~XX
XX~           ~XX~~ ------ ~XX
XX~            5X~~ ------ ~2+
XX   O       --5X~~ ====== ~2+
D_--=-  -=-----5X~~ =-==-=--2+
D_----  -------5X~~ ==--==--2+
D_----  -------5X~~ ==--==--2+
D_--=-  -=-----5X~~ =-==-=--2+
XX           --5X~~~======~~2+
XX~           ~XX~~~------~~XX
XX~~~       ~~~XX~~~------~~XX
XXXXXXXXXXXXXXX++XX11111119XXX
XXXXXXXXXXXXXXX__XX++++++++XXX
  `,
  colors: {
    ...PALETTE.boxcar,
    barrier: Color(PALETTE.boxcar.barrier).desaturate(0.45).hex(),
    barrierStroke: Color(PALETTE.boxcar.barrierStroke).darken(0.15).desaturate(0.45).hex(),
    background: PALETTE.darkStar.background,
    deco1: PALETTE.darkStar.deco1,
    deco1Stroke: PALETTE.darkStar.deco1Stroke,
    deco2: PALETTE.darkStar.deco2,
    deco2Stroke: PALETTE.darkStar.deco2Stroke,
  },
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
};
