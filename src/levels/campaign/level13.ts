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
  layoutV2: 'ekonbwpzTlBOc1ZWSmN6djQocFpRWlFacC0ydnonVlZKZ1BKY2hVLSkxdnhqalUtKTF2aCpZSmN4a3YxKHBfX3UqWXYxKHB1a0pjZ1BKVlYnTS0pNHZNYjR2TWI0dk0tKTR2Z0pzVlYnZydvcXd3eW9OUE5zKidvdG1tZSdjfnwzMzd8UklHSFR8U0NJLUxBQnw5MDAwYTZhMWFhM3wwLjI1fGExfCM4M0VDRDNLMjFENFlLMkMyQTM4S0NCQ0RDREtEMkQ0RDRpNzM0NDZLNDk0NTVFaTQzRjQ3SzRFNjk3Q0tFMVk1MUtEQzk5MkVLRURDQjk2fGZmZjF8MTR8MCFRT09uY1goUU9sISAtYiFsUW5sKgonSicnJycnSy0jTX52M3BuIFBkZFE9LVUKWDJwWUFBWi0ydnp2NChfdQpXV2RZdjEoUWEwfGI9KWMnc2YxLTEtMS1nUCcqaHh6SnJyJ3hpSzQwM0Q1MkszalViMXZZZFZWayp4cnJKZ1lsLT1uTyBvJydYcC0tc1hYdS0zWHhZJ3oqUH5QJwoBfnp4dXNwb25sa2ppaGdmY2JhX1pZVVFQT01LSiopKCchXw%253D%253D',
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
