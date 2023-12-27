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
    casual: null,
  }

  constructor(p5: P5) {
    this._p5 = p5;
  }

  load() {
    try {
      const p5 = this._p5;
      const relativeDir = process.env.NODE_ENV === 'production' ? '' : window.location.pathname;
      const loadFont = (fontFile: string) => p5.loadFont(`${relativeDir}assets/fonts/${fontFile}`);
      this.variants.miniMood = loadFont('MiniMOOD.ttf');
      this.variants.zicons = loadFont('Zicons.ttf')

      // TODO: CHOOSE WISELY
      // this.variants.casual = loadFont('casual/AtariGames.ttf');
      // this.variants.casual = loadFont('casual/Awexbmp.ttf');
      // this.variants.casual = loadFont('casual/Bitfantasy.ttf');
      this.variants.casual = loadFont('casual/LowIndustrial.ttf');
    } catch (err) {
      console.error(err);
    }
  }
}
