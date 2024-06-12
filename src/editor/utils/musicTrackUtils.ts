import { MusicTrack } from "../../types";

export const musicTrackIndexMap: Record<MusicTrack, number> = {
  [MusicTrack.None]: 0,
  [MusicTrack.champion]: 1,
  [MusicTrack.simpleTime]: 2,
  [MusicTrack.transient]: 3,
  [MusicTrack.aqueduct]: 4,
  [MusicTrack.conquerer]: 5,
  [MusicTrack.observer]: 6,
  [MusicTrack.lordy]: 7,
  [MusicTrack.factorio]: 8,
  [MusicTrack.skycastle]: 9,
  [MusicTrack.creeplord]: 10,
  [MusicTrack.dangerZone]: 11,
  [MusicTrack.stonemaze]: 12,
  [MusicTrack.shopkeeper]: 13,
  [MusicTrack.woorb]: 14,
  [MusicTrack.gravy]: 15,
  [MusicTrack.lostcolony]: 16,
  [MusicTrack.backrooms]: 17,
  [MusicTrack.slyguy]: 18,
  [MusicTrack.reconstitute]: 19,
  [MusicTrack.ascension]: 20,
  [MusicTrack.moneymaker]: 21,
  [MusicTrack.overture]: 22,
  [MusicTrack.drone]: 23,
  [MusicTrack.slime_dangerman]: 24,
  [MusicTrack.slime_megacreep]: 25,
  [MusicTrack.slime_monsterdance]: 26,
  [MusicTrack.slime_exitmusic]: 27,
  [MusicTrack.slime_rollcredits]: 28,
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
