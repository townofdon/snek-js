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
  layoutV2: 'dHRXdjQobWFQYVBhbXJzT1djV2NrZ2drV2NKVWNmSmptWVluSmptbmZmV3NNLSlvX29fby0pNHZsbGxxfDMzN3xSSUdIVHxTQ0ktTEFCfDkwMDBaNloxWlozcC4yNXxaMXwjODNFQ0QzSzIxRDRVSzJDMkEzOEtDQkNEQ0RLRDJENEQ0ZTczNDQ2SzQ5NDU1RWU0M0Y0N0s0RTY5N0NLRTFVNTFLREM5OTJFS0VEQ0I5NnxiYmIxfDE0cCFQTk5pJ1hYWChQTmghIC1fIWhQaWgqJycnJycnWEoKJ0stI01xdjNtaSBPZGQnUD0tUQpYMm1VQUFXSmRkWW4KVlZkalBaMHxfPSlhcnY0KGIxLTEtMS1jc1UnZUs0MDNENTJLM2ZKVXNPZ1FfMXZVZFZWaC09aU4galV2MShrUS0pMXZVJ2xPSicqbS0tbi0zWG80dk1wfDBxTwpyLTJ2V3MqWHRKTycqAXRzcnFwb25tbGtqaWhnZmVjYmFfWllXVVFQT05NS0oqKSgnIV8%253D',
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
