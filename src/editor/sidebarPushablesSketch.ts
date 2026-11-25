import P5 from 'p5';

import {
  Image,
  PushableType,
  PushableFrame,
  DIR,
  SpritesheetRange,
} from '../types';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { newRenderer } from '@/engine/renderer';
import { Fonts } from '../fonts';
import { SKETCH_DEFAULTS } from './editorConstants';
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from '@/constants';
import { getRotationFromDirection, withFlipx } from '@/utils';

export interface EditorState {
  dirty: boolean,
}

export interface SidebarPushablesSketchReturn {
  cleanup: () => void,
}

export const sidebarPushablesSketch = (container: HTMLElement, canvas: Record<PushableType, React.MutableRefObject<HTMLCanvasElement>>): SidebarPushablesSketchReturn => {
  const state: EditorState = {
    dirty: true,
  }

  const canvasSizeX = BLOCK_SIZE_X;
  const canvasSizeY = BLOCK_SIZE_Y;

  const sketch = (p5: P5) => {
    const { screenShake, replay, gameState, tutorial } = SKETCH_DEFAULTS;
    const gfx: Record<PushableType, P5.Graphics> = {
      [PushableType.None]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.None].current),
      [PushableType.Box1]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.Box1].current),
      [PushableType.Box1B]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.Box1B].current),
      [PushableType.Box2]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.Box2].current),
      [PushableType.Box2B]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.Box2B].current),
      [PushableType.Box2R]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.Box2R].current),
      [PushableType.MirrorNE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.MirrorNE].current),
      [PushableType.MirrorNW]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.MirrorNW].current),
      [PushableType.MirrorSE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.MirrorSE].current),
      [PushableType.MirrorSW]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.MirrorSW].current),
      [PushableType.Yuzu]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PushableType.Yuzu].current),
    } satisfies Record<PushableType, P5.Graphics>;
    const fonts = new Fonts(p5);
    const spriteRenderer = new SpriteRenderer({ p5, screenShake });
    const renderer = newRenderer({ p5, fonts, replay, gameState, screenShake, spriteRenderer, tutorial });

    /**
     * https://p5js.org/reference/#/p5/preload
     */
    p5.preload = preload;
    function preload() {
      fonts.load();
      spriteRenderer.loadImages();
      spriteRenderer.loadEditorImages();
    }

    /**
     * https://p5js.org/reference/#/p5/setup
     */
    p5.setup = setup;
    function setup() {
      // create 1x1 canvas - p5 creates a default canvas and we don't need it.
      p5.createCanvas(1, 1, p5.P2D).id("sidebar-pushables-canvas");
      renderer.reset();
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      if (!renderer.initialized()) return;
      if (state.dirty) {
        state.dirty = false;
        renderer.invalidateStaticCache();
        Object.keys(gfx).map(Number).forEach((key: PushableType) => {
          gfx[key].clear(0, 0, 0, 0);
        });
      }
      renderElements();
      renderer.tick();
    }

    function renderElements() {
      const x = 0;
      const y = 0;
      spriteRenderer.drawSprite1x1(gfx[PushableType.Box1], Image.PushableSheet, x, y, PushableFrame.Box1 - 1);
      spriteRenderer.drawSprite1x1(gfx[PushableType.Box1B], Image.PushableSheet, x, y, PushableFrame.Box1B - 1);
      spriteRenderer.drawSprite1x1(gfx[PushableType.Box2], Image.PushableSheet, x, y, PushableFrame.Box2 - 1);
      spriteRenderer.drawSprite1x1(gfx[PushableType.Box2B], Image.PushableSheet, x, y, PushableFrame.Box2B - 1);
      spriteRenderer.drawSprite1x1(gfx[PushableType.Box2R], Image.PushableSheet, x, y, PushableFrame.Box2R - 1);
      spriteRenderer.drawSprite1x1(gfx[PushableType.MirrorNE], Image.PushableSheet, x, y, PushableFrame.MirrorWood - 1);
      withFlipx(gfx[PushableType.MirrorNW], x, y, true, (tx, ty) => {
        spriteRenderer.drawSprite1x1(gfx[PushableType.MirrorNW], Image.PushableSheet, tx, ty, PushableFrame.MirrorWood - 1);
      });
      withFlipx(gfx[PushableType.MirrorSE], x, y, true, (tx, ty) => {
        spriteRenderer.drawSprite1x1(gfx[PushableType.MirrorSE], Image.PushableSheet, tx, ty, PushableFrame.MirrorWood - 1, getRotationFromDirection(DIR.LEFT));
      });
      spriteRenderer.drawSprite1x1(gfx[PushableType.MirrorSW], Image.PushableSheet, x, y, PushableFrame.MirrorWood - 1, getRotationFromDirection(DIR.LEFT));
      spriteRenderer.drawSpritesheetAnim1x1(gfx[PushableType.Yuzu], SpritesheetRange.Yuzu , x, y, renderer.getElapsed());
    }
  }

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    cleanup,
  } satisfies SidebarPushablesSketchReturn;
}
