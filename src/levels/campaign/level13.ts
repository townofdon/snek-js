import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'SCI-LAB'

export const LEVEL_13: Level = {
  id: 'C13',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 1, seconds: 0 }),
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.25,
  layout: `
XXXddXXXXXXXXXXXXXXXXXXXXXXXXX
XXXddXXXXXXXXXXXXXXXXXXXXXXXXX
XXXddX4=-  -==-        -=---2X
XXXddX4=-  -==-        -==--2X
XXXddX4=-  -==-        -==--2X
XXXddX4=-  -==-        -=---2X
XXXddXXXXXXXXXXXXXXXXXXXXddXXX
XXXddXXXXXXXXXXXXXXXXXXXXaaXXX
XXXddXXXXXXXXXXXXXXXXXXXXaaXXX
X2---=-       -==-   -=1XaaXXX
X2--==-       -==-   -=1XaadXX
X2--==-O      -==-   -=1XaadXX
X2---=-       -==-   -=1XaaXXX
XXXddXXXXXXXXXXXXXXXXXXXXaaXXX
XXXaaXXXXXXXXXXXXXXXXXXXXaaXXX
XXXaaXXXXXXXXXXXXXXXXXXXXddXXX
XXXaaX1=-  -==-        -=---3X
XXdaaX1=-  -==-        -==--3X
XXdaaX1=-  -==-        -==--3X
XXXaaX1=-  -==-        -=---3X
XXXaaXXXXXXXXXXXXXXXXXXXXddXXX
XXXaaXXXXXXXXXXXXXXXXXXXXddXXX
XXXddXXXXXXXXXXXXXXXXXXXXddXXX
X3---=-       -==-   -=4XddXXX
X3--==-       -==-   -=4XddXXX
X3--==-       -==-   -=4XddXXX
X3---=-       -==-   -=4XddXXX
XXXXXXXXXXXXXXXXXXXXXXXXXddXXX
XXXXXXXXXXXXXXXXXXXXXXXXXddXXX
XXXXXXXXXXXXXXXXXXXXXXXXXddXXX
  `,
  layoutV2: 'KlBvJ1gKWFhOUE5vZVB2NChuWVFZUVlueFhxYlB6eWJXem1iVydwJ2hocHptZ3Rnd0pYcmtsblpacypsbnMqV2Jya1dibWtQYndYTS0pfmF%252BYX4tKTR2UGVva29OUE5YWCpvWHV8MzM3fFJJR0hUfFNDSS1MQUJ8OTAwMF82XzFfXzN8MC4yNXxfMXwjODNFQ0QzSzIxRDRXSzJDMkEzOEtDQkNEQ0RLRDJENEQ0ZjczNDQ2SzQ5NDU1RWY0M0Y0N0s0RTY5N0NLRTFXNTFLREM5OTJFS0VEQ0I5NnxjY2MxfDE0fDAhUU9PaidYWFgoUU9pISAtYSFpUWppKgonbycnJ0stI011djNuaiBQZGRRPS1VClgybldBQVl4djQoWnMKVlZkbFFfMHxhPSliSidjMS0xLTEtZScqZks0MDNENTJLM2dKWG1YV2VXWGhVYTF2V2RWVmktPWpPIGtYUGVsV3YxKG4tLW9iJ3BVLSkxdldzLTNYdVAnCngtMnYqUHplUFh%252BNHZNAX56eHVzcG9ubGtqaWhnZmVjYmFfWllXVVFQT01LSiopKCchXw%253D%253D',
  colors: getExtendedPalette(PALETTE.scienceLab),
  showTitle: true,
  showQuoteOnLevelWin: true,
  portalExitConfig: {
    1: PortalExitMode.SameDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
  },
  extraLoseMessages: [
    ["This level really messes with your head, doesn't it?"],
  ],
  musicTrack: MusicTrack.woorb,
  titleVariant: TitleVariant.GrayBlue,
  pickupDropsByFrame: {
    54: { likelihood: .4, type: ItemDropType.Invincibility },
    99: { likelihood: .4, type: ItemDropType.Invincibility },
  },
};
