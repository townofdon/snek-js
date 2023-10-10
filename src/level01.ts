import { PALETTE } from "./palettes";
import { Level } from "./types";

export const LEVEL_01: Level = {
  name: 'classic',
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
};
