import P5 from "p5";
import Color from "color";
import formatNumberFn from 'format-number'

import { DIR, FontsInstance, GameMode, GameState, IEnumerator, Image, SFXInstance, SceneCallbacks, Sound, Stats, UINavDir } from "../types";
import { BaseScene } from "./BaseScene";
import { Easing } from "../easing";
import { ACCENT_COLOR, DIMENSIONS, SECONDARY_ACCENT_COLOR, SECONDARY_ACCENT_COLOR_BG } from "../constants";
import { indexToDir } from "../utils";
import { HighScoreEntry, postLeaderboardResult, getLeaderboard, getToken } from "../api/leaderboard";
// import { HighscoreEntryModal, Modal } from "../ui/ui";
import { ApiOptions } from "../api/utils/apiUtils";
import { handleUIEvents } from "../engine/controls";
import { HighscoreEntryModal } from "../ui/highscoreEntryModal";
import { Modal } from "../ui/modal";
import { SpriteRenderer } from "../engine/spriteRenderer";
import { applyGamepadUIActions } from "../engine/gamepad";

const formatNumber = formatNumberFn({
  truncate: 0,
  decimalsSeparator: '.',
  integerSeparator: ' ',
});

const STATE_CLEAR_Y_START = -1; // normalized position
const HIGHSCORE_GRADIENT_CYCLE_TIME_MS = 500;
const COL_LEFT = 0.48;
const COL_RIGHT = 0.52;
const NUM_DEATHS_TO_LOOP_SOUND = 15;

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
  LEADERBOARD_FETCH_ERROR = 63,
  LEADERBOARD_HECK_YEAH = 64,
  LEADERBOARD_NON_QUALIFYING_SCORE = 65,
  LEADERBOARD_POST_ERROR = 66,
}

interface WinGameState {
  leaderboardResults: HighScoreEntry[],
  leaderboardToken: string,
  leaderboardLoading: boolean,
  leaderboardFetchError: string,
  leaderboardPostError: string,
  highscoreEntryName: string,
  bgOpacity: number,
  stageClearY: number,
}

export interface WinGameSceneConstructorArgs {
  p5: P5,
  gfx: P5.Graphics,
  gameState: GameState,
  stats: Stats,
  sfx: SFXInstance,
  fonts: FontsInstance,
  onChangePlayerDirection: (direction: DIR) => void;
  spriteRenderer: SpriteRenderer;
  callbacks: SceneCallbacks,
}

export class WinGameScene extends BaseScene {
  private sfx: SFXInstance;
  private spriteRenderer: SpriteRenderer;
  private gameState: GameState;
  private stats: Stats;
  private state: WinGameState = {
    leaderboardResults: [],
    leaderboardToken: '',
    leaderboardLoading: false,
    leaderboardFetchError: '',
    leaderboardPostError: '',
    highscoreEntryName: '',
    bgOpacity: 0,
    stageClearY: STATE_CLEAR_Y_START,
  }

  private onChangePlayerDirection: (direction: DIR) => void = () => { };

  private fieldVisible: boolean[] = [];
  private fieldValue: number[] = [];

  private modalHighScoreEntry = new HighscoreEntryModal();
  private modalConfirm = new Modal();

