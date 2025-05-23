import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, PickupType, PortalExitMode, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { TUTORIAL_LEVEL_11 } from "../tutorialLevel11";
import { SECRET_LEVEL_10 } from "./secretLevel10";

const name = 'metroteque'

export const VARIANT_LEVEL_03: Level = {
  id: 'C203',
  name,
  timeToClear: 1000 * 60 * 1.4,
  parTime: toTime({ minutes: 1, seconds: 10 }),
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
  layoutV2: `CmZXTGZaV0xpeVcqMFZrbC1PVVVWMVNTUVhNV1lZeldNWFFLY0tvS3dLUyoxbFVVbGxsVjAqeVpLaWZmS1cKfDQzNHxSSUdIVHxtZXRyb3RlcXVlMnw4NDAwYTdhMWFhM3wwLjc1fGEwLjg5fCM4M0VDRDNOMjFENEFBTjJDMkEzOE5DQkNEQ0RORDJENEQ0aDczNDQ2TjQ5NDU1RWg0M0Y0N040RTY5N0NORTFBQTUxTkRDOTkyRU5FRENCOTZ8YmJiMXwxNCFQKHd2UCB2IGNQKCpYClhKLCdLV1hNcGpzTi0jTyghKF9rUD1uUSpYcGNnWHhYZ3dzWCpTKktjS3hLd0tVLSghKC1rVl9KakpfV1hYemRkTWRkWlcqV2crbigoYTB8YjEtMS0xLWMpIGZLS0tLZ0pKaE40MDNENTJOM2lXKChQZ0pXKmogISBrMyozbF9Pbi09cCtfc18rdiggdygpeVdnIWd6WQoBenl3dnNwbmxramloZ2ZjYmFaWVdWVVNRUE9OTUtKKikoIV8%253D`,
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
  nextLevel: TUTORIAL_LEVEL_11,
  nextLevelMap: {
    [getCoordIndex2(14, 0)]: SECRET_LEVEL_10,
    [getCoordIndex2(14, 29)]: SECRET_LEVEL_10,
  },
  pickupDrops: {
    35: { likelihood: 1, type: PickupType.Invincibility },
    60: { likelihood: 1, type: PickupType.Invincibility },
    100: { likelihood: 1, type: PickupType.Invincibility },
    120: { likelihood: .5, type: PickupType.Invincibility },
  },
};
