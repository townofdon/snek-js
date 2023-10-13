import P5 from "p5"
import { FontVariants } from "./types";

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
export class Fonts {
  private _p5: P5;

  variants: FontVariants = {
    miniMood: null,
  }

  constructor(p5: P5) {
    this._p5 = p5;
  }

  load() {
    const p5 = this._p5;
    this.variants.miniMood = p5.loadFont('/src/assets/MiniMOOD.ttf');
  }
}
