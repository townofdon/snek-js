import P5 from "p5";
import { FontsInstance, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { Easing } from "../easing";
import { PALETTE } from "../palettes";
import Color from "color";

interface TriggerLevelExitParams {
  score: number,
  levelClearBonus: number,
  livesLeftBonus: number,
  livesLeft: number,
  perfectBonus: number,
  isPerfect: boolean,
  onApplyScore: () => void,
}

export class WinLevelScene extends BaseScene {
  _sfx: SFXInstance;

  constructor(p5: P5, sfx: SFXInstance, fonts: FontsInstance, callbacks: SceneCallbacks = {}) {
    super(p5, fonts, callbacks)
    this._sfx = sfx;
  }

  stageClearY = 0.5;
  bgOpacity = 0;

  score = 0;
  levelClearBonus = 0;
  livesLeftBonus = 0;
  livesLeft = 0;
  perfectBonus = 0;
  isPerfect = false;
  beforeGotoNextLevel = () => { };

  isTriggered = false;

  triggerLevelExit({ score, levelClearBonus, livesLeftBonus, livesLeft, perfectBonus, isPerfect, onApplyScore }: TriggerLevelExitParams) {
    if (this.isTriggered) return;
    this.isTriggered = true;
    this.score = score;
    this.levelClearBonus = levelClearBonus;
    this.livesLeftBonus = livesLeftBonus;
    this.livesLeft = livesLeft;
    this.perfectBonus = perfectBonus;
    this.isPerfect = isPerfect;
    this.beforeGotoNextLevel = onApplyScore
    this.startActionsNoBind();
  }

  reset = () => {
    this.stopAllCoroutines();
    this.isTriggered = false;
    this.stageClearY = 0.5;
    this.bgOpacity = 0;
  }

  *action() {
    const { p5, coroutines } = this.props;
    const sfx = this._sfx;

    yield* coroutines.waitForTime(600, (t) => {
      this.bgOpacity = t;
      this.stageClearY = p5.lerp(0.5, 0.2, Easing.inOutCubic(t));
      this.drawScore(this.score);
    });

    this.stageClearY = 0.2;
    this.bgOpacity = 1;

    yield* coroutines.waitForTime(60, () => {
      this.drawScore(this.score);
    });

    // level clear bonus
    sfx.play(Sound.xplode);
    yield* coroutines.waitForTime(700, () => {
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawScore(this.score);
    });

    // lives left bonus
    sfx.play(Sound.xplode);
    yield* coroutines.waitForTime(700, () => {
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
      this.drawScore(this.score);
    });

    // perfect bonus
    if (this.isPerfect) {
      sfx.play(Sound.xplodeLong);
      yield* coroutines.waitForTime(700, (t) => {
        // flash
        const freq = 0.2;
        const shouldShow = t % freq < freq * 0.5;
        if (shouldShow) this.drawPerfectBonus(this.perfectBonus, this.isPerfect);
        this.drawLevelClearBonus(this.levelClearBonus);
        this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
        this.drawScore(this.score);
      });
    }

    // pause before increment
    yield* coroutines.waitForTime(200, () => {
      this.drawPerfectBonus(this.perfectBonus, this.isPerfect);
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
      this.drawScore(this.score);
    });

    const perfectBonusCalc = this.isPerfect ? this.perfectBonus : 0;
    const finalScore = this.score + this.levelClearBonus + this.livesLeftBonus * this.livesLeft + perfectBonusCalc;

    // increment score
    const playingChipSound = this.startCoroutine(this.playChipSound());
    yield* coroutines.waitForTime(1000, (t) => {
      this.drawPerfectBonus(this.perfectBonus * (1 - t), this.isPerfect);
      this.drawLevelClearBonus(this.levelClearBonus * (1 - t));
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft * (1 - t));
      this.drawScore(p5.lerp(this.score, finalScore, t));
    });
    this.stopCoroutine(playingChipSound);
    sfx.stop(Sound.uiChipLoop);
    sfx.play(Sound.uiChip, 0.75);

    yield* coroutines.waitForTime(1000, () => {
      this.drawPerfectBonus(0, this.isPerfect);
      this.drawLevelClearBonus(0);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, 0);
      this.drawScore(finalScore);
    });

    this.beforeGotoNextLevel();
    this.cleanup();
    this.isTriggered = false;
  }

  *playChipSound() {
    const { coroutines } = this.props;
    const sfx = this._sfx;
    while (true) {
      sfx.play(Sound.uiChipLoop, 0.75);
      yield* coroutines.waitForTime(8);
      sfx.stop(Sound.uiChipLoop);
    }
  }

  keyPressed = () => { };

  draw = () => {
    const { p5, fonts } = this.props;

    this.drawBackground(p5.lerpColor(p5.color("#00000000"), p5.color("#00000066"), this.bgOpacity).toString());
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.noStroke();
    p5.textSize(32.5);
    p5.fill('#000');
    p5.text('STAGE CLEAR!', ...this.getPosition(0.5, this.stageClearY + 0.01));
    p5.textSize(32);
    p5.fill('#fff');
    p5.text('STAGE CLEAR!', ...this.getPosition(0.5, this.stageClearY + 0.0));

    this.tick();
  };

  statOffsetY = -0.025;
  accentColor = "#FFDD99";
  accentColorBg = Color("#FFB41F").darken(0.4).hex();

  drawPerfectBonus = (bonus: number, hasBonus: boolean) => {
    if (!hasBonus) return;
    const { p5, fonts } = this.props;
    // const accentColor = "#15C2CB";
    // const accentColorBg = Color("#119DA4").darken(0.4).hex();
    const accentColor = this.accentColor;
    const accentColorBg = this.accentColorBg;
    p5.textFont(fonts.variants.miniMood);
    p5.fill(accentColor);
    p5.stroke(accentColorBg)
    p5.strokeWeight(2);
    p5.textSize(16);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.text('PERFECT!', ...this.getPosition(0.5, 0.6 + this.statOffsetY));
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.5, 0.65 + this.statOffsetY));
  }

  drawLevelClearBonus = (bonus: number) => {
    const { p5, fonts } = this.props;
    p5.textFont(fonts.variants.miniMood);
    p5.fill('#fff');
    p5.stroke("#000")
    p5.strokeWeight(2);
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('Level Clear Bonus', ...this.getPosition(0.15, 0.4 + this.statOffsetY));
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.15, 0.45 + this.statOffsetY));
  }

  drawLivesLeftBonus = (bonus: number, lives: number, calcBonus: number) => {
    const { p5, fonts } = this.props;
    p5.textFont(fonts.variants.miniMood);
    p5.stroke("#000")
    p5.strokeWeight(2);
    p5.noStroke();
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('Lives Bonus', ...this.getPosition(0.6, 0.4 + this.statOffsetY));
    p5.text(`${lives} x ${bonus.toFixed(0)}`, ...this.getPosition(0.6, 0.45 + this.statOffsetY));
    p5.text(calcBonus.toFixed(0).padStart(5, '0'), ...this.getPosition(0.6, 0.5 + this.statOffsetY));
  }

  drawScore = (score: number) => {
    const { p5, fonts } = this.props;
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.stroke("#000")
    p5.strokeWeight(2);
    p5.textSize(24.5);
    p5.fill('#000');
    p5.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.61));
    p5.textSize(24);
    p5.fill('#fff');
    p5.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.6));
  }
}
