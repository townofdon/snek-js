import { BaseScene } from "@/scenes/BaseScene";
import { BossStartArgs, SFXInstance } from "@/types";

export abstract class BaseBossScene extends BaseScene {
  protected sfx: SFXInstance;
  constructor(...args: BossStartArgs) {
    const [p5, gfx, sfx, fonts, callbacks] = args;
    super(p5, gfx, fonts, callbacks);
    this.sfx = sfx;
  }
}
