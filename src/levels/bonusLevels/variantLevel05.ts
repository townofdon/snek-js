import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { LEVEL_06 } from "../campaign/level06";
import { MAZE_02_NE } from "../mazes/maze02ne";
import { MAZE_02_NW } from "../mazes/maze02nw";
import { MAZE_02_SE } from "../mazes/maze02se";
import { MAZE_02_SW } from "../mazes/maze02sw";

const name = 'the diamond';

export const VARIANT_LEVEL_05: Level = {
  id: 'C205',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 0, seconds: 45 }),
  applesToClear: 50,
  numApplesStart: 8,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXxdxXXXXXXXXXXXXXX
XXXXXXXXXXXXXXxXXXXXXXXXXXXXXX
XXXXXX_+xKKK~~~~~KKKx+_XXXXXXX
XXXXX~_XXXK~     ~KXXX_~XXXXXX
XXXX~~XXXX~  ---  ~XXXX~~XXXXX
XXX~~XXXX~  -===-  ~XXXX~~XXXX
XX~~XXXX~  -=---=-  ~XXXX~~XXX
+_~XXXX~  -=-   -=-  ~XXXX~~_+
+_XXXX~  -=-     -=-  ~XXXX~_+
XXXXX~  -=-       -=-  ~XXXXXX
XXXX~  -=-         -=-  ~XXXXX
XXX~  -=-  ~~ddd~~  -=-  ~XXXX
XX~  -=-   ~~ddd~~   -=-  ~XXX
XX~  -=-   XXX_XXX   -=-   ~XX
XX~  -=-   XX_k_XX   -=-   ~XX
XX~  -=-   XXX_XXX   -=-   ~XX
XX~  -=-   ~~ddd~~   -=-   ~XX
XX~  -=-   ~~ddd~~   -=-  ~XXX
XXX~  -=-           -=-  ~XXXX
XXXX~  -=-         -=-  ~XXXXX
XXXXX~  -=-  O    -=-  ~XXXXXX
+_XXXX~  -=-     -=-  ~XXXX~_+
+_~XXXX~  -=-   -=-  ~XXXX~~_+
XX~~XXXX~  -=---=-  ~XXXX~~XXX
XXX~~XXXX~  -===-  ~XXXX~~XXXX
XXXX~~XXXX~  ---  ~XXXX~~XXXXX
XXXXX~_XXXK~     ~KXXX_~XXXXXX
XXXXXX_+xKKK~~~~~KKKx+_XXXXXXX
XXXXXXXXXXXXXXxXXXXXXXXXXXXXXX
XXXXXXXXXXXXXxdxXXXXXXXXXXXXXX
`,
  layoutV2: 'Z0pXVypidnh2YldXVVpXZnVYCnFZbEpYYylPKkpjKSlPWEpyKCF5ZGRkeSEocm1TKHIqaioKd20oVm1NX2tfTW0gVihtd2pTIChTKHIqSnIoISkpKU9KYykpT1hKWGMpTyoKbFlxSnVmKlpVV1didnh2YldXV1hnCnw2MTN8UklHSFR8dGhlIGRpYW1vbmR8OTAwMHM1czh8czN8MC43NXxzMXwjNjhCMkE5UTQ4OEM4NHpFNzZEODNRRTI1MDZBUTI2MkEyQnozMDM0MzZRMjYyQTJCUTk3ODc4RlE2MjU2NUNRRkZGNkYxUTBBMEUxNFFFOUVGRkZ8cHBwMXwxNnwwISktPS0pKCwnKSAgKlhYSgoqTD0tKShybSp5TyAhKHJtKlB3eSptcigpLVEtI1MqSihWeWRkZHkgIVVXWEoqWHd%252BeEtLS3l5KEtLS3grX3dXKkoqViEgVyoqWQorXygqbXIoVi1MfgpadyhfKlhLKCkpIChLKlhfKHdjbXIoIWZYSlhQLS0pKHJtKnl3V0pnSldXKk54ZHhOV1dXWGpKKFYqWF8qWCBWKGwrXypjTyh%252BcDEtMS0xLXFYUD0tLS1MdypzMHx1UD09THcqeSgoelExRDIwMjBRfl8rAX56eXVzcXBsamdmY1pZV1ZVU1FQT0xKKikoIV8%253D',
  colors: getExtendedPalette(PALETTE.darkStar),
  showTitle: true,
  musicTrack: MusicTrack.lostcolony,
  titleVariant: TitleVariant.GrayBlue,
  nextLevel: LEVEL_06,
  nextLevelMap: {
    [getCoordIndex2(0, 7)]: MAZE_02_NW,
    [getCoordIndex2(0, 8)]: MAZE_02_NW,
    [getCoordIndex2(29, 7)]: MAZE_02_NE,
    [getCoordIndex2(29, 8)]: MAZE_02_NE,
    [getCoordIndex2(0, 21)]: MAZE_02_SW,
    [getCoordIndex2(0, 22)]: MAZE_02_SW,
    [getCoordIndex2(29, 21)]: MAZE_02_SE,
    [getCoordIndex2(29, 22)]: MAZE_02_SE,
  },
  pickupDropsByFrame: {
    49: { likelihood: 1, type: ItemDropType.Invincibility },
  },
};
