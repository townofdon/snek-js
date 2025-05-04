import { MusicTrack, PickupType } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";
import { X_FORTITUDE } from "./fortitude";

const name = 'catacombs';

export const X_CATACOMBS = challengeLevel({
  id: 'X404',
  name,
  parTime: toTime({ minutes: 1, seconds: 30 }),
  layoutV2: `RnBLRnFYKipyclZWampGTSdaRk0gUScpdXVsbEYhWVh1Tk5PIVlkak5Oak9ZIWQqKkZxWEZwSwp8MzcyfFJJR0hUfGNhdGFjb21ic1M5MDk2NVMwNXwyaGgzfDBTaDAuMTh8I0JBNEM3Nko4NDMzNTJnRTc2RDgzSkUyNTA2QWlnMzAzNDM2aUphMmMxZDFKNjU5YmM4SmYyZmRmZko2YjkyYWZKOTZiZmNjU1dXV1M2ISBQICdQZShraykgWCpGIHZ3dydQdilGClhKLSNwdmV2ZWVMbm5uIU0pWCA9ZSdORlEnWk8KZFA9eClYd1N8MXEoKChWRilYeD1NKVctMS0xLTFZbm4oIVp3JyllWFhnSjFEMjAyMEpoMHxpSjI2MkEyQmpPTGRrICBsRlFQX19abiEhcEtlWHFVKChyTyFVIWR1RkxYdmRkdycneD1RAXh3dnVycXBubGtqaWhnZVpZV1ZVU1FQT05NTEtKRiopKCchXw%253D%253D`,
  musicTrack: MusicTrack.lostcolony,
  nextLevel: X_FORTITUDE,
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

