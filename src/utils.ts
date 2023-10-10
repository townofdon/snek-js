import { Vector } from "p5";

export function clamp(val: number, minVal: number, maxVal: number) {
  const clamped = Math.max(Math.min(val, maxVal), minVal);
  return isNaN(clamped) ? minVal : clamped;
}

export function vecToString(vec: Vector) {
  return vec ? `(${vec.x}, ${vec.y})` : 'Nil';
}
