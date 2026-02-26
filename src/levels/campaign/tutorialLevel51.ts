import { MusicTrack } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_07 } from "../bonusLevels/variantLevel07";
import { MAZE_03_STORAGE } from "../mazes/maze03-storage";
import { challengeLevel } from "../challenge/_challengeLevel";

const name = 'minemeld';

export const TUTORIAL_LEVEL_51 = challengeLevel({
  id: 'C151',
  name,
  parTime: toTime({ minutes: 0, seconds: 20 }),
  layoutV2: `CktLSydKISl2V19XISgncCEpVyF5KHYoJ3p1dSdYVl9WZlkpX09ZIVN6WSkoKSgpWSFTeiFQVl9WJydPeiFLS1BPcCFPWXkoTy0oWiFPWVdfVy0oWkFLSyd3QXBBS1ghKSFLWEFwQVhMPWtaQVAta1NWcEFLS0twQUtLS3BZdld0WXYpdE9TUFNPYVBTUGFPU3d5V1dBcyFTKidYT0tYfilXKSdNd35ZISpQTXh4eHh4fiF2J01qJ09QTydNaksnVlBWWHh4aktiWGJQYlghanw0Mjd8UklHSFR8bWluZWRvZGdlfDMwMDAwcTJxLWhoMnFoN3wwLjZ8IzgzRUNEM04yMUQ0V2wzMzk1Qk4yRTRBNzZybDcyQzNGck40MDZFOEVONDY3NzlCTkQ3REZFQU41RjgyQUJOQUZDMUQ1fGNjY2g0fDAoIHdYKCEgKT09SgpYSycnJ01WUFZYVk4tI08qKlBYekogJ1MtLVVQCidWZGRXQUFZISFaUz1BcF8oTyhhKCkoKndkc2IrK2MxLTEtMS1mUCohKidRaDF8aksKa1kpUy1PUy0pU1NsTjE2MTkyNU4ycFhKcTB8ck4xRjIzMzNzICpVU3RfKVkoVkp1J1hWWE1mdk8hdydQeU8oV3pYUX54eFUBfnp5d3Z1dHNycXBsa2poZmNiYV9aWVdWVVNRUE9OTUtKKSgnIV8%253D`,
  musicTrack: MusicTrack.aqueduct,
  nextLevel: VARIANT_LEVEL_07,
  nextLevelMap: {
    [getCoordIndex2(19, 29)]: MAZE_03_STORAGE,
    [getCoordIndex2(20, 29)]: MAZE_03_STORAGE,
  },
});
