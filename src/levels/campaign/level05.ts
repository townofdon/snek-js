import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'panopticon';

export const LEVEL_05: Level = {
  id: 'C05',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 0, seconds: 50 }),
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
XX~  -=-   ~~ddd~~   -=-   ~XX
XX~  -=-   ~~ddd~~   -=-   ~XX
XX~  -=-   XXX_XXX   -=-   ~XX
XX~  -=-   XX_a_XX   -=-   ~XX
XX~  -=-   XXX_XXX   -=-   ~XX
XX~  -=-   ~~ddd~~   -=-   ~XX
XX~  -=-   ~~ddd~~   -=-   ~XX
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
  layoutV2: `TlNzeS5lZS5NZlZPLkshUVF4fiEtSkpKSkoteE92WEshbFEtLS0tKktYdlhPWEshKnogKktnT1coISp6IXdYa1ApUFVVaClYY19BX2NYIWhVVSlQKVApUHdXT1coRipQd1hPWEtGKnpGKktnT3ZYS0ZsUVEqS1h2fkYtSkpKSko9LXhPLktGUVEteFhWc00uZWUucWYKU058NzltUklHSFR8cGFub3B0aWNvbnw5MDAwYjRibWJtcmJyI0Q5OUNBN0xBMTY4NzNqMzIzNDM0TEI2QjlCOXVqMTAzNDQydUw2RDVFODJMOEM3REExTDlFQkRCREw2RDlDOUNMRDFEQkQ5fFpaWnI2fDEhRiAoLCcpd1drKmwtIS5YZlhGICBKPT1LKChMLSNOc3ZnZ2dZZ2dnZnYKTwpYUHohIFEtLS0tLVNmdlguY1ljLlhmdlUpS2RkZEshVk9YLkt6ekZLLmdZY2NjdmRkZHZjY2NjWjEtMS0xLWIwfGVLS0tLZnZ2Z1hYaClYY2NfY2NYIWpMMDUxMDE0TGsKV1coRipsLT1tM3xyMXxzCmZ1TDBDMjczMXcqKFd4IUsueiEhflgKLksBfnp4d3Vzcm1sa2poZ2ZlYlpZVlVTUVBPTkxLSkYuKikoIV8%253D`,
  colors: getExtendedPalette(PALETTE.panopticon),
  showTitle: true,
  musicTrack: MusicTrack.observer,
  titleVariant: TitleVariant.GrayBlue,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
  },
  pickupDropsByFrame: {
    15: { likelihood: 1, type: ItemDropType.Invincibility },
    20: { likelihood: 1, type: ItemDropType.Invincibility },
    25: { likelihood: 1, type: ItemDropType.Invincibility },
  }
};
