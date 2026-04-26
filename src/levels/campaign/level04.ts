import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant, PickupType } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_05 } from "../bonusLevels/variantLevel05";

const name = 'the facility';

export const LEVEL_04: Level = {
  id: 'C04',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 1, seconds: 0 }),
  applesToClear: 60,
  numApplesStart: 5,
  growthMod: 0.6,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X++++==----=====---++++XXXXXXX
X+_----    -----   ---___XXXXX
X+-       -++===-       ~~~XXX
X=-      -+DDXXX+--       ~~~X
X=-      -+DDXXX+++-       ~~X
X=-       -+++++X+++__      ~X
X-   XX~    ---++XXDDD_      X
X-   XX~~      -+XXDDD_      X
X    ~~X~~      -_____       X
X~    ~~XX                   X
X~     ~XX     --      ~~~- -X
X~      dd    -==-     DD+=-=X
X~      dd   -=XX=-    DD+=-=X
XX           -=XX=-    ~XX=-=X
DD            -==-     ~XX=-=X
DD             ==      ~XX=-=X
DD             ==      ~XX=-=X
XX   ======dd====     ~~XX=-=X
X~   ======dd====     ~~XX=-=X
X~   ++               ~~XX=-=X
X~   XX~              XX++=-=X
X~   XX~              XX++=-+X
X~   ~~                ---- ~X
X~                         ~~X
X~    O --                ~~~X
X~~--=====-             ~~~XXX
XXXXXXXXXXX_-         ~~~XXXXX
xxxxxxxxxxx++_---   ~~~XXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`,
  layoutV2: 'CkxMTExYSktLKVFRKSlNUUtLanVKK19RUSpRUS0hUS1fX19qSistWi1LKU1ab3JySk1uVnJycitRWm9KTW5WdnZ2Zy1aU0pNWi1LZ3ZnX19PKEotIXF2KCpRLUt2WFZkX09KLSFtdlNudlhWZF9PSipTdlNPLV9fX19fWnoqU3Z2T09aelAodVBRT28tIC16T1YqLSktUFYrV1VtKE9WIXBWK1dVcnJPUHBFVk9PLSktUEVWT1opT0VWT1opT0VycmttKGtYKCFLT08hKEVYKCFtZShPIVB2dktXeiFtdyhPIVB2dktNK3ohU09PKlFRICh6T09PWlN6T1FPTypvSlNRKSlNT1pvcnJKTHVYXy1PIW9qVXh4eHh4eHh4eHh4S19RLSFvanVKTExMTFV8NzU2fFJJR0hUfHRoZSBmYWNpbGl0eXw5MDAwYjZiNXxiM3wwLjZ8YjF8IzE1QzJDQk4xMTlEQTRzMkMyQzYzTjMzMzM3MX5zMTkxOTM4fk40QjNGNzJONTY0ODg0TkZGQjQxRk5GRkM4NTdORkZERDk5fFlZWTF8NXwwUCAoLCcpPT0qISBFKFh2V3YKSlVYZytMdXV1WFctTi0jTyEhUCogUS0tbyhVWApWZGRXTT1ZMS0xLTEtWiEqYjB8Z0sranJybW1rISkpKVYpKVAoRW5PLStvUyhwLT12dk0qc04wRDBEMUNOdVhYekoofk4xMzEzMkEBfnp1c3BvbmtqZ2JaWVdWVVNRUE9OTUxLSkUqKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.hospital),
  showTitle: true,
  extraLoseMessages: [
    ["I've heard this level makes people irrationally angry."],
    ["Don't hate the game, hate the player. Wait, that's YOU!."],
    ["If you make it past this level, I guarantee you have a 50% chance of enjoying the rest of the game."],
  ],
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.conquerer,
  titleVariant: TitleVariant.Yellow,
  nextLevelMap: {
    [getCoordIndex2(0, 28)]: VARIANT_LEVEL_05,
  },
  pickupDropsByFrame: {
    45: { likelihood: .5, type: ItemDropType.Invincibility },
    65: { likelihood: 1, type: ItemDropType.Invincibility },
  },
  armorDrop: getCoordIndex2(27, 17),
  pickupTypes: [
    PickupType.Broccoli,
    PickupType.Burger,
    PickupType.ChiliPepper,
    PickupType.ChocolateBar,
    PickupType.Candy,
    PickupType.Cabbage,
    PickupType.Watermelon,
    PickupType.Strawberry,
    PickupType.RainbowCake,
    PickupType.Popsicle,
    PickupType.Pear,
    PickupType.Peach,
    PickupType.Orange,
    PickupType.Milkshake,
    PickupType.Kiwi,
    PickupType.Lime,
    PickupType.Lollipop,
  ],
};
