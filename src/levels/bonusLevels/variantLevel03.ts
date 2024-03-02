import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { SECRET_LEVEL_10 } from "./secretLevel10";
import { WARP_ZONE_01 } from "./warpZone01";

const name = 'metroteque'

export const VARIANT_LEVEL_03: Level = {
  name,
  timeToClear: 1000 * 60 * 1.4,
  applesToClear: 100,
  numApplesStart: 10,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXXLXXXXXXXXXXXXXXX
XXX~~=-=     =-=     =-= ~~XXX
XXX~ =-=     =-=     =-=  ~XXX
X1_  =-=   ~~XxX~~   =-=   _3X
X1-  =-= ~~XXXxXXX~~ =-=   -3X
X1-  =-= XXXXXxXXXXX =-=   -3X
X1-  =-=     =-=     =-=   -3X
X1-  =-=    O=-=     =-=   -3X
X1_~ =-=     =-=     =-=  ~_3X
XXXX =-=   XXXxXXX   =-=  XXXX
XXXX =-=   XXXxXXX   =-=  XXXX
XX+_ =-=   ~~XxX~~   =-=  _+XX
XX+_ =-=     =-=     =-=  _+XX
Dd+_ =-=     =-=     =-=  _+dD
Dd+_ =-=     =-=     =-=  _+dD
Dd+_ =-=     =-=     =-=  _+dD
XX+_ =-=     =-=     =-=  _+XX
XX+_ =-=   ~~XxX~~   =-=  _+XX
XXXX =-=   XXXxXXX   =-=  XXXX
XXXX =-=   XXXxXXX   =-=  XXXX
X3_~ =-=     =-=     =-=  ~_1X
X3-  =-=     =-=     =-=   -1X
X3-  =-=     =-=     =-=   -1X
X3-  =-= XXXXXxXXXXX =-=   -1X
X3-  =-= ~~XXXoXXX~~ =-=   -1X
X3-  =-=   ~~XxX~~   =-=   -1X
X3_  =-=     =-=     =-=   _1X
XXX~ =-=     =-=     =-=  ~XXX
XXX~~=-=     =-=     =-= ~~XXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`,
  colors: getExtendedPalette(PALETTE.gravChamber),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.woorb,
  titleVariant: TitleVariant.GrayBlue,
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
  nextLevel: SECRET_LEVEL_10,
  nextLevelMap: {
    [getCoordIndex2(14, 0)]: WARP_ZONE_01,
    [getCoordIndex2(14, 29)]: WARP_ZONE_01,
  }
};
