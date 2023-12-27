import P5 from "p5";
import Color from "color";
import formatNumberFn from 'format-number'

import { DIR, FontsInstance, GameState, IEnumerator, SFXInstance, SceneCallbacks, Sound, Stats } from "../types";
import { BaseScene } from "./BaseScene";
import { Easing } from "../easing";
import { ACCENT_COLOR, DIMENSIONS } from "../constants";
import { indexToDir } from "../utils";
import { HighScoreEntry, postLeaderboardResult, getLeaderboard, getToken } from "../api/leaderboard";
import { HighscoreEntryModal, Modal } from "../ui";
import { ApiOptions } from "../api/utils/apiUtils";

const formatNumber = formatNumberFn({
  truncate: 0,
  decimalsSeparator: '.',
  integerSeparator: ' ',
});

const DISABLE_HIGHSCORE_POST = window.location.href.includes('localhost');

const STATE_CLEAR_Y_START = -1; // normalized position
const HIGHSCORE_GRADIENT_CYCLE_TIME_MS = 500;
const COL_LEFT = 0.48;
const COL_RIGHT = 0.52;

const SECONDARY_ACCENT_COLOR = "#15C2CB";
const SECONDARY_ACCENT_COLOR_BG = Color("#119DA4").darken(0.4).hex();
const NEW_HIGHSCORE_COLORS = [
  "#833AB4",
  "#FD1D1D",
  "#FCB045",
  "#15C2CB",
]
const LEADERBOARD_COLORS = [
  "#FFB41F",
  "#24E3AF",
  "#15C2CB",
  "#833AB4",
];

enum FIELD {
  TITLE = 0,
  POINTS = 10,
  HAS_HIGHSCORE = 11,
  APPLES = 20,
  DEATHS = 30,
  TIME = 40,
  HIGHSCORE_ENTRY = 50,
  LEADERBOARD = 60,
  LEADERBOARD_NEW_RESULT = 61,
  LEADERBOARD_LOADING = 62,
  LEADERBOARD_ERROR = 63,
  LEADERBOARD_HECK_YEAH = 64,
}

interface WinGameState {
  leaderboardResults: HighScoreEntry[],
  leaderboardToken: string,
  leaderboardLoading: boolean,
  leaderboardError: string,
  highscoreEntryName: string,
  bgOpacity: number,
  stageClearY: number,
}

export interface WinGameSceneConstructorArgs {
  p5: P5,
  gameState: GameState,
  stats: Stats,
  sfx: SFXInstance,
  fonts: FontsInstance,
  onChangePlayerDirection: (direction: DIR) => void;
  callbacks: SceneCallbacks,
}

export class WinGameScene extends BaseScene {
  private sfx: SFXInstance;
  private gameState: GameState;
  private stats: Stats;
  private state: WinGameState = {
    leaderboardResults: [],
    leaderboardToken: '',
    leaderboardLoading: false,
    leaderboardError: '',
    highscoreEntryName: '',
    bgOpacity: 0,
    stageClearY: STATE_CLEAR_Y_START,
  }

  private onChangePlayerDirection: (direction: DIR) => void = () => { };

  private fieldVisible: boolean[] = [];
  private fieldValue: number[] = [];

  constructor({ p5, gameState, stats, sfx, fonts, onChangePlayerDirection, callbacks = {} }: WinGameSceneConstructorArgs) {
    super(p5, fonts, callbacks)
    this.sfx = sfx;
    this.gameState = gameState;
    this.stats = stats;
    this.onChangePlayerDirection = onChangePlayerDirection;
  }

  private initFields = () => {
    const fields: FIELD[] = Object.values(FIELD) as FIELD[];
    fields.forEach(field => {
      this.fieldVisible[field] = false;
      this.fieldValue[field] = 0;
    });
    this.state.stageClearY = STATE_CLEAR_Y_START;
  }

