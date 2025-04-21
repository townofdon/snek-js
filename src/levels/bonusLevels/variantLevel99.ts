import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, PickupType, TitleVariant } from "../../types";
import { LEVEL_WIN_GAME } from "../winGame";

const name = 'endurance';

export const VARIANT_LEVEL_99: Level = {
  id: 'C299',
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 295,
  numApplesStart: 20,
  growthMod: 0.18,
  extraHurtGraceTime: 20,
  layout: `
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
X     --~~~~XXddXX~~~~__ JJJKX
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
  showTitle: true,
  extraLoseMessages: [
    ["The bold. The courageous. The Snek."],
    ["Too much for you, eh?"],
    ["Don't quit now, this is the final level!"],
    ["What? Not enough apples for ya?"],
    ["How many deaths is this? I've lost count."],
    ["Yours will be an epic tale told for centuries."],
    ["This is nail-biting drama at its finest"],
    ["Tales of your deeds shall resound across the lands."],
    ["This tragedy reminds us that life is fragile.<br/><br/>And also not to run into things."],
    ["A thin line exists<br/>between the stout-hearted<br/>and the foolhardy."],
    ["Way to snatch defeat from the jaws of victory..."],
    ["Aw snap, just when it was beginning to get interesting..."],
    ["That move from 10 seconds ago is really what did you in..."],
    ["Are you starting to question your life decisions?"],
    ["What are you after, bragging rights?"],
    ["Ashes to ashes.<br/><br/>dust to dust.<br/><br/>snek to wall."],
  ],
  disableNormalLoseMessages: true,
  showQuoteOnLevelWin: false,
  titleVariant: TitleVariant.Red,
  musicTrack: MusicTrack.slyguy,
  nextLevel: LEVEL_WIN_GAME,
  pickupDrops: {
    50: { likelihood: 0.8, type: PickupType.Invincibility },
    75: { likelihood: 0.05, type: PickupType.Invincibility },
    100: { likelihood: 0.8, type: PickupType.Invincibility },
    125: { likelihood: 0.05, type: PickupType.Invincibility },
    150: { likelihood: 0.8, type: PickupType.Invincibility },
    175: { likelihood: 0.05, type: PickupType.Invincibility },
    200: { likelihood: 0.8, type: PickupType.Invincibility },
    225: { likelihood: 0.05, type: PickupType.Invincibility },
    250: { likelihood: 0.8, type: PickupType.Invincibility },
    275: { likelihood: 0.05, type: PickupType.Invincibility },
    300: { likelihood: 0.8, type: PickupType.Invincibility },
    325: { likelihood: 0.05, type: PickupType.Invincibility },
    350: { likelihood: 0.8, type: PickupType.Invincibility },
    375: { likelihood: 0.05, type: PickupType.Invincibility },
    400: { likelihood: 0.8, type: PickupType.Invincibility },
    425: { likelihood: 0.05, type: PickupType.Invincibility },
    450: { likelihood: 0.8, type: PickupType.Invincibility },
    460: { likelihood: 1, type: PickupType.Invincibility },
  },
}; 
