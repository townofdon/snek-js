import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack } from "../types";

const name = 'INIT';

export const LEVEL_00: Level = {
  id: '',
  name,
  timeToClear: 1000 * 60 * 5,
  applesToClear: 43,
  numApplesStart: -1,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 4,
  growthMod: 0,
  layout: `
XXXXXXXXXXXXX    XXX- ------- 
Xaaaaaa    XXX  XXX - -=   =- 
XaXXXXXXXX XXXXXXXXX- ------- 
XaXXX--XXX XXX--XXX -         
XaX-X--X-XaX X--X XX----------
XaX-X--X-XaX X--X X X X X X X 
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
XXXXXXXXXXaX-X--X-X XXXDDXXX X
 X X XXXXXaX-X--X-X XDDDDDDX X
----XXXXXXaX-X--X-X XXXDDXXXaX
===- XXXXXaX-XXXX-X XXXDDXXXaX
===-XXXXXXaX-X--X-X XXX--XXXaX
---- XXXXXaX-X--X-X X-X--X-XDX
   -XXXXXX X-X--X-XaX-X--X-XDX
   - XXXXX XXX--XXXaXXX--XXXDX
----XXXXXX XXXXXXXXaXXXXXXXXDX
===- XXXXX     aaaaaXXX  XXXDX
===-XXXXXXXXXXXXXXXXX      XDX
  `,
  colors: getExtendedPalette({
    ...PALETTE.violetSunset,
    playerHead: PALETTE.plumsea.playerHead,
    playerTail: PALETTE.plumsea.playerTail,
    playerTailStroke: PALETTE.plumsea.playerTailStroke,
  }),
  musicTrack: MusicTrack.conquerer,
  globalLight: 0.4,
};