  private hideAllFields = () => {
    const fields: FIELD[] = Object.values(FIELD) as FIELD[];
    fields.forEach(field => {
      this.fieldVisible[field] = false;
    });
  }

  private fetchHighScores = () => {
    const logAndThrow = (err: Error) => {
      console.error(err);
      throw err;
    }
    this.state.leaderboardLoading = true;
    const tokenF = getToken();
    const resultsF = getLeaderboard();
    Promise.all([
      tokenF.then(token => {
        this.state.leaderboardToken = token;
      }).catch(logAndThrow),
      resultsF.then(results => {
        this.state.leaderboardResults = results;
      }).catch(logAndThrow),
    ])
      .catch((_) => {
        this.state.leaderboardError = 'Could not fetch leaderboard results.';
      })
      .finally(() => {
        this.state.leaderboardLoading = false;
      })
  }

  private postLeaderboardResult = (name: string) => {
    if (DISABLE_HIGHSCORE_POST) {
      return;
    }
    const { score } = this.stats;
    const apiOptions: ApiOptions = { xsrfToken: this.state.leaderboardToken };
    postLeaderboardResult(name, score, apiOptions);
  }

  private getHasHighscore = () => {
    const { leaderboardResults } = this.state;
    const { isCasualModeEnabled } = this.gameState;
    const { score } = this.stats;
    if (isCasualModeEnabled) {
      return false;
    }
    if (!leaderboardResults || !leaderboardResults.length) {
      return false;
    }
    for (let i = 0; i < leaderboardResults.length; i++) {
      if (score > leaderboardResults[i].score) {
        return true;
      }
    }
    return false;
  }

  beforeGotoNextLevel = () => { };

  reset = () => {
    this.stopAllCoroutines();
  }

  trigger = () => {
    this.stopAllCoroutines();
    this.initFields();
    this.fetchHighScores();
    this.startActionsNoBind();
    this.startCoroutine(this.moveRandomDirection());
  }

