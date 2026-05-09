import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { WARP_ZONE_01 } from "../bonusLevels/warpZone01";
import { LEVEL_01_D } from "./level01d";

const name = 'turnaround';

export const TUTORIAL_LEVEL_10: Level = {
  id: 'C110',
  name,
  timeToClear: Infinity,
  parTime: toTime({ minutes: 0, seconds: 5 }),
  applesToClear: 10,
  numApplesStart: -1,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 20,
  growthMod: 0,
  layout: `
XXXXXXXXX++X++XX++X++XXXXXXXXX
XXXXXXXXXXXXDDXXDDXXXXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXXXXDDXXDDXXXXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XX~~~O~~~~~aaaaaaaaaaaaaaaaaaX
D~~~~~~~~~~~~~~~~~~~~~~~~~~~~X
XXddXXXXXxxXxxXXxxXxxXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxXXXXXDDXDDXXDDXDDXXXXXXXXX
XXxxxxxxxxxXDDXXDDXxxXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXDDXDDXXDDXDDXXXXXXXXX
XXXXXXXXXxxXDDXXDDXxxXXXXXXXXX
XXXXXXXXX==X++XX++X++XXXXXXXXX
  `,
  layoutV2: 'bUtLWEtLcSFOdk8hbVFPTUV6an5FamtrV09PIVlwZycpcy1iTGdNRUUnVk5kX19fX2RtTk5oU3MtYiFNRWotJ1ZkZ2pweVlMVSF5IVVMTCpOZGhTc2VZTFBWZFlFTSFYYk5OaClQTwpkX19fX19QVlRZaihnWGJQKVBYZU9PIVhXamtOVE5ZRVh%252BWXpFTU9RcVFxIU52anFLS1hLWFNPTXw1NzR8UklHSFR8dHVybmFyb3VuZHwzMDAwMDB8MjJ8LWlpMjVjY2MuNXwjMTVDMkNCSjExOURBNGYyQzJDNjNKMzMzMzcxbGYxOTE5MzhsSjRCM0Y3Mko1NjQ4ODR3QjQxRndDODU3d0REOTl8WlpaaTRjIWdnJyA9PSAoeE1MKS0tUypYTkVMWUotI0tYKytMWHhNWApOZGRPISFzLSdRKip2KlMgIFVYKEVYLScpLS1oTmRFWChWKWhOTldFWChPdnZPZyhFWXh4WjEtMS0xLWN8MGVMTFgoZkowRDBEMUNKZ1hYaEFBaTF8akx4a054TllsSjEzMTMyQW0KT3AoTExxT01Pc1Atdlgqd0pGRnkqZGgpc3pFKk9ORX5wTFFMZQF%252Benl3dnNxcG1sa2ppaGdmZWNaWVdWVVNRUE9OTUxLSkUqKSgnIV8%253D',
  colors: getExtendedPalette(PALETTE.hospital),
  renderInstructions: (gfx, renderer, state, palette) => {
    if (!state.isDoorsOpen) renderer.drawTutorialTurnControls(gfx, 0, 10);
  },
  showTitle: true,
  extraLoseMessages: [
    ["Pst... Press left to initiate a u-turn.", (state, stats) => stats.applesEatenThisLevel >= 5],
    ["This level is tryna teach you something.", (state, stats) => stats.applesEatenThisLevel >= 5],
    ["You might... need to eat more apples.", (state, stats) => stats.applesEatenThisLevel < 5],
  ],
  disableNormalLoseMessages: true,
  musicTrack: MusicTrack.aqueduct,
  titleVariant: TitleVariant.Gray,
  globalLight: 0.5,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Mine]: false,
  },
  armorDrop: getCoordIndex2(14, 14),
  nextLevelMap: {
    [getCoordIndex2(0, 19)]: LEVEL_01_D,
    [getCoordIndex2(19, 29)]: WARP_ZONE_01,
    [getCoordIndex2(20, 29)]: WARP_ZONE_01,
  },
};
