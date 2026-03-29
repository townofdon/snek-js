import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { SECRET_LEVEL_20 } from "../bonusLevels/secretLevel20";

const name = 'courtyard';

export const LEVEL_08: Level = {
  id: 'C08',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 0, seconds: 50 }),
  applesToClear: 70,
  numApplesStart: 10,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXX~~~~~~~~~~~~~XX~~~XXXXXX
+X~~~~                 ~~~~~Xx
+X~~~                     ~~Xx
XXX~                      ~XXX
XXX~       _-             ~XXX
XX~~     ~XX=-            ~XXX
XX~~     -XX_             ~~XX
XX_-     -+-        -      ~XX
XX+=-     -        -=-     ~XX
XX+==-             -XX-   ~~~X
XX+--              ~XX=-   ~~X
X__                 -=-    ~~X
X~_       -          -     ~XX
X~~      -=-    ---  -    ~~XX
X~~     -===- --===--=-   ~XXX
X~~     -==-    -=-  -   ~xddd
X~~     -=-      -       ~xddd
X~~      -               ~~XXX
X~~               ~       ~XXX
X~~               XX~     ~XXX
X~~              ~XX      ~~XX
XX~                ~      ~~XX
XX~                       ~XXX
XX~                      ~~XXX
+dX~       ~~~~~~~~      ~XXXX
+dX~~~   ~~~X~~~~X~~~   ~~XXXX
XX~~~~~~~~~XXDDDDXX~~~~~~~~XXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
XXXXXXXXXXXXDDDDDDXXXXXXXXXXXX
  `,
  layoutV2: 'KmpqampqampYKmpYV1dXcHNqT1FYV2YpVyhYeFFYc2ZMIUpYeCpPKGZMS3BYKk8obV8tTG1wWGdKKShWVk1mcFhnSmtWVl9MbUpPZ18taystIWtMcHFNayFrTSlwcWhMbS1WVi0hc1hxLS1MISkoVlZNIUpYKl9fZmtNS0pYKihfbS1MSy0pcGxMLU1LLS0tIG5LSmlsaz1obi09aC1NIX5sa2hLLU0gbiEoeFpsa01MLW0oeFpsTC1mIUpZbGYhKG1%252BbGYhQkIoKX5sTCEpKEJCeksoekwpfmcoZkxLSllRZFgobVdXTH52UWRYcyFzYldicyFKWXZnV1coYnZaZHZiV1dZCmlpaWlpWVpkUGlpaWJZdgp3d1pad3cKfDQ2NXxSSUdIVHxjb3VydHlhcmR8OTAwMFU3VTFVVTN8MXxVMC45fCNGRjRCMDBONzQyQTJBUzcwOEE5OU4zOTUwNTZTMzk1MDU2TjgzQTBBME45N0FGQUZONDNDNTlFTjNENzA2OE41NzlFOTN8ZWVlMXw5fDMpICgsJylLICoKWHMoSyEgTCEhTT0tTi0jT1hYUHZ2UQorU04yQjNENDFONEM1RjZCTlUwfFdKSlliUFpkZGRlMS0xLTEtZkxMZypYaD1NaWJiak9PayktbCpKbSFLbiAtcChPcWcrc0ood1BQUHpMSmJ2ZyhmfihZAX56d3NxcG5tbGtqaWhnZmVaWVdVU1FQT05NTEtKKikoIV8%253D',
  colors: getExtendedPalette(PALETTE.forest),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.skycastle,
  titleVariant: TitleVariant.Green,
  globalLight: 0.9,
  nextLevelMap: {
    [getCoordIndex2(29, 16)]: SECRET_LEVEL_20,
    [getCoordIndex2(29, 17)]: SECRET_LEVEL_20,
  },
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: 2,
  },
  pickupDropsByFrame: {
    30: { likelihood: .1, type: ItemDropType.Invincibility },
    60: { likelihood: .2, type: ItemDropType.Invincibility },
    69: { likelihood: .3, type: ItemDropType.Invincibility },
    99: { likelihood: .3, type: ItemDropType.Invincibility },
    104: { likelihood: .4, type: ItemDropType.Invincibility },
  },
};
