import P5 from "p5";
import { FontsInstance, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";

export class LoadingScene extends BaseScene {
  private gfx: P5.Graphics;
  constructor(p5: P5, gfx: P5.Graphics, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, gfx, fonts, callbacks)
    this.gfx = gfx;
  }

  *action() {
    this.cleanup();
  }

  keyPressed = () => { };

  draw = () => {
    const { p5, fonts } = this.props;
    this.drawBackground('#000', this.gfx);
    this.gfx.fill('#fff');
    this.gfx.noStroke();
    this.gfx.textFont(fonts.variants.miniMood);
    this.gfx.textSize(2 * 14);
    this.gfx.textAlign(p5.CENTER, p5.TOP);
    this.gfx.text('loading...', ...this.getPosition(0.5, 0.4));

    this.tick();
  };
}
