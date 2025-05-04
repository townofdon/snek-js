import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, TitleVariant } from "../types";
import { getCoordIndex2, toTime } from "../utils";
import { WARP_ZONE_01 } from "./bonusLevels/warpZone01";

const name = 'turnaround';

export const TUTORIAL_LEVEL_10: Level = {
  id: 'C110',
  name,
  timeToClear: Infinity,
  parTime: toTime({ minutes: 0, seconds: 5 }),
  applesToClear: 10,
  numApplesStart: -1,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 20,
  growthMod: 0,
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
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XX~~~O~~~~~aaaaaaaaaaaaaaaaaaX
D~~~~~~~~~~~~~~~~~~~~~~~~~~~~X
XXxxXXXXXxxXxxXXxxXxxXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxxxxxxxxXDDXXDDXxxXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXxxXDDXXDDXxxXXXXXXXXX
XXXXXXXXX==X++XX++X++XXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.hospital),
  showTitle: true,
  extraLoseMessages: [
    ["Pst... Press down-left real fast next time.", (state, stats) => stats.applesEatenThisLevel >= 5],
    ["Need to eat more apples, dawg.", (state, stats) => stats.applesEatenThisLevel < 5],
  ],
  disableNormalLoseMessages: true,
  musicTrack: MusicTrack.aqueduct,
  titleVariant: TitleVariant.Gray,
  globalLight: 0.5,
  nextLevelMap: {
    [getCoordIndex2(9, 29)]: WARP_ZONE_01,
    [getCoordIndex2(10, 29)]: WARP_ZONE_01,
    [getCoordIndex2(12, 29)]: WARP_ZONE_01,
    [getCoordIndex2(13, 29)]: WARP_ZONE_01,
    [getCoordIndex2(16, 29)]: WARP_ZONE_01,
    [getCoordIndex2(17, 29)]: WARP_ZONE_01,
    [getCoordIndex2(19, 29)]: WARP_ZONE_01,
    [getCoordIndex2(20, 29)]: WARP_ZONE_01,
  },
};
