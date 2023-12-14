import P5 from "p5";
import { FontsInstance, Quote, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";

const AUTHOR_PADDING = 15;

export class QuoteScene extends BaseScene {
  _quotes: string[];
  _author: string;
  _sfx: SFXInstance;

  constructor(quote: Quote, p5: P5, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, fonts, callbacks)
    this._sfx = sfx;
    this._quotes = quote.message;
    this._author = quote.author || 'Unknown';
    this.bindActions();
  }

  *action() {
    const { coroutines, fonts } = this.props;
    for (let i = 0; i < this._quotes.length; i++) {
      const isLastQuote = i === this._quotes.length - 1;

      // play sound as parallel coroutine to *action()
      const playingSound = this.startCoroutine(this.playSound());
      const quote = this._quotes[i];
      const numLetters = quote.length;
      for (let j = 1; j <= numLetters; j++) {
        yield* coroutines.waitForTime(15, () => {
          this.drawPartialQuote(quote, j);
        })
      }
      this.stopCoroutine(playingSound);

      const paragraphHeight = this._estimateParagraphHeight(quote, 250, fonts.variants.miniMood, 14);

      yield* coroutines.waitForAnyKey(() => {
        if (isLastQuote) {
          this.drawAuthor(paragraphHeight);
        }
        this.drawPartialQuote(quote, numLetters);
        this.drawPressAnyKey();
      })
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
    const { keyCode, ESCAPE } = this.props.p5;
    const { onEscapePress } = this.props.callbacks;
    if (keyCode === ESCAPE) {
      if (onEscapePress) {
        this.stopAllCoroutines();
        onEscapePress();
        this.cleanup();
      }
    }
  };

  drawPartialQuote = (quote: string, numLetters = 1000) => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(quote.substring(0, numLetters), ...this._getQuoteRect());
  }

  drawAuthor = (paragraphHeight: number) => {
    const { p5, fonts } = this.props;
    const [x, y, width, height] = this._getQuoteRect();
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(12);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text('- ' + this._author, x, y + paragraphHeight + AUTHOR_PADDING, width, height);
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

  private _getQuoteRect = () => {
    return this.getRect(0.5, 0.575, 250, 250);
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

  private _estimateNumLines = (paragraph: string, rectWidth: number, font: P5.Font, textSize: number) => {
    const { p5 } = this.props;
    p5.textFont(font);
    p5.textSize(textSize);

    paragraph = paragraph.trim();
    let cursorStart = 0;
    let cursorLastSpaceFound = 0;
    let cursorEnd = 1;
    let numLines = 1;

    while (cursorEnd <= paragraph.length) {
      const currentChar = paragraph.substring(cursorEnd - 1, cursorEnd);
      if (currentChar === ' ' || currentChar === '\n' || cursorEnd === paragraph.length) {
        const testString = paragraph.substring(cursorStart, cursorEnd);
        const exceedsBounds = p5.textWidth(testString) > rectWidth;
        if (exceedsBounds) {
          cursorStart = cursorLastSpaceFound + 1;
          numLines++;
        }
        if (currentChar === '\n') {
          cursorStart = cursorEnd;
          numLines++;
        }
        cursorLastSpaceFound = cursorEnd - 1;
      }
      cursorEnd++;
    }

    return numLines;
  }

  private _estimateParagraphHeight = (paragraph: string, rectWidth: number, font: P5.Font, textSize: number) => {
    const { p5 } = this.props;
    const numLines = this._estimateNumLines(paragraph, rectWidth, font, textSize);
    return p5.textLeading() * numLines;
  }
}
