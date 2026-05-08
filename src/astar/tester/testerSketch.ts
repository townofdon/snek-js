import P5, { Vector } from 'p5';

import {
  BLOCK_SIZE_X,
  BLOCK_SIZE_Y,
  DIMENSIONS,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  PICKUP_SPRITE_FRAME_MAP,
} from "@/constants";
import {
  DIR,
  DrawSquareOptions,
  EditorGraphicalComponents,
  Image,
  PickupType,
  PreyType,
} from '@/types';
import { SpriteRenderer } from '@/engine/spriteRenderer';
import { Renderer } from '@/engine/renderer';
import { Fonts } from '@/fonts';
import { PALETTE, getExtendedPalette } from '@/palettes';
import { coordToVec, getCoordIndex2, getRotationFromDirection } from '@/utils';
import { SKETCH_DEFAULTS } from '@/editor/editorConstants';
import { TesterData } from './testerTypes';

interface SketchState {
  dirty: boolean,
  colorsDirty: boolean,
  mouseAt: number,
  selected: number,
}

export interface TesterSketchReturn {
  setMouseAt: (coord: number) => void,
  setData: (data: TesterData) => void,
  cleanup: () => void,
}

export const testerSketch = (container: HTMLElement, canvas: React.MutableRefObject<HTMLCanvasElement>): TesterSketchReturn => {
  const state: SketchState = {
    dirty: true,
    colorsDirty: true,
    mouseAt: -1,
    selected: 463,
  } satisfies SketchState;
  const data: TesterData = {
    agents: {},
    walls: {},
    mines: {},
    playerPosition: -1,
  } satisfies TesterData;

  const setMouseAt = (incoming: number): void => {
    state.mouseAt = incoming;
  }
  const setData = (incoming: TesterData): void => {
    const getIsDiff = (key: keyof TesterData): boolean => {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          // @ts-ignore
          if (data[key][coord] !== incoming[key][coord]) {
            return true;
          }
        }
      }
      return false;
    }
    Object.keys(incoming).forEach((key: keyof TesterData) => {
      switch (key) {
        case 'agents':
        case 'walls':
        case 'mines':
          if (getIsDiff(key)) {
            // @ts-ignore
            data[key] = { ...incoming[key] };
            state.dirty = true;
          }
          break;
        case 'playerPosition':
          if (data[key] !== incoming[key]) {
            data[key] = incoming[key];
            state.dirty = true;
          }
          break;
        default:
          throw new Error(`no case for key "${key}"`)
      }
    })
  }

  const sketch = (p5: P5) => {
    const { gameState, replay, screenShake, tutorial } = SKETCH_DEFAULTS
    const palette = getExtendedPalette(PALETTE.burningCity);
    const gfx: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
    const graphicalComponents: EditorGraphicalComponents = {
      deco1: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      deco2: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      barrier: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      barrierPassable: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      door: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      apple: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      snakeHead: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      snakeSegment: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
      nospawn: p5.createGraphics(BLOCK_SIZE_X * 3, BLOCK_SIZE_Y * 3),
    }
    const fonts = new Fonts(p5);
    const spriteRenderer = new SpriteRenderer({ p5, screenShake });
    const renderer = new Renderer({ p5, fonts, replay, gameState, screenShake, spriteRenderer, tutorial });
    const drawPlayerOptions: DrawSquareOptions = { is3d: true, optimize: true }
    const drawAppleOptions: DrawSquareOptions = { size: 0.8, is3d: true, optimize: true }
    const drawBasicOptions: DrawSquareOptions = { optimize: true }

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
      p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y, p5.P2D).id("editor-canvas");
      p5.frameRate(60);
      canvas.current = document.getElementById("editor-canvas") as HTMLCanvasElement;

      renderer.reset();
      spriteRenderer.setThemedAppleImage(palette);
      spriteRenderer.setThemedBorderImages(palette);
      spriteRenderer.setThemedDoorImage(palette);
      cacheGraphicalComponents();
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      // prevent freezing due to animation frame build up if tab loses focus
      if (p5.deltaTime > 3000) return;

      if (state.dirty) {
        state.dirty = false;
        renderer.invalidateStaticCache();
      }
      renderElements();
    }

    const checkerboard01 = '#121619';
    const checkerboard02 = '#232529';

    function cacheGraphicalComponents() {
      renderer.invalidateStaticCache();
      const colors = palette;
      renderer.clearGraphicalComponent(graphicalComponents.barrier);
      renderer.drawSquareCustom(graphicalComponents.barrier, 1, 1, colors.barrier, colors.barrierStroke, drawBasicOptions);
      renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'light', colors.barrierBorderLight, true);
      renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'dark', colors.barrierBorderDark, true);
      renderer.drawXCustom(graphicalComponents.barrier, 1, 1, colors.barrierStroke);

      renderer.clearGraphicalComponent(graphicalComponents.barrierPassable);
      renderer.drawSquareCustom(graphicalComponents.barrierPassable, 1, 1, colors.passableStroke, colors.passableStroke, drawBasicOptions);
      renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 1, 1, 'light', colors.passableBorderLight, true);
      renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 1, 1, 'dark', colors.passableBorderDark, true);

      renderer.clearGraphicalComponent(graphicalComponents.door);
      renderer.drawSquareCustom(graphicalComponents.door, 1, 1, colors.door, colors.doorStroke, drawBasicOptions);
      renderer.drawSquareBorderCustom(graphicalComponents.door, 1, 1, 'light', colors.doorStroke, false);
      renderer.drawSquareBorderCustom(graphicalComponents.door, 1, 1, 'dark', colors.doorStroke, false);

      renderer.clearGraphicalComponent(graphicalComponents.snakeHead);
      renderer.drawSquareCustom(graphicalComponents.snakeHead, 1, 1, colors.playerHead, colors.playerHead, drawPlayerOptions);

      renderer.clearGraphicalComponent(graphicalComponents.snakeSegment);
      renderer.drawSquareCustom(graphicalComponents.snakeSegment, 1, 1, colors.playerTail, colors.playerTailStroke, drawPlayerOptions);

      renderer.clearGraphicalComponent(graphicalComponents.apple);
      renderer.drawSquareCustom(graphicalComponents.apple, 1, 1, colors.apple, colors.appleStroke, drawAppleOptions);

      renderer.clearGraphicalComponent(graphicalComponents.deco1);
      renderer.drawSquareCustom(graphicalComponents.deco1, 1, 1, checkerboard01, checkerboard01, drawBasicOptions);

      renderer.clearGraphicalComponent(graphicalComponents.deco2);
      renderer.drawSquareCustom(graphicalComponents.deco2, 1, 1, checkerboard02, checkerboard02, drawBasicOptions);

      renderer.clearGraphicalComponent(graphicalComponents.nospawn);
      renderer.drawXCustom(graphicalComponents.nospawn, 1, 1, PALETTE.atomic.apple);
    }

    function renderElements() {
      p5.background(palette.background);
      if (!renderer.getIsStaticCached()) {
        gfx.clear(0, 0, 0, 0);
        gfx.background(checkerboard01);
      }

      const snakeAlpha = 0.75;

      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);

          // checkerboard
          if ((x + y) % 2 == 0) {
            // renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.deco1, x, y);
          } else {
            renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.deco2, x, y);
          }

          if (data.walls[coord]) {
            renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.barrier, x, y);
          }

          if (data.mines[coord]) {
            spriteRenderer.drawSpritesheetAnim3x3Static(gfx, Image.MineSheet, x, y, 0);
          }

          if (data.agents[coord]) {
            const preyType = data.agents[coord];
            switch (preyType) {
              case PreyType.Grub:
                spriteRenderer.drawSprite1x1(gfx, Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Burger] - 1);
                break;
              case PreyType.FieldMouse:
                spriteRenderer.drawSprite1x1(gfx, Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Cheese] - 1);
                break;
              case PreyType.Ant:
                spriteRenderer.drawSprite1x1(gfx, Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Egg] - 1);
                break;
              case PreyType.Grasshopper:
                spriteRenderer.drawSprite1x1(gfx, Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Broccoli] - 1);
                break;
            }
          }
        }
      }

      const px = Math.floor(data.playerPosition % GRIDCOUNT_X);
      const py = Math.floor(data.playerPosition / GRIDCOUNT_X);
      renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.snakeHead, px, py, snakeAlpha);
      spriteRenderer.drawImage3x3Static(gfx, Image.SnekHead, px, py, getRotationFromDirection(DIR.RIGHT), snakeAlpha);

      renderer.drawStaticGraphics(gfx);

      drawEditorSelection();

      renderer.tick();
      gameState.timeElapsed += p5.deltaTime;
      gameState.actualTimeElapsed += p5.deltaTime;
    }

    function drawEditorSelection() {
      if (state.mouseAt >= 0) {
        const to = coordToVec(state.mouseAt);
        spriteRenderer.drawImage3x3(Image.EditorSelection, to.x, to.y, 0, 1, 0);
      }
      if (state.selected >= 0) {
        const sel = coordToVec(state.selected);
        spriteRenderer.drawImage3x3(Image.EditorSelectionBlue, sel.x, sel.y, 0, 1, 0);
      }
    }

  }; // end sketch

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    setData,
    setMouseAt,
    cleanup,
  } satisfies TesterSketchReturn;
}