  constructor({ p5, gfx, gameState, stats, sfx, fonts, onChangePlayerDirection, spriteRenderer, callbacks = {} }: WinGameSceneConstructorArgs) {
    super(p5, gfx, fonts, callbacks)
    this.sfx = sfx;
    this.spriteRenderer = spriteRenderer;
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

  private logError = (err: Error) => {
    console.error(err);
  }

  private fetchHighScores = () => {
    this.state.leaderboardResults = [];
    this.state.leaderboardToken = '';
    this.state.leaderboardLoading = true;
    getLeaderboard()
      .then(results => {
        this.state.leaderboardResults = results;
      })
      .catch((err: Error) => {
        this.logError(err);
        this.state.leaderboardFetchError = 'Could not fetch leaderboard results.';
      })
      .finally(() => {
        this.state.leaderboardLoading = false;
      });

    getToken()
      .then(token => {
        this.state.leaderboardToken = token;
      })
      .catch(this.logError);
  }

  private postLeaderboardResult = (name: string) => {
    const { score } = this.stats;
    if (!this.state.leaderboardToken) {
      this.state.leaderboardPostError = 'Token not provided to postLeaderboardResult.';
      return;
    }
    const apiOptions: ApiOptions = { xsrfToken: this.state.leaderboardToken };
    this.state.leaderboardPostError = ''
    this.state.leaderboardLoading = true;
    postLeaderboardResult(name, score, apiOptions)
      .catch(err => {
        this.logError(err);
        this.state.leaderboardPostError = 'Could not save new leaderboard entry.';
      })
      .finally(() => {
        this.state.leaderboardLoading = false;
      });
  }

  private getHasHighscore = () => {
    const { leaderboardResults } = this.state;
    const isCasualModeEnabled = this.gameState.gameMode === GameMode.Casual
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
    this.initFields();
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
    const isCasualModeEnabled = this.gameState.gameMode === GameMode.Casual
    const { score, numApplesEverEaten, numDeaths, totalGameTimeElapsed: totalTimeElapsed } = this.stats;
    let playingChipSound = ""

    this.hideAllFields();

    this.fieldVisible[FIELD.TITLE] = true;
    this.state.stageClearY = STATE_CLEAR_Y_START;
    sfx.play(Sound.moveStart);
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
        if (numDeaths >= NUM_DEATHS_TO_LOOP_SOUND) {
          playingChipSound = this.startCoroutine(this.playChipSound());
        }
        let prevVal = 0;
        yield* coroutines.waitForTime(700, (t) => {
          const val = Math.floor(p5.lerp(0, numDeaths, t));
          this.fieldValue[FIELD.DEATHS] = val;
          const didChange = val != prevVal;
          if (didChange && numDeaths < NUM_DEATHS_TO_LOOP_SOUND) {
            sfx.play(Sound.uiChip, 0.75);
          }
          prevVal = val;
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
      const modalHighScoreEntry = this.modalHighScoreEntry;
      const modalConfirm = this.modalConfirm;
      const onSubmitHighscoreName = (name: string) => {
        const handleYesClick = () => {
          this.state.highscoreEntryName = name;
          this.postLeaderboardResult(name);
          modalConfirm.hide();
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

    if (this.state.leaderboardFetchError) {
      this.fieldVisible[FIELD.LEADERBOARD_FETCH_ERROR] = true;
    } else {
      this.fieldVisible[FIELD.LEADERBOARD] = true;
      if (this.state.leaderboardPostError) {
        this.fieldVisible[FIELD.LEADERBOARD_POST_ERROR] = true;
      }
      if (this.getHasHighscore()) {
        this.fieldVisible[FIELD.LEADERBOARD_HECK_YEAH] = true;
      } else if (!isCasualModeEnabled) {
        this.fieldVisible[FIELD.LEADERBOARD_NON_QUALIFYING_SCORE] = true;
      }
    }

    yield* coroutines.waitForTime(500);

    yield* coroutines.waitForEnterKey(() => {
      if (this.getHasHighscore() || isCasualModeEnabled) {
        this.drawPressEnter(0.1);
      } else {
        this.drawPressEnter(0.125);
      }
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
    while (true && this.gameState.isGameWon) {
      yield* coroutines.waitForTime(p5.random(20, 400));
      if (this.gameState.timeSinceLastInput > 2000) {
        this.onChangePlayerDirection(indexToDir(p5.random(0, 4)));
      }
      yield null;
    }
  }

  gamepadButtonPressed = (): boolean => {
    if (!this.isShowing()) return false;
    // const state = this.gameState;
    // const isGameOverCobra = state.isLost && state.gameMode === GameMode.Cobra;
    // if (!this.gameState.isGameWon && !isGameOverCobra) return false;
    // if (this.gameState.isLost && !isGameOverCobra) return false;
    if (this.gameState.isExitingLevel) return false;
    if (this.gameState.isExited) return false;
    if (this.gameState.isPaused) return false;
    return applyGamepadUIActions(this.gameState, () => {}, this.onUINavigate, this.onUIInteract, this.onUICancel)
  }

  keyPressed = (): boolean => {
    if (!this.isShowing()) return false;
    return handleUIEvents(this.props.p5, this.onUINavigate, this.onUIInteract, this.onUICancel)
  };

  private onUINavigate = (navDir: UINavDir) => {
    let handled = false;
    if (!handled) handled = this.modalHighScoreEntry.handleUINavigation(navDir);
    if (!handled) handled = this.modalConfirm.handleUINavigation(navDir);
    if (handled) {
      this.sfx.play(Sound.uiBlip, 0.5);
    }
    return handled;
  }
  private onUIInteract = () => {
    let handled = false;
    if (!handled) handled = this.modalHighScoreEntry.handleUIInteract();
    if (!handled) handled = this.modalConfirm.handleUIInteract();
    return handled;
  }
  private onUICancel = () => {
    let handled = false;
    if (!handled) handled = this.modalHighScoreEntry.handleUICancel();
    if (!handled) handled = this.modalConfirm.handleUICancel();
    return handled;
  }

  draw = () => {
    const { p5, gfx } = this.props;
    const { bgOpacity } = this.state;

    if (this.gameState.isLost) {
      const bgColor = (amount = 1) => {
        return p5.lerpColor(p5.color("#00000000"), p5.color("#00000066"), bgOpacity * amount).toString()
      }
      this.drawBackground(bgColor(0.8));
      this.drawBackground(bgColor(1), gfx);
      this.spriteRenderer.drawImage(Image.Darken, 0, 0, gfx, bgOpacity * 0.3);
    } else {
      this.drawBackground(p5.lerpColor(p5.color("#00000000"), p5.color("#00000099"), bgOpacity).toString());
    }

    if (this.fieldVisible[FIELD.TITLE]) {
      const title = (() => {
        if (this.gameState.isLost) return 'GAME OVER';
        if (this.gameState.isGameWon) return 'YOU WIN!';
        return 'GAME STATS';
      })()
      this.drawTitle(title);
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
    } else if (this.fieldVisible[FIELD.LEADERBOARD_FETCH_ERROR]) {
      this.drawTitle("LEADERBOARD", "secondary");
      this.drawParagraph("Unable to fetch leaderboard results.", 0.35, "#e54");
    } else if (this.fieldVisible[FIELD.LEADERBOARD]) {
      this.drawLeaderboard();
      if (this.fieldVisible[FIELD.LEADERBOARD_HECK_YEAH]) {
        this.drawHeckYeah();
      }
      if (this.fieldVisible[FIELD.LEADERBOARD_NON_QUALIFYING_SCORE]) {
        this.drawNonQualifyingScore();
      }
      if (this.fieldVisible[FIELD.LEADERBOARD_POST_ERROR]) {
        this.drawParagraph("Unable to save leaderboard entry.\nSend screenshot to townofdon@gmail.com\nto be added manually :)", 0.05, "#e54");
      }
    }

    this.tick();
  };

  private drawTitle = (title: string, type: 'primary' | 'secondary' = 'primary') => {
    const color = type === "primary" ? ACCENT_COLOR : SECONDARY_ACCENT_COLOR;
    const bgColor = type === "primary" ? "#000" : SECONDARY_ACCENT_COLOR_BG;
    const { p5, gfx, fonts } = this.props;
    gfx.textAlign(p5.CENTER, p5.CENTER);
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke(bgColor)
    gfx.strokeWeight(2 * 4);
    gfx.textSize(2 * 32.5);
    gfx.fill(bgColor);
    gfx.text(title, ...this.getPosition(0.5, 0.21 + this.state.stageClearY));
    gfx.textSize(2 * 32);
    gfx.fill(color);
    gfx.text(title, ...this.getPosition(0.5, 0.2 + this.state.stageClearY));
  }

  private drawParagraph = (message: string, yPos: number, color: string = "#fff") => {
    const { p5, gfx, fonts } = this.props;
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(color);
    gfx.stroke("#000");
    gfx.strokeWeight(2 * 2);
    gfx.textSize(2 * 14);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.text(message, ...this.getPosition(0.5, yPos + this.state.stageClearY));
    // p5.text(message, ...this.getRect(0.5, yPos + this.state.stageClearY, DIMENSIONS.x - 50, 250));
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
    const { p5, gfx, fonts } = this.props;
    const valueDisplay = formatValue ? formatValue(value) : formatNumber(value, {}).trim();
    gfx.textFont(fonts.variants.miniMood);
    gfx.textSize(2 * 14);
    gfx.strokeCap(p5.PROJECT);

    if (bgStrokeSize !== strokeSize) {
      gfx.fill(bgStrokeColor);
      gfx.stroke(bgStrokeColor);
      gfx.strokeWeight(2 * bgStrokeSize);
      gfx.textAlign(p5.RIGHT, p5.TOP);
      gfx.text(label, ...this.getPosition(colLeft, yPos + this.state.stageClearY));
      gfx.textAlign(p5.LEFT, p5.TOP);
      gfx.text(valueDisplay, ...this.getPosition(colRight, yPos + this.state.stageClearY));
    }

    const widths = [0, 0];
    gfx.fill(color0);
    gfx.stroke(bgColor0);
    gfx.strokeWeight(2 * strokeSize);
    gfx.textAlign(p5.RIGHT, p5.TOP);
    gfx.text(label, ...this.getPosition(colLeft, yPos + this.state.stageClearY));
    if (measureWidths) widths[0] = gfx.textWidth(label);

    gfx.fill(color1);
    gfx.stroke(bgColor1);
    gfx.strokeWeight(2 * strokeSize);
    gfx.textAlign(p5.LEFT, p5.TOP);
    gfx.text(valueDisplay, ...this.getPosition(colRight, yPos + this.state.stageClearY));
    if (measureWidths) widths[1] = gfx.textWidth(valueDisplay);
    return widths;
  }

  private drawHasHighscore = (yPos: number) => {
    const { p5, gfx, fonts } = this.props;
    const { timeElapsed } = this.gameState;
    const t = (timeElapsed / HIGHSCORE_GRADIENT_CYCLE_TIME_MS) % 1;
    const color = this.getColor(t, NEW_HIGHSCORE_COLORS);
    gfx.fill(color);
    gfx.stroke(Color(color).darken(0.4).hex());
    gfx.textFont(fonts.variants.miniMood);
    gfx.strokeWeight(2 * 2);
    gfx.textSize(2 * 14);
    gfx.textAlign(p5.LEFT, p5.TOP);
    gfx.text("NEW HIGHSCORE", ...this.getPosition(COL_RIGHT, yPos + this.state.stageClearY - 0.05));
  }

  private drawNewLabel = (x: number, y: number, align: P5.HORIZ_ALIGN = 'left') => {
    const { p5, gfx, fonts } = this.props;
    const { timeElapsed } = this.gameState;
    const t = (timeElapsed / HIGHSCORE_GRADIENT_CYCLE_TIME_MS) % 1;
    const color = this.getColor(t, NEW_HIGHSCORE_COLORS);
    // gfx.fill("#fff");
    gfx.fill(color);
    gfx.stroke(Color(color).darken(0.4).hex());
    gfx.textFont(fonts.variants.miniMood);
    gfx.strokeWeight(2 * 2);
    gfx.textSize(2 * 12);
    gfx.textAlign(align, p5.TOP);
    // gfx.text(align === p5.RIGHT ? ">>>" : "<<<", ...this.getPosition(x, y));
    gfx.text("NEW!", ...this.getPosition(x, y));
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
    const { timeElapsed } = this.gameState;
    const isCasualModeEnabled = this.gameState.gameMode === GameMode.Casual
    const { score } = this.stats;
    const newResult: HighScoreEntry = {
      id: "123",
      name: this.state.highscoreEntryName,
      score: isCasualModeEnabled ? 0 : score,
    }
    const newResults = isCasualModeEnabled
      ? this.state.leaderboardResults
      : this.state.leaderboardResults.concat(newResult).sort((a, b) => {
        const diff = a.score - b.score;
        if (diff === 0) return -1;
        return diff;
      }).reverse();

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

  private drawNonQualifyingScore = () => {
    const { p5, gfx } = this.props;
    const { score } = this.stats;
    const { timeElapsed } = this.gameState;
    const name = "YOUR SCORE"
    const yPos = 0.85;
    const fieldOptions = {
      strokeSize: 5,
      bgStrokeSize: 10,
      colLeft: 0.54,
      colRight: 0.58,
    }
    const t = (timeElapsed / HIGHSCORE_GRADIENT_CYCLE_TIME_MS) % 1;
    const color0 = this.getColor(t, NEW_HIGHSCORE_COLORS);
    this.drawField(name, score, yPos, {
      color0: color0,
      color1: 'black',
      bgColor0: 'black',
      bgColor1: color0,
      bgStrokeColor: color0,
      bgStrokeSize: 15,
      ...fieldOptions,
    });
    const drawLine = (yPos: number, color: string, strokeWeight = 2) => {
      const [x0, y0, x1, y1] = this.getRect(0.5, yPos, 2 * 300, 0);
      gfx.stroke(color);
      gfx.strokeWeight(2 * strokeWeight);
      gfx.line(x0, y0, x1, y1);
    }
    drawLine(0.8265, "black", 4);
    drawLine(0.8235, "#ffffffee");
  }

  protected override getRect = (x: number, y: number, width: number, height: number): [number, number, number, number] => {
    const x1 = DIMENSIONS.x * x - width / 2;
    const y1 = DIMENSIONS.y * y - height / 2;
    const x2 = x1 + width;
    const y2 = y1 + height;
    return [x1, y1, x2, y2];
  }

  private drawHeckYeah = () => {
    const { p5, gfx, fonts } = this.props;
    gfx.push();
    gfx.translate(...this.getPosition(0.8, 0.25 + this.state.stageClearY));
    gfx.rotate(-0.05 * Math.PI);
    gfx.fill(ACCENT_COLOR);
    gfx.stroke(Color(ACCENT_COLOR).darken(0.8).hex());
    gfx.textFont(fonts.variants.miniMood);
    gfx.strokeWeight(2 * 5);
    gfx.textSize(2 * 12);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.textStyle(p5.BOLD);
    gfx.text("S N E K   Y E A H !", 0, 0);
    gfx.textStyle(p5.NORMAL);
    gfx.pop();
  }

  private drawPressEnter = (addY = 0) => {
    const { p5, gfx, fonts } = this.props;
    gfx.fill('#fff');
    gfx.stroke("#000");
    gfx.textFont(fonts.variants.miniMood);
    gfx.strokeWeight(2 * 5);
    gfx.textSize(2 * 14);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.fill('#fff');
    gfx.text('[PRESS ENTER TO CONTINUE]', ...this.getPosition(0.5, 0.8 + addY));
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
