import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { SECRET_LEVEL_10 } from "../bonusLevels/secretLevel10";

const name = 'metro'

export const LEVEL_03: Level = {
  id: 'C03',
  name,
  timeToClear: 1000 * 60 * 1.3,
  parTime: toTime({ minutes: 0, seconds: 55 }),
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
  layoutV2: 'Y25ubm5WaEtTemxmV1hTd1BLYktzKWtYYnFYKVlZX2hXWE5OVWlNYmJaWlppTWJiVU5OU19oV1hTWVlrdnh2cSl3UFhYdnV2WFhzKX4hUHZ4dnMoKXpRZldYY2hWbnFYSm5uSwp8MjIyfFJJR0hUfG1ldHJvfDc4MDAwfDUwYTBhMC43NXwwfDF8I0YyMDY1Q09BRjA0NDNqQjk2RDQwT0NCOEM2N3BqNjEyRTUzcE9GRkNGOUNPRkZCMDVDT0E0RDRCNE82NkI3ODFPODJDNDk4fGdnZzFhMWZMKCggIClmLStYUyosJ3FYWEw9LT1NeVEhV05jWGZLYksoIXFPLSNQIHNRISghKFMKWCtVaXlsIVdiYlZLY3NMKCghKCBMUEtjV18rWX5RKVoKZGRNZGRhfDN8YwpLZiEgZzEtMS0xLWgqUSEqaQpiYmpPM0IxQzMyT2t3IHFsIVBYYlhzKG5LS3BPNTMyNzQ3cUtYcyoqdy0oTHkrX3pfIH4tIAF%252Benl3c3FwbmxramloZ2ZjYVpZV1ZVU1FQT05NTEsqKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.atomic),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.transient,
  titleVariant: TitleVariant.Yellow,
  nextLevelMap: {
    [getCoordIndex2(14, 0)]: SECRET_LEVEL_10,
    [getCoordIndex2(14, 29)]: SECRET_LEVEL_10,
  },
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
  },
};
