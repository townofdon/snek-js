import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, PortalExitMode, TitleVariant } from "../types";
import { getCoordIndex2 } from "../utils";
import { VARIANT_LEVEL_15 } from "./bonusLevels/variantLevel15";

const name = 'test chamber'

export const LEVEL_14: Level = {
  name,
  timeToClear: 1000 * 60 * 2.25,
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.5,
  layout: `
XXXXXXXXX_+_XX++XX_+_XXXXXXXXX
XXXXXXXXXDDDX4444XDDDXXXXXXXXX
XX1  ----    7xx0    ----  6XX
XX1          7xx0          3XX
XX1  ----    7xx0    ----  3XX
XXXXXXX9-    -=--    -7XXXXXXX
DDDDDxx9-------=------7xxDDDDD
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
DDDDDxx0-------=------8xxDDDDD
XXXXXXX0-    -=--    -8XXXXXXX
XX1  ----    8xx9    ----  3XX
XX1          8xx9          3XX
XX1  ----    8xx9    ----  6XX
XXXXXXXXXDDDX4444XDDDXXXXXXXXX
XXXXXXXXX_+_XX++XX_+_XXXXXXXXX
  `,
  layoutV2: `Ck9KWFVKU0pVbyhvak9qb2d6KiE2KDFWViF6ViEzZ3oqITMoSkpYOS1WTi0tVi03b3A5V05XN3F5SkxYOSotTlctN1hMeVF2KEFQNmRXZEsqKipLTioqWUtpMlBBSm5Qa0RBREFEX1grbkRBREFEa1BfWCsKSkFQMmlLTioqWUsqKipLZFdkNFBBKHZRK0pMWDAqLU5XLThYTHlKcDBXTlc4cW93Vk4tLVYtOEpKWGd%252BKiEzKDFWViF%252BViEzZ34qITQob2pPKWwpbyhvVUpTSlVPSlgKfDQ2NHxSSUdIVHx0ZXN0IGNoYW1iZXJ8MTM1MDBaNloxWlozfDAuNXxaMC44OHwjREJBRTk1TUMyN0E1MHVBNUE2QTdNODdBMkMwTTFGMjMzM3UyNzJDM0ZNMUYyMzMzTUNCQ0RDRE1EMkQ0RDRNNzI5RkMwTTQ2Nzc5Qk00QzgyQTl8d3cxLXcxLTEtd3d3MGQgKEoKSiksJ1ctLUpYWEsyUEEoQVAyTS0jTi09T0pKSlBYeFh4WFEoKUpfX19failfXytfailfX19fSikoZitVREREViEhVyotLVk9LVowfGQhIGZTK2coMSEqVmktICoqIC1qKSkpazItTlkhTlktMm4KK1hfb09YcAp4RGZMWHFYTGZEeAp1TTE2MTkyNU12KU9VVVVVTyl3MC15Sit6N0owVn44SjlWAX56eXd2dXFwb25ramlnZmRaWVdWVVNRUE9OTUtKKikoIV8%253D`,
  colors: getExtendedPalette(PALETTE.gravChamber),
  showTitle: true,
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
    ["Snek was not meant to meddle in the ways of science."],
    ["This one was designed by a madman."],
    ["Be careful, this level may tear a hole in the fabric of snektime."],
  ],
  musicTrack: MusicTrack.gravy,
  titleVariant: TitleVariant.Yellow,
  nextLevelMap: {
    [getCoordIndex2(0, 6)]: VARIANT_LEVEL_15,
    [getCoordIndex2(29, 6)]: VARIANT_LEVEL_15,
    [getCoordIndex2(0, 23)]: VARIANT_LEVEL_15,
    [getCoordIndex2(29, 23)]: VARIANT_LEVEL_15,
  },
  pickupDrops: {
    59: { likelihood: 1, type: PickupType.Invincibility },
  },
};
