import { MusicTrack } from "../../types";
import { toTime } from "../../utils";

export const musicTrackIndexMap: Record<MusicTrack, number> = {
  [MusicTrack.None]: 0,
  [MusicTrack.champion]: 1,
  [MusicTrack.simpleTime]: 2,
  [MusicTrack.full_simpleTime]: 2,
  [MusicTrack.transient]: 3,
  [MusicTrack.full_transient]: 3,
  [MusicTrack.aqueduct]: 4,
  [MusicTrack.conquerer]: 5,
  [MusicTrack.observer]: 6,
  [MusicTrack.lordy]: 7,
  [MusicTrack.factorio]: 8,
  [MusicTrack.skycastle]: 9,
  [MusicTrack.creeplord]: 10,
  [MusicTrack.full_creeplord]: 10,
  [MusicTrack.dangerZone]: 11,
  [MusicTrack.full_dangerZone]: 11,
  [MusicTrack.stonemaze]: 12,
  [MusicTrack.shopkeeper]: 13,
  [MusicTrack.woorb]: 14,
  [MusicTrack.gravy]: 15,
  [MusicTrack.lostcolony]: 16,
  [MusicTrack.backrooms]: 17,
  [MusicTrack.slyguy]: 18,
  [MusicTrack.full_slyguy]: 18,
  [MusicTrack.reconstitute]: 19,
  [MusicTrack.ascension]: 20,
  [MusicTrack.moneymaker]: 21,
  [MusicTrack.full_moneymaker]: 21,
  [MusicTrack.overture]: 22,
  [MusicTrack.drone]: 23,
  [MusicTrack.slime_dangerman]: 24,
  [MusicTrack.slime_megacreep]: 25,
  [MusicTrack.slime_monsterdance]: 26,
  [MusicTrack.slime_exitmusic]: 27,
  [MusicTrack.slime_rollcredits]: 28,
} as const;

export const musicTrackFadeoutOverride: Partial<Record<MusicTrack, number>> = {
  [MusicTrack.champion]: toTime({ minutes: 1, seconds: 12 }),
  [MusicTrack.aqueduct]: toTime({ minutes: 0, seconds: 38 }),
  [MusicTrack.conquerer]: toTime({ minutes: 1, seconds: 20 }),
  [MusicTrack.observer]: toTime({ minutes: 1, seconds: 41 }),
  [MusicTrack.lordy]: toTime({ minutes: 1, seconds: 42 }),
  [MusicTrack.factorio]: toTime({ minutes: 1, seconds: 17 }),
  [MusicTrack.skycastle]: toTime({ minutes: 1, seconds: 48 }),
  [MusicTrack.stonemaze]: toTime({ minutes: 1, seconds: 58 }),
  [MusicTrack.shopkeeper]: toTime({ minutes: 1, seconds: 26 }),
  [MusicTrack.woorb]: toTime({ minutes: 1, seconds: 48 }),
  [MusicTrack.gravy]: toTime({ minutes: 2, seconds: 8 }),
  [MusicTrack.lostcolony]: toTime({ minutes: 2, seconds: 56 }),
  [MusicTrack.backrooms]: toTime({ minutes: 0, seconds: 27 }),
  [MusicTrack.reconstitute]: toTime({ minutes: 3, seconds: 18 }),
  [MusicTrack.ascension]: toTime({ minutes: 2, seconds: 51 }),
} as const;

export function indexToMusicTrack(index: number): MusicTrack {
  if (index < 0) return MusicTrack.None;
  for (const track in musicTrackIndexMap) {
    if (musicTrackIndexMap[track as MusicTrack] === index) {
      return track as MusicTrack;
    }
  }
  return MusicTrack.None;
}

export function musicTracktoIndex(track: MusicTrack): number {
  return musicTrackIndexMap[track] ?? -1;
}
