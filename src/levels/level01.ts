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
  titleScene: (p5, fonts, callbacks) => new TitleScene(name, p5, fonts, callbacks)
};
