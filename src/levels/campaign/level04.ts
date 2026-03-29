import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
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
  layoutV2: 'CnNzc0xYSktLKVFRKSlNUUtLTFVKK19RUSpRUS0hUS1fX19MSistYi1LKU1ib1VKTW1WVVgrUWJvSk1tVnZ2dmstYlNKTWItS2t2a19fTyhKLSFYdigqUS1Ldy0hWHZTbXcqU3ZTTy1fX19fX2JyKlN2dnpiclAoVVBRT28tIC1yT1YqLSktUFYrV3JPViFwVitXZ3Z2T1BwRVZ6LSktUH5%252BRXZ2WVkhS3ohKEVYbldKbk0rciFTeipRUSAocnpPYlNyT1F6Km9KU1EpKU1PYm9VSnNVXy1PIW9MZ3h4eHh4eHh4eHh4S19RLSFvTFVKc3NzTGd8NzU2fFJJR0hUfHRoZSBmYWNpbGl0eXw5MDAwajZqNXxqM3wwLjZ8ajF8IzE1QzJDQk4xMTlEQTRxMkMyQzYzTjMzMzM3MXVxMTkxOTM4dU40QjNGNzJONTY0ODg0TkZGQjQxRk5GRkM4NTdORkZERDk5fFpaWjF8NXwwUCAoLCcpPT0qISBFKFh2V3YKSmdYaytMVVVXLU4tI08hIVAqIFEtLW8oVVhYVmRkV009WSEpKSlWKSlQKEVYKFoxLTEtMS1iISpnWApqMHxrSyttTy0rbighVShPIVBVS29TKHAtPXZ2TSpxTjBEMEQxQ05ySihzTEx1TjEzMTMyQXd2WFZkX09Kek9PfkVWT2IpTwF%252Bend1c3JxcG9ubWtqZ2JaWVdWVVNRUE9OTUxLSkUqKSghXw%253D%253D',
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
};
