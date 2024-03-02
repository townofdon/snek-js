import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, PortalExitMode } from "../types";
import { getCoordIndex2 } from "../utils";
import { VARIANT_LEVEL_99 } from "./bonusLevels/variantLevel99";

const name = 'escada';

export const LEVEL_19: Level = {
  name,
  timeToClear: 1000 * 60 * 5,
  applesToClear: 70,
  numApplesStart: 10,
  growthMod: 0.25,
  extraHurtGraceTime: 15,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X            ----===0X8====9XX
X            ----===0X8----9XX
X            --XXXXXXX8====9XX
X            --X7===8XXXXXXXXX
X-=  =-      --X7---8XX~_l_~XX
X-    -XXXXXXXLX7===8XXJKKKJXX
X_    _X6===7XLXXXXXXXXJJKJJXX
X__--__X6---7X---      -=-=-XX
XXXXXXXX6===7X---       -=- XX
XX5===6XXXXXXX---           XX
XX5---6X     ----           XX
XX5=k=6X     ----           XX
XXXXXXXX   O=----=---------=1X
X9=---------=-  -=---------=1X
X9=---------=-  -=---------=1X
X9=---------=----=    XXXXXXXX
XX           ----     X4===5XX
XX           ----     X4-j-5DL
XX           ---XXXXXXX4===5DX
XX           ---X3===4XXXXXXDX
XX           ---X3---4X__--__X
XXL_L_L_XXXXXXXLX3===4X_    _X
DD_L_L_LX2===3XLXXXXXXX-    -X
DDL_L_L_X2---3X-_      -=  =-X
XXXXXXXXX2===3X--            X
XX1====2XXXXXXX--            X
XX1----2X0===----            X
XX1====2X0===----            X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: getExtendedPalette(PALETTE.gravChamber),
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
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
  extraLoseMessages: [
    ["I've teleported so much my neurons are scrambled."],
    ["I'm curious - does consciousness transfer over when teleporting?"],
    ["Teleportation, molecular decimation, breakdown, reformation, is inherently purging. It makes a snek a king."],
    ["I hear playing SNEK rewires your brain..."],
  ],
  musicTrack: MusicTrack.ascension,
  nextLevelMap: {
    [getCoordIndex2(29, 18)]: VARIANT_LEVEL_99,
  },
};
