import { MusicTrack, PortalExitMode } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { X_CASA } from "./casa";

const name = 'beacons';

export const X_BEACONS = challengeLevel({
  id: 'X402',
  name,
  layoutV2: `VnJmenRwUTAxUzQ1VVEyM1M2N1VpZnV1dSFaSk5YT2soZChoT1h5ISFaJ3V1THlOaVE3NlMzMlVRNTRTMTBVcGZ6enRyWFZ2fDMzN3xSSUdIVHxiZWFjb25zfDEyMDAwWTRZNXxZM3xsWTAubCNGMjA2eEYwNDQzakI5NkQ0MEtDQjhDNjdtajYxMkU1M21LRkZDRjlDS0ZGQjB4NEQ0QjRLNjZCNzgxSzgyQzQ5OHxXV1dsMiEoWidKTmZaIClYWFgqdlhKLS1LLSNMZGRkTSgod04hIE8KayFoClAhPT1RKj1KLV9TX0pKKUpKX1VfSko9VgpxcVhMcXFYVzEtMS0xLVkwfFooIGYqeSFnISdoTCBxWGRkaSpNIU53IWpLM0IxQzMyS2tkZHEgTGwxfG1LNTMyNzQ3cCpNKCgpTSFxKSlyKlAhTFBOdHopeU51TGd2WAp3ZF9fZHg1Q0tBeSFKeilnAXp5eHd2dXRycXBtbGtqaWhnZlpZV1ZVU1FQT05NTEtKKikoJyFf`,
  musicTrack: MusicTrack.slyguy,
  nextLevel: X_CASA,
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
});
