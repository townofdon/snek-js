import P5 from "p5";

import { clamp, inverseLerp, remap } from "../utils";

export const INITIAL_POOL_SIZE = 20;

export class Gradients {
  private p5: P5;
  private gradients: P5.Color[][];
  private defaultColor: P5.Color;

  constructor(p5: P5) {
    this.p5 = p5;
    this.gradients = [];
    this.defaultColor = p5.color(255, 192, 203); // pink
  }

  public getLength = (): number => this.gradients.length;

  public get length() {
    return this.gradients.length;
  }

  public add = (color1: P5.Color, color2: P5.Color, steps: number = 10): number => {
    const gradient: P5.Color[] = []
    for (let i = 0; i < steps; i++) {
      gradient.push(this.p5.lerpColor(color1, color2, clamp(i / (steps - 1), 0, 1)));
    }
    this.gradients.push(gradient);
    return this.gradients.length - 1;
  }

  public addMultiple = (colors: P5.Color[], steps: number = 10): number => {
    if (colors.length < 2) throw new Error(`Gradients.addMultiple requires at least 2 colors. Received: ${colors.length}`);
    const gradient: P5.Color[] = []
    for (let i = 0; i < steps; i++) {
      const i0 = Math.floor(remap(0, steps - 1, 0, colors.length - 1, i));
      const i1 = Math.min(i0 + 1, colors.length - 1);
      const start = i0 / colors.length * steps;
      const end = i1 / colors.length * steps;
      const t = inverseLerp(start, end, i, true);
      const color = this.p5.lerpColor(colors[i0], colors[i1], t);
      gradient.push(color);
    }
    this.gradients.push(gradient);
    return this.gradients.length - 1;
  }

  // DO NOT REMOVE GRADIENTS AS IT WILL MESS UP THE GRADIENT INDICES
  // public remove = (index: number): void => {
  //   if (index < 0) return;
  //   if (index >= this.gradients.length) return;
  //   this.gradients.splice(index, 1);
  // }

  public get = (index: number): (P5.Color[] | undefined) => {
    if (index < 0) return undefined;
    if (index >= this.gradients.length) return undefined;
    return this.gradients[Math.floor(index)] || undefined;
  }

  public set = (index: number, gradient: P5.Color[]) => {
    if (index < 0) return;
    if (index >= this.gradients.length) return;
    const found = this.gradients[index];
    if (!found) return;
    this.gradients[index] = gradient;
  }

  public calc = (index: number, value: number): P5.Color => {
    const gradient = this.get(index);
    if (!gradient) return this.defaultColor;
    const i = clamp(Math.floor(gradient.length * value), 0, gradient.length - 1);
    return gradient[i] || this.defaultColor;
  }
}
