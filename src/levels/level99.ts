import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";

const name = 'survive!';

export const LEVEL_99: Level = {
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 200,
  numApplesStart: 20,
  growthMod: 0.7,
  layout: `
XXXXXX44XXXXXXLLXXXXXX44XXXXXX
X~~~~~__~~~~XXddXX~~~~__~~~~~X
X~~   --  ~~~~__~~~~  --   k~X
X~    --    ~~__~~    --    ~X
X~    --      KK      --    ~X
X~    --      KK      --    ~X
X~    --      --      --    ~X
0_----LL      --      LL----_1
0_----LL      --      LL----_1
X~            --            ~X
X~            --            ~X
X~~           --           ~~X
XX~           KK           ~XX
XX~~        -_dd_-        ~~XX
Ld__KK------KdladK------KK__dL
Ld__KK------KdaadK------KK__dL
XX~~        -_dd_-        ~~XX
XX~           KK           ~XX
X~~           --           ~~X
X~        o   --            ~X
X~            --            ~X
0_----LL      --      LL----_1
0_----LL      --      LL----_1
X~    --      --      --    ~X
X~    --      KK      --    ~X
X~    --      KK      --    ~X
X~    --    ~~__~~    --    ~X
X~~   --  ~~~~__~~~~  --   ~~X
X~~~~~__~~~~XXddXX~~~~__~~~~~X
XXXXXX33XXXXXXLLXXXXXX33XXXXXX
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
