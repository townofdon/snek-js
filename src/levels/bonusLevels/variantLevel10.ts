import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { toTime } from "../../utils";

// url: <http://localhost:3000/snek-js/editor/?data=Cm0kTVcodldXcnJra3JyV1coSlcoTWhPIWpZUUJ5QnpRTHZRTFZRIU1KTFhCeUJnUSFRWFZYUSFNSlFYQnkidkx6QnlCemRLS2RWekx2bWJXSkxnQipXTlcqQmdMdigpCnAtLSBXZ1EgcVdtUFUKVVBwTiEoZ1EgcVdNV0pMZ0IqVy0tVypCZ0x2KClidkxWemRLS2RWekx2TUpRWEJlIkpMWEJlQmdRIVFYVlhMSk0hUUJlQnpRTHZRTFZRWWohT2hNV1dKV1dycmxscnJXVyhKVyhNJG0KfDQ1N3xSSUdIVHxzZWN1cml0eSBzdGF0aW9ufDE4MDAwZjEwZjJmZjN8MC4xfGYwLjV8IzY4QjJBOVM0ODhDODRTMUQyMDIwU0U3NkQ4M1NFMjUwNkFTMjYyQTJCUzFEMjAyMFMzMDM0MzZTMjYyQTJCUzk3ODc4RlM2MjU2NUNTRkZGNkYxUzBBMEUxNFNFOUVGRkZ8fn5%25252BMXwxMXwxfGZmZmYxSiAoLCdKISBNbQptTj09T20KKSggUVF2PV9fX19fXz12UVEgKCkKbVAKd3IoXz0tIExkZGQoIS0tIShkZGRMIHFfKHJ3ClFMTFMtI1VkZGRfPS1KSyA9LS1OLXEgS0pxX2RkZFZ6QmVCVygoWSFNIUxCKUJYUUwgLS0tLS0tIFFMWEIpQkwhTSFabSltbW1tbW0pbWIKKShKUXpCKUJYZCFkWEIpQnpRSihNZjB8Z3pYaFd2SlcoeCsreFcodkpXakxYQlFMIS1OTk4tIVFMQlhMcHdyKD0tIFFnVyBxLT12ISF6WFh%25252BMS0xLTEtIkJnZCFkWFZYUUpNJG1ad3dkZHd3Wm0BJCJ%25252BenZxcGpoZ2ZiWllXVlVTUVBPTk1KKCFf&id=bb21c29b-5330-435c-bdc1-e66878791313>

export const VARIANT_LEVEL_10: Level = {
  id: 'C210',
  name: 'security station',
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
  layoutV2: 'Cm0kTVcodldXcnJra3JyV1coSlcoTWhPIWpZUUJ5QnpRTHZRTFZRIU1KTFhCeUJnUSFRWFZYUSFNSlFYQnkidkx6QnlCemRLS2RWekx2bWJXSkxnQipXTlcqQmdMdigpCnAtLSBXZ1EgcVdtUFUKVVBwTiEoZ1EgcVdNV0pMZ0IqVy0tVypCZ0x2KClidkxWemRLS2RWekx2TUpRWEJlIkpMWEJlQmdRIVFYVlhMSk0hUUJlQnpRTHZRTFZRWWohT2hNV1dKV1dycmxscnJXVyhKVyhNJG0KfDQ1N3xSSUdIVHxzZWN1cml0eSBzdGF0aW9ufDE4MDAwZjEwZjJmZjN8MC4xfGYwLjV8IzY4QjJBOVM0ODhDODRTMUQyMDIwU0U3NkQ4M1NFMjUwNkFTMjYyQTJCUzFEMjAyMFMzMDM0MzZTMjYyQTJCUzk3ODc4RlM2MjU2NUNTRkZGNkYxUzBBMEUxNFNFOUVGRkZ8fn5%252BMXwxMXwxfGZmZmYxSiAoLCdKISBNbQptTj09T20KKSggUVF2PV9fX19fXz12UVEgKCkKbVAKd3IoXz0tIExkZGQoIS0tIShkZGRMIHFfKHJ3ClFMTFMtI1VkZGRfPS1KSyA9LS1OLXEgS0pxX2RkZFZ6QmVCVygoWSFNIUxCKUJYUUwgLS0tLS0tIFFMWEIpQkwhTSFabSltbW1tbW0pbWIKKShKUXpCKUJYZCFkWEIpQnpRSihNZjB8Z3pYaFd2SlcoeCsreFcodkpXakxYQlFMIS1OTk4tIVFMQlhMcHdyKD0tIFFnVyBxLT12ISF6WFh%252BMS0xLTEtIkJnZCFkWFZYUUpNJG1ad3dkZHd3Wm0BJCJ%252BenZxcGpoZ2ZiWllXVlVTUVBPTk1KKCFf',
  annotations: { 3: 0, 10: 0, 19: 0, 26: 0, 90: 0, 119: 0, 155: 0, 174: 0, 300: 0, 310: 0, 319: 0, 359: 0, 569: 0, 570: 0, 580: 0, 589: 0, 725: 0, 744: 0, 780: 0, 809: 0, 873: 0, 880: 0, 889: 0, 896: 0 },
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
