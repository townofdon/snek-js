import { PALETTE } from "./palettes";
import { Level } from "./types";

export const LEVEL_09: Level = {
  name: 'labyrinth',
  timeToClear: 1000 * 60 * 1.5,
  applesToClear: 50,
  numApplesStart: 10,
  layout: `
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
X+++++=+=+==+==+=+=++X+++++++X
X+ - - - - - - - - -+X+- - -+X
X+-==+=+=+=+++===++ +X+     +X
X= +XXXXXXXXXDDDDX+-+X+-+X+-+X
X+-=X+++++++XD++DX= =X= +X= +X
X= =X+ - - +XD++DX=-+X+-=X+-=X
X=-+X+-   -=XDDDDX+ +X= +X+ +X
X+ =X+ +X+ +XD__DX=-+X=-+X=-=X
X=-+X=-+X+-=XD__DX= =X+ +X+ +X
X= =X+ =X= +XD__DX+-+X=-+X=-+X
X=-=X+-+X+-=XD__DX= +X= +X= =X
X+ +X= =X= +XD__DX=-=X+-=X+-+X
X=-=X+-+X=-+XD__DX+ +X+ +X+ +X
X+ =X+ =X+ +XDDDDX+-   -+X=-=X
X=-+X=-+X+-=XD++DX+ - - +X+ =X
X+ =X+ +X= +XD++DX+++++++X=-+X
X=-=X+-=X+-+XDDDDXXXXXXXXX+ =X
X= +X= +X= =+++=++=+=+++=+=-+X
X=-=X+-=X+- - - - - - - - - +X
X+ =X+ =X+++++=++=++++=++++++X
X=-+X=-+XXXXXDDDDXXXXXXXXXXXXX
X= =X+ +++=++++=+=+++=+++++++X
X=-+X+- - - - - - - - - - - +X
X+ =X++++=++=++=++=++=+++==-=X
X=-+XXXXXXXXXDDDDXXXXXXXXX= =X
X= =+====+==+=====+=====+==-=X
X+- - -O- - - - - - - - - - +X
X++===+===+======+===+==+=+++X
XXXXXXXXXXXXXDDDDXXXXXXXXXXXXX
  `,
  colors: PALETTE.mintJulip,
};