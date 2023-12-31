import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";

const name = 'x-factor';

export const LEVEL_10: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
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
  colors: PALETTE.burningCity,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["X marks the frustration."],
  ],
  musicTrack: MusicTrack.dangerZone,
  titleVariant: TitleVariant.Red,
};
