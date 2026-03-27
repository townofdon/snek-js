import { MusicTrack } from "../../types";
import { toTime } from "../../utils";
import { VARIANT_LEVEL_08 } from "../bonusLevels/variantLevel08";

import { challengeLevel } from "../challenge/_challengeLevel";

const name = 'loot room';

export const MAZE_04_LOOT_ROOM = challengeLevel({
  id: 'S153',
  name,
  parTime: toTime({ minutes: 0, seconds: 30 }),
  layoutV2: `TFhiSihmViEoZlYpS1YpZShlKGVnak0haWVzc1hKWFoKVS0tJzpVKlpKKFcoIXEpIXEpUVFLTyloZiloZiEoT3EoT3FYSmdiTHw0M2NSSUdIVHxsb290IHJvb218MzAwMDAwa3wzX19rLmMjREJBRTk1TkMyN0E1MGFBNUE2QTdOODdBMkMwZGEyNzJDM0ZkTkNCQ0RDRE5EMkQ0RDRONzI5RkMwTjQ2Nzc5Qk40QzgyQTl8WVlZMW5jMHA9KGdWaE0haSkhZ1ZqaSotLS1KUGpPKk9XSz1NTFBTU1M9LT1TU1NYWApmQU4tI08hIVAKWFFLTU9nVk1mcGlTWFhYWFUqKippIU1Xaj1ZMS0xLTEtWgohVVUtLSFfbnw1YU4xNjE5MjVOYk9XLWpPIVhjNHxkTjFGMjMzM2VLViFmTUFnWFBoTU1pKlZqT09rfDBufDFwIT1xSyFzKEtoIQFzcXBua2ppaGdmZWRjYmFfWllXVlVTUVBPTk1MS0oqKSghXw%253D%253D`,
  musicTrack: MusicTrack.woorb,
  nextLevel: VARIANT_LEVEL_08,
});
