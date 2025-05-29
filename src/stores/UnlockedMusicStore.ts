import { MusicTrack, UnlockedMusicTracks } from "../types";
import { BaseStore } from "./BaseStore";

export class UnlockedMusicStore extends BaseStore<UnlockedMusicTracks> {
  public get key(): string {
    return "unlocked-tracks"
  }

  private readonly defaultValue: UnlockedMusicTracks = {
    [MusicTrack.None]: false,
    [MusicTrack.drone]: false,
    [MusicTrack.champion]: true,
    [MusicTrack.simpleTime]: false,
    [MusicTrack.transient]: false,
    [MusicTrack.aqueduct]: true,
    [MusicTrack.conquerer]: true,
    [MusicTrack.observer]: false,
    [MusicTrack.lordy]: false,
    [MusicTrack.factorio]: false,
    [MusicTrack.skycastle]: false,
    [MusicTrack.creeplord]: false,
    [MusicTrack.dangerZone]: false,
    [MusicTrack.stonemaze]: false,
    [MusicTrack.shopkeeper]: false,
    [MusicTrack.backrooms]: false,
    [MusicTrack.woorb]: false,
    [MusicTrack.gravy]: false,
    [MusicTrack.lostcolony]: false,
    [MusicTrack.slyguy]: false,
    [MusicTrack.reconstitute]: false,
    [MusicTrack.ascension]: false,
    [MusicTrack.moneymaker]: false,
    [MusicTrack.overture]: false,
    [MusicTrack.slime_dangerman]: false,
    [MusicTrack.slime_exitmusic]: false,
    [MusicTrack.slime_megacreep]: false,
    [MusicTrack.slime_monsterdance]: false,
    [MusicTrack.slime_rollcredits]: false,
    [MusicTrack.full_simpleTime]: false,
    [MusicTrack.full_transient]: false,
    [MusicTrack.full_dangerZone]: false,
    [MusicTrack.full_creeplord]: false,
    [MusicTrack.full_slyguy]: false,
    [MusicTrack.full_moneymaker]: false,
  };

  private state: UnlockedMusicTracks = {
    ...this.defaultValue,
    ...this.getStore(),
  };

  public getIsUnlocked = (track: MusicTrack): boolean => {
    switch (track) {
      case MusicTrack.full_simpleTime:
        return this.state[MusicTrack.simpleTime];
      case MusicTrack.full_transient:
        return this.state[MusicTrack.transient];
      case MusicTrack.full_dangerZone:
        return this.state[MusicTrack.dangerZone];
      case MusicTrack.full_creeplord:
        return this.state[MusicTrack.creeplord];
      case MusicTrack.full_slyguy:
        return this.state[MusicTrack.slyguy];
      case MusicTrack.full_moneymaker:
        return this.state[MusicTrack.moneymaker];
      default:
        return this.state[track];
    }
  }

  public unlockTrack = (track: MusicTrack): void => {
    this.state[track] = true;
    this.setStore(this.state);
  }

  public reset = () => {
    this.clearStore();
    this.state = { ...this.defaultValue };
  }
}

class NoOpUnlockedMusicStoreImpl extends UnlockedMusicStore {
  public get key(): string {
    return "no-op-unlocked-tracks"
  }
  public getIsUnlocked = (track: MusicTrack): boolean => {
    return true;
  }

  public unlockTrack = (track: MusicTrack): void => {}

  public reset = () => {}
}

export const NoOpUnlockedMusicStore = new NoOpUnlockedMusicStoreImpl();
