import { PALETTE } from "./palettes";
import { Level } from "./types";

export const LEVEL_99: Level = {
  name: 'survival',
  timeToClear: 1000 * 60 * 10,
  applesToClear: 200,
  numApplesStart: 20,
  growthMod: 0.9,
  layout: `
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X~~~~~__~~~~XXDDXX~~~~__~~~~~X
X~~   --  ~~~~__~~~~  --   ~~X
X~    --    ~~__~~    --    ~X
X~    --      ==      --    ~X
X~    --      ==      --    ~X
X~    --      --      --    ~X
X_----==      --      ==    ~X
X_----==      --      ==    ~X
X~            --            ~X
X~            --            ~X
X~~           --            ~X
XX~           ==           ~~X
XX~~        --==--        ~~XX
DD__==------==  ==------==__DD
DD__==------==  ==------==__DD
XX~~        --==--        ~~XX
XX~           ==           ~~X
X~~           --            ~X
X~            --            ~X
X~            --            ~X
X_----==      --      ==----_X
X_----==      --      ==----_X
X~    --      --      --    ~X
X~    --      ==      --    ~X
X~    --      ==      --    ~X
X~    --    ~~__~~    --    ~X
X~~   --  ~~~~__~~~~  --   ~~X
X~~~~~__~~~~XXDDXX~~~~__~~~~~X
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
  `,
  colors: PALETTE.boxcar,
};
