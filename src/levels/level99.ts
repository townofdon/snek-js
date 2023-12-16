import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, TitleVariant } from "../types";

const name = 'darkstar';

export const LEVEL_99: Level = {
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 200,
  numApplesStart: 20,
  growthMod: 0.9,
  layout: `
XXXXXX44XXXXXXDDXXXXXX44XXXXXX
X~~~~~__~~~~XXDDXX~~~~__~~~~~X
X~~   --  ~~~~__~~~~  --   ~~X
X~    --    ~~__~~    --    ~X
X~    --      ==      --    ~X
X~    --      ==      --    ~X
X~    --      --      --    ~X
0_----==      --      ==----_1
0_----==      --      ==----_1
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
0_----==      --      ==----_1
0_----==      --      ==----_1
X~    --      --      --    ~X
X~    --      ==      --    ~X
X~    --      ==      --    ~X
X~    --    ~~__~~    --    ~X
X~~   --  ~~~~__~~~~  --   ~~X
X~~~~~__~~~~XXDDXX~~~~__~~~~~X
XXXXXX33XXXXXXDDXXXXXX33XXXXXX
  `,
  colors: PALETTE.darkStar,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  extraLoseMessages: [
    ["What? Were there not enough apples?"],
    ["I hear playing SNEK rewires one's brain..."],
  ],
  showQuoteOnLevelWin: true,
  titleVariant: TitleVariant.Red,
};
