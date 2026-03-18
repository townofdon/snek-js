import P5 from "p5";
import Color from "color";

import { FontsInstance, GameState, Image, MusicTrack, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { Easing } from "../easing";
import { UnlockedMusicStore } from "../stores/UnlockedMusicStore";
import { OST_MODE_TRACKS_NOTIFY_UNLOCK } from "../constants";
import { getTrackName, shuffleArray } from "../utils";
import { SpriteRenderer } from "../engine/spriteRenderer";

const PHRASES = [
  'tubular!',
  'snek-tacular!',
  'radical!',
  'far out!',
  'wicked!',
  'awesome!',
];

interface TriggerLevelExitParams {
  score: number,
  levelClearBonus: number,
  livesLeftBonus: number,
  livesLeft: number,
  allApplesBonus: number,
  allLocksBonus: number,
  perfectBonus: number,
  isPerfect: boolean,
  hasAllApples: boolean,
  hasAllLocks: boolean,
  isCasualModeEnabled: boolean,
  levelMusicTrack?: MusicTrack,
  parTime: number,
  clearTime: number,
  onApplyScore: () => void,
}

export class WinLevelScene extends BaseScene {
  private sfx: SFXInstance;
  private spriteRenderer: SpriteRenderer;
  private gameState: GameState;
  private titleText: string = 'SNEK CLEAR!';
  private unlockedMusicStore: UnlockedMusicStore;
  private levelMusicTrack: MusicTrack | null = null;

  constructor(p5: P5, gfx: P5.Graphics, gameState: GameState, sfx: SFXInstance, fonts: FontsInstance, unlockedMusicStore: UnlockedMusicStore, spriteRenderer: SpriteRenderer, callbacks: SceneCallbacks = {}) {
    super(p5, gfx, fonts, callbacks)
    this.sfx = sfx;
    this.spriteRenderer = spriteRenderer;
    this.gameState = gameState;
    this.unlockedMusicStore = unlockedMusicStore;
  }

  private stageClearY = 0.5;
  private bgOpacity = 0;

  private score = 0;
  private levelClearBonus = 0;
  private livesLeftBonus = 0;
  private livesLeft = 0;
  private allApplesBonus = 0;
  private allLocksBonus = 0;
  private perfectBonus = 0;
  private hasAllApples = false;
  private hasAllLocks = false;
  private isPerfect = false;
  private parTime = 0;
  private clearTime = 0;
  private onApplyScore = () => { };

  private isTriggered = false;
  private phrases: string[] = shuffleArray([...PHRASES]);

  triggerLevelExit({
    score,
    levelClearBonus,
    livesLeftBonus,
    livesLeft,
    allApplesBonus,
    allLocksBonus,
    perfectBonus,
    hasAllApples,
    hasAllLocks,
    isPerfect,
    isCasualModeEnabled,
    levelMusicTrack,
    parTime,
    clearTime,
    onApplyScore,
  }: TriggerLevelExitParams) {
    if (this.isTriggered) return;
    this.isTriggered = true;
    this.score = score;
    this.levelClearBonus = levelClearBonus;
    this.livesLeftBonus = livesLeftBonus;
    this.livesLeft = livesLeft;
    this.allApplesBonus = allApplesBonus;
    this.allLocksBonus = allLocksBonus;
    this.perfectBonus = perfectBonus;
    this.hasAllApples = hasAllApples;
    this.hasAllLocks = hasAllLocks;
    this.isPerfect = isPerfect;
    this.levelMusicTrack = levelMusicTrack || null;
    this.parTime = parTime;
    this.clearTime = clearTime;
    if (isCasualModeEnabled) {
      onApplyScore();
      this.cleanup();
      this.isTriggered = false;
    } else {
      this.onApplyScore = onApplyScore;
      this.startActionsNoBind();
    }
    this.phrases = shuffleArray([...PHRASES]);
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

    while(sfx.isPlaying(Sound.winGame)) {
      yield;
    }

    yield* coroutines.waitForTime(600, (t) => {
      this.bgOpacity = t;
      this.stageClearY = p5.lerp(0.5, 0.2, Easing.inOutCubic(t));
      this.drawScore(this.score);
    });

    this.stageClearY = 0.2;
    this.bgOpacity = 1;

    yield* coroutines.waitForTime(60, () => {
      this.drawScore(this.score);
    }, true);

    // level clear bonus
    sfx.play(Sound.xplode);
    yield* coroutines.waitForTime(700, () => {
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawScore(this.score);
    }, true);

    // lives left bonus
    sfx.play(Sound.xplode);
    yield* coroutines.waitForTime(700, () => {
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
      this.drawScore(this.score);
    }, true);

    // all locks bonus
    if (this.hasAllLocks && !this.isPerfect && !this.hasAllApples) {
      sfx.play(Sound.xplode);
      yield* coroutines.waitForTime(700, () => {
        this.drawAllLocksBonus(this.allLocksBonus, this.hasAllLocks, this.isPerfect || this.hasAllApples);
        this.drawLevelClearBonus(this.levelClearBonus);
        this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
        this.drawScore(this.score);
      }, true);
    }

    // perfect bonus
    if (this.isPerfect) {
      sfx.play(Sound.xplodeLong, 0.7);
      if (this.clearTime <= this.parTime - 10000) {
        sfx.play(Sound.guitarRiff2, 0.6);
      } else if (this.clearTime <= this.parTime) {
        sfx.play(Sound.guitarRiff1, 0.6);
      }
      yield* coroutines.waitForTime(700, (t) => {
        // flash
        const freq = 0.2;
        const shouldShow = t % freq < freq * 0.5;
        if (shouldShow) this.drawPerfectBonus(this.perfectBonus, this.isPerfect, this.hasAllLocks);
        if (shouldShow) this.drawAllLocksBonus(this.allLocksBonus, this.hasAllLocks, this.isPerfect || this.hasAllApples);
        this.drawLevelClearBonus(this.levelClearBonus);
        this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
        this.drawScore(this.score);
      }, true);
    } else if (this.hasAllApples) {
      sfx.play(Sound.xpound, 0.6);
      yield* coroutines.waitForTime(500, (t) => {
        this.drawAllApplesBonus(this.allApplesBonus, this.hasAllApples, this.hasAllLocks);
        this.drawAllLocksBonus(this.allLocksBonus, this.hasAllLocks, this.isPerfect || this.hasAllApples);
        this.drawLevelClearBonus(this.levelClearBonus);
        this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
        this.drawScore(this.score);
      }, true);
    }

    // pause before increment
    yield* coroutines.waitForTime(500, () => {
      if (this.isPerfect) {
        this.drawPerfectBonus(this.perfectBonus, this.isPerfect, this.hasAllLocks);
      } else if (this.hasAllApples) {
        this.drawAllApplesBonus(this.allApplesBonus, this.hasAllApples, this.hasAllLocks);
      }
      this.drawAllLocksBonus(this.allLocksBonus, this.hasAllLocks, this.isPerfect || this.hasAllApples);
      this.drawLevelClearBonus(this.levelClearBonus);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft);
      this.drawScore(this.score);
    }, true);

    const perfectBonusCalc = this.isPerfect ? this.perfectBonus : 0;
    const allApplesBonusCalc = !this.isPerfect && this.hasAllApples ? this.allApplesBonus : 0;
    const allLocksBonusCalc = this.hasAllLocks ? this.allLocksBonus : 0;
    const finalScore = this.score
      + this.levelClearBonus
      + this.livesLeftBonus * this.livesLeft
      + perfectBonusCalc
      + allApplesBonusCalc
      + allLocksBonusCalc;

    // increment score
    const playingChipSound = this.startCoroutine(this.playChipSound());
    yield* coroutines.waitForTime(1000, (t) => {
      if (this.isPerfect) {
        this.drawPerfectBonus(this.perfectBonus * (1 - t), this.isPerfect, this.hasAllLocks);
      } else if (this.hasAllApples) {
        this.drawAllApplesBonus(this.allApplesBonus * (1 - t), this.hasAllApples, this.hasAllLocks);
      }
      this.drawAllLocksBonus(this.allLocksBonus * (1 - t), this.hasAllLocks, this.isPerfect || this.hasAllApples);
      this.drawLevelClearBonus(this.levelClearBonus * (1 - t));
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, this.livesLeftBonus * this.livesLeft * (1 - t));
      this.drawScore(p5.lerp(this.score, finalScore, t));
    }, true);
    this.stopCoroutine(playingChipSound);
    sfx.stop(Sound.uiChipLoop);
    sfx.play(Sound.uiChip, 0.75);

    this.onApplyScore();

    yield* coroutines.waitForTime(1000, () => {
      if (this.isPerfect) {
        this.drawPerfectBonus(0, this.isPerfect, this.hasAllLocks);
      } else if (this.hasAllApples) {
        this.drawAllApplesBonus(0, this.hasAllApples, this.hasAllLocks);
      }
      this.drawAllLocksBonus(0, this.hasAllLocks, this.isPerfect || this.hasAllApples);
      this.drawLevelClearBonus(0);
      this.drawLivesLeftBonus(this.livesLeftBonus, this.livesLeft, 0);
      this.drawScore(finalScore);
    }, true);

    // unlock music track
    if (this.levelMusicTrack && !this.unlockedMusicStore.getIsUnlocked(this.levelMusicTrack)) {
      this.unlockedMusicStore.unlockTrack(this.levelMusicTrack);
      if (OST_MODE_TRACKS_NOTIFY_UNLOCK.includes(this.levelMusicTrack)) {
        sfx.play(Sound.unlockAbility, 1);
        yield* coroutines.waitForTime(3200, (t) => {
          // flash
          const freq = 0.3;
          const shouldShow = t % freq < freq * 0.5;
          if (shouldShow) this.drawMusicTrackUnlocked(this.levelMusicTrack);
        }, true);
      }
    }

    sfx.stop(Sound.unlockAbility);

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
    gfx.strokeWeight(2 * 4);
    gfx.textSize(2 * 32.5);
    gfx.fill('#000');
    gfx.text(title, ...this.getPosition(0.5, this.stageClearY + 0.01));
    gfx.strokeWeight(2 * 4);
    gfx.textSize(2 * 32);
    gfx.fill('#fff');
    gfx.text(title, ...this.getPosition(0.5, this.stageClearY + 0.0));

    this.tick();
  };

  statOffsetY = -0.025;
  accentColor = "#FFDD99";
  accentColorBg = Color("#FFB41F").darken(0.4).hex();

  drawPerfectBonus = (bonus: number, hasBonus: boolean, hasOtherBonus: boolean) => {
    if (!hasBonus) return;
    const { p5, gfx, fonts } = this.props;
    const accentColor = this.accentColor;
    const accentColorBg = this.accentColorBg;
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg)
    gfx.strokeWeight(2 * 3);
    gfx.textSize(2 * 16);
    const text = 'PERFECT!';
    if (hasOtherBonus) {
      gfx.textAlign(p5.CENTER, p5.TOP);
      gfx.text(text, ...this.getPosition(0.64, 0.6 + this.statOffsetY));
      gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.64, 0.65 + this.statOffsetY));
    } else {
      gfx.textAlign(p5.CENTER, p5.TOP);
      gfx.text(text, ...this.getPosition(0.5, 0.6 + this.statOffsetY));
      gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.5, 0.65 + this.statOffsetY));
    }
    if (this.clearTime <= this.parTime) {
      this.drawTubularRight(hasOtherBonus);
    }
    if (this.clearTime <= this.parTime - 20000) {
      this.drawTubularLeft(hasOtherBonus);
    }
  }

  drawAllApplesBonus = (bonus: number, hasBonus: boolean, hasOtherBonus: boolean) => {
    if (!hasBonus) return;
    const { p5, gfx, fonts } = this.props;
    const accentColor = "#15C2CB";
    const accentColorBg = Color("#119DA4").darken(0.4).hex();
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg);
    gfx.strokeWeight(2 * 3);
    gfx.textSize(2 * 16);
    const text = '100% Treats';
    if (hasOtherBonus) {
      gfx.textAlign(p5.CENTER, p5.TOP);
      gfx.text(text, ...this.getPosition(0.64, 0.6 + this.statOffsetY));
      gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.64, 0.65 + this.statOffsetY));
    } else {
      gfx.textAlign(p5.CENTER, p5.TOP);
      gfx.text(text, ...this.getPosition(0.5, 0.6 + this.statOffsetY));
      gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.5, 0.65 + this.statOffsetY));
    }
  }

  drawAllLocksBonus = (bonus: number, hasBonus: boolean, hasOtherBonus: boolean) => {
    if (!hasBonus) return;
    const { p5, gfx, fonts } = this.props;
    let accentColor = Color("#E76F51").lighten(0.3).desaturate(0.1).hex();
    let accentColorBg = Color("#E76F51").darken(0.4).saturate(0.1).hex();
    if (this.isPerfect) {
      accentColor = this.accentColor;
      accentColorBg = this.accentColorBg;
    }
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg);
    gfx.strokeWeight(2 * 4);
    gfx.textSize(2 * 14);
    const text = '100% Locks';
    if (hasOtherBonus) {
      gfx.textAlign(p5.CENTER, p5.TOP);
      gfx.text(text, ...this.getPosition(0.34, 0.6 + this.statOffsetY));
      gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.34, 0.65 + this.statOffsetY));
    } else {
      gfx.textAlign(p5.CENTER, p5.TOP);
      gfx.text(text, ...this.getPosition(0.5, 0.6 + this.statOffsetY));
      gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.5, 0.65 + this.statOffsetY));
    }
  }

  drawLevelClearBonus = (bonus: number) => {
    const { p5, gfx, fonts } = this.props;
    const shadowOffset = 0.004;
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke("#000")
    gfx.textSize(2 * 14);
    gfx.textAlign(p5.RIGHT, p5.TOP);
    // shadow
    gfx.fill('#000');
    gfx.strokeWeight(2 * 3);
    gfx.text('Stage Bonus', ...this.getPosition(0.4, 0.4 + this.statOffsetY + shadowOffset));
    gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.4, 0.5 + this.statOffsetY + shadowOffset));
    // overlay
    gfx.fill('#fff');
    gfx.strokeWeight(2 * 2);
    gfx.text('Stage Bonus', ...this.getPosition(0.4, 0.4 + this.statOffsetY));
    gfx.text(bonus.toFixed(0).padStart(4, '0'), ...this.getPosition(0.4, 0.5 + this.statOffsetY));
    // par time shadow
    const parTime = this.parTime;
    const clearTime = this.clearTime;
    const timeText = this.getTimeDisplay(clearTime);
    const separator = "  >>  ";
    const parText = `Par ${this.getTimeDisplay(parTime)}`;
    {
      const [x, y] = this.getPosition(0.4, 0.45 + this.statOffsetY + shadowOffset);
      const w0 = gfx.textWidth(timeText);
      const w1 = gfx.textWidth(separator);
      gfx.fill("#000");
      gfx.strokeWeight(2 * 3);
      gfx.text(timeText, x, y);
      gfx.text(separator, x - w0, y);
      gfx.text(parText, x - w0 - w1, y);
    }
    // par time overlay
    {
      const [x, y] = this.getPosition(0.4, 0.45 + this.statOffsetY);
      const w0 = gfx.textWidth(timeText);
      const w1 = gfx.textWidth(separator);
      gfx.strokeWeight(2 * 2);
      gfx.fill(this.accentColor);
      gfx.text(parText, x - w0 - w1, y);
      gfx.fill("#fff");
      gfx.text(separator, x - w0, y);
      gfx.text(timeText, x, y);
      const offset = 42;
      let compareTime = parTime;
      let i = 0;
      while (compareTime > 0 && clearTime <= compareTime && i < 3) {
        this.spriteRenderer.drawSpritesheetAnim(gfx, Image.UIFlamesheet, x + 5 + offset * i, y - 15, 3, 200, this.gameState.timeElapsed);
        compareTime -= 10000;
        i++;
      }
    }
  }

  drawLivesLeftBonus = (bonus: number, lives: number, calcBonus: number) => {
    const { p5, gfx, fonts } = this.props;
    const shadowOffset = 0.004;
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke("#000")
    gfx.textAlign(p5.LEFT, p5.TOP);
    gfx.textSize(2 * 14);
    gfx.strokeWeight(2 * 3);
    gfx.fill('#000');
    gfx.text('Lives Bonus', ...this.getPosition(0.6, 0.4 + this.statOffsetY + shadowOffset));
    gfx.text(`${lives} x ${bonus.toFixed(0)}`, ...this.getPosition(0.6, 0.45 + this.statOffsetY + shadowOffset));
    gfx.text(calcBonus.toFixed(0).padStart(5, '0'), ...this.getPosition(0.6, 0.5 + this.statOffsetY + shadowOffset));
    gfx.textSize(2 * 14);
    gfx.strokeWeight(2 * 2);
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
    gfx.textSize(2 * 24.5);
    gfx.strokeWeight(2 * 4);
    gfx.fill('#000');
    gfx.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.611));
    gfx.textSize(2 * 24);
    gfx.strokeWeight(2 * 2);
    gfx.fill('#fff');
    gfx.text(score.toFixed(0).padStart(8, '0'), ...this.getPosition(0.5, this.stageClearY + 0.6));
  }

  drawMusicTrackUnlocked = (track: MusicTrack) => {
    const { p5, gfx, fonts } = this.props;
    const accentColor = "#15C2CB";
    const accentColorBg = Color("#119DA4").darken(0.4).hex();
    const shadowOffset = 0.011;
    gfx.textFont(fonts.variants.miniMood);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.fill('#111');
    gfx.stroke('#000');
    gfx.textSize(2 * 16);
    gfx.strokeWeight(2 * 4);
    gfx.text('Music track unlocked:', ...this.getPosition(0.5, 0.5 + this.statOffsetY + shadowOffset * 0.5));
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg);
    gfx.textSize(2 * 16);
    gfx.strokeWeight(2 * 4);
    gfx.text('Music track unlocked:', ...this.getPosition(0.5, 0.5 + this.statOffsetY));
    gfx.fill('#111');
    gfx.stroke('#000');
    gfx.textSize(2 * 28);
    gfx.strokeWeight(2 * 6);
    gfx.text(getTrackName(track), ...this.getPosition(0.5, 0.55 + this.statOffsetY + shadowOffset));
    gfx.fill(accentColor);
    gfx.stroke(accentColorBg);
    gfx.textSize(2 * 28);
    gfx.strokeWeight(2 * 4);
    gfx.text(getTrackName(track), ...this.getPosition(0.5, 0.55 + this.statOffsetY));
  }

  private drawTubularLeft = (hasOtherBonus: boolean) => {
    const text = this.phrases[0];
    const { p5, gfx, fonts } = this.props;
    const accentColor = "#15C2CB";
    const accentColorBg = Color("#119DA4").darken(0.4).hex();
    const y = hasOtherBonus ? 0.55 : 0.65;
    gfx.push();
    gfx.translate(...this.getPosition(0.35, y + this.statOffsetY));
    gfx.rotate(0.05 * Math.PI);
    gfx.fill(accentColor);
    gfx.stroke(Color(accentColorBg).darken(0.8).hex());
    gfx.textFont(fonts.variants.miniMood);
    gfx.strokeWeight(2 * 5);
    gfx.textSize(2 * 12);
    gfx.textAlign(p5.RIGHT, p5.TOP);
    gfx.textStyle(p5.BOLD);
    gfx.text(text, 0, 0);
    gfx.textStyle(p5.NORMAL);
    gfx.pop();
  }

  private drawTubularRight = (hasOtherBonus: boolean) => {
    const text = this.phrases[1];
    const { p5, gfx, fonts } = this.props;
    const accentColor = "#8e6ced";
    const accentColorBg = Color("#533c93").darken(0.4).hex();
    const y = hasOtherBonus ? 0.55 : 0.65;
    gfx.push();
    gfx.translate(...this.getPosition(0.65, y + this.statOffsetY));
    gfx.rotate(-0.05 * Math.PI);
    gfx.fill(accentColor);
    gfx.stroke(Color(accentColorBg).darken(0.8).hex());
    gfx.textFont(fonts.variants.miniMood);
    gfx.strokeWeight(2 * 5);
    gfx.textSize(2 * 12);
    gfx.textAlign(p5.LEFT, p5.TOP);
    gfx.textStyle(p5.BOLD);
    gfx.text(text, 0, 0);
    gfx.textStyle(p5.NORMAL);
    gfx.pop();
  }

  private getTimeDisplay = (valueMs: number): string => {
    const seconds = Math.floor(valueMs / 1000) % 60;
    const minutes = Math.floor(valueMs / 1000 / 60);
    const pad = (value: number, numberOfDigits = 2) => String(value).padStart(numberOfDigits, "0");
    return `${pad(minutes)}:${pad(seconds)}`;
  }
}
