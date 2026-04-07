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
  layoutV2: 'CnVKalhTcHopITZWKlYxV1cheld3cHopd3VYVjktV08tLVctN1Z1SgoobW9MVjlZT1k3VkxvZCgKSitKTFY5KS1PWS03VkxKK1BrWCpxeFh4VjZuWW4yVnhYS3ZmWnR4cVgKK1hfWHhleFZpZEFkQWRfWCsKK1hfZEFkQWRpVnh5eFhfWCsKWHF4WnlmdktYeFYyblluNFZ4WHhxKlhrUCtKTFYwKS1PWS04VkxKK0oKKG1vTFYwWU9ZOFZMb20oCnVKVjAtV08tLVctOFZ1WCpwfil3VjFXVyF%252BV3dwfikhNFZTdVhqSgp8NDY0fFJJR0hUfHRlc3QgY2hhbWJlcnwxMzUwMGc2ZzFnZzN8MC41fGcxfCNEQkFFOTVNQzI3QTUwTTE2MTkyNU1BNUE2QTdNODdBMkMwTTFGMjMzM00xNjE5MjVNMjcyQzNGTTFGMjMzM01DQkNEQ0RNRDJENEQ0TTcyOUZDME00Njc3OUJNNEM4MkE5fDAtMC0xLTAtMS0xLTAtMC0wLWcxNXwwbiAoLCdZLS0qWApYSlhYS3hxKnF4TS0jTy09UFgqWChKX19fXygoKChfXytfKCgoKF9fX19KKFgqWG8rUyp1Sm1yKGwoclhWVlhyKGwocm11SipVZGRkVyEhWSktLVpleFYyLSApKSAtMlZ4ZktieFYyTykpPS0yVnhiS2cwfGkyLU89LSFPPS0tMmpObW1VbVhRWG1VbW1OdWsodW1yVVVVVXJtdShuISBvUStwVjEhKVdxVkFWdUpKdmJ4VjIpKSkyVnhidyEzVip6N2JiMFd%252BOGJiOVcBfnp3dnVxcG9ua2ppZ2ZaWVdVU1FQT01LSiopKCFf',
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
