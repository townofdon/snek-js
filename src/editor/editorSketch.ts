import P5, { Vector } from 'p5';

import { BLOCK_SIZE, DIMENSIONS, GRIDCOUNT } from '../constants';
import {
  AppMode,
  DIR,
  DrawSquareOptions,
  EditorData,
  EditorOptions,
  ExtendedPalette,
  GameMode,
  GameState,
  GraphicalComponents,
  HitType,
  Image,
  KeyChannel,
  Palette,
  Portal,
  PortalChannel,
  Replay,
  ReplayMode,
  ScreenShakeState,
  Tutorial,
} from '../types';
import { Gradients } from '../collections/gradients';
import { Particles } from '../collections/particles';
import { Emitters } from '../collections/emitters';
import { PortalParticleSystem2 } from '../particleSystems/PortalParticleSystem2';
import { PortalVortexParticleSystem2 } from '../particleSystems/PortalVortexParticleSystem2';
import { SpriteRenderer } from '../spriteRenderer';
import { Renderer } from '../renderer';
import { Fonts } from '../fonts';
import { getExtendedPalette } from '../palettes';
import { getCoordIndex2, getRotationFromDirection, isValidPortalChannel } from '../utils';
import { EDITOR_DEFAULTS } from './editorConstants';
import { createLightmap, drawLighting, initLighting, updateLighting } from '../lighting';

interface EditorState {
  dirty: boolean,
  colorsDirty: boolean,
  extendedPalette: ExtendedPalette,
}

interface EditorSketchReturn {
  setData: (data: EditorData) => void,
  setOptions: (options: EditorOptions) => void,
  cleanup: () => void,
  p5: P5,
}

