import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PickupType, TitleVariant } from "../types";

const name = 'survive!';

export const LEVEL_99: Level = {
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 200,
  numApplesStart: 20,
  growthMod: 0.5,
  extraHurtGraceTime: 15,
  layout: `
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
X~~~~~__~~~~XXddXX~~~~__~~~~~X
X~~   --  ~~~~__~~~~  --   k~X
X~    --    ~~__~~    --    ~X
X~    --      KK      --    ~X
X~    --      KK      --    ~X
X~    --      --      --    ~X
X_----LL      --      LL----_X
X_----LL      --      LL----_X
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
X~        O   --            ~X
X~            --            ~X
X_----LL      --      LL----_X
X_----LL      --      LL----_X
X~    --      --      --    ~X
X~    --      KK      --    ~X
X~    --      KK      --    ~X
X~    --    ~~__~~    --    ~X
X~~   --  ~~~~__~~~~  --   ~~X
X~~~~~__~~~~XXddXX~~~~__~~~~~X
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
  musicTrack: MusicTrack.moneymaker,
  pickupDrops: {
    50: { likelihood: .8, type: PickupType.Invincibility },
    75: { likelihood: .5, type: PickupType.Invincibility },
    100: { likelihood: .8, type: PickupType.Invincibility },
    125: { likelihood: .5, type: PickupType.Invincibility },
    150: { likelihood: 1, type: PickupType.Invincibility },
    175: { likelihood: .5, type: PickupType.Invincibility },
    200: { likelihood: .8, type: PickupType.Invincibility },
    225: { likelihood: .4, type: PickupType.Invincibility },
    250: { likelihood: 1, type: PickupType.Invincibility },
    275: { likelihood: .5, type: PickupType.Invincibility },
  },
};
