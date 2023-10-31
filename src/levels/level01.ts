import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level } from "../types";

const name = 'hangar'

export const LEVEL_01: Level = {
  name,
  timeToClear: 1000 * 60 * 1,
  applesToClear: 15,
  layout: "\
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX\n\
X~~ ~ _-~ ~ ~=+=~ ~ ~-_ ~ ~~~X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
D============================D\n\
D============================D\n\
D============================D\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    -- O   ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X     --     ===     --      X\n\
X~    --     ===     --     ~X\n\
X~~ ~ _-~ ~ ~=+=~ ~ ~-_ ~  ~~X\n\
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX\n\
  ",
  colors: PALETTE.boxcar,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["How did you mess this one up?", (state, stats, difficulty) => difficulty.index >= 3],
    ["You couldn't miss the broad side of a barn.", (state, stats, difficulty) => difficulty.index >= 4],
    ["Maybe let's dial down the difficulty?", (state, stats, difficulty) => difficulty.index >= 4],
  ],
};
