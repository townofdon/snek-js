import { PALETTE, getExtendedPalette } from "../../palettes";
import { TitleScene } from "../../scenes/TitleScene";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { VARIANT_LEVEL_10 } from "./variantLevel10";

const name = 'secret area 5-1';

export const SECRET_LEVEL_21: Level = {
  type: LevelType.Level,
  name,
  timeToClear: Infinity,
  applesToClear: 12,
  applesModOverride: 1,
  disableAppleSpawn: true,
  numApplesStart: 0,
  // appleSlowdownMod: 0.75,
  extraHurtGraceTime: 30,
  // snakeStartSizeOverride: 150,
  growthMod: 0,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XAAxDDDXXXX33333333XXXXDDDxAAX
XAXXDDDXx            xXDDDXXAX
XAXXDDDX ------------ XDDDXXAX
XxXXKKKX -          - XKKKXXxX
X      X -     k    - X      X
X XX   X ------------ X   XX X
X XX===Xx     --     xX===XX X
X XX   XXXXXXXXXXXXXXXX   XX X
X X    -=     --     =-    X X
X X    -=    A==A    =-    X X
X X    -=    A==A    =-    X X
X X    -=            =-    X X
X XX   -=XX11111111XX=-   XX X
XAdXXXXXXXXXXXXXXXXXXXXXXXXdAX
XAdXXXXXXXXXXXXXXXXXXXXXXXXdAX
X XX   -=XX33333333XX=-   XX X
X X    -=            =-    X X
X X    -=    A==A    =-    X X
X X    -=    A==A    =-    X X
X X    -=     --     =-    X X
X XX   XXXXXXXXXXXXXXXX   XX X
X XXJJJXx     --     xXJJJXX X
X XX   X ------------ X   XX X
X  -   X -  j       - X      X
Xxx=-  X -          - XKKKXXXX
XDD=-  X ------------ XKKK==xx
X--O   Xx            xXKKK----
XDDD   XXXX11111111XXXXKKK==xx
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.panopticon),
  showTitle: true,
  showQuoteOnLevelWin: false,
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
    2: PortalExitMode.InvertDirection,
    3: PortalExitMode.InvertDirection,
    4: PortalExitMode.InvertDirection,
    5: PortalExitMode.InvertDirection,
    6: PortalExitMode.InvertDirection,
    7: PortalExitMode.InvertDirection,
    8: PortalExitMode.InvertDirection,
    9: PortalExitMode.InvertDirection,
    0: PortalExitMode.InvertDirection,
  },
  musicTrack: MusicTrack.slime_exitmusic,
  globalLight: 0.2,
  nextLevel: VARIANT_LEVEL_10,
};
