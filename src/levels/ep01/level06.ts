import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { TUTORIAL_LEVEL_51 } from "./tutorialLevel51";

const name = 'lobby';

export const LEVEL_06: Level = {
  id: 'C06',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 0, seconds: 50 }),
  applesToClear: 40,
  numApplesStart: 5,
  growthMod: 0.9,
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
Xxxx~  -=+=+==--==+=+=-  ~xxxX
XxXX~   ------  ------   ~XXxX
XxXX~~~ ~  ~   ~  ~ ~  ~~~XXxX
XxXXXXXXXXXXXXXXXXXXXXXXXXXXxX
XxXXXXXXXXXXXXXXXXXXXXXXXXXXxX
  `,
  layoutV2: 'CipXKSpjKFFZUVlZWVEoKikqISFPISEqKSpKYWFKKk1jKEphYS1ZY35naHpWWEpjWHZtKWZxZCghbm4hIW5KU3NkZ3NkKCFuUUxZUW5uc1hmKVhKY1h3bVZ6aGd%252BYyhKa2shWShNeHh4KCEtVVVLcksrVT0tWXh4dFooSk9uWnRaYyhRWW5ZUVljWnRXdFd4cXw0MzF8UklHSFR8bG9iYnl8OTAwMGk0aTV8aTN8MC45fGkxfCNFMzU3MEROQUU0MzBBcDM2NThBTjM3NkM5NXVwOTU3NkF1Tjg2QkJEOE43NEIxRDJORjZBRTJETkQ3OEYwOU5GOUNCNzZ8MS0wampqanw3fDBKUSwnKXFYKlpYSiEgSz09TCEhIU0pKiggLWVlLVEqKU4tI09ycnIhcnJyUF8rX1EgKFMoIVlVPStWKShKYypfK0wrXypjbilXKioqKioqKipaWSEoWlhYYS1LS0stYygoZStkZGRkZGQrZnZKKipYTCoqWEp2ZyhMTExMWWgpU1hQX0xfUFhTKWkwfGotMS0xay1VSys9LW1aX0xfWnZYY0pYbkoocE4yQjQxNTBOM3FYCnItLXNkCnR4KXh1TjJGNDg1OHpTWlBMUFpTfikoTE9MKCkBfnp1dHNycXBubWtqaWhnZmVjYVpZV1ZVU1FQT05NTEtKKikoIV8%253D',
  colors: getExtendedPalette(PALETTE.cornflower),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.lordy,
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
  },
  nextLevelMap: {
    [getCoordIndex2(1, 29)]: TUTORIAL_LEVEL_51,
    [getCoordIndex2(28, 29)]: TUTORIAL_LEVEL_51,
  },
  pickupDropsByFrame: {
    39: { likelihood: 1, type: ItemDropType.Invincibility },
    59: { likelihood: .8, type: ItemDropType.Invincibility },
  },
};
