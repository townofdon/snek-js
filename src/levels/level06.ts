import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack } from "../types";

const name = 'lobby';

export const LEVEL_06: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 40,
  numApplesStart: 5,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
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
XXXX~  -=+=+==--==+=+=-  ~XXXX
XXXX~   ------  ------   ~XXXX
XXXX~~~ ~  ~   ~  ~ ~  ~~~XXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: PALETTE.cornflower,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.lordy,
};
