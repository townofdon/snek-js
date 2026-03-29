import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { toTime } from "../../utils";
import { TUTORIAL_LEVEL_20 } from "../campaign/tutorialLevel20";

const name = 'security station';

export const VARIANT_LEVEL_10: Level = {
  id: 'C210',
  name,
  timeToClear: 1000 * 60 * 3,
  parTime: toTime({ minutes: 1, seconds: 20 }),
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
X~~   LXXXX*~~==~~*XXXXL    ~X
XX~=- LLXXX~~ -- ~~XXXLL -=~~X
XX~_=- LDDD~  --  ~DDDL -=_~XX
DDD_=-   K =--==--= K   -=_DDD
DDD_=- O K =--==--= K   -=_DDD
XX~_=- LDDD~  --  ~DDDL -=_~XX
XX~=- LLXXX~~ ==  ~XXXLL -=~~X
X~~   LXXXX*~~--~~*XXXXL    ~X
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
  layoutV2: 'Ck9PT092dmRkdnZPT09tKVYoISFWVnp6X2t6elZWKEpWKClaWSFoV2YhJFEhKSJndylWSkxPQipWTlYqQk9MISEoWApqLS0gVk9RIHBWWFBVClVQak4hKE9RIHBWKVZKTE9CKlYtLVYqQk9MISEoKXdnIiRMSikhZldoIVlaKVZWSlZWenpsX3p6VlYoSlYoKU9PT212dmRkdnZPT09PCnw0NTd8UklHSFR8c2VjdXJpdHkgc3RhdGlvbnE4MDAwMHEwMHwyMHwwfDN8MC4xfDBxfCM2OEIyQTlTNDg4Qzg0UzFEMjAyMFNFNzZEODNTRTI1MDZBUzI2MkEyQlMxRDIwMjBTMzAzNDM2UzI2MkEyQlM5Nzg3OEZTNjI1NjVDU0ZGRjZGMVMwQTBFMTRTRTlFRkZGcX5%252BfnExfDJKICgsJylYClhKISBNWEJfQlhOPT1PbVhQCmJCKF89LSBMZGRkKCEtLSEoZGRkTCBwXyhCYgpRTExTLSNVZGRkXz0tSksgPS0tTi1wIEtKcF9kZGRWKChXISkhTEJfQlhRTCAtLS0tLS0gUUxYQl9CTCEpIVkpKCBRUSEhPV9fX19fXz0hIVFRICgpWlYhIUpWKHgrK3hWKCEhSlZmUUJfQm1RTCEhUUxtQl9CUWcpISFMWE1YZEtLZFhNWEwhISloTFhCUUwhLU5OTi0hUUxCWExqYkIoPS0gUU9WIG1YWHAtPXF8MXcoSlFYTWQhZE1YUUoofi0xLTEtMSJKUU1tZCFkbU1RSiQpSkxNbVEhUW1NASQifndxcG1qaGdmWllXVlVTUVBPTk1KKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.darkStar),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["Death is not the end. It is merely a beginning."],
    ["That. Was. So. METAL!"],
  ],
  musicTrack: MusicTrack.dangerZone,
  titleVariant: TitleVariant.Red,
  nextLevel: TUTORIAL_LEVEL_20,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Mine]: true,
  },
  pickupDropsByFrame: {
    15: { likelihood: .8, type: ItemDropType.Mine },
    30: { likelihood: .8, type: ItemDropType.Mine },
    50: { likelihood: .8, type: ItemDropType.Mine },
    65: { likelihood: .8, type: ItemDropType.Mine },
    70: { likelihood: .8, type: ItemDropType.Mine },
  },
};
