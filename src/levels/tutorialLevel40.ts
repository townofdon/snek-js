import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack } from "../types";
import { toTime } from "../utils";

const name = 'gatekeeper';

export const TUTORIAL_LEVEL_40: Level = {
  id: 'C140',
  name,
  timeToClear: 1000 * 60 * 5,
  parTime: toTime({ minutes: 0, seconds: 12 }),
  applesToClear: 50,
  numApplesStart: -1,
  disableAppleSpawn: true,
  snakeStartSizeOverride: 20,
  extraHurtGraceTime: 30,
  growthMod: 0,
  layout: `
XXXXXXXXXxxXxxXXxxXxxXXXXXXXXX
XXXXdXXXXXXXDDXXDDXXXXXXXdXXXX
XXXaaaXXXDDXDDXXDDXDDXXX k XXX
XXXadaXXXDDXDDXXDDXDDXXXadaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XXXaXaXXXXXXDDXXDDXXXXXXaXaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XaaaXaXXXXXXXXXXXXXXXXXXaXaaaX
XaXXX==  KK aa     KK  ==XXXaX
XaXXX == KK     aa KK == XXXaX
XaXXXXXXXXXXXXXXXXXXXXXXXXXXaX
XaXXXXXXXXXXXXXXXXXXXXXXXXXXaX
XaXX   O ==        JJ  ===  aX
XaXX     ==  j     JJ == == aX
XaXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XaXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Xa  ===  LL     aa LL aaa aadd
Xa == == LL aa     LL ==a a=dd
XaaaXaXXXXXXXXXXXXXXXXXXaXaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XXXaXaXXXXXXDDXXDDXXXXXXaXaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XXXaXaXXXDDXDDXXDDXDDXXXaXaXXX
XXXadaXXXDDXDDXXDDXDDXXXadaXXX
XXX=l=XXXDDXDDXXDDXDDXXXaaaXXX
XXXXdXXXXXXXDDXXDDXXXXXXXdXXXX
XXXXXXXXXxxXxxXXxxXxxXXXXXXXXX
  `,
  // colors: PALETTE.mintJulip,
  colors: getExtendedPalette(PALETTE.cornflower),
  showTitle: true,
  musicTrack: MusicTrack.aqueduct,
  globalLight: 0.6,
};
