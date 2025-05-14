import { MusicTrack, PickupType } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'catacombs';

export const X_CATACOMBS = challengeLevel({
  id: 'X404',
  name,
  parTime: toTime({ minutes: 1, seconds: 30 }),
  layoutV2: `TVhraylKSlhQWFBYKipGRmVaT2UoVVFPRkZwcEZGS25PS25PRkYqKlBYUEpKWFdraylYTXwzNzJ8UklHSFR8Y2F0YWNvbWJzUzkwOTY1UzA1fDJoaDN8MFNoMC4xOHwjQkE0Qzc2TDg0MzM1MmdFNzZEODNMRTI1MDZBamczMDM0MzZqTGEyYzFkMUw2NTliYzhMZjJmZGZmTDZiOTJhZkw5NmJmY2NTVlZWUzYhIE4gKE5RKVVVKktOWVluTllZKHFGCmRsbCFkSlhyZGRabk5kZCBLclFMLSNNClFRUWlpaWlRUVFRCk49PU9ucVBXbGwhUVhYU3wxVSAgVi0xLTEtMVcKWFksJ24oZUsgPVFnTDFEMjAyMExoMHxpUWRkakwyNjJBMkJrKSkpbCEhIW5aKHBLWk5fX09xIFhyVyABcnFwbmxramloZ2VaWVdWVVNRUE9OTUxLSkYqKSghXw%253D%253D`,
  musicTrack: MusicTrack.lostcolony,
  pickupDrops: {
    25: { likelihood: 0.5, type: PickupType.Invincibility },
    50: { likelihood: 0.8, type: PickupType.Invincibility },
    75: { likelihood: 0.5, type: PickupType.Invincibility },
    100: { likelihood: 0.8, type: PickupType.Invincibility },
    125: { likelihood: 0.5, type: PickupType.Invincibility },
    150: { likelihood: 0.8, type: PickupType.Invincibility },
    175: { likelihood: 0.5, type: PickupType.Invincibility },
    200: { likelihood: 0.8, type: PickupType.Invincibility },
    225: { likelihood: 0.05, type: PickupType.Invincibility },
    250: { likelihood: 0.8, type: PickupType.Invincibility },
    275: { likelihood: 0.05, type: PickupType.Invincibility },
    300: { likelihood: 0.8, type: PickupType.Invincibility },
    325: { likelihood: 0.05, type: PickupType.Invincibility },
    350: { likelihood: 0.8, type: PickupType.Invincibility },
    375: { likelihood: 0.05, type: PickupType.Invincibility },
    400: { likelihood: 0.8, type: PickupType.Invincibility },
    425: { likelihood: 0.05, type: PickupType.Invincibility },
    450: { likelihood: 0.8, type: PickupType.Invincibility },
    460: { likelihood: 1, type: PickupType.Invincibility },
  },
});

