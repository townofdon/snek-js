import { MusicTrack } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { X_FORTITUDE } from "./fortitude";

const name = 'catacombs';

export const X_CATACOMBS = challengeLevel({
  id: 'X404',
  name,
  layoutV2: `RnBLRnFYKipyclZWampGTSdaRk0gUScpdXVsbEYhWVh1Tk5PIVlkak5Oak9ZIWQqKkZxWEZwSwp8MzcyfFJJR0hUfGNhdGFjb21ic1M5MDk2NVMyNHwyaGgzfDBTaDAuMTh8I0JBNEM3Nko4NDMzNTJnRTc2RDgzSkUyNTA2QWlnMzAzNDM2aUphMmMxZDFKNjU5YmM4SmYyZmRmZko2YjkyYWZKOTZiZmNjU1dXV1M2ISBQICdQZShraykgWCpGIHZ3dydQdilGClhKLSNwdmV2ZWVMbm5uIU0pWCA9ZSdORlEnWk8KZFA9eClYd1N8MXEoKChWRilYeD1NKVctMS0xLTFZbm4oIVp3JyllWFhnSjFEMjAyMEpoMHxpSjI2MkEyQmpPTGRrICBsRlFQX19abiEhcEtlWHFVKChyTyFVIWR1RkxYdmRkdycneD1RAXh3dnVycXBubGtqaWhnZVpZV1ZVU1FQT05NTEtKRiopKCchXw%253D%253D`,
  musicTrack: MusicTrack.lostcolony,
  nextLevel: X_FORTITUDE,
});

