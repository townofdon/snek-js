import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_99 } from "../bonusLevels/variantLevel99";

const name = 'escada';

export const LEVEL_19: Level = {
  id: 'C19',
  name,
  timeToClear: 1000 * 60 * 5,
  parTime: toTime({ minutes: 1, seconds: 30 }),
  applesToClear: 70,
  numApplesStart: 10,
  growthMod: 0.25,
  extraHurtGraceTime: 15,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X            ----===0X8====9XX
X            ----===0X8----9XX
X            --XXXXXXX8====9XX
X            --X7===8XXXXXXXXX
X-=  =-      --X7---8XX~_l_~XX
X-    -XXXXXXXLX7===8XXJKKKJXX
X_    _X6===7XLXXXXXXXXJJKJJXX
X__--__X6---7X---      -=-=-XX
XXXXXXXX6===7X---       -=- XX
XX5===6XXXXXXX---           XX
XX5---6X     ----           XX
XX5=k=6X     ----           XX
XXXXXXXX   O=----=---------=1X
X9=---------=-  -=---------=1X
X9=---------=-  -=---------=1X
X9=---------=----=    XXXXXXXX
XX           ----     X4===5XX
XX           ----     X4-j-5DL
XX           ---XXXXXXX4===5DX
XX           ---X3===4XXXXXXDX
XX           ---X3---4X__--__X
XXL_L_L_XXXXXXXLX3===4X_    _X
DD_L_L_LX2===3XLXXXXXXX-    -X
DDL_L_L_X2---3X-_      -=  =-X
XXXXXXXXX2===3X--            X
XX1====2XXXXXXX--            X
XX1----2X0===----            X
XX1====2X0===----            X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  layoutV2: 'CikpUVFYY2Mpfm45fnE5ZngpOD1XOWZ4WDcoOFFRQ1FYcHlnIXhYN004WFYsJ19sXywnVnAtZy0pTFg3VzhYVkpLS0tKVnBfZ19YNig3WEwpVkpKS0pKVnBfX3hfX1g2TTdYTWchVVUtWCopWDZXN1hNIVlVLSB1KDYpTVN1TTZYWXFTdVc2WFlxU3YqKVhnPU1PLSFPLSFPTVVnKXB2U3FZWDQoNWJiaS1ZWDQtai01ZExpKTQoNWR2aVgzKDRRUVFkKlFTTVgzLWotNFhfX3hfXypidm9fKUxYMyg0WF9nXypkZF9vWDIoM1hMKS1nLSpkZG9fWDItai0zWC1fZyF5KmJ2KTIoM1gtbW4yKS1tLWogLTJYMChNbW4yWDAocU4hKilRY2MpKVFRKnw0MHRSSUdIVHxlc2NhZGF8MzAwMDBaN1oxWlozfDAuMjV8MTV8dCNEQkFFOTVQQzI3QTUwckE1QTZBN1A4N0EyQzB3cjI3MkMzRndQQ0JDRENEUEQyRDRENFA3MjlGQzBQNDY3NzlCUDRDODJBOXxoaGh0MlowISAgbj09KVFRUVhwCnF4TmdnIU9VejFwOT16UC0jUVhYU04gVS09Vz1rPVlnIFowfGZYcE4hZyEhaDEtMS0xLWkKUVNNbS1OISpRMW4oPW9MX0xfTHAqWHFNLXJQMTYxOTI1UHQxfHVYKlE1d1AxRjIzMzN4LS15VSE9LXpNTU09fmZxKDBYOAF%252Benl4d3V0cnFwb25taWhnZlpZV1VTUVBPTk0qKSghXw%253D%253D',
  colors: getExtendedPalette(PALETTE.gravChamber),
  showTitle: true,
  showQuoteOnLevelWin: true,
  portalExitConfig: {
    1: PortalExitMode.SameDirection,
    2: PortalExitMode.SameDirection,
    3: PortalExitMode.SameDirection,
    4: PortalExitMode.SameDirection,
    5: PortalExitMode.SameDirection,
    6: PortalExitMode.SameDirection,
    7: PortalExitMode.SameDirection,
    8: PortalExitMode.SameDirection,
    9: PortalExitMode.SameDirection,
    0: PortalExitMode.SameDirection,
  },
  extraLoseMessages: [
    ["I've teleported so much my neurons are scrambled."],
    ["Curious - does consciousness transfer over when teleporting?"],
    ["Teleportation, molecular decimation, breakdown, reformation, is inherently snek."],
    ["I hear playing SNEK rewires your brain..."],
    ["Snek was not meant to meddle in the ways of science."],
  ],
  musicTrack: MusicTrack.ascension,
  nextLevelMap: {
    [getCoordIndex2(29, 18)]: VARIANT_LEVEL_99,
  },
  pickupDropsByFrame: {
    50: { likelihood: 1, type: ItemDropType.Invincibility },
    60: { likelihood: .5, type: ItemDropType.Invincibility },
    69: { likelihood: .8, type: ItemDropType.Invincibility },
  },
};
