import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant, PickupType } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";

export const LEVEL_01: Level = {
  id: 'C01',
  name: 'snekadia',
  timeToClear: 1000 * 60 * 1,
  parTime: toTime({ minutes: 0, seconds: 40 }),
  applesToClear: 30,
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
  layoutV2: 'Ck5sY05sLlZQUFBQKipQUFBYT09KSkpPT28hUFAqKlBQUFBQLlYucFFjUU5sCnw2MDl8UklHSFR8c25la2FkaWF8NjAwMF9ffF9VMFUjRTc2RjUxTEUyNEQyOGgyNDc0OWZmaDQ0OTRDaDM0NzRBaDk0RDUwaDY0QTRETDJBOUQ4RkwyRkIxQTJMRjRBMjYxTEU5QzQ2QUxFOUQzQTd8WVlZMVUwIUtNTVNNWihNWlNNWktiPSltZ20qLitqalMtKGpqaisuWG9KCmQrKCgoKCgoKGIrZEssJ0wtI1ogcFhPClchV1AuIVMtLVV8MXxWKWcrKUtZMS0xLTEtWk0gXzB8M2IoPT1jV1dkZGRXV2ZMMjY0NjUzZysraEw0alNTbE5YbUtLS0tLbwpYcGxYWFgBcG9tbGpoZ2ZjYl9aWVZVU1BPTk1MS0ouKikoIV8%253D',
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
  pickupDropsByFrame: {
    24: { likelihood: 1, type: ItemDropType.Invincibility },
  },
  nextLevelMap: {
    [getCoordIndex2(10, 29)]: null,
    [getCoordIndex2(18, 29)]: null,
  },
  pickupTypes: [
    PickupType.Carrot,
    PickupType.Tomato,
    PickupType.Potato,
    PickupType.Cherries,
  ],
};
