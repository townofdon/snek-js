import P5 from "p5";
import { FontsInstance, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";

export class TitleScene extends BaseScene {
  private title: string = 'UNTITLED';
  private annotation: string = '';
  private sfx: SFXInstance;

  constructor(title: string, annotation: string, p5: P5, gfx: P5.Graphics, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, gfx, fonts, callbacks)
    this.title = title;
    this.annotation = annotation || '';
    this.sfx = sfx;
    this.bindActions();
  }

  *action() {
    const { coroutines } = this.props;
    this.sfx.play(Sound.unlock);
    yield* coroutines.waitForTime(1500);
    this.cleanup();
  }

  keyPressed = () => { };

  draw = () => {
    const { p5, fonts } = this.props;
    this.drawBackground();

    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(2 * 14);
    p5.textAlign(p5.CENTER, p5.TOP);

    p5.text('now entering', ...this.getPosition(0.5, 0.4));
    p5.textSize(2 * 32);
    p5.fill('#fff');
    p5.text(this.title, ...this.getPosition(0.5, 0.5));

    if (this.annotation) {
      p5.textSize(2 * 12);
      p5.fill('#fff');
      p5.text(`${this.annotation}`, ...this.getPosition(0.5, 0.575));
    }

    this.tick();
  };
}
