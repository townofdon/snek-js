import P5, { Vector } from "p5";
import Color from "color";

import {
  DIR,
  DrawSquareOptions,
  FontsInstance,
  GameMode,
  GameState,
  HitType,
  IRenderer,
  Image,
  Portal,
  PortalChannel,
  Replay,
  ReplayMode,
  ScreenShakeState,
  Tutorial,
} from "./types";
import {
  ACCENT_COLOR,
  BLOCK_SIZE,
  DIMENSIONS,
  GRIDCOUNT,
  HURT_STUN_TIME,
  INVALID_PORTAL_COLOR,
  NUM_PORTAL_GRADIENT_COLORS,
  PORTAL_CHANNEL_COLORS,
  PORTAL_FADE_DURATION,
  PORTAL_INDEX_DELAY,
  SHOW_FPS,
  STROKE_SIZE,
} from "./constants";
import { clamp, lerp, oscilateLinear } from "./utils";
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

export class Renderer implements IRenderer {
  private p5: P5 = null;
  private fonts: FontsInstance = null;
  private replay: Replay = null;
  private gameState: GameState = null;
  private screenShake: ScreenShakeState = null
  private spriteRenderer: SpriteRenderer = null
  private tutorial: Tutorial = null;

  private elapsed = 0;
  private lightColorMap: Record<string, string> = {};
  private darkColorMap: Record<string, string> = {};

  private portalCachedColorsFG: string[][] = [];
  private portalCachedColorsBG: string[][] = [];
  private cachedP5Colors: Record<string, P5.Color> = {};

  private isStaticCached = false;

  constructor(props: RendererConstructorProps) {
    this.p5 = props.p5;
    this.fonts = props.fonts;
    this.replay = props.replay;
    this.gameState = props.gameState;
    this.screenShake = props.screenShake;
    this.spriteRenderer = props.spriteRenderer;
    this.tutorial = props.tutorial;
  }

  reset = () => {
    this.elapsed = 0;
    this.isStaticCached = false;
    this.spriteRenderer.setIsStaticCached(false);
  }

  tick = () => {
    this.elapsed += this.p5.deltaTime;
  }

  // Static gfx (e.g. barriers) are cached in an OffscreenCanvas and re-drawn if things change (e.g. due to screen shake)
  // See: P5.createGraphics - see: https://p5js.org/reference/#/p5/createGraphics
  drawStaticGraphics = (gfx: P5.Graphics) => {
    this.p5.image(gfx, 0, 0, DIMENSIONS.x, DIMENSIONS.y);
    this.isStaticCached = true;
    this.spriteRenderer.setIsStaticCached(true);
  }

  setStaticCacheFlags = () => {
    this.isStaticCached = true;
    this.spriteRenderer.setIsStaticCached(true);
  }

  invalidateStaticCache = () => {
    this.isStaticCached = false;
    this.spriteRenderer.setIsStaticCached(false);
  }

  getIsStaticCached = () => this.isStaticCached;

  drawBackground = (color: string, graphicsBG: P5.Graphics, graphicsFG: P5.Graphics) => {
    this.p5.clear(0, 0, 0, 0);
    if (!this.isStaticCached) {
      graphicsBG.background(color);
      graphicsFG.clear(0, 0, 0, 0);
    }
  }

  clearGraphicalComponent = (component: P5.Graphics) => {
    component.clear(0, 0, 0, 0);
  }

  drawGraphicalComponent = (component: P5.Graphics, x: number, y: number, alpha = 1, screenshakeMul = 1) => {
    this.drawGraphicalComponentImpl(this.p5, component, x, y, alpha, screenshakeMul);
  }

  drawGraphicalComponentCustom = (gfx: P5.Graphics, component: P5.Graphics, x: number, y: number, alpha = 1, screenshakeMul = 0) => {
    this.drawGraphicalComponentImpl(gfx, component, x, y, alpha, screenshakeMul);
  }

  drawGraphicalComponentStatic = (gfx: P5.Graphics, component: P5.Graphics, x: number, y: number, alpha = 1, screenshakeMul = 0) => {
    if (this.isStaticCached) return;
    this.drawGraphicalComponentImpl(gfx, component, x, y, alpha, screenshakeMul);
  }

