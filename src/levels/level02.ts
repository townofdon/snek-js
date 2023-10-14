import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level } from "../types";

const name = 'arena'

export const LEVEL_02: Level = {
  name,
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
  titleScene: (p5, fonts, callbacks) => new TitleScene(name, p5, fonts, callbacks)
};
