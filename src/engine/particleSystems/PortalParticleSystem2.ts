import P5 from 'p5';

import { PortalChannel, EmitterOptions } from '../../types';
import { Emitters } from "../../collections/emitters";
import { Gradients } from '../../collections/gradients';
import { Easing } from '../../easing';
import { IS_DEV, PORTAL_CHANNEL_COLORS } from '../../constants';

const DEFAULT_EMITTER_OPTIONS: EmitterOptions = {
  gradientIndex: 0,
  originOffset: 0.3,
  lifetime: 1750,
  burst: 0,
  spawnOverTime: 1,
  spawnDelay: 1750,
  speed: -0.1,
  speedVariance: 0.1,
  scaleStart: 0.15,
  scaleEnd: 0.08,
  scaleVariance: 0.04,
  orbit: 0.1,
  loop: true,
  easingFnc: Easing.inOutQuad,
}

export class PortalParticleSystem2 {
  private p5: P5;
  private emitters: Emitters;
  private gradients: Gradients;
  private optionsMap1: Record<PortalChannel, EmitterOptions> = {} as Record<PortalChannel, EmitterOptions>;
  private optionsMap2: Record<PortalChannel, EmitterOptions> = {} as Record<PortalChannel, EmitterOptions>;

  constructor(p5: P5, emitters: Emitters, gradients: Gradients) {
    this.p5 = p5;
    this.emitters = emitters;
    this.gradients = gradients;
    for (let channel = 0; channel < 10; channel++) {
      const color = PORTAL_CHANNEL_COLORS[channel as PortalChannel];
      if (!color) continue;
      const gradientIndex1 = this.gradients.add(this.p5.color(color), this.p5.color("#000"), 10);
      const gradientIndex2 = this.gradients.add(this.p5.color("#fff"), this.p5.color("#000"), 10);
      this.optionsMap1[channel as PortalChannel] = {
        ...DEFAULT_EMITTER_OPTIONS,
        gradientIndex: gradientIndex1,
      };
      this.optionsMap2[channel as PortalChannel] = {
        ...DEFAULT_EMITTER_OPTIONS,
        gradientIndex: gradientIndex2,
      };
    }
  }

  public reset = () => {
    this.emitters.reset();
  }

  public emit = (x: number, y: number, portalChannel: PortalChannel) => {
    if (!this.optionsMap1[portalChannel]) {
      if (IS_DEV) throw new Error(`No optionsMap1 for portal channel ${portalChannel}`);
      return;
    }
    if (!this.optionsMap2[portalChannel]) {
      if (IS_DEV) throw new Error(`No optionsMap2 for portal channel ${portalChannel}`);
      return;
    }
    this.emitters.add(x, y, this.optionsMap1[portalChannel]);
    this.emitters.add(x, y, this.optionsMap2[portalChannel]);
  }
}