export const editorSketch = (): EditorSketchReturn => {
  const data: EditorData = {
    barriersMap: {},
    passablesMap: {},
    doorsMap: {},
    decoratives1Map: {},
    decoratives2Map: {},
    nospawnsMap: {},
    applesMap: {},
    keysMap: {},
    locksMap: {},
    portalsMap: {},
    playerSpawnPosition: EDITOR_DEFAULTS.data.playerSpawnPosition.copy(),
    startDirection: EDITOR_DEFAULTS.data.startDirection,
  };
  const options: Pick<EditorOptions, 'globalLight' | 'palette' | 'portalExitConfig'> = {
    globalLight: 0,
    palette: { ...EDITOR_DEFAULTS.options.palette },
    portalExitConfig: { ...EDITOR_DEFAULTS.options.portalExitConfig },
  };
  const state: EditorState = {
    dirty: false,
    colorsDirty: false,
    extendedPalette: getExtendedPalette(options.palette, true),
  }

  const setData = (incoming: EditorData): void => {
    const getIsDiff = (key: keyof EditorData): boolean => {
      for (let y = 0; y < GRIDCOUNT.y && !state.dirty; y++) {
        for (let x = 0; x < GRIDCOUNT.x && !state.dirty; x++) {
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
        default:
          throw new Error(`no case for key "${key}"`)
      }
    })
  }

  const p5Instance = new P5((p5: P5) => {
    const screenShake: ScreenShakeState = {
      offset: new Vector(0, 0),
      timeSinceStarted: 0,
      timeSinceLastStep: 0,
      magnitude: 0,
      timeScale: 0
    }
    const replay: Replay = {
      mode: ReplayMode.Disabled,
      levelIndex: 0,
      levelName: "",
      difficulty: undefined,
      applesToSpawn: [],
      positions: undefined,
      timeCaptureStarted: "",
      shouldProceedToNextClip: false,
    }
    const tutorial: Tutorial = {
      needsMoveControls: false,
      needsRewindControls: false,
    }
    const gameState: GameState = {
      appMode: AppMode.StartScreen,
      gameMode: GameMode.Normal,
      isPreloaded: false,
      isGameStarted: false,
      isGameStarting: false,
      isPaused: false,
      isMoving: false,
      isSprinting: false,
      isRewinding: false,
      isLost: false,
      isGameWon: false,
      isDoorsOpen: false,
      isExitingLevel: false,
      isExited: false,
      isShowingDeathColours: false,
      hasKeyYellow: false,
      hasKeyRed: false,
      hasKeyBlue: false,
      levelIndex: 0,
      actualTimeElapsed: 0,
      timeElapsed: 0,
      timeSinceLastMove: 0,
      timeSinceLastTeleport: 0,
      timeSinceHurt: 0,
      timeSinceHurtForgiveness: 0,
      timeSinceLastInput: 0,
      timeSinceInvincibleStart: 0,
      timeSinceSpawnedPickup: 0,
      hurtGraceTime: 0,
      lives: 0,
      targetSpeed: 0,
      currentSpeed: 0,
      steps: 0,
      frameCount: 0,
      lastHurtBy: HitType.Unknown,
      nextLevel: undefined,
    }

    const staticGraphics: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
    const graphicalComponents: GraphicalComponents = {
      deco1: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
      deco2: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
      barrier: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
      barrierPassable: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
      door: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
      apple: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
      snakeHead: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
      snakeSegment: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    }
    const gradients = new Gradients(p5);
    const particles = new Particles(p5, gradients, screenShake); // z-index 0
    const particles10 = new Particles(p5, gradients, screenShake); // z-index 10
    const emitters = new Emitters(p5, particles);
    const emitters10 = new Emitters(p5, particles10);
    const portalParticleSystem = new PortalParticleSystem2(p5, emitters10, gradients);
    const portalVortexParticleSystem = new PortalVortexParticleSystem2(p5, emitters, gradients);
    const fonts = new Fonts(p5);
    const spriteRenderer = new SpriteRenderer({ p5, staticGraphics, screenShake });
    const renderer = new Renderer({ p5, staticGraphics, fonts, replay, gameState, screenShake, spriteRenderer, tutorial });
    const lightMap = createLightmap();

    const drawPlayerOptions: DrawSquareOptions = { is3d: true, optimize: true }
    const drawAppleOptions: DrawSquareOptions = { size: 0.8, is3d: true, optimize: true }
    const drawBasicOptions: DrawSquareOptions = { optimize: true }
    const drawPortalOptions: DrawSquareOptions = {}

    /**
     * https://p5js.org/reference/#/p5/preload
     */
    p5.preload = preload;
    function preload() {
      // sfx.load();
      // musicPlayer.load(level.musicTrack);
      fonts.load();
      spriteRenderer.loadImages();
      initLighting(p5);
    }

    /**
     * https://p5js.org/reference/#/p5/setup
     */
    p5.setup = setup;
    function setup() {
      const canvas = document.getElementById("editor-canvas");
      if (!canvas) throw new Error('could not find canvas with id="editor-canvas"');
      p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y, p5.P2D, canvas);
      p5.frameRate(60);

      cacheGraphicalComponents();
      renderer.reset();
      startPortalParticles();
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      if (state.colorsDirty) {
        state.colorsDirty = false;
        state.extendedPalette = getExtendedPalette(options.palette, true);
        cacheGraphicalComponents();
        state.dirty = true;
      }
      if (state.dirty) {
        state.dirty = false;
        renderer.invalidateStaticCache();
        updateLighting(lightMap, options.globalLight, data.playerSpawnPosition, getPortalsFromPortalsMap());
        startPortalParticles();
      }
      renderElements();
    }

    function cacheGraphicalComponents() {
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
    }

    function renderElements() {
      renderer.drawBackground(state.extendedPalette.background);

      for (let y = 0; y < GRIDCOUNT.y; y++) {
        for (let x = 0; x < GRIDCOUNT.x; x++) {
          const coord = getCoordIndex2(x, y);

          if (data.decoratives1Map[coord]) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.deco1, x, y);
          }

          if (data.decoratives2Map[coord]) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.deco2, x, y);
          }

          if (data.doorsMap[coord]) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.door, x, y);
          }

          if (data.barriersMap[coord] && !data.passablesMap[coord]) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.barrier, x, y);
          }

          if (data.locksMap[coord]) {
            const channel = data.keysMap[coord];
            if (channel === KeyChannel.Yellow) {
              spriteRenderer.drawImage3x3Static(Image.LockYellow, x, y);
            } else if (channel === KeyChannel.Red) {
              spriteRenderer.drawImage3x3Static(Image.LockRed, x, y);
            } else if (channel === KeyChannel.Blue) {
              spriteRenderer.drawImage3x3Static(Image.LockBlue, x, y);
            }
          }

          if (data.keysMap[coord]) {
            const channel = data.keysMap[coord];
            if (channel === KeyChannel.Yellow) {
              spriteRenderer.drawImage3x3Static(Image.KeyYellow, x, y);
            } else if (channel === KeyChannel.Red) {
              spriteRenderer.drawImage3x3Static(Image.KeyRed, x, y);
            } else if (channel === KeyChannel.Blue) {
              spriteRenderer.drawImage3x3Static(Image.KeyBlue, x, y);
            }
          }

          if (data.applesMap[coord]) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.apple, x, y);
          }

          if (hasSegmentAt(x, y)) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.snakeSegment, x, y);
          }

          if (data.playerSpawnPosition.equals(x, y)) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.snakeHead, x, y);
            spriteRenderer.drawImage3x3Static(Image.SnekHead, x, y, getRotationFromDirection(data.startDirection));
          }

          if (data.barriersMap[coord] && data.passablesMap[coord]) {
            renderer.drawGraphicalComponentStatic(graphicalComponents.barrierPassable, x, y);
          }
        }
      }

      drawParticles(0);
      renderer.drawStaticGraphics();
      drawPortals();
      drawParticles(10);

      if (options.globalLight < 1) {
        drawLighting(lightMap, renderer);
      }

      renderer.tick();
    }

    function drawParticles(zIndexPass = 0) {
      if (zIndexPass < 10) {
        emitters.tick(p5.deltaTime);
        particles.tick(p5.deltaTime);
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
      for (let y = 0; y < GRIDCOUNT.y; y++) {
        for (let x = 0; x < GRIDCOUNT.x; x++) {
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

    function startPortalParticles() {
      portalParticleSystem.reset();
      portalVortexParticleSystem.reset();
      for (let y = 0; y < GRIDCOUNT.y; y++) {
        for (let x = 0; x < GRIDCOUNT.x; x++) {
          const coord = getCoordIndex2(x, y);
          const portalChannel = data.portalsMap[coord];
          if (isValidPortalChannel(portalChannel)) {
            portalParticleSystem.emit(x, y, portalChannel);
            portalVortexParticleSystem.emit(x, y, portalChannel);
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
      for (let y = 0; y < GRIDCOUNT.y; y++) {
        for (let x = 0; x < GRIDCOUNT.x; x++) {
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
          data.playerSpawnPosition.equals(x, y - 1) ||
          data.playerSpawnPosition.equals(x, y - 2) ||
          data.playerSpawnPosition.equals(x, y - 3)
        );
      } else if (data.startDirection === DIR.UP) {
        return (
          data.playerSpawnPosition.equals(x, y + 1) ||
          data.playerSpawnPosition.equals(x, y + 2) ||
          data.playerSpawnPosition.equals(x, y + 3)
        );
      } else if (data.startDirection === DIR.LEFT) {
        return (
          data.playerSpawnPosition.equals(x + 1, y) ||
          data.playerSpawnPosition.equals(x + 2, y) ||
          data.playerSpawnPosition.equals(x + 3, y)
        );
      } else {
        return (
          data.playerSpawnPosition.equals(x - 1, y) ||
          data.playerSpawnPosition.equals(x - 2, y) ||
          data.playerSpawnPosition.equals(x - 3, y)
        );
      }
    }
  });

  const cleanup = () => {
    p5Instance.remove();
  };

  return { setData, setOptions, cleanup, p5: p5Instance };
}
