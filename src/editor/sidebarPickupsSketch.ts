import P5 from 'p5';

import {
  MapAnnotation,
  Image,
  PickupType,
  DrawSquareOptions,
} from '../types';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { newRenderer } from '@/engine/renderer';
import { Fonts } from '../fonts';
import { SKETCH_DEFAULTS } from './editorConstants';
import { BLOCK_SIZE_X, BLOCK_SIZE_Y, INVINCIBILITY_COLOR_CYCLE_MS, NUM_SNAKE_INVINCIBLE_COLORS, PICKUP_SPRITE_FRAME_MAP, SNAKE_INVINCIBLE_COLORS } from '@/constants';
import { EditorPickupType } from './editorTypes';
import { Gradients } from '@/collections/gradients';

export interface EditorState {
  dirty: boolean,
}

export interface SidebarPickupsSketchReturn {
  cleanup: () => void,
}

export const sidebarPickupsSketch = (container: HTMLElement, canvas: Record<EditorPickupType, React.MutableRefObject<HTMLCanvasElement>>): SidebarPickupsSketchReturn => {
  const state: EditorState = {
    dirty: true,
  }

  const canvasSizeX = BLOCK_SIZE_X;
  const canvasSizeY = BLOCK_SIZE_Y;

  const sketch = (p5: P5) => {
    const { screenShake, replay, gameState, tutorial } = SKETCH_DEFAULTS;
    const gfx: Record<EditorPickupType, P5.Graphics> = {
      [PickupType.Invincibility]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PickupType.Invincibility].current),
      [PickupType.Armor]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PickupType.Armor].current),
      [PickupType.Reversibility]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PickupType.Reversibility].current),
    } satisfies Record<EditorPickupType, P5.Graphics>;
    const fonts = new Fonts(p5);
    const spriteRenderer = new SpriteRenderer({ p5, screenShake });
    const renderer = newRenderer({ p5, fonts, replay, gameState, screenShake, spriteRenderer, tutorial });
    const gradients = new Gradients(p5);
    const invincibleColorGradient = gradients.addMultiple(SNAKE_INVINCIBLE_COLORS.map(c => p5.color(c)), NUM_SNAKE_INVINCIBLE_COLORS);
    const drawInvincibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };

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
        Object.keys(gfx).map(Number).forEach((key: EditorPickupType) => {
          gfx[key].clear(0, 0, 0, 0);
        });
      }
      renderElements();
      renderer.tick();
    }

    function renderElements() {
      const x = 0;
      const y = 0;
      const cycle = Math.floor(renderer.getElapsed() / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(invincibleColorGradient, (cycle % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquareCustom(gfx[PickupType.Invincibility], x, y, color.toString(), color.toString(), drawInvincibilityPickupOptions);

      // spriteRenderer.drawSprite1x1Static(gfx[PickupType.Invincibility], Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Invincibility]);
      spriteRenderer.drawSprite1x1Static(gfx[PickupType.Armor], Image.Shield, x, y, 0, 0, 1);
      spriteRenderer.drawSprite1x1Static(gfx[PickupType.Reversibility], Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Reversibility]);
    }
  }

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    cleanup,
  } satisfies SidebarPickupsSketchReturn;
}
