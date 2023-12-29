import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";

const name = 'snekadia'

export const LEVEL_01: Level = {
  name,
  timeToClear: 1000 * 60 * 1,
  applesToClear: 30,
  layout: "\
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX\n\
X~~~~~__~~~XXdddXX~~~-_~~~~~~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
XX    --     ===     --     XX\n\
XX    --     ===     --     XX\n\
dd==========================dd\n\
dd==========================dd\n\
dd==========================dd\n\
XX    --     ===     --     XX\n\
XX    --     ===     --     XX\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    -- O   ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~    --     ===     --     ~X\n\
X~~~~~__~~~XXdddXX~~~__~~~~~~X\n\
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX\n\
  ",
  colors: PALETTE.boxcar,
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
