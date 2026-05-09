import P5 from "p5";
import { FontsInstance, GameState, PlayerState, SceneCallbacks, SFXInstance } from "@/types";
import { BaseScene } from "./BaseScene";
import { SpriteRenderer } from "@/engine/spriteRenderer";
import { MusicPlayer } from "@/engine/musicPlayer";
import { VectorList } from "@/collections/vectorList";
import { Renderer } from "@/engine/renderer";
import { ACCENT_COLOR, SECONDARY_ACCENT_COLOR, SECONDARY_ACCENT_COLOR_BG } from "@/constants";
import { Easing } from "@/easing";

interface AcquireCallbacks {
  onBeforeDraw: (deltaTime: number) => void
  onAcquire: () => void
}

export interface AcquirePickupSceneConstructorArgs {
  p5: P5;
  gfxFGAction: P5.Graphics;
  gfxPresentation: P5.Graphics;
  sfx: SFXInstance;
  musicPlayer: MusicPlayer;
  fonts: FontsInstance;
  renderer: Renderer;
  spriteRenderer: SpriteRenderer;
  callbacks: SceneCallbacks & AcquireCallbacks;
  gameState: GameState;
  segments: VectorList;
  player: PlayerState;
  // rendering
  drawGameBackground: () => void
  drawPlayerHead: (vec: P5.Vector) => void
  drawPlayerSegment: (vec: P5.Vector, i?: number) => void
  erasePlayerSegmentCorner: (vec: P5.Vector, i?: number) => void
  drawParticles: (zIndexPass?: number) => void
}

enum RenderItem {
  Title,
  Text2,
  Text3,
  PressAnyKey,
}
enum FadeType {
  Black,
  Blue,
}

const TSMOD = 0.8;

const defaultShowing = {
  [RenderItem.Title]: false,
  [RenderItem.Text2]: false,
  [RenderItem.Text3]: false,
  [RenderItem.PressAnyKey]: false
} satisfies Record<RenderItem, boolean>

export class AcquirePickupScene extends BaseScene {
  private gfxFGAction: P5.Graphics;
  private sfx: SFXInstance;
  private musicPlayer: MusicPlayer;
  private renderer: Renderer;
  private spriteRenderer: SpriteRenderer;
  private gameState: GameState;
  private segments: VectorList;
  private player: PlayerState;

  private onBeforeDraw: (deltaTime: number) => void;
  private onAcquire: () => void;
  private drawGameBackground: () => void;
  private drawPlayerHead: (vec: P5.Vector) => void;
  private drawPlayerSegment: (vec: P5.Vector, i?: number) => void;
  private erasePlayerSegmentCorner: (vec: P5.Vector, i?: number) => void;
  private drawParticles: (zIndexPass?: number) => void;

  private title: string = 'HOLY SNEK!';
  private text2: string = '';
  private text3: string = '';