  private drawGraphicalComponentImpl = (gfx: P5 | P5.Graphics, component: P5.Graphics, x: number, y: number, alpha = 1, screenshakeMul = 1) => {
    const offset = -STROKE_SIZE * 0.5;
    const sizeOffset = STROKE_SIZE;
    // destination
    const dx = x * BLOCK_SIZE.x + this.screenShake.offset.x * screenshakeMul + offset;
    const dy = y * BLOCK_SIZE.y + this.screenShake.offset.y * screenshakeMul + offset;
    // source
    const sx = 1 * BLOCK_SIZE.x + offset;
    const sy = 1 * BLOCK_SIZE.y + offset;
    gfx.tint(255, 255, 255, lerp(0, 255, alpha));
    gfx.image(
      component,
      dx,
      dy,
      BLOCK_SIZE.x + sizeOffset,
      BLOCK_SIZE.y + sizeOffset,
      sx,
      sy,
      BLOCK_SIZE.x + sizeOffset,
      BLOCK_SIZE.y + sizeOffset,
      this.p5.COVER,
      this.p5.LEFT,
      this.p5.TOP
    );
    gfx.tint(255, 255, 255, 255);
  }

  /**
   * Draw a square to the canvas
   */
  drawSquare = (x: number, y: number, background = "pink", lineColor = "fff", options: DrawSquareOptions) => {
    this.drawSquareImpl(this.p5, x, y, background, lineColor, options);
  }

  drawSquareStatic = (gfx: P5.Graphics, x: number, y: number, background = "pink", lineColor = "fff", options: DrawSquareOptions) => {
    if (this.isStaticCached) return;
    this.drawSquareImpl(gfx, x, y, background, lineColor, options);
  }

  drawSquareCustom = (component: P5 | P5.Graphics, x: number, y: number, background = "pink", lineColor = "fff", options: DrawSquareOptions) => {
    this.drawSquareImpl(component, x, y, background, lineColor, options);
  }

  private drawSquareImpl = (gfx: P5 | P5.Graphics, x: number, y: number, background = "pink", lineColor = "fff", {
    is3d = false,
    size = 1,
    strokeSize = STROKE_SIZE,
    optimize = false,
    screenshakeMul = 1,
  }: DrawSquareOptions) => {
    this.p5CachedFill(gfx, background, optimize);
    this.p5CachedStroke(gfx, lineColor, optimize);
    gfx.strokeWeight(strokeSize);
    const strokeOffset = STROKE_SIZE - strokeSize;
    const sizeOffsetX = (1 - size) * BLOCK_SIZE.x * 0.5;
    const sizeOffsetY = (1 - size) * BLOCK_SIZE.y * 0.5;
    const px = (x * BLOCK_SIZE.x + this.screenShake.offset.x * screenshakeMul + strokeOffset) + sizeOffsetX;
    const py = (y * BLOCK_SIZE.y + this.screenShake.offset.y * screenshakeMul + strokeOffset) + sizeOffsetY;
    const squareSize = (BLOCK_SIZE.x - strokeSize - strokeOffset * 2) * size;
    gfx.square(px, py, squareSize);
    if (is3d) {
      const borderSize = STROKE_SIZE * 0.5;
      const x0 = x * BLOCK_SIZE.x - strokeSize * 0.5 + this.screenShake.offset.x * screenshakeMul + strokeOffset + sizeOffsetX;
      const y0 = y * BLOCK_SIZE.y - strokeSize * 0.5 + this.screenShake.offset.y * screenshakeMul + strokeOffset + sizeOffsetY;
      const x1 = x0 + (BLOCK_SIZE.x * size) - strokeOffset;
      const y1 = y0 + (BLOCK_SIZE.y * size) - strokeOffset;
      const x0i = x0 + borderSize;
      const y0i = y0 + borderSize;
      const x1i = x1 - borderSize;
      const y1i = y1 - borderSize;
      gfx.noStroke();
      this.p5CachedFill(gfx, this.getBorderColor(lineColor, 'light'), optimize);
      // TOP
      gfx.quad(x0, y0, x1, y0, x1, y0i, x0, y0i);
      // RIGHT
      gfx.quad(x1, y0, x1, y1, x1i, y1, x1i, y0);
      this.p5CachedFill(gfx, this.getBorderColor(lineColor, 'dark'), optimize);
      // BOTTOM
      gfx.quad(x0, y1i, x1, y1i, x1, y1, x0, y1);
      // LEFT
      gfx.quad(x0, y0, x0i, y0, x0i, y1, x0, y1);
    }
  }

