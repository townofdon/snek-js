import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level } from "../types";

const name = 'metro'

export const LEVEL_03: Level = {
  name,
  timeToClear: 1000 * 60 * 1.3,
  applesToClear: 30,
  layout: `
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
XXX~~=-=     =-=     =-= ~~XXX
XXX~ =-=     =-=     =-=  ~XXX
X+_  =-=   ~~XXX~~   =-=   _+X
X+-  =-= ~~XXXXXXX~~ =-=   -+X
X+-  =-= XXXXXXXXXXX =-=   -+X
X+-  =-=     =-=     =-=   -+X
X+-  =-=    O=-=     =-=   -+X
X+_~ =-=     =-=     =-=  ~_+X
XXXX =-=   XXXXXXX   =-=  XXXX
XXXX =-=   XXXXXXX   =-=  XXXX
XX+_ =-=   ~~XXX~~   =-=  _+XX
XX+_ =-=     =-=     =-=  _+XX
DD+_ =-=     =-=     =-=  _+DD
DD+_ =-=     =-=     =-=  _+DD
DD+_ =-=     =-=     =-=  _+DD
XX+_ =-=     =-=     =-=  _+XX
XX+_ =-=   ~~XXX~~   =-=  _+XX
XXXX =-=   XXXXXXX   =-=  XXXX
XXXX =-=   XXXXXXX   =-=  XXXX
X+_~ =-=     =-=     =-=  ~_+X
X+-  =-=     =-=     =-=   -+X
X+-  =-=     =-=     =-=   -+X
X+-  =-= XXXXXXXXXXX =-=   -+X
X+-  =-= ~~XXXXXXX~~ =-=   -+X
X+-  =-=   ~~XXX~~   =-=   -+X
X+_  =-=     =-=     =-=   _+X
XXX~ =-=     =-=     =-=  ~XXX
XXX~~=-=     =-=     =-= ~~XXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`,
  colors: PALETTE.atomic,
  titleScene: (p5, fonts, callbacks) => new TitleScene(name, p5, fonts, callbacks),
  showQuoteOnLevelWin: true,
};
