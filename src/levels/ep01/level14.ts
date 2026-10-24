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
  layoutV2: 'CnVKalhVcHopITZWKlYxWVkhell3cHopd3VYVjktWU8tLVktN1Z1SgoobW9MVjlaT1o3VkxvZCgKSitKTFY5KS1PWi03VkxKK1BrWCpxeHt4VjZuWm4yVnh7S3ZnZnR4cVgKK1hfWHhleFZpZEFkQWRfWCsKK1hfZEFkQWRpVnh5eFhfWCsKWHF4Znlndkt7eFYyblpuNFZ4e3hxKlhrUCtKTFYwKS1PWi04VkxKK0oKKG1vTFYwWk9aOFZMb20oCnVKVjAtWU8tLVktOFZ1WCpwfil3VjFZWSF%252BWXdwfikhNFZVdVhqSgp8NDY0fFJJR0hUfHRlc3QgY2hhbWJlcnwxMzUwMFE2UTFRUTN8MC41fFExfCNEQkFFOTVNQzI3QTUwTTE2MTkyNU1BNUE2QTdNODdBMkMwTTFGMjMzM00xNjE5MjVNMjcyQzNGTTFGMjMzM01DQkNEQ0RNRDJENEQ0TTcyOUZDME00Njc3OUJNNEM4MkE5fDAtMC0xLTAtMS0xLTAtMC0wLVExNXxRUVFRUTFuICgsJ1otLSpYClhKWFhLeHEqcXhNLSNPLT1QWCpYKEpfX19fKCgoKF9fK18oKCgoX19fX0ooWCpYUTB8bytVKnVKVnIobChyWFZWWHIobChyVnVKKldkZGRZISFaKS0tZmV4VjItICkpIC0yVnhnS2J4VjJPKSk9LTJWeGJLaTItTz0tIU89LS0yak5WbVdtWFNYbVdtVk51ayh1bXJXV1dXcm11KG4hIG9TK3BWMSEpWXFWQVZ1Skp2YnhWMikpKTJWeGJ3ITNWKno3YmIwWX44YmI5WQF%252Bend2dXFwb25ramlnZlpZV1VTUVBPTUtKKikoIV8%253D',
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
