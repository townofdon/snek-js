import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack } from "../types";
import { toTime } from "../utils";

const name = 'sneksqueeze';

export const LEVEL_11: Level = {
  id: 'C11',
  name,
  timeToClear: 1000 * 60 * 1.6,
  parTime: toTime({ minutes: 0, seconds: 48 }),
  applesToClear: 60,
  numApplesStart: 20,
  // disableAppleSpawn: true,
  snakeStartSizeOverride: 2,
  growthMod: 0.1,
  extraHurtGraceTime: 30,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X=-------==--------==-------=X
X=XXXXXXXXXXXXDDXXXXXXXXXXXX=X
X=-------=+XDDXXDDX+=-------=X
XXXXXXXXXD+XXXXXXXX+DXXXXXXXXX
DD-------==DaaaaaaD==-------DD
XX_DXXXXXXXXDXXXXDXXXXXXXXD_XX
XX_------==XDDXXDDX==------_XX
XXXXXXXXXX=XDDXXDDX=XXXXXXXXXX
X=-------==XDDXXDDX==-------=X
X=XXXXXXXXXXDDXXDDXXXXXXXXXX=X
X-       =XXDDXXDDXX=       -X
XX~~_+_~~=XXdXddXdXX=~~_+_~~XX
XX~~=-=  =+-=_  -=_+=  =-=~~XX
XX~~=-=O =+_=-  _=-+=  =-=~~XX
XX~~_+_~~+=XdXddXdX=+~~_+_~~XX
X-       ==XDDXXDDX==       -X
X=XXXXXXXXXXDDXXDDXXXXXXXXXX=X
X=-------==XDDXXDDX==-------=X
XXXXXXXXXX=XDDXXDDX=XXXXXXXXXX
XX_------==XDDXXDDX==------_XX
XX_DXXXXXXXXDXXXXDXXXXXXXXD_XX
DD-------==DaaaaaaD==-------DD
XXXXXXXXXD+XXXXXXXX+DXXXXXXXXX
X=-------=+XDDXXDDX+=-------=X
X=XXXXXXXXXXXXDDXXXXXXXXXXXX=X
X=-------==--------==-------=X
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  // colors: PALETTE.hospital,
  // colors: PALETTE.atomic,
  colors: getExtendedPalette(PALETTE.stonelair),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.stonemaze,
  globalLight: 0.4,
  pickupDrops: {},
};
