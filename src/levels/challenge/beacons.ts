import { MusicTrack, ItemDropType, PortalExitMode } from "../../types";
import { toTime } from "../../utils";
import { challengeLevel } from "./_challengeLevel";

const name = 'beacons';

export const X_BEACONS = challengeLevel({
  id: 'X402',
  name,
  parTime: toTime({ minutes: 0, seconds: 55 }),
  layoutV2: `UVh1ZnYpZyltVnopVyFQMDF0KX40NVNQMjN0a342N1MqViFOZHdkIWZrZ3Z2IVpKTlhMTXBGIEZxKGMocUYgRnBYTUxYIUohIVondnZrbVchTkN3QyFQNzZ0a34zMlNQNTR0KX4xMFMqV3opViFmKWcpZylnTW11WFF8MzM3fFJJR0hUfGJlYWNvbnNqMjAwMFk0WTV5M2p5MC54I0YyMDY1Q0tBRjA0NDNpQjk2RDQwS0NCOEM2N2xpNjEyRTUzbEtGRkNGOUNLRkZCMDVDS0E0RDRCNEs2NkI3ODFLODJDNDk4fFVVVXgyaiEoWidKTmZaIHBYWCpYClhKLS1LLSNMCk1wcnEhcXJwWE0KTXFkTiEgTyE9PVAqPUotX1EKRikpKSlNKSkpcEYKU3Q9VTEtMS0xLVZ6Q3dDV3pkd2RZMHxaKCBmKiFKIWchJ2hKSmlLM0IxQzMyS2p8MWtDRkNsSzUzMjc0N20hSk4qcClYcWRkckMgQ3RfaHVPIU1PTnZNZ3dfX3gxfHl8WXooKH5oXwF%252Benl4d3Z1dHJxcG1sa2ppaGdmWllXVlVTUVBPTk1MS0oqKSgnIV8%253D`,
  musicTrack: MusicTrack.slyguy,
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
  pickupDropsByFrame: {
    10: { likelihood: 0.5, type: ItemDropType.Invincibility },
    20: { likelihood: 1, type: ItemDropType.Invincibility },
    30: { likelihood: 0.4, type: ItemDropType.Invincibility },
    38: { likelihood: 1, type: ItemDropType.Invincibility },
    50: { likelihood: .8, type: ItemDropType.Invincibility },
    60: { likelihood: .4, type: ItemDropType.Invincibility },
    70: { likelihood: .4, type: ItemDropType.Invincibility },
    75: { likelihood: 1, type: ItemDropType.Invincibility },
    90: { likelihood: .4, type: ItemDropType.Invincibility },
    100: { likelihood: 0.8, type: ItemDropType.Invincibility },
    125: { likelihood: 0.05, type: ItemDropType.Invincibility },
    150: { likelihood: 0.8, type: ItemDropType.Invincibility },
    175: { likelihood: 0.05, type: ItemDropType.Invincibility },
    200: { likelihood: 0.8, type: ItemDropType.Invincibility },
  },
});
