import P5 from 'p5';

import { PortalChannel, EmitterOptions } from '../../types';
import { Emitters } from "../../collections/emitters";
import { Gradients } from '../../collections/gradients';
import { Easing } from '../../easing';
import { IS_DEV, PORTAL_CHANNEL_COLORS, SNAKE_REWIND_COLORS } from '../../constants';

const DEFAULT_EMITTER_OPTIONS: EmitterOptions = {
  gradientIndex: 0,
  originOffset: 15,
  lifetime: 1750,
  burst: 0,
  spawnOverTime: 50,
  spawnDelay: 1750,
  speed: -0.1,
  speedVariance: 0.1,
  scaleStart: 0.15,
  scaleEnd: 0.08,
  scaleVariance: 0.04,
  orbit: 0,
  loop: true,
  randomizeSpawnPos: true,
  easingFnc: Easing.inOutQuad,
}

export class AcquirePickupParticleSystem {
  private p5: P5;
  private emitters: Emitters;
  private gradients: Gradients;
  private options1: EmitterOptions;
  private options2: EmitterOptions;
  private options3: EmitterOptions;

  constructor(p5: P5, emitters: Emitters, gradients: Gradients) {
    this.p5 = p5;
    this.emitters = emitters;
    this.gradients = gradients;
    const gradientIndex1 = this.gradients.add(this.p5.color(SNAKE_REWIND_COLORS[0]), this.p5.color("#000"), 10);
    const gradientIndex2 = this.gradients.add(this.p5.color(SNAKE_REWIND_COLORS[1]), this.p5.color("#000"), 10);
    const gradientIndex3 = this.gradients.add(this.p5.color(SNAKE_REWIND_COLORS[2]), this.p5.color("#000"), 10);
    this.options1 = {
      ...DEFAULT_EMITTER_OPTIONS,
      gradientIndex: gradientIndex1,
    };
    this.options2 = {
      ...DEFAULT_EMITTER_OPTIONS,
      gradientIndex: gradientIndex2,
    };
    this.options3 = {
      ...DEFAULT_EMITTER_OPTIONS,
      gradientIndex: gradientIndex3,
    };
  }

  public reset = () => {
    this.emitters.reset();
  }

  public emit = (x: number, y: number) => {
    if (!this.options1) {
      if (IS_DEV) throw new Error(`options1 was nil`);
      return;
    }
    if (!this.options2) {
      if (IS_DEV) throw new Error(`options2 was nil`);
      return;
    }
    if (!this.options3) {
      if (IS_DEV) throw new Error(`options3 was nil`);
      return;
    }
    this.emitters.add(x, y, this.options1);
    this.emitters.add(x, y, this.options2);
    this.emitters.add(x, y, this.options3);
  }
}
