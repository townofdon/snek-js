import Color from "color";
import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode, TitleVariant } from "../types";

const name = 'hidden temple'

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
X XXX XX -=XXXXXXXXXXX=- x - X
X XXX d  -=XXX-- --XXX=- --X-X
X XXX d  -=XXXXXXXXXXX=- x - X
X  -  d  -=aaaaa-aaaaa=- XXKXX
XXXKXXXXXXXXXXX-=-XXXXXXXXXKXX
X - - xaaaax    =    xaaax - X
X-=-=-XXXXxx ==-=-== xxXXX-=-X
X-=-=-XXXX      X  aaa XXX-=-X
X - - XXXX ==== X ==== XXX - X
XXXdXXX -X --O  -      XXXXxXX
XXXdXX -=X== =aXXX = ==X=-   X
XXXKXX -=X   =aX-X =   X=-a  X
dLLKJJ -=X = =aX-X = = X=-a  X
dLKKKJ---d =   =-=   = d-a-a-X
dLLKJJ -=X = = X-Xa= = X=-a  X
XXXKXX -=X   = X-Xa=   X=-a  X
XXXdXX -=X== = XXXa= ==X=-   X
XXXdXXX -X      -      XXXxXXX
X - - XXXX ==== X ==== X  j  X
X-=-=-XXXX aaa  X      X  X  X
X-=-=-XXXXxx ==-=-== xxX  X  X
X - - xaaaax    =    xaJ     X
XXXLXXXXXXXXXXX-=-XXXXXXXXXLXX
X  -  d  -=aaaaa-aaaaa=- x a X
X XXX d  -=XXXXXXXXXXX=- xaXaX
X XXX XX -=XXXXXXXXXXX=- XaXaX
X  l  XX -=aaaaa-aaaaa=- X a X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette({
    // ...PALETTE.hospital,
    ...PALETTE.forest,
    ...PALETTE.violetSunset,
  }),
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
  musicTrack: MusicTrack.stonemaze,
  globalLight: 0.5,
  pickupDrops: {},
};