  *action() {
    const { p5, coroutines } = this.props;
    const sfx = this.sfx;
    const { isCasualModeEnabled } = this.gameState;
    const { score, numApplesEverEaten, numDeaths, totalTimeElapsed } = this.stats;
    let playingChipSound = ""

    this.fieldVisible[FIELD.TITLE] = true;
    this.state.stageClearY = STATE_CLEAR_Y_START;
    yield* coroutines.waitForTime(600, (t) => {
      this.state.bgOpacity = t;
      this.state.stageClearY = p5.lerp(STATE_CLEAR_Y_START, 0, Easing.inOutCubic(t));
    });

    sfx.play(Sound.xpound);
    yield* coroutines.waitForTime(500);

    if (!isCasualModeEnabled) {
      this.fieldVisible[FIELD.POINTS] = true;
      sfx.play(Sound.xplode);
      yield* coroutines.waitForTime(200);
      if (score > 0) {
        playingChipSound = this.startCoroutine(this.playChipSound());
        yield* coroutines.waitForTime(700, (t) => {
          this.fieldValue[FIELD.POINTS] = p5.lerp(0, score, t);
        });
        this.stopCoroutine(playingChipSound);
      }

      if (this.getHasHighscore()) {
        this.fieldVisible[FIELD.HAS_HIGHSCORE] = true;
        sfx.play(Sound.xplodeLong, 0.9);
        yield* coroutines.waitForTime(700, (t) => {
          // flash
          const freq = 0.2;
          const shouldShow = t % freq < freq * 0.5;
          this.fieldVisible[FIELD.HAS_HIGHSCORE] = shouldShow;
        });
        this.fieldVisible[FIELD.HAS_HIGHSCORE] = true;
      } else {
        yield* coroutines.waitForTime(500);
      }
    }

    this.fieldVisible[FIELD.APPLES] = true;
    sfx.play(Sound.xplode);
    yield* coroutines.waitForTime(200);
    if (numApplesEverEaten > 0) {
      playingChipSound = this.startCoroutine(this.playChipSound());
      yield* coroutines.waitForTime(700, (t) => {
        this.fieldValue[FIELD.APPLES] = p5.lerp(0, numApplesEverEaten, t);
      });
      this.stopCoroutine(playingChipSound);
    }
    yield* coroutines.waitForTime(500);

    if (!isCasualModeEnabled) {
      this.fieldVisible[FIELD.DEATHS] = true;
      sfx.play(Sound.xplode);
      yield* coroutines.waitForTime(200);
      if (numDeaths > 0) {
        playingChipSound = this.startCoroutine(this.playChipSound());
        yield* coroutines.waitForTime(700, (t) => {
          this.fieldValue[FIELD.DEATHS] = p5.lerp(0, numDeaths, t);
        });
        this.stopCoroutine(playingChipSound);
      }
      yield* coroutines.waitForTime(500);
    }

    this.fieldVisible[FIELD.TIME] = true;
    sfx.play(Sound.xplode);
    yield* coroutines.waitForTime(200);
    playingChipSound = this.startCoroutine(this.playChipSound());
    yield* coroutines.waitForTime(700, (t) => {
      this.fieldValue[FIELD.TIME] = p5.lerp(0, totalTimeElapsed, t);
    });
    this.stopCoroutine(playingChipSound);
    yield* coroutines.waitForTime(500);

    sfx.play(Sound.eat);
    yield* coroutines.waitForEnterKey(() => {
      this.drawPressEnter();
    });

    // show highscore entry
    if (!isCasualModeEnabled && this.getHasHighscore()) {
      this.hideAllFields();
      this.fieldVisible[FIELD.HIGHSCORE_ENTRY] = true;
      const modalHighScoreEntry = new HighscoreEntryModal(p5);
      const modalConfirm = new Modal(p5);
      const onSubmitHighscoreName = (name: string) => {
        const handleYesClick = () => {
          this.state.highscoreEntryName = name;
          modalConfirm.hide();
          this.postLeaderboardResult(name);
        }
        const handleNoClick = () => {
          modalHighScoreEntry.show(onSubmitHighscoreName, name);
          modalConfirm.hide();
          sfx.play(Sound.uiBlip);
        }
        modalConfirm.show('Confirm', `Use name "${name}"?`, handleYesClick, handleNoClick);
        modalHighScoreEntry.hide();
        sfx.play(Sound.uiChip);
      };
      modalHighScoreEntry.show(onSubmitHighscoreName);
      sfx.play(Sound.unlock);
      while (modalHighScoreEntry.getIsShowing() || modalConfirm.getIsShowing()) {
        yield null;
      }
    }

    // show leaderboard
    sfx.play(Sound.doorOpen);
    this.hideAllFields();
    while (this.state.leaderboardLoading) {
      this.fieldVisible[FIELD.LEADERBOARD_LOADING] = true;
      yield null;
    }
    this.fieldVisible[FIELD.LEADERBOARD_LOADING] = false;
    if (this.state.leaderboardError) {
      this.fieldVisible[FIELD.LEADERBOARD_ERROR] = true;
    } else {
      this.fieldVisible[FIELD.LEADERBOARD] = true;
      if (this.getHasHighscore()) {
        this.fieldVisible[FIELD.LEADERBOARD_HECK_YEAH] = true;
      }
    }

    yield* coroutines.waitForTime(500);

    yield* coroutines.waitForEnterKey(() => {
      this.drawPressEnter(0.1);
    });

    this.cleanup();
  }

  *playChipSound(): IEnumerator {
    const { coroutines } = this.props;
    const sfx = this.sfx;
    while (true) {
      sfx.play(Sound.uiChipLoop, 0.75);
      yield* coroutines.waitForTime(8);
      sfx.stop(Sound.uiChipLoop);
    }
  }

