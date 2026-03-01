import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, PickupType, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'survive!';

export const LEVEL_99: Level = {
  id: 'C99',
  name,
  timeToClear: 1000 * 60 * 10,
  parTime: toTime({ minutes: 2, seconds: 30 }),
  applesToClear: 200,
  numApplesStart: 20,
  growthMod: 0.5,
  extraHurtGraceTime: 15,
  layout: `
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
X**~~~__~~~~XXddXX~~~~__~~~**X
X**   --  ~~~~__~~~~  --   k*X
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
Ld__KK------Kda!dK------KK__dL
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
X**   --  ~~~~__~~~~  --   **X
X**~~~__~~~~XXddXX~~~~__~~~**X
XXXXXXXXXXXXXXLLXXXXXXXXXXXXXX
  `,
  layoutV2: `ClFYelFaa2JtU1ZWeG10eE5OWVlKcWdmWGFsQWphQSc6anlmZ3FZWU5ObXRWVnhtU3hiWipKUXpRWAp8NThjUklHSFR8c3Vydml2ZSc6fDYwMDAwYzIwYzJjYzN8MC41fjV%252BfCM2OEIyQTlPNDg4Qzg0b0U3NkQ4M09FMjUwNkFwbzMwMzQzNnBPOTc4NzhGTzYyNTY1Q09GRkY2RjFPMEEwRTE0T0U5RUZGRnxoaGgxfDIxUCAoLCcpIXQhSlh5TSEhISFOSl9VVXohKSF6VVVfTy0jUCEgUW5ubm5ublhTV19fV1UtLVZ4bSFLSyFXKChZSihNKU0oWkoqKihTV25kZG5XUygqYQpMZF9fS3dkYkoqKlBVIVdTVyFVUCoqYzB8ZlhXTS1fZGRfLU1XWGdKWChNUEtLTVAoWEpoMS0xLTEtamR3S19fZExtSigpblhYb08xRDIwMjBPcE8yNjJBMkJxV01QVU1QV3QhVSF3S1VVVUt4KSh5Clh6TEx%252BfDEBfnp5eHd0cXBvbm1qaGdmY2JhWllXVlVTUVBPTk1KKSghXw%253D%253D`,
  colors: getExtendedPalette(PALETTE.darkStar),
  showTitle: true,
  extraLoseMessages: [
    ["What? Not enough apples for ya?"],
    ["Don't quit now, this is the final level!"],
    ["Aggh you are almost to the finish line!"],
    ["I can see the determination on your face."],
    ["Despite all appearances, victory is near"],
    ["Never give up!<br />Never give up!<br />Never... give up!"],
    ["C'mon, you got this!"],
    ["How many deaths is this? I've lost count."],
    ["Yours will be an epic tale told for centuries."],
    ["This is nail-biting drama at its finest"],
    ["There never was much hope, only a snek's hope"],
    ["Tales of your deeds shall resound across the lands."],
    ["This reminds us that life is fragile.<br/><br/>And also not to run into things."],
  ],
  disableNormalLoseMessages: true,
  showQuoteOnLevelWin: false,
  titleVariant: TitleVariant.Red,
  musicTrack: MusicTrack.moneymaker,
  pickupDrops: {
    [PickupType.Invincibility]: true,
    [PickupType.Mine]: 3,
  },
  pickupDropsByFrame: {
    100: { likelihood: .2, type: PickupType.Invincibility },
    150: { likelihood: .1, type: PickupType.Invincibility },
    175: { likelihood: .05, type: PickupType.Invincibility },
    200: { likelihood: .3, type: PickupType.Invincibility },
    225: { likelihood: .05, type: PickupType.Invincibility },
    250: { likelihood: .8, type: PickupType.Invincibility },
    275: { likelihood: .05, type: PickupType.Invincibility },
  },
};
