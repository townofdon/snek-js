import P5 from "p5";
import { FontsInstance, IEnumerator, Image, MusicTrack, Quote, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { MusicPlayer } from "../musicPlayer";
import { clamp, getTrackName } from "../utils";
import { DIMENSIONS, OST_MODE_TRACKS } from "../constants";
import { UI } from "../ui/ui";
import { UnlockedMusicStore } from "../stores/UnlockedMusicStore";
import { SpriteRenderer } from "../spriteRenderer";

const VISUALIZER = {
  width: 360,
  height: 360,
  y: 80,
  sweepCycleTimeMs: 4000,
}

enum VisualizerMode {
  OsciliscopeLine,
  OsciliscopeRing,
  FrequencyBarGraph,
  FrequencySpectrum,
}

export class OSTScene extends BaseScene {
  private sfx: SFXInstance;
  private musicPlayer: MusicPlayer;
  private unlockedMusicStore: UnlockedMusicStore;
  private spriteRenderer: SpriteRenderer;
  private uiElements: P5.Element[] = []

  private state = {
    locked: false,
    trackIndex: 0,
    timeStarted: 0,
    timeModeLastChanged: 0,
    visualizerMode: VisualizerMode.OsciliscopeRing,
  }

  private frequencySweep = {
    t: 0,
  }

  private buttons: Record<VisualizerMode, P5.Element | null> = {
    [VisualizerMode.OsciliscopeLine]: null,
    [VisualizerMode.OsciliscopeRing]: null,
    [VisualizerMode.FrequencyBarGraph]: null,
    [VisualizerMode.FrequencySpectrum]: null,
  }

  constructor(p5: P5, sfx: SFXInstance, musicPlayer: MusicPlayer, fonts: FontsInstance, unlockedMusicStore: UnlockedMusicStore, spriteRenderer: SpriteRenderer, callbacks: SceneCallbacks = {}) {
    super(p5, fonts, callbacks)
    this.sfx = sfx;
    this.musicPlayer = musicPlayer;
    this.unlockedMusicStore = unlockedMusicStore;
    this.spriteRenderer = spriteRenderer;
    this.bindActions();
    this.initState();
    this.stopTrack();
    this.playTrack();
    this.addVisModeButtons();
  }

  private initState() {
    this.state = {
      locked: false,
      trackIndex: 0,
      timeStarted: Date.now(),
      timeModeLastChanged: Date.now(),
      visualizerMode: VisualizerMode.OsciliscopeRing,
    }
  }

  private cleanupUI = () => {
    this.uiElements.forEach(element => element.remove());
  }

  private onChangeVisualizationMode = (mode: VisualizerMode) => {
    this.state.visualizerMode = mode;
    this.state.timeModeLastChanged = Date.now();
    this.frequencySweep.t = 0;
    const buttonKeys = Object.keys(this.buttons);
    buttonKeys.forEach(buttonKey => {
      if (buttonKey === String(mode)) {
        this.buttons[buttonKey as unknown as VisualizerMode].addClass('active');
      } else {
        this.buttons[buttonKey as unknown as VisualizerMode].removeClass('active');
      }
    })
  }

  private addVisModeButtons = () => {
    const addButton = (mode: VisualizerMode, x: number, y: number) => {
      const button = UI.drawButton('', x, y, () => { this.onChangeVisualizationMode(mode); }, this.uiElements);
      button.addClass('snek-audio-viz-button');
      return button;
    }
    const buttonSize = 32;
    const buttonPadding = 8;
    const x = (DIMENSIONS.x - VISUALIZER.width) * 0.5 - buttonSize - buttonPadding;
    const y = VISUALIZER.y;
    this.buttons[VisualizerMode.OsciliscopeLine] = addButton(VisualizerMode.OsciliscopeLine, x, y + (buttonSize + buttonPadding) * 0).id('oscilliscope-line').addClass('oscilliscope-line');
    this.buttons[VisualizerMode.OsciliscopeRing] = addButton(VisualizerMode.OsciliscopeRing, x, y + (buttonSize + buttonPadding) * 1).id('oscilliscope-ring').addClass('oscilliscope-ring').addClass('active');
    this.buttons[VisualizerMode.FrequencyBarGraph] = addButton(VisualizerMode.FrequencyBarGraph, x, y + (buttonSize + buttonPadding) * 2).id('frequency-bar-graph').addClass('frequency-bar-graph');
    this.buttons[VisualizerMode.FrequencySpectrum] = addButton(VisualizerMode.FrequencySpectrum, x, y + (buttonSize + buttonPadding) * 3).id('frequency-spectrum').addClass('frequency-spectrum');
  }

  private advanceVisMode = (step: number) => {
    const next = step > 0 ? {
      [VisualizerMode.OsciliscopeLine]: VisualizerMode.OsciliscopeRing,
      [VisualizerMode.OsciliscopeRing]: VisualizerMode.FrequencyBarGraph,
      [VisualizerMode.FrequencyBarGraph]: VisualizerMode.FrequencySpectrum,
      [VisualizerMode.FrequencySpectrum]: VisualizerMode.OsciliscopeLine,
    } : {
      [VisualizerMode.OsciliscopeLine]: VisualizerMode.FrequencySpectrum,
      [VisualizerMode.FrequencySpectrum]: VisualizerMode.FrequencyBarGraph,
      [VisualizerMode.FrequencyBarGraph]: VisualizerMode.OsciliscopeRing,
      [VisualizerMode.OsciliscopeRing]: VisualizerMode.OsciliscopeLine,
    }
    this.state.visualizerMode = next[this.state.visualizerMode];
    this.onChangeVisualizationMode(this.state.visualizerMode);
  }

  draw = () => {
    if (Date.now() - this.state.timeStarted <= 50) {
      this.drawBackground();
    }
    this.drawVisualization();
    this.drawSceneTitle();
    this.drawTrackMetadata();
    this.drawLocked();
    this.drawInstructions();
    this.drawExit();
    this.tick();
  };

  *action(): Generator<IEnumerator, void, unknown> { }

  keyPressed = () => {
    const { keyCode, ESCAPE, BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = this.props.p5;
    const { onEscapePress } = this.props.callbacks;
    if (keyCode === ESCAPE || keyCode === BACKSPACE || keyCode === DELETE) {
      if (onEscapePress) {
        this.stopAllCoroutines();
        onEscapePress();
        this.cleanupUI();
        this.cleanup();
      }
    } else if (keyCode === LEFT_ARROW) {
      this.advanceTrack(-1);
    } else if (keyCode === RIGHT_ARROW) {
      this.advanceTrack(1);
    } else if (keyCode === UP_ARROW) {
      this.advanceVisMode(-1);
    } else if (keyCode === DOWN_ARROW) {
      this.advanceVisMode(1);
    }
  };

  private stopTrack() {
    return this.musicPlayer.stopAllTracks({ unload: false });
  }

  private playTrack() {
    const sfx = this.sfx;
    sfx.play(Sound.unlock, 0.8);
    const track = OST_MODE_TRACKS[this.state.trackIndex];
    const isUnlocked = this.unlockedMusicStore.getIsUnlocked(track);
    this.state.locked = !isUnlocked;
    if (isUnlocked) {
      this.musicPlayer.play(track, 1, true, true);
    }
  }

  private advanceTrack(step: number) {
    this.stopTrack();
    this.state.timeStarted = Date.now();
    this.state.trackIndex += OST_MODE_TRACKS.length;
    this.state.trackIndex += step;
    this.state.trackIndex %= OST_MODE_TRACKS.length
    this.frequencySweep.t = 0;
    this.playTrack();
  }

  private drawSceneTitle = () => {
    const { p5, fonts } = this.props;
    p5.fill('#777');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(12);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text('[OST MODE]', ...this.getPosition(0.98, 0.02));
  }

  private drawExit = () => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(12);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('[DEL] EXIT', ...this.getPosition(0.02, 0.02));
  }

  private drawTrackMetadata = () => {
    const { p5, fonts } = this.props;
    const track = OST_MODE_TRACKS[this.state.trackIndex];
    // track name
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(32);
    p5.textAlign(p5.CENTER, p5.TOP);
    if (this.state.locked) {
      p5.fill('#555');
    } else {
      p5.fill('#fff');
    }
    p5.text(getTrackName(track), ...this.getPosition(0.5, 0.8));

    // time elapsed background
    let x0 = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + 1;
    let x1 = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + VISUALIZER.width - 1;
    let y0 = VISUALIZER.y + VISUALIZER.height - 1 - 24;
    let y1 = VISUALIZER.y + VISUALIZER.height - 1;
    p5.fill("#111111");
    p5.noStroke();
    p5.strokeWeight(1);
    p5.quad(x0, y0, x0, y1, x1, y1, x1, y0);
    p5.strokeWeight(2);

    // time elapsed, track number
    p5.textFont(fonts.variants.miniMood);
    p5.fill('#ccc');
    p5.textSize(12);

    if (!this.state.locked) {
      this.drawTimeElapsed();
    }
    this.drawTrackNumber();
  }

  private drawTimeElapsed = () => {
    const { p5, fonts } = this.props;
    const track = OST_MODE_TRACKS[this.state.trackIndex];
    const padding = 5;
    const x = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + 2 + padding;
    const y = (VISUALIZER.y + VISUALIZER.height) + 4 - padding;
    const timeElapsed = this.musicPlayer.getTimeElapsed(track);
    const millis = Math.floor((timeElapsed % 1) * 1000);
    const seconds = Math.floor(timeElapsed % 60);
    const minutes = Math.floor(timeElapsed / 60);
    p5.textAlign(p5.LEFT, p5.BOTTOM);
    p5.text(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`, x, y);
  }

  private drawTrackNumber = () => {
    const trackNumber = (this.state.trackIndex + 1).toString().padStart(2, '0');
    const { p5, fonts } = this.props;
    const padding = 5;
    const x = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + VISUALIZER.width - 5 - padding;
    const y = (VISUALIZER.y + VISUALIZER.height) + 4 - padding;
    p5.textAlign(p5.RIGHT, p5.BOTTOM);
    p5.text(trackNumber, x, y);
  }

  private drawLocked = () => {
    if (!this.state.locked) {
      return;
    }
    const { p5, fonts } = this.props;
    const image = Image.UILocked
    const imgWidth = this.spriteRenderer.getImageWidth(image);
    const imgHeight = this.spriteRenderer.getImageHeight(image);
    const x = DIMENSIONS.x * 0.5 - (imgWidth * 0.5);
    const y = VISUALIZER.y + (VISUALIZER.height * 0.5) - (imgHeight * 0.5);
    this.spriteRenderer.drawImage(image, x, y);
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill('#ccc');
    p5.text('locked', ...this.getPosition(0.5, 0.54));
  }

  private drawInstructions = () => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill('#fff');
    p5.text('<- PREV           NEXT ->', ...this.getPosition(0.5, 0.9));
  }

  private drawVisualization = () => {
    if (this.state.locked) {
      this.drawVisualizationBackground();
      return;
    }

    const track = OST_MODE_TRACKS[this.state.trackIndex];
    const analyser = this.musicPlayer.getAnalyser(track);
    if (!analyser) {
      return;
    }

    switch (this.state.visualizerMode) {
      case VisualizerMode.OsciliscopeLine:
        this.drawVisualizationBackground();
        this.drawVisualizationOscilliscopeLine(analyser);
        break;
      case VisualizerMode.OsciliscopeRing:
        this.drawVisualizationBackground();
        this.drawVisualizationOscilliscopeRing(analyser);
        break;
      case VisualizerMode.FrequencyBarGraph:
        this.drawVisualizationBackground();
        this.drawVisualizationFrequencyBarGraph(analyser);
        break;
      case VisualizerMode.FrequencySpectrum:
        if (false
          || Date.now() - this.state.timeStarted <= 50
          || Date.now() - this.state.timeModeLastChanged <= 50
        ) {
          this.drawVisualizationBackground("#111");
        }
        this.drawVisualizationFrequencySpectrum(analyser);
        break;
    }
  }

  private drawVisualizationBackground = (fill = '#11111188') => {
    const { p5 } = this.props;
    let x0 = (DIMENSIONS.x - VISUALIZER.width) * 0.5;
    let x1 = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + VISUALIZER.width;
    let y0 = VISUALIZER.y;
    let y1 = VISUALIZER.y + VISUALIZER.height;
    p5.fill(fill);
    p5.stroke("#ccc");
    p5.strokeWeight(1);
    p5.quad(x0, y0, x0, y1, x1, y1, x1, y0);
  }

  private drawVisualizationOscilliscopeLine = (analyser: AnalyserNode) => {
    const { p5 } = this.props;
    p5.strokeWeight(2);
    analyser.smoothingTimeConstant = 0.5;
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount; // buffer length will always be exactly half of the fftSize - due to nyquist theorum I believe :)
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    const sliceWidth = (VISUALIZER.width - 2) / bufferLength;

    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    let x = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + 1;
    for (let i = 0; i < bufferLength; i++) {
      const t = i / (bufferLength - 1)
      const v = dataArray[i] * 0.0078125 - 1; // convert 0..256 to -1..1 range
      const y = v * (VISUALIZER.height * 0.5) + VISUALIZER.height * 0.5 + VISUALIZER.y;

      if (i === 0) {
        points[0].x = x;
        points[0].y = y;
      }

      points[1].x = x;
      points[1].y = y;

      const color = p5.lerpColor(p5.color("#f50"), p5.color("#06b"), t);
      p5.stroke(color);
      p5.line(points[0].x, points[0].y, points[1].x, points[1].y);

      points[0].x = x;
      points[0].y = y;

      x += sliceWidth;
    }
  }

  private drawVisualizationOscilliscopeRing = (analyser: AnalyserNode) => {
    const { p5 } = this.props;
    p5.strokeWeight(2);
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.2;
    const bufferLength = analyser.frequencyBinCount; // buffer length will always be exactly half of the fftSize
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const points = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]
    const centerX = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + VISUALIZER.width * 0.5;
    const centerY = VISUALIZER.height * 0.5 + VISUALIZER.y;
    const radius = Math.min(VISUALIZER.width * 0.25, VISUALIZER.height * 0.25);

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] * 0.0078125; // (1 / 256) >>> convert 0..256 to 0..2 range
      const t = i / (bufferLength - 1);
      const radians = t * 2 * Math.PI;

      const x = centerX + Math.cos(radians) * radius * v;
      const y = centerY + Math.sin(radians) * radius * v;

      if (i === 0) {
        points[0].x = x;
        points[0].y = y;
      }

      points[1].x = x;
      points[1].y = y;

      const color = p5.lerpColor(p5.color("#06b"), p5.color("#f50"), Math.abs((v - 1) * 2));
      p5.stroke(color);
      p5.line(points[0].x, points[0].y, points[1].x, points[1].y);

      points[0].x = x;
      points[0].y = y;
    }
  }

  // note - the algorithm below calculates linear sampled values into a log graph, hence why it's so complicated.
  // basically, here are the steps:
  // 1) sample the frequencies at a high resolution
  // 2) create buckets with some array length (N), and iterate over all sampled values, adding the item to the appropriate bucket (falls into a particular log step)
  // 3) iterate over each bucket item, averaging out based on total counts of items
  private drawVisualizationFrequencyBarGraph = (analyser: AnalyserNode) => {
    const { p5 } = this.props;
    analyser.fftSize = 2048; // buffer length will always be exactly half of the fftSize
    analyser.smoothingTimeConstant = 0.8;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // populate log values
    const numSamples = 32;
    const logValues = new Uint16Array(numSamples);
    const counts = new Uint8Array(numSamples);
    let i0 = 0;
    for (let i = 0; i < bufferLength; i++) {
      const threshold = logspace(20, 20000, i0 + 1, numSamples);
      const freq = i / (bufferLength - 1) * 24000;
      const v = dataArray[i];
      if (freq >= threshold) {
        i0++;
      }
      logValues[i0] += v;
      counts[i0] += 1;
    }

    // average out the buckets
    for (let i = 0; i < numSamples; i++) {
      logValues[i] = logValues[i] / counts[i];
    }

    const baselineY = 26;
    const sliceWidth = (VISUALIZER.width - 2) / numSamples;
    const leftEdge = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + 1;
    let x = leftEdge;

    for (let i = 0; i < numSamples; i++) {
      const t = i / (numSamples - 1);
      const v = logValues[i] / 256;
      const barHeight = (VISUALIZER.height - baselineY * 2) * v;

      const x0 = x;
      const x1 = x + sliceWidth - 4;
      const y0 = VISUALIZER.y + VISUALIZER.height - baselineY - barHeight;
      const y1 = VISUALIZER.y + VISUALIZER.height - baselineY;

      const color0 = p5.lerpColor(p5.color("#06b"), p5.color("#f50"), v * 1);
      const color1 = p5.color("#06b");
      p5.fill(color1);
      p5.noStroke();
      // p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);

      linearGradient(p5, x0, y0, x1 - x0, y1 - y0, color0, color1);

      x += sliceWidth;
    }
  }

  private drawVisualizationFrequencySpectrum = (analyser: AnalyserNode) => {
    const { p5 } = this.props;
    p5.strokeWeight(2);
    analyser.fftSize = 1024; // buffer length will always be exactly half of the fftSize
    analyser.smoothingTimeConstant = 0.8;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // populate log values
    const numSamples = 256;
    const logValues = new Uint16Array(numSamples);
    const counts = new Uint8Array(numSamples);
    let i0 = 0;
    for (let i = 0; i < bufferLength; i++) {
      const threshold = logspace(20, 20000, i0 + 1, numSamples);
      const freq = i / (bufferLength - 1) * 24000;
      const v = dataArray[i];
      if (freq >= threshold) {
        i0++;
      }
      logValues[i0] += v;
      counts[i0] += 1;
    }

    // average out the buckets
    for (let i = 0; i < numSamples; i++) {
      logValues[i] = logValues[i] / counts[i];
    }

    const baselineY = 26;
    const leftEdge = (DIMENSIONS.x - VISUALIZER.width) * 0.5 + 3;
    const topEdge = VISUALIZER.y + 2;
    const bottomEdge = VISUALIZER.y + VISUALIZER.height - baselineY;

    for (let i = 0; i < numSamples; i++) {
      const v = (logValues[i] / 256) * 1.2;
      const x = leftEdge + (i / (numSamples - 1)) * (VISUALIZER.width - 6);
      const y = p5.lerp(topEdge, bottomEdge, this.frequencySweep.t % 1);
      const wrapY = (val: number) => (val - topEdge) % (VISUALIZER.height - baselineY) + topEdge;
      const color0 = p5.lerpColor(p5.color("#000"), p5.color("#06b"), clamp(v * 2, 0, 1));
      const color1 = p5.lerpColor(p5.color("#06b"), p5.color("#f50"), clamp(v * 2 - 1, 0, 1));
      p5.stroke(v < 0.5 ? color0 : color1);
      p5.point(x, y);
      p5.stroke("#00000088");
      p5.point(x, wrapY(y + 1));
      p5.stroke("#00000077");
      p5.point(x, wrapY(y + 2));
      p5.stroke("#00000066");
      p5.point(x, wrapY(y + 3));
      p5.stroke("#00000055");
      p5.point(x, wrapY(y + 4));
      p5.stroke("#00000044");
      p5.point(x, wrapY(y + 5));
      p5.stroke("#00000033");
      p5.point(x, wrapY(y + 6));
      p5.stroke("#00000022");
      p5.point(x, wrapY(y + 7));
      p5.stroke("#00000011");
      p5.point(x, wrapY(y + 8));
      // p5.fill(color);
      // p5.noStroke();
      // p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    }
    this.frequencySweep.t += p5.deltaTime / VISUALIZER.sweepCycleTimeMs;
  }
}

/**
 * 
 * @param start - start frequency
 * @param stop - stop frequency
 * @param n - the point which you wish to compute (zero based)
 * @param divisions - the number of points over which to divide the frequency range
 *
 * USAGE:
 * 
 * ```
 * logspace(20, 200000, 0, 4) = 20
 * logspace(20, 200000, 1, 4) = 200
 * logspace(20, 200000, 2, 4) = 2000
 * logspace(20, 200000, 3, 4) = 20000
 * ```
 * 
 * source: https://stackoverflow.com/a/32321419
 */
function logspace(start: number, stop: number, n: number, divisions: number) {
  return start * Math.pow(stop / start, n / (divisions - 1));
}

enum LGOrientation {
  Vertical,
  Horizontal,
}

function linearGradient(p5: P5, x: number, y: number, w: number, h: number, c1: P5.Color, c2: P5.Color, orientation: LGOrientation = LGOrientation.Vertical) {
  p5.noFill();
  p5.strokeWeight(1);

  if (orientation === LGOrientation.Vertical) {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = p5.map(i, y, y + h, 0, 1);
      let c = p5.lerpColor(c1, c2, inter);
      p5.stroke(c);
      p5.line(x, i, x + w, i);
    }
  } else if (orientation === LGOrientation.Horizontal) {
    // Left to right gradient
    for (let i = x; i <= x + w; i++) {
      let inter = p5.map(i, x, x + w, 0, 1);
      let c = p5.lerpColor(c1, c2, inter);
      p5.stroke(c);
      p5.line(i, y, i, y + h);
    }
  }
}
