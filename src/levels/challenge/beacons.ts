import { MusicTrack, PickupType, PortalExitMode } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { X_CASA } from "./casa";

const name = 'beacons';

export const X_BEACONS = challengeLevel({
  id: 'X402',
  name,
  layoutV2: `VnJnWXApdE5xUTAxUzQ1VVEyM1M2N1VoZ1lZWSFmS05YT2ooZCh5T1h0ISFmJ1lZSnROaFE3NlMzMlVRNTRTMTBVcWdwcHBKdE5yWFZ2fDMzN3xSSUdIVHxiZWFjb25zfDEyMDAwWjRaNXxaM3xrWjAuayNGMjA2eEYwNDQzaUI5NkQ0MExDQjhDNjdtaTYxMkU1M21MRkZDRjlDTEZGQjB4NEQ0QjRMNjZCNzgxTDgyQzQ5OHxXV1drMiEoZidLTmdmbFhYWCp2WEpkZGRLLS1MLSNNKCh3TiEgTwpqIXkKUCE9PVEqPUstX1NfS0spS0tfVV9LSz1WCnVKdVcxLTEtMS1ZSiEnWjB8ZiggZyp0IWgqTSFOdyFpTDNCMUMzMkxqSilYWCBKazF8bCApbUw1MzI3NDdwKSEncSpNKCgpTSFyKlAhSlBOdCFLdSkpKSlYdlgKd2RfX2R4NUNMQXlKbClKAXl4d3Z1dHJxcG1sa2ppaGdmWllXVlVTUVBPTk1MS0oqKSgnIV8%253D`,
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
  pickupDrops: {
    10: { likelihood: 0.5, type: PickupType.Invincibility },
    20: { likelihood: 1, type: PickupType.Invincibility },
    30: { likelihood: 0.4, type: PickupType.Invincibility },
    38: { likelihood: 1, type: PickupType.Invincibility },
    50: { likelihood: .8, type: PickupType.Invincibility },
    60: { likelihood: .4, type: PickupType.Invincibility },
    70: { likelihood: .4, type: PickupType.Invincibility },
    75: { likelihood: 1, type: PickupType.Invincibility },
    90: { likelihood: .4, type: PickupType.Invincibility },
    100: { likelihood: 0.8, type: PickupType.Invincibility },
    125: { likelihood: 0.05, type: PickupType.Invincibility },
    150: { likelihood: 0.8, type: PickupType.Invincibility },
    175: { likelihood: 0.05, type: PickupType.Invincibility },
    200: { likelihood: 0.8, type: PickupType.Invincibility },
  },
});
