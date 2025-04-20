import { MusicTrack } from "../../types";
import { LEVEL_WIN_GAME } from "../winGame";
import { challengeLevel } from "./_challengeLevel";

const name = 'unwind';

export const X_UNWIND= challengeLevel({
  name,
  layoutV2: `CmVYaFgtKFEoYU1RTUpsQVpWQUtTV1pBJ2JaQXp6TlghTlVVVVVYIXp6J2J4S1d4alhTVmwtTVFNYShRKEpoZXw2MTF8UklHSFR8dW53aW5kUDIwMDAwUDkwfDNjM2MwYyNFMzU3MERMQUU0MzBBZjM2NThBTDM3NkM5NWtmOTU3NkFrTDg2QkJEOEw3NEIxRDJMRjZBRTJETEQ3OEYwOUxGOUNCNzZQX19fUDEhQUttb2dqJ05qWG1PT09ncj0pcHBwcyAuT090dHRZSk1OWEtaQVhMLSNNPS1OWApPLS1jMVFyeSlTdnZ2dmJaLU5LVWQhZApWLXN5cGJNSldBWCBvbygqLVlBQVpYQVhfLTEtMS0xYUpxLnRPSi1iIC1jUHxleVhkZGRkeU5mTDJCNDE1MEwzZ09xIGhPLS5ZT08tTmpLQWtMMkY0ODU4bC1aLk9NSm0gTU9vKCgocFhYcS09cig9cyogdFlZdioqeEsKeSkpeidqAXp5eHZ0c3JxcG9tbGtqaGdmZWNiYV9aWVdWVVNRUE9OTUxLSi4qKSgnIV8%253D`,
  musicTrack: MusicTrack.dangerZone,
  nextLevel: LEVEL_WIN_GAME,
});
