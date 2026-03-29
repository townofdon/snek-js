import Color from "color";
import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, PortalExitMode, TitleVariant } from "../../types";
import { toTime } from "../../utils";

const name = 'ruins'

export const LEVEL_17: Level = {
  id: 'C17',
  name,
  timeToClear: 1000 * 60 * 1.3,
  parTime: toTime({ minutes: 0, seconds: 60 }),
  applesToClear: 20,
  numApplesStart: 0,
  growthMod: 0.01,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 2,
  extraHurtGraceTime: 40,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
X  k  XX -=aaaaa-aaaaa=- XXXXX
X XXX XX -=XXXXXXXXXXX=- x - X
X XXX d  -=XXX-- --XXX=- --X-X
X XXX d  -=XXXXXXXXXXX=- x - X
X  -  d  -=aaaaa-aaaaa=- XXKXX
XXXKXXXXXXXXXXX-=-XXXXXXXXXKXX
X - - xaaaax    =    xaaax - X
X-=-=-XXXXxx ==-=-== xxXXX-=-X
X-=-=-XXXX      X  aaa XXX-=-X
X - - XXXX ==== X ==== XXX - X
XXXdXXX -X --O  -      XXXXxXX
XXXdXX -=X== =aXXX = ==X=-   X
XXXKXX -=X   =aX-X =   X=-a  X
dLLKJJ -=X = =aX-X = = X=-a  X
dLKKKJ---d =   =-=   = d-a-a-X
dLLKJJ -=X = = X-Xa= = X=-a  X
XXXKXX -=X   = X-Xa=   X=-a  X
XXXdXX -=X== = XXXa= ==X=-   X
XXXdXXX -X      -      XXXxXXX
X - - XXXX ==== X ==== X  j  X
X-=-=-XXXX aaa  X      X  X  X
X-=-=-XXXXxx ==-=-== xxX  X  X
X - - xaaaax    =    xaJ     X
XXXLXXXXXXXXXXX-=-XXXXXXXXXLXX
X  -  d  -=aaaaa-aaaaa=- x a X
X XXX d  -=XXXXXXXXXXX=- xaXaX
X XXX XX -=XXXXXXXXXXX=- XaXaX
X  l  XX -=aaaaa-aaaaa=- X a X
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  layoutV2: 'ClpaWicKZWshWE1PJ1gqTW9YTVN4YXRkISknLU4tLSc9Ti0tYi0qTW9kIVN4YSplLSFkIU9xS1gqJ0tacSktWktYX2Z4YVV2WCktdydlISFGIWZ%252BJyktKk1OTidQUCdhKidkby1NLS1XLSEhISdYeFhwKEEnKG1WLVcqRnFLWE0pZShBWC1YKFdWLUEhYyhBYi1iKHlkTEtLS0otLS1kKCEoKSFZZC1BLUEtY1liLWJoeUZxS1hNKWVZWC1YaFdWLUEhcFknaG1WLVcqJ2RvLWUhIS0hISFxdnh2WCpNTk4nUFBlaiF3J01mQSFGISEhZWVVIWVfSiFXKidMWnEpLVpMWCplLSFkIU94IH50ZCFTeEFiQXRYdiBTdkFiQSplbCFYTU9NfipaWlonCnwzNDN8UklHSFR8cnVpbnN8NzgwMDB8MjB8M3wxfDJ8MC4wMXw0MHwwLjV8I0YwOTE1NlFFRDc5MzF6NjA1NzcwUTZENjI3RlE0MDNENTJ6NDk0NTVFUTQwM0Q1MlE5RTc2ODJRZjg4OTJRRTFmNTFRREM5OTJFUUVEQ0I5NnxnZ2cxfDEyfDFXICdxWFk9KS09KlgKTVhhLSBPKWZmQS1mZmhOUFhtPT0gUS0jUykncWInWFZOVXdxdnZ4eG0pKT0geHh2Vlg9VyEgWSggWicnJ18qTU5OeGZmeCEhPSEheEFhIE5jKmRMTEtKSiApYihlWCFmQUFnMS0xLTEtaEE9bSg9bycgcConZFhNKVY9cVhYdCpNWGJNdypYKSkteVliPS1BISp6UTM3MzQ0NlF%252BQSABfnp5d3RxcG9taGdmZWNhX1pZV1ZVU1FQT05NKikoJyFf',
  colors: getExtendedPalette({
    // ...PALETTE.hospital,
    ...PALETTE.forest,
    ...PALETTE.violetSunset,
  }),
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
  showTitle: true,
  titleVariant: TitleVariant.GrayBlue,
  musicTrack: MusicTrack.stonemaze,
  globalLight: 0.5,
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: false,
  },
};
