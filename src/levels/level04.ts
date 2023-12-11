import { PALETTE } from "../palettes";
import { TitleScene } from "../scenes/TitleScene";
import { Level, MusicTrack } from "../types";

const name = 'the facility';

export const LEVEL_04: Level = {
  name,
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 40,
  numApplesStart: 5,
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
X~      DD    -==-     DD+=-=X
X~      DD   -=XX=-    DD+=-=X
XX           -=XX=-    ~XX=-=X
DD            -==-     ~XX=-=X
DD             ==      ~XX=-=X
DD             ==      ~XX=-=X
XX   ======DD====     ~~XX=-=X
X~   ======DD====     ~~XX=-=X
X~   ++               ~~XX=-=X
X~   xx~              XX++=-=X
X~   xx~              XX++=-+X
X~   ~~                ---- ~X
X~                         ~~X
X~    O --                ~~~X
X~~--=====-             ~~~XXX
XXXXXXXXXXX_-         ~~~XXXXX
XXXXXXXXXXX++_---   ~~~XXXXXXX
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
`,
  colors: PALETTE.hospital,
  titleScene: (p5, sfx, fonts, callbacks) => new TitleScene(name, p5, sfx, fonts, callbacks),
  extraLoseMessages: [
    ["I've heard this level makes people irrationally angry."],
  ],
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.conquerer,
};
