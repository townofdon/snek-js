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
  layoutV2: 'CiEhKSlpISFaaVhtKC1MbU10V292WCtkIVhNUVVyZlhKZk1YbUptai1jeVp3WlhPYy1NUFl5ZGJaYmRYT1lYTWdMXypMX2FnXz0tKl89LWFQWSs9WGRiWmJkTytZWE1YLWM9Sj1jLWptSm1NZlhKZk1yVVFvUCtkIVhXdE1YbSgtTG1NISFaaSEhKSlpfDQ1N3xSSUdIVHxzbmVrc3F1ZWV6ZXw5NjAwUzZTMlNTMnwwLngzUzAuNHwjMTVDMkNCTjExOURBNHAyMzc1OE4yRTRBNzZ%252BcDcyQzNGfk40QzgyQTlOM0Y2QzhETkZGQjQxRk5GRkM4NTdORkZERDk5fGxsbHgxMnx4U1NTUzFmUFBYKD1oLSogIEo9WFp3Wk9LLCcsJ0wtPU1YCk4tI09YeVhYUVpoLUw9ZEFBQUFBQWQ9KC1aClMwfFVWQl9kIVhkd3dkIVhkX0JWCldNWG0rWFopKVpYK21NWUtfK19LWmRkYSs9Kj1MS1gpCmMqKiogZiFQZylYSz1MKj0raC0tLS0taSEhCmpNT2ZYWndaZk9NWGwxLTEtMS1tKExvZmQrUHd3cE4xNjE5MjVOMnJQX2hMSihfWE10T2ZQWFpmUE93dnZ4MXx5PVB%252BTjFGMjMzMwF%252BeXh3dHJwb21samloZ2ZjYVpZV1VTUVBPTk1MS0oqKCFf',
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
