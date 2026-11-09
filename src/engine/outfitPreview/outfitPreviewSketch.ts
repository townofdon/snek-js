import P5, { Vector } from 'p5';

import {
  DIR,
  Outfit,
  PlayerState,
} from '../../types';
import { Gradients } from '../../collections/gradients';
import { Particles } from '../../collections/particles';
import { Emitters } from '../../collections/emitters';
import { SpriteRenderer } from '../spriteRenderer';
import { newRenderer } from '../renderer';
import { Fonts } from '../../fonts';
import { getExtendedPalette, PALETTE } from '../../palettes';
import { SKETCH_DEFAULTS } from '../../editor/editorConstants';
import { VectorList } from '@/collections/vectorList';
import { engineRendering, EngineRenderingArgs } from '../engineComponents/rendering';
import { DEFAULT_ENGINE_STATE, DEFAULT_GAME_STATE, DEFAULT_HELD_ITEMS, DEFAULT_REPLAY } from '@/defaults';
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from '@/constants';

export interface OutfitPreviewSketchReturn {
  cleanup: () => void,
}

export const OUTFIT_PREVIEW_SIZE_X = 5 * BLOCK_SIZE_X;
export const OUTFIT_PREVIEW_SIZE_Y = 5 * BLOCK_SIZE_Y;
export const OUTFIT_PREVIEW_SCALE = 2;

export const outfitPreviewSketch = (
  container: HTMLElement,
  canvas: React.MutableRefObject<HTMLCanvasElement>,
  outfit: Outfit,
  scale: number,
): OutfitPreviewSketchReturn => {
  const playerPosition = new Vector(2, 2);
  const segments = new VectorList();
  segments.add(1, 2);
  segments.add(1, 3);
  segments.add(0, 3);
  segments.add(-1, 3);
  const extendedPalette = getExtendedPalette(PALETTE.plumsea);

  const sketch = (p5: P5) => {
    const { screenShake, replay, gameState, tutorial } = SKETCH_DEFAULTS;
    const mainGfx: P5.Graphics = p5.createGraphics(OUTFIT_PREVIEW_SIZE_X, OUTFIT_PREVIEW_SIZE_Y);
    const gfx: P5.Graphics = p5.createGraphics(OUTFIT_PREVIEW_SIZE_X, OUTFIT_PREVIEW_SIZE_Y);
    const gradients = new Gradients(p5);
    const particles = new Particles(p5, gradients, screenShake); // z-index 0
    const particles10 = new Particles(p5, gradients, screenShake); // z-index 10
    const emitters = new Emitters(p5, particles);
    const emitters10 = new Emitters(p5, particles10);
    const fonts = new Fonts(p5);
    const spriteRenderer = new SpriteRenderer({ p5, screenShake });
    const renderer = newRenderer({ p5, fonts, replay, gameState, screenShake, spriteRenderer, tutorial });

    const player = {
      position: playerPosition,
      direction: DIR.RIGHT,
      directionToFirstSegment: DIR.LEFT,
      directionLastHit: DIR.UP,
    } satisfies PlayerState;

    const fns = engineRendering({
      p5,
      state: DEFAULT_GAME_STATE,
      es: DEFAULT_ENGINE_STATE,
      drawState: {
        shouldDrawApples: false,
        shouldDrawKeysLocks: false,
        shouldDrawActionFG: false,
        shouldRecalculateLasers: false,
      },
      loopState: {
        interval: undefined,
        timePrevMs: 0,
        timeAccumulatedMs: 0,
        timeScale: 0,
        deltaTime: 0,
      },
      player,
      segments,
      outfit,
      heldItems: DEFAULT_HELD_ITEMS,
      gfxPresentation: gfx,
      renderer,
      spriteRenderer,
      replay: DEFAULT_REPLAY,
      gradients: undefined,
      reversibleColorGradient: 0,
      invincibleColorGradient: 0,
      emitters,
      particles,
      emitters10,
      particles10,
    } satisfies EngineRenderingArgs);

    /**
     * https://p5js.org/reference/#/p5/preload
     */
    p5.preload = preload;
    function preload() {
      fonts.load();
      spriteRenderer.loadImages();
    }

    /**
     * https://p5js.org/reference/#/p5/setup
     */
    p5.setup = setup;
    function setup() {
      if (!outfit) throw new Error('outfit required');
      const id = `outfit-preview-canvas`;
      const p5Canvas = p5.createCanvas(OUTFIT_PREVIEW_SIZE_X * scale, OUTFIT_PREVIEW_SIZE_Y * scale, p5.P2D).id(id).class('outfit-preview-canvas');
      p5Canvas.elt.getContext('2d', { willReadFrequently: true });
      p5.frameRate(60);
      canvas.current = document.getElementById(id) as HTMLCanvasElement;
      fns.initGraphics();
      fns.cacheGraphicalComponents();
      spriteRenderer.setThemedSegmentImage(extendedPalette.playerTail, extendedPalette.playerTailStroke);
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      if (!renderer.initialized) return;
      // prevent freezing due to animation frame build up if tab loses focus
      if (p5.deltaTime > 3000) return;
      if (!outfit) return;

      renderer.reset();
      renderer.setGfxOverride(mainGfx);
      particles.setGfx(mainGfx);
      particles10.setGfx(mainGfx);
      emitters.reset();
      emitters10.reset();
      particles.reset();
      particles10.reset();

      renderer.invalidateStaticCache();
      mainGfx.background(extendedPalette.background);
      gfx.clear(0, 0, 0, 0);

      for (let i = 0; i < segments.length; i++) {
        fns.drawPlayerSegment(segments.get(i), i);
      }
      fns.drawPlayerHead(player.position);

      drawParticles(0);
      mainGfx.image(gfx, 0, 0, OUTFIT_PREVIEW_SIZE_X, OUTFIT_PREVIEW_SIZE_Y);
      drawParticles(10);

      const w = OUTFIT_PREVIEW_SIZE_X * scale;
      const h = OUTFIT_PREVIEW_SIZE_Y * scale;
      p5.image(mainGfx, 0, 0, w, h, 0, 0, OUTFIT_PREVIEW_SIZE_X, OUTFIT_PREVIEW_SIZE_Y);

      renderer.tick();
      renderer.setGfxOverride(null);
    }

    function drawParticles(zIndexPass = 0) {
      const deltaTime = 10000;
      if (zIndexPass < 10) {
        emitters.tick(deltaTime);
        particles.tick(deltaTime);
      } else if (zIndexPass < 20) {
        emitters10.tick(deltaTime);
        particles10.tick(deltaTime);
      }
    }
  };

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    cleanup,
  } satisfies OutfitPreviewSketchReturn;
}
