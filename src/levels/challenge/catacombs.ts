import { MusicTrack, PickupType } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'catacombs';

export const X_CATACOMBS = challengeLevel({
  id: 'X404',
  name,
  parTime: toTime({ minutes: 1, seconds: 30 }),
  layoutV2: `S3VOS3ZYRkZ3d1BQbGxTWWdVcipTWWcoICpYcip4eGlpSyFlWHh5eVEhZWRsbm5sUWUhZEZGS3ZYS3VOCnwzNzJ8UklHSFR8Y2F0YWNvbWJzVjkwOTY1VjA1fDJqajN8MFZqMC4xOHwjQkE0Qzc2TTg0MzM1MmhFNzZEODNNRTI1MDZBa2gzMDM0MzZrTWEyYzFkMU02NTliYzhNZjJmZGZmTTZiOTJhZk05NmJmY2NWWlpaVjYhIEwgKExnKXBwKiBYRksgelVyTHoqSn5%252BKEsKWEw9PU0tI3V6Z3pnZ09xcXEhUFM9IEooPSpYWUoqUQpkU0sqWHIoVnwxdikpKVkgPVotMS0xLTFlcXEpIWdYWGhNMUQyMDIwTWlTVUxfX3IqajB8a00yNjJBMkJsUU9kblNMSlVMSipwICBxISFyVSh1TmdYdlcpKXdRIVchZHhLT1h5U1VVVSp6ZGR%252BLCcBfnp5eHd2dXJxcG5sa2ppaGdlWllXVlVTUVBPTk1MS0pGKikoIV8%253D`,
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

