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
  layoutV2: 'ClZtd3dkZHd3VilVKHBVVXJya2tyclVVKEpVKCliVyFmKSFMQnlaUEJ5ekpMWEJ5QnZQIVBZTlhQISlKUFhCeUIkcExZQnlCIihKUFlCdEJYZCFkWEJxQllQSigpVUpMdkIqVU1VKkJ2THAobQpnLS0gVXZQIGhVbU9TClNPZ00hKHZQIGhVKVVKTHZCKlUtLVUqQnZMcCgpKEpQWE5YZCFkTllQSigpcExYTiJKUE4kSkxOdlAhUFlOWExKKSFQQmV6IUxCZVpmV2IpVVVKVVVycmxscnJVVShKVSgpVnd3ZGR3d1ZtCnw0NTd8UklHSFR8c2VjdXJpdHkgc3RhdGlvbmo4MDAwMGowMHwyMHwwfDN8MC4xfDBqfCM2OEIyQTlRNDg4Qzg0UTFEMjAyMFFFNzZEODNRRTI1MDZBUTI2MkEyQlExRDIwMjBRMzAzNDM2UTI2MkEyQlE5Nzg3OEZRNjI1NjVDUUZGRjZGMVEwQTBFMTRRRTlFRkZGan5%252BfmoxfDJKICgsJyltCm1KISBNPT1OWEJlQk8Kd3IoXz0tIExkZGQoIS0tIShkZGRMIGhfKHJ3ClBMTFEtI1NkZGRfPS1KSyA9LS1NLWggS0poX2RkZFUoKFZtbW1tbW1tbW1tbVcpKCBQUHA9X19fX19fPXBQUCAoKXZYWkJYUEwgLS0tLS0tIFBMTkwhKSFiVXBKVSh4Kyt4VShwSlVmTFhCUEwhLU1NTS0hUExCWEwhZ3dyKD0tIFB2VSBoLT1qfDFwISF2WVh6QllQTHBQTFhOUCEpfi0xLTEtMSJZZEtLZFhOWUxwKSR2ZCFkWU5YUEopASQifnp2cGpoZ2ZiWllXVlVTUVBPTk1KKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.darkStar),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["Death is not the end. It is merely a beginning."],
    ["That. Was. So. METAL!"],
    ["But at least you looked cool doing it."],
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
