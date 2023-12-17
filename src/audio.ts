import { MAX_GAIN_MUSIC } from "./constants";

const audioBufferMap: Record<string, AudioBuffer> = {}
const audioSourceMap: Record<string, AudioBufferSourceNode> = {}
const audioGainNodeMap: Record<string, GainNode> = {}
const audioAnalyserMap: Record<string, AnalyserNode> = {}

// for legacy browsers
// @ts-ignore
const AudioContext = window.AudioContext || window.webkitAudioContext;
export let audioContext: AudioContext = new AudioContext();

// nodes
const masterGainNode = audioContext.createGain();
const sfxGainNode = audioContext.createGain();
const musicGainNode = audioContext.createGain();

// wiring
masterGainNode.connect(audioContext.destination);
sfxGainNode.connect(masterGainNode);
musicGainNode.connect(masterGainNode);

// defaults
musicGainNode.gain.value = MAX_GAIN_MUSIC;

export function resumeAudioContext(): Promise<void> {
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

export function getMasterVolume(): number {
  return masterGainNode.gain.value;
}

export function getMusicVolume(): number {
  return musicGainNode.gain.value / MAX_GAIN_MUSIC;
}

export function getSfxVolume(): number {
  return sfxGainNode.gain.value;
}

export function getAnalyser(path: string): AnalyserNode | null {
  const analyser = audioAnalyserMap[path];
  if (!analyser) return null;
  return analyser;
}

export async function loadAudioToBuffer(path: string): Promise<AudioBuffer | null> {
  try {
    if (audioBufferMap[path]) {
      return audioBufferMap[path];
    }
    const response = await fetch(path);
    const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
    audioBufferMap[path] = buffer;
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
  source.onended = () => {
    stopAudio(path);
  }
}

export async function playSfx(path: string, volume: number) {
  playAudio(path, sfxGainNode, { volume });
}

export async function playMusic(path: string, options: AudioSourceOptions) {
  playAudio(path, musicGainNode, options);
}

export async function setPlaybackRate(path: string, rate: number) {
  const source = audioSourceMap[path];
  if (!source) return;
  source.playbackRate.value = rate;
}

export function stopAudio(path: string) {
  audioSourceMap[path]?.stop();
  audioSourceMap[path]?.disconnect();
  audioGainNodeMap[path]?.disconnect();
  delete audioSourceMap[path];
  delete audioGainNodeMap[path];
}

export function unloadAudio(path: string) {
  stopAudio(path);
  delete audioBufferMap[path];
}
