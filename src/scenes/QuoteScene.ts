import P5 from "p5";
import { FontsInstance, Quote, ISFX, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { getGamepad, tickGamepad, wasPressedThisFrame } from "../engine/gamepad";
import { Button } from "../engine/gamepad/StandardGamepadMapping";
import { drawPressAnyKey, startSceneDialogText, StartSceneDialogTextArgs } from "./sceneUtils";

// const AUTHOR_PADDING = 15;
const TSMOD = 2 * 0.8;

export class QuoteScene extends BaseScene {
  _quotes: string[];
  _author: string;
  _sfx: ISFX;

  constructor(quote: Quote, p5: P5, gfx: P5.Graphics, sfx: ISFX, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, gfx, fonts, callbacks)
    this._sfx = sfx;
    this._quotes = quote.message;
    this._author = quote.author || 'Unknown';
    this.bindActions();
  }

  *action() {
    // const { p5, coroutines, fonts } = this.props;
    for (let i = 0; i < this._quotes.length; i++) {
      const isLastQuote = i === this._quotes.length - 1;
      const quote = this._quotes[i];

      yield* startSceneDialogText({
        p5: this.props.p5,
        gfx: this.props.p5,
        sfx: this._sfx,
        coroutines: this.props.coroutines,
        fonts: this.props.fonts,
        text: quote,
        authorText: isLastQuote ? this._author : '',
        rect: this._getQuoteRect(),
        drawPressAnyKey: this.drawPressAnyKey,
      } satisfies StartSceneDialogTextArgs);
    }

    this.cleanup();
  }

  *playSound() {
    const { coroutines } = this.props;
    const sfx = this._sfx;
    while (true) {
      sfx.play(Sound.uiBlip);
      yield* coroutines.waitForTime(40);
    }
  }

  keyPressed = () => {
    const { keyCode, ESCAPE, BACKSPACE, DELETE } = this.props.p5;
    if (keyCode === ESCAPE || keyCode === BACKSPACE || keyCode === DELETE) {
      this.exitQuoteScene()
    }
  };

  private exitQuoteScene = () => {
    const { onEscapePress } = this.props.callbacks;
    if (onEscapePress) {
      this.stopAllCoroutines();
      onEscapePress();
      this.cleanup();
    }
  }

  // private drawPartialQuote = (quote: string, numLetters = 1000) => {
  //   const { p5, fonts } = this.props;
  //   p5.fill('#fff');
  //   p5.noStroke();
  //   p5.textFont(fonts.variants.miniMood);
  //   p5.textSize(TSMOD * 14);
  //   p5.textAlign(p5.LEFT, p5.TOP);
  //   p5.text(quote.substring(0, numLetters), ...this._getQuoteRect());
  // }

  // private drawAuthor = (paragraphHeight: number) => {
  //   const { p5, fonts } = this.props;
  //   const [x, y, width, height] = this._getQuoteRect();
  //   p5.fill('#fff');
  //   p5.noStroke();
  //   p5.textFont(fonts.variants.miniMood);
  //   p5.textSize(TSMOD * 12);
  //   p5.textAlign(p5.RIGHT, p5.TOP);
  //   p5.text('- ' + this._author, x, y + paragraphHeight + AUTHOR_PADDING, width, height);
  // }

  private drawPressAnyKey = () => {
    const { p5, fonts } = this.props;
    drawPressAnyKey(p5, fonts, 0.5, 0.8);
    // p5.fill('#fff');
    // p5.noStroke();
    // p5.textFont(fonts.variants.miniMood);
    // p5.textSize(TSMOD * 14);
    // p5.textAlign(p5.CENTER, p5.TOP);
    // p5.fill('#fff');
    // p5.text('[PRESS ANY KEY]', ...this.getPosition(0.5, 0.8));
  }

  draw = () => {
    this.drawBackground();
    if (this.props.callbacks.onEscapePress && wasPressedThisFrame(getGamepad(), Button.East)) {
      this.exitQuoteScene();
      return;
    }
    this.tick();
    if (this.props.callbacks.onEscapePress) {
      this.drawSceneTitle();
      this.drawExit();
    }
    tickGamepad();
  };

  private _getQuoteRect = () => {
    // return this.getRect(0.5, 0.575, 250, 250);
    return this.getRect(0.5, 0.575, 2 * 250, 2 * 250);
  }

  private _debugDraw = (paragraphHeight: number) => {
    const { p5 } = this.props;
    const [x, _y, width, height] = this._getQuoteRect();
    const y = _y + paragraphHeight;
    p5.fill("#ff440077");
    p5.noStroke();
    p5.quad(
      x, y,
      x + width, y,
      x + width, y + height,
      x, y + height
    );
  }

  private drawSceneTitle = () => {
    const { p5, fonts } = this.props;
    p5.fill('#777');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(TSMOD * 12);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text('[QUOTE MODE]', ...this.getPosition(0.98, 0.02));
  }

  private drawExit = () => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(TSMOD * 12);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('[DEL] EXIT', ...this.getPosition(0.02, 0.02));
  }

  // private _estimateParagraphHeight = (paragraph: string, rectWidth: number, font: P5.Font, textSize: number) => {
  //   return estimateParagraphHeight(this.props.p5, paragraph, rectWidth, font, textSize);
  //   // const { p5 } = this.props;
  //   // const numLines = this._estimateNumLines(paragraph, rectWidth, font, textSize);
  //   // return p5.textLeading() * numLines;
  // }
}
