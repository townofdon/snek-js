import { PALETTE } from "./palettes";
import { Level } from "./types";

export const LEVEL_02: Level = {
  name: 'arena',
  timeToClear: 1000 * 60 * 1.2,
  applesToClear: 20,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXX~~   ~   -_-    ~   ~~XXXX
XXX~~        -=-         ~~XXX
XX~~         -=-          ~~XX
X~~          -=-           ~~X
X~           -=-             X
X            ---            ~X
D------------~X~-------------D
D-==------==-XXX-==-------==-D
D------------~X~-------------D
X            ---             X
X~~          -=-           ~~X
X~~          -=-           ~~X
XX+------------------------+XX
XXX-==----==- O -=-=----==-XXX
XX+------------------------+XX
X~~          -=-           ~~X
X~~          -=-           ~~X
X            ---             X
D------------~X~-------------D
D-==------==-XXX-==-------==-D
D------------~X~-------------D
X            ---             X
X~           -=-             X
X            -=-            ~X
X~~          ---           ~~X
XX~~         -=-          ~~XX
XXX~~        -=-         ~~XXX
XXXX~~   ~   -_-   ~    ~~XXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: PALETTE.plumsea,
};
