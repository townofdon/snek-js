import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_10 } from "../level10";
import { VARIANT_LEVEL_10 } from "./variantLevel10";

const name = 'secret area 5-2';

export const SECRET_LEVEL_20: Level = {
  type: LevelType.Level,
  name,
  timeToClear: Infinity,
  applesToClear: 65,
  applesModOverride: 1.5,
  disableAppleSpawn: true,
  numApplesStart: 0,
  appleSlowdownMod: 0.75,
  extraHurtGraceTime: 30,
  // snakeStartSizeOverride: 150,
  growthMod: 0,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXxAAxx=--          --=xxAAXXX
XXxXXXX-XXXXXXXXXXXXXX-XXXxXXX
XXxXXX  X1 k        1X  XXxXXX
XX      XXXXX KK XXXXX     XXX
X  XXXXXX     KK     XXXXX  XX
X  XAAAAA XXXXDDXXXX AAA X  XX
XKXXAXXXXXXXX  j XXXXXXX X   X
X   AX AAAA L    L AAA X XX  X
X  XXX XXXXXX XX XXXXX X  X  X
X  X L X AAAA XX AAA X Xx X  X
XA X XLX XXXXXXXXXXX X Xx XX X
XA XlXLX X AAA AAA X XLXx  XAX
X  X J X X XXXXXXX X ALXxXAXAX
X  XXX X X X   O X XXALXAXAXAX
X   XXAX X XXXXX X XXALXAXAXAX
X X  XAX X  AAA  X X ALXxXAXAX
XLXXAXAX XXXXXXXXX X XLXx  XAX
XAXXAXAX AAAA  AAA X X Xx XX-X
XAXXAXAXXXXXXXXXXXXX X Xx X-=X
XAXX X        XX     X X  X-=X
X XX XXXXXXXXAAAAXXXXX X XX-=X
XA X AAAA   LLLLLL     X X=-=X
XA XXXXXXXXXXXXXXXXXXXXX X=-=X
X  AAA AA AAA XX AAA AAA X=-=X
XXXXXXXXXXXXd-XX-dXXXXXXXX=-=X
-==K=-      d----d     -=K- -x
-==K=-  AAA dddddd AAA -=K- -x
-==K=-      AAAAAA     -=K- -x
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.hospital),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: false,
  portalExitConfig: {
    1: PortalExitMode.SameDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
    5: PortalExitMode.SameDirection,
    6: PortalExitMode.SameDirection,
    7: PortalExitMode.SameDirection,
    8: PortalExitMode.SameDirection,
    9: PortalExitMode.SameDirection,
    0: PortalExitMode.SameDirection,
  },
  nextLevelMap: {
    [getCoordIndex2(29, 26)]: VARIANT_LEVEL_10,
    [getCoordIndex2(29, 27)]: VARIANT_LEVEL_10,
    [getCoordIndex2(29, 28)]: VARIANT_LEVEL_10,
  },
  musicTrack: MusicTrack.creeplord,
  globalLight: 0.2,
  nextLevel: LEVEL_10,
};
