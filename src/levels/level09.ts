import { PALETTE, getExtendedPalette } from "../palettes";
import { Level, MusicTrack, TitleVariant } from "../types";
import { getCoordIndex2 } from "../utils";
import { VARIANT_LEVEL_10 } from "./bonusLevels/variantLevel10";

const name = 'labyrinth';

export const LEVEL_09: Level = {
  id: 'C09',
  name,
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
X+ =X+ +o+ +XD__DX=-+X=-+X=-=X
X=-+X=-+X+-=XD__DX= =X+ +X+ +X
X= =X+ =X= +XD__DX+-+X=-+X=-+X
X=-=X+-+X+-=XD__DX= +X= +X= =X
X+ +X= =X= +XD__DX=-=X+-=X+-+X
X=-=X+-+X=-+XD__DX+ +X+ +X+ +X
X+ =X+ =X+ +XDDDDX+-   -+X=-=L
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
  colors: getExtendedPalette(PALETTE.mintJulip),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.creeplord,
  titleVariant: TitleVariant.Gray,
  globalLight: 0.6,
  nextLevelMap: {
    [getCoordIndex2(29, 14)]: VARIANT_LEVEL_10,
  },
  pickupDrops: {},
};
