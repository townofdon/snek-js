import { MusicTrack, ItemDropType } from "../../types";
import { toTime } from "../../utils";
import { v2Level } from "../v2Level";

const name = 'catacombs';

export const X_CATACOMBS = v2Level({
  id: 'X404',
  name,
  parTime: toTime({ minutes: 1, seconds: 30 }),
  layoutV2: 'TFhxcSgqKnl5a0pYclNTZ2hVVU5OVVVoZ1NTck9KeXkqKmtxcShYTHwzNzJ8UklHSFR8Y2F0YWNvbWJzUTkwOTY1UTA1X198M19RMF8uMTh8I0JBNEM3Nks4NDMzNTJlRTc2RDgzS0UyNTA2QW5lMzAzNDM2bkthMmMxZDFLNjU5YmM4S2YyZmRmZks2YjkyYWZLOTZiZmNjUVlZWVE2USEnVic9PShWVikgISEhISEhJyAqayB2V1d3V1cndiBKdXchbCF3eEstI0xPampGaUhIdnp6dkhIaUZqalgKTQpIdSEnSE4KeiBpbCdaUmwnUlpsdyB6TwpYUEgheEhRfDFTCnApcFUKZClkViAgVydzc1ktMS0xLTFffDBlSzFEMjAyMEtnTUgnWlonSFBoTUYnUlInRlBpcHBqWFhYa1hPbCdBQW5LMjYyQTJCcSgoKHIKRkpGdSBzc3ZkZHcnaXhXIHlrKQF5eHd2dXJxbmxramloZ2VfWVdWVVNRUE9OTUxLSiopKCchXw%253D%253D',
  musicTrack: MusicTrack.lostcolony,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Armor]: true,
    [ItemDropType.Mine]: false,
  },
  pickupDropsByFrame: {
    25: { likelihood: 0.5, type: ItemDropType.Invincibility },
    50: { likelihood: 0.8, type: ItemDropType.Invincibility },
    75: { likelihood: 0.5, type: ItemDropType.Invincibility },
    100: { likelihood: 0.8, type: ItemDropType.Invincibility },
    125: { likelihood: 0.5, type: ItemDropType.Invincibility },
    150: { likelihood: 0.8, type: ItemDropType.Invincibility },
    175: { likelihood: 0.5, type: ItemDropType.Invincibility },
    200: { likelihood: 0.8, type: ItemDropType.Invincibility },
    225: { likelihood: 0.05, type: ItemDropType.Invincibility },
    250: { likelihood: 0.8, type: ItemDropType.Invincibility },
    275: { likelihood: 0.05, type: ItemDropType.Invincibility },
    300: { likelihood: 0.8, type: ItemDropType.Invincibility },
    325: { likelihood: 0.05, type: ItemDropType.Invincibility },
    350: { likelihood: 0.8, type: ItemDropType.Invincibility },
    375: { likelihood: 0.05, type: ItemDropType.Invincibility },
    400: { likelihood: 0.8, type: ItemDropType.Invincibility },
    425: { likelihood: 0.05, type: ItemDropType.Invincibility },
    450: { likelihood: 0.8, type: ItemDropType.Invincibility },
    460: { likelihood: 1, type: ItemDropType.Invincibility },
  },
});

