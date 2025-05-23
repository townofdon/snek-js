import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, PortalExitMode, TitleVariant } from "../types";
import { getCoordIndex2, toTime } from "../utils";
import { VARIANT_LEVEL_15 } from "./bonusLevels/variantLevel15";

const name = 'test chamber'

export const LEVEL_14: Level = {
  id: 'C14',
  name,
  timeToClear: 1000 * 60 * 2.25,
  parTime: toTime({ minutes: 0, seconds: 50 }),
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
  layoutV2: `Ck9KWFVKU0pVcChwa09rcGl%2BKiE2KDFWViF%2BViEzaX4qITMoSkpYOS1WTi0tVi03cHE5V05XN1hMZ2R4eXpMWDkqLU5XLTdYTEorUXYoQVA2ZldmSyoqKktOKipZS2oyUEFKb1BuZEFkQWRfWCtvZEFkQWRuUF9YK3lBUDJqS04qKllLKioqS2ZXZjRQQSh2UXpMWDAqLU5XLThYTEp6cTBXTlc4WExnWHgKcHdWTi0tVi04SkpYaThKOVYqITMoMVZWIThKOVZWITNpOEo5ViohNChwa08pbClwKHBVSlNKVU9KWAp8NDY0fFJJR0hUfHRlc3QgY2hhbWJlcnwxMzUwMFo2WjFaWjN8MC41fFowLjY1fCNEQkFFOTVNQzI3QTUwdUE1QTZBN004N0EyQzBNMUYyMzMzdTI3MkMzRk0xRjIzMzNNQ0JDRENETUQyRDRENE03MjlGQzBNNDY3NzlCTTRDODJBOXx3dzEtdzEtMS13d3daMTVmIChKeSksJ1ctLUpYWEsyUEEoQVAyTS0jTi09T0pKSlBYeFh4WFEoKUpfX19faylfXytfaylfX19fSikoZytVZGRkViEhVyotLVk9LVowfGYhIGdTK2koMSEqVmotICoqIC1rKSkpbjItTlkhTlktMm8KK1hfcE9YcQp4WGdMWHVNMTYxOTI1TXYpT1VVVVVPKXcwLXkKSnorSn43SjBWAX56eXd2dXFwb25ramlnZlpZV1ZVU1FQT05NS0oqKSghXw%3D%3D`,
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
