import { PALETTE } from "../palettes";
import { Level } from "../types";

export const LEVEL_05: Level = {
  name: 'panopticon',
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 40,
  layout: `
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX
XXXXXXX~~~~~~~~~~~~~~~~XXXXXXX
XXXXXX~~              ~~XXXXXX
XXXXX~~   ----------   ~~XXXXX
XXXX~~   -==========-   ~~XXXX
XXX~~   -=----------=-   ~~XXX
XX~~   -=-          -=-   ~~XX
XX~   -=-            -=-   ~XX
XX~  -=-             -=-   ~XX
XX~  -=-             -=-   ~XX
XX~  -=-   ~~DDD~~   -=-   ~XX
XX~  -=-   ~~DDD~~   -=-   ~XX
XX~  -=-   XXX~XXX   -=-   ~XX
XX~  -=-   XX~~~XX   -=-   ~XX
XX~  -=-   XXX~XXX   -=-   ~XX
XX~  -=-   ~~DDD~~   -=-   ~XX
XX~  -=-   ~~DDD~~   -=-   ~XX
XX~  -=-             -=-   ~XX
XX~  -=-             -=-   ~XX
XX~  -=-             -=-   ~XX
XX~  -=-             -=-   ~XX
XX~~  -=-           -=-   ~~XX
XXX~~  -=-----------=-   ~~XXX
XXXX~~  -===========-   ~~XXXX
XXXXX~~  -----------   ~~XXXXX
XXXXXX~~     O        ~~XXXXXX
XXXXXXX~~~~~~~~~~~~~~~~XXXXXXX
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX
XXXXXXXXXXXXXDDDXXXXXXXXXXXXXX
`,
  colors: PALETTE.panopticon,
};
