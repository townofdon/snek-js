import { PALETTE } from "../palettes";
import { Level, MusicTrack } from "../types";

const name = 'wingame';

export const LEVEL_WIN_GAME: Level = {
  name,
  timeToClear: 1000 * 60 * 10,
  applesToClear: 1000000,
  snakeStartSizeOverride: 100,
  numApplesStart: 100,
  growthMod: 0.1,
  layout: `
~~~~~~--~~~~~~--~~~~~~--~~~~~~
~     --      --      --     ~
~     --      --      --     ~
~     --      --      --     ~
~     --      ==      --     ~
~     --      ==      --     ~
~     --      --      --     ~
------==      --      ==------
------==      --      ==------
~             --             ~
~             --             ~
~             --             ~
~             ==             ~
~           --==--           ~
----==------==  ==------==----
----==------==  ==------==----
~           --==--           ~
~             ==             ~
~             --             ~
~             --             ~
~             --             ~
------==      --      ==------
------==      --      ==------
~     --      --      --     ~
~     --      ==      --     ~
~     --      ==      --     ~
~     --      __      --     ~
~     --      __      --     ~
~     --      --      --     ~
~~~~~~--~~~~~~--~~~~~~--~~~~~~
  `,
  colors: PALETTE.darkStar,
  isWinGame: true,
  showQuoteOnLevelWin: false,
  musicTrack: MusicTrack.champion,
  disableAppleSpawn: false,
  globalLight: 0.1,
};
