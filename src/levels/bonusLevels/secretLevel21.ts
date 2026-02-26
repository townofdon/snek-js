import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, LevelType, MusicTrack, PortalExitMode } from "../../types";
import { toTime } from "../../utils";
import { SECRET_LEVEL_20 } from "./secretLevel20";

const name = 'secret area 5-1';

export const SECRET_LEVEL_21: Level = {
  id: 'C321',
  type: LevelType.Level,
  name,
  timeToClear: Infinity,
  parTime: toTime({ minutes: 0, seconds: 20 }),
  applesToClear: 12,
  applesModOverride: 1,
  disableAppleSpawn: true,
  numApplesStart: 0,
  // appleSlowdownMod: 0.75,
  extraHurtGraceTime: 30,
  // snakeStartSizeOverride: 150,
  growthMod: 0,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XAAxDDDXXXX33333333XXXXDDDxAAX
XAXXDDDXx            xXDDDXXAX
XAXXDDDX ------------ XDDDXXAX
XxXXKKKX -          - XKKKXXxX
X      X -     k    - X      X
X XX   X ------------ X   XX X
X XX===Xx     --     xX===XX X
X XX   XXXXXXXXXXXXXXXX   XX X
X X    -=     --     =-    X X
X X    -=    A==A    =-    X X
X X    -=    A==A    =-    X X
X X    -=            =-    X X
X XX   -=XX11111111XX=-   XX X
XAdXXXXXXXXXXXXXXXXXXXXXXXXdAX
XAdXXXXXXXXXXXXXXXXXXXXXXXXdAX
X XX   -=XX33333333XX=-   XX X
X X    -=            =-    X X
X X    -=    A==A    =-    X X
X X    -=    A==A    =-    X X
X X    -=     --     =-    X X
X XX   XXXXXXXXXXXXXXXX   XX X
X XXJJJXx     --     xXJJJXX X
X XX   X ------------ X   XX X
X  -   X -  j       - X      X
Xxx=-  X -          - XKKKXXXX
XDD=-  X ------------ XKKK==xx
X--O   Xx            xXKKK----
XDDD   XXXX11111111XXXXKKK==xx
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  layoutV2: `ClVVKFpNQUF4YihnZzMzKGJ4QXBBWmJYeFZWeFhiWnBBWmJYTGJacHhaaFdoWnhYTVZXVlhNKlh1THUnWH5YeCFveFh%252BWCdYTlUodVFvKSlQIVFWISFQISdYTnZabW1aUCpYKk1BZFVVZHBBZFVVZHAqWE52WmdnMzNaUCpRViEhKSlQIVFvUCEnWE5VKHUnWEpKSlh4IW94WEpKSlgnWHVMdVgqTSEtdVlWWE14eFBYWWgoTWRkUFhMaFN4eE1fISFYeFZWeFhoX19NYk4obW0oaFN4eApVVShaCnw4MXdSSUdIVHxzZWNyZXQgYXJlYSA1LTF8SW5maW5pdHl8MTJ8dzF8d3ozejAuMnwjMTVDMkNCTzExOURBNHEyMzc1OE8yRTRBNzZPMUYyZ3E3MkMzRk8xRjJnTzRDODJBOU8zRjZDOERPRkZGNkYxTzBBMEUxNE9FOUVGRkZ8bGxsejI3fDBOICdYKk0qKFpaKVAhUSFBU0EhdSBYTCBfX19fX18qTQpYTiEgTy0jUD0tIVEnISF2IX49VSgoKFYhISFXWCAta2tra2tra2tray0qWSAtampqampqampqai0qWlhYXy0tYmRkZGczMzNoS0tLbDAtMC0wLW0xMTExb05fIU5wQVhNcU8xNjE5MjVPMnUhKnYtPXczfHowfH5TPQF%252Bend2dXFwb21saGdiX1pZV1ZVU1FQT05NTCopKCchXw%253D%253D`,
  colors: getExtendedPalette(PALETTE.panopticon),
  showTitle: true,
  showQuoteOnLevelWin: false,
  portalExitConfig: {
    1: PortalExitMode.InvertDirection,
    2: PortalExitMode.InvertDirection,
    3: PortalExitMode.InvertDirection,
    4: PortalExitMode.InvertDirection,
    5: PortalExitMode.InvertDirection,
    6: PortalExitMode.InvertDirection,
    7: PortalExitMode.InvertDirection,
    8: PortalExitMode.InvertDirection,
    9: PortalExitMode.InvertDirection,
    0: PortalExitMode.InvertDirection,
  },
  musicTrack: MusicTrack.slime_exitmusic,
  globalLight: 0.2,
  nextLevel: SECRET_LEVEL_20,
};
