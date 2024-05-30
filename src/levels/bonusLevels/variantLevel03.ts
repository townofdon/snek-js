import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, PickupType, PortalExitMode, TitleVariant } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_03 } from "../level03";
import { TUTORIAL_LEVEL_10 } from "../tutorialLevel10";
import { SECRET_LEVEL_10 } from "./secretLevel10";

const name = 'metroteque'

export const VARIANT_LEVEL_03: Level = {
  name,
  timeToClear: 1000 * 60 * 1.4,
  applesToClear: 70,
  numApplesStart: 10,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXXLXXXXXXXXXXXXXXX
XXX~~=-=     =-=     =-= ~~XXX
XXX~ =-=     =-=     =-=  ~XXX
X1_  =-=   ~~XxX~~   =-=   _1X
X1-  =-= ~~XXXxXXX~~ =-=   -1X
X1-  =-= XXXXXxXXXXX =-=   -1X
X1-  =-=     =-=     =-=   -1X
X1-  =-=    O=-=     =-=   -1X
X1_~ =-=     =-=     =-=  ~_1X
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
X3_~ =-=     =-=     =-=  ~_3X
X3-  =-=     =-=     =-=   -3X
X3-  =-=     =-=     =-=   -3X
X3-  =-= XXXXXxXXXXX =-=   -3X
X3-  =-= ~~XXXoXXX~~ =-=   -3X
X3-  =-=   ~~XxX~~   =-=   -3X
X3_  =-=     =-=     =-=   _3X
XXX~ =-=     =-=     =-=  ~XXX
XXX~~=-=     =-=     =-= ~~XXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`,
  colors: getExtendedPalette(PALETTE.gravChamber),
  showTitle: true,
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
    [getCoordIndex2(14, 0)]: SECRET_LEVEL_10,
    [getCoordIndex2(14, 29)]: SECRET_LEVEL_10,
  },
  recordProgressAsLevel: LEVEL_03,
  pickupDrops: {
    35: { likelihood: 1, type: PickupType.Invincibility },
    60: { likelihood: 1, type: PickupType.Invincibility },
    100: { likelihood: 1, type: PickupType.Invincibility },
    120: { likelihood: .5, type: PickupType.Invincibility },
  },
};
