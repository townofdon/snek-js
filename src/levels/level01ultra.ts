import Color from "color";
import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PickupType, TitleVariant } from "../types";
import { LEVEL_02 } from "./level02";

const name = 'snekadia'

export const LEVEL_01_ULTRA: Level = {
  name,
  timeToClear: 1000 * 60 * 2,
  applesToClear: 30,
  layout: `
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
X~    ++  ~XX+++XX~  ++     ~X
X     --   xx+++xx   --      X
X     --     ===     --      X
X     --     ===     --      X
X    xddx    ===    xddx     X
X+---xXXx----===----xXXx----+X
X+---xXXx----===----xXXx----+X
X    xddx    ===    xddx     X
X     --     ===     --      X
X~    --     ===     --     ~X
XXx   --     ===     --    xXX
XXx   --     ===     --    xXX
d++========================++d
d++========================++d
d++========================++d
XXx   --     ===     --    xXX
XXx   --     ===     --    xXX
X~    --     ===     --     ~X
X     --     ===     --      X
X    xddx    ===    xddx     X
X+---xXXx----===----xXXx----+X
X+---xXXx----===----xXXx----+X
X    xddx    ===    xddx     X
X     --     ===     --      X
X     --  O  ===     --      X
X     --     ===     --      X
X     --   xx+++xx   --      X
X~    ++  ~XX+++XX~  ++     ~X
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
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["How did you mess this one up?", (state, stats, difficulty) => difficulty.index >= 3],
    ["You couldn't miss the broad side of a barn.", (state, stats, difficulty) => difficulty.index >= 4],
    ["Maybe let's dial down the difficulty?", (state, stats, difficulty) => difficulty.index >= 4],
  ],
  musicTrack: MusicTrack.champion,
  titleVariant: TitleVariant.Yellow,
  nextLevel: LEVEL_02,
  pickupDrops: {
    40: { likelihood: 1, type: PickupType.Invincibility },
  },
};
