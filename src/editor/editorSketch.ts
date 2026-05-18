import P5, { Vector } from 'p5';

import {
  BLOCK_SIZE_X,
  BLOCK_SIZE_Y,
  DIMENSIONS,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  INVINCIBILITY_COLOR_CYCLE_MS,
  NUM_SNAKE_INVINCIBLE_COLORS,
  PICKUP_SPRITE_FRAME_MAP,
  SNAKE_INVINCIBLE_COLORS,
} from "../constants";
import {
  DIR,
  DrawSquareOptions,
  EditorData,
  EditorOptions,
  ExtendedPalette,
  EditorGraphicalComponents,
  Image,
  KeyChannel,
  Palette,
  Portal,
  PortalChannel,
  BarrierType,
  PickupType,
  ThreatType,
  Threat48Frame,
  Threat16Frame,
  FRAME_COUNT_THREAT_16,
  FRAME_COUNT_THREAT_48,
  LaserCell,
  LaserType,
  Orientation,
  SpritesheetRange,
} from '../types';
import { Gradients } from '../collections/gradients';
import { Particles } from '../collections/particles';
import { Emitters } from '../collections/emitters';
import { PortalParticleSystem2 } from '../engine/particleSystems/PortalParticleSystem2';
import { PortalVortexParticleSystem2 } from '../engine/particleSystems/PortalVortexParticleSystem2';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { Renderer } from '../engine/renderer';
import { Fonts } from '../fonts';
import { PALETTE, getExtendedPalette } from '../palettes';
import {
  coordToVec,
  getCoordIndex2,
  getRotationFromDirection,
  isAtMapEdge,
  isValidKeyChannel,
  isValidPortalChannel,
  recalculateLasersMap,
} from "../utils";
import { EDITOR_DEFAULTS, SKETCH_DEFAULTS } from './editorConstants';
import { createLightmap, drawLighting, initLighting, updateLighting } from '../engine/lighting';
import { AnimationList } from '../collections/animationList';

export enum EditorTool {
  Pencil,
  Eraser,
  Line,
  Rectangle,
  Bucket, // fill
  Bomb, // clear all
  Undo,
  Redo,
}

export enum Operation {
  None,
  Write,
  Add,
  Remove,
}

export interface EditorState {
  showingPreview: boolean,
  dirty: boolean,
  colorsDirty: boolean,
  extendedPalette: ExtendedPalette,
  mouseAt: number,
  mouseFrom: number,
  operation: Operation,
  tool: EditorTool,
}

export interface EditorSketchReturn {
  setMouseAt: (coord: number) => void,
  setMouseFrom: (coord: number) => void,
  setOperation: (val: Operation) => void,
  setTool: (tool: EditorTool) => void,
  setData: (data: EditorData) => void,
  setOptions: (options: EditorOptions) => void,
  setShowingPreview: (val: boolean) => void,
  cleanup: () => void,
}

export interface ExtendedSketchData extends EditorData {
  lasersMap: Record<number, LaserCell>,
}

