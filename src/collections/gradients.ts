import P5 from "p5";

import { clamp } from "../utils";

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
