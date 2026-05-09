import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, TitleVariant, LevelType } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { LEVEL_02 } from "./level02";

export const LEVEL_01_D: Level = {
  id: 'C01d',
  name: 'snekadia',
  type: LevelType.Maze,
  timeToClear: 9999* 1000 * 60 * 1,
  parTime: toTime({ minutes: 0, seconds: 10 }),
  disableAppleSpawn: true,
  applesToClear: 9999,
  layout: `
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
X~~~~~++~~~~~+++~~~~~++~~~~~~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X+-----------===------------+X
X+-----------===------------+X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
d+==========================+d
d+==========================+d
d+==========================+d
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    -- O   ===     --     ~X
X+-----------===------------+X
X+-----------===------------+X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~    --     ===     --     ~X
X~~~~~++~~~~~+++~~~~~++~~~~~~X
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
  `,
  layoutV2: 'Ck1oWk1oR1NQUFBQKipQUFBYT09ISEhPT2whUFAqKlBQUFBQR1NHbVFaUU1oCnw0NDh8TEVGVHxzbmVrYWRpYXwzMDAwME4zTk5ONzV8Yy40NnwjRTc2RjUxSkUyNEQyOGYyNDc0OV9fZjQ0OTRDZjM0NzRBZjk0RDUwZjY0QTRESjJBOUQ4RkoyRkIxQTJKRjRBMjYxSkU5QzQ2QUpFOUQzQTd8VVVVYyFJS0tSS1YoS1ZSS1ZJWT0pamJqKkcrZ2dSLShnZ2crR1hsSApkKygoKCgoKChZKyBJLCdKLSNWIG1YTjB8TwpXIVdQRyFSLS1TKWIrKUlVMS0xLTEtVksgWSg9PVpXV2RkZFdXX0oyNjQ2NTNiKytjMXxOMGZKNGdSUmhNWGpJSUlJSWwKWG1oWFhYAW1samhnZmNiX1pZVlVTUlBPTk1LSklIRyopKCFf',
  colors: getExtendedPalette(PALETTE.boxcar),
  globalLight: 0.5,
  showTitle: false,
  showQuoteOnLevelWin: false,
  extraLoseMessages: [
    ["It's quiet. Too quiet.", (state, stats, difficulty) => difficulty.index >= 3],
    ["The best way forwards is backwards, they say.", (state, stats, difficulty) => difficulty.index >= 3],
  ],
  musicTrack: MusicTrack.backrooms,
  titleVariant: TitleVariant.Yellow,
  nextLevelMap: {
    [getCoordIndex2(10, 29)]: null,
    [getCoordIndex2(18, 29)]: null,
  },
  nextLevel: LEVEL_02,
};
