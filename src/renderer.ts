import P5, { Vector } from "p5";
import { DIR, FontsInstance, GameState, HitType, Image, Portal, PortalChannel, Replay, ReplayMode, ScreenShakeState, Tutorial } from "./types";
import { ACCENT_COLOR, BLOCK_SIZE, GRIDCOUNT, HURT_STUN_TIME, NUM_PORTAL_GRADIENT_COLORS, PORTAL_CHANNEL_COLORS, PORTAL_FADE_DURATION, PORTAL_INDEX_DELAY, SECONDARY_ACCENT_COLOR, SECONDARY_ACCENT_COLOR_BG, SHOW_FPS, STRANGELY_NEEDED_OFFSET, STROKE_SIZE } from "./constants";
import { clamp, oscilateLinear } from "./utils";
import { SpriteRenderer } from "./spriteRenderer";
import Color from "color";

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
  lightColorMap: Record<string, string> = {}
  darkColorMap: Record<string, string> = {}

  portalCachedColorsFG: string[][] = []
  portalCachedColorsBG: string[][] = []
  cachedP5Colors: Record<string, P5.Color> = {}

  constructor(props: RendererConstructorProps) {
    this.props = props;
  }

  reset = () => {
    this.elapsed = 0;
  }

  tick = () => {
    this.elapsed += this.props.p5.deltaTime;
  }

  drawBackground = (color: string) => {
    const { p5 } = this.props;
    p5.background(color);
  }

  /**
   * Draw a square to the canvas
   */
  drawSquare = (x: number, y: number, background = "pink", lineColor = "fff", { is3d = false, size = 1, strokeSize = STROKE_SIZE, optimize = false } = {}) => {
    const { p5, screenShake } = this.props;
    this.p5CachedFill(background, optimize);
    this.p5CachedStroke(lineColor, optimize);
    p5.strokeWeight(strokeSize);
    const strokeOffset = STROKE_SIZE - strokeSize;
    const sizeOffsetX = (1 - size) * BLOCK_SIZE.x * 0.5;
    const sizeOffsetY = (1 - size) * BLOCK_SIZE.y * 0.5;
    const position = {
      x: (x * BLOCK_SIZE.x + screenShake.offset.x + strokeOffset) + sizeOffsetX,
      y: (y * BLOCK_SIZE.y + screenShake.offset.y + strokeOffset) + sizeOffsetY,
    }
    const squareSize = (BLOCK_SIZE.x - strokeSize - strokeOffset * 2) * size;
    p5.square(position.x, position.y, squareSize);
    if (is3d) {
      const borderSize = STROKE_SIZE * 0.5;
      const x0 = x * BLOCK_SIZE.x - strokeSize * 0.5 + screenShake.offset.x + strokeOffset + sizeOffsetX;
      const y0 = y * BLOCK_SIZE.y - strokeSize * 0.5 + screenShake.offset.y + strokeOffset + sizeOffsetY;
      const x1 = x0 + (BLOCK_SIZE.x * size) - strokeOffset;
      const y1 = y0 + (BLOCK_SIZE.y * size) - strokeOffset;
      const x0i = x0 + borderSize;
      const y0i = y0 + borderSize;
      const x1i = x1 - borderSize;
      const y1i = y1 - borderSize;
      p5.noStroke();
      this.p5CachedFill(this.getBorderColor(lineColor, 'light'), optimize);
      // TOP
      p5.quad(x0, y0, x1, y0, x1, y0i, x0, y0i);
      // RIGHT
      p5.quad(x1, y0, x1, y1, x1i, y1, x1i, y0);
      this.p5CachedFill(this.getBorderColor(lineColor, 'dark'), optimize);
      // BOTTOM
      p5.quad(x0, y1i, x1, y1i, x1, y1, x0, y1);
      // LEFT
      p5.quad(x0, y0, x0i, y0, x0i, y1, x0, y1);
    }
  }

  drawSquareBorder = (x: number, y: number, mode: 'light' | 'dark', strokeColor: string, { size = 1, strokeSize = STROKE_SIZE } = {}) => {
    const { p5, screenShake } = this.props;
    const borderSize = STROKE_SIZE * 0.5;
    const strokeOffset = STROKE_SIZE - strokeSize;
    const sizeOffsetX = (1 - size) * BLOCK_SIZE.x * 0.5;
    const sizeOffsetY = (1 - size) * BLOCK_SIZE.y * 0.5;
    const x0 = x * BLOCK_SIZE.x - strokeSize * 0.5 + screenShake.offset.x + strokeOffset + sizeOffsetX;
    const y0 = y * BLOCK_SIZE.y - strokeSize * 0.5 + screenShake.offset.y + strokeOffset + sizeOffsetY;
    const x1 = x0 + (BLOCK_SIZE.x * size) - strokeOffset;
    const y1 = y0 + (BLOCK_SIZE.y * size) - strokeOffset;
    const x0i = x0 + borderSize;
    const y0i = y0 + borderSize;
    const x1i = x1 - borderSize;
    const y1i = y1 - borderSize;
    p5.noStroke();
    if (mode === 'light') {
      this.p5CachedFill(this.getBorderColor(strokeColor, 'light'));
      // TOP
      p5.quad(x0, y0, x1, y0, x1, y0i, x0, y0i);
      // RIGHT
      p5.quad(x1, y0, x1, y1, x1i, y1, x1i, y0);
    } else if (mode === 'dark') {
      this.p5CachedFill(this.getBorderColor(strokeColor, 'dark'));
      // BOTTOM
      p5.quad(x0, y1i, x1, y1i, x1, y1, x0, y1);
      // LEFT
      p5.quad(x0, y0, x0i, y0, x0i, y1, x0, y1);
    }
  }

  drawX = (x: number, y: number, color = "#fff", blockDivisions = 5) => {
    const { p5, screenShake } = this.props;
    const size = {
      x: (BLOCK_SIZE.x - STROKE_SIZE) / blockDivisions,
      y: (BLOCK_SIZE.y - STROKE_SIZE) / blockDivisions,
    }
    this.p5CachedFill(color);
    // p5.randomSeed(x + y * 500000);
    // p5.fill(p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255)));
    p5.noStroke();
    for (let i = 0; i < blockDivisions; i++) {
      const position0 = {
        x: x * BLOCK_SIZE.x + screenShake.offset.x + i * size.x,
        y: y * BLOCK_SIZE.y + screenShake.offset.y + i * size.y,
      }
      const position1 = {
        x: x * BLOCK_SIZE.x + screenShake.offset.x + i * size.x,
        y: y * BLOCK_SIZE.y + screenShake.offset.y + (blockDivisions - 1 - i) * size.y,
      }
      p5.square(position0.x, position0.y, Math.max(size.x, size.y));
      p5.square(position1.x, position1.y, Math.max(size.x, size.y));
    }
  }

  drawBasicSquare(x: number, y: number, color: P5.Color, size = 1) {
    const { p5, screenShake } = this.props;
    const borderSize = STROKE_SIZE * 0.5;
    const width = BLOCK_SIZE.x;
    const height = BLOCK_SIZE.y;
    const x0 = x * BLOCK_SIZE.x + screenShake.offset.x + (1 - size) * width - borderSize;
    const y0 = y * BLOCK_SIZE.y + screenShake.offset.x + (1 - size) * height - borderSize;
    const x1 = x0 + width * size;
    const y1 = y0 + height * size;
    p5.fill(color);
    // p5.randomSeed(x + y * 500000);
    // p5.fill(p5.color(p5.random(0, 255), p5.random(0, 255), p5.random(0, 255)));
    p5.noStroke();
    p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);
  }

  /**
   * Draw red squares on level to indicate that we are in Record mode
   */
  drawCaptureMode = () => {
    const { replay, gameState } = this.props;
    if (replay.mode !== ReplayMode.Capture) return;
    if (gameState.isCasualModeEnabled) return;

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
    p5.fill('#000000aa');
    p5.stroke("#000");
    p5.strokeWeight(STROKE_SIZE);
    p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // // text
    const textX = x0 + BLOCK_SIZE.x * 1.7;
    const textY = y0 + BLOCK_SIZE.y * 3.7;
    p5.fill(ACCENT_COLOR);
    p5.stroke("#111");
    p5.strokeWeight(4);
    p5.textSize(12);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.text("MOVE", textX, textY);
    // image
    const imgX = x0 + BLOCK_SIZE.x * 0.5;
    const imgY = y0 + BLOCK_SIZE.y * 0.1;
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

  drawDifficultySelect = (backgroundColor: string) => {
    const colorEas = '#43C59E';
    const colorMed = '#fa0'
    const colorHar = '#E76F51'
    const colorUlt = '#F21F5E'
    // const colorUlt = '#8F3985'

    this.drawDifficultySelectBanner(3, 0, 5, 1.1, 'choose', { backgroundColor, textXOffset: .1 });
    this.drawDifficultySelectBanner(3, 1, 6, 1, 'difficulty', { backgroundColor, textXOffset: .1 });
    this.drawDifficultySelectBanner(12.9, 0, 3.1, 1, 'easy', { backgroundColor, textColor: colorEas });
    this.drawDifficultySelectBanner(26, 14, 4, 1, 'medium', { backgroundColor, textColor: colorMed });
    this.drawDifficultySelectBanner(12.9, 29, 3.1, 1, 'hard', { backgroundColor, textColor: colorHar });
    this.drawDifficultySelectBanner(24, 29, 4, 1, 'ultra', { backgroundColor, textColor: colorUlt, textXOffset: .2 });
  }

  private drawDifficultySelectBanner = (x: number, y: number, bannerWidth: number, bannerHeight: number, text: string, {
    textXOffset = 0,
    textColor = "#fff",
    backgroundColor = "#000000aa",
  } = {}) => {
    const { p5, fonts } = this.props;
    const x0 = BLOCK_SIZE.x * x;
    const x1 = BLOCK_SIZE.x * (x + bannerWidth) - STROKE_SIZE * 0.5;
    const y0 = BLOCK_SIZE.y * y - STROKE_SIZE * 0.5;
    const y1 = BLOCK_SIZE.y * (y + bannerHeight) - STROKE_SIZE;
    p5.fill(backgroundColor);
    p5.noStroke();
    // p5.stroke("#000");
    p5.strokeWeight(STROKE_SIZE);
    p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);
    // text
    const textX = BLOCK_SIZE.x * x + 5 + BLOCK_SIZE.x * textXOffset;
    const textY = BLOCK_SIZE.y * y + 7;
    p5.fill(textColor);
    // p5.stroke("#111");
    p5.strokeWeight(4);
    p5.textSize(12);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.textFont(fonts.variants.miniMood);
    p5.text(text, textX, textY);
  }

  drawUIKeys = () => {
    const { p5, gameState, spriteRenderer, replay } = this.props;

    if (replay.mode === ReplayMode.Playback) return;
    if (gameState.isGameWon) return;
    if (!gameState.isGameStarted) return;
    if (!gameState.hasKeyYellow && !gameState.hasKeyRed && !gameState.hasKeyBlue) return;

    const x0 = BLOCK_SIZE.x * 29 - STROKE_SIZE * 0.5;
    const y0 = BLOCK_SIZE.y * 1 - STROKE_SIZE * 0.5;
    const x1 = x0 + BLOCK_SIZE.x * 1 + STROKE_SIZE * 0.5;
    const y1 = y0 + BLOCK_SIZE.y * 3 + STROKE_SIZE * 0.5;
    p5.fill("#00000099");
    p5.noStroke();
    p5.quad(x0, y0, x1, y0, x1, y1, x0, y1);

    const imgX = BLOCK_SIZE.x * 29 + 1;
    const imgY = BLOCK_SIZE.y * 1 + 1;

    if (gameState.hasKeyYellow) {
      spriteRenderer.drawImage(Image.UIKeyYellow, imgX, imgY);
    }

    if (gameState.hasKeyRed) {
      spriteRenderer.drawImage(Image.UIKeyRed, imgX, imgY + BLOCK_SIZE.y);
    }

    if (gameState.hasKeyBlue) {
      spriteRenderer.drawImage(Image.UIKeyBlue, imgX, imgY + BLOCK_SIZE.y * 2);
    }
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
    const [color, background] = showDeathColours
      ? [p5.lerpColor(p5.color("#ccc"), p5.color("#000"), t1).toString(), "#555"]
      : this.lookupPortalColors(portal.channel, t1, t2);
    this.drawSquare(portal.position.x, portal.position.y, background, color);
    // const accent = showDeathColours ? "#ccc" : PORTAL_CHANNEL_COLORS[portal.channel];
    // const background = showDeathColours ? "#555" : p5.lerpColor(p5.color("#000000"), p5.color(accent), t2).toString();
    // const color = p5.lerpColor(p5.color(accent), p5.color("#000"), t1).toString();
    // this.drawSquare(portal.position.x, portal.position.y, background, color);
  }

  private fpsFrames: number[] = [];
  drawFps = (showFpsFromQueryParams: boolean, gameLoopProcessingTime: number) => {
    if (!SHOW_FPS && !showFpsFromQueryParams) return;

    this.drawPerf(gameLoopProcessingTime);
    const { p5, fonts } = this.props;
    const textX = BLOCK_SIZE.x * (25);
    const textY = BLOCK_SIZE.y * (1);
    p5.fill("#fff");
    p5.stroke("#111");
    p5.strokeWeight(2);
    p5.textSize(10);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textFont(fonts.variants.miniMood);
    if (!this.fpsFrames?.length) {
      this.fpsFrames = new Array<number>(20).map(() => p5.frameRate());
    } else {
      this.fpsFrames[0] = p5.frameRate();
      for (let i = this.fpsFrames.length - 1; i > 0; i--) {
        this.fpsFrames[i] = this.fpsFrames[i - 1];
      }
    }
    const avg = this.fpsFrames.reduce((acc, cur) => acc + cur, 0) / this.fpsFrames.length;
    const min = Math.min(...this.fpsFrames);
    const max = Math.max(...this.fpsFrames);
    const padding = 16;
    let y = 0;
    p5.text("FPS", textX, textY);
    p5.text("avg=" + avg.toFixed(2), textX, textY + padding * (++y));
    p5.text("max=" + max.toFixed(2), textX, textY + padding * (++y));
    p5.text("min=" + min.toFixed(2), textX, textY + padding * (++y));
  }

  private perfFrames: number[] = [];
  private drawPerf = (gameLoopProcessingTime: number) => {
    const { p5, fonts } = this.props;
    const textX = BLOCK_SIZE.x * (21);
    const textY = BLOCK_SIZE.y * (1);
    p5.fill("#fff");
    p5.stroke("#111");
    p5.strokeWeight(2);
    p5.textSize(10);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textFont(fonts.variants.miniMood);
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
    p5.text("MS", textX, textY);
    p5.text("avg=" + avg.toFixed(2), textX, textY + padding * (++y));
    p5.text("max=" + max.toFixed(2), textX, textY + padding * (++y));
    p5.text("min=" + min.toFixed(2), textX, textY + padding * (++y));
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
      this.portalCachedColorsFG[channel][Math.min(Math.floor(t1 * NUM_PORTAL_GRADIENT_COLORS), NUM_PORTAL_GRADIENT_COLORS - 1)] || "#FFC0CB",
      this.portalCachedColorsBG[channel][Math.min(Math.floor(t2 * NUM_PORTAL_GRADIENT_COLORS), NUM_PORTAL_GRADIENT_COLORS - 1)] || "#FFC0CB",
    ];
  }

  private hydratePortalCachedColors = () => {
    const { p5 } = this.props;
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
    const { p5 } = this.props;
    let color = this.cachedP5Colors[colorLookup];
    if (!color) {
      color = p5.color(colorLookup);
      this.cachedP5Colors[colorLookup] = color;
    }
    return color;
  }

  private p5CachedFill = (background: string, optimize = true) => {
    const { p5 } = this.props;
    if (optimize) {
      p5.fill(this.lookupP5CachedColor(background));
    } else {
      p5.fill(background);
    }
  }

  private p5CachedStroke = (lineColor: string, optimize = true) => {
    const { p5 } = this.props;
    if (optimize) {
      p5.stroke(this.lookupP5CachedColor(lineColor));
    } else {
      p5.stroke(lineColor);
    }
  }
}
