import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level } from "../types";

const name = 'airfield'

export const LEVEL_99: Level = {
  name,
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
X_----==      --      ==----_X
X_----==      --      ==----_X
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
  // colors: {
  //   ...PALETTE.hospital,
  //   playerHead: PALETTE.plumsea.playerHead,
  //   playerTail: PALETTE.plumsea.playerTail,
  //   playerTailStroke: PALETTE.plumsea.playerTailStroke,
  // },
  colors: PALETTE.cornflower,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  extraLoseMessages: [
    ["What? Were there not enough apples?"],
  ],
  showQuoteOnLevelWin: true,
};
