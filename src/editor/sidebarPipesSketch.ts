import P5 from 'p5';

import {
  Image,
  Palette,
  PipeConnection,
  PipeVariant,
} from '../types';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { newRenderer } from '@/engine/renderer';
import { Fonts } from '../fonts';
import { SKETCH_DEFAULTS } from './editorConstants';
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from '@/constants';
import { getExtendedPalette } from '@/palettes';

export interface EditorState {
  dirty: boolean,
  pipeVariant: PipeVariant,
  palette: Palette,
}

export interface SidebarPipesSketchReturn {
  setPipeVariant: (variant: PipeVariant) => void,
  setPalette: (palette: Palette) => void,
  cleanup: () => void,
}

export const sidebarPipesSketch = (container: HTMLElement, canvas: Record<PipeConnection, React.MutableRefObject<HTMLCanvasElement>>, initialPipeVariant: PipeVariant, initialPalette: Palette): SidebarPipesSketchReturn => {
  const state: EditorState = {
    dirty: true,
    pipeVariant: initialPipeVariant,
    palette: initialPalette,
  }

  const canvasSizeX = BLOCK_SIZE_X + 4;
  const canvasSizeY = BLOCK_SIZE_Y + 4;

  const setPipeVariant = (variant: PipeVariant) => {
    state.dirty = true;
    state.pipeVariant = variant;
  }

  const setPalette = (palette: Palette) => {
    state.dirty = true;
    state.palette = palette;
  }

  const sketch = (p5: P5) => {
    const { screenShake, replay, gameState, tutorial } = SKETCH_DEFAULTS;
    const gfx: Record<PipeConnection, P5.Graphics> = {
      [PipeConnection.Unset]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.Unset].current),
      [PipeConnection.W]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.W].current),
      [PipeConnection.NW]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.NW].current),
      [PipeConnection.SW]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.SW].current),
      [PipeConnection.NSW]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.NSW].current),
      [PipeConnection.E]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.E].current),
      [PipeConnection.NE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.NE].current),
      [PipeConnection.SE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.SE].current),
      [PipeConnection.NSE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.NSE].current),
      [PipeConnection.WE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.WE].current),
      [PipeConnection.NWE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.NWE].current),
      [PipeConnection.SWE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.SWE].current),
      [PipeConnection.NSWE]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.NSWE].current),
      [PipeConnection.Island]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.Island].current),
      [PipeConnection.Barrier]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.Barrier].current),
      [PipeConnection.Door]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.Door].current),
      [PipeConnection.N]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.N].current),
      [PipeConnection.S]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.S].current),
      [PipeConnection.NS]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[PipeConnection.NS].current),
      [PipeConnection.DoorOpen]: null,
      [PipeConnection.Cap]: null,
    } satisfies Record<PipeConnection, P5.Graphics>;
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
        const extendedPalette = getExtendedPalette(state.palette);
        spriteRenderer.setThemedAppleImage(extendedPalette);
        spriteRenderer.setThemedBorderImages(extendedPalette);
        spriteRenderer.setThemedDoorImage(extendedPalette);
        Object.keys(gfx).map(Number)
          .filter((key: PipeConnection) => (false
            && key !== PipeConnection.DoorOpen
            && key !== PipeConnection.Cap
          ))
          .forEach((key: PipeConnection) => {
            gfx[key].clear(0, 0, 0, 0);
          });
        renderElements();
      }
      renderer.tick();
    }

    function renderElements() {
      [
        PipeConnection.Barrier,
        PipeConnection.Door,
        PipeConnection.N,
        PipeConnection.S,
        PipeConnection.NS,
        PipeConnection.W,
        PipeConnection.NW,
        PipeConnection.SW,
        PipeConnection.NSW,
        PipeConnection.E,
        PipeConnection.NE,
        PipeConnection.SE,
        PipeConnection.NSE,
        PipeConnection.WE,
        PipeConnection.NWE,
        PipeConnection.SWE,
        PipeConnection.NSWE,
      ].forEach(pipe => {
        drawPipe(gfx[pipe], 0, 0, pipe);
      });
    }

    function drawPipe(pipeGfx: P5.Graphics, x: number, y: number, pipeConnection: PipeConnection) {
      // note: frame is 0-indexed
      const frame = pipeConnection % 19;
      if (state.pipeVariant === PipeVariant.Themed1) {
        spriteRenderer.drawSprite1x1Static(pipeGfx, Image.ThemedPipes1, x, y, frame);
      } else if (state.pipeVariant === PipeVariant.Themed2) {
        spriteRenderer.drawSprite1x1Static(pipeGfx, Image.ThemedPipes2, x, y, frame);
      } else if (state.pipeVariant === PipeVariant.Themed3) {
        spriteRenderer.drawSprite1x1Static(pipeGfx, Image.ThemedPipes3, x, y, frame);
      } else {
        const offset = (Math.max(state.pipeVariant, 1) - 1) * 19;
        spriteRenderer.drawSprite1x1Static(pipeGfx, Image.PipesSheet, x, y, frame + offset);
      }
    }
  }

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    setPipeVariant,
    setPalette,
    cleanup,
  } satisfies SidebarPipesSketchReturn;
}
