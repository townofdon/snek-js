import P5, { Vector } from "p5";

import {
  AppMode,
  DIR,
  DrawSquareOptions,
  FontsInstance,
  GameMode,
  GameState,
  HitType,
  IRenderer,
  Portal,
  Replay,
  ReplayMode,
  ScreenShakeState,
  Tutorial,
} from "../types";
import {
  DIMENSIONS,
} from "../constants";
import { SpriteRenderer } from "../spriteRenderer";
import { Renderer } from "../renderer";

interface RendererConstructorProps {
  p5: P5
  fonts: FontsInstance
  spriteRenderer: SpriteRenderer
}

export class EditorRenderer implements IRenderer {
  private p5: P5;
  private fonts: FontsInstance;
  private spriteRenderer: SpriteRenderer;
  private renderer: IRenderer;

  constructor(props: RendererConstructorProps) {
    this.p5 = props.p5;
    this.fonts = props.fonts;
    this.spriteRenderer = props.spriteRenderer;

    // stuff we don't need
    const staticGraphics: P5.Graphics = this.p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
    const replay: Replay = {
      mode: ReplayMode.Disabled,
      levelIndex: 0,
      levelName: "",
      difficulty: undefined,
      applesToSpawn: [],
      positions: undefined,
      timeCaptureStarted: "",
      shouldProceedToNextClip: false,
    }
    const screenShake: ScreenShakeState = {
      offset: new Vector(0, 0),
      timeSinceStarted: 0,
      timeSinceLastStep: 0,
      magnitude: 0,
      timeScale: 0
    }
    const tutorial: Tutorial = {
      needsMoveControls: false,
      needsRewindControls: false,
    }
    const gameState: GameState = {
      appMode: AppMode.StartScreen,
      gameMode: GameMode.Normal,
      isPreloaded: false,
      isGameStarted: false,
      isGameStarting: false,
      isPaused: false,
      isMoving: false,
      isSprinting: false,
      isRewinding: false,
      isLost: false,
      isGameWon: false,
      isDoorsOpen: false,
      isExitingLevel: false,
      isExited: false,
      isShowingDeathColours: false,
      hasKeyYellow: false,
      hasKeyRed: false,
      hasKeyBlue: false,
      levelIndex: 0,
      actualTimeElapsed: 0,
      timeElapsed: 0,
      timeSinceLastMove: 0,
      timeSinceLastTeleport: 0,
      timeSinceHurt: 0,
      timeSinceHurtForgiveness: 0,
      timeSinceLastInput: 0,
      timeSinceInvincibleStart: 0,
      timeSinceSpawnedPickup: 0,
      hurtGraceTime: 0,
      lives: 0,
      targetSpeed: 0,
      currentSpeed: 0,
      steps: 0,
      frameCount: 0,
      lastHurtBy: HitType.Unknown,
      nextLevel: undefined,
    }

    this.renderer = new Renderer({
      p5: this.p5, staticGraphics, fonts: this.fonts, replay, gameState, screenShake, spriteRenderer: this.spriteRenderer, tutorial
    })
  }

  reset = () => {
    this.renderer.reset();
  }

  tick = () => {
    this.renderer.tick();
  }

  drawBackground = (color: string) => {
    this.renderer.drawBackground(color);
  }

  drawStaticGraphics = () => { }
  invalidateStaticCache = () => { }

  clearGraphicalComponent = (component: P5.Graphics) => {
    this.renderer.clearGraphicalComponent(component);
  };

  drawGraphicalComponent = (component: P5.Graphics, x: number, y: number) => {
    this.renderer.drawGraphicalComponent(component, x, y);
  }

  drawGraphicalComponentStatic = (component: P5.Graphics, x: number, y: number) => { }

  drawSquare = (x: number, y: number, background: string, lineColor: string, options: DrawSquareOptions) => {
    this.renderer.drawSquare(x, y, background, lineColor, options);
  }

  drawSquareStatic = (x: number, y: number, background: string, lineColor: string, options: DrawSquareOptions) => { }

  drawSquareCustom = (component: P5 | P5.Graphics, x: number, y: number, background: string, lineColor: string, options: DrawSquareOptions) => {
    this.renderer.drawSquareCustom(component, x, y, background, lineColor, options);
  }

  drawSquareBorder = (x: number, y: number, mode: "light" | "dark", strokeColor: string, overrideColor: boolean) => {
    this.renderer.drawSquareBorder(x, y, mode, strokeColor, overrideColor);
  }

  drawSquareBorderStatic = (x: number, y: number, mode: "light" | "dark", strokeColor: string, overrideColor: boolean) => { }

  drawSquareBorderCustom = (component: P5 | P5.Graphics, x: number, y: number, mode: "light" | "dark", strokeColor: string, overrideColor: boolean) => {
    this.renderer.drawSquareBorderCustom(component, x, y, mode, strokeColor, overrideColor);
  }

  drawX = (x: number, y: number, color: string, blockDivisions: number) => {
    this.renderer.drawX(x, y, color, blockDivisions);
  }

  drawXStatic = (x: number, y: number, color: string, blockDivisions: number) => { }

  drawXCustom = (component: P5 | P5.Graphics, x: number, y: number, color: string, blockDivisions: number = 5) => {
    this.renderer.drawXCustom(component, x, y, color, blockDivisions);
  }

  drawBasicSquare = (x: number, y: number, color: P5.Color, size: number) => {
    this.renderer.drawBasicSquare(x, y, color, size);
  }

  drawCaptureMode = () => { }

  drawPlayerMoveArrows = (vec: P5.Vector, currentMove: DIR) => { }
  drawTutorialMoveControls = () => { }
  drawTutorialRewindControls = (playerPosition: P5.Vector, canRewind: () => boolean) => { }
  drawSprintControls = (x: number, y: number) => { }
  drawDifficultySelect = (backgroundColor: string) => { }
  drawDifficultySelectCobra = (backgroundColor: string) => { }
  drawUIKeys = () => { }

  drawPortal = (portal: Portal, showDeathColours: boolean, options: DrawSquareOptions) => {
    this.renderer.drawPortal(portal, showDeathColours, options);
  }
}
