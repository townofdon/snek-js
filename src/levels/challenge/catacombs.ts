import { MusicTrack, ItemDropType } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'catacombs';

export const X_CATACOMBS = challengeLevel({
  id: 'X404',
  name,
  parTime: toTime({ minutes: 1, seconds: 30 }),
  // layoutV2: `TVhraylKSlhQWFBYKipGRmVaT2UoVVFPRkZwcEZGS25PS25PRkYqKlBYUEpKWFdraylYTXwzNzJ8UklHSFR8Y2F0YWNvbWJzUzkwOTY1UzA1fDJoaDN8MFNoMC4xOHwjQkE0Qzc2TDg0MzM1MmdFNzZEODNMRTI1MDZBamczMDM0MzZqTGEyYzFkMUw2NTliYzhMZjJmZGZmTDZiOTJhZkw5NmJmY2NTVlZWUzYhIE4gKE5RKVVVKktOWVluTllZKHFGCmRsbCFkSlhyZGRabk5kZCBLclFMLSNNClFRUWlpaWlRUVFRCk49PU9ucVBXbGwhUVhYU3wxVSAgVi0xLTEtMVcKWFksJ24oZUsgPVFnTDFEMjAyMExoMHxpUWRkakwyNjJBMkJrKSkpbCEhIW5aKHBLWk5fX09xIFhyVyABcnFwbmxramloZ2VaWVdWVVNRUE9OTUxLSkYqKSghXw%253D%253D`,
  layoutV2: 'UE5TU0pKcHBYKipWVnhoeGJ6KXVuT3ZXV1lZV1dRd2J6KG5PdlF3aFZWKipORnBKSlhOU1NYUAp8MzcyfFJJR0hUfGNhdGFjb21ic1U5MDk2NVUwNXwyaWkzfDBVaTAuMTh8I0JBNEM3Nk04NDMzNTJnRTc2RDgzTUUyNTA2QWxnMzAzNDM2bE1hMmMxZDFNNjU5YmM4TWYyZmRmZk02YjkyYWZNOTZiZmNjVVpaWlU2VSEgSyAoS3UpICAqanVlZSgpKGVlS09YRiEhISEhISFKWGpxKHd3cSBLPWtYWE0tI04KWE9MIFAKcnJCQnZ2cUxxdnZCQnJyUQp2IFMpKSkpKSkpVXwxVgpCRkJXCmRGZFlqdSkoX18oKUtPWFotMS0xLTFlLCdnTTFEMjAyME1obmJ6KE92aTB8ak4gaz1MbE0yNjJBMkJuemIocFhORnFkZHJMTHVMS3dMKHhRT2tLAXh3dXJxcG5sa2ppaGdlWllXVlVTUVBPTk1MS0pGKikoIV8%253D',
  musicTrack: MusicTrack.lostcolony,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
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

