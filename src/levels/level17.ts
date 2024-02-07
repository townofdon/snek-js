import Color from "color";
import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../types";

// const name = 'packed'
const name = 'ensnare'

export const LEVEL_17: Level = {
  name,
  timeToClear: 1000 * 60 * 1.3,
  applesToClear: 20,
  numApplesStart: 0,
  growthMod: 0.01,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 2,
  extraHurtGraceTime: 40,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X  k  XX -=aaaaa-aaaaa=- XXXXX
X XXX XX -=XXXXXXXXXXX=- d - X
X XXX d  -=XXX-- --XXX=- --X-X
X XXX d  -=XXXXXXXXXXX=- d - X
X  -  d  -=aaaaa-aaaaa=- XXKXX
XXXKXXXXXXXXXXX-=-XXXXXXXXXKXX
X - - daaaad    =    daaad - X
X-=-=-XXXXdd ==-=-== ddXXX-=-X
X-=-=-XXXX      X  aaa XXX-=-X
X - - XXXX ==== X ==== XXX - X
XXXdXXX -X --o  -      XXXXdXX
XXXdXX -=X== =aXXX = ==X=-   X
XXXKXX -=X   =aX-X =   X=-a  X
dLLKJJ -=X = =aX-X = = X=-a  X
dLKKKJ---d =   =-=   = d-a-a-X
dLLKJJ -=X = = X-Xa= = X=-a  X
XXXKXX -=X   = X-Xa=   X=-a  X
XXXdXX -=X== = XXXa= ==X=-   X
XXXdXXX -X      -      XXXdXXX
X - - XXXX ==== X ==== X  j  X
X-=-=-XXXX aaa  X      X  X  X
X-=-=-XXXXdd ==-=-== ddX  X  X
X - - daaaad    =    daJ     X
XXXLXXXXXXXXXXX-=-XXXXXXXXXLXX
X  -  d  -=aaaaa-aaaaa=- d a X
X XXX d  -=XXXXXXXXXXX=- daXaX
X XXX XX -=XXXXXXXXXXX=- XaXaX
X  l  XX -=aaaaa-aaaaa=- X a X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: {
    // ...PALETTE.hospital,
    ...PALETTE.forest,
    ...PALETTE.violetSunset,
  },
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
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.skycastle,
  globalLight: 0.5,
};
