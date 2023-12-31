import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";

const name = 'turnonadime';

export const TUTORIAL_LEVEL_20: Level = {
  name,
  timeToClear: 1000 * 60 * 5,
  applesToClear: 43,
  numApplesStart: -1,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 4,
  growthMod: 0,
  extraHurtGraceTime: 30,
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
XXXXXXXXXXaX-X--X-X XXXddXXX X
 X X XXXXXaX-X--X-X XddddddX X
----XXXXXXaX-X--X-X XXXddXXXaX
===- XXXXXaX-XXXX-X XXXddXXXaX
===-XXXXXXaX-X--X-X XXX--XXXaX
---- XXXXXaX-X--X-X X-X--X-XDX
   -XXXXXX X-X--X-XaX-X--X-XDX
   - XXXXX XXX--XXXaXXX--XXXDX
----XXXXXX XXXXXXXXaXXXXXXXXDX
===- XXXXX     aaaaaXXX  XXXDX
===-XXXXXXXXXXXXXXXXX      XDX
  `,
  colors: {
    ...PALETTE.violetSunset,
    playerHead: PALETTE.plumsea.playerHead,
    playerTail: PALETTE.plumsea.playerTail,
    playerTailStroke: PALETTE.plumsea.playerTailStroke,
  },
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  musicTrack: MusicTrack.aqueduct,
  titleVariant: TitleVariant.GrayBlue,
  globalLight: 0.7,
};
