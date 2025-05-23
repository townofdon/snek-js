import { MusicTrack } from "../../types";
import { challengeLevel } from "./_challengeLevel";
import { LEVEL_WIN_GAME } from "../winGame";
import { toTime } from "../../utils";

const name = 'the gauntlet';

export const X_GAUNTLET = challengeLevel({
  id: 'X416',
  name,
  parTime: toTime({ minutes: 2, seconds: 0 }),
  layoutV2: `Y0wrKU5yKU8pTnJycypYK05OYikhRUVFK2dRKytPT089TU1fZl9BWFFOIXdFd2crRT1fZlhRKUhkUk1tK1FPQU1NTTNYWk89LV8tPVFOIWRSUm09KSopSCgoWC0rUSlIKDQoLT0pKkhMSElMV1FITEh5TykqRU9rQUFBcypMVlhpWE16TUxBSCkhWApLMVhWa0xBcypMPWJJTykqRWJ5TEgqKVcoWDMoSCpTLSgoTEgqKT0tTE9IQUxSUlJkciopPWZWIVhaNE1NTUFIKiA9Xy1WSEFMUk1SZE5RU2ZFRSt3Z0V3cipaZl9NTWcxZ09zKlpBX2ZfZl9NLVZiKXIqIGcrRUVFVikpclMrKypPSClPYilIKU5TZ2N8NDlvVVB8VGhlIEdhdW50bGV0cDIwMDBxOW9xcTNwcG8wLjQxfCMxNUMyQ0JKMTE5REE0ajJDMkM2M0ozMzMzNzF2ajE5MTkzOHZKNEIzRjcySjU2NDg4NH5CNDFGfkM4NTd%252BREQ5OXxZWVkxfDIxSCAod3dMKSwnKlgKWEVXPUghIEktT3pPLSFKLSNnWE1mLU4gKXMhUSAqUl9fX1MgK1Y9T1c9PVkxLTEtMS1aIFhiIUhjCigoKApmLS1nTFhqSjBEMEQxQ0prWHhYSHpIbVJMQWI9TW81fHB8MXEwfHIhKXNPIXZKMTMxMzJBd0xMeUliKk5zSXpYLVh%252BSkZGAX56eXd2c3JxcG9ta2pnZmNiWllXVlNSUU9OTUxKSUhFKikoIV8%253D`,
  musicTrack: MusicTrack.moneymaker,
  nextLevel: LEVEL_WIN_GAME,
  playWinSound: true,
});


