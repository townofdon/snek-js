import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../../types";
import { LEVEL_WIN_GAME } from "../winGame";

const name = 'endurance';

export const VARIANT_LEVEL_99: Level = {
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 300,
  numApplesStart: 20,
  growthMod: 0.5,
  layout: `
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
X     --~~~~XXddXX~~~~__ JJJJX
X     --      __      -- JKkJX
X     --    ~KKKK~    -- JKKJX
X     --     KXXK     -- JJJJX
X     --     KXXK     --     X
X     --     KKKK     --     X
X-----LL      --      LL-----X
X-----LL      --      LL-----X
X~            --            ~X
X~            --            ~X
X~            --            ~X
XX          XXKKXX          XX
XX KKKK     X_dd_X     KKKK XX
Ld_KXXK-----KdladK-----KXXK_dL
Ld_KXXK-----KdaadK-----KXXK_dL
XX KKKK     X_dd_X     KKKK XX
XX          XXKKXX          XX
X~            --            ~X
X~        O   --            ~X
X~            --            ~X
X-----LL      --      LL-----X
X-----LL      --      LL-----X
X     --     KKKK     --     X
X     --     KXXK     --     X
X     --     KXXK     --     X
XxXX  --    ~KKKK~    --     X
XxjX  --      __      --     X
XXxx  __~~~~XXddXX~~~~__     X
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.darkStar),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  extraLoseMessages: [
    ["What? Not enough apples for ya?"],
    ["Don't quit now, this is the final level!"],
  ],
  showQuoteOnLevelWin: false,
  titleVariant: TitleVariant.Red,
  musicTrack: MusicTrack.slyguy,
  nextLevel: LEVEL_WIN_GAME,
};
