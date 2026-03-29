import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType } from "../../types";
import { toTime } from "../../utils";

const name = 'sneksqueeze';

export const LEVEL_11: Level = {
  id: 'C11',
  name,
  timeToClear: 1000 * 60 * 1.6,
  parTime: toTime({ minutes: 0, seconds: 50 }),
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
  layoutV2: 'CiEhdGghIW1oWChLKC1LKFlwS0xsdlgreExQU3JnWCpnaiooS0xOZ09nTnlYT1hOWi1MUVU9UWRibWJkWE5VWExhS18pS19XYV89LSlfPS1XUVV%252BWGRibWJkTitVWHkqPVotTE5nT2dOaiooS0xnWCpnTHJTUGxRK3hqcFkoLUsoS0whIW1oISF0aHw0NTd8UklHSFR8c25la3NxdWVlemV8OTYwMGM2YzJjYzJ8MC4xfDNjMC40fCMxNUMyQ0JNMTE5REE0bzIzNzU4TTJFNEE3NndvNzJDM0Z3TTRDODJBOU0zRjZDOERNRkZCNDFGTUZGQzg1N01GRkREOTl8aWlpMXwxMnwxZ1FRWCg9Zi0pICAqPU9OSiwnLCdLLT1MWApNLSNOWD1PWG10bVBtZi1LPWRBQUFBQUFkPSgtbQpRWFhTVkJfeGR0dHhkX0JWClVKXytfSld%252BKT1LSlh2CllLTE5nUVhtZ1FOalopKSkgYXZYSj1LKT0rYzB8Zi0tLS0tZyFRaCEhCmkxLTEtMS1qTFgoS2xnZCtRdHRtZGRvTTE2MTkyNU0ycCtPWCsoclFfZksqKF9YTHR2dndNMUYyMzMzeGQhWHlMWC1aPX4rPQF%252BeXh3dHJwb21samloZ2ZjYVpZV1VTUVBPTk1MS0oqKSghXw%253D%253D',
  // colors: PALETTE.hospital,
  // colors: PALETTE.atomic,
  colors: getExtendedPalette(PALETTE.stonelair),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.stonemaze,
  globalLight: 0.4,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: false,
  },
};
