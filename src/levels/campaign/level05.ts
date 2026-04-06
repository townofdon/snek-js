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
  layoutV2: `TlNteS5iYi5NZVdPLn5RUXVoLn56LXVPdlh%252BalEtLS0tKktYdlhPWH4qeCAqS2ZPYyghKnghKihjaFYoRipQKVBVVXcpWGNfQV9jWCF3VVUpUClQKVAqKFZPYyhGKlAqKGNYT1hLRip4RipLZk92WEtGalFRKktYdmguS0Z6PS11Ty5LRlFRLXVYV21NLmJiLnFlClNOfDc5a1JJR0hUfHBhbm9wdGljb258OTAwMFo0Wmtaa2xabCNEOTlDQTdMQTE2ODczZzMyMzQzNExCNkI5QjlyZzEwMzQ0MnJMNkQ1RTgyTDhDN0RBMUw5RUJEQkRMNkQ5QzlDTEQxREJEOXxZWVlsNnwxIUYgKCwnKSooVgpWKEYqKmotIS5YZVhGICBKPT1LKChMLSNObXZmZmZWY3NmZmZldgpPClhQeCEgUS0tLS0tU2V2WC5WVnNjLlhldlUpS2RkZH5WY2NXT1guS3h4RksuZlkxLTEtMS1aMHxiS0tLS2V2dmZYWGdMMDUxMDE0TGhYCmotPWszfGwxfG0KZXJMMEMyNzMxc3ZkZGR2VlZ1IUsudylYVl9WWCF4ISF6LUpKSkpKfkshAX56eHd1c3JtbGtqaGdmZWJaWVdWVVNRUE9OTEtKRi4qKSghXw%253D%253D`,
  colors: getExtendedPalette(PALETTE.panopticon),
  showTitle: true,
  musicTrack: MusicTrack.observer,
  titleVariant: TitleVariant.GrayBlue,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
  },
};