  *moveRandomDirection(): IEnumerator {
    const { p5, coroutines } = this.props;
    while (true) {
      yield* coroutines.waitForTime(p5.random(20, 400));
      if (this.gameState.timeSinceLastInput > 2000) {
        this.onChangePlayerDirection(indexToDir(p5.random(0, 4)));
      }
      yield null;
    }
  }

  keyPressed = () => { };

  draw = () => {
    const { p5 } = this.props;
    const { bgOpacity } = this.state;
    this.drawBackground(p5.lerpColor(p5.color("#00000000"), p5.color("#00000099"), bgOpacity).toString());

    if (this.fieldVisible[FIELD.TITLE]) {
      this.drawTitle();
    }

    const fieldPadding = 0.05;
    let y = 0.35;

    if (this.fieldVisible[FIELD.POINTS]) {
      this.drawField("POINTS", this.fieldValue[FIELD.POINTS], y);
      y += fieldPadding;
    }

    if (this.fieldVisible[FIELD.HAS_HIGHSCORE]) {
      this.drawHasHighscore(y - fieldPadding);
    }

    if (this.fieldVisible[FIELD.APPLES]) {
      this.drawField("APPLES", this.fieldValue[FIELD.APPLES], y);
      y += fieldPadding;
    }

    if (this.fieldVisible[FIELD.DEATHS]) {
      this.drawField("DEATHS", this.fieldValue[FIELD.DEATHS], y);
      y += fieldPadding;
    }

    if (this.fieldVisible[FIELD.TIME]) {
      this.drawField("TIME", this.fieldValue[FIELD.TIME], y, {
        formatValue: this.getTimeDisplay,
      });
      y += fieldPadding;
    }

    if (this.fieldVisible[FIELD.LEADERBOARD_LOADING]) {
      this.drawTitle("LEADERBOARD", "secondary");
      this.drawParagraph("Loading...", 0.3);
    } else if (this.fieldVisible[FIELD.LEADERBOARD_ERROR]) {
      this.drawTitle("LEADERBOARD", "secondary");
      this.drawParagraph("Unable to fetch leaderboard results.", 0.35, "#e54");
    } else if (this.fieldVisible[FIELD.LEADERBOARD]) {
      this.drawLeaderboard();
      if (this.fieldVisible[FIELD.LEADERBOARD_HECK_YEAH]) {
        this.drawHeckYeah();
      }
    }

    this.tick();
  };

  private drawTitle = (title = "YOU WIN!", type: 'primary' | 'secondary' = 'primary') => {
    const color = type === "primary" ? ACCENT_COLOR : SECONDARY_ACCENT_COLOR;
    const bgColor = type === "primary" ? "#000" : SECONDARY_ACCENT_COLOR_BG;
    const { p5, fonts } = this.props;
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.stroke(bgColor)
    p5.strokeWeight(4);
    p5.textSize(32.5);
    p5.fill(bgColor);
    p5.text(title, ...this.getPosition(0.5, 0.21 + this.state.stageClearY));
    p5.textSize(32);
    p5.fill(color);
    p5.text(title, ...this.getPosition(0.5, 0.2 + this.state.stageClearY));
  }

  private drawParagraph = (message: string, yPos: number, color: string = "#fff") => {
    const { p5, fonts } = this.props;
    p5.textFont(fonts.variants.miniMood);
    p5.fill(color);
    p5.stroke("#000");
    p5.strokeWeight(2);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.text(message, ...this.getPosition(0.5, yPos + this.state.stageClearY));
  }

