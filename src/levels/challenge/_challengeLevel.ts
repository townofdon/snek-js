import { getExtendedPalette, PALETTE } from "../../palettes";
import { Level } from "../../types";
import { WARP_ZONE_01 } from "../bonusLevels/warpZone01";

// interface ChallengeLevel {
//   name: string
//   layoutV2: string
// }

type ChallengeLevel = Pick<Level, 'name' | 'layoutV2'> & Partial<Omit<Level, 'name' | 'layoutV2'>>

export const challengeLevel =  (level: ChallengeLevel): Level => ({
  name: level.name,
  timeToClear: 0,
  applesToClear: 0,
  layout: ``,
  layoutV2: level.layoutV2,
  colors: getExtendedPalette(PALETTE.default),
  showTitle: true,
  nextLevel: WARP_ZONE_01,
  ...level,
});
