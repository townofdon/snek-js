import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, TitleVariant } from "../../types";
import { LEVEL_10 } from "../level10";
import { TUTORIAL_LEVEL_20 } from "../tutorialLevel20";

const name = 'security station';

export const VARIANT_LEVEL_10: Level = {
  name,
  timeToClear: 1000 * 60 * 3,
  applesToClear: 100,
  numApplesStart: 20,
  growthMod: 0.1,
  layout: `
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X~~~    ~~~~XX_kXX~~~~~   ~~~X
X~~       ~~~x++x~~~       ~~X
X~ LLLL    =______=    LLLL ~X
X  LXXLLL  -======-  LLLXXL  X
X  LX_XXLLL ------ LLLXX_XL  X
X  LLX_XXXLLL    LLLXXX_XLL  X
X   LXX_XXXXLL  LLXXXX_XXLL  X
X   LLXX_XXXXD  DXXXX_XXLL   X
X    LXXX_XXXDKKDXXX_XXXL    X
X~   LLXXX_XXD  DXX_XXXLL   ~X
X~~   LXXXX~~~==~~~XXXXL    ~X
XX~=- LLXXX~~ -- ~~XXXLL -=~~X
XX~_=- LDDD~  --  ~DDDL -=_~XX
DDD_=-   K =--==--= K   -=_DDD
DDD_=- O K =--==--= K   -=_DDD
XX~_=- LDDD~  --  ~DDDL -=_~XX
XX~=- LLXXX~~ ==  ~XXXLL -=~~X
X~~   LXXXX~~~--~~~XXXXL    ~X
X~   LLXXX_XXD  DXX_XXXLL   ~X
X    LXXX_XXXDKKDXXX_XXXL    X
X   LLXX_XXXXD  DXXXX_XXLL   X
X   LXX_XXXXLL  LLXXXX_XXL   X
X  LLX_XXXLLL    LLLXXX_XLL  X
X  LX_XXLLL ------ LLLXX_XL  X
X  LXXLLL  -======-  LLLXXL  X
X~ LLLL    =______=    LLLL ~X
X~~       ~~~x++x~~~       ~~X
X~~~~   ~~~~XXl_XX~~~~~   ~~~X
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.darkStar),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["Death is not the end. It is merely a beginning."],
  ],
  musicTrack: MusicTrack.dangerZone,
  titleVariant: TitleVariant.Red,
  nextLevel: TUTORIAL_LEVEL_20,
  recordProgressAsLevel: LEVEL_10,
};
