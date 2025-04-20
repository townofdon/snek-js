import { MusicTrack } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { X_FORTITUDE } from "./fortitude";

const name = 'catacombs';

export const X_CATACOMBS = challengeLevel({
  name,
  layoutV2: `UExMbCpuampxcVhGRlByck8nJ2hPTVlocktYTk5QIVYqS2pqKiFWKktYTk5QclYhamoqbipMTGxYCnwzNzJ8UklHSFR8Y2F0YWNvbWJzUTkwOTY1UTI0fDJfXzN8MFFfMC4xOHwjQkE0Qzc2Sjg0MzM1MlpFNzZEODNKRTI1MDZBZ1ozMDM0MzZnSkUzOTk3QkpERDg0NjFKZjJmZGZmSjZiOTJhZko5NmJmY2NRVVVVUTYhID09WWU9KGlpKVknJydoWFBGcCBlWSdlT014Si0jS2trayFsWHh4WE1XIE5wKXhPIE09J1AKWFF8MW4oKChVLTEtMS0xVmtrKCFXWFhZICdaSjFEMjAyMEpfMHxlVz1nSjI2MkEyQmgnJ00qaSAgaiopayEhbExXV25TKChwCnhxKiFTIXJLKgFycXBubGtqaWhnZV9aWVdWVVNRUE9OTUxLSkYqKSgnIV8%253D`,
  musicTrack: MusicTrack.lostcolony,
  nextLevel: X_FORTITUDE,
});

