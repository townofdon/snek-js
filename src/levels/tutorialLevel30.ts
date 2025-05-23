import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack } from "../types";
import { getCoordIndex2, toTime } from "../utils";
import { WARP_ZONE_03 } from "./bonusLevels/warpZone03";

const name = 'portal';

export const TUTORIAL_LEVEL_30: Level = {
  id: 'C130',
  name,
  timeToClear: 1000 * 60 * 5,
  parTime: toTime({ minutes: 0, seconds: 10 }),
  applesToClear: 49,
  numApplesStart: -1,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 20,
  // growthMod: 0,
  layout: `
XXXXXXXXX++X++XX++X++XXXXXXXXX
XXXXXXXXXXXXDDXXDDXXXXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXXXXDDXXDDXXXXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X aaaaaaaaaaaaaaaaaaa------=1X
X aaaaaaaaaaaaaaaaaaa------=1X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XX===O    aaaaaaaaaaaaaaaaa=1X
X2---     -----------------=1X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X2aaaaa--aaaaa--aaaaa--aaaaaDD
XXXXXXXXXxxXxxXXxxXxxXXXXXxxXX
XXXXXXXXXDDXDDXXDDXDDXXXXXxxXX
XXXXXXXXXDDXDDXXDDXDDXXXXXxxXX
XXXXXXXXXxxXDDXXDDXxxxxxxxxxXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXxxXDDXXDDXxxXXXXXXXXX
XXXXXXXXX++X++XX++X==XXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.mintJulip),
  showTitle: true,
  musicTrack: MusicTrack.aqueduct,
  globalLight: 0.6,
  nextLevelMap: {
    [getCoordIndex2(9, 29)]: WARP_ZONE_03,
    [getCoordIndex2(10, 29)]: WARP_ZONE_03,
    [getCoordIndex2(12, 29)]: WARP_ZONE_03,
    [getCoordIndex2(13, 29)]: WARP_ZONE_03,
    [getCoordIndex2(16, 29)]: WARP_ZONE_03,
    [getCoordIndex2(17, 29)]: WARP_ZONE_03,
    [getCoordIndex2(19, 29)]: WARP_ZONE_03,
    [getCoordIndex2(20, 29)]: WARP_ZONE_03,
  },
};
