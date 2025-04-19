import P5 from "p5";
import Color from "color";
import formatNumberFn from 'format-number'

import { FontsInstance, SFXInstance, SceneCallbacks, Sound } from "../types";
import { BaseScene } from "./BaseScene";
import { Easing } from "../easing";
import { ACCENT_COLOR, SECONDARY_ACCENT_COLOR, SECONDARY_ACCENT_COLOR_BG } from "../constants";
import { HighScoreEntry, getLeaderboard } from "../api/leaderboard";
import { inverseLerp } from "../utils";

const formatNumber = formatNumberFn({
  truncate: 0,
  decimalsSeparator: '.',
  integerSeparator: ' ',
});

const STATE_CLEAR_Y_START = -1; // normalized position
const SHIMMER_CYCLE_TIME = 3500;
const SHIMMER_OFFSET = 0.8;
const COL_LEFT = 0.48;
const COL_RIGHT = 0.52;

const LEADERBOARD_COLORS = [
  "#FFB41F",
  "#24E3AF",
  "#15C2CB",
  "#448ae3",
  // "#6571e6"
  // "#833AB4",
];

interface WinGameState {
  leaderboardResults: HighScoreEntry[],
  leaderboardLoading: boolean,
  leaderboardError: string,
  bgOpacity: number,
  stageClearY: number,
  t: number,
  isActive: boolean,
}

export interface LeaderboardSceneConstructorArgs {
  p5: P5,
  gfx: P5.Graphics,
  sfx: SFXInstance,
  fonts: FontsInstance,
  callbacks: SceneCallbacks,
}

export class LeaderboardScene extends BaseScene {
  private sfx: SFXInstance;
  private state: WinGameState = {
    leaderboardResults: [],
    leaderboardLoading: false,
    leaderboardError: '',
    bgOpacity: 0,
    stageClearY: STATE_CLEAR_Y_START,
    t: 0,
    isActive: false,
  }

  constructor({ p5, gfx, sfx, fonts, callbacks = {} }: LeaderboardSceneConstructorArgs) {
    super(p5, gfx, fonts, callbacks)
    this.sfx = sfx;
  }

  private fetchHighScores = async () => {
    try {
      this.state.leaderboardLoading = true;
      this.state.leaderboardError = '';
      const results = await getLeaderboard();
      this.state.leaderboardResults = results;

    } catch (err) {
      this.state.leaderboardError = 'Could not fetch leaderboard results.';
    } finally {
      this.state.leaderboardLoading = false;
    }
  }

  onLeaderboardShown = () => {}
  beforeGotoNextLevel = () => { };

  private reset = () => {
    this.state.stageClearY = STATE_CLEAR_Y_START;
    this.state.bgOpacity = 1;
    this.state.t = 0;
    this.state.isActive = false;
    this.stopAllCoroutines();
  }

  trigger = (onLeaderboardShown: () => void) => {
    this.reset();
    this.state.isActive = true;
    this.onLeaderboardShown = onLeaderboardShown;
    this.fetchHighScores();
    this.startActionsNoBind();
  }

  *action() {
    const { p5, coroutines } = this.props;
    const sfx = this.sfx;

    sfx.play(Sound.doorOpen);

    this.state.stageClearY = STATE_CLEAR_Y_START;
    this.state.bgOpacity = 1;
    while (this.state.leaderboardLoading) {
      yield null;
    }

    sfx.play(Sound.moveStart);
    yield* coroutines.waitForTime(600, (t) => {
      // this.state.bgOpacity = t;
      this.state.stageClearY = p5.lerp(STATE_CLEAR_Y_START, 0, Easing.inOutCubic(t));
    });

    this.onLeaderboardShown();
    sfx.play(Sound.xpound);
    yield* coroutines.waitForTime(500);

    yield* coroutines.waitForAnyKey(() => {
      this.drawPressAnyKey(0.1);
    });

    this.reset();
    this.cleanup();
  }

  keyPressed = () => { };

  draw = () => {
    if (!this.state.isActive) return;
    const { p5 } = this.props;
    const { bgOpacity } = this.state;

    this.drawBackground(p5.lerpColor(p5.color("#00000000"), p5.color("#00000099"), bgOpacity).toString(), this.props.gfx);
    this.drawTitle();

    if (this.state.leaderboardLoading) {
      this.drawParagraph("Loading...", 0.3, undefined, 0);
    } else if (this.state.leaderboardError) {
      this.drawParagraph("Unable to fetch leaderboard results.", 0.35, "#e54");
    } else {
      this.drawLeaderboard();
    }

    this.tick();
    this.state.t += p5.deltaTime;
  };

  private drawTitle = () => {
    const title = 'LEADERBOARD!';
    const color = SECONDARY_ACCENT_COLOR;
    const bgColor = SECONDARY_ACCENT_COLOR_BG;
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

  private drawParagraph = (message: string, yPos: number, color: string = "#fff", yMod = 1) => {
    const { p5, gfx, fonts } = this.props;
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(color);
    gfx.stroke("#000");
    gfx.strokeWeight(2 * 2);
    gfx.textSize(2 * 14);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.text(message, ...this.getPosition(0.5, yPos + this.state.stageClearY * yMod));
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
    const t0 = inverseLerp(SHIMMER_OFFSET, 1, (this.state.t / SHIMMER_CYCLE_TIME) % 1, false);
    const fieldOptions = {
      strokeSize: 5,
      bgStrokeSize: 10,
      colLeft: 0.54,
      colRight: 0.58,
    }
    const fieldPadding = 0.05;
    let y = 0.325;
    for (let i = 0; i < this.state.leaderboardResults.length && i < 10; i++) {
      const result = this.state.leaderboardResults[i];
      const t = Easing.inOutQuad(i / (this.state.leaderboardResults.length - 1)) / LEADERBOARD_COLORS.length * (LEADERBOARD_COLORS.length - 1);
      const shimmer: boolean = i === Math.floor(t0 * this.state.leaderboardResults.length);
      const color0 = shimmer ? "#fff" : this.getColor(t, LEADERBOARD_COLORS);
      const color1 = shimmer ? "#ccc" : "#fff";
      this.drawField(result.name, result.score, y, {
        color0: color0,
        bgColor0: Color(color0).darken(0.8).hex(),
        color1: color1,
        ...fieldOptions,
      });
      y += fieldPadding;
    }
  }

  private drawPressAnyKey = (addY = 0) => {
    const { p5, gfx, fonts } = this.props;
    gfx.fill('#fff');
    gfx.stroke("#000");
    gfx.textFont(fonts.variants.miniMood);
    gfx.strokeWeight(2 * 5);
    gfx.textSize(2 * 14);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.fill('#fff');
    gfx.text('[PRESS ANY KEY]', ...this.getPosition(0.5, 0.8 + addY));
  }
}
