import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { toTime } from "../../utils";

// url: <http://localhost:3000/snek-js/editor/?id=623e4cc1-62f0-4f87-a6b7-9995d95ea7b3&data=akpZWSpidnh2YllZVWNZZ3VYCnNacEpYZilPKkpmKSlPWEpyKCF5ZGRkeSEocm1TKHIqbCoKd20oV21NX2tfTW0gVyhtd2xTIChTKHIqSnIoISkpKU9KZikpT1hKWGYpTyoKcFpzSnVnKmNVWVlidnh2YllZWVhqCnw2MTN8UklHSFR8dGhlIGRpYW1vbmR8OTAwMFY1Vjh8VjN8MC43NXxWMXwjNjhCMkE5UTQ4OEM4NHpFNzZEODNRRTI1MDZBUTI2MkEyQnozMDM0MzZRMjYyQTJCUTk3ODc4RlE2MjU2NUNRRkZGNkYxUTBBMEUxNFFFOUVGRkZ8cXFxMXwxNnxWVlZWVjEhKS09LSkoLCcpICAqWFhKCipMPS0pKHJtKnlPICEocm0qUHd5Km1yKCktUS0jUypKKFd5ZGRkeSAhVVlYSipYd354S0tLeXkoS0tLeCtfd1kqSipWMHxXISBZKipaCitfKCptcihXLUx%25252BCmN3KF8qWEsoKSkgKEsqWF8od2ZtcighZ1hKWFAtLSkocm0qeXdZSmpKWVkqTnhkeE5ZWVlYbEooVypYXypYIFcocCtfKmZPKH5xMS0xLTEtc1hQPS0tLUx3KnVQPT1Mdyp5KCh6UTFEMjAyMFF%25252BXysBfnp5dXNxcGxqZ2ZjWllXVlVTUVBPTEoqKSghXw%25253D%25253D>

export const VARIANT_LEVEL_05: Level = {
  id: 'C205',
  name: 'the diamond',
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
  layoutV2: 'akpZWSpidnh2YllZVWNZZ3VYCnNacEpYZilPKkpmKSlPWEpyKCF5ZGRkeSEocm1TKHIqbCoKd20oV21NX2tfTW0gVyhtd2xTIChTKHIqSnIoISkpKU9KZikpT1hKWGYpTyoKcFpzSnVnKmNVWVlidnh2YllZWVhqCnw2MTN8UklHSFR8dGhlIGRpYW1vbmR8OTAwMFY1Vjh8VjN8MC43NXxWMXwjNjhCMkE5UTQ4OEM4NHpFNzZEODNRRTI1MDZBUTI2MkEyQnozMDM0MzZRMjYyQTJCUTk3ODc4RlE2MjU2NUNRRkZGNkYxUTBBMEUxNFFFOUVGRkZ8cXFxMXwxNnxWVlZWVjEhKS09LSkoLCcpICAqWFhKCipMPS0pKHJtKnlPICEocm0qUHd5Km1yKCktUS0jUypKKFd5ZGRkeSAhVVlYSipYd354S0tLeXkoS0tLeCtfd1kqSipWMHxXISBZKipaCitfKCptcihXLUx%252BCmN3KF8qWEsoKSkgKEsqWF8od2ZtcighZ1hKWFAtLSkocm0qeXdZSmpKWVkqTnhkeE5ZWVlYbEooVypYXypYIFcocCtfKmZPKH5xMS0xLTEtc1hQPS0tLUx3KnVQPT1Mdyp5KCh6UTFEMjAyMFF%252BXysBfnp5dXNxcGxqZ2ZjWllXVlVTUVBPTEoqKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.darkStar),
  annotations: { 210: 1, 239: 2, 240: 1, 269: 2, 630: 3, 659: 4, 660: 3, 689: 4 },
  showTitle: true,
  musicTrack: MusicTrack.lostcolony,
  titleVariant: TitleVariant.GrayBlue,
  pickupDropsByFrame: {
    49: { likelihood: 1, type: ItemDropType.Invincibility },
  },
};
