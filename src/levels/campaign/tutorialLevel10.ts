import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { WARP_ZONE_01 } from "../bonusLevels/warpZone01";
import { LEVEL_01_D } from "./level01d";

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
XXddXXXXXxxXxxXXxxXxxXXXXXXXXX
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
  layoutV2: 'eUxxYydOU1BleEVjVSpPbCpqak9ndnhjYydPKU1YZlEhUWJYWnNleEooKF9fX19kTiFtKHAhUWJ6ZS1KKHN2KU0gZnAhLU9YWikqLUooKil6V3opKi0hcChRfiopTVdNKU9YeFFKKE8qCnpiKGZwIWMKZF9fX19fUUogVE92KXNYYlFmUSFYTSljJ1BnKmpPVVRVTypsTypVY1UqT1pOU1BOU3F2UHlYKFAKfDU3NHxSSUdIVHx0dXJuYXJvdW5kfDMwMDAwMHwyMnwtaWkyNVlZWS41fCMxNUMyQ0JLMTE5REE0aDJDMkM2M0szMzMzNzFraDE5MTkzOGtLNEIzRjcySzU2NDg4NHdCNDFGd0M4NTd3REQ5OXxWVlZpNFl%252BbSAnc3MoICApWgpYeCp2WkVYVUpmUSBwSy0jTFgrK01YWlpOCmNPeHhQY1hRLS1TRUVYRUVVZGRWMS0xLTEtVyhwIFEoUSEtWXwwWnhYYycnZQoqT2YhUShnKilQRVhFUFgpaEswRDBEMUNLaTF8ak9VeFVrSzEzMTMyQWwpTXhTTVopbT09cEFBcVBOJ1VYRXNYWHZYT3dLRkZ5TkxMWEx6J1h%252BISABfnp5d3ZzcXBtbGtqaWhnZmVjWllXVlVTUVBPTk1MS0pFKikoJyFf',
  colors: getExtendedPalette(PALETTE.hospital),
  renderInstructions: (gfx, renderer, state, palette) => {
    if (!state.isDoorsOpen) renderer.drawTutorialTurnControls(gfx, 11, 22);
  },
  showTitle: true,
  extraLoseMessages: [
    ["Pst... Press left to initiate a u-turn.", (state, stats) => stats.applesEatenThisLevel >= 5],
    ["This level is tryna teach you something.", (state, stats) => stats.applesEatenThisLevel >= 5],
    ["You might... need to eat more apples.", (state, stats) => stats.applesEatenThisLevel < 5],
  ],
  disableNormalLoseMessages: true,
  musicTrack: MusicTrack.aqueduct,
  titleVariant: TitleVariant.Gray,
  globalLight: 0.5,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Mine]: false,
  },
  armorDrop: getCoordIndex2(14, 14),
  nextLevelMap: {
    [getCoordIndex2(0, 19)]: LEVEL_01_D,
    [getCoordIndex2(19, 29)]: WARP_ZONE_01,
    [getCoordIndex2(20, 29)]: WARP_ZONE_01,
  },
};
