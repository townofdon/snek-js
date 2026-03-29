import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_08 } from "../bonusLevels/variantLevel08";

const name = 'factory floor';

export const LEVEL_07: Level = {
  id: 'C07',
  name,
  timeToClear: 1000 * 60 * 1.7,
  parTime: toTime({ minutes: 0, seconds: 55 }),
  applesToClear: 40,
  numApplesStart: 5,
  layout: `
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X~~  ~ ~ ~~~~XDDX~~~~  ~ ~ ~~X
X~          ~XDDX~          ~X
X~                          ~X
X   XXX_====-====-====_XXX  ~X
X~  XXX~---- ---- ----~XXX~  X
X  ~XXX~              ~XXX  ~X
X~ ~XXX~              ~XXX~ ~X
X  ~XXX~~~ ~    ~ ~ ~~~XXX~ ~X
X~ ~XXXXXXXXXDDDDXXXXXXXXX~  X
X~      ~  ~  ~   ~  ~       X
X~                          ~X
X~~~~~~ ---- ---- ---- ~~~~~~X
XDDDXXX_====-====-====_XXXDDDx
X~~~~~~ ---- ---- ---- ~~~~~~X
X~     O                    ~X
X      ~  ~  ~ ~  ~  ~   ~  ~X
X   XXXXXXXXXDDDDXXXXXXXXX~  X
X~  XXX~~~          ~~~XXX  ~X
X  ~XXX~              ~XXX~ ~X
X  ~XXX~              ~XXX~ ~X
X~ ~XXX~---- ---- ----~XXX~ ~X
X~  XXX_====-====-====_XXX   X
X                           ~X
X~                          ~X
X~                           X
X~                          ~X
X~~       ~XX~~~~XX~       ~~X
XXXXXXX~~~~XXDDDDXX~~~~XXXXXXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
  `,
  layoutV2: 'Cmh6WFpoeilTflModlp2dX4ocEohUXZadihKIVFQVkxXTFFwIWohKVFObVF3UXBLWVFOU0shflNOS3BLVUooUVEhS1FKIFBpKVpkdnZ2V3Z2dlpkeApYaVBKKFFRS1FRIUtRKVZVIU5TSiFRU3dRKVFZUVkoS2pLcCFMV0xWKW1tIUtQKG1tVlBTSkt2dnV2dihKSygpaHVYWFpaWFh1egpubnpaWnpubgp8NDU3fFJJR0hUfGZhY3RvcnkgZmxvb3J8MTAyMDBnNGc1fGczfDF8ZzAuNzV8I0YwOTE1Nk9FRDc5MzFrNjA1NzcwTzZENjI3RnFrNDk0NTVFcU85RTc2ODJPQUE4ODkyT0UxQUE1MU9EQzk5MkVPRURDQjk2fGVlZTF8OHwzVkssJylYClgqc3NKISEhSyAoTFhYWE0gLS0tLU53KE8tI1BwbW1RKVEhKFMoKFVoTFpaaEwoIXBWISBXXyotKi0qX1lObVFOSylaZGRlMS0xLTEtZzB8aExMaXVTTU1NS3Uoak4tLS0tTU0oTmtPMzczNDQ2T21KSm5iYmJwKShxTzQwM0Q1MnM9PXVTU3dYYlh6aFh%252BUUtLAX56d3VzcXBubWtqaWhnZVpZV1ZVU1FQT05NTEtKKikoIV8%253D',
  colors: getExtendedPalette(PALETTE.violetSunset),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["Hang in there, it gets harder."],
  ],
  musicTrack: MusicTrack.factorio,
  globalLight: 0.75,
  nextLevelMap: {
    [getCoordIndex2(29, 13)]: VARIANT_LEVEL_08,
  },
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: 2,
  },
  pickupDropsByFrame: {
    11: { likelihood: .9, type: ItemDropType.Mine },
    15: { likelihood: .1, type: ItemDropType.Invincibility },
    17: { likelihood: .8, type: ItemDropType.Mine },
    20: { likelihood: .2, type: ItemDropType.Invincibility },
    21: { likelihood: .9, type: ItemDropType.Mine },
    25: { likelihood: .8, type: ItemDropType.Mine },
    27: { likelihood: .8, type: ItemDropType.Mine },
    30: { likelihood: .3, type: ItemDropType.Invincibility },
    32: { likelihood: .8, type: ItemDropType.Mine },
    35: { likelihood: .8, type: ItemDropType.Mine },
    36: { likelihood: .8, type: ItemDropType.Mine },
    42: { likelihood: .8, type: ItemDropType.Mine },
    48: { likelihood: .9, type: ItemDropType.Mine },
    50: { likelihood: .8, type: ItemDropType.Invincibility },
  },
};
