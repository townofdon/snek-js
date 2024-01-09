import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";

const name = 'darkstar';

export const LEVEL_99: Level = {
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 200,
  numApplesStart: 20,
  growthMod: 0.9,
  layout: `
XXXXXX44XXXXXXddXXXXXX44XXXXXX
X~~~~~__~~~~XXddXX~~~~__~~~~~X
X~~   --  ~~~~__~~~~  --   ~~X
X~    --    ~~__~~    --    ~X
X~    --      ==      --    ~X
X~    --      ==      --    ~X
X~    --      --      --    ~X
0_----==      --      ==----_1
0_----==      --      ==----_1
X~            --            ~X
X~            --            ~X
X~~           --           ~~X
XX~           ==           ~XX
XX~~        --==--        ~~XX
dd__==------==  ==------==__dd
dd__==------==  ==------==__dd
XX~~        --==--        ~~XX
XX~           ==           ~XX
X~~           --           ~~X
X~            --            ~X
X~            --            ~X
0_----==      --      ==----_1
0_----==      --      ==----_1
X~    --      --      --    ~X
X~    --      ==      --    ~X
X~    --      ==      --    ~X
X~    --    ~~__~~    --    ~X
X~~   --  ~~~~__~~~~  --   ~~X
X~~~~~__~~~~XXddXX~~~~__~~~~~X
XXXXXX33XXXXXXddXXXXXX33XXXXXX
  `,
  colors: PALETTE.darkStar,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  extraLoseMessages: [
    ["What? Were there not enough apples?"],
    ["I hear playing SNEK rewires one's brain..."],
  ],
  showQuoteOnLevelWin: false,
  titleVariant: TitleVariant.Red,
  musicTrack: MusicTrack.dangerZone,
};
