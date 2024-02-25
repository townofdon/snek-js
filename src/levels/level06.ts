import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode } from "../types";
import { getCoordIndex2 } from "../utils";
import { VARIANT_LEVEL_07 } from "./bonusLevels/variantLevel07";

const name = 'lobby';

export const LEVEL_06: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 40,
  numApplesStart: 5,
  growthMod: 0.9,
  layout: `
X1XXXXXXXXXXXXXXXXXXXXXXXXXX3X
XXXX~~~ ~  ~ ~  ~  ~  ~ ~~XXXX
XXXX    ------  ------    XXXX
XXXX   -======--======-   XXXX
XXXX~ -+DDDDDD++DDDDDD+- ~XXXX
X~~~   -======--======--  ~~~X
X~      ------  ------      ~X
X~                          ~X
X~    ~X_+__      __+_X~    ~X
X~    ~XX_+_      _+_XX~    ~X
X~   ~~XXX_+      +_XXX~~   ~X
XX   ~~XXXX_      _XXXX~~   XX
XX   XXXXXXX      XXXXXXX   XX
D~     ~   ~       ~   ~    ~D
D~         O                ~D
D~     ~ ~        ~ ~   ~   ~D
XX   XXXXXXX      XXXXXXX   XX
XX   ~~XXXX_      _XXXX~~   XX
X~   ~~XXX_+      +_XXX~~   ~X
X~    ~XX_+_      _+_XX~    ~X
X~    ~X_+__      __+_X~    ~X
X~                          ~X
X~      ------  ------      ~X
X~~~   -=+==+=--=+==+=-    ~~X
XXXX~ -+DDDDDD++DDDDDD+- ~XXXX
Xxxx~  -=+=+==--==+=+=-  ~xxxX
XxXX~   ------  ------   ~XXxX
XxXX~~~ ~  ~   ~  ~ ~  ~~~XXxX
X1XXXXXXXXXXXXXXXXXXXXXXXXXX3X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.cornflower),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.lordy,
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
  },
  nextLevelMap: {
    [getCoordIndex2(1, 0)]: VARIANT_LEVEL_07,
    [getCoordIndex2(28, 0)]: VARIANT_LEVEL_07,
  },
};
