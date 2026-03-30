import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { TUTORIAL_LEVEL_11 } from "../campaign/tutorialLevel11";
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
  // layoutV2: `CmZXTGZaV0xpeVcqMFZrbC1PVVVWMVNTUVhNV1lZeldNWFFLY0tvS3dLUyoxbFVVbGxsVjAqeVpLaWZmS1cKfDQzNHxSSUdIVHxtZXRyb3RlcXVlMnw4NDAwYTdhMWFhM3wwLjc1fGEwLjg5fCM4M0VDRDNOMjFENEFBTjJDMkEzOE5DQkNEQ0RORDJENEQ0aDczNDQ2TjQ5NDU1RWg0M0Y0N040RTY5N0NORTFBQTUxTkRDOTkyRU5FRENCOTZ8YmJiMXwxNCFQKHd2UCB2IGNQKCpYClhKLCdLV1hNcGpzTi0jTyghKF9rUD1uUSpYcGNnWHhYZ3dzWCpTKktjS3hLd0tVLSghKC1rVl9KakpfV1hYemRkTWRkWlcqV2crbigoYTB8YjEtMS0xLWMpIGZLS0tLZ0pKaE40MDNENTJOM2lXKChQZ0pXKmogISBrMyozbF9Pbi09cCtfc18rdiggdygpeVdnIWd6WQoBenl3dnNwbmxramloZ2ZjYmFaWVdWVVNRUE9OTUtKKikoIV8%253D`,
  layoutV2: 'VVlsTFZLWVpMa24hbktoMFMzY2h5Ywp2My1Rdgp2V3ZoV2NoM1MxY01NT3pKemFhYWJWSnpPS1hqbG9zTWkxX1FDaVdDYldWYnlWYnlWaXlDaTNTMENVbiFuWkNrWWxDVktZSwp8NDM0fFJJR0hUfG1ldHJvdGVxdWUyfDg0MDBmN2YxZmYzfDAuNzV8ZjAuODl8IzgzRUNEM04yMUQ0QUFOMkMyQTM4TkNCQ0RDRE5EMkQ0RDRwMzczNDQ2TjQ5NDU1RXA0RTY5N0NOMzQzRjQ3TkUxQUE1MU5EQzk5MkVORURDQjk2fGdnZzF8MTR8MCFQKCgpKCBQICggIGpQKCosJ0orX3dfK0tYWFhNVVhqbHhzTi0jT2JWK19qblZ4Vm4oKV8regpQPX5RKCEoXzNTXyp3Kl9VCktXMy0oISgtM1lsektaS1VuK34oKFhWYQpkZEpkZGIKVmYwfGcxLTEtMS1oCmNpCkNqKSBrVlgoKFBuKktVbFhYVm4qKnBONDAzRDUyTnNWWFgoKUtYdyAhIHkzX1F6VlZ%252BLT0Bfnp5d3NwbmxramloZ2ZiYVpZV1VTUVBPTk1LSiopKCFf',
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
  pickupDropsByFrame: {
    35: { likelihood: 1, type: ItemDropType.Invincibility },
    60: { likelihood: 1, type: ItemDropType.Invincibility },
    100: { likelihood: 1, type: ItemDropType.Invincibility },
    120: { likelihood: .5, type: ItemDropType.Invincibility },
  },
};
