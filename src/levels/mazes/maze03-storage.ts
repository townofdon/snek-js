import { MusicTrack } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_08 } from "../bonusLevels/variantLevel08";

import { v2Level } from "../v2Level";
import { MAZE_04_LOOT_ROOM } from "./maze04-lootroom";

const name = 'ordnance vault';

export const MAZE_03_STORAGE = v2Level({
  id: 'S152',
  name,
  parTime: toTime({ minutes: 0, seconds: 15 }),
  layoutV2: `Cn51UWhMaihqVWMoY1NKKEp6a1ZNaG5ZS1liQWJZSy12WT1kLU1WCmtoTEooSlNjKGNVaihqUXV6dXp%252BfDQyNnxSSUdIVHxzdG9yYWdlWjIwMDAwfDVseDIwWlo1bC43N3wjRTM1NzBET0FFNDMwQWkzNjU4QU8zNzZDOTVwaTk1NzZBcE84NkJCRDhPNzRCMUQyT0Y2QUUyRE9ENzhGMDlPRjlDQjc2WmZmZnwzbCFoaCh6aExfIEpxTCEqISBxbj1MWCBNCmhuKW1iYnltZGQpZHYKTmgtTy0jaiFRKEspKV9iKSlfbVdTKHFMdypBKiB3cShVKE5ZWVktJzpZWVlZWChWIXFMWEx5WExOIWg9VyEKWS0teDFfKSBiKioqY05QWHFmLTEtMS0xaFhYaU8yQjQxNTBPM2pQISFrKSlKWClfCmx8MG1LIG5LPXBPMkY0ODU4cU5YdVBQdmQ9d1kgeFp8eWIgekxXfnVYN1cBfnp5eHd2dXFwbm1sa2ppaGZjYl9aWVdWVVNRUE9OTUxLSikoIV8%253D`,
  musicTrack: MusicTrack.transient,
  nextLevel: VARIANT_LEVEL_08,
  nextLevelMap: {
    [getCoordIndex2(0, 11)]: MAZE_04_LOOT_ROOM,
    [getCoordIndex2(0, 17)]: MAZE_04_LOOT_ROOM,
  },
});
