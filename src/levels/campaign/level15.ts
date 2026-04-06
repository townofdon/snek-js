import Color from "color";
import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'quantum mirror'

export const LEVEL_15: Level = {
  id: 'C15',
  name,
  timeToClear: 1000 * 60 * 1.3,
  parTime: toTime({ minutes: 1, seconds: 5 }),
  applesToClear: 60,
  numApplesStart: 10,
  growthMod: 0.4,
  layout: `
XXXXXXXXXXXX+++XXXXXXXXXXXXXXX
XX1111111111DDDXXXXXXXXXXXXXXX
XX  ------~~XXXX~~        ~~XX
XX  ------~~XXXX~          ~XX
XX  ======--7X7-            XX
+X--=-==-=--7X7-----=-  -=-__d
+X--==--==--7X7-------  ----_d
+X--==--==--7X7-------  ----_d
+X--=-==-=--7X7-----=-  -=-__d
XX  ==--==--7X7-            XX
XX  ==--==--7X7-            XX
XX  =-==-=~~XXXX            XX
XX~~======~~XXXX~          ~XX
XX~~------~~DDDDDDXXXXXXXXXX+_
XX~~------~~DaaaaDXXXXXXXXXX+_
_+XXXXXXXXXXDa__aD~~------~~XX
_+XXXXXXXXXXDD++DD~~------~~XX
XX~~~~    ~~~~XXXX~ ======~~XX
XX~          ~XXXX~ =-==-=  XX
XX~           -4X4- ==--==  XX
XX   O        -4X4- ==--==  XX
d__-=-  -=-----4X4--=-==-=--X+
d_----  -------4X4--==--==--X+
d_----  -------4X4--==--==--X+
d__-=-  -=-----4X4--=-==-=--X+
XX           --4X4- ======~ XX
XX~          ~XXXX~~------~ XX
XX~~~       ~~XXXX~~------~ XX
XXXXXXXXXXXXXXXDDD1111111111XX
XXXXXXXXXXXXXXX+++XXXXXXXXXXXX
  `,
  layoutV2: 'S2VlZWVleFEqKlhLZmZ3ZFEqKlhLIVUoTyghISEhWWohVShPTShqISkpY2VTVlZTSyF6Y2VLIXpjaiFMWVhiYlhNIWpZKSkpKE9NKGpZVVl3d3dRKF9LWVVZZEFBQUFkUShfCl8oUWRBX19BZFlVWXlfKFF3a3dZVVlqWVkhIVkoTyApKSlZaihNTyBMIWooTSAtWkopIXllTSEtWkopISpQVwpXUGVNIEpaKSlwKE1PKFVwWSghISEgKE8oVXBRKnF3ZGZmalEqbXhlZWVlZXl8NjA1fFJJR0hUfHF1YW50dW0gbWlycm9yfDc4MDBoNmgxaGgzfDAuNHxoMXwjRTc2RjUxTkUyNEQyOHM3NTA1QU4yRjQ0NER%252BczAzNDM2fk4yQTlEOEZOMkZCMUEyTkY0QTI2MU5FOUM0NkFORTlEM0E3fGxsbDF8MTZ8MyEgICgsJyk9PSpYWEotLUsKKkw9LSlnTSEhISEhTi0jTyhYYmJYKFAKZF9fZy0hZ0pKLTR2NEpMSlgoClEqKioqKlMKKFhKTEo3djdKSmctIWctX19kVUpKSlYKKFhKeno3djdVLSFKSl9kV2RfSkohVS00djRKenpYKFkoKFo0djQtICljejd2Ny1NIWV2dmYxMTExMWctPWgwfGoqS3grbDEtMS0xLXAoIGpzTjFEMjAyME4zd2RkeGsreSoKeilKfk4yNjJBMkIBfnp5eHdzcGxramhnZmVjWllXVlVTUVBPTk1MS0oqKSghXw%253D%253D',
  colors: getExtendedPalette({
    ...PALETTE.boxcar,
    barrier: Color(PALETTE.boxcar.barrier).lighten(0.2).desaturate(0.35).hex(),
    barrierStroke: Color(PALETTE.boxcar.barrierStroke).lighten(0.2).darken(0.15).desaturate(0.35).hex(),
    background: PALETTE.darkStar.background,
    deco1: PALETTE.darkStar.deco1,
    deco1Stroke: PALETTE.darkStar.deco1Stroke,
    deco2: PALETTE.darkStar.deco2,
    deco2Stroke: PALETTE.darkStar.deco2Stroke,
  }),
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
  showTitle: true,
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.lostcolony,
  extraLoseMessages: [
    ["Quantum snekanics confounds even the brightest minds."],
    ["I daresay that was one teleport too many."],
  ],
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: true,
  },
  pickupDropsByFrame: {
    20: { likelihood: .2, type: ItemDropType.Invincibility },
    30: { likelihood: .2, type: ItemDropType.Invincibility },
    35: { likelihood: .5, type: ItemDropType.Mine },
    40: { likelihood: .3, type: ItemDropType.Invincibility },
    45: { likelihood: .5, type: ItemDropType.Mine },
    50: { likelihood: .3, type: ItemDropType.Invincibility },
    55: { likelihood: .5, type: ItemDropType.Mine },
    59: { likelihood: .4, type: ItemDropType.Invincibility },
    65: { likelihood: .5, type: ItemDropType.Mine },
    70: { likelihood: .5, type: ItemDropType.Mine },
    75: { likelihood: .5, type: ItemDropType.Mine },
  },
};
