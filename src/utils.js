
export function clamp(val, minVal, maxVal) {
  const clamped = Math.max(Math.min(val, maxVal), minVal);
  return isNaN(clamped) ? minVal : clamped;
}

export function vecToString(vec) {
  return vec ? `(${vec.x}, ${vec.y})` : 'Nil';
}