  private drawField = (label: string, value: number, yPos: number, {
    color0 = ACCENT_COLOR,
    bgColor0 = "#000",
    color1 = "#fff",
    bgColor1 = "#000",
    strokeSize = 3,
    bgStrokeSize = strokeSize,
    bgStrokeColor = "#000",
    formatValue,
    colLeft = COL_LEFT,
    colRight = COL_RIGHT,
    measureWidths = false,
  }: {
    color0?: string,
    bgColor0?: string,
    color1?: string,
    bgColor1?: string,
    strokeSize?: number,
    bgStrokeSize?: number,
    bgStrokeColor?: string,
    formatValue?: (value: number) => string,
    colLeft?: number,
    colRight?: number,
    measureWidths?: boolean,
  } = {}) => {
    const { p5, fonts } = this.props;
    const valueDisplay = formatValue ? formatValue(value) : formatNumber(value, {}).trim();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.strokeCap(p5.PROJECT);

    if (bgStrokeSize !== strokeSize) {
      p5.fill(bgStrokeColor);
      p5.stroke(bgStrokeColor);
      p5.strokeWeight(bgStrokeSize);
      p5.textAlign(p5.RIGHT, p5.TOP);
      p5.text(label, ...this.getPosition(colLeft, yPos + this.state.stageClearY));
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.text(valueDisplay, ...this.getPosition(colRight, yPos + this.state.stageClearY));
    }

    const widths = [0, 0];
    p5.fill(color0);
    p5.stroke(bgColor0);
    p5.strokeWeight(strokeSize);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text(label, ...this.getPosition(colLeft, yPos + this.state.stageClearY));
    if (measureWidths) widths[0] = p5.textWidth(label);

    p5.fill(color1);
    p5.stroke(bgColor1);
    p5.strokeWeight(strokeSize);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(valueDisplay, ...this.getPosition(colRight, yPos + this.state.stageClearY));
    if (measureWidths) widths[1] = p5.textWidth(valueDisplay);
    return widths;
  }

  private drawHasHighscore = (yPos: number) => {
    const { p5, fonts } = this.props;
    const { timeElapsed } = this.gameState;
    const t = (timeElapsed / HIGHSCORE_GRADIENT_CYCLE_TIME_MS) % 1;
    const color = this.getColor(t, NEW_HIGHSCORE_COLORS);
    p5.fill(color);
    p5.stroke(Color(color).darken(0.4).hex());
    p5.strokeWeight(2);
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text("NEW HIGHSCORE", ...this.getPosition(COL_RIGHT, yPos + this.state.stageClearY - 0.05));
  }

  private drawNewLabel = (x: number, y: number, align: P5.HORIZ_ALIGN = 'left') => {
    const { p5, fonts } = this.props;
    const { timeElapsed } = this.gameState;
    const t = (timeElapsed / HIGHSCORE_GRADIENT_CYCLE_TIME_MS) % 1;
    const color = this.getColor(t, NEW_HIGHSCORE_COLORS);
    // p5.fill("#fff");
    p5.fill(color);
    p5.stroke(Color(color).darken(0.4).hex());
    p5.strokeWeight(2);
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(12);
    p5.textAlign(align, p5.TOP);
    // p5.text(align === p5.RIGHT ? ">>>" : "<<<", ...this.getPosition(x, y));
    p5.text("NEW!", ...this.getPosition(x, y));
  }

  /**
   * Interpolate between an array of colors, where t[0-1] maps to [color0, color1, ... colorN]
   */
  private getColor = (t: number, colors: string[]) => {
    if (colors.length === 0) return "pink";
    const { p5 } = this.props;
    const c0 = Math.floor(t * colors.length) % colors.length;
    const c1 = (c0 + 1) % colors.length;
    const t1 = (t - (c0 / colors.length)) * colors.length;
    return p5.lerpColor(p5.color(colors[c0]), p5.color(colors[c1]), t1).toString();
  }

