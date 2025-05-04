import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, TitleVariant } from "../types";
import { getCoordIndex2, toTime } from "../utils";
import { WARP_ZONE_02 } from "./bonusLevels/warpZone02";

const name = 'turnonadime';

export const TUTORIAL_LEVEL_20: Level = {
  id: 'C120',
  name,
  timeToClear: 1000 * 60 * 5,
  parTime: toTime({ minutes: 1, seconds: 10 }),
  applesToClear: 43,
  numApplesStart: -1,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 4,
  growthMod: 0,
  extraHurtGraceTime: 30,
  layout: `
XXXXXXXXXXXXX~~~~XXX_~_______~
Xaaaaaa    XXX  XXX - -=   =_~
XaXXXXXXXX XXXXXXXXX- ------_~
XaXXX--XXX XXX--XXX -        ~
XaX-X--X-XaX X--X XX---------_
XaX-X--X-XaX X--X X X X X X X~
X X-X--X-XaXXX--XXXXXXXXXXXXXX
X X-XXXX-XaXXXXXXXXXXXXXXXXXXX
X X-X--X-XaXXX--XXXXXXX--XXXXX
X X-X--X-XaX-X--X-XXX-X--X-XXX
X X-X--X-XaX-X--X-XXX-X--X-XXX
X XXX--XXXaXXX--XXXXXXX--XXXXX
X XXXXXXXXaXXXXXXXXXXXXXXXXXXX
XaXXXXXXXXaXXXXXXXXXXXXXXXXXXX
XaXX   O           aaaaaaaa  X
Xaaa       aaaaaaa           X
XXXXXXXXXX XXXXXXXXXXXXXXXXXXX
XXXXXXXXXXaXXXXXXXX aaaaaaaa X
XXXXXXXXXXaXXX--XXX XXXXXXXX X
XXXXXXXXXXaX-X--X-X XXXddXXX X
~X X XXXXXaX-X--X-X XddddddX X
_---XXXXXXaX-X--X-X XXXddXXXaX
+==- XXXXXaX-XXXX-X XXXddXXXaX
+==-XXXXXXaX-X--X-X XXX--XXXaX
_--- XXXXXaX-X--X-X X-X--x-xDX
~  -XXXXXX X-X--X-XaX-X--x-xDX
~  - XXXXX XXX--XXXaXXX--XXXDX
_---XXXXXX XXXXXXXXaXXXxxXXXDX
+==- XXXXX     aaaaaXXX  XXXDX
+++_XXXXXXXXXXXXXXXXX      XDX
  `,
  colors: getExtendedPalette({
    ...PALETTE.violetSunset,
    playerHead: PALETTE.plumsea.playerHead,
    playerTail: PALETTE.plumsea.playerTail,
    playerTailStroke: PALETTE.plumsea.playerTailStroke,
  }),
  showTitle: true,
  musicTrack: MusicTrack.aqueduct,
  titleVariant: TitleVariant.GrayBlue,
  globalLight: 0.85,
  nextLevelMap: {
    [getCoordIndex2(23, 28)]: WARP_ZONE_02,
    [getCoordIndex2(24, 28)]: WARP_ZONE_02,
  },
};
