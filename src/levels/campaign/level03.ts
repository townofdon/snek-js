import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant, PickupType } from "../../types";
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
  layoutV2: 'Zndrcnd3V2lLVXpuZ1lYVXBQS2JLcylwIGtiaylaWl9pWVhOTlZqTVFRYWFhak1RUVZOTlVfaVlYVVpacCBLWHZ4dktYKXBQWFh2dXZYWHMpfiFQdnh2cygpelNnWVhmaVd3a0p3d0sKfDIyMnxSSUdIVHxtZXRyb3w3ODAwMHw1MGMwYzAuNzV8MHwxfCNGMjA2NUNPQUYwNDQzbEI5NkQ0ME9DQjhDNjdxbDYxMkU1M3FPRkZDRjlDT0ZGQjA1Q09BNEQ0QjRPNjZCNzgxTzgyQzQ5OHxoaGgxYzFnTCgoICApZy0rWFUqLCdrWEw9LT1NeVMhWU5mcmdLYksoIXJLTy0jUCBzUyEoIShVClgrVmp5biFZUVFXS2ZzTCgoISggTFBLZllfK1p%252BUylhCmRkTWRkY3wzfGYKS2chIGgxLTEtMS1pKlMhKmoKUVFrS1hYbE8zQjFDMzJPbiFQWGJYcyhwLShMcU81MzI3NDdzKip3S0t5K196XyB%252BLSABfnp5d3NxcG5sa2ppaGdmY2FaWVdWVVNQT05NTEsqKSghXw%253D%253D',
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
  pickupTypes: [
    PickupType.Cabbage,
    PickupType.Cheese,
    PickupType.Carrot,
    PickupType.Burger,
    PickupType.Taco,
    PickupType.Fries,
  ],
};
