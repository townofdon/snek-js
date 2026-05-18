import P5 from 'p5';

import {
  EditorOptions,
  ExtendedPalette,
  Palette,
  ThreatType,
  Image,
  EditorGraphicalComponents,
  DrawSquareOptions,
  SpritesheetRange,
} from '../types';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { Renderer } from '../engine/renderer';
import { Fonts } from '../fonts';
import { getExtendedPalette } from '../palettes';
import { EDITOR_DEFAULTS, SKETCH_DEFAULTS } from './editorConstants';
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from '@/constants';

export interface EditorState {
  dirty: boolean,
  extendedPalette: ExtendedPalette,
}

export interface SidebarThreatTypesSketchReturn {
  setOptions: (options: EditorOptions) => void,
  cleanup: () => void,
}

export const sidebarThreatTypesSketch = (container: HTMLElement, canvas: Record<ThreatType, React.MutableRefObject<HTMLCanvasElement>>): SidebarThreatTypesSketchReturn => {
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

  const canvasSizeX = BLOCK_SIZE_X;
  const canvasSizeY = BLOCK_SIZE_Y;

  const sketch = (p5: P5) => {
    const { gameState, replay, screenShake, tutorial } = SKETCH_DEFAULTS;
    const gfx = {
      [ThreatType.None]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.None].current),
      [ThreatType.Mine]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.Mine].current),
      [ThreatType.Bomb]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.Bomb].current),
      [ThreatType.LaserDiode]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.LaserDiode].current),
      [ThreatType.ExplodableBarrel]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.ExplodableBarrel].current),
      [ThreatType.Spikes]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.Spikes].current),
      [ThreatType.WallSpikes]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.WallSpikes].current),
      [ThreatType.Saw]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.Saw].current),
      [ThreatType.Flamethrower]: p5.createGraphics(canvasSizeX, canvasSizeY, p5.P2D, canvas[ThreatType.Flamethrower].current),
    } satisfies Record<ThreatType, P5.Graphics>;
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
      p5.createCanvas(1, 1, p5.P2D).id("sidebar-threat-types-canvas");
      Object.values(ThreatType).forEach(threatType => {
        if (typeof threatType === 'string') return;
        threatType;
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
        state.extendedPalette = getExtendedPalette(options.palette);
        spriteRenderer.setThemedAppleImage(state.extendedPalette);
        spriteRenderer.setThemedBorderImages(state.extendedPalette);
        spriteRenderer.setThemedDoorImage(state.extendedPalette);
        renderer.invalidateStaticCache();
        renderElements();
      }
    }

    function renderElements() {
      Object.values(ThreatType).filter(v => typeof v !== 'string').forEach(barrierType => {
        gfx[barrierType].clear(0, 0, 0, 0);
      });
      const x = 0;
      const y = 0;
      spriteRenderer.drawSpritesheetAnim3x3(gfx[ThreatType.Mine], Image.MineSheet, x, y, 0);
      spriteRenderer.drawSpritesheetAnim1x1(gfx[ThreatType.Bomb], SpritesheetRange.Bomb, x, y, 0);
      spriteRenderer.drawSpritesheetAnim1x1(gfx[ThreatType.LaserDiode], SpritesheetRange.DiodeBlue, x, y, 0);
      spriteRenderer.drawSpritesheetAnim3x3(gfx[ThreatType.ExplodableBarrel], SpritesheetRange.Barrel, x, y, 0);

      // TODO: DRAW ADD'L THREATS
    }
  }

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    setOptions,
    cleanup,
  } satisfies SidebarThreatTypesSketchReturn;
}