export const editorSketch = (container: HTMLElement, canvas: React.MutableRefObject<HTMLCanvasElement>): EditorSketchReturn => {
  const data: ExtendedSketchData = {
    barriersMap: {},
    passablesMap: {},
    doorsMap: {},
    decoratives1Map: {},
    decoratives2Map: {},
    nospawnsMap: {},
    applesMap: {},
    threatsMap: {},
    pickupsMap: {},
    keysMap: {},
    locksMap: {},
    portalsMap: {},
    lasersMap: {},
    playerSpawnPosition: EDITOR_DEFAULTS.data.playerSpawnPosition.copy(),
    startDirection: EDITOR_DEFAULTS.data.startDirection,
    switchesMap: {},
    pipesMap: {},
  } satisfies ExtendedSketchData;
  const options: Pick<EditorOptions, 'globalLight' | 'palette' | 'portalExitConfig'> = {
    globalLight: EDITOR_DEFAULTS.options.globalLight,
    palette: { ...EDITOR_DEFAULTS.options.palette },
    portalExitConfig: { ...EDITOR_DEFAULTS.options.portalExitConfig },
  };
  const state: EditorState = {
    showingPreview: false,
    dirty: true,
    colorsDirty: true,
    extendedPalette: getExtendedPalette(options.palette),
    mouseAt: -1,
    mouseFrom: -1,
    operation: Operation.None,
    tool: EditorTool.Pencil,
  }

  const setMouseAt = (incoming: number): void => {
    state.mouseAt = incoming;
  }
  const setMouseFrom = (incoming: number): void => {
    state.mouseFrom = incoming;
  }
  const setOperation = (incoming: Operation): void => {
    state.operation = incoming;
  }
  const setTool = (incoming: EditorTool) => {
    state.tool = incoming;
  }
  const setShowingPreview = (incoming: boolean): void => {
    state.showingPreview = incoming;
  }
  const setData = (incoming: EditorData): void => {
    const getIsDiff = (key: keyof EditorData): boolean => {
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
    Object.keys(incoming).forEach((key: keyof EditorData) => {
      switch (key) {
        case 'applesMap':
        case 'barriersMap':
        case 'decoratives1Map':
        case 'decoratives2Map':
        case 'doorsMap':
        case 'nospawnsMap':
        case 'passablesMap':
        case 'keysMap':
        case 'locksMap':
        case 'portalsMap':
        case 'threatsMap':
        case 'pickupsMap':
        case 'switchesMap':
        case 'pipesMap':
          if (getIsDiff(key)) {
            // @ts-ignore
            data[key] = { ...incoming[key] };
            state.dirty = true;
          }
          break;
        case 'playerSpawnPosition':
          if (!data[key].equals(incoming[key])) {
            data[key].set(incoming[key]);
            state.dirty = true;
          }
          break;
        case 'startDirection':
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
    const getIsDiffPortalExitConfig = () => {
      if (!options.portalExitConfig && !incoming.portalExitConfig) return false;
      if (!options.portalExitConfig || !incoming.portalExitConfig) return true;
      for (let i = 0; i < 10; i++) {
        if (isValidPortalChannel(i)) {
          if (options.portalExitConfig[i] !== incoming.portalExitConfig[i]) {
            return true;
          }
        }
      }
      return false;
    }
    Object.keys(incoming).forEach((key: keyof EditorOptions) => {
      switch (key) {
        case 'globalLight':
          if (options[key] !== incoming[key]) {
            options[key] = incoming[key];
            state.dirty = true;
          }
          break;
        case 'palette':
          if (getIsDiffPalette()) {
            options.palette = { ...incoming.palette };
            state.colorsDirty = true;
            state.dirty = true;
          }
          break;
        case 'portalExitConfig':
          if (getIsDiffPortalExitConfig()) {
            options.portalExitConfig = { ...incoming.portalExitConfig };
            state.dirty = true;
          }
          break;
        case 'applesToClear':
        case 'disableAppleSpawn':
        case 'spawnInvincibilityPickups':
        case 'spawnMines':
        case 'disableAppleSpawn':
        case 'extraHurtGraceTime':
        case 'name':
        case 'timeToClear':
        case 'numApplesStart':
        case 'snakeStartSize':
        case 'growthMod':
        case 'musicTrack':
          break;
        default:
          throw new Error(`no case for key "${key}"`)
      }
    })
  }

  const sketch = (p5: P5) => {
    const { gameState, replay, screenShake, tutorial } = SKETCH_DEFAULTS
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
    const gradients = new Gradients(p5);
    const particles = new Particles(p5, gradients, screenShake); // z-index 0
    const particles10 = new Particles(p5, gradients, screenShake); // z-index 10
    const emitters = new Emitters(p5, particles);
    const emitters10 = new Emitters(p5, particles10);
    const portalParticleSystem = new PortalParticleSystem2(p5, emitters10, gradients);
    const portalVortexParticleSystem = new PortalVortexParticleSystem2(p5, emitters, gradients);
    const fonts = new Fonts(p5);
    const spriteRenderer = new SpriteRenderer({ p5, screenShake });
    const renderer = new Renderer({ p5, fonts, replay, gameState, screenShake, spriteRenderer, tutorial });
    const lightMap = createLightmap();
    const fireTiles = new AnimationList();
    const threats = new AnimationList();

    const invincibleColorGradient = gradients.addMultiple(SNAKE_INVINCIBLE_COLORS.map(c => p5.color(c)), NUM_SNAKE_INVINCIBLE_COLORS);

    const drawPlayerOptions: DrawSquareOptions = { is3d: true, optimize: true }
    const drawAppleOptions: DrawSquareOptions = { size: 0.8, is3d: true, optimize: true }
    const drawBasicOptions: DrawSquareOptions = { optimize: true }
    const drawPortalOptions: DrawSquareOptions = {}
    const drawInvincibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };

    /**
     * https://p5js.org/reference/#/p5/preload
     */
    p5.preload = preload;
    function preload() {
      // sfx.load();
      // musicPlayer.load(level.musicTrack);
      fonts.load();
      spriteRenderer.loadImages();
      spriteRenderer.loadEditorImages();
      initLighting(p5);
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
      cacheGraphicalComponents();
      startPortalParticles();
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      // prevent freezing due to animation frame build up if tab loses focus
      if (p5.deltaTime > 3000) return;
      if (state.showingPreview) return;

      if (state.colorsDirty) {
        state.colorsDirty = false;
        state.extendedPalette = getExtendedPalette(options.palette);
        spriteRenderer.setThemedAppleImage(state.extendedPalette);
        spriteRenderer.setThemedBorderImages(state.extendedPalette);
        spriteRenderer.setThemedDoorImage(state.extendedPalette);
        cacheGraphicalComponents();
        state.dirty = true;
      }
      if (state.dirty) {
        recalculateLasersMap(data, threats);
        state.dirty = false;
        renderer.invalidateStaticCache();
        // come on baby, light my fire
        const fireBarriersMap = Object.keys(data.barriersMap).reduce((acc, key) => {
          const coord = parseInt(key, 10);
          const barrierType = data.barriersMap[coord];
          if (barrierType === BarrierType.FireTile) { acc[coord] = true; }
          return acc;
        }, {} as Record<number, boolean>);
        fireTiles.fillFromMap(fireBarriersMap, 99999999, Image.FireSheet);
        updateLighting(0, lightMap, options.globalLight, data.playerSpawnPosition, getPortalsFromPortalsMap(), null, null, fireTiles, null, data);
        startPortalParticles();
      }
      renderElements();
    }

    function cacheGraphicalComponents() {
      renderer.invalidateStaticCache();
      const colors = state.extendedPalette;
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
      renderer.drawSquareCustom(graphicalComponents.deco1, 1, 1, colors.deco1, colors.deco1Stroke, drawBasicOptions);

      renderer.clearGraphicalComponent(graphicalComponents.deco2);
      renderer.drawSquareCustom(graphicalComponents.deco2, 1, 1, colors.deco2, colors.deco2Stroke, drawBasicOptions);

      renderer.clearGraphicalComponent(graphicalComponents.nospawn);
      renderer.drawXCustom(graphicalComponents.nospawn, 1, 1, PALETTE.atomic.apple);
    }

    function renderElements() {
      p5.background(state.extendedPalette.background);
      if (!renderer.getIsStaticCached()) {
        gfx.clear(0, 0, 0, 0);
      }

      const snakeAlpha = 0.75;

      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);

          if (data.decoratives1Map[coord]) {
            renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.deco1, x, y);
          }

          if (data.decoratives2Map[coord]) {
            renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.deco2, x, y);
          }

          if (data.nospawnsMap[coord]) {
            const alpha = data.decoratives2Map[coord] ? 0.6 : data.decoratives1Map[coord] ? 0.4 : 0.25;
            renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.nospawn, x, y, alpha);
          }

          if (data.doorsMap[coord]) {
            if (isAtMapEdge(x, y, 1)) {
              spriteRenderer.drawImage1x1Static(gfx, Image.ThemedDoor, x, y, 0, 1, 0);
            } else {
              spriteRenderer.drawImage1x1Static(gfx, Image.ThemedDoorAlt, x, y, 0, 1, 0);
              // renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.door, x, y);
            }
          }

          if (data.barriersMap[coord] && !data.passablesMap[coord]) {
            switch (data.barriersMap[coord]) {
              case BarrierType.FireTile:
                spriteRenderer.drawSpritesheetAnim3x3Static(gfx, Image.FireSheet, x, y, 0);
                break;
              case BarrierType.Skull:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 0);
                break;
              case BarrierType.SkullThemed:
                spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierSkull, x, y, 0, 1, 0);
                break;
              case BarrierType.Indent:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 2);
                break;
              case BarrierType.IndentThemed:
                spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierIndent, x, y, 0, 1, 0);
                break;
              case BarrierType.Flat:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 4);
                break;
              case BarrierType.FlatThemed:
                spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierFlat, x, y, 0, 1, 0);
                break;
              case BarrierType.Pyramid:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 6);
                break;
              case BarrierType.PyramidThemed:
                spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierPyramid, x, y, 0, 1, 0);
                break;
              case BarrierType.ExitSign:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 11);
                break;
              case BarrierType.Radar:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 12);
                break;
              case BarrierType.ComputerChip:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 13);
                break;
              case BarrierType.MetalPlate:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 14);
                break;
              case BarrierType.Panel0:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 15);
                break;
              case BarrierType.Panel1:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 16);
                break;
              case BarrierType.Panel2:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 17);
                break;
              case BarrierType.Panel3:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 18);
                break;
              case BarrierType.Panel4:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 19);
                break;
              case BarrierType.Panel5:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 20);
                break;
              case BarrierType.Brick:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 21);
                break;
              case BarrierType.BrickWhite:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 22);
                break;
              case BarrierType.BrickThemed:
                spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierBrick, x, y, 0, 1, 0);
                break;
              case BarrierType.Stone:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 24);
                break;
              case BarrierType.StoneThemed:
                spriteRenderer.drawImage1x1Static(gfx, Image.ThemedBarrierStone, x, y, 0, 1, 0);
                break;
              case BarrierType.PanelWhite:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 27);
                break;
              case BarrierType.CompPanel:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 28);
                break;
              case BarrierType.GrateWhite:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 29);
                break;
              case BarrierType.GrateYellow:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 30);
                break;
              case BarrierType.Ruby:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 31);
                break;
              case BarrierType.FanDuct:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 32);
                break;
              case BarrierType.ExhaustPlate:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 33);
                break;
              case BarrierType.MetalPlate2:
                spriteRenderer.drawSprite1x1Static(gfx, Image.TileSheet16, x, y, 34);
                break;
              case BarrierType.Default:
              default:
                renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.barrier, x, y);
                break;
            }
          }

          if (isValidKeyChannel(data.locksMap[coord])) {
            const channel = data.locksMap[coord];
            if (channel === KeyChannel.Yellow) {
              spriteRenderer.drawSprite1x1Static(gfx, Image.LockSheet, x, y, 3);
            } else if (channel === KeyChannel.Red) {
              spriteRenderer.drawSprite1x1Static(gfx, Image.LockSheet, x, y, 2);
            } else if (channel === KeyChannel.Blue) {
              spriteRenderer.drawSprite1x1Static(gfx, Image.LockSheet, x, y, 1);
            }
          }

          if (isValidKeyChannel(data.keysMap[coord])) {
            const channel = data.keysMap[coord];
            if (channel === KeyChannel.Yellow) {
              spriteRenderer.drawSprite1x1Static(gfx, Image.KeySheet, x, y, 3);
            } else if (channel === KeyChannel.Red) {
              spriteRenderer.drawSprite1x1Static(gfx, Image.KeySheet, x, y, 2);
            } else if (channel === KeyChannel.Blue) {
              spriteRenderer.drawSprite1x1Static(gfx, Image.KeySheet, x, y, 1);
            }
          }

          if (data.applesMap[coord]) {
            spriteRenderer.drawSprite1x1(gfx, Image.ThemedAppleSheet, x, y, 0, 0, 1);
          }

          switch (data.threatsMap[coord]) {
            case ThreatType.Mine:
              spriteRenderer.drawSpritesheetAnim3x3Static(gfx, Image.MineSheet, x, y, 0);
              break;
            case ThreatType.Bomb:
              spriteRenderer.drawSpritesheetAnim1x1Static(gfx, SpritesheetRange.Bomb, x, y, 0);
              break;
            case ThreatType.LaserDiode:
              spriteRenderer.drawImage1x1Static(gfx, Image.ThreatSheet16, x, y, 0, 1, 0, Threat16Frame.DiodeBlue0 - 1, FRAME_COUNT_THREAT_16);
              break;
            case ThreatType.ExplodableBarrel:
              spriteRenderer.drawImage3x3Static(gfx, Image.ThreatSheet48, x, y, 0, 1, 0, Threat48Frame.Barrel - 1, FRAME_COUNT_THREAT_48);
              break;
            // TODO: DRAW ADD'L THREATS
            case ThreatType.Spikes:
            case ThreatType.WallSpikes:
            case ThreatType.Saw:
            default:
              break;
          }

          switch (data.pickupsMap[coord]) {
            case PickupType.Invincibility:
              drawInvincibilityPickup(x, y);
              break;
            case PickupType.Armor:
              spriteRenderer.drawSprite1x1(gfx, Image.Shield, x, y, 0, 0, 1);
              break;
            case PickupType.Reversibility:
              spriteRenderer.drawSprite1x1(gfx, Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[PickupType.Reversibility] - 1, 0, 1);
              break;
            case PickupType.HealthPack:
            case PickupType.WeightLossPill:
            default:
              break;
          }

          if (hasSegmentAt(x, y)) {
            renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.snakeSegment, x, y, snakeAlpha);
          }

          if (data.barriersMap[coord] && data.passablesMap[coord]) {
            renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.barrierPassable, x, y);
          }
        }
      }

      renderer.drawGraphicalComponentStatic(gfx, graphicalComponents.snakeHead, data.playerSpawnPosition.x, data.playerSpawnPosition.y, snakeAlpha);
      spriteRenderer.drawImage3x3Static(gfx, Image.SnekHead, data.playerSpawnPosition.x, data.playerSpawnPosition.y, getRotationFromDirection(data.startDirection), snakeAlpha);

      drawParticles(0);
      renderer.drawStaticGraphics(gfx);
      drawLasers();
      drawPortals();
      drawParticles(10);

      if (options.globalLight < 1) {
        drawLighting(lightMap, renderer, p5);
      }

      drawEditorSelection();

      renderer.tick();
      gameState.timeElapsed += p5.deltaTime;
      gameState.actualTimeElapsed += p5.deltaTime;
    }

    function drawParticles(zIndexPass = 0) {
      if (zIndexPass < 10) {
        const test = (coord: number): boolean => {
          if (data.barriersMap[coord] && !data.passablesMap[coord]) return false;
          if (data.doorsMap[coord]) return false;
          if (isValidPortalChannel(data.portalsMap[coord])) return false;
          return true;
        }
        emitters.tick(p5.deltaTime);
        particles.tick(p5.deltaTime, test);
      } else if (zIndexPass < 20) {
        emitters10.tick(p5.deltaTime);
        particles10.tick(p5.deltaTime);
      }
    }

    function drawPortals() {
      // track of the portal index, so that portals can be rendered in staggered fashion
      const channelCounts: Record<PortalChannel, number> = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
      }
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          if (isValidPortalChannel(data.portalsMap[coord])) {
            const portalChannel = data.portalsMap[coord];
            const portal: Portal = {
              position: new Vector(x, y),
              exitMode: options.portalExitConfig[portalChannel],
              channel: portalChannel,
              group: 0,
              hash: 0,
              index: channelCounts[portalChannel],
            }
            renderer.drawPortal(portal, false, drawPortalOptions);
            channelCounts[portalChannel]++;
          }
        }
      }
    }

    function drawLasers() {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          const gfxlsr = renderer.getMainGfx();
          const laser = data.lasersMap[coord];
          if (laser?.type === LaserType.Blue) {
            const frames = [
              Threat16Frame.LaserBlue0,
              Threat16Frame.LaserBlue1,
              Threat16Frame.LaserBlue2,
              Threat16Frame.LaserBlue3,
            ];
            const frame = Math.floor(renderer.getElapsed() / 200) % frames.length;
            const laserFrame = frames[frame] - 1;
            if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Horizontal) {
              spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
            }
            if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Vertical) {
              spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0.5 * Math.PI, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
            }
          } else if (laser?.type === LaserType.Red) {
            const frames = [
              Threat16Frame.LaserRed0,
              Threat16Frame.LaserRed1,
              Threat16Frame.LaserRed2,
              Threat16Frame.LaserRed3,
            ];
            const frame = Math.floor(renderer.getElapsed() / 200) % frames.length;
            const laserFrame = frames[frame] - 1;
            if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Horizontal) {
              spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
            }
            if (laser.orientation === Orientation.Mixed || laser.orientation === Orientation.Vertical) {
              spriteRenderer.drawImage1x1(gfxlsr, Image.ThreatSheet16, x, y, 0.5 * Math.PI, 1, 0, laserFrame, FRAME_COUNT_THREAT_16);
            }
          }
        }
      }
    }

    function drawInvincibilityPickup(x: number, y: number) {
      const cycle = Math.floor(gameState.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(invincibleColorGradient, (cycle % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(x, y, color.toString(), color.toString(), drawInvincibilityPickupOptions);
    }

    function drawEditorSelection() {
      if (state.mouseAt < 0) return;
      const from = coordToVec(state.mouseFrom);
      const to = coordToVec(state.mouseAt);
      // selected cell
      if (state.tool === EditorTool.Pencil) {
        if (state.operation === Operation.Add) {
          spriteRenderer.drawImage3x3(Image.EditorSelectionBlue, from.x, from.y, 0, 1, 0);
          spriteRenderer.drawImage3x3(Image.EditorSelection, to.x, to.y, 0, 1, 0);
        } else if (state.operation === Operation.Write) {
          spriteRenderer.drawImage3x3(Image.EditorSelectionBlue, to.x, to.y, 0, 1, 0);
        } else if (state.operation === Operation.Remove) {
          spriteRenderer.drawImage3x3(Image.EditorSelectionRed, to.x, to.y, 0, 1, 0);
        } else {
          spriteRenderer.drawImage3x3(Image.EditorSelection, to.x, to.y, 0, 1, 0);
        }
      } else if (state.tool === EditorTool.Eraser) {
        if (state.operation === Operation.Add) {
          spriteRenderer.drawImage3x3(Image.EditorSelectionBlue, from.x, from.y, 0, 1, 0);
          spriteRenderer.drawImage3x3(Image.EditorSelectionRed, to.x, to.y, 0, 1, 0);
        } else {
          spriteRenderer.drawImage3x3(Image.EditorSelectionRed, to.x, to.y, 0, 1, 0);
        }
      } else if (state.tool === EditorTool.Line || state.tool === EditorTool.Rectangle) {
        if (state.operation === Operation.Remove) {
          spriteRenderer.drawImage3x3(Image.EditorSelectionRed, from.x, from.y, 0, 1, 0);
          spriteRenderer.drawImage3x3(Image.EditorSelectionRed, to.x, to.y, 0, 1, 0);
        } else if (state.operation !== Operation.None) {
          spriteRenderer.drawImage3x3(Image.EditorSelectionBlue, from.x, from.y, 0, 1, 0);
          spriteRenderer.drawImage3x3(Image.EditorSelection, to.x, to.y, 0, 1, 0);
        } else {
          spriteRenderer.drawImage3x3(Image.EditorSelection, to.x, to.y, 0, 1, 0);
        }
      } else if (state.tool === EditorTool.Bucket) {
        if (state.operation === Operation.Remove) {
          spriteRenderer.drawImage3x3(Image.EditorSelectionRed, to.x, to.y, 0, 1, 0);
        } else {
          spriteRenderer.drawImage3x3(Image.EditorSelection, to.x, to.y, 0, 1, 0);
        }
      }
      // preview line
      if (state.mouseFrom >= 0 && (
        (state.tool === EditorTool.Line && state.operation !== Operation.None) ||
        (state.tool === EditorTool.Pencil && state.operation === Operation.Add) ||
        (state.tool === EditorTool.Eraser && state.operation === Operation.Add)
      )) {
        const color = (state.operation === Operation.Remove || state.tool === EditorTool.Eraser) ? '#ff330066' : '#bbeeff88';
        renderer.drawLine(p5, from.x, from.y, to.x, to.y, color);
      }
      // preview fill
      if (state.mouseFrom >= 0 && state.tool === EditorTool.Rectangle && state.operation !== Operation.None) {
        const color = state.operation === Operation.Remove ? '#ff330044' : '#00aaff44';
        for (let y = Math.min(from.y, to.y); y <= Math.max(from.y, to.y); y++) {
          for (let x = Math.min(from.x, to.x); x <= Math.max(from.x, to.x); x++) {
            renderer.drawBasicSquareCustom(p5, x, y, p5.color(color), 1);
          }
        }
      }
    }

    function startPortalParticles() {
      portalParticleSystem.reset();
      portalVortexParticleSystem.reset();
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          const portalChannel = data.portalsMap[coord];
          if (isValidPortalChannel(portalChannel)) {
            portalParticleSystem.emit(x, y, portalChannel);
            // portalVortexParticleSystem.emit(x, y, portalChannel);
          }
        }
      }
    }

    function getPortalsFromPortalsMap(): Record<PortalChannel, Vector[]> {
      const portals: Record<PortalChannel, Vector[]> = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
      };
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          const portalChannel = data.portalsMap[coord];
          if (isValidPortalChannel(portalChannel)) {
            portals[portalChannel].push(new Vector(x, y));
          }
        }
      }
      return portals;
    }

    function hasSegmentAt(x: number, y: number) {
      if (data.startDirection === DIR.DOWN) {
        return (
          data.playerSpawnPosition.equals(x, y + 1) ||
          data.playerSpawnPosition.equals(x, y + 2) ||
          data.playerSpawnPosition.equals(x, y + 3)
        );
      } else if (data.startDirection === DIR.UP) {
        return (
          data.playerSpawnPosition.equals(x, y - 1) ||
          data.playerSpawnPosition.equals(x, y - 2) ||
          data.playerSpawnPosition.equals(x, y - 3)
        );
      } else if (data.startDirection === DIR.LEFT) {
        return (
          data.playerSpawnPosition.equals(x - 1, y) ||
          data.playerSpawnPosition.equals(x - 2, y) ||
          data.playerSpawnPosition.equals(x - 3, y)
        );
      } else {
        return (
          data.playerSpawnPosition.equals(x + 1, y) ||
          data.playerSpawnPosition.equals(x + 2, y) ||
          data.playerSpawnPosition.equals(x + 3, y)
        );
      }
    }
  };

  const p5Instance = new P5(sketch, container);

  const cleanup = () => {
    p5Instance.remove();
  };

  return {
    setData,
    setOptions,
    setMouseAt,
    setMouseFrom,
    setOperation,
    setTool,
    setShowingPreview,
    cleanup,
  } satisfies EditorSketchReturn;
}
