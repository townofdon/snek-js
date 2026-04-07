import { getCoordIndex2 } from "@/utils";
import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { LEVEL_01 } from "./level01";
import { TUTORIAL_LEVEL_10 } from "./tutorialLevel10";

const name = 'snekadia'

export const LEVEL_01_HARD: Level = {
  id: 'C01_H',
  name,
  timeToClear: 1000 * 60 * 1,
  applesToClear: 30,
  layout: `
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
X~~   ++~  XX+++XX  ~++~   ~~X
X~    --     ===     --     ~X
X     --     ===     --      X
X     --     ===     --      X
X     --     ===     --      X
X+----xx-----===-----xx-----+X
X+----xd-----===-----dx-----+X
X~    --     ===     --     ~X
X     --     ===     --      X
X     --     ===     --      X
XX    --     ===     --     XX
XX    --     ===     --     XX
d+==========================+d
d+==========================+d
d+==========================+d
XX    --     ===     --     XX
XX    --     ===     --     XX
X     --     ===     --      X
X     --     ===     --      X
X~    --     ===     --     ~X
X+----xd-----===-----dx-----+X
X+----xx-----===-----xx-----+X
X~    --     ===     --     ~X
X     -- O   ===     --      X
X     --     ===     --      X
X     --     ===     --      X
X~    --     ===     --     ~X
X~~   ++~  XX+++XX  ~++~   ~~X
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
  `,
  layoutV2: 'Tk9PaE9PWCpjKSlyb3BjKSlTU0tLS1NTKXJjTnBvYykpckohSiptUWhRT09YCnw3Mjl8UklHSFR8c25la2FkaWF8NjAwMGZmfGZWMFYjRTc2RjUxTUUyNEQyOGwyNDc0OWpqbDQ0OTRDbDM0NzRBbDk0RDUwbDY0QTRETTJBOUQ4Rk0yRkIxQTJNRjRBMjYxTUU5QzQ2QU1FOUQzQTd8YmJiMVYwIS4ucS5VKC5VcS5VZz1yICEgWCpYTkpKVV9KLnZ2Xyt2di5KX0pVSkpYTlUgSiwnSwpkKygoKCgoKChnK2RMcXFNLSNOClhtWFB4TC0rWE5TCld2IXZXVS4gVnwxfFkrTHhaTC0oTC1fKytiMS0xLTEtY0ohSlhmMHwzZyg9PWhXV2RkZFdXak0yNjQ2NTNsTTRtT1hYWFhvWXhaeFBwWWRaZFBxLS1yKU4BcnFwb21samhnZmNiX1pZVlVTUE9OTUxLSi4qKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.boxcar),
  showTitle: true,
  showQuoteOnLevelWin: true,
  extraLoseMessages: [
    ["How did you mess this one up?", (state, stats, difficulty) => difficulty.index >= 3],
    ["You couldn't miss the broad side of a barn.", (state, stats, difficulty) => difficulty.index >= 4],
    ["Maybe let's dial down the difficulty?", (state, stats, difficulty) => difficulty.index >= 4],
  ],
  musicTrack: MusicTrack.champion,
  titleVariant: TitleVariant.Yellow,
  nextLevel: TUTORIAL_LEVEL_10,
  recordProgressAsLevel: LEVEL_01,
  pickupDropsByFrame: {
    28: { likelihood: 1, type: ItemDropType.Invincibility },
  },
  nextLevelMap: {
    [getCoordIndex2(10, 29)]: null,
    [getCoordIndex2(18, 29)]: null,
  },
};
