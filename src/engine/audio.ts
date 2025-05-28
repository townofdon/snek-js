import { DEFAULT_VOLUME_SFX, MAX_GAIN_MUSIC } from "../constants";
import { SfxSound } from "../types";
import { requireElementById } from "../ui/uiUtils";
import { inverseLerp, lerp } from "../utils";

const DEBUG_AUDIO = false;
const DEBUG_COMPRESSOR = false;

const audioBufferMap: Record<string, AudioBuffer> = {}
const audioSourceMap: Record<string, AudioBufferSourceNode> = {}
const audioGainNodeMap: Record<string, GainNode> = {}
const audioAnalyserMap: Record<string, AnalyserNode> = {}
const audioTimeStartedMap: Record<string, number> = {}

// for legacy browsers
// @ts-ignore
const AudioContext = window.AudioContext || window.webkitAudioContext;
export const audioContext: AudioContext = new AudioContext();

// nodes
const masterGainNode = audioContext.createGain();
const sfxGainNode = audioContext.createGain();
const musicGainNode = audioContext.createGain();
const musicFilter = audioContext.createBiquadFilter();

// compressor
const compressorState = {
  attack: 0.005,
  knee: 24,
  ratio: 12,
  release: 0.250,
  threshold: -27,
} satisfies DynamicsCompressorOptions
const compressorNode = new DynamicsCompressorNode(audioContext, {
  ...compressorState,
})

// wiring
compressorNode.connect(audioContext.destination);
masterGainNode.connect(compressorNode);
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
  musicGainNode.gain.value = Math.max(gain * MAX_GAIN_MUSIC, 0);
}

export function setSfxVolume(gain: number): void {
  sfxGainNode.gain.value = Math.max(gain * DEFAULT_VOLUME_SFX, 0);
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
  let source: AudioBufferSourceNode;
  if (audioSourceMap[path]?.buffer) {
    source = audioSourceMap[path]
  } else {
    source = audioContext.createBufferSource();
    audioSourceMap[path] = source;
    source.buffer = buffer;
  }
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
  const onended = (source.onended ? source.onended : undefined) as (() => void | undefined);
  source.onended = () => {
    stopAudio(path);
    if (onended) onended()
  }
  if (DEBUG_AUDIO) console.log(`[Audio] playing audio file=${path},gainNode=${gainNode},buffer=${buffer},source=${source}`)
}

export async function loadSfxAudio({ src }: { src: [string] }) {
  const path = src[0]
  // create source node
  const buffer = await loadAudioToBuffer(path);
  if (!buffer) {
    throw new Error(`[Audio] unable to load buffer for audio: ${path}`);
  }
  const source = audioContext.createBufferSource();
  audioSourceMap[path] = source;
  source.buffer = buffer;
  source.loop = false;
  source.loopStart = 0

  const state = {
    playing: false,
    volume: 1,
  }

  const play = () => {
    state.playing = true;
    setTimeout(() => playSfx(path, { volume: state.volume, loop: source.loop }), 0)
    source.onended = () => {
      state.playing = false;
    }
  }
  const stop = () => {
    if (!state.playing) return;
    stopAudio(path);
  }
  const volume = (val?: number): number => {
    if (val !== undefined) {
      state.volume = val;
    }
    return state.volume;
  }
  const loop = (val?: boolean): boolean => {
    if (val !== undefined) {
      source.loop = val;
    }
    return source.loop;
  }
  return {
    play,
    stop,
    volume,
    loop,
    playing: () => state.playing
  } satisfies SfxSound
}

async function playSfx(path: string, options: AudioSourceOptions) {
  return playAudio(path, sfxGainNode, options);
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

/*****************************
    COMPRESSOR CONTROLS
******************************/

if (DEBUG_COMPRESSOR) {
  const container = requireElementById<HTMLDivElement>('compressor-controls');
  const attackInput = container.querySelector('#compressor-attack > input[type=number]') as HTMLInputElement
  const attackSlider = container.querySelector('#compressor-attack > input[type=range]') as HTMLInputElement
  const kneeInput = container.querySelector('#compressor-knee > input[type=number]') as HTMLInputElement
  const kneeSlider = container.querySelector('#compressor-knee > input[type=range]') as HTMLInputElement
  const ratioInput = container.querySelector('#compressor-ratio > input[type=number]') as HTMLInputElement
  const ratioSlider = container.querySelector('#compressor-ratio > input[type=range]') as HTMLInputElement
  const releaseInput = container.querySelector('#compressor-release > input[type=number]') as HTMLInputElement
  const releaseSlider = container.querySelector('#compressor-release > input[type=range]') as HTMLInputElement
  const thresholdInput = container.querySelector('#compressor-threshold > input[type=number]') as HTMLInputElement
  const thresholdSlider = container.querySelector('#compressor-threshold > input[type=range]') as HTMLInputElement

  setValue(attackInput, compressorState.attack)
  setValue(attackSlider, compressorState.attack)
  setValue(kneeInput, compressorState.knee)
  setValue(kneeSlider, compressorState.knee)
  setValue(ratioInput, compressorState.ratio)
  setValue(ratioSlider, compressorState.ratio)
  setValue(releaseInput, compressorState.release)
  setValue(releaseSlider, compressorState.release)
  setValue(thresholdInput, compressorState.threshold)
  setValue(thresholdSlider, compressorState.threshold)

  container.classList.remove('hidden')
  attackInput.addEventListener('change', onAttackChange)
  attackSlider.addEventListener('change', onAttackChange)
  kneeInput.addEventListener('change', onKneeChange)
  kneeSlider.addEventListener('change', onKneeChange)
  ratioInput.addEventListener('change', onRatioChange)
  ratioSlider.addEventListener('change', onRatioChange)
  releaseInput.addEventListener('change', onReleaseChange)
  releaseSlider.addEventListener('change', onReleaseChange)
  thresholdInput.addEventListener('change', onThresholdChange)
  thresholdSlider.addEventListener('change', onThresholdChange)

  function parseEventValue(ev: InputEvent) {
    return parseFloat((ev.target as HTMLInputElement).value || '0')
  }

  function setValue(elem: HTMLInputElement, value: number) {
    elem.value = String(value)
  }

  function updateCompressor() {
    compressorNode.attack.value = compressorState.attack
    compressorNode.knee.value = compressorState.knee
    compressorNode.ratio.value = compressorState.ratio
    compressorNode.release.value = compressorState.release
    compressorNode.threshold.value = compressorState.threshold
  }

  function onAttackChange(ev: InputEvent) {
    compressorState.attack = parseEventValue(ev)
    setValue(attackInput, compressorState.attack)
    setValue(attackSlider, compressorState.attack)
    updateCompressor()
  }

  function onKneeChange(ev: InputEvent) {
    compressorState.knee = parseEventValue(ev)
    setValue(kneeInput, compressorState.knee)
    setValue(kneeSlider, compressorState.knee)
    updateCompressor()
  }

  function onRatioChange(ev: InputEvent) {
    compressorState.ratio = parseEventValue(ev)
    setValue(ratioInput, compressorState.ratio)
    setValue(ratioSlider, compressorState.ratio)
    updateCompressor()
  }

  function onReleaseChange(ev: InputEvent) {
    compressorState.release = parseEventValue(ev)
    setValue(releaseInput, compressorState.release)
    setValue(releaseSlider, compressorState.release)
    updateCompressor()
  }

  function onThresholdChange(ev: InputEvent) {
    compressorState.threshold = parseEventValue(ev)
    setValue(thresholdInput, compressorState.threshold)
    setValue(thresholdSlider, compressorState.threshold)
    updateCompressor()
  }
}
