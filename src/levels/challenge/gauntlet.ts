import { MusicTrack, ItemDropType } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { LEVEL_WIN_GAME } from "../winGame";
import { toTime } from "../../utils";

const name = 'the gauntlet';

export const X_GAUNTLET = challengeLevel({
  id: 'X416',
  name,
  parTime: toTime({ minutes: 2, seconds: 0 }),
  layoutV2: `CkhISEhIdkhTUW1yKyhNISgoTihNISghKE4hUW1yK01NeSghKSkpK1p3TysrTk5OPUxMX3pfQVhPTSFvKUh2SCspPV96VE8oRWRSTFJaQXk9TCtPTkFMTEwzWCBUTj0tXy09T00hZFJSUlpBeT1MPSgqKEVTdm9zc3NILStPKEVTNG9wcGZILT0oKkVaRUlaYk9FWkVJeSpNTiFJTigqKU5YeFhFWC1YRUFBQU4hUUdZR1dYaVhMWC1YTFhxQUUoIVFLMWdXWHhYRVgtWEVUWEFOIVFHWUc9eUlOKCopeUl5Kk1OIUlaRSooYm9zc3NvM1NFKlYtb2ZwcG92U0UqKD0tWk5FQVpSUlJkISgqKD16VyFUIFg0TExMQUVrPV8tV0VBWlJMUmRNT1Z6KSkrSHZIKW8hKGtYel9MTEgxSE5OIWtYQV96X3pfTC1XeSghKGt3WispKSlXKCghKFYrKypORShOeShFKE1WcnIqSFNYdlNYbW1RfDQ5NXxVUHxUaGUgR2F1bnRsZXR8MTIwMDAwfDk1amp8M3wxfDE1ai40MXwjMTVDMkNCSjExOURBNH4yQzJDNjNKMzMzMzcxSjEzMTMyQX4xOTE5MzhKMTMxMzJBSjRCM0Y3Mko1NjQ4ODRKRkZCNDFGSkZGQzg1N0pGRkREOTl8Y2NjMXwyMWpFTSwnKWI9KlFYRSEgSFpYSS1OWC1YTi0hSi0jTHotTSAoTiEhTyAqUVgKUl9fX1NISG9WICtXPU5aWFhiPT1jMS0xLTEtanwwayogb0hYeSFFei0tfkowRDBEMUNKAX56eW9ramNiWldWU1JRT05NTEpJSEUqKSghXw%253D%253D`,
  musicTrack: MusicTrack.moneymaker,
  nextLevel: LEVEL_WIN_GAME,
  playWinSound: true,
  pickupDrops: {
    [ItemDropType.Invincibility]: false,
    [ItemDropType.Mine]: false,
  },
});


