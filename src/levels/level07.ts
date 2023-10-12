import { PALETTE } from "../palettes";
import { Level } from "../types";

export const LEVEL_07: Level = {
  name: 'factory floor',
  timeToClear: 1000 * 60 * 1.7,
  applesToClear: 40,
  numApplesStart: 5,
  layout: `
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X~~  ~ ~ ~~~~XDDX~~~~  ~ ~ ~~X
X~          ~XDDX~          ~X
X~                          ~X
X   XXX_====-====-====_XXX  ~X
X~  XXX~---- ---- ----~XXX~  X
X  ~XXX~              ~XXX  ~X
X~ ~XXX~              ~XXX~ ~X
X  ~XXX~~~ ~    ~ ~ ~~~XXX~ ~X
X~ ~XXXXXXXXXDDDDXXXXXXXXX~  X
X~      ~  ~  ~   ~  ~       X
X~                          ~X
X~~~~~~ ---- ---- ---- ~~~~~~X
XDDDXXX_====-====-====_XXXDDDX
X~~~~~~ ---- ---- ---- ~~~~~~X
X~     O                    ~X
X      ~  ~  ~ ~  ~  ~   ~  ~X
X   XXXXXXXXXDDDDXXXXXXXXX~  X
X~  XXX~~~          ~~~XXX  ~X
X  ~XXX~              ~XXX~ ~X
X  ~XXX~              ~XXX~ ~X
X~ ~XXX~---- ---- ----~XXX~ ~X
X~  XXX_====-====-====_XXX   X
X                           ~X
X~                          ~X
X~                           X
X~                          ~X
X~~       ~XX~~~~XX~       ~~X
XXXXXXX~~~~XXDDDDXX~~~~XXXXXXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
  `,
  colors: PALETTE.violetSunset,
};
