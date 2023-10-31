import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, PortalExitMode } from "../types";

const name = 'Grav chamber'

export const LEVEL_13: Level = {
  name,
  timeToClear: 1000 * 60 * 2.25,
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.5,
  layout: `
XXXXXXXXX~~~XXXXXX~~~XXXXXXXXX
XXXXXXXXXDDDX+__+XDDDXXXXXXXXX
XX1  ----    7XX0    ----  6XX
XX1          7XX0          3XX
XX1  ----    7440    ----  3XX
XXXXXXX9-    -=--    -7XXXXXXX
DDDDDDX9-------=------7XDDDDDD
XXXXXXX9------=-------7XXXXXXX
X5   ----    --=-    ----   2X
X2           -=--           2X
X2          ------          2X
X2--------------------------2X
X2=-=-=-=-=--------=-=-=-=-=2X
X2 - - - - -------- - - - - 2X
X2-==--==--==-  -==--==--==-2X
X2-==--==--==-  -==--==--==-2X
X2 - - - - -------- - - - - 2X
X2=-=-=-=-=--------=-=-=-=-=2X
X2--------------------------2X
X2          ------          2X
X2     O     -=--           2X
X2   ----    --=-    ----   5X
XXXXXXX0------=-------8XXXXXXX
DDDDDDX0-------=------8XDDDDDD
XXXXXXX0-    -=--    -8XXXXXXX
XX1  ----    8449    ----  3XX
XX1          8XX9          3XX
XX1  ----    8XX9    ----  6XX
XXXXXXXXXDDDX+__+XDDDXXXXXXXXX
XXXXXXXXX~~~XXXXXX~~~XXXXXXXXX
  `,
  colors: PALETTE.atomic,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.InvertDirection,
    4: PortalExitMode.SameDirection,
    5: PortalExitMode.SameDirection,
    6: PortalExitMode.InvertDirection,
    7: PortalExitMode.InvertDirection,
    8: PortalExitMode.InvertDirection,
    9: PortalExitMode.InvertDirection,
    0: PortalExitMode.InvertDirection,
  },
  extraLoseMessages: [
    ["Sneks were not meant to meddle in the ways of science."],
    ["This one was designed by a madman."],
  ],
};
