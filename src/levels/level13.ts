import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, PickupType, PortalExitMode, TitleVariant } from "../types";
import { toTime } from "../utils";

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
  pickupDrops: {
    54: { likelihood: .4, type: PickupType.Invincibility },
    99: { likelihood: .4, type: PickupType.Invincibility },
  },
};