  private drawLeaderboard = () => {
    const { p5 } = this.props;
    const { isCasualModeEnabled, timeElapsed } = this.gameState;
    const { score } = this.stats;
    const newResult: HighScoreEntry = {
      id: "123",
      name: this.state.highscoreEntryName,
      score: isCasualModeEnabled ? 0 : score,
    }
    const newResults = isCasualModeEnabled
      ? this.state.leaderboardResults
      : this.state.leaderboardResults.concat(newResult).sort((a, b) => a.score - b.score).reverse();

    const tDeco = (Math.cos(timeElapsed / (HIGHSCORE_GRADIENT_CYCLE_TIME_MS * 2) * Math.PI) + 1) * 0.5;
    const decoOffset = 0.02 * tDeco;
    const fieldOptions = {
      strokeSize: 5,
      bgStrokeSize: 10,
      colLeft: 0.54,
      colRight: 0.58,
    }
    const fieldPadding = 0.05;
    let y = 0.325;
    this.drawTitle("LEADERBOARD", "secondary");

    for (let i = 0; i < newResults.length && i < 10; i++) {
      const result = newResults[i];
      if (newResult.id === result.id) {
        const t = (timeElapsed / HIGHSCORE_GRADIENT_CYCLE_TIME_MS) % 1;
        const color0 = this.getColor(t, NEW_HIGHSCORE_COLORS);
        const color1 = Color(color0).darken(0.7).hex();
        const color2 = this.getColor(t + 0.1, NEW_HIGHSCORE_COLORS);
        const color3 = Color(color2).darken(0.6).hex();
        const widths = this.drawField(newResult.name, newResult.score, y, {
          color0: color0,
          color1: color0,
          bgColor0: color1,
          bgColor1: color1,
          bgStrokeColor: color3,
          bgStrokeSize: 15,
          measureWidths: true,
          ...fieldOptions,
        });
        this.drawNewLabel(fieldOptions.colRight + (widths[1] / DIMENSIONS.x) + 0.02 + decoOffset, y);
        this.drawNewLabel(fieldOptions.colLeft - (widths[0] / DIMENSIONS.x) - 0.02 - decoOffset, y, p5.RIGHT);
      } else {
        const t = Easing.inOutQuad(i / (newResults.length - 1)) / LEADERBOARD_COLORS.length * (LEADERBOARD_COLORS.length - 1);
        const color = this.getColor(t, LEADERBOARD_COLORS);
        this.drawField(result.name, result.score, y, {
          color0: color,
          bgColor0: Color(color).darken(0.8).hex(),
          ...fieldOptions,
        });
      }
      y += fieldPadding;
    }
  }

  private drawHeckYeah = () => {
    const { p5, fonts } = this.props;
    p5.push();
    p5.translate(...this.getPosition(0.8, 0.25 + this.state.stageClearY));
    p5.rotate(-0.05 * Math.PI);
    p5.fill(ACCENT_COLOR);
    p5.stroke(Color(ACCENT_COLOR).darken(0.8).hex());
    p5.strokeWeight(5);
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(12);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.textStyle(p5.BOLD);
    p5.text("S N E K   Y E A H !", 0, 0);
    p5.textStyle(p5.NORMAL);
    p5.pop();
  }

  private drawPressEnter = (addY = 0) => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.stroke("#000");
    p5.strokeWeight(5);
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill('#fff');
    p5.text('[PRESS ENTER TO CONTINUE]', ...this.getPosition(0.5, 0.8 + addY));
  }

  private getTimeDisplay = (valueMs: number): string => {
    const milliseconds = Math.floor(valueMs % 1000);
    const seconds = Math.floor(valueMs / 1000) % 60;
    const minutes = Math.floor(valueMs / 1000 / 60 % 60);
    const hours = Math.floor(valueMs / 1000 / 60 / 60);
    const pad = (value: number, numberOfDigits = 2) => String(value).padStart(numberOfDigits, "0");
    // const hoursDisplay = hours > 0 ? `${hours}h ` : ''
    // return `${hoursDisplay}${minutes}m ${seconds}.${pad(milliseconds, 3)}s`;
    const hoursDisplay = hours > 0 ? `${pad(hours)}:` : '';
    return `${hoursDisplay}${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
  }
}
