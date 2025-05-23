import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, TitleVariant } from "../types";
import { getCoordIndex2, toTime } from "../utils";
import { SECRET_LEVEL_10 } from "./bonusLevels/secretLevel10";

const name = 'metro'

export const LEVEL_03: Level = {
  id: 'C03',
  name,
  timeToClear: 1000 * 60 * 1.3,
  parTime: toTime({ minutes: 0, seconds: 54 }),
  applesToClear: 50,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXX~~=-=     =-=     =-= ~~XXX
XXX~ =-=     =-=     =-=  ~XXX
X+_  =-=   ~~XXX~~   =-=   _+X
X+-  =-= ~~XXXXXXX~~ =-=   -+X
X+-  =-= XXXXXXXXXXX =-=   -+X
X+-  =-=     =-=     =-=   -+X
X+-  =-=    O=-=     =-=   -+X
X+_~ =-=     =-=     =-=  ~_+X
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
X+_~ =-=     =-=     =-=  ~_+X
X+-  =-=     =-=     =-=   -+X
X+-  =-=     =-=     =-=   -+X
X+-  =-= XXXXXxXXXXX =-=   -+X
X+-  =-= ~~XXXuXXX~~ =-=   -+X
X+-  =-=   ~~XxX~~   =-=   -+X
X+_  =-=     =-=     =-=   _+X
XXX~ =-=     =-=     =-=  ~XXX
XXX~~=-=     =-=     =-= ~~XXX
XXXXXXXXXXXXXXJXXXXXXXXXXXXXXX
`,
  colors: getExtendedPalette(PALETTE.atomic),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.transient,
  titleVariant: TitleVariant.Yellow,
  nextLevelMap: {
    [getCoordIndex2(14, 0)]: SECRET_LEVEL_10,
    [getCoordIndex2(14, 29)]: SECRET_LEVEL_10,
  },
  pickupDrops: {},
};
