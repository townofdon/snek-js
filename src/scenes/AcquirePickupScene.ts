import P5 from "p5";
import { FontsInstance, GameState, PlayerState, SceneCallbacks, SFXInstance } from "@/types";
import { BaseScene } from "./BaseScene";
import { SpriteRenderer } from "@/engine/spriteRenderer";
import { MusicPlayer } from "@/engine/musicPlayer";
import { VectorList } from "@/collections/vectorList";
import { Renderer } from "@/engine/renderer";
import { ACCENT_COLOR, SECONDARY_ACCENT_COLOR, SECONDARY_ACCENT_COLOR_BG } from "@/constants";
import { Easing } from "@/easing";

export interface AcquirePickupSceneConstructorArgs {
  p5: P5;
  gfxFGAction: P5.Graphics;
  gfxPresentation: P5.Graphics;
  sfx: SFXInstance;
  musicPlayer: MusicPlayer;
  fonts: FontsInstance;
  renderer: Renderer;
  spriteRenderer: SpriteRenderer;
  callbacks: SceneCallbacks;
  gameState: GameState;
  segments: VectorList;
  player: PlayerState;
  // rendering
  onBeforeDraw: () => void
  drawGameBackground: () => void
  drawPlayerHead: (vec: P5.Vector) => void
  drawPlayerSegment: (vec: P5.Vector, i?: number) => void
  erasePlayerSegmentCorner: (vec: P5.Vector, i?: number) => void
  drawParticles: (zIndexPass?: number) => void
}

enum RenderItem {
  Title,
}
enum FadeDirection {
  In,
  Out,
}

const defaultShowing = {
  [RenderItem.Title]: false
} satisfies Record<RenderItem, boolean>

export class AcquirePickupScene extends BaseScene {
  private gfxFGAction: P5.Graphics;
  private sfx: SFXInstance;
  private musicPlayer: MusicPlayer;
  private renderer: Renderer;
  private spriteRenderer: SpriteRenderer;
  private gameState: GameState;
  private titleText: string = 'HOLY SNEK!';
  private segments: VectorList;
  private player: PlayerState;

  private onBeforeDraw: () => void;
  private drawGameBackground: () => void;
  private drawPlayerHead: (vec: P5.Vector) => void;
  private drawPlayerSegment: (vec: P5.Vector, i?: number) => void;
  private erasePlayerSegmentCorner: (vec: P5.Vector, i?: number) => void;
  private drawParticles: (zIndexPass?: number) => void;

  private fade: number = 0;
  private fadeDirection: FadeDirection = FadeDirection.In;

  private showing: Record<RenderItem, boolean> = { ...defaultShowing };

  constructor(args: AcquirePickupSceneConstructorArgs) {
    const {
      p5,
      gfxFGAction,
      gfxPresentation,
      fonts,
      callbacks,
      sfx,
      musicPlayer,
      renderer,
      spriteRenderer,
      gameState,
      segments,
      player,
      onBeforeDraw,
      drawGameBackground,
      drawPlayerHead,
      drawPlayerSegment,
      erasePlayerSegmentCorner,
      drawParticles,
    } = args;
    super(p5, gfxPresentation, fonts, callbacks);
    this.gfxFGAction = gfxFGAction;
    this.sfx = sfx;
    this.musicPlayer = musicPlayer;
    this.renderer = renderer;
    this.spriteRenderer = spriteRenderer;
    this.gameState = gameState;
    this.segments = segments;
    this.player = player;
    this.onBeforeDraw = onBeforeDraw;
    this.drawGameBackground = drawGameBackground;
    this.drawPlayerHead = drawPlayerHead;
    this.drawPlayerSegment = drawPlayerSegment;
    this.erasePlayerSegmentCorner = erasePlayerSegmentCorner;
    this.drawParticles = drawParticles;
  }

  public trigger = (titleText: string) => {
    this.fade = 0;
    this.fadeDirection = FadeDirection.In;
    this.titleText = titleText;
    this.showing = { ...defaultShowing };
    this.bindActions();
  }

  public reset = () => {
    this.stopAllCoroutines();
  }

  *action() {
    const { coroutines } = this.props;

    // fade in
    this.fadeDirection = FadeDirection.In;
    yield* coroutines.waitForTime(1000, (t) => {
      this.fade = t;
    }, false);

    this.showing[RenderItem.Title] = true;

    yield* coroutines.waitForAnyKey(() => {
      this.drawPressAnyKey();
    });

    this.showing[RenderItem.Title] = false;
    this.props.gfx.clear(0, 0, 0, 0);

    // fade out
    this.fadeDirection = FadeDirection.Out;
    yield* coroutines.waitForTime(200, (t) => {
      this.fade = 1 - t;
    }, false);

    this.props.gfx.clear(0, 0, 0, 0);
    this.cleanup();
  }

  keyPressed = () => {};

  draw = () => {
    const p5 = this.props.p5;
    const gfxFGAction = this.gfxFGAction;
    const gfxPresentation = this.props.gfx;
    const state = this.gameState;
    const segments = this.segments;
    const player = this.player;

    // render game elements
    this.onBeforeDraw();
    this.drawGameBackground();
    const fromColor = this.fadeDirection === FadeDirection.In ? "#6cc2dd" : "#00000000";
    this.drawBackground(this.bgColor(fromColor, "#000000ce", Easing.inOutQuad(this.fade)), gfxFGAction);
    this.drawBackground(this.bgColor('#00000000', "#00000066", Easing.inOutQuad(this.fade)), gfxPresentation);
    this.drawParticles(0);
    for (let i = 0; i < segments.length; i++) {
      this.drawPlayerSegment(segments.get(i), i);
    }
    for (let i = 0; i < segments.length; i++) {
      this.erasePlayerSegmentCorner(segments.get(i), i);
    }
    this.drawPlayerHead(player.position);

    // render UI overlay
    if (this.showing[RenderItem.Title]) {
      this.drawTitle(this.titleText, 'secondary');
    }

    // tick time elapsed
    state.actualTimeElapsed += p5.deltaTime;
    this.renderer.tick();
    this.tick();
  };

  private bgColor = (fromColor: string, toColor: string, amount: number) => {
    const p5 = this.props.p5;
    return p5.lerpColor(p5.color(fromColor), p5.color(toColor), amount).toString()
  }

  private drawTitle = (title: string, type: 'primary' | 'secondary') => {
    const color = type === "primary" ? ACCENT_COLOR : SECONDARY_ACCENT_COLOR;
    const bgColor = type === "primary" ? "#000" : SECONDARY_ACCENT_COLOR_BG;
    const { p5, gfx, fonts } = this.props;
    gfx.textAlign(p5.CENTER, p5.CENTER);
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke(bgColor)
    gfx.strokeWeight(2 * 4);
    gfx.textSize(2 * 32.5);
    gfx.fill(bgColor);
    gfx.text(title, ...this.getPosition(0.5, 0.21));
    gfx.textSize(2 * 32);
    gfx.fill(color);
    gfx.text(title, ...this.getPosition(0.5, 0.2));
  }

  private drawPressAnyKey = () => {
    const { p5, gfx, fonts } = this.props;
    gfx.fill('#fff');
    gfx.noStroke();
    gfx.textFont(fonts.variants.miniMood);
    gfx.textSize(2 * 14);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.fill('#fff');
    gfx.text('[PRESS ANY KEY]', ...this.getPosition(0.5, 0.8));
  }
}
