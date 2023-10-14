import { Vector } from "p5";
import { GRIDCOUNT } from "./constants";

export function clamp(val: number, minVal: number, maxVal: number) {
  const clamped = Math.max(Math.min(val, maxVal), minVal);
  return isNaN(clamped) ? minVal : clamped;
}

export function getCoordIndex(vec: Vector): number {
  return clamp(vec.x, 0, GRIDCOUNT.x - 1) + clamp(vec.y, 0, GRIDCOUNT.y - 1) * GRIDCOUNT.x
}

export function vecToString(vec: Vector) {
  return vec ? `(${vec.x}, ${vec.y})` : 'Nil';
}
