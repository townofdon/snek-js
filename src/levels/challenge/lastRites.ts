import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'last rites';

export const X_LAST_RITES = challengeLevel({
  id: 'X409',
  name,
  parTime: toTime({ minutes: 0, seconds: 46 }),
  layoutV2: `Ck1NTSgKWHZicClkbHdYIWRoIUVaZ1lXS21PTydTUVhrb05ORShrWFFTT08nbUtXWWdYUGhQd29VTHZidlVMTE1NTVV8ODRjUklHSFR8TGFzdCBSaXRlc3wzMDAwMFY4VlZjM3xjVjAuMmMjMTVDMkNCSjExOURBNGoyQzJDNjNKMzMzMzcxcWoxOTE5MzhxSjRCM0Y3Mko1NjQ4ODRyQjQxRnJDODU3ckREOTl8X19fVjApICdYUEVaKFpYKSEgcCEhRVVQSi0jS3lYZDRYYmJiYmJiWDRkUCdNKCgoTlVYZnghQSBiIGYhZilBTycpQSpwQSlQWCBRJ1ghdWJueFgnU2Z1IW54QVVYClYwfFcgblgqKm5QWXkoKnBvJ1pYWF8wLTAtMC1iQUFjMXxmQSFnQSpBWiFaQSpBaEVYME1YIU1YMGpKMEQwRDFDSmshQSkoISh4bSFaZCoqZFohblhkZG8oIHAqIXFKMTMxMzJBckpGRnVBKWRkWHZwISl3RU0oIU14KWZ5JyABeXh3dnVycXBvbm1ramhnZmNiX1pZV1ZVU1FQT05NS0pFKikoJyFf`,
  musicTrack: MusicTrack.slime_megacreep,
});
