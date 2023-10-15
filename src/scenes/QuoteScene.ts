import P5 from "p5";
import { FontsInstance, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";

export class QuoteScene extends BaseScene {
  _quotes: string[];
  _sfx: SFXInstance;

  constructor(quote: (string | string[]), p5: P5, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, fonts, callbacks)
    this._sfx = sfx;
    if (Array.isArray(quote)) {
      this._quotes = quote;
    } else {
      this._quotes = [quote]
    }
    this.bindActions();
  }

  *action() {
    const { coroutines } = this.props;
    const sfx = this._sfx;
    for (let i = 0; i < this._quotes.length; i++) {
      const quote = this._quotes[i];
      const numLetters = quote.length;
      for (let j = 1; j <= numLetters; j++) {
        yield* coroutines.waitForTime(15, () => {
          this.drawPartialQuote(quote, j);
          if (j < numLetters) {
            sfx.play(Sound.uiChip);
          }
        })
      }
      yield* coroutines.waitForAnyKey(() => {
        this.drawPartialQuote(quote, numLetters);
        this.drawPressAnyKey();
      })
    }

    this.cleanup();
  }

  keyPressed = () => { };

  drawPartialQuote = (quote: string, numLetters = 1000) => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(quote.substring(0, numLetters), ...this.getRect(0.5, 0.575, 250, 250));
  }

  drawPressAnyKey = () => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill('#fff');
    p5.text('[PRESS ANY KEY]', ...this.getPosition(0.5, 0.8));
  }

  draw = () => {
    this.drawBackground();
    this.tick();
  };
}
