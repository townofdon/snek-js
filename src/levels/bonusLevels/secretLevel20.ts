import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { LEVEL_10 } from "../campaign/level10";
import { VARIANT_LEVEL_10 } from "./variantLevel10";

const name = 'secret area 5-2';

export const SECRET_LEVEL_20: Level = {
  id: 'C320',
  type: LevelType.Level,
  name,
  timeToClear: Infinity,
  parTime: toTime({ minutes: 0, seconds: 40 }),
  applesToClear: 65,
  applesModOverride: 1.5,
  disableAppleSpawn: true,
  numApplesStart: 0,
  appleSlowdownMod: 0.75,
  extraHurtGraceTime: 30,
  // snakeStartSizeOverride: 150,
  growthMod: 0,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXxAAxx=--          --=xxAAXXX
XXxXXXX-XXXXXXXXXXXXXX-XXXxXXX
XXxXXX  X1 k        1X  XXxXXX
XX      XXXXX KK XXXXX     XXX
X  XXXXXX     KK     XXXXX  XX
X  XAAAAA XXXXDDXXXX AAA X  XX
XKXXAXXXXXXXX  j XXXXXXX X   X
X   AX AAAA L    L AAA X XX  X
X  XXX XXXXXX XX XXXXX X  X  X
X  X L X AAAA XX AAA X Xx X  X
XA X XLX XXXXXXXXXXX X Xx XX X
XA XlXLX X AAA AAA X XLXx  XAX
X  X J X X XXXXXXX X ALXxXAXAx
X  XXX X X X   O X XXALXAXAXAD
X   XXAX X XXXXX X XXALXAXAXAD
X X  XAX X  AAA  X X ALXxXAXAx
XLXXAXAX XXXXXXXXX X XLXx  XAX
XAXXAXAX AAAA  AAA X X Xx XX-X
XAXXAXAXXXXXXXXXXXXX X Xx X-=X
XAXX X        XX     X X  X-=X
X XX XXXXXXXXAAAAXXXXX X XX-=X
XA X AAAA   LLLLLL     X X=-=X
XA XXXXXXXXXXXXXXXXXXXXX X=-=X
X  AAA AA AAA XX AAA AAA X=-=X
XXXXXXXXXXXXd-XX-dXXXXXXXX=-=X
-==K=-      d----d     -=K- -X
-==K=-  AAA dddddd AAA -=K- -X
-==K=-      AAAAAA     -=K- -X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  layoutV2: 'Ck9PT09PKVh4QUF4eD0tLVNTIS1FeHhBQSgpWHhvLU9PUC0oeCgpWHgoaDEga1NTMVghUHgoKVhTIW92IEtLIHZvUydQKSFPUyBLS1MnbyFQKWhVQUEnKHZ2byonIVApS3ZYQU9QIWonTychJykhcVgqQXVTTCpWWGgpISgnKFBtJ28naGgpaHUnKkFtKlZ4J2h%252BVkxYJ09vVngnWCd%252BJ2xYTFgnKipWTFh4IVcpaCBKVidQdnZQWiEoVidTXyEnV1ZQdnZfIHYhVychVWhaTFBBVydvdnZQVkxYeCFXflBBVypBIVVWJ3gnWC1YflBBWEFPT1hWeCdFWH5QJ1NTdnZTVmhFWCknWCdPWFVBKFBWWEVYficqQSF1TExMTExTVll%252BJ09PT1AnWSkhVXFBKm0qKidZCnZidk9QdmQtYmItZHZPWFkKUVNkLS0tLWRTTlFVIGRkZGRkZCpOUVNVVVNOdmJ2T09PTygKfDQzNXxSSUdIVHxzZWNyZXQgYXJlYSA1LTJ8SW5maW5pdHl8NjV3fDF3encwei4yfCMxNUMyQ0JNMTE5REE0cDJDMkM2M00zMzMzNzFNMTMxMzJBcDE5MTkzOE0xMzEzMkFNNEIzRjcyTTU2NDg4NE1GRkI0MUZNRkZDODU3TUZGREQ5OXxnZ2cxfDEweiEgICcgWChQWCkKWCogVUUtPU0tI04gRUstIC1YCk8oKFBYWFFFPUs9LSFTISFVQUFBVicnV1hBWFk9RVhaJ3FMWHhXQXgpX1Z2QUx2QXZBdkFkKWcxLTEtMS1oIVhtIGJibyhYcE0wRDBEMUNNcSBBdSBMd3wzenwwfilBAX56d3VxcG9taGdfWllXVlVTUVBPTk1FKikoJyFf',
  colors: getExtendedPalette(PALETTE.hospital),
  showTitle: true,
  showQuoteOnLevelWin: false,
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
  nextLevelMap: {
    [getCoordIndex2(29, 13)]: VARIANT_LEVEL_10,
    [getCoordIndex2(29, 14)]: VARIANT_LEVEL_10,
    [getCoordIndex2(29, 15)]: VARIANT_LEVEL_10,
    [getCoordIndex2(29, 16)]: VARIANT_LEVEL_10,
  },
  musicTrack: MusicTrack.creeplord,
  globalLight: 0.2,
  nextLevel: LEVEL_10,
};
