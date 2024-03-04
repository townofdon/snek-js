import P5 from 'p5';
import { KeyChannel } from '../types';

import { Emitters } from "../collections/emitters";
import { Gradients } from '../collections/gradients';
import { EmitterOptions } from "../types";
import { Easing } from '../easing';

const EMITTER_OPTIONS_BASE: EmitterOptions = {
  gradientIndex: 0,
  originOffset: 0.1,
  lifetime: 750,
  burst: 4,
  spawnOverTime: 3,
  speed: 0.1,
  speedVariance: 0.2,
  scaleStart: 0.4,
  scaleEnd: 0.2,
  scaleVariance: 0.4,
  orbit: 0,
  loop: false,
  easingFnc: Easing.outCubic,
}

const EMITTER_OPTIONS_ALT: EmitterOptions = {
  gradientIndex: 0,
  originOffset: 0.5,
  lifetime: 700,
  burst: 3,
  spawnOverTime: 1,
  speed: 0.4,
  speedVariance: 0.4,
  scaleStart: 0.2,
  scaleEnd: 0.12,
  scaleVariance: 0.3,
  orbit: 0,
  loop: false,
  easingFnc: Easing.linear,
}

const EMITTER_OPTIONS_TINY: EmitterOptions = {
  gradientIndex: 0,
  originOffset: 0,
  lifetime: 300,
  burst: 1,
  spawnOverTime: 0,
  speed: 0.1,
  speedVariance: 0.5,
  scaleStart: 0.2,
  scaleEnd: 0.1,
  scaleVariance: 0.05,
  orbit: 0,
  loop: false,
  easingFnc: Easing.outQuad,
}

export class GateUnlockParticleSystem2 {
  private p5: P5;
  private emitters: Emitters;
  private gradients: Gradients;

  private optNeutralLight: EmitterOptions = {
    ...EMITTER_OPTIONS_TINY,
  }
  private optNeutralDark: EmitterOptions = {
    ...EMITTER_OPTIONS_BASE,
  }
  private optYellow: EmitterOptions = {
    ...EMITTER_OPTIONS_BASE,
  }
  private optRed: EmitterOptions = {
    ...EMITTER_OPTIONS_BASE,
  }
  private optBlue: EmitterOptions = {
    ...EMITTER_OPTIONS_BASE,
  }
  private optYellow2: EmitterOptions = {
    ...EMITTER_OPTIONS_ALT,
  }
  private optRed2: EmitterOptions = {
    ...EMITTER_OPTIONS_ALT,
  }
  private optBlue2: EmitterOptions = {
    ...EMITTER_OPTIONS_ALT,
  }

  constructor(p5: P5, emitters: Emitters, gradients: Gradients) {
    this.p5 = p5;
    this.emitters = emitters;
    this.gradients = gradients;
    const colorNeutralLight = this.p5.color('#eee');
    const colorNeutralDark = this.p5.color('#444');
    const colorYellow = this.p5.color('#e6cc8a');
    const colorRed = this.p5.color('#ff8766');
    const colorBlue = this.p5.color('#6cabbf');
    const colorEnd = this.p5.color('#000');
    this.optNeutralLight.gradientIndex = this.gradients.add(colorNeutralLight, colorEnd, 10);
    this.optNeutralDark.gradientIndex = this.gradients.add(colorNeutralDark, colorEnd, 10);
    this.optYellow.gradientIndex = this.optYellow2.gradientIndex = this.gradients.add(colorYellow, colorEnd, 20);
    this.optRed.gradientIndex = this.optRed2.gradientIndex = this.gradients.add(colorRed, colorEnd, 20);
    this.optBlue.gradientIndex = this.optBlue2.gradientIndex = this.gradients.add(colorBlue, colorEnd, 20);
  }

  emit = (x: number, y: number, channel: KeyChannel) => {
    this.emitters.add(x, y, this.optNeutralDark);
    this.emitters.add(x, y, this.optNeutralLight);
    if (channel === KeyChannel.Yellow) {
      this.emitters.add(x, y, this.optYellow);
      this.emitters.add(x, y, this.optYellow2);
    } else if (channel === KeyChannel.Red) {
      this.emitters.add(x, y, this.optRed);
      this.emitters.add(x, y, this.optRed2);
    } else if (channel = KeyChannel.Blue) {
      this.emitters.add(x, y, this.optBlue);
      this.emitters.add(x, y, this.optBlue2);
    }
  }
}
