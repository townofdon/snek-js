import { MAX_GAIN_MUSIC } from "../constants";
import { inverseLerp, lerp } from "../utils";

const DEBUG_AUDIO = false;

const audioBufferMap: Record<string, AudioBuffer> = {}
const audioSourceMap: Record<string, AudioBufferSourceNode> = {}
const audioGainNodeMap: Record<string, GainNode> = {}
const audioAnalyserMap: Record<string, AnalyserNode> = {}
const audioTimeStartedMap: Record<string, number> = {}

// for legacy browsers
// @ts-ignore
const AudioContext = window.AudioContext || window.webkitAudioContext;
export let audioContext: AudioContext = new AudioContext();

// nodes
const masterGainNode = audioContext.createGain();
const sfxGainNode = audioContext.createGain();
const musicGainNode = audioContext.createGain();
const musicFilter = audioContext.createBiquadFilter();

// wiring
masterGainNode.connect(audioContext.destination);
sfxGainNode.connect(masterGainNode);
musicGainNode.connect(musicFilter);
musicFilter.connect(masterGainNode);

// defaults
musicGainNode.gain.value = MAX_GAIN_MUSIC;
musicFilter.type = 'lowpass';
musicFilter.frequency.value = audioContext.sampleRate * 0.5; // see: https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/frequency

export async function resumeAudioContext(): Promise<void> {
  if (!navigator.userActivation.hasBeenActive) return;
  if (audioContext.state === 'running') return;
  return audioContext.resume();
}

export function setMasterVolume(gain: number): void {
  masterGainNode.gain.value = gain;
}

export function setMusicVolume(gain: number): void {
  musicGainNode.gain.value = gain * MAX_GAIN_MUSIC;
}

export function setSfxVolume(gain: number): void {
  sfxGainNode.gain.value = gain;
}

export function setMusicLowpassFrequency(normalizedFreq: number) {
  musicFilter.frequency.value = lerp(musicFilter.frequency.minValue, musicFilter.frequency.maxValue, normalizedFreq);
}

export function getMasterVolume(): number {
  return masterGainNode.gain.value;
}

export function getMusicVolume(): number {
  return musicGainNode.gain.value / MAX_GAIN_MUSIC;
}

export function getSfxVolume(): number {
  return sfxGainNode.gain.value;
}

export function getMusicLowpassFrequency(): number {
  return inverseLerp(musicFilter.frequency.minValue, musicFilter.frequency.maxValue, musicFilter.frequency.value);
}

export function getAnalyser(path: string): AnalyserNode | null {
  const analyser = audioAnalyserMap[path];
  if (!analyser) return null;
  return analyser;
}

export async function loadAudioToBuffer(path: string): Promise<AudioBuffer | null> {
  try {
    if (audioBufferMap[path]) {
      if (DEBUG_AUDIO) console.log(`[Audio] got buffer from map for file=${path}`);
      return audioBufferMap[path];
    }
    const response = await fetch(path);
    const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
    audioBufferMap[path] = buffer;
    if (DEBUG_AUDIO) console.log(`[Audio] loaded new buffer for file=${path}`);
    return buffer;
  } catch (err) {
    console.error(`Unable to load audio file. Error: ${err.message}`);
    return null;
  }
}

interface AudioSourceOptions {
  volume: number
  loop?: boolean,
  loopStart?: number,
  createAnalyser?: boolean,
  trackElapsed?: boolean,
}

async function playAudio(path: string, targetNode: AudioNode, options?: AudioSourceOptions) {
  if (audioContext.state === 'suspended') {
    console.warn(`[Audio] could not play "${path}" due to audio context being suspended`);
    return;
  }
  // create gain node
  const gainNode = audioContext.createGain();
  audioGainNodeMap[path] = gainNode;
  gainNode.gain.value = options?.volume ?? 1;
  gainNode.connect(targetNode);
  // create source node
  const buffer = await loadAudioToBuffer(path);
  if (!buffer) {
    throw new Error(`[Audio] unable to load buffer for audio: ${path}`);
  }
  const source = audioContext.createBufferSource();
  audioSourceMap[path] = source;
  source.buffer = buffer;
  source.loop = options?.loop || false;
  source.loopStart = options?.loopStart || 0
  // create analyzer
  if (options?.createAnalyser) {
    const analyser = audioContext.createAnalyser();
    audioAnalyserMap[path] = analyser;
    source.connect(analyser);
    analyser.connect(gainNode);
  } else {
    source.connect(gainNode);
  }
  // start audio
  source.start();
  if (options.trackElapsed) {
    audioTimeStartedMap[path] = audioContext.currentTime;
  }
  source.onended = () => {
    stopAudio(path);
  }
  if (DEBUG_AUDIO) console.log(`[Audio] playing audio file=${path},gainNode=${gainNode},buffer=${buffer},source=${source}`)
}

export async function playSfx(path: string, volume: number) {
  return playAudio(path, sfxGainNode, { volume });
}

export async function playMusic(path: string, options: AudioSourceOptions) {
  return playAudio(path, musicGainNode, options);
}

export async function setPlaybackRate(path: string, rate: number) {
  const source = audioSourceMap[path];
  if (!source) return;
  source.playbackRate.value = rate;
}

export async function getPlaybackRate(path: string): Promise<number> {
  const source = audioSourceMap[path];
  if (!source) return 0;
  return source.playbackRate.value;
}

export function getTimeElapsed(path: string): number {
  if (audioTimeStartedMap[path] === undefined || audioTimeStartedMap[path] < 0) return 0;
  return Math.max(audioContext.currentTime - audioTimeStartedMap[path], 0);
}

export function stopAudio(path: string) {
  if (audioSourceMap[path]) {
    audioSourceMap[path].onended = undefined;
    audioSourceMap[path].stop();
    audioSourceMap[path].disconnect();
  }
  if (audioTimeStartedMap[path]) {
    audioTimeStartedMap[path] = -1;
  }
  audioGainNodeMap[path]?.disconnect();
  audioSourceMap[path] = null;
  audioGainNodeMap[path] = null;
}

export function unloadAudio(path: string) {
  stopAudio(path);
  audioBufferMap[path] = null;
}