  drawSquareBorder = (x: number, y: number, mode: 'light' | 'dark', strokeColor: string, overrideColor = false, screenshakeMul = 1) => {
    this.drawSquareBorderImpl(this.p5, x, y, mode, strokeColor, overrideColor, screenshakeMul);
  }

  drawSquareBorderStatic = (gfx: P5.Graphics, x: number, y: number, mode: 'light' | 'dark', strokeColor: string, overrideColor = false, screenshakeMul = 0) => {
    if (this.isStaticCached) return;
    this.drawSquareBorderImpl(gfx, x, y, mode, strokeColor, overrideColor, screenshakeMul);
  }

  drawSquareBorderCustom = (component: P5 | P5.Graphics, x: number, y: number, mode: 'light' | 'dark', strokeColor: string, overrideColor = false, screenshakeMul = 0) => {
    this.drawSquareBorderImpl(component, x, y, mode, strokeColor, overrideColor, screenshakeMul);
  }

  private drawSquareBorderImpl = (gfx: P5 | P5.Graphics, x: number, y: number, mode: 'light' | 'dark', strokeColor: string, overrideColor = false, screenshakeMul = 1) => {
    const size = 1;
    const strokeSize = STROKE_SIZE;
    const borderSize = STROKE_SIZE * 0.5;
    const strokeOffset = STROKE_SIZE - strokeSize;
    const sizeOffsetX = (1 - size) * BLOCK_SIZE.x * 0.5;
    const sizeOffsetY = (1 - size) * BLOCK_SIZE.y * 0.5;
    const x0 = x * BLOCK_SIZE.x - strokeSize * 0.5 + this.screenShake.offset.x * screenshakeMul + strokeOffset + sizeOffsetX;
    const y0 = y * BLOCK_SIZE.y - strokeSize * 0.5 + this.screenShake.offset.y * screenshakeMul + strokeOffset + sizeOffsetY;
    const x1 = x0 + (BLOCK_SIZE.x * size) - strokeOffset;
    const y1 = y0 + (BLOCK_SIZE.y * size) - strokeOffset;
    const x0i = x0 + borderSize;
    const y0i = y0 + borderSize;
    const x1i = x1 - borderSize;
    const y1i = y1 - borderSize;
    gfx.noStroke();
    if (overrideColor) {
      this.p5CachedFill(gfx, strokeColor);
    } else {
      this.p5CachedFill(gfx, this.getBorderColor(strokeColor, mode));
    }
    if (mode === 'light') {
      // TOP
      gfx.quad(x0, y0, x1, y0, x1, y0i, x0, y0i);
      // RIGHT
      gfx.quad(x1, y0, x1, y1, x1i, y1, x1i, y0);
    } else if (mode === 'dark') {
      // BOTTOM
      gfx.quad(x0, y1i, x1, y1i, x1, y1, x0, y1);
      // LEFT
      gfx.quad(x0, y0, x0i, y0, x0i, y1, x0, y1);
    }
  }

  drawX = (x: number, y: number, color = "#fff", blockDivisions = 5, screenshakeMul = 1) => {
    this.drawXImpl(this.p5, x, y, color, blockDivisions, screenshakeMul);
  }

  drawXStatic = (gfx: P5.Graphics, x: number, y: number, color = "#fff", blockDivisions = 5, screenshakeMul = 1) => {
    if (this.isStaticCached) return;
    this.drawXImpl(gfx, x, y, color, blockDivisions, screenshakeMul);
  }

  drawXCustom = (component: P5 | P5.Graphics, x: number, y: number, color = "#fff", blockDivisions = 5, screenshakeMul = 1) => {
    this.drawXImpl(component, x, y, color, blockDivisions, screenshakeMul);
  }

