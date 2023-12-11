import { loadAudioToBuffer, playMusic, stopAudio, unloadAudio } from "./audio";
import { MusicTrack } from "./types";

const DEBUG_MUSIC = true;

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

  private fullPath(track: MusicTrack): string {
    const relativeDir = process.env.NODE_ENV === 'production' ? '' : window.location.pathname;
    return `${relativeDir}assets/music/${track}`;
  }

  play(track?: MusicTrack, volume = 1) {
    if (!track) {
      console.warn("[MusicPlayer][play] Track was undefined");
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] playing track=${track},volume=${volume}`);
    }
    try {
      playMusic(this.fullPath(track), { volume, loop: true });
    } catch (err) {
      console.error(err);
    }
  }

  stop(track?: MusicTrack) {
    if (!track) {
      return;
    }
    if (DEBUG_MUSIC) {
      console.log(`[MusicPlayer] stopping track ${track}`);
    }
    try {
      stopAudio(this.fullPath(track));
      unloadAudio(this.fullPath(track));
    } catch (err) {
      console.error(err);
    }
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
