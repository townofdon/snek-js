import P5, { Vector } from "p5";
import { AppMode, DIR, FontsInstance, GameState, HitType, Image, Portal, Replay, ReplayMode, ScreenShakeState, Tutorial } from "./types";
import { ACCENT_COLOR, BLOCK_SIZE, GRIDCOUNT, HURT_STUN_TIME, PORTAL_CHANNEL_COLORS, PORTAL_FADE_DURATION, PORTAL_INDEX_DELAY, SECONDARY_ACCENT_COLOR, SECONDARY_ACCENT_COLOR_BG, STROKE_SIZE } from "./constants";
import { clamp, oscilateLinear } from "./utils";
import { SpriteRenderer } from "./spriteRenderer";

interface RendererConstructorProps {
  p5: P5
  fonts: FontsInstance
  replay: Replay
  gameState: GameState
  screenShake: ScreenShakeState
  spriteRenderer: SpriteRenderer
  tutorial: Tutorial
}

export class Renderer {
  props: RendererConstructorProps = {
    p5: null,
    fonts: null,
    replay: null,
    gameState: null,
    screenShake: null,
    spriteRenderer: null,
    tutorial: null,
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
    const { p5, fonts, replay, gameState, screenShake } = this.props;

    if (replay.mode === ReplayMode.Playback) return;

    const isWaitingToStartMoving = gameState.isGameStarted && !gameState.isMoving;
    const isStunned = gameState.timeSinceHurt < HURT_STUN_TIME;
    if (!isWaitingToStartMoving && !isStunned) return;

    if (isStunned) {
      const freq = .2;
      const t = gameState.timeSinceHurt / HURT_STUN_TIME;
      const shouldShow = t % freq > freq * 0.5;
      if (!shouldShow) return;
    }

    const dir = currentMove;
    type ArrowBlock = { x: number, y: number, text: string, show: boolean }
    const dist = 1.25;
    const arrowBlocks: ArrowBlock[] = [
      { x: vec.x, y: vec.y - dist, text: 'P', show: !isStunned || dir === DIR.UP },
      { x: vec.x, y: vec.y + dist, text: 'Q', show: !isStunned || dir === DIR.DOWN },
      { x: vec.x - dist, y: vec.y, text: 'N', show: !isStunned || dir === DIR.LEFT },
      { x: vec.x + dist, y: vec.y, text: 'O', show: !isStunned || dir === DIR.RIGHT },
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

  drawTutorialMoveControls = () => {
    const { p5, fonts, replay, gameState, tutorial, spriteRenderer } = this.props;

    if (!tutorial.needsMoveControls) return;
    if (replay.mode === ReplayMode.Playback) return;

    const isWaitingToStartMoving = gameState.isGameStarted && !gameState.isMoving;
    const isStunned = gameState.timeSinceHurt < HURT_STUN_TIME;
    if (!isWaitingToStartMoving && !isStunned) return;

    // banner background
    const bannerHeight = 4;
    const bannerCenter = {
      x: GRIDCOUNT.x * .5,
      y: GRIDCOUNT.y * .5,
    };
    const x0 = BLOCK_SIZE.x * (bannerCenter.x - 5);
    const x1 = BLOCK_SIZE.x * (bannerCenter.x + 4);
    const y0 = BLOCK_SIZE.y * (bannerCenter.y - bannerHeight * 0.5);
    const y1 = BLOCK_SIZE.y * (bannerCenter.y + bannerHeight * 0.5);
    p5.fill('#000000aa');
    p5.stroke("#000");
    p5.strokeWeight(STROKE_SIZE);
    p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // text
    const textX = BLOCK_SIZE.x * (bannerCenter.x + 0.8);
    const textY = BLOCK_SIZE.y * (bannerCenter.y + bannerHeight * 0.5 - 1.35);
    p5.fill(ACCENT_COLOR);
    p5.stroke("#111");
    p5.strokeWeight(4);
    p5.textSize(12);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.text("MOVE", textX, textY);
    // image
    const imgX = BLOCK_SIZE.x * (bannerCenter.x - 4.5);
    const imgY = BLOCK_SIZE.y * (bannerCenter.y - bannerHeight * 0.5 + 0.4);
    spriteRenderer.drawImage(Image.ControlsKeyboardMove, imgX, imgY);
  }

  drawTutorialRewindControls = (playerPosition: Vector, canRewind: () => boolean) => {
    const { p5, fonts, replay, gameState, tutorial, spriteRenderer } = this.props;

    const hasNeverBeenHurt = gameState.lastHurtBy === HitType.Unknown;
    if (hasNeverBeenHurt) return;
    if (tutorial.needsMoveControls) return;
    if (!tutorial.needsRewindControls) return;
    if (gameState.isRewinding) return;
    if (replay.mode === ReplayMode.Playback) return;

    const isWaitingToStartMoving = gameState.isGameStarted && !gameState.isMoving;
    const isStunned = gameState.timeSinceHurt < HURT_STUN_TIME;
    if (!isWaitingToStartMoving && !isStunned) return;

    if (!canRewind()) return;

    // banner background
    const bannerWidth = 7;
    const bannerHeight = 3;
    const bannerPosition = {
      x: playerPosition.x,
      y: playerPosition.y - 1 - bannerHeight,
    };
    const bounds = {
      min: {
        x: 1,
        y: 4,
      },
      max: {
        x: GRIDCOUNT.x - bannerWidth - 1,
        y: GRIDCOUNT.y - bannerHeight - 1,
      },
    }
    bannerPosition.x = clamp(bannerPosition.x, bounds.min.x, bounds.max.x);
    bannerPosition.y = clamp(bannerPosition.y, bounds.min.y, bounds.max.y);
    const x0 = BLOCK_SIZE.x * (bannerPosition.x);
    const x1 = BLOCK_SIZE.x * (bannerPosition.x + bannerWidth);
    const y0 = BLOCK_SIZE.y * (bannerPosition.y);
    const y1 = BLOCK_SIZE.y * (bannerPosition.y + bannerHeight);
    p5.fill('#000000aa');
    p5.stroke("#000");
    p5.strokeWeight(STROKE_SIZE);
    p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // text
    const textX = BLOCK_SIZE.x * (bannerPosition.x + 3);
    const textY = BLOCK_SIZE.y * (bannerPosition.y + bannerHeight * 0.5);
    p5.fill("#fff");
    p5.stroke("#111");
    p5.strokeWeight(4);
    p5.textSize(12);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.text("REWIND", textX, textY);
    // image
    const imgX = BLOCK_SIZE.x * (bannerPosition.x + 0.6);
    const imgY = BLOCK_SIZE.y * (bannerPosition.y + 0.6);
    spriteRenderer.drawImage(Image.ControlsKeyboardDelete, imgX, imgY);
  }

  /**
   * Draw portal
   */
  drawPortal = (portal: Portal, showDeathColours: boolean) => {
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
