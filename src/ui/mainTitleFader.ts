import P5 from 'p5';

import { IEnumerator, TitleVariant } from '../types';

const TITLE_VARIANT_TRANSITION_TIME_MS = 2000;

export class MainTitleFader {
  private prevTitleVariant: TitleVariant = TitleVariant.GrayBlue;
  private p5: P5;

  constructor(p5: P5) {
    this.p5 = p5;
  }

  setTitleVariant(variant: TitleVariant): IEnumerator {
    const prevVariant = this.prevTitleVariant;
    if (variant === prevVariant) return;

    this.prevTitleVariant = variant;
    return MainTitleFader.fadeTitleVariant(variant, prevVariant, this.p5);
  }

  private static fadeTitleVariant = function* (variant: TitleVariant, prevVariant: TitleVariant, p5: P5): IEnumerator {
    if (variant === prevVariant) return;

    const incoming = document.getElementById(MainTitleFader.getIdByTitleVariant(variant));
    const outgoing = document.getElementById(MainTitleFader.getIdByTitleVariant(prevVariant));
    if (!incoming) throw new Error(`Could not find elem for variant=${incoming},id=${MainTitleFader.getIdByTitleVariant(variant)}`)
    if (!outgoing) throw new Error(`Could not find elem for variant=${outgoing},id=${MainTitleFader.getIdByTitleVariant(prevVariant)}`)
    let t = 0;
    while (t < 1) {
      yield null;
      incoming.style.opacity = String(p5.lerp(0, 1, t));
      outgoing.style.opacity = String(p5.lerp(1, 0, t));
      t += p5.deltaTime / TITLE_VARIANT_TRANSITION_TIME_MS;
    }
  }

  private static getIdByTitleVariant(variant: TitleVariant) {
    switch (variant) {
      case TitleVariant.GrayBlue:
        return 'main-title-variant-grayblue';
      case TitleVariant.Gray:
        return 'main-title-variant-gray';
      case TitleVariant.Green:
        return 'main-title-variant-green';
      case TitleVariant.Red:
        return 'main-title-variant-red'
      case TitleVariant.Sand:
        return 'main-title-variant-sand'
      case TitleVariant.Yellow:
        return 'main-title-variant-yellow'
    }
  }
}
