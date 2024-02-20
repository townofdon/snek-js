import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { TUTORIAL_LEVEL_10 } from "../tutorialLevel10";
import { SECRET_LEVEL_10 } from "./secretLevel10";

const name = 'metroteque'

export const VARIANT_LEVEL_03: Level = {
  name,
  timeToClear: 1000 * 60 * 1.4,
  applesToClear: 100,
  numApplesStart: 10,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXX~~=-=     =-=     =-= ~~XXX
XXX~ =-=     =-=     =-=  ~XXX
X1_  =-=   ~~XXX~~   =-=   _3X
X1-  =-= ~~XXXXXXX~~ =-=   -3X
X1-  =-= XXXXXXXXXXX =-=   -3X
X1-  =-=     =-=     =-=   -3X
X1-  =-=    O=-=     =-=   -3X
X1_~ =-=     =-=     =-=  ~_3X
XXXX =-=   XXXXXXX   =-=  XXXX
XXXX =-=   XXXXXXX   =-=  XXXX
XX+_ =-=   ~~XXX~~   =-=  _+XX
XX+_ =-=     =-=     =-=  _+XX
Dd+_ =-=     =-=     =-=  _+dD
Dd+_ =-=     =-=     =-=  _+dD
Dd+_ =-=     =-=     =-=  _+dD
XX+_ =-=     =-=     =-=  _+XX
XX+_ =-=   ~~XXX~~   =-=  _+XX
XXXX =-=   XXXXXXX   =-=  XXXX
XXXX =-=   XXXXXXX   =-=  XXXX
X3_~ =-=     =-=     =-=  ~_1X
X3-  =-=     =-=     =-=   -1X
X3-  =-=     =-=     =-=   -1X
X3-  =-= XXXXXxXXXXX =-=   -1X
X3-  =-= ~~XXXuXXX~~ =-=   -1X
X3-  =-=   ~~XxX~~   =-=   -1X
X3_  =-=     =-=     =-=   _1X
XXX~ =-=     =-=     =-=  ~XXX
XXX~~=-=     =-=     =-= ~~XXX
XXXXXXXXXXXXXXJXXXXXXXXXXXXXXX
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
  nextLevel: TUTORIAL_LEVEL_10,
  nextLevelMap: {
    [getCoordIndex2(14, 29)]: SECRET_LEVEL_10
  }
};
