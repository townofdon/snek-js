import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_15 } from "../bonusLevels/variantLevel15";

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
  layoutV2: 'CnZKalhTcX4pITZWKlYxV1chfld6cX4penZYVjktV08tLVctN1Z2SgoobXBMVjlZT1k3VkxwZCgKSitKTFY5KS1PWS03VkxKK1BrWCp1eFh4VjZvWW8yVnhYS3daZWd0eHVYCitYX254ZXhWaWRBZEFkX1grCitYX2RBZEFkaVZ4eXhuX1grClh1eHRneVp3S1h4VjJvWW80VnhYeHUqWGtQK0pMVjApLU9ZLThWTEorSgoobXBMVjBZT1k4VkxwbSgKdkpWMC1XTy0tVy04VnZYKnE4YmI5Vyl6VjFXVyE4YmI5V1d6cThiYjlXKSE0VlN2WGpKCnw0NjR8UklHSFR8dGVzdCBjaGFtYmVyfDEzNTAwZjZmMWZmM3wwLjV8ZjF8I0RCQUU5NU1DMjdBNTBNMTYxOTI1TUE1QTZBN004N0EyQzBNMUYyMzMzTTE2MTkyNU0yNzJDM0ZNMUYyMzMzTUNCQ0RDRE1EMkQ0RDRNNzI5RkMwTTQ2Nzc5Qk00QzgyQTl8MC0wLTEtMC0xLTEtMC0wLTAtZjE1fDBvICgsJ1ktLSpYClhKWFhLeHUqdXhNLSNPLT1QWCpYKEpfX19fKCgoKF9fK18oKCgoX19fX0ooWCpYcCtTKnZKbXIobChyWFZWWHIobChybXZKKlVkZGRXISFZKS0tWktieFYyTykpPS0yVnhiS2YwfGd4VjItICkpIC0yVnhpMi1PPS0hTz0tLTJqTm1tVW1YUVhtVW1tTnZrKHZtclVVVVVybXYobyEgcFErcVYxISlXdVZBVnZKSndieFYyKSkpMlZ4YnohM1YqfjdiYjBXAX56d3Z1cXBva2ppZ2ZaWVdVU1FQT01LSiopKCFf',
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
    ["Teleportation, molecular decimation, breakdown, reformation, is inherently snek."],
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
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: false,
  },
  pickupDropsByFrame: {
    59: { likelihood: 1, type: ItemDropType.Invincibility },
  },
};
