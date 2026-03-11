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
  layoutV2: `bWJTWUxVdlBQIWVVTFh2dXlYTHZneC5lClV2LnMgLktVciEucyFsVih3T35RUXEpWGNfQV9jWCFxUVF%252Bfn4uKFZyd09sVUt3c3dLVUxLRmdQUC5lTFhLRnU9eVhMVUtGUFB5VVlTYm0KfDc5aFJJR0hUfHBhbm9wdGljb258OTAwMFo0WmhaaGpaaiNEOTlDQTdNQTE2ODczZjMyMzQzNE1CNkI5QjlrZjEwMzQ0MmtNNkQ1RTgyTThDN0RBMU05RUJEQkRNNkQ5QzlDTUQxREJEOXxXV1dqNnwxIUYgKCwnKS4oVgpWKHcqVVguZy0hRiAgSj09SygoTAoqTS0jTlZWZGRkVlZjT3MhIHgtUSlLZGRkdlN6WEtLS0tLS0tlKlhVWFhWY2NXMS0xLTEtWXpLc3NGZSpaMHxielVjTmMqKlVlSypmTTA1MTAxNE1nLT1oM3xqMXxrTTBDMjczMWwuKGNYCm16Kk4qKipxKVhWX1ZYIXIKWGMocyEhdS1KSkpKSnZLIXdGLnhQLS0tLXktIWV6TCp%252BKU8Bfnp5eHd2dXNycW1sa2poZ2ZlYlpZV1ZVU1FQT05NTEtKRi4qKSghXw%253D%253D`,
  colors: getExtendedPalette(PALETTE.panopticon),
  showTitle: true,
  musicTrack: MusicTrack.observer,
  titleVariant: TitleVariant.GrayBlue,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
  },
};
