import P5, { Color } from "p5";
import { FontsInstance, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { clamp } from "../utils";
import { Easing } from "../easing";

interface TriggerLevelExitParams {
  score: number,
  levelClearBonus: number,
  livesLeftBonus: number,
  livesLeft: number,
  beforeGotoNextLevel: () => void,
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
  beforeGotoNextLevel = () => { };

  isTriggered = false;


  triggerLevelExit({ score, levelClearBonus, livesLeftBonus, livesLeft, beforeGotoNextLevel }: TriggerLevelExitParams) {
    if (this.isTriggered) return;
    this.isTriggered = true;
    this.score = score;
    this.levelClearBonus = levelClearBonus;
    this.livesLeftBonus = livesLeftBonus;
    this.livesLeft = livesLeft;
    this.beforeGotoNextLevel = beforeGotoNextLevel
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
    yield* coroutines.waitForTime(500, (t) => {
      const levelClearBonus = this.levelClearBonus * t;
      this.drawLevelClearBonus(levelClearBonus);
      this.drawScore(this.score);
      sfx.play(Sound.uiChip);
    });

    yield* coroutines.waitForTime(500, () => {
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawScore(this.score);
    });

    // lives left bonus
    yield* coroutines.waitForTime(500, (t) => {
      this.drawLevelClearBonus(this.levelClearBonus);
      const livesLeftBonus = this.livesLeftBonus * t;
      this.drawLivesLeftBonus(livesLeftBonus, this.livesLeft);
      this.drawScore(this.score);
      sfx.play(Sound.uiChip);
    });

    yield* coroutines.waitForTime(500, () => {
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft);
      this.drawScore(this.score);
    });

    const finalScore = this.score + this.levelClearBonus + this.livesLeftBonus * this.livesLeft;

    // increment score
    yield* coroutines.waitForTime(1000, (t) => {
      this.drawLevelClearBonus(this.levelClearBonus * (1 - t));
      this.drawLivesLeftBonus(this.livesLeftBonus * (1 - t), this.livesLeft);
      this.drawScore(p5.lerp(this.score, finalScore, t));
      sfx.play(Sound.uiChip);
    });

    yield* coroutines.waitForTime(700, () => {
      this.drawLevelClearBonus(0);
      this.drawLivesLeftBonus(0, this.livesLeft);
      this.drawScore(finalScore);
    });

    this.beforeGotoNextLevel();
    this.cleanup();
    this.isTriggered = false;
  }

  keyPressed = () => { };

  draw = () => {
    const { p5, fonts } = this.props;

    this.drawBackground(p5.lerpColor(p5.color("#00000000"), p5.color("#00000055"), this.bgOpacity).toString());
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

  statOffsetY = 0.045;

  drawLevelClearBonus = (bonus: number) => {
    const { p5, fonts } = this.props;
    p5.textFont(fonts.variants.miniMood);
    p5.fill('#fff');
    p5.stroke("#000")
    p5.stroke(2);
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('Level Clear Bonus', ...this.getPosition(0.15, 0.4 + this.statOffsetY));
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.15, 0.45 + this.statOffsetY));
  }

  drawLivesLeftBonus = (bonus: number, lives: number = 0) => {
    const { p5, fonts } = this.props;
    p5.textFont(fonts.variants.miniMood);
    p5.stroke("#000")
    p5.stroke(2);
    p5.noStroke();
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('Lives Bonus', ...this.getPosition(0.6, 0.4 + this.statOffsetY));
    p5.text(`${lives} x`, ...this.getPosition(0.6, 0.45 + this.statOffsetY));
    p5.text(bonus.toFixed(0).padStart(5, '0'), ...this.getPosition(0.67, 0.45 + this.statOffsetY));
  }

  drawScore = (score: number) => {
    const { p5, fonts } = this.props;
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.noStroke();
    p5.textSize(24.5);
    p5.fill('#000');
    p5.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.61));
    p5.textSize(24);
    p5.fill('#fff');
    p5.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.6));
  }
}