// https://easings.net

export class Easing {
  static linear(x: number): number {
    return x;
  }

  static inQuad(x: number): number {
    return x * x;
  }


  static outQuad(x: number): number {
    return 1 - (1 - x) * (1 - x);
  }

  static inOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  }

  static inCubic(x: number): number {
    return x * x * x;
  }

  static outCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }

  static inOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }
}
