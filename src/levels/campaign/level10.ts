import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'x-factor';

export const LEVEL_10: Level = {
  id: 'C10',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 1, seconds: 5 }),
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
  layoutV2: 'U1hxcVV6enV6enFxKlkpKCF3KGlKIUopIFp5IVEqTEtVd1VLTGgpamhXayllIUohdmJVTWxWLS0gKmJLaGcqek5QClBOVk0oIWJLaGcqegpYKkohdmJVLS1sWCFla1dqISgpKCFMS1V3VUtMISgpKFFaKCl3KEppdyEoWSlxcSp6enV6enFxVVhTfDQ1N3xSSUdIVHx4LWZhY3Rvcnw5MDAwcDU1fDJwcDN8MC4yfHB%252BI0Q2Njg1M09BNTNDMjdzMTJENDBPNEM2ODk0TzFGMjYzM3M3MkYzRk8xRjI2MzNPNTgzNzNET0ExNjg3M08wMEI4QUFPMjFENEFBTzAwN0U4RnxtbW1%252BMX4yISwnSiApIVgKWCFVIUooIHZYTGJfYk09PU4KYmIhX24gIXVkISgtLSghdWQhIGdfIWJiCk8tI1B1ZF9uKEpuLU0tZyhKZ191ZFFMWFUgLS0tLS0tIFVYTHlTCktLS0tLS2JidWJiS0tLS0tLClUqIVZiYiFuICpLYmhXKSgqWEx2ZChkdkxYKigpWSkhd0pxdXF3SiFaIXpiVSgtTU1NLShVYnplSipLTGJkKGRiTEsqSilnLT1oKiBpPV9fX19fXz0oaighWEx2KigqdkxYa0ohS0xLZChkS0xLIUpsVWJ2IXchegptMS0xLTEtbj0tcDB8cSoqc08xMTE1MUNPMnVkZHZLWHcoKHkhICkgfjF8AX55d3Z1c3Fwbm1sa2ppaGdlWllXVlVTUVBPTk1MS0oqKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.burningCity),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["X marks the frustration."],
  ],
  musicTrack: MusicTrack.dangerZone,
  titleVariant: TitleVariant.Red,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Mine]: true,
  },
  pickupDropsByFrame: {
    30: { likelihood: .1, type: ItemDropType.Invincibility },
    50: { likelihood: .3, type: ItemDropType.Invincibility },
  },
};
