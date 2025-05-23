import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, TitleVariant } from "../types";
import { LEVEL_01 } from "./level01";
import { LEVEL_02 } from "./level02";

const name = 'snekadia'

export const LEVEL_01_HARD: Level = {
  id: 'C01_H',
  name,
  timeToClear: 1000 * 60 * 1,
  applesToClear: 30,
  layout: `
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
X~~   ++~  XX+++XX  ~++~   ~~X
X~    --     ===     --     ~X
X     --     ===     --      X
X     --     ===     --      X
X     --     ===     --      X
X+----xx-----===-----xx-----+X
X+----xd-----===-----dx-----+X
X~    --     ===     --     ~X
X     --     ===     --      X
X     --     ===     --      X
XX    --     ===     --     XX
XX    --     ===     --     XX
d+==========================+d
d+==========================+d
d+==========================+d
XX    --     ===     --     XX
XX    --     ===     --     XX
X     --     ===     --      X
X     --     ===     --      X
X~    --     ===     --     ~X
X+----xd-----===-----dx-----+X
X+----xx-----===-----xx-----+X
X~    --     ===     --     ~X
X     -- O   ===     --      X
X     --     ===     --      X
X     --     ===     --      X
X~    --     ===     --     ~X
X~~   ++~  XX+++XX  ~++~   ~~X
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette({
    ...PALETTE.boxcar,
    // background: Color("#505050").mix(Color("#2F4858"), 0.2).darken(0.25).mix(Color('#008080'), 0.06).hex(),
    // deco1: Color("#535353").mix(Color("#2F4858"), 0.2).darken(0.21).mix(Color('#008080'), 0.045).hex(),
    // deco1Stroke: Color("#515151").mix(Color("#2F4858"), 0.2).darken(0.23).mix(Color('#008080'), 0.05).hex(),
    // deco2: Color("#595959").mix(Color("#2F4858"), 0.2).darken(0.1).mix(Color('#008080'), 0.04).hex(),
    // deco2Stroke: Color("#555555").mix(Color("#2F4858"), 0.2).darken(0.17).mix(Color('#008080'), 0.04).hex(),
  }),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["How did you mess this one up?", (state, stats, difficulty) => difficulty.index >= 3],
    ["You couldn't miss the broad side of a barn.", (state, stats, difficulty) => difficulty.index >= 4],
    ["Maybe let's dial down the difficulty?", (state, stats, difficulty) => difficulty.index >= 4],
  ],
  musicTrack: MusicTrack.champion,
  titleVariant: TitleVariant.Yellow,
  nextLevel: LEVEL_02,
  recordProgressAsLevel: LEVEL_01,
  pickupDrops: {
    28: { likelihood: 1, type: PickupType.Invincibility },
  },
};
