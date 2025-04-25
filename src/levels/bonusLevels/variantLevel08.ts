import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, TitleVariant } from "../../types";
import { getCoordIndex2 } from "../../utils";
import { LEVEL_08 } from "../level08";
import { SECRET_LEVEL_20 } from "./secretLevel20";
import { SECRET_LEVEL_21 } from "./secretLevel21";

const name = 'boneyard';

export const VARIANT_LEVEL_08: Level = {
  id: 'C208',
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 70,
  numApplesStart: 10,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXX~~~~~~~~~~~~~XX~~~XXXXXX
DX~~~~                 ~~~~~XD
DX~~~                     ~~XD
XXX~                      ~XXX
XXX~       _-             ~XXX
XX~~     ~XX=-            ~XXX
XX~~     -XX_             ~~XX
XX_-     -+-        -      ~XX
XX+=-     -        -=-     ~XX
XX+==-             -XX-   ~~~X
XX+--              ~XX=-   ~~X
X__                 -=-    ~~X
X~_       -          -     ~XX
X~~      -=-    ---  -    ~~XX
X~~     -===- --===--=-   ~XXX
X~~     -==-    -=-  -   ~xDDD
X~~     -=-      -       ~xDDD
X~~      -               ~~XXX
X~~               ~       ~XXX
X~~               XX~     ~XXX
X~~              ~XX      ~~XX
XX~                ~      ~~XX
XX~                       ~XXX
XX~                      ~~XXX
DDX~       ~~~~~~~~      ~XXXX
DDX~~~   ~~~X~~~~X~~~   ~~XXXX
XX~~~~~~~~~XXDDDDXX~~~~~~~~XXX
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
XXXXXXXXXXXXDDDDDDXXXXXXXXXXXX
  `,
  layoutV2: `ClNTS0tLS3VLWGdnZ3FNcUtzZ1FKWmcoc3ZRa09RTXUoUVo9KnBWIGZLKEoqX354ZFlQZlhNWnFWUSFkIGZYTVotS19RKlBNc19KaystUS16d0p6US1Wa3dRUS1LLSp2WApLK1p4LX4hcVYqTVhVX19PZCFkUXpWSk1YVShfUFlqSi1aKClNaC1wai0ta0pNKU0tUUprIT1KcTBVTS1RSiFZLSpNTGlVTWpKa3gqTUxpVShkalFaTUswVU1RSiooSmtmTVFreCBLKEo9Zk1afio9cXpwTXMoWn56ISggaFlNcyhaeC0tLWh%252BUFlmWChRKk89SlBoTVh1dlpnZyFkViBxdWkoKnZYZ1h2LSFNS3VsZGdNS2lpS2dnWClTS2lpU1gpU1hpaWlTSwp8NDY1fFJJR0hUfGJvbmV5YXJkfDkwMDBXN1cxV1czfDF8VzAuMnwjREJBRTk1TkMyN0E1MG1BNUE2QTdOODdBMkMwdG0yNzJDM0Z0TkNCQ0RDRE5EMkQ0RDRONzI5RkMwTjQ2Nzc5Qk40QzgyQTl8Y2NjMXwyNSogKCwndVUqISBKISFLWFh2KE4tI089PVA9IFFKSlNLS0tLS1UKWFY9LVcwfFk9IVohKmMxLTEtMS1mKFgpZ01NaC0gaWRkaj1RayEtbU4xNjE5MjVOcD1kcShLcylYdE4xRjIzMzN1KUt2TSh3IShzK3gtT3oqLX4tSgF%252Benh3dnV0c3FwbWtqaWhnZmNaWVdWVVNRUE9OTUtKKikoIV8%253D`,
  colors: getExtendedPalette(PALETTE.gravChamber),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.slime_megacreep,
  titleVariant: TitleVariant.Green,
  globalLight: 0.2,
  nextLevel: SECRET_LEVEL_20,
  nextLevelMap: {
    [getCoordIndex2(29, 16)]: SECRET_LEVEL_21,
    [getCoordIndex2(29, 17)]: SECRET_LEVEL_21,
  },
};