  private drawXImpl = (gfx: P5 | P5.Graphics, x: number, y: number, color = "#fff", blockDivisions = 5, screenshakeMul = 1) => {
    const sizeX = (BLOCK_SIZE.x - STROKE_SIZE) / blockDivisions;
    const sizeY = (BLOCK_SIZE.y - STROKE_SIZE) / blockDivisions;
    this.p5CachedFill(gfx, color);
    // p5.randomSeed(x + y * 500000);
    // p5.fill(p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255)));
    gfx.noStroke();
    for (let i = 0; i < blockDivisions; i++) {
      const px0 = x * BLOCK_SIZE.x + this.screenShake.offset.x * screenshakeMul + i * sizeX;
      const py0 = y * BLOCK_SIZE.y + this.screenShake.offset.y * screenshakeMul + i * sizeY;
      const px1 = x * BLOCK_SIZE.x + this.screenShake.offset.x * screenshakeMul + i * sizeX;
      const py1 = y * BLOCK_SIZE.y + this.screenShake.offset.y * screenshakeMul + (blockDivisions - 1 - i) * sizeY;
      gfx.square(px0, py0, Math.max(sizeX, sizeY));
      gfx.square(px1, py1, Math.max(sizeX, sizeY));
    }
  }

  drawBasicSquare(x: number, y: number, color: P5.Color, size = 1, screenshakeMul = 1) {
    this.drawBasicSquareImpl(this.p5, x, y, color, size, screenshakeMul);
  }

  drawBasicSquareCustom(component: P5 | P5.Graphics, x: number, y: number, color: P5.Color, size = 1, screenshakeMul = 0) {
    this.drawBasicSquareImpl(component, x, y, color, size, screenshakeMul);
  }

  private drawBasicSquareImpl(gfx: P5 | P5.Graphics, x: number, y: number, color: P5.Color, size = 1, screenshakeMul = 1) {
    const borderSize = STROKE_SIZE * 0.5;
    const width = BLOCK_SIZE.x;
    const height = BLOCK_SIZE.y;
    const x0 = x * BLOCK_SIZE.x + this.screenShake.offset.x * screenshakeMul + (1 - size) * width - borderSize;
    const y0 = y * BLOCK_SIZE.y + this.screenShake.offset.y * screenshakeMul + (1 - size) * height - borderSize;
    const x1 = x0 + width * size;
    const y1 = y0 + height * size;
    gfx.fill(color);
    // gfx.randomSeed(x + y * 500000);
    // gfx.fill(p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255)));
    gfx.noStroke();
    gfx.quad(x0, y0, x1, y0, x1, y1, x0, y1);
  }

  drawLine(gfx: P5 | P5.Graphics, x0: number, y0: number, x1: number, y1: number, color: string) {
    const width = BLOCK_SIZE.x;
    const height = BLOCK_SIZE.y;
    const px0 = x0 * BLOCK_SIZE.x + width * 0.5;
    const py0 = y0 * BLOCK_SIZE.y + height * 0.5;
    const px1 = x1 * BLOCK_SIZE.x + width * 0.5;
    const py1 = y1 * BLOCK_SIZE.y + height * 0.5;
    gfx.stroke(color);
    gfx.strokeWeight(5);
    gfx.strokeCap(this.p5.SQUARE);
    gfx.line(px0, py0, px1, py1);
  }

