import P5 from "p5";
import { FontsInstance, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";

export class TitleScene extends BaseScene {
  private _title: string = 'UNTITLED'
  private _sfx: SFXInstance;

  constructor(title: string, p5: P5, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, fonts, callbacks)
    this._title = title;
    this._sfx = sfx;
    this.bindActions();
  }

  *action() {
    const { coroutines } = this.props;
    this._sfx.play(Sound.unlock);
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
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);

    p5.text('now entering', ...this.getPosition(0.5, 0.4));
    p5.textSize(32);
    p5.fill('#fff');
    p5.text(this._title, ...this.getPosition(0.5, 0.5));

    this.tick();
  };
}
