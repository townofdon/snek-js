import { PALETTE, getExtendedPalette } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack, TitleVariant } from "../types";

const name = 'panopticon';

export const LEVEL_05: Level = {
  name,
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
  colors: getExtendedPalette(PALETTE.panopticon),
  showTitle: true,
  musicTrack: MusicTrack.observer,
  titleVariant: TitleVariant.GrayBlue,
  pickupDrops: {},
};
