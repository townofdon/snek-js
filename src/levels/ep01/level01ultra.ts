import { getCoordIndex2 } from "@/utils";
import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant, PickupType } from "../../types";
import { LEVEL_01 } from "./level01";
import { LEVEL_02 } from "./level02";

const name = 'snekadia'

export const LEVEL_01_ULTRA: Level = {
  id: 'C01_U',
  name,
  timeToClear: 1000 * 60 * 2,
  applesToClear: 30,
  layout: `
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
X~    ++  ~XX+++XX~  ++     ~X
X     --   xx+++xx   --      X
X     --     ===     --      X
X     --     ===     --      X
X    xddx    ===    xddx     X
X+---xxxx----===----xxxx----+X
X+---xxxx----===----xxxx----+X
X    xddx    ===    xddx     X
X     --     ===     --      X
X~    --     ===     --     ~X
XXx   --     ===     --    xXX
XXx   --     ===     --    xXX
d++========================++d
d++========================++d
d++========================++d
XXx   --     ===     --    xXX
XXx   --     ===     --    xXX
X~    --     ===     --     ~X
X     --     ===     --      X
X    xddx    ===    xddx     X
X+---xxxx----===----xxxx----+X
X+---xxxx----===----xxxx----+X
X    xddx    ===    xddx     X
X     --     ===     --      X
X     --  O  ===     --      X
X     --     ===     --      X
X     --   xx+++xx   --      X
X~    ++  ~XX+++XX~  ++     ~X
XXXXXXXXXXXXXdddXXXXXXXXXXXXXX
  `,
  layoutV2: 'ClNydFNyVVlaWi4qKi5aS3ZYUFBPT09QUHd2Wi4qKi5aWlpLWVV%252BUXRRU3IKfDc2X1JJR0hUfHNuZWthZGlhfDEyMDAwXzNwcGZfZiNFNzZGNTFNRTI0RDI4bzI0NzQ5bGxvNDQ5NENvMzQ3NEFvOTRENTBvNjRBNERNMkE5RDhGTTJGQjFBMk1GNEEyNjFNRTlDNDZBTUU5RDNBN3xjY2NmZjBMICg9PT0pTFYhKksrYi16KGJieisuS3VqKHVxaCtLWHdMISBNLSNOLCdPCmRKeXl5eUpkUApneCl4Z35YVUtOakohTmdoZ04hSnFOS1ZicShxYiFZcWJMbWhtTGJqIVpLISkhXzB8Yi0tYzEtMS0xLWYxfGdXV2hKK2ohIWxNMjY0NjUzbXh4b000cF8zfHEhTHJTWHRnZGRkZ3VqeGRkeHZOalZMTncKWHkoKHptbWJifnJYWFgBfnp5d3Z1dHJxcG9tbGpoZ2ZjYl9aWVZVU1BPTk1MS0ouKikoIV8%253D',
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
  nextLevel: LEVEL_02,
  recordProgressAsLevel: LEVEL_01,
  pickupDropsByFrame: {
    40: { likelihood: 1, type: ItemDropType.Invincibility },
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
    PickupType.Grapes,
    PickupType.RainbowCake,
  ],
};
