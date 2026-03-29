import { PALETTE, getExtendedPalette } from "../../palettes";
import { Level, MusicTrack, ItemDropType, TitleVariant } from "../../types";
import { getCoordIndex2, toTime } from "../../utils";
import { VARIANT_LEVEL_10 } from "../bonusLevels/variantLevel10";

const name = 'labyrinth';

export const LEVEL_09: Level = {
  id: 'C09',
  name,
  timeToClear: 1000 * 60 * 1.5,
  parTime: toTime({ minutes: 1, seconds: 10 }),
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
  layoutV2: 'ak0hISkpKVVVKSFYdU0rKCgoKCAtJ08oJ01PUSkpKSEpUSFaKmVaTWtQUFdjTydPK2NPJ01PSnVzfmtrTX4rKFpzZ09KT0pNZ09lLUpXWHdrd014cW93WWdnTkpNZ04rYk9KWX53d01%252BeGtZTydnZ3YnT0pZa2t%252BTXd%252Ba1lOSk9KTyd2J2dZcWN3cWJNeHh3V1hPZS0nTj1MTWdnT0pzKyhaKj1iTXh3a3N1Z3ZKTytjV1BQWHhNa2tLVikhVSEpKS0ndkpPcHh4ISEpIVYhViEhWE1nZ1BXUFBQWE1%252BKiEpISFVISl1TWdPKHB4ISFWVlZWVilOSk1nUFBXUFBjfk1LVVFVVVFRKVFRKU5KTU8oKHAhUVVRKVFRVVEpVSEnagp8ODE3fFJJR0hUfGxhYnlyaW50aHw5MDAwZjVmMWZmM3wxfGYwLjZ8IzgzRUNEM1MyMUQ0QUF6MzM5NUJTMkU0QTc2UzFGMjMzM3o3MkMzRlMxRjIzMzNTNDA2RThFUzQ2Nzc5QlNEN0RGRUFTNUY4MkFCU0FGQzFENXxtbW0xfDFmMyErKycrWCggLSAtKSs9cSBKPVhLPSBNClhOPS1PKy1QWFhYWFE9PVMtI1U9KVY9IVdkZGRkWWRfX2RYWiAnZSAgIGYwfGdOJ2pNUFBYWGJiV2JiUFBYWFhrSydtMS0xLTEtcCgoKChaTXEqK3NkIWRYdSEhISd2TU5KT3cqJ3gqSnpTMTYxOTI1UzJ%252BS0oBfnp4d3Z1c3FwbWtqZ2ZlWllXVlVTUVBPTk1LSiopKCchXw%253D%253D',
  colors: getExtendedPalette(PALETTE.mintJulip),
  showTitle: true,
  showQuoteOnLevelWin: true,
  musicTrack: MusicTrack.creeplord,
  titleVariant: TitleVariant.Gray,
  globalLight: 0.6,
  nextLevelMap: {
    [getCoordIndex2(29, 14)]: VARIANT_LEVEL_10,
  },
  pickupDrops: {
    [ItemDropType.Invincibility]: true,
    [ItemDropType.Mine]: true,
  },
};
