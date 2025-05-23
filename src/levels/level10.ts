import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, TitleVariant } from "../types";
import { toTime } from "../utils";

const name = 'x-factor';

export const LEVEL_10: Level = {
  id: 'C10',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 1, seconds: 2 }),
  applesToClear: 55,
  numApplesStart: 20,
  growthMod: 0.2,
  layout: `
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X~~~~~~~~~~~XXDDXX~~~~~~~~~~~X
X~~       ~~~~DD~~~~       ~~X
X~  ~      =______=     ~   ~X
X~ ~XX~~~  -======-  ~~~XX~ ~X
X~ ~X_XX~~~ ------ ~~~XX_X~ ~X
X~ ~~X_XXX~~~    ~~~XXX_X~~ ~X
X~  ~XX_XXXX~~  ~~XXXX_XX~~ ~X
X~  ~~XX_XXXXD  DXXXX_XX~~  ~X
X~   ~XXX_XXXD  DXXX_XXX~   ~X
X~   ~~XXX_XXD  DXX_XXX~~   ~X
X~~   ~XXXX~~~==~~~XXXX~    ~X
XX~=- ~~XXX~~ -- ~~XXX~~ -=~~X
XX~_=- ~DDD~  --  ~DDD~ -=_~XX
DDD_=-     =--==--=     -=_DDD
DDD_=- O   =--==--=     -=_DDD
XX~_=- ~DDD~  --  ~DDD~ -=_~XX
XX~=- ~~XXX~~ ==  ~XXX~~ -=~~X
X~~   ~XXXX~~~--~~~XXXX~    ~X
X~   ~~XXX_XXD  DXX_XXX~~   ~X
X~   ~XXX_XXXD  DXXX_XXX~   ~X
X~  ~~XX_XXXXD  DXXXX_XX~~  ~X
X~  ~XX_XXXX~~  ~~XXXX_XX~  ~X
X~  ~X_XXX~~~    ~~~XXX_X~  ~X
X~  X_XX~~~ ------ ~~~XX_X~ ~X
X~ ~XX~~~  -======-  ~~~XX  ~X
X~         =______=      ~  ~X
X~~       ~~~~DD~~~~       ~~X
X~~~~~~~~~~~XXDDXX~~~~~~~~~~~X
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.burningCity),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["X marks the frustration."],
  ],
  musicTrack: MusicTrack.dangerZone,
  titleVariant: TitleVariant.Red,
  pickupDrops: {
    30: { likelihood: .1, type: PickupType.Invincibility },
    50: { likelihood: .3, type: PickupType.Invincibility },
  },
};
