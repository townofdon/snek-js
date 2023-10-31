import P5, { Vector } from "p5";
import { DIR, FontsInstance, GameState, Portal, Replay, ReplayMode, ScreenShakeState } from "./types";
import { BLOCK_SIZE, HURT_STUN_TIME, PORTAL_CHANNEL_COLORS, PORTAL_FADE_DURATION, PORTAL_INDEX_DELAY, STROKE_SIZE } from "./constants";
import { oscilateLinear } from "./utils";

interface RendererConstructorProps {
  p5: P5
  fonts: FontsInstance
  replay: Replay
  state: GameState
  screenShake: ScreenShakeState
}

export class Renderer {
  props: RendererConstructorProps = {
    p5: null,
    fonts: null,
    replay: null,
    state: null,
    screenShake: null,
  }
  elapsed = 0

  constructor(props: RendererConstructorProps) {
    this.props = props;
  }

  reset = () => {
    this.elapsed = 0;
  }

  tick = () => {
    this.elapsed += this.props.p5.deltaTime;
  }

  /**
   * Draw a square to the canvas
   */
  drawSquare = (x: number, y: number, background = "pink", lineColor = "fff", strokeSize = STROKE_SIZE) => {
    const { p5, screenShake } = this.props;
    p5.fill(background);
    p5.stroke(lineColor);
    p5.strokeWeight(strokeSize);
    const position = {
      x: x * BLOCK_SIZE.x + screenShake.offset.x,
      y: y * BLOCK_SIZE.y + screenShake.offset.y,
    }
    const size = BLOCK_SIZE.x - strokeSize;
    p5.square(position.x, position.y, size);
  }

  /**
   * Draw red squares on level to indicate that we are in Record mode
   */
  drawCaptureMode = () => {
    const reds: [number, number][] = [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 28],
      [0, 29],
      [1, 29],
      [28, 29],
      [29, 28],
      [29, 29],
      [28, 0],
      [29, 0],
      [29, 1],
    ];
    for (let i = 0; i < reds.length; i++) {
      this.drawSquare(reds[i][0], reds[i][1], "#f00", "#f00");
    }
  }

  /**
   * Draw move arrows when player is not moving, or when player is hurt
   */
  drawPlayerMoveArrows = (vec: Vector, currentMove: DIR) => {
    const { p5, fonts, replay, state, screenShake } = this.props;

    if (replay.mode === ReplayMode.Playback) return;

    const isWaitingToStartMoving = state.isGameStarted && !state.isMoving;
    const isStunned = state.timeSinceHurt < HURT_STUN_TIME;
    if (!isWaitingToStartMoving && !isStunned) return;

    if (isStunned) {
      const freq = .2;
      const t = state.timeSinceHurt / HURT_STUN_TIME;
      const shouldShow = t % freq > freq * 0.5;
      if (!shouldShow) return;
    }

    const dir = currentMove;
    type ArrowBlock = { x: number, y: number, text: string, show: boolean }
    const arrowBlocks: ArrowBlock[] = [
      { x: vec.x, y: vec.y - 1, text: 'P', show: !isStunned || dir === DIR.UP },
      { x: vec.x, y: vec.y + 1, text: 'Q', show: !isStunned || dir === DIR.DOWN },
      { x: vec.x - 1, y: vec.y, text: 'N', show: !isStunned || dir === DIR.LEFT },
      { x: vec.x + 1, y: vec.y, text: 'O', show: !isStunned || dir === DIR.RIGHT },
    ]
    for (let i = 0; i < arrowBlocks.length; i++) {
      const arrow = arrowBlocks[i];
      if (!arrow.show) continue;
      const position = {
        x: arrow.x * BLOCK_SIZE.x + BLOCK_SIZE.x * 0.4 + screenShake.offset.x,
        y: arrow.y * BLOCK_SIZE.y + BLOCK_SIZE.y * 0.35 + screenShake.offset.y,
      }
      p5.fill("#fff");
      p5.stroke("#000");
      p5.strokeWeight(4);
      p5.textSize(12);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textFont(fonts.variants.zicons);
      p5.text(arrow.text, position.x, position.y);
    }
  }

  /**
   * Draw portal
   */
  drawPortal(portal: Portal, showDeathColours: boolean) {
    if (!portal) return;
    const { p5 } = this.props;
    const delay = portal.index * PORTAL_INDEX_DELAY;
    const t1 = oscilateLinear((this.elapsed + delay) / (PORTAL_FADE_DURATION));
    const t2 = oscilateLinear((this.elapsed + delay) / (PORTAL_FADE_DURATION * 0.5));
    const accent = showDeathColours ? "#ccc" : PORTAL_CHANNEL_COLORS[portal.channel];
    const background = showDeathColours ? "#555" : p5.lerpColor(p5.color("#000000"), p5.color(accent), t2).toString();
    const color = p5.lerpColor(p5.color(accent), p5.color("#000"), t1).toString();
    this.drawSquare(portal.position.x, portal.position.y, background, color);
  }
}
