import P5 from 'p5';

import {
  MapAnnotation,
  Image,
} from '../types';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { Renderer } from '../engine/renderer';
import { Fonts } from '../fonts';
import { SKETCH_DEFAULTS } from './editorConstants';
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from '@/constants';

export interface EditorState {
  dirty: boolean,
}

export interface SidebarAnnotationsSketchReturn {
  cleanup: () => void,
}

export const sidebarAnnotationsSketch = (container: HTMLElement, canvas: Record<MapAnnotation, React.MutableRefObject<HTMLCanvasElement>>): SidebarAnnotationsSketchReturn => {
  const state: EditorState = {
    dirty: true,
  }

  const canvasSizeX = BLOCK_SIZE_X;
  const canvasSizeY = BLOCK_SIZE_Y;

  const sketch = (p5: P5) => {
    const { gameState, replay, screenShake, tutorial } = SKETCH_DEFAULTS;
    const gfx = {
      [MapAnnotation.None]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L1].current),
      [MapAnnotation.L1]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L1].current),
      [MapAnnotation.L2]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L2].current),
      [MapAnnotation.L3]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L3].current),
      [MapAnnotation.L4]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L4].current),
      [MapAnnotation.L5]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L5].current),
      [MapAnnotation.L6]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L6].current),
      [MapAnnotation.L7]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L7].current),
      [MapAnnotation.L8]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L8].current),
      [MapAnnotation.L9]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.L9].current),
      [MapAnnotation.LA]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[MapAnnotation.LA].current),
    } satisfies Record<MapAnnotation, P5.Graphics>;
    const fonts = new Fonts(p5);
    const spriteRenderer = new SpriteRenderer({ p5, screenShake });
    const renderer = new Renderer({ p5, fonts, replay, gameState, screenShake, spriteRenderer, tutorial });

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
      p5.createCanvas(1, 1, p5.P2D).id("sidebar-annotations-canvas");
      Object.values(MapAnnotation).forEach(barrierType => {
        if (typeof barrierType === 'string') return;
        barrierType;
      });
      renderer.reset();
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      if (state.dirty) {
        state.dirty = false;
        renderer.invalidateStaticCache();
        renderElements();
      }
    }

    function renderElements() {
      Object.values(MapAnnotation).filter(v => typeof v !== 'string').forEach(barrierType => {
        gfx[barrierType].clear(0, 0, 0, 0);
      });
      const x = 0;
      const y = 0;
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L1], Image.EditorAnnotationsSheet, x, y, 0);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L2], Image.EditorAnnotationsSheet, x, y, 1);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L3], Image.EditorAnnotationsSheet, x, y, 2);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L4], Image.EditorAnnotationsSheet, x, y, 3);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L5], Image.EditorAnnotationsSheet, x, y, 4);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L6], Image.EditorAnnotationsSheet, x, y, 5);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L7], Image.EditorAnnotationsSheet, x, y, 6);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L8], Image.EditorAnnotationsSheet, x, y, 7);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.L9], Image.EditorAnnotationsSheet, x, y, 8);
      spriteRenderer.drawSprite1x1Static(gfx[MapAnnotation.LA], Image.EditorAnnotationsSheet, x, y, 9);
    }
  }

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    cleanup,
  } satisfies SidebarAnnotationsSketchReturn;
}
