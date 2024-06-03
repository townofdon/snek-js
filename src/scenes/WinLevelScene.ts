import P5 from "p5";
import { FontsInstance, Image, MusicTrack, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { Easing } from "../easing";
import Color from "color";
import { UnlockedMusicStore } from "../stores/UnlockedMusicStore";
import { OST_MODE_TRACKS } from "../constants";
import { getTrackName } from "../utils";
import { SpriteRenderer } from "../spriteRenderer";

interface TriggerLevelExitParams {
  score: number,
  levelClearBonus: number,
  livesLeftBonus: number,
  livesLeft: number,
  allApplesBonus: number,
  perfectBonus: number,
  isPerfect: boolean,
  hasAllApples: boolean,
  isCasualModeEnabled: boolean,
  levelMusicTrack?: MusicTrack,
  onApplyScore: () => void,
}

export class WinLevelScene extends BaseScene {
  private sfx: SFXInstance;
  private spriteRenderer: SpriteRenderer;
  private titleText: string = 'SNEK CLEAR!';
  private unlockedMusicStore: UnlockedMusicStore;
  private levelMusicTrack: MusicTrack | null = null;

  constructor(p5: P5, gfx: P5.Graphics, sfx: SFXInstance, fonts: FontsInstance, unlockedMusicStore: UnlockedMusicStore, spriteRenderer: SpriteRenderer, callbacks: SceneCallbacks = {}) {
    super(p5, gfx, fonts, callbacks)
    this.sfx = sfx;
    this.spriteRenderer = spriteRenderer;
    this.unlockedMusicStore = unlockedMusicStore;
  }

  private stageClearY = 0.5;
  private bgOpacity = 0;

  private score = 0;
  private levelClearBonus = 0;
  private livesLeftBonus = 0;
  private livesLeft = 0;
  private allApplesBonus = 0;
  private perfectBonus = 0;
  private hasAllApples = false;
  private isPerfect = false;
  private onApplyScore = () => { };

  private isTriggered = false;

  triggerLevelExit({
    score,
    levelClearBonus,
    livesLeftBonus,
    livesLeft,
    allApplesBonus,
    perfectBonus,
    hasAllApples,
    isPerfect,
    isCasualModeEnabled,
    levelMusicTrack,
    onApplyScore,
  }: TriggerLevelExitParams) {
    if (this.isTriggered) return;
    this.isTriggered = true;
    this.score = score;
    this.levelClearBonus = levelClearBonus;
    this.livesLeftBonus = livesLeftBonus;
    this.livesLeft = livesLeft;
    this.allApplesBonus = allApplesBonus;
    this.perfectBonus = perfectBonus;
    this.hasAllApples = hasAllApples;
    this.isPerfect = isPerfect;
    this.levelMusicTrack = levelMusicTrack || null;
    if (isCasualModeEnabled) {
      onApplyScore();
      this.cleanup();
      this.isTriggered = false;
    } else {
      this.onApplyScore = onApplyScore;
      this.startActionsNoBind();
    }
  }

  reset = (titleText: string = 'SNEK CLEAR!') => {
    this.stopAllCoroutines();
    this.isTriggered = false;
    this.stageClearY = 0.5;
    this.bgOpacity = 0;
    this.titleText = titleText;
  }

  *action() {
    const { p5, coroutines } = this.props;
    const sfx = this.sfx;

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
      sfx.play(Sound.xplodeLong, 0.7);
      yield* coroutines.waitForTime(700, (t) => {
        // flash
        const freq = 0.2;
        const shouldShow = t % freq < freq * 0.5;
        if (shouldShow) this.drawPerfectBonus(this.perfectBonus, this.isPerfect);
        this.drawLevelClearBonus(this.levelClearBonus);
        this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
        this.drawScore(this.score);
      });
    } else if (this.hasAllApples) {
      sfx.play(Sound.xpound, 0.6);
      yield* coroutines.waitForTime(500, (t) => {
        this.drawAllApplesBonus(this.allApplesBonus, this.hasAllApples);
        this.drawLevelClearBonus(this.levelClearBonus);
        this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
        this.drawScore(this.score);
      });
    }

    // pause before increment
    yield* coroutines.waitForTime(200, () => {
      if (this.isPerfect) {
        this.drawPerfectBonus(this.perfectBonus, this.isPerfect);
      } else if (this.hasAllApples) {
        this.drawAllApplesBonus(this.allApplesBonus, this.hasAllApples);
      }
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
      this.drawScore(this.score);
    });

    const perfectBonusCalc = this.isPerfect ? this.perfectBonus : 0;
    const allApplesBonusCalc = !this.isPerfect && this.hasAllApples ? this.allApplesBonus : 0;
    const finalScore = this.score + this.levelClearBonus + this.livesLeftBonus * this.livesLeft + perfectBonusCalc + allApplesBonusCalc;

    // increment score
    const playingChipSound = this.startCoroutine(this.playChipSound());
    yield* coroutines.waitForTime(1000, (t) => {
      if (this.isPerfect) {
        this.drawPerfectBonus(this.perfectBonus * (1 - t), this.isPerfect);
      } else if (this.hasAllApples) {
        this.drawAllApplesBonus(this.allApplesBonus * (1 - t), this.hasAllApples);
      }
      this.drawLevelClearBonus(this.levelClearBonus * (1 - t));
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft * (1 - t));
      this.drawScore(p5.lerp(this.score, finalScore, t));
    });
    this.stopCoroutine(playingChipSound);
    sfx.stop(Sound.uiChipLoop);
    sfx.play(Sound.uiChip, 0.75);

    this.onApplyScore();

    yield* coroutines.waitForTime(1000, () => {
      if (this.isPerfect) {
        this.drawPerfectBonus(0, this.isPerfect);
      } else if (this.hasAllApples) {
        this.drawAllApplesBonus(0, this.hasAllApples);
      }
      this.drawLevelClearBonus(0);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, 0);
      this.drawScore(finalScore);
    });

    // unlock music track
    if (this.levelMusicTrack && !this.unlockedMusicStore.getIsUnlocked(this.levelMusicTrack) && OST_MODE_TRACKS.includes(this.levelMusicTrack)) {
      sfx.play(Sound.unlockAbility, 1);
      this.unlockedMusicStore.unlockTrack(this.levelMusicTrack);
      yield* coroutines.waitForTime(3200, (t) => {
        // flash
        const freq = 0.3;
        const shouldShow = t % freq < freq * 0.5;
        if (shouldShow) this.drawMusicTrackUnlocked(this.levelMusicTrack);
      });
    }

    this.cleanup();
    this.isTriggered = false;
  }

  *playChipSound() {
    const { coroutines } = this.props;
    const sfx = this.sfx;
    while (true) {
      sfx.play(Sound.uiChipLoop, 0.75);
      yield* coroutines.waitForTime(8);
      sfx.stop(Sound.uiChipLoop);
    }
  }

  keyPressed = () => { };

  draw = () => {
    const { p5, gfx, fonts } = this.props;
    const title = this.titleText;
    const bgColor = (amount = 1) => {
      return p5.lerpColor(p5.color("#00000000"), p5.color("#00000066"), this.bgOpacity * amount).toString()
    }
    this.drawBackground(bgColor(0.8));
    this.drawBackground(bgColor(1), gfx);
    this.spriteRenderer.drawImage(Image.Darken, 0, 0, gfx, this.bgOpacity * 0.3);
    gfx.textAlign(p5.CENTER, p5.CENTER);
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke("#000")
    gfx.strokeWeight(4);
    gfx.textSize(32.5);
    gfx.fill('#000');
    gfx.text(title, ...this.getPosition(0.5, this.stageClearY + 0.01));
    gfx.textSize(32);
    gfx.fill('#fff');
    gfx.text(title, ...this.getPosition(0.5, this.stageClearY + 0.0));

    this.tick();
  };

  statOffsetY = -0.025;
  accentColor = "#FFDD99";
  accentColorBg = Color("#FFB41F").darken(0.4).hex();

  drawPerfectBonus = (bonus: number, hasBonus: boolean) => {
    if (!hasBonus) return;
    const { p5, gfx, fonts } = this.props;
    const accentColor = this.accentColor;
    const accentColorBg = this.accentColorBg;
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg)
    gfx.strokeWeight(3);
    gfx.textSize(16);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.text('PERFECT!', ...this.getPosition(0.5, 0.6 + this.statOffsetY));
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.5, 0.65 + this.statOffsetY));
  }

  drawAllApplesBonus = (bonus: number, hasBonus: boolean) => {
    if (!hasBonus) return;
    const { p5, gfx, fonts } = this.props;
    const accentColor = "#15C2CB";
    const accentColorBg = Color("#119DA4").darken(0.4).hex();
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg);
    gfx.strokeWeight(3);
    gfx.textSize(16);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.text('100% Apples', ...this.getPosition(0.5, 0.6 + this.statOffsetY));
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.5, 0.65 + this.statOffsetY));
  }

  drawLevelClearBonus = (bonus: number) => {
    const { p5, gfx, fonts } = this.props;
    const shadowOffset = 0.004;
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke("#000")
    gfx.textSize(14);
    gfx.textAlign(p5.LEFT, p5.TOP);
    gfx.fill('#000');
    gfx.strokeWeight(3);
    gfx.text('Level Clear Bonus', ...this.getPosition(0.15, 0.4 + this.statOffsetY + shadowOffset));
    gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.15, 0.45 + this.statOffsetY + shadowOffset));
    gfx.fill('#fff');
    gfx.strokeWeight(2);
    gfx.text('Level Clear Bonus', ...this.getPosition(0.15, 0.4 + this.statOffsetY));
    gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.15, 0.45 + this.statOffsetY));
  }

  drawLivesLeftBonus = (bonus: number, lives: number, calcBonus: number) => {
    const { p5, gfx, fonts } = this.props;
    const shadowOffset = 0.004;
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke("#000")
    gfx.textSize(14);
    gfx.textAlign(p5.LEFT, p5.TOP);
    gfx.strokeWeight(3);
    gfx.fill('#000');
    gfx.text('Lives Bonus', ...this.getPosition(0.6, 0.4 + this.statOffsetY + shadowOffset));
    gfx.text(`${lives} x ${bonus.toFixed(0)}`, ...this.getPosition(0.6, 0.45 + this.statOffsetY + shadowOffset));
    gfx.text(calcBonus.toFixed(0).padStart(5, '0'), ...this.getPosition(0.6, 0.5 + this.statOffsetY + shadowOffset));
    gfx.strokeWeight(2);
    gfx.fill('#fff');
    gfx.text('Lives Bonus', ...this.getPosition(0.6, 0.4 + this.statOffsetY));
    gfx.text(`${lives} x ${bonus.toFixed(0)}`, ...this.getPosition(0.6, 0.45 + this.statOffsetY));
    gfx.text(calcBonus.toFixed(0).padStart(5, '0'), ...this.getPosition(0.6, 0.5 + this.statOffsetY));
  }

  drawScore = (score: number) => {
    const { p5, gfx, fonts } = this.props;
    gfx.textAlign(p5.CENTER, p5.CENTER);
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke("#000")
    gfx.textSize(24.5);
    gfx.strokeWeight(4);
    gfx.fill('#000');
    gfx.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.611));
    gfx.textSize(24);
    gfx.strokeWeight(2);
    gfx.fill('#fff');
    gfx.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.6));
  }

  drawMusicTrackUnlocked = (track: MusicTrack) => {
    const { p5, gfx, fonts } = this.props;
    const accentColor = "#15C2CB";
    const accentColorBg = Color("#119DA4").darken(0.4).hex();
    const shadowOffset = 0.011;
    gfx.textFont(fonts.variants.miniMood);
    gfx.textSize(16);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.fill('#111');
    gfx.stroke('#000');
    gfx.strokeWeight(4);
    gfx.text('Music track unlocked:', ...this.getPosition(0.5, 0.5 + this.statOffsetY + shadowOffset * 0.5));
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg);
    gfx.strokeWeight(4);
    gfx.text('Music track unlocked:', ...this.getPosition(0.5, 0.5 + this.statOffsetY));
    gfx.textSize(28);
    gfx.fill('#111');
    gfx.stroke('#000');
    gfx.strokeWeight(6);
    gfx.text(getTrackName(track), ...this.getPosition(0.5, 0.55 + this.statOffsetY + shadowOffset));
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg);
    gfx.strokeWeight(4);
    gfx.text(getTrackName(track), ...this.getPosition(0.5, 0.55 + this.statOffsetY));
  }
}
