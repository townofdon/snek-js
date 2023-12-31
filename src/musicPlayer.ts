import { getAnalyser, getMusicLowpassFrequency, getMusicVolume, loadAudioToBuffer, playMusic, setMusicLowpassFrequency, setMusicVolume, setPlaybackRate, stopAudio, unloadAudio } from "./audio";
import { GameSettings, MusicTrack } from "./types";

const DEBUG_MUSIC = false;

interface MusicPlayerState {
  currentTrack: MusicTrack | null
  playbackRate: number
}

/**
 * Usage
 * 
 * ```
 * const musicPlayer = new MusicPlayer();
 * 
 * function preLoad() {
 *   musicPlayer.load("goin-buggy.mp3");
 * }
 * 
 * function onLevelStart() {
 *   musicPlayer.play("goin-buggy.mp3");
 * }
 * ```
 */
export class MusicPlayer {
  private state: MusicPlayerState = {
    currentTrack: null,
    playbackRate: 1,
  }
  private tracksPlaying: Record<MusicTrack, boolean> = {
    [MusicTrack.simpleTime]: false,
    [MusicTrack.conquerer]: false,
    [MusicTrack.transient]: false,
    [MusicTrack.lordy]: false,
    [MusicTrack.champion]: false,
    [MusicTrack.dangerZone]: false,
    [MusicTrack.aqueduct]: false,
    [MusicTrack.creeplord]: false,
    [MusicTrack.moneymaker]: false,
    [MusicTrack.factorio]: false,
  };
  private settings: GameSettings;

  private fullPath(track: MusicTrack): string {
    const relativeDir = process.env.NODE_ENV === 'production' ? '' : window.location.pathname;
    return `${relativeDir}assets/music/${track}`;
  }

  constructor(settings: GameSettings) {
    this.settings = settings;
  }

  setVolume = (volume: number) => {
    setMusicVolume(this.settings.musicVolume * volume);
  }

  getVolume = () => {
    return this.settings.musicVolume > 0 ? (getMusicVolume() / this.settings.musicVolume) : 0
  }

  isPlaying(track?: MusicTrack) {
    if (!track) return false;
    return this.tracksPlaying[track];
  }

  getAnalyser(track?: MusicTrack) {
    if (!track) return null;
    return getAnalyser(this.fullPath(track));
  }

  async play(track?: MusicTrack, volume = 1, createAnalyser = false) {
    if (!navigator.userActivation.hasBeenActive) {
      if (DEBUG_MUSIC) console.warn(`[MusicPlayer][play] user not yet active when trying to play track=${track}`);
      return;
    }
    if (!track) {
      console.warn("[MusicPlayer][play] Track was undefined");
      return;
    }
    this.normalSpeed(track);
    this.setLowpassFrequency(1);
    if (this.tracksPlaying[track] && track === this.state.currentTrack) {
      if (DEBUG_MUSIC) console.warn(`[MusicPlayer][play] already playing track=${track}`);
      return;
    }
    if (DEBUG_MUSIC) console.log(`[MusicPlayer] playing track=${track},volume=${volume}`);
    try {
      this.tracksPlaying[track] = true;
      this.state.currentTrack = track;
      await playMusic(this.fullPath(track), { volume, loop: true, createAnalyser });
    } catch (err) {
      console.error(err);
    }
  }

  private stop(track?: MusicTrack, unload = true) {
    if (!track) {
      this.stopCurrentTrack();
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] stopping track ${track}`);
    }
    try {
      stopAudio(this.fullPath(track));
      if (unload) {
        unloadAudio(this.fullPath(track));
      }
      this.tracksPlaying[track] = false;
      if (track === this.state.currentTrack) {
        this.state.currentTrack = null;
      }
    } catch (err) {
      console.error(err);
    }
  }

  private stopCurrentTrack(unload = true) {
    if (!this.state.currentTrack) {
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] stopping track ${this.state.currentTrack}`);
    }
    try {
      stopAudio(this.fullPath(this.state.currentTrack));
      if (unload) {
        unloadAudio(this.fullPath(this.state.currentTrack));
      }
      this.tracksPlaying[this.state.currentTrack] = false;
      this.state.currentTrack = null;
    } catch (err) {
      console.error(err);
    }
  }

  stopAllTracks({ exclude, unload = true }: { exclude?: MusicTrack[], unload?: boolean } = {}) {
    const tracks = Object.keys(this.tracksPlaying) as MusicTrack[];
    tracks.forEach(track => {
      if (this.tracksPlaying[track] && !exclude?.includes(track)) {
        this.stop(track, unload);
      }
    })
  }

  halfSpeed(track?: MusicTrack) {
    this.setPlaybackRate(track, 0.5);
  }

  normalSpeed(track?: MusicTrack) {
    this.setPlaybackRate(track, 1);
  }

  setPlaybackRate = (track: MusicTrack | undefined, rate: number) => {
    if (!track) {
      return;
    }
    setPlaybackRate(this.fullPath(track), rate);
    this.state.playbackRate = rate;
  }

  getPlaybackRate = (track: MusicTrack | undefined) => {
    if (!track) {
      return 0;
    }
    return this.state.playbackRate;
  }

  setLowpassFrequency = (normalizedFreq: number) => {
    setMusicLowpassFrequency(normalizedFreq);
  }

  getLowpassFrequency = () => {
    return getMusicLowpassFrequency();
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
