import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, PickupType, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { SECRET_LEVEL_20 } from "./secretLevel20";
import { SECRET_LEVEL_21 } from "./secretLevel21";

const name = 'boneyard';

export const VARIANT_LEVEL_08: Level = {
  id: 'C208',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 1, seconds: 18 }),
  applesToClear: 70,
  numApplesStart: 10,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXX~~~~~~~~~~~~~XX~~~XXXXXX
DX~~~~                 ~~~~~XD
DX~~~                     ~~XD
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
X~~     -==-    -=-  -   ~xDDD
X~~     -=-      -       ~xDDD
X~~      -               ~~XXX
X~~               ~       ~XXX
X~~               XX~     ~XXX
X~~              ~XX      ~~XX
XX~                ~      ~~XX
XX~                       ~XXX
XX~                      ~~XXX
DDX~       ~~~~~~~~      ~XXXX
DDX~~~   ~~~X~~~~X~~~   ~~XXXX
XX~~~~~~~~~XXDDDDXX~~~~~~~~XXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
XXXXXXXXXXXXDDDDDDXXXXXXXXXXXX
  `,
  layoutV2: `CnZ2dlUpVVhnZ2coS3NVV2dRSmNnKFdzUW1PUU1LdFFjPSpxVmp4dEoqXy1KfmRaUChYV01jKEtWUSFkalhXTWMtS19RKlBNV19KbSstUS0qLXdKKi1RLVZtd1FRLUstKnNYCksrY34tLUohKEtWKk1YU19fT2QhZFEqLVZKTVhTKF9QWmtKLWMoKU1oLXFrLS1tSk0pTS1RSm0hPUooelhGU00tUUohWi0qTUxpU01rSm1%252BKk1MaVMoZGtRY016WEZTTVFKKihKbShYKU1RbX4gSyhKPShYKU1jLUoqPShLKi1xTVcoYy1KKi0hKCBoWk1XKGN%252BLS0taC1KUFooWFcoUSpPPUpQaE1YV0ZzY2dnIWRWaktXQ2koKnNGZ0ZzLSFNS1dDbGRnTXpYaWlYemdnWFdDQ0NGVXhpaXZ4KXZ4aWlpdlUKfDQ2NXxSSUdIVHxib25leWFyZHw5MDAwWTdZMVlZM3wxfFkwLjJ8I0RCQUU5NU5DMjdBNTBwQTVBNkE3Tjg3QTJDMHVwMjcyQzNGdU5DQkNEQ0RORDJENEQ0TjcyOUZDME40Njc3OUJONEM4MkE5fGZmZjF8MjV8MCpqLCcpS1MqISBKISF4WHMoTi0jTz09UD0gUUpKUwpYVUtLVj0tVylYWTB8Wj0hYyEqZjEtMS0xLWdNTWgtIGlkZGogKGs9UW0hLXBOMTYxOTI1TnE9ZHNNKHQKRkZGKHVOMUYyMzMzdlVVdyEoVyt4S1h%252BLU8Bfnh3dnV0c3FwbWtqaWhnZmNaWVdWVVNRUE9OTUtKKikoIV8%253D`,
  colors: getExtendedPalette(PALETTE.gravChamber),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.slime_megacreep,
  titleVariant: TitleVariant.Green,
  globalLight: 0.2,
  nextLevel: SECRET_LEVEL_20,
  nextLevelMap: {
    [getCoordIndex2(29, 16)]: SECRET_LEVEL_21,
    [getCoordIndex2(29, 17)]: SECRET_LEVEL_21,
  },
  pickupDrops: {
    [PickupType.Invincibility]: false,
    [PickupType.Mine]: 2,
  },
  pickupDropsByFrame: {
    30: { likelihood: .1, type: PickupType.Mine },
    60: { likelihood: .2, type: PickupType.Mine },
    69: { likelihood: .3, type: PickupType.Mine },
    99: { likelihood: .3, type: PickupType.Mine },
    104: { likelihood: .4, type: PickupType.Mine },
  },
};
