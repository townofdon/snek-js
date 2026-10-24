import { MusicTrack, ItemDropType, PortalExitMode } from "../../types";
import { toTime } from "../../utils";
import { v2Level } from "../v2Level";

const name = 'beacons';

export const X_BEACONS = v2Level({
  id: 'X402',
  name,
  parTime: toTime({ minutes: 0, seconds: 55 }),
  layoutV2: `VVhyTCpPaVgpWGlKJ2Z%252BSmchUTAxWTQ1V1EyM3g2N1dMZiEhIHZ6diFMKm1pT2lPKiBYClZNTylYWDpGIEZ0KGModEYgRjpKKU9NVnkqT2lPaW0nZyEha3pDIVE3NngzMldRNTRZMTBXTGd%252BSmYhTCpKaUppWClYaU8nclhVfDMzN3xSSUdIVHxiZWFjb25zfDEyMDAwUDRQNXxQM3cwLmgjRjIwNjVDS0FGMDQ0M2pCOTZENDBLQ0I4QzY3cWo2MTJFNTNxS0ZGQ0Y5Q0tGRkIwNUNLQTRENEI0SzY2Qjc4MUs4MkM0OTh8WlpaaDJ3UFBQMSEobGkgTGwgKiF1IUpYWFhLLSNMWHlNCk9KOkNrdCF0Q2s6SlhPCk51dU90ZFAwfFFMPXUtX1MhPT0hVQpGSkpKWFhwT3BKSkpKRgpWcCohbHUhIHBXX049WV9OOjo6Tl9aMS0xLTEtZn5DekNnfnZ6dmgxfGknKmpLM0IxQzMyS2sgQ2woIG1DRkNxSzUzMjc0N3JTT1MgdGRkdS0td3xoUHhfTm1OX3kKWHpfX34oKAF%252Benl4d3V0cnFtbGtqaWhnZlpZV1ZVU1FQT05NTEtKKignIV8%253D`,
  musicTrack: MusicTrack.slyguy,
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
  pickupDropsByFrame: {
    10: { likelihood: 0.5, type: ItemDropType.Invincibility },
    20: { likelihood: 1, type: ItemDropType.Invincibility },
    30: { likelihood: 0.4, type: ItemDropType.Invincibility },
    38: { likelihood: 1, type: ItemDropType.Invincibility },
    50: { likelihood: .8, type: ItemDropType.Invincibility },
    60: { likelihood: .4, type: ItemDropType.Invincibility },
    70: { likelihood: .4, type: ItemDropType.Invincibility },
    75: { likelihood: 1, type: ItemDropType.Invincibility },
    90: { likelihood: .4, type: ItemDropType.Invincibility },
    100: { likelihood: 0.8, type: ItemDropType.Invincibility },
    125: { likelihood: 0.05, type: ItemDropType.Invincibility },
    150: { likelihood: 0.8, type: ItemDropType.Invincibility },
    175: { likelihood: 0.05, type: ItemDropType.Invincibility },
    200: { likelihood: 0.8, type: ItemDropType.Invincibility },
  },
});
