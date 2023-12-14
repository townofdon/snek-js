import { loadAudioToBuffer, playMusic, setPlaybackRate, stopAudio, unloadAudio } from "./audio";
import { MusicTrack } from "./types";

const DEBUG_MUSIC = false;

interface MusicPlayerState {
  currentTrack: MusicTrack | null
}

/**
 * Usage
 * 
 * ```
 * const music = new Music();
 * 
 * function preLoad() {
 *   music.load("goin-buggy.mp3");
 * }
 * 
 * function onLevelStart() {
 *   music.play("goin-buggy.mp3");
 * }
 * ```
 */
export class MusicPlayer {
  private state: MusicPlayerState = {
    currentTrack: null,
  }
  private tracksPlaying: Record<MusicTrack, boolean> = {
    [MusicTrack.simpleTime]: false,
    [MusicTrack.conquerer]: false,
    [MusicTrack.transient]: false,
    [MusicTrack.lordy]: false,
    [MusicTrack.champion]: false,
    [MusicTrack.dangerZone]: false,
    [MusicTrack.aqueduct]: false,
    [MusicTrack.creeplord]: false
  };

  private fullPath(track: MusicTrack): string {
    const relativeDir = process.env.NODE_ENV === 'production' ? '' : window.location.pathname;
    return `${relativeDir}assets/music/${track}`;
  }

  isPlaying(track?: MusicTrack) {
    if (!track) return false;
    return this.tracksPlaying[track];
  }

  play(track?: MusicTrack, volume = 1) {
    if (!track) {
      console.warn("[MusicPlayer][play] Track was undefined");
      return;
    }
    this.normalSpeed(track);
    if (this.tracksPlaying[track]) {
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] playing track=${track},volume=${volume}`);
    }
    try {
      playMusic(this.fullPath(track), { volume, loop: true });
      this.tracksPlaying[track] = true;
      this.state.currentTrack = track;
    } catch (err) {
      console.error(err);
    }
  }

  private stop(track?: MusicTrack) {
    if (!track) {
      this.stopCurrentTrack();
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] stopping track ${track}`);
    }
    try {
      stopAudio(this.fullPath(track));
      unloadAudio(this.fullPath(track));
      this.tracksPlaying[track] = false;
      if (track === this.state.currentTrack) {
        this.state.currentTrack = null;
      }
    } catch (err) {
      console.error(err);
    }
  }

  private stopCurrentTrack() {
    if (!this.state.currentTrack) {
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] stopping track ${this.state.currentTrack}`);
    }
    try {
      stopAudio(this.fullPath(this.state.currentTrack));
      unloadAudio(this.fullPath(this.state.currentTrack));
      this.tracksPlaying[this.state.currentTrack] = false;
      this.state.currentTrack = null;
    } catch (err) {
      console.error(err);
    }
  }

  stopAllTracks({ exclude }: { exclude?: MusicTrack[] } = {}) {
    const tracks = Object.keys(this.tracksPlaying) as MusicTrack[];
    tracks.forEach(track => {
      if (this.tracksPlaying[track] && !exclude?.includes(track)) {
        this.stop(track);
      }
    })
  }

  halfSpeed(track?: MusicTrack) {
    if (!track) {
      return;
    }
    setPlaybackRate(this.fullPath(track), 0.5);
  }

  normalSpeed(track?: MusicTrack) {
    if (!track) {
      return;
    }
    setPlaybackRate(this.fullPath(track), 1);
  }

  load(track: MusicTrack) {
    if (!track) {
      console.warn("[MusicPlayer][load] Track was undefined");
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] loading track ${track}`);
    }
    try {
      loadAudioToBuffer(this.fullPath(track));
    } catch (err) {
      console.error(err);
    }
  }
}
