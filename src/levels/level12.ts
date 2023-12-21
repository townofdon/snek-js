import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack } from "../types";

const name = 'sneksqueeze';

export const LEVEL_12: Level = {
  name,
  timeToClear: 1000 * 60 * 1.6,
  applesToClear: 50,
  numApplesStart: 20,
  // disableAppleSpawn: true,
  snakeStartSizeOverride: 2,
  growthMod: 0.1,
  extraHurtGraceTime: 30,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
X=-------==--------==-------=X
X=XXXXXXXXXXXXDDXXXXXXXXXXXX=X
X=-------=+XDDXXDDX+=-------=X
XXXXXXXXXD+XXXXXXXX+DXXXXXXXXX
DD-------==DaaaaaaD==-------DD
XX_DXXXXXXXXDXXXXDXXXXXXXXD_XX
XX_------==XDDXXDDX==------_XX
XXXXXXXXXX=XDDXXDDX=XXXXXXXXXX
X=-------==XDDXXDDX==-------=X
X=XXXXXXXXXXDDXXDDXXXXXXXXXX=X
X-       =XXDDXXDDXX=       -X
XX~~_+_~~=XXDXDDXDXX=~~_+_~~XX
XX~~=-=  =+-=_  -=_+=  =-=~~XX
XX~~=-=O =+_=-  _=-+=  =-=~~XX
XX~~_+_~~+=XDXDDXDX=+~~_+_~~XX
X-       ==XDDXXDDX==       -X
X=XXXXXXXXXXDDXXDDXXXXXXXXXX=X
X=-------==XDDXXDDX==-------=X
XXXXXXXXXX=XDDXXDDX=XXXXXXXXXX
XX_------==XDDXXDDX==------_XX
XX_DXXXXXXXXDXXXXDXXXXXXXXD_XX
DD-------==DaaaaaaD==-------DD
XXXXXXXXXD+XXXXXXXX+DXXXXXXXXX
X=-------=+XDDXXDDX+=-------=X
X=XXXXXXXXXXXXDDXXXXXXXXXXXX=X
X=-------==--------==-------=X
XXXXXXXXXXXXXXDDXXXXXXXXXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  `,
  colors: PALETTE.hospital,
  // colors: PALETTE.atomic,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.creeplord,
};
