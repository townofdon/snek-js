import P5 from "p5"
import { FontsInstance, FontVariants } from "./types";

/**
 * Usage
 * 
 * ```
 * const fonts = new Fonts(p5);
 * 
 * function preLoad() {
 *   fonts.load();
 * }
 * 
 * function draw() {
 *   textFont(fonts.variants.miniMood);
 * }
 * ```
 */
export class Fonts implements FontsInstance {
  private _p5: P5;

  variants: FontVariants = {
    miniMood: null,
    zicons: null,
  }

  constructor(p5: P5) {
    this._p5 = p5;
  }

  load() {
    const p5 = this._p5;
    const loadFont = (fontFile: string) => p5.loadFont(`${window.location.pathname}src/assets/fonts/${fontFile}`);
    this.variants.miniMood = loadFont('MiniMOOD.ttf');
    this.variants.zicons = loadFont('Zicons.ttf')
  }
}
