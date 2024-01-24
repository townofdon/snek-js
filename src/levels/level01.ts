import Color from "color";
import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";

const name = 'snekadia'

export const LEVEL_01: Level = {
  name,
  timeToClear: 1000 * 60 * 1,
  applesToClear: 30,
  layout: `
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
X~~~~~++~~~~~+++~~~~~++~~~~~~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X+-----------===------------+X
X+-----------===------------+X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
d+==========================+d
d+==========================+d
d+==========================+d
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    -- O   ===     --     ~X
X+-----------===------------+X
X+-----------===------------+X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~~~~~++~~~~~+++~~~~~++~~~~~~X
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
  `,
  colors: {
    ...PALETTE.boxcar,
    background: Color("#505050").mix(Color("#2F4858"), 0.2).darken(0.15).mix(Color('#008080'), 0.06).hex(),
    deco1: Color("#535353").mix(Color("#2F4858"), 0.2).darken(0.12).mix(Color('#008080'), 0.045).hex(),
    deco1Stroke: Color("#515151").mix(Color("#2F4858"), 0.2).darken(0.13).mix(Color('#008080'), 0.05).hex(),
    deco2: Color("#595959").mix(Color("#2F4858"), 0.2).darken(0.1).mix(Color('#008080'), 0.04).hex(),
    deco2Stroke: Color("#555555").mix(Color("#2F4858"), 0.2).darken(0.11).mix(Color('#008080'), 0.04).hex(),
  },
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["How did you mess this one up?", (state, stats, difficulty) => difficulty.index >= 3],
    ["You couldn't miss the broad side of a barn.", (state, stats, difficulty) => difficulty.index >= 4],
    ["Maybe let's dial down the difficulty?", (state, stats, difficulty) => difficulty.index >= 4],
  ],
  musicTrack: MusicTrack.champion,
  titleVariant: TitleVariant.Yellow,
};
