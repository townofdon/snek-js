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
    [MusicTrack.aqueduct]: false,
    [MusicTrack.conquerer]: false,
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
  };

  private state: UnlockedMusicTracks = this.getStore() || { ...this.defaultValue };

  public getIsUnlocked = (track: MusicTrack): boolean => {
    return this.state[track];
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
