import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, PortalExitMode } from "../types";

const name = 'DELTALAB'

export const LEVEL_12: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.25,
  layout: `
XXXDDXXXXXXXXXXXXXXXXXXXXXXXXX
XXXDDXXXXXXXXXXXXXXXXXXXXXXXXX
XXXDDX4=-  -==-        -=---2X
XXXDDX4=-  -==-        -==--2X
XXXDDX4=-  -==-        -==--2X
XXXDDX4=-  -==-        -=---2X
XXXDDXXXXXXXXXXXXXXXXXXXXDDXXX
XXXDDXXXXXXXXXXXXXXXXXXXXaaXXX
XXXDDXXXXXXXXXXXXXXXXXXXXaaXXX
X2---=-       -==-   -=1XaaXXX
X2--==-       -==-   -=1XaaDXX
X2--==-O      -==-   -=1XaaDXX
X2---=-       -==-   -=1XaaXXX
XXXDDXXXXXXXXXXXXXXXXXXXXaaXXX
XXXaaXXXXXXXXXXXXXXXXXXXXaaXXX
XXXaaXXXXXXXXXXXXXXXXXXXXDDXXX
XXXaaX1=-  -==-        -=---3X
XXDaaX1=-  -==-        -==--3X
XXDaaX1=-  -==-        -==--3X
XXXaaX1=-  -==-        -=---3X
XXXaaXXXXXXXXXXXXXXXXXXXXDDXXX
XXXaaXXXXXXXXXXXXXXXXXXXXDDXXX
XXXDDXXXXXXXXXXXXXXXXXXXXDDXXX
X3---=-       -==-   -=4XDDXXX
X3--==-       -==-   -=4XDDXXX
X3--==-       -==-   -=4XDDXXX
X3---=-       -==-   -=4XDDXXX
XXXXXXXXXXXXXXXXXXXXXXXXXDDXXX
XXXXXXXXXXXXXXXXXXXXXXXXXDDXXX
XXXXXXXXXXXXXXXXXXXXXXXXXDDXXX
  `,
  colors: PALETTE.scienceLab,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  portalExitConfig: {
    1: PortalExitMode.SameDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
  },
};
