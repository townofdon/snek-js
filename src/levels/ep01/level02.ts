import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant, PickupType } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_03 } from "../bonusLevels/variantLevel03";

const name = 'plaza'

export const LEVEL_02: Level = {
  id: 'C02',
  name,
  timeToClear: 1000 * 60 * 1.2,
  parTime: toTime({ minutes: 0, seconds: 50 }),
  applesToClear: 40,
  growthMod: 0.75,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXX++       -_-        ++XXXX
XXX++-       -=-        -++XXX
XX++-        -=-         -++XX
X++-         -=-          -++X
X~           -=-             X
X            ---            ~X
d------------+X+-------------d
d-===-----==-XXX-==------===-d
d------------+X+-------------d
X            ---             X
X~~          -=-           ~~X
X++-         -=-          -++X
XX+=----------------------=+XX
XXX=----====- O -====-----=XXX
XX+=----------------------=+XX
X++-         -=-          -++X
X~~          -=-           ~~X
X            ---             X
d------------+X+-------------d
d-===-----==-XXX-==------===-d
d------------+X+-------------d
X            ---             X
X~           -=-             X
X            -=-            ~X
X++-         -=-          -++X
XX++-        -=-         -++XX
XXX++-       -=-        -++XXX
8XXX++   ~   -_-   ~    ++xxx8
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  layoutV2: 'VXZTU1hoaFVobyAgIGIrKFEoKWhoVXZvIS1NLVF1aHZVbypPZnVoc29nISp1V2lkTUooWU9KLS1qeVBaS3ZjWChPT09PT09PPVhjdktaUHkKZE9KLS1ZTUooamlYTWdnKk1XWG9nISp1WFVvKig9ZnVoVXZvIWJlUXVocjhodm9fIGI9K2UgXyB1ZHh4OFV2U1NYbmhyfDQzNHxSSUdIVHxwbGF6YXw3MjAwazRrM3xrM3wwLjc1fGsxfCNFRkQ5Q0VMRTFCN0EzcThGMzk4NUxBMDQwOTV3cTM2M0E1OXdMMDdCRUI4TDA4RDlEMkw3OEQ1RTNMNDVDNUQ5TDk4REZFQXxtbW1tMC0xfDJ8MWYgKD0tKSsrKlEgSmctdCstIVEtSwp2WCtlT09lZU9PYj10ckwtI00tKE8tLS1Qc19fISpNIWZfX1gKUSEgU3Z%252Bfn5%252BflUKaFdYcytNZ2chTXQKWWpkTWctWGNYLSFRTWpkWlgpLWYoTWJnLSlYXywnYi09ZT0oZiogZyEhaHZ2aU5NIVFPISpNTgpqZAprMHxtMS0xLW8pTXFMMjUyODNETHJ2CnMKWHQrWHVNKXdMMkYzMjRDeVZnIU9nUVZ%252BWFgBfnl3dXRzcnFvbWtqaWhnZmViX1pZV1VTUVBPTUxLSiopKCFf',
  colors: getExtendedPalette(PALETTE.plumsea),
  showTitle: true,
  musicTrack: MusicTrack.simpleTime,
  titleVariant: TitleVariant.Green,
  nextLevelMap: {
    [getCoordIndex2(1, 28)]: VARIANT_LEVEL_03,
    [getCoordIndex2(28, 28)]: VARIANT_LEVEL_03,
  },
  portalExitConfig: {
    8: PortalExitMode.InvertDirection,
  },
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
  },
  armorDrop: getCoordIndex2(14, 14),
  pickupTypes: [
    PickupType.Cheese,
    PickupType.Tomato,
    PickupType.Onion,
    PickupType.BreadLoaf,
    PickupType.Baguette,
    PickupType.Egg,
    PickupType.Banana,
  ],
};