  /**
   * Draw red squares on level to indicate that we are in Record mode
   */
  drawCaptureMode = () => {
    if (this.replay.mode !== ReplayMode.Capture) return;
    if (this.gameState.gameMode === GameMode.Casual) return;

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
      this.drawBasicSquare(reds[i][0], reds[i][1], this.p5.color("#f00"));
    }
  }

  /**
   * Draw move arrows when player is not moving, or when player is hurt
   */
  drawPlayerMoveArrows = (gfx: P5 | P5.Graphics, vec: Vector, currentMove: DIR) => {
    if (this.replay.mode === ReplayMode.Playback) return;

    const isWaitingToStartMoving = this.gameState.isGameStarted && !this.gameState.isMoving;
    const isStunned = this.gameState.timeSinceHurt < HURT_STUN_TIME;
    if (!isWaitingToStartMoving && !isStunned) return;

    if (isStunned) {
      const freq = .2;
      const t = this.gameState.timeSinceHurt / HURT_STUN_TIME;
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
        x: arrow.x * BLOCK_SIZE.x + BLOCK_SIZE.x * 0.4 + this.screenShake.offset.x,
        y: arrow.y * BLOCK_SIZE.y + BLOCK_SIZE.y * 0.35 + this.screenShake.offset.y,
      }
      gfx.fill("#fff");
      gfx.stroke("#000");
      gfx.strokeWeight(4);
      gfx.textSize(12);
      gfx.textAlign(this.p5.CENTER, this.p5.CENTER);
      gfx.textFont(this.fonts.variants.zicons);
      gfx.text(arrow.text, position.x, position.y);
    }
  }

  drawTutorialMoveControls = (gfx: P5 | P5.Graphics) => {
    if (!this.tutorial.needsMoveControls) return;
    if (this.replay.mode === ReplayMode.Playback) return;

    const isWaitingToStartMoving = this.gameState.isGameStarted && !this.gameState.isMoving;
    const isStunned = this.gameState.timeSinceHurt < HURT_STUN_TIME;
    if (!isWaitingToStartMoving && !isStunned) return;

    // banner background
    const bannerWidth = 6;
    const bannerHeight = 4.4;
    const bannerPosition = {
      x: 10,
      y: 12.3,
    };
    const x0 = BLOCK_SIZE.x * (bannerPosition.x - 5);
    const x1 = x0 + bannerWidth * BLOCK_SIZE.x - STROKE_SIZE;
    const y0 = BLOCK_SIZE.y * (bannerPosition.y);
    const y1 = y0 + bannerHeight * BLOCK_SIZE.y - STROKE_SIZE;
    gfx.fill('#000000aa');
    gfx.stroke("#000");
    gfx.strokeWeight(STROKE_SIZE);
    gfx.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // // text
    const textX = x0 + BLOCK_SIZE.x * 1.7;
    const textY = y0 + BLOCK_SIZE.y * 3.7;
    gfx.fill(ACCENT_COLOR);
    gfx.stroke("#111");
    gfx.strokeWeight(4);
    gfx.textSize(12);
    gfx.textAlign(this.p5.LEFT, this.p5.CENTER);
    gfx.textFont(this.fonts.variants.miniMood);
    gfx.text("MOVE", textX, textY);
    // image
    const imgX = x0 + BLOCK_SIZE.x * 0.5;
    const imgY = y0 + BLOCK_SIZE.y * 0.1;
    this.spriteRenderer.drawImage(Image.ControlsKeyboardMove, imgX, imgY, gfx);
  }

  drawTutorialRewindControls = (gfx: P5 | P5.Graphics, playerPosition: Vector, canRewind: () => boolean) => {
    const hasNeverBeenHurt = this.gameState.lastHurtBy === HitType.Unknown;
    if (hasNeverBeenHurt) return;
    if (this.tutorial.needsMoveControls) return;
    if (!this.tutorial.needsRewindControls) return;
    if (this.gameState.isRewinding) return;
    if (this.replay.mode === ReplayMode.Playback) return;

    const isWaitingToStartMoving = this.gameState.isGameStarted && !this.gameState.isMoving;
    const isStunned = this.gameState.timeSinceHurt < HURT_STUN_TIME;
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
    gfx.fill('#000000aa');
    gfx.stroke("#000");
    gfx.strokeWeight(STROKE_SIZE);
    gfx.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // text
    const textX = BLOCK_SIZE.x * (bannerPosition.x + 3);
    const textY = BLOCK_SIZE.y * (bannerPosition.y + bannerHeight * 0.5);
    gfx.fill("#fff");
    gfx.stroke("#111");
    gfx.strokeWeight(4);
    gfx.textSize(12);
    gfx.textAlign(this.p5.LEFT, this.p5.CENTER);
    gfx.textFont(this.fonts.variants.miniMood);
    gfx.text("REWIND", textX, textY);
    // image
    const imgX = BLOCK_SIZE.x * (bannerPosition.x + 0.6);
    const imgY = BLOCK_SIZE.y * (bannerPosition.y + 0.6);
    this.spriteRenderer.drawImage(Image.ControlsKeyboardDelete, imgX, imgY, gfx);
  }

  drawSprintControls = (gfx: P5 | P5.Graphics, x: number, y: number) => {
    // banner background
    const bannerWidth = 7.8;
    const bannerHeight = 2.8;
    const bannerPosition = { x, y };
    const x0 = BLOCK_SIZE.x * (bannerPosition.x);
    const x1 = BLOCK_SIZE.x * (bannerPosition.x + bannerWidth);
    const y0 = BLOCK_SIZE.y * (bannerPosition.y);
    const y1 = BLOCK_SIZE.y * (bannerPosition.y + bannerHeight);
    gfx.fill('#000000aa');
    gfx.stroke("#000");
    gfx.strokeWeight(STROKE_SIZE);
    gfx.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // text
    const textX = BLOCK_SIZE.x * (bannerPosition.x + 3.5);
    const textY = BLOCK_SIZE.y * (bannerPosition.y + bannerHeight * 0.5);
    gfx.fill(ACCENT_COLOR);
    gfx.stroke("#111");
    gfx.strokeWeight(4);
    gfx.textSize(12);
    gfx.textAlign(this.p5.LEFT, this.p5.CENTER);
    gfx.textFont(this.fonts.variants.miniMood);
    gfx.text("SPRINT", textX, textY);
    // image
    const imgX = BLOCK_SIZE.x * (bannerPosition.x + 0.6);
    const imgY = BLOCK_SIZE.y * (bannerPosition.y + 0.6);
    this.spriteRenderer.drawImage(Image.ControlsKeyboardSprint, imgX, imgY, gfx);
  }

  drawDifficultySelect = (gfx: P5 | P5.Graphics, backgroundColor: string) => {
    const colorEas = '#43C59E';
    const colorMed = '#fa0'
    const colorHar = '#E76F51'
    const colorUlt = '#F21F5E'
    // const colorUlt = '#8F3985'
    this.drawDifficultySelectBanner(gfx, 3, 0, 5, 1.1, 'choose', { backgroundColor, textXOffset: .1 });
    this.drawDifficultySelectBanner(gfx, 3, 1, 6, 1, 'difficulty', { backgroundColor, textXOffset: .1 });
    this.drawDifficultySelectBanner(gfx, 12.9, 0, 3.1, 1, 'easy', { backgroundColor, textColor: colorEas });
    this.drawDifficultySelectBanner(gfx, 26, 14, 4, 1, 'medium', { backgroundColor, textColor: colorMed });
    this.drawDifficultySelectBanner(gfx, 12.9, 29, 3.1, 1, 'hard', { backgroundColor, textColor: colorHar });
    this.drawDifficultySelectBanner(gfx, 24, 29, 4, 1, 'ultra', { backgroundColor, textColor: colorUlt, textXOffset: .2 });
  }

  drawDifficultySelectCobra = (gfx: P5 | P5.Graphics, backgroundColor: string) => {
    const colorHar = '#E76F51'
    const colorUlt = '#F21F5E'
    this.drawDifficultySelectBanner(gfx, 3, 0, 5, 1.1, 'choose', { backgroundColor, textXOffset: .1 });
    this.drawDifficultySelectBanner(gfx, 3, 1, 6, 1, 'difficulty', { backgroundColor, textXOffset: .1 });
    this.drawDifficultySelectBanner(gfx, 19, 0, 7, 1, 'COBRA MODE', { backgroundColor, textXOffset: .35 });
    this.drawDifficultySelectBanner(gfx, 27, 14, 3.1, 1, 'hard', { backgroundColor, textColor: colorHar });
    this.drawDifficultySelectBanner(gfx, 12.5, 29, 4, 1, 'ultra', { backgroundColor, textColor: colorUlt, textXOffset: .2 });
  }

  private drawDifficultySelectBanner = (gfx: P5 | P5.Graphics, x: number, y: number, bannerWidth: number, bannerHeight: number, text: string, {
    textXOffset = 0,
    textColor = "#fff",
    backgroundColor = "#000000aa",
  } = {}) => {
    const x0 = BLOCK_SIZE.x * x;
    const x1 = BLOCK_SIZE.x * (x + bannerWidth) - STROKE_SIZE * 0.5;
    const y0 = BLOCK_SIZE.y * y - STROKE_SIZE * 0.5;
    const y1 = BLOCK_SIZE.y * (y + bannerHeight) - STROKE_SIZE;
    gfx.fill(backgroundColor);
    gfx.noStroke();
    // gfx.stroke("#000");
    gfx.strokeWeight(STROKE_SIZE);
    gfx.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // text
    const textX = BLOCK_SIZE.x * x + 5 + BLOCK_SIZE.x * textXOffset;
    const textY = BLOCK_SIZE.y * y + 7;
    gfx.fill(textColor);
    // gfx.stroke("#111");
    gfx.strokeWeight(4);
    gfx.textSize(12);
    gfx.textAlign(this.p5.LEFT, this.p5.CENTER);
    gfx.textFont(this.fonts.variants.miniMood);
    gfx.text(text, textX, textY);
  }

  drawUIKeys = (gfx: P5 | P5.Graphics) => {
    if (this.replay.mode === ReplayMode.Playback) return;
    if (this.gameState.isGameWon) return;
    if (!this.gameState.isGameStarted) return;
    if (!this.gameState.hasKeyYellow && !this.gameState.hasKeyRed && !this.gameState.hasKeyBlue) return;

    const x0 = BLOCK_SIZE.x * 29 - STROKE_SIZE * 0.5;
    const y0 = BLOCK_SIZE.y * 1 - STROKE_SIZE * 0.5;
    const x1 = x0 + BLOCK_SIZE.x * 1 + STROKE_SIZE * 0.5;
    const y1 = y0 + BLOCK_SIZE.y * 3 + STROKE_SIZE * 0.5;
    gfx.fill("#00000099");
    gfx.noStroke();
    gfx.quad(x0, y0, x1, y0, x1, y1, x0, y1);

    const imgX = BLOCK_SIZE.x * 29 + 1;
    const imgY = BLOCK_SIZE.y * 1 + 1;

    if (this.gameState.hasKeyYellow) {
      this.spriteRenderer.drawImage(Image.UIKeyYellow, imgX, imgY, gfx);
    }

    if (this.gameState.hasKeyRed) {
      this.spriteRenderer.drawImage(Image.UIKeyRed, imgX, imgY + BLOCK_SIZE.y, gfx);
    }

    if (this.gameState.hasKeyBlue) {
      this.spriteRenderer.drawImage(Image.UIKeyBlue, imgX, imgY + BLOCK_SIZE.y * 2, gfx);
    }
  }

  /**
   * Draw portal
   */
  drawPortal = (portal: Portal, showDeathColours: boolean, options: DrawSquareOptions) => {
    if (!portal) return;
    const delay = portal.index * PORTAL_INDEX_DELAY;
    const t1 = oscilateLinear((this.elapsed + delay) / (PORTAL_FADE_DURATION));
    const t2 = oscilateLinear((this.elapsed + delay) / (PORTAL_FADE_DURATION * 0.5));
    const [color, background] = showDeathColours
      ? [this.p5.lerpColor(this.p5.color("#ccc"), this.p5.color("#000"), t1).toString(), "#555"]
      : this.lookupPortalColors(portal.channel, t1, t2);
    this.drawSquare(portal.position.x, portal.position.y, background, color, options);
  }

  private fpsFrames: number[] = [];
  drawFps = (showFpsFromQueryParams: boolean, gameLoopProcessingTime: number) => {
    if (!SHOW_FPS && !showFpsFromQueryParams) return;

    this.drawPerf(gameLoopProcessingTime);
    const textX = BLOCK_SIZE.x * (25);
    const textY = BLOCK_SIZE.y * (1);
    this.p5.fill("#fff");
    this.p5.stroke("#111");
    this.p5.strokeWeight(2);
    this.p5.textSize(10);
    this.p5.textAlign(this.p5.LEFT, this.p5.TOP);
    this.p5.textFont(this.fonts.variants.miniMood);
    if (!this.fpsFrames?.length) {
      this.fpsFrames = new Array<number>(20).map(() => this.p5.frameRate());
    } else {
      this.fpsFrames[0] = this.p5.frameRate();
      for (let i = this.fpsFrames.length - 1; i > 0; i--) {
        this.fpsFrames[i] = this.fpsFrames[i - 1];
      }
    }
    const avg = this.fpsFrames.reduce((acc, cur) => acc + cur, 0) / this.fpsFrames.length;
    const min = Math.min(...this.fpsFrames);
    const max = Math.max(...this.fpsFrames);
    const padding = 16;
    let y = 0;
    this.p5.text("FPS", textX, textY);
    this.p5.text("avg=" + avg.toFixed(2), textX, textY + padding * (++y));
    this.p5.text("max=" + max.toFixed(2), textX, textY + padding * (++y));
    this.p5.text("min=" + min.toFixed(2), textX, textY + padding * (++y));
  }

  private perfFrames: number[] = [];
  private drawPerf = (gameLoopProcessingTime: number) => {
    const textX = BLOCK_SIZE.x * (21);
    const textY = BLOCK_SIZE.y * (1);
    this.p5.fill("#fff");
    this.p5.stroke("#111");
    this.p5.strokeWeight(2);
    this.p5.textSize(10);
    this.p5.textAlign(this.p5.LEFT, this.p5.TOP);
    this.p5.textFont(this.fonts.variants.miniMood);
    if (!this.perfFrames?.length) {
      this.perfFrames = new Array<number>(20).map(() => gameLoopProcessingTime);
    } else {
      this.perfFrames[0] = gameLoopProcessingTime;
      for (let i = this.perfFrames.length - 1; i > 0; i--) {
        this.perfFrames[i] = this.perfFrames[i - 1];
      }
    }
    const avg = this.perfFrames.reduce((acc, cur) => acc + cur, 0) / this.perfFrames.length;
    const min = Math.min(...this.perfFrames);
    const max = Math.max(...this.perfFrames);
    const padding = 16;
    let y = 0;
    this.p5.text("MS", textX, textY);
    this.p5.text("avg=" + avg.toFixed(2), textX, textY + padding * (++y));
    this.p5.text("max=" + max.toFixed(2), textX, textY + padding * (++y));
    this.p5.text("min=" + min.toFixed(2), textX, textY + padding * (++y));
  }

  private getBorderColor = (color: string, variant: 'light' | 'dark'): string => {
    if (variant === 'light') {
      if (!this.lightColorMap[color]) {
        this.lightColorMap[color] = Color(color).lighten(0.2).desaturate(0.1).hex()
      }
      return this.lightColorMap[color];
    } else if (variant === 'dark') {
      if (!this.darkColorMap[color]) {
        this.darkColorMap[color] = Color(color).darken(0.2).saturate(0.1).hex();
      }
      return this.darkColorMap[color];
    }
    return color;
  }

  private lookupPortalColors = (channel: PortalChannel, t1: number, t2: number): [string, string] => {
    if (!this.portalCachedColorsBG?.length || !this.portalCachedColorsFG?.length) {
      this.hydratePortalCachedColors();
    }
    return [
      this.portalCachedColorsFG[channel][Math.min(Math.floor(t1 * NUM_PORTAL_GRADIENT_COLORS), NUM_PORTAL_GRADIENT_COLORS - 1)] || INVALID_PORTAL_COLOR,
      this.portalCachedColorsBG[channel][Math.min(Math.floor(t2 * NUM_PORTAL_GRADIENT_COLORS), NUM_PORTAL_GRADIENT_COLORS - 1)] || INVALID_PORTAL_COLOR,
    ];
  }

  private hydratePortalCachedColors = () => {
    const p5 = this.p5;
    for (let i: PortalChannel = 0; i <= 9; i++) {
      this.portalCachedColorsFG[i] = [];
      this.portalCachedColorsBG[i] = [];
      for (let j = 0; j < NUM_PORTAL_GRADIENT_COLORS; j++) {
        const t = j / (NUM_PORTAL_GRADIENT_COLORS - 1);
        const accent = PORTAL_CHANNEL_COLORS[i as PortalChannel];
        const color = p5.lerpColor(p5.color(accent), p5.color("#000"), t).toString();
        const background = p5.lerpColor(p5.color("#000000"), p5.color(accent), t).toString();
        this.portalCachedColorsFG[i][j] = color;
        this.portalCachedColorsBG[i][j] = background;
      }
    }
  }

  private lookupP5CachedColor = (colorLookup: string) => {
    let color = this.cachedP5Colors[colorLookup];
    if (!color) {
      color = this.p5.color(colorLookup);
      this.cachedP5Colors[colorLookup] = color;
    }
    return color;
  }

  private p5CachedFill = (gfx: P5 | P5.Graphics, background: string, optimize = true) => {
    if (optimize) {
      gfx.fill(this.lookupP5CachedColor(background));
    } else {
      gfx.fill(background);
    }
  }

  private p5CachedStroke = (gfx: P5 | P5.Graphics, lineColor: string, optimize = true) => {
    if (optimize) {
      gfx.stroke(this.lookupP5CachedColor(lineColor));
    } else {
      gfx.stroke(lineColor);
    }
  }
}
