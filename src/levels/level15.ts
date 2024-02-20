import Color from "color";
import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../types";

const name = 'quantum mirror'

export const LEVEL_15: Level = {
  name,
  timeToClear: 1000 * 60 * 1.3,
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.4,
  layout: `
XXXXXXXXXXXXDDDXXXXXXXXXXXXXXX
XX1111111111DDDXXXXXXXXXXXXXXX
XX  ------~~XXXX~~        ~~XX
XX  ------~~XXXX~          ~XX
XX  ======--7X7-            XX
+X--=-==-=--7X7-----=-  -=-__d
+X--==--==--7X7-------  ----_d
+X--==--==--7X7-------  ----_d
+X--=-==-=--7X7-----=-  -=-__d
XX  ==--==--7X7-            XX
XX  ==--==--7X7-            XX
XX  =-==-=~~XXXX            XX
XX~~======~~XXXX~          ~XX
XX~~------~~DDDDDDXXXXXXXXXX+_
XX~~------~~DaaaaDXXXXXXXXXX+_
_+XXXXXXXXXXDa__aD~~------~~XX
_+XXXXXXXXXXDD++DD~~------~~XX
XX~~~~    ~~~~XXXX~ ======~~XX
XX~          ~XXXX~ =-==-=  XX
XX~           -4X4- ==--==  XX
XX   O        -4X4- ==--==  XX
d__-=-  -=-----4X4--=-==-=--X+
d_----  -------4X4--==--==--X+
d_----  -------4X4--==--==--X+
d__-=-  -=-----4X4--=-==-=--X+
XX           --4X4- ======~ XX
XX~          ~XXXX~~------~ XX
XX~~~       ~~XXXX~~------~ XX
XXXXXXXXXXXXXXXDDD1111111111XX
XXXXXXXXXXXXXXXDDDXXXXXXXXXXXX
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
  musicTrack: MusicTrack.lostcolony,
};
