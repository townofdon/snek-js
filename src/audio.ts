import { DEFAULT_VOLUME_MUSIC } from "./constants";

const audioBufferMap: Record<string, AudioBuffer> = {}
const audioSourceMap: Record<string, AudioBufferSourceNode> = {}
const audioGainNodeMap: Record<string, GainNode> = {}

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
musicGainNode.gain.value = DEFAULT_VOLUME_MUSIC;

export function setMasterVolume(gain: number) {
  masterGainNode.gain.value = gain;
}

export function setMusicVolume(gain: number) {
  musicGainNode.gain.value = gain;
}

export function setSfxVolume(gain: number) {
  sfxGainNode.gain.value = gain;
}

export function getMasterVolume() {
  return masterGainNode.gain.value;
}

export function getMusicVolume() {
  return musicGainNode.gain.value;
}

export function getSfxVolume() {
  return sfxGainNode.gain.value;
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
}

async function playAudio(path: string, targetNode: AudioNode, options?: AudioSourceOptions) {
  await audioContext.resume();
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
  source.connect(gainNode);
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