  private fade: number = 0;
  private fadeDirection: FadeType = FadeType.Blue;

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
    this.onBeforeDraw = callbacks.onBeforeDraw;
    this.onAcquire = callbacks.onAcquire;
    this.drawGameBackground = drawGameBackground;
    this.drawPlayerHead = drawPlayerHead;
    this.drawPlayerSegment = drawPlayerSegment;
    this.erasePlayerSegmentCorner = erasePlayerSegmentCorner;
    this.drawParticles = drawParticles;
  }

  public trigger = (titleText: string, text2 = '', text3 = '') => {
    this.fade = 0;
    this.fadeDirection = FadeType.Blue;
    this.title = titleText;
    this.text2 = text2;
    this.text3 = text3;
    this.showing = { ...defaultShowing };
    this.bindActions();
  }

  public reset = () => {
    this.stopAllCoroutines();
  }

  *action() {
    const { coroutines } = this.props;

    // fade in
    this.fadeDirection = FadeType.Black;
    yield* coroutines.waitForTime(1000, (t) => {
      this.fade = t;
    }, false);

    this.showing[RenderItem.Title] = true;

    yield* coroutines.waitForTime(2000, (t) => {
      this.gameState.acquireProgression = Easing.outQuad(t);
    }, false);

    this.onAcquire();
    this.showing[RenderItem.Text2] = true;
    this.showing[RenderItem.Text3] = true;

    this.fadeDirection = FadeType.Blue;
    this.fade = 0;
    yield* coroutines.waitForTime(2000, (t) => {
      this.fade = Easing.outQuad(t);
    }, true);

    this.fadeDirection = FadeType.Black;

    this.showing[RenderItem.PressAnyKey] = true;
    yield* coroutines.waitForAnyKey();

    this.showing[RenderItem.Title] = false;
    this.showing[RenderItem.Text2] = false;
    this.showing[RenderItem.Text3] = false;
    this.showing[RenderItem.PressAnyKey] = false;
    this.props.gfx.clear(0, 0, 0, 0);

    // fade out
    this.fadeDirection = FadeType.Black;
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
    this.onBeforeDraw(p5.deltaTime);
    this.drawGameBackground();
    const fromColor = this.fadeDirection === FadeType.Blue ? "#9adef3" : "#00000000";
    this.drawBackground(this.lerpc(fromColor, "#000000ce", Easing.inOutQuad(this.fade)), gfxFGAction);
    this.drawBackground(this.lerpc('#00000000', "#00000066", Easing.inOutQuad(this.fade)), gfxPresentation);
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
      this.drawTitle(this.title, 0.2, 'secondary');
    }
    if (this.showing[RenderItem.Text2] && this.text2) {
      this.drawParagraph(this.text2, 0.65);
    }
    if (this.showing[RenderItem.Text3] && this.text3) {
      this.drawParagraph(this.text3, 0.7);
    }
    if (this.showing[RenderItem.PressAnyKey]) {
      this.drawPressAnyKey(0.85);
    }

    // tick time elapsed
    state.actualTimeElapsed += p5.deltaTime;
    this.renderer.tick();
    this.tick();
  };

  private lerpc = (fromColor: string, toColor: string, amount: number) => {
    const p5 = this.props.p5;
    return p5.lerpColor(p5.color(fromColor), p5.color(toColor), amount).toString()
  }

  private drawTitle = (title: string, yPos: number, type: 'primary' | 'secondary') => {
    const color = type === "primary" ? ACCENT_COLOR : SECONDARY_ACCENT_COLOR;
    const bgColor = type === "primary" ? "#000" : SECONDARY_ACCENT_COLOR_BG;
    const { p5, gfx, fonts } = this.props;
    gfx.textAlign(p5.CENTER, p5.CENTER);
    gfx.textFont(fonts.variants.miniMood);
    gfx.stroke(bgColor);
    gfx.strokeWeight(8);
    gfx.textSize(TSMOD * 65);
    gfx.fill(bgColor);
    gfx.text(title, ...this.getPosition(0.5, yPos + 0.01));
    gfx.strokeWeight(0);
    gfx.textSize(TSMOD * 64);
    gfx.fill(color);
    gfx.text(title, ...this.getPosition(0.5, yPos));
  }

  // replace *text* with accent color
  private drawParagraph = (message: string, yPos: number, color: string = "#fff") => {
    const { p5, gfx, fonts } = this.props;
    const lineHeight = gfx.textLeading();
    gfx.textFont(fonts.variants.miniMood);
    gfx.fill(color);
    gfx.stroke("#000");
    gfx.strokeWeight(2 * 2);
    gfx.textSize(TSMOD * 2 * 14);
    gfx.textAlign(p5.LEFT, p5.TOP);
    const rectWidth = 2 * 250;
    const rect = this.getRect(0.5, yPos, rectWidth, lineHeight);
    const renderText = (text: string, xOffset: number, yOffset: number, accent: boolean) => {
      gfx.fill(accent ? ACCENT_COLOR : color);
      gfx.text(text, rect[0] + xOffset, rect[1] + yOffset, rect[2], rect[3]);
    }
    const lines = this._getParagraphLines(message, rectWidth, fonts.variants.miniMood, 2 * 14);
    for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
      const line = lines[lineNumber] || '';
      const yOffset = lineHeight * lineNumber;
      const lineTextWidth = gfx.textWidth(line.replaceAll('*', ''));
      let xOffset = (rectWidth - lineTextWidth) / 2;
      // search for accent text - in this format: my *coffee* is *strong*
      const regex = /(?:.*?(\*.*?\*).*?)+?/gi;
      // convert matchAll to an array, then capture group is second item of said array
      const matches = [...line.matchAll(regex)].map(items => items[1]);
      let cursor = 0;
      // for each match, print text until match, then the match itself
      for (let j = 0; j < matches.length; j++) {
        // get substr until match
        const idx = line.indexOf(matches[j]);
        if (idx < 0) continue;
        const substr = line.substring(cursor, idx);
        const match = matches[j].replaceAll('*', '');
        renderText(substr, xOffset, yOffset, false);
        xOffset += gfx.textWidth(substr);
        renderText(match, xOffset, yOffset, true);
        xOffset += gfx.textWidth(match);
        cursor += idx + match.length;
      }
      // print any leftover text after all matches
      const trailingText = line.replaceAll('*', '').substring(cursor);
      if (trailingText) {
        renderText(trailingText, xOffset, yOffset, false);
      }
    }
  }

  private drawPressAnyKey = (yPos: number) => {
    const { p5, gfx, fonts } = this.props;
    gfx.fill('#fff');
    gfx.noStroke();
    gfx.textFont(fonts.variants.miniMood);
    gfx.textSize(TSMOD * 2 * 14);
    gfx.textAlign(p5.CENTER, p5.TOP);
    gfx.fill('#fff');
    gfx.text('[PRESS ANY KEY]', ...this.getPosition(0.5, yPos));
  }

  private _getParagraphLines = (paragraph: string, rectWidth: number, font: P5.Font, textSize: number): string[] => {
      const { p5 } = this.props;
      p5.textFont(font);
      p5.textSize(TSMOD * textSize);

      paragraph = paragraph.trim();
      let cursorStart = 0;
      let cursorLastSpaceFound = 0;
      let cursorEnd = 1;
      let numLines = 1;
      const lines: string[] = [];

      while (cursorEnd <= paragraph.length) {
        const currentChar = paragraph.substring(cursorEnd - 1, cursorEnd);
        if (currentChar === ' ' || currentChar === '\n' || cursorEnd === paragraph.length) {
          const testString = paragraph.substring(cursorStart, cursorEnd);
          const exceedsBounds = p5.textWidth(testString) + 5 >= rectWidth;
          if (exceedsBounds) {
            lines.push(paragraph.substring(cursorStart, cursorLastSpaceFound).trim());
            cursorStart = cursorLastSpaceFound + 1;
            numLines++;
          }
          if (currentChar === '\n') {
            lines.push(paragraph.substring(cursorStart, cursorEnd - 1).trim());
            cursorStart = cursorEnd;
            numLines++;
          }
          if (cursorEnd === paragraph.length) {
            lines.push(testString.trim());
          }
          cursorLastSpaceFound = cursorEnd - 1;
        }
        cursorEnd++;
      }

      return lines;
    }
}
