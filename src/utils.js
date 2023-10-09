
// eslint-disable-next-line no-unused-vars
class Utils {
  static clamp(val, minVal, maxVal) {
    const clamped = max(min(val, maxVal), minVal);
    return isNaN(clamped) ? minVal : clamped;
  }
}
