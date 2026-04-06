import P5 from 'p5';

import {
  EditorOptions,
  ExtendedPalette,
  Palette,
  BarrierType,
  Image,
  EditorGraphicalComponents,
  DrawSquareOptions,
} from '../types';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { Renderer } from '../engine/renderer';
import { Fonts } from '../fonts';
import { getExtendedPalette } from '../palettes';
import { EDITOR_DEFAULTS, SKETCH_DEFAULTS } from './editorConstants';
import { BLOCK_SIZE } from '@/constants';

export interface EditorState {
  dirty: boolean,
  extendedPalette: ExtendedPalette,
}

export interface SidebarBarrierTypesSketchReturn {
  setOptions: (options: EditorOptions) => void,
  cleanup: () => void,
}

export const sidebarBarrierTypesSketch = (container: HTMLElement, canvas: Record<BarrierType, React.MutableRefObject<HTMLCanvasElement>>): SidebarBarrierTypesSketchReturn => {
  const options: Pick<EditorOptions, 'palette'> = {
    palette: { ...EDITOR_DEFAULTS.options.palette },
  };
  const state: Pick<EditorState, 'dirty' | 'extendedPalette'> = {
    dirty: true,
    extendedPalette: getExtendedPalette(options.palette),
  }

  const setOptions = (incoming: EditorOptions): void => {
    const getIsDiffPalette = () => {
      const keys = Object.keys(incoming.palette) as (keyof Palette)[]
      for (let i = 0; i < keys.length; i++) {
        if (options.palette[keys[i]] !== incoming.palette[keys[i]]) {
          return true;
        }
      }
      return false;
    }
    if (getIsDiffPalette()) {
      options.palette = { ...incoming.palette };
      state.extendedPalette = getExtendedPalette(options.palette);
      state.dirty = true;
    }
  }

  const canvasSizeX = BLOCK_SIZE.x;
  const canvasSizeY = BLOCK_SIZE.y;

  const sketch = (p5: P5) => {
    const { gameState, replay, screenShake, tutorial } = SKETCH_DEFAULTS;
    const gfx = {
      [BarrierType.Unset]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Unset].current),
      [BarrierType.Default]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Default].current),
      [BarrierType.Skull]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Skull].current),
      [BarrierType.ThemedSkull]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.ThemedSkull].current),
      [BarrierType.Indent]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Indent].current),
      [BarrierType.ThemedIndent]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.ThemedIndent].current),
      [BarrierType.FireTile]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.FireTile].current),
      [BarrierType.Flat]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Flat].current),
      [BarrierType.ThemedFlat]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.ThemedFlat].current),
      [BarrierType.Pyramid]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Pyramid].current),
      [BarrierType.ThemedPyramid]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.ThemedPyramid].current),
      [BarrierType.ExitSign]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.ExitSign].current),
      [BarrierType.Radar]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Radar].current),
      [BarrierType.ComputerChip]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.ComputerChip].current),
      [BarrierType.MetalPlate]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.MetalPlate].current),
      [BarrierType.Panel0]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Panel0].current),
      [BarrierType.Panel1]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Panel1].current),
      [BarrierType.Panel2]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Panel2].current),
      [BarrierType.Panel3]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Panel3].current),
      [BarrierType.Panel4]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Panel4].current),
      [BarrierType.Panel5]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[BarrierType.Panel5].current),
    } satisfies Record<BarrierType, P5.Graphics>;
    const graphicalComponents: Pick<EditorGraphicalComponents, 'barrier'> = {
      barrier: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    }
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
      Object.values(BarrierType).forEach(barrierType => {
        if (typeof barrierType === 'string') return;
        barrierType;
      });
      renderer.reset();
      cacheGraphicalComponents();
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      if (state.dirty) {
        state.dirty = false;
        state.extendedPalette = getExtendedPalette(options.palette);
        spriteRenderer.setThemedAppleImage(state.extendedPalette);
        spriteRenderer.setThemedBorderImages(state.extendedPalette);
        spriteRenderer.setThemedDoorImage(state.extendedPalette);
        renderer.invalidateStaticCache();
        cacheGraphicalComponents();
        renderElements();
      }
    }

    function cacheGraphicalComponents() {
      const drawBasicOptions: DrawSquareOptions = { optimize: true };
      renderer.invalidateStaticCache();
      const colors = state.extendedPalette;
      renderer.clearGraphicalComponent(graphicalComponents.barrier);
      renderer.drawSquareCustom(graphicalComponents.barrier, 1, 1, colors.barrier, colors.barrierStroke, drawBasicOptions);
      renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'light', colors.barrierBorderLight, true);
      renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'dark', colors.barrierBorderDark, true);
      renderer.drawXCustom(graphicalComponents.barrier, 1, 1, colors.barrierStroke);
    }

    function renderElements() {
      Object.values(BarrierType).filter(v => typeof v !== 'string').forEach(barrierType => {
        gfx[barrierType].clear(0, 0, 0, 0);
      });
      const x = 0;
      const y = 0;
      spriteRenderer.drawSpritesheetAnim3x3(gfx[BarrierType.FireTile], Image.FireSheet, x, y, 0);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Skull], Image.TileSheet, x, y, 0);
      spriteRenderer.drawImage3x3Static(gfx[BarrierType.ThemedSkull], Image.ThemedBarrierSkull, x, y, 0, 1, 0);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Indent], Image.TileSheet, x, y, 2);
      spriteRenderer.drawImage3x3Static(gfx[BarrierType.ThemedIndent], Image.ThemedBarrierIndent, x, y, 0, 1, 0);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Flat], Image.TileSheet, x, y, 4);
      spriteRenderer.drawImage3x3Static(gfx[BarrierType.ThemedFlat], Image.ThemedBarrierFlat, x, y, 0, 1, 0);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Pyramid], Image.TileSheet, x, y, 6);
      spriteRenderer.drawImage3x3Static(gfx[BarrierType.ThemedPyramid], Image.ThemedBarrierPyramid, x, y, 0, 1, 0);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.ExitSign], Image.TileSheet, x, y, 13);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Radar], Image.TileSheet, x, y, 19);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.ComputerChip], Image.TileSheet, x, y, 20);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.MetalPlate], Image.TileSheet, x, y, 21);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Panel0], Image.TileSheet, x, y, 22);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Panel1], Image.TileSheet, x, y, 23);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Panel2], Image.TileSheet, x, y, 24);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Panel3], Image.TileSheet, x, y, 25);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Panel4], Image.TileSheet, x, y, 26);
      spriteRenderer.drawSprite3x3Static(gfx[BarrierType.Panel5], Image.TileSheet, x, y, 27);


      renderer.drawGraphicalComponentCustom(gfx[BarrierType.Default], graphicalComponents.barrier, x, y);
    }
  }

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    setOptions,
    cleanup,
  } satisfies SidebarBarrierTypesSketchReturn;
}
