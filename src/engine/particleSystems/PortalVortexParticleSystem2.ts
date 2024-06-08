import P5 from 'p5';

import { PortalChannel, EmitterOptions } from '../../types';
import { Emitters } from "../../collections/emitters";
import { Gradients } from '../../collections/gradients';
import { Easing } from '../../easing';

const DEFAULT_EMITTER_OPTIONS: EmitterOptions = {
  gradientIndex: -1,
  originOffset: 1,
  lifetime: 500,
  burst: 5,
  spawnOverTime: 5,
  speed: -1,
  speedVariance: .01,
  scaleStart: .1,
  scaleEnd: .2,
  scaleVariance: .02,
  orbit: 0,
  loop: true,
  easingFnc: Easing.linear,
}

export class PortalVortexParticleSystem2 {
  private p5: P5;
  private emitters: Emitters;
  private gradients: Gradients;
  private options1: EmitterOptions;
  private options2: EmitterOptions;

  constructor(p5: P5, emitters: Emitters, gradients: Gradients) {
    this.p5 = p5;
    this.emitters = emitters;
    this.gradients = gradients;
    const gradientIndex1 = this.gradients.add(this.p5.color("#000"), this.p5.color("#000"), 10);
    const gradientIndex2 = this.gradients.add(this.p5.color("#fff"), this.p5.color("#000"), 10);
    this.options1 = {
      ...DEFAULT_EMITTER_OPTIONS,
      gradientIndex: gradientIndex1,
    };
    this.options2 = {
      ...DEFAULT_EMITTER_OPTIONS,
      gradientIndex: gradientIndex2,
    };
  }

  public reset = () => {
    this.emitters.reset();
  }

  public emit = (x: number, y: number, portalChannel: PortalChannel) => {
    this.emitters.add(x, y, this.options1);
    this.emitters.add(x, y, this.options2);
  }
}
