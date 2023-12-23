import P5 from "p5";
import { DIR, FontsInstance, GameState, IEnumerator, SFXInstance, SceneCallbacks, Sound, Stats } from "../types";
import { BaseScene } from "./BaseScene";
import { Easing } from "../easing";
import { ACCENT_COLOR } from "../constants";
import { indexToDir } from "../utils";

const STATE_CLEAR_Y_START = -1; // normalized position

enum FIELD {
  TITLE = 0,
  POINTS = 10,
  _IS_HIGHSCORE = 11,
  APPLES = 20,
  DEATHS = 30,
  TIME = 40,
}

interface WinGameState {
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

  private fetchHighScores = () => {
    const { isCasualModeEnabled } = this.gameState;
    // set loading
    // fetch leaderboard
    // set leaderboard result
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

    // show YOU WIN!
    this.state.stageClearY = STATE_CLEAR_Y_START;
    this.fieldVisible[FIELD.TITLE] = true;
    yield* coroutines.waitForTime(600, (t) => {
      this.state.bgOpacity = t;
      this.state.stageClearY = p5.lerp(STATE_CLEAR_Y_START, 0, Easing.inOutCubic(t));
    });

    yield* coroutines.waitForTime(500);

    // show points
    // - show NEW HIGHSCORE if new highscore
    let playingChipSound = ""

    if (!isCasualModeEnabled) {
      this.fieldVisible[FIELD.POINTS] = true;
      sfx.play(Sound.xplode);
      yield* coroutines.waitForTime(200);
      playingChipSound = this.startCoroutine(this.playChipSound());
      yield* coroutines.waitForTime(700, (t) => {
        this.fieldValue[FIELD.POINTS] = p5.lerp(0, score, t);
      });
      this.stopCoroutine(playingChipSound);
      yield* coroutines.waitForTime(500);
    }

    this.fieldVisible[FIELD.APPLES] = true;
    sfx.play(Sound.xplode);
    yield* coroutines.waitForTime(200);
    playingChipSound = this.startCoroutine(this.playChipSound());
    yield* coroutines.waitForTime(700, (t) => {
      this.fieldValue[FIELD.APPLES] = p5.lerp(0, numApplesEverEaten, t);
    });
    this.stopCoroutine(playingChipSound);
    yield* coroutines.waitForTime(500);

    if (!isCasualModeEnabled) {
      this.fieldVisible[FIELD.DEATHS] = true;
      sfx.play(Sound.xplode);
      yield* coroutines.waitForTime(200);
      playingChipSound = this.startCoroutine(this.playChipSound());
      yield* coroutines.waitForTime(700, (t) => {
        this.fieldValue[FIELD.DEATHS] = p5.lerp(0, numDeaths, t);
      });
      this.stopCoroutine(playingChipSound);
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

    yield* coroutines.waitForTime(1000);

    yield* coroutines.waitForEnterKey(() => {
      this.drawPressEnter();
    })

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

    if (this.fieldVisible[FIELD.APPLES]) {
      this.drawField("APPLES", this.fieldValue[FIELD.APPLES], y);
      y += fieldPadding;
    }

    if (this.fieldVisible[FIELD.DEATHS]) {
      this.drawField("DEATHS", this.fieldValue[FIELD.DEATHS], y);
      y += fieldPadding;
    }

    if (this.fieldVisible[FIELD.TIME]) {
      this.drawField("TIME", this.fieldValue[FIELD.TIME], y, this.getTimeDisplay);
      y += fieldPadding;
    }

    this.tick();
  };

  private drawTitle = () => {
    const { p5, fonts } = this.props;
    const title = "YOU WIN!"
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.stroke("#000")
    p5.strokeWeight(4);
    p5.textSize(32.5);
    p5.fill('#000');
    p5.text(title, ...this.getPosition(0.5, 0.21 + this.state.stageClearY));
    p5.textSize(32);
    p5.fill(ACCENT_COLOR);
    p5.text(title, ...this.getPosition(0.5, 0.2 + this.state.stageClearY));
  }

  private drawField = (label: string, value: number, yPos: number, formatValue?: (value: number) => string) => {
    const { p5, fonts } = this.props;
    const valueDisplay = formatValue ? formatValue(value) : value.toFixed(0);

    p5.textFont(fonts.variants.miniMood);
    p5.fill(ACCENT_COLOR);
    p5.stroke("#000")
    p5.strokeWeight(2);
    p5.textSize(14);
    p5.textAlign(p5.RIGHT, p5.TOP);
    p5.text(label, ...this.getPosition(0.45, yPos + this.state.stageClearY));

    p5.fill('#fff');
    p5.stroke("#000")
    p5.strokeWeight(2);
    p5.textSize(14);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(valueDisplay, ...this.getPosition(0.55, yPos + this.state.stageClearY));
  }

  private drawPressEnter = () => {
    const { p5, fonts } = this.props;
    p5.fill('#fff');
    p5.noStroke();
    p5.textFont(fonts.variants.miniMood);
    p5.textSize(14);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.fill('#fff');
    p5.text('[PRESS ENTER TO CONTINUE]', ...this.getPosition(0.5, 0.8));
  }

  private getTimeDisplay = (valueMs: number): string => {
    const milliseconds = Math.floor(valueMs % 1000);
    const seconds = Math.floor(valueMs / 1000) % 60;
    const minutes = Math.floor(valueMs / 1000 / 60 % 60);
    const hours = Math.floor(valueMs / 1000 / 60 / 60);
    const pad = (value: number, numberOfDigits = 2) => String(value).padStart(numberOfDigits, "0");
    if (hours <= 0) {
      return `${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
  }
}
