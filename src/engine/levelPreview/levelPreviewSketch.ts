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
} from "../../constants";
import {
  DIR,
  DrawSquareOptions,
  EditorOptions,
  ExtendedPalette,
  EditorGraphicalComponents,
  Image,
  KeyChannel,
  Portal,
  PortalChannel,
  BarrierType,
  PickupType,
  ThreatType,
  Threat48Frame,
  Threat16Frame,
  FRAME_COUNT_THREAT_16,
  FRAME_COUNT_THREAT_48,
  LaserType,
  Orientation,
  SpritesheetRange,
  ButtonSheetFrame,
  ThreatWallSpikesFrame,
  ThreatSawFrame,
  SwitchType,
  PipeConnection,
  PipeVariant,
  Tile16Frame,
  LightSource,
  LightType,
  Level,
} from '../../types';
import { Gradients } from '../../collections/gradients';
import { Particles } from '../../collections/particles';
import { Emitters } from '../../collections/emitters';
import { PortalParticleSystem2 } from '../particleSystems/PortalParticleSystem2';
import { PortalVortexParticleSystem2 } from '../particleSystems/PortalVortexParticleSystem2';
import { SpriteRenderer } from '../spriteRenderer';
import { Renderer } from '../renderer';
import { Fonts } from '../../fonts';
import { PALETTE, getExtendedPalette } from '../../palettes';
import {
  buildPipesMap,
  coordToVec,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  getRotationFromDirection,
  getTileDir,
  isAtMapEdge,
  isValidKeyChannel,
  isValidPortalChannel,
  recalculateFlamesMap,
  recalculateLasersMap,
  withFlipx,
} from "../../utils";
import { drawLighting, initLighting, updateLighting } from '../lighting';
import { AnimationList } from '../../collections/animationList';
import { SKETCH_DEFAULTS } from '../../editor/editorConstants';
import { deepCloneData, getEditorDataFromLevel } from '../../editor/utils/editorUtils';
import { ExtendedSketchData } from '../../editor/editorSketch';

export interface LevelPreviewSketchReturn {
  setLevel: (incoming: Level) => void,
  cleanup: () => void,
}

let idnum = 0;

export const levelPreviewSketch = (
  container: HTMLElement,
  canvas: React.MutableRefObject<HTMLCanvasElement>,
  width: number,
  height: number,
  onLoaded: (lvl: Level) => void,
): LevelPreviewSketchReturn => {
  let level: Level;
  let data: ExtendedSketchData;
  let options: EditorOptions;
  let dirty = true;

  idnum++;
  console.log(`creating canvas ${idnum}`);

  const setLevel = (incoming: Level): void => {
    level = incoming;
    dirty = true;
  }

  const sketch = (p5: P5) => {
    const { gameState, replay, screenShake, tutorial } = SKETCH_DEFAULTS;
    const mainGfx: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
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
      if (!level) throw new Error('level required');
      initLighting(p5);
      const id = `level-preview-canvas-${idnum}`;
      const p5Canvas = p5.createCanvas(width, height, p5.P2D).id(id).class('level-preview-canvas');
      p5Canvas.elt.getContext('2d', { willReadFrequently: true });
      p5.frameRate(60);
      canvas.current = document.getElementById(id) as HTMLCanvasElement;
    }

    /**
     * https://p5js.org/reference/#/p5/draw
     * called by window.requestAnimationFrame
     */
    p5.draw = draw;
    function draw() {
      // prevent freezing due to animation frame build up if tab loses focus
      if (p5.deltaTime > 3000) return;
      if (!dirty) return;
      if (!level) return;

      dirty = false;
      renderer.reset();
      renderer.setGfxOverride(mainGfx);
      particles.setGfx(mainGfx);
      particles10.setGfx(mainGfx);
      renderer.setElapsed(10000);

      const [dataFromLevel, optionsFromLevel] = getEditorDataFromLevel(level);
      data = {
        ...deepCloneData(dataFromLevel),
        lasersMap: {},
        pipeConnectionsMap: {},
        flamesMap: {},
        illuminationMap: {},
        playerSpawnPosition: dataFromLevel.playerSpawnPosition,
        startDirection: dataFromLevel.startDirection,
        lightSources: {},
      } satisfies ExtendedSketchData;
      options = optionsFromLevel;

      const extendedPalette = getExtendedPalette(options.palette);
      spriteRenderer.setThemedAppleImage(extendedPalette);
      spriteRenderer.setThemedBorderImages(extendedPalette);
      spriteRenderer.setThemedDoorImage(extendedPalette);
      cacheGraphicalComponents(extendedPalette);

      emitters.reset();
      emitters10.reset();
      particles.reset();
      particles10.reset();
      startPortalParticles();

      threats.reset();
      Object.keys(data.threatsMap).map(Number).filter(Number.isInteger).forEach(coord => {
        const x = getCoordX(coord);
        const y = getCoordY(coord);
        threats.add(x, y, 999999999, SpritesheetRange.DiodeBlue, ThreatType.LaserDiode);
      });
      recalculateLasersMap(data, threats);
      recalculateFlamesMap(data);
      renderer.invalidateStaticCache();
      // come on baby, light my fire
      const fireBarriersMap = Object.keys(data.barriersMap).reduce((acc, key) => {
        const coord = parseInt(key, 10);
        const barrierType = data.barriersMap[coord];
        if (barrierType === BarrierType.FireTile) { acc[coord] = true; }
        return acc;
      }, {} as Record<number, boolean>);
      fireTiles.fillFromMap(fireBarriersMap, 99999999, Image.FireSheet);
      Object.keys(data.barriersMap).map(Number).filter(Number.isInteger).forEach(coord => {
        data.lightSources[coord] = undefined;
        if (data.barriersMap[coord] === BarrierType.PanelLight || data.barriersMap[coord] === BarrierType.WarningLight) {
          data.lightSources[coord] = {
            radius: 1,
            falloff: 2,
            strength: 0.8,
            type: LightType.Point,
          } satisfies LightSource;
        }
      });
      const globalLight = options.globalLight;
      updateLighting(0, globalLight, data.playerSpawnPosition, getPortalsFromPortalsMap(), null, null, fireTiles, null, data, renderer.getElapsed());
      startPortalParticles();
      const pipes: Vector[] = Object.entries(data.pipesMap).filter(([_, val]) => !!val).map(([key]) => coordToVec(Number(key)));
      buildPipesMap(pipes, data.pipeConnectionsMap, data.pipeOverrides);
      renderElements(data, options, extendedPalette);
      onLoaded?.(level);
    }

    function cacheGraphicalComponents(extendedPalette: ExtendedPalette) {
      renderer.invalidateStaticCache();
      const colors = extendedPalette;
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

    function renderElements(data: ExtendedSketchData, options: EditorOptions, extendedPalette: ExtendedPalette) {
      mainGfx.background(extendedPalette.background);
      gfx.clear(0, 0, 0, 0);

      const snakeAlpha = 0.75;

      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);

          if (data.decoratives1Map[coord]) {
            drawDeco1(x, y);
          }

          if (data.decoratives2Map[coord]) {
            drawDeco2(x, y);
          }

          if (data.doorsMap[coord]) {
            drawDoor(x, y);
          }

          if (data.barriersMap[coord]) {
            drawBarrier(x, y, data.barriersMap[coord]);
          }


          if (isValidKeyChannel(data.locksMap[coord])) {
            const channel = data.locksMap[coord];
            drawLock(x, y, channel);
          }

          if (isValidKeyChannel(data.keysMap[coord])) {
            const channel = data.keysMap[coord];
            drawKey(x, y, channel);
          }

          if (data.applesMap[coord]) {
            spriteRenderer.drawSprite1x1(gfx, Image.ThemedAppleSheet, x, y, 0, 0, 1);
          }

          if (data.threatsMap[coord]) {
            drawThreat(x, y, data.threatsMap[coord]);
          }

          if (data.pipeConnectionsMap[coord]) {
            drawPipe(x, y, data.pipeConnectionsMap[coord]);
          }

          if (data.switchesMap[coord]) {
            drawSwitch(x, y, data.switchesMap[coord]);
          }

          if (data.pickupsMap[coord]) {
            drawPickup(x, y, data.pickupsMap[coord]);
          }

          if (hasSegmentAt(x, y)) {
            renderer.drawGraphicalComponentCustom(gfx, graphicalComponents.snakeSegment, x, y, snakeAlpha);
          }
        }
      }

      renderer.drawGraphicalComponentCustom(gfx, graphicalComponents.snakeHead, data.playerSpawnPosition.x, data.playerSpawnPosition.y, snakeAlpha);
      spriteRenderer.drawImage3x3Custom(gfx, Image.SnekHead, data.playerSpawnPosition.x, data.playerSpawnPosition.y, getRotationFromDirection(data.startDirection), snakeAlpha);

      drawParticles(0);
      mainGfx.image(gfx, 0, 0, DIMENSIONS.x, DIMENSIONS.y);
      drawFire();
      drawLasers();
      drawPortals();
      drawParticles(10);

      if (options.globalLight < 1) {
        drawLighting(renderer, mainGfx);
      }

      const w = width;
      const h = height;
      p5.image(mainGfx, 0, 0, w, h, 0, 0, DIMENSIONS.x, DIMENSIONS.y);

      renderer.tick();
    }

    function drawDeco1(x: number, y: number) {
      renderer.drawGraphicalComponent(graphicalComponents.deco1, x, y);
    }

    function drawDeco2(x: number, y: number) {
      renderer.drawGraphicalComponent(graphicalComponents.deco2, x, y);
    }

    function drawDoor(x: number, y: number) {
      if (isAtMapEdge(x, y, 1)) {
        spriteRenderer.drawImage1x1(gfx, Image.ThemedDoor, x, y, 0, 1, 0);
      } else {
        spriteRenderer.drawImage1x1(gfx, Image.ThemedDoorAlt, x, y, 0, 1, 0);
      }
    }

    function drawBarrier(x: number, y: number, barrierType: BarrierType) {
      switch (barrierType) {
        case BarrierType.FireTile:
          spriteRenderer.drawSpritesheetAnim3x3(gfx, Image.FireSheet, x, y, 0);
          break;
        case BarrierType.Skull:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Skull-1);
          break;
        case BarrierType.SkullThemed:
          spriteRenderer.drawImage1x1(gfx, Image.ThemedBarrierSkull, x, y, 0, 1, 0);
          break;
        case BarrierType.Indent:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Indent-1);
          break;
        case BarrierType.IndentThemed:
          spriteRenderer.drawImage1x1(gfx, Image.ThemedBarrierIndent, x, y, 0, 1, 0);
          break;
        case BarrierType.Flat:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Flat-1);
          break;
        case BarrierType.FlatThemed:
          spriteRenderer.drawImage1x1(gfx, Image.ThemedBarrierFlat, x, y, 0, 1, 0);
          break;
        case BarrierType.Pyramid:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Pyramid-1);
          break;
        case BarrierType.PyramidThemed:
          spriteRenderer.drawImage1x1(gfx, Image.ThemedBarrierPyramid, x, y, 0, 1, 0);
          break;
        case BarrierType.ExitSign:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.ExitSign-1);
          break;
        case BarrierType.Radar:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Radar-1);
          break;
        case BarrierType.ComputerChip:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.ComputerChip-1);
          break;
        case BarrierType.MetalPlate:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.MetalPlate-1);
          break;
        case BarrierType.Panel0:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Panel0-1);
          break;
        case BarrierType.Panel1:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Panel1-1);
          break;
        case BarrierType.Panel2:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Panel2-1);
          break;
        case BarrierType.Panel3:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Panel3-1);
          break;
        case BarrierType.Panel4:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Panel4-1);
          break;
        case BarrierType.Panel5:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Panel5-1);
          break;
        case BarrierType.Brick:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Brick-1);
          break;
        case BarrierType.BrickWhite:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.BrickWhite-1);
          break;
        case BarrierType.BrickThemed:
          spriteRenderer.drawImage1x1(gfx, Image.ThemedBarrierBrick, x, y, 0, 1, 0);
          break;
        case BarrierType.Stone:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Stone-1);
          break;
        case BarrierType.StoneThemed:
          spriteRenderer.drawImage1x1(gfx, Image.ThemedBarrierStone, x, y, 0, 1, 0);
          break;
        case BarrierType.PanelWhite:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelWhite-1);
          break;
        case BarrierType.CompPanel:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.CompPanel-1);
          break;
        case BarrierType.GrateWhite:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.GrateWhite-1);
          break;
        case BarrierType.GrateYellow:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.GrateYellow-1);
          break;
        case BarrierType.Ruby:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Ruby-1);
          break;
        case BarrierType.FanDuct:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.FanDuct-1);
          break;
        case BarrierType.ExhaustPlate:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.ExhaustPlate-1);
          break;
        case BarrierType.MetalPlate2:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.MetalPlate2-1);
          break;
        case BarrierType.Glass:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.Glass-1);
          break;
        case BarrierType.PanelCircuit0:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelCircuit0-1);
          break;
        case BarrierType.PanelCircuit1:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelCircuit1-1);
          break;
        case BarrierType.PanelMolten0:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelMolten0-1);
          break;
        case BarrierType.PanelMolten1:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelMolten1-1);
          break;
        case BarrierType.PanelLight:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelLightOn-1);
          break;
        case BarrierType.PanelSciBox:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelSciBox-1);
          break;
        case BarrierType.PanelSciPillar:
          spriteRenderer.drawSprite1x1(gfx, Image.TileSheet16, x, y, Tile16Frame.PanelSciPillar-1);
          break;
        case BarrierType.WarningLight:
          spriteRenderer.drawSpritesheetAnim1x1(gfx, SpritesheetRange.WarningLightOn, x, y, renderer.getElapsed());
          break;
        case BarrierType.Default:
        default:
          renderer.drawGraphicalComponent(graphicalComponents.barrier, x, y);
          break;
      }
    }

    function drawLock(x: number, y: number, channel: KeyChannel) {
      if (channel === KeyChannel.Yellow) {
        spriteRenderer.drawSprite1x1(gfx, Image.LockSheet, x, y, 3);
      } else if (channel === KeyChannel.Red) {
        spriteRenderer.drawSprite1x1(gfx, Image.LockSheet, x, y, 2);
      } else if (channel === KeyChannel.Blue) {
        spriteRenderer.drawSprite1x1(gfx, Image.LockSheet, x, y, 1);
      }
    }

    function drawKey(x: number, y: number, channel: KeyChannel) {
      if (channel === KeyChannel.Yellow) {
        spriteRenderer.drawSprite1x1(gfx, Image.KeySheet, x, y, 3);
      } else if (channel === KeyChannel.Red) {
        spriteRenderer.drawSprite1x1(gfx, Image.KeySheet, x, y, 2);
      } else if (channel === KeyChannel.Blue) {
        spriteRenderer.drawSprite1x1(gfx, Image.KeySheet, x, y, 1);
      }
    }

    function drawThreat(x: number, y: number, threatType: ThreatType) {
      switch (threatType) {
        case ThreatType.Mine:
          spriteRenderer.drawSpritesheetAnim3x3(gfx, Image.MineSheet, x, y, 0);
          break;
        case ThreatType.Bomb:
          spriteRenderer.drawSpritesheetAnim1x1(gfx, SpritesheetRange.Bomb, x, y, 0);
          break;
        case ThreatType.LaserDiode:
          spriteRenderer.drawImage1x1(gfx, Image.ThreatSheet16, x, y, 0, 1, 0, Threat16Frame.DiodeBlue0 - 1, FRAME_COUNT_THREAT_16);
          break;
        case ThreatType.ExplodableBarrel:
          spriteRenderer.drawImage3x3Custom(gfx, Image.ThreatSheet48, x, y, 0, 1, 0, Threat48Frame.Barrel - 1, FRAME_COUNT_THREAT_48);
          break;
        case ThreatType.Barricade:
          spriteRenderer.drawSprite1x1(gfx, Image.ButtonSheet, x, y, ButtonSheetFrame.BarricadeActive2 - 1);
          break;
        case ThreatType.Spikes:
          spriteRenderer.drawSprite1x1(gfx, Image.ButtonSheet, x, y, ButtonSheetFrame.SpikeActive0 - 1);
          break;
        case ThreatType.WallSpikes:
          switch (getTileDir(x, y, data)) {
            case DIR.UP:
              spriteRenderer.drawSprite1x1(gfx, Image.ThreatWallSpikesSheet, x, y, ThreatWallSpikesFrame.Active3 - 1, Math.PI * 1.5);
              break;
            case DIR.DOWN:
              spriteRenderer.drawSprite1x1(gfx, Image.ThreatWallSpikesSheet, x, y, ThreatWallSpikesFrame.Active3 - 1, Math.PI * 0.5);
              break;
            case DIR.LEFT:
              withFlipx(gfx, x, y, true, (tx, ty) => {
                spriteRenderer.drawSprite1x1(gfx, Image.ThreatWallSpikesSheet, tx, ty, ThreatWallSpikesFrame.Active3 - 1);
              });
              break;
            case DIR.RIGHT:
              spriteRenderer.drawSprite1x1(gfx, Image.ThreatWallSpikesSheet, x, y, ThreatWallSpikesFrame.Active3 - 1);
              break;
          }
          break;
        case ThreatType.Saw:
          spriteRenderer.drawSprite1x1(gfx, Image.ThreatSawSheet, x, y, ThreatSawFrame.Active1 - 1);
          break;
        case ThreatType.Flamethrower:
          switch (getTileDir(x, y, data)) {
            case DIR.UP:
              spriteRenderer.drawSprite1x1(gfx, Image.ThreatSheet16, x, y, Threat16Frame.FlamethrowerActive - 1, Math.PI * 1.5);
              break;
            case DIR.DOWN:
              spriteRenderer.drawSprite1x1(gfx, Image.ThreatSheet16, x, y, Threat16Frame.FlamethrowerActive - 1, Math.PI * 0.5);
              break;
            case DIR.LEFT:
              withFlipx(gfx, x, y, true, (tx, ty) => {
                spriteRenderer.drawSprite1x1(gfx, Image.ThreatSheet16, tx, ty, Threat16Frame.FlamethrowerActive - 1);
              });
              break;
            case DIR.RIGHT:
              spriteRenderer.drawSprite1x1(gfx, Image.ThreatSheet16, x, y, Threat16Frame.FlamethrowerActive - 1);
              break;
          }
          break;
        case ThreatType.ElectricCoil:
          spriteRenderer.drawSprite1x1(gfx, Image.ThreatSheet16, x, y, Threat16Frame.ElectricCoil0 - 1);
          break;
        case ThreatType.None:
        default:
          break;
      }
    }

    function drawPipe(x: number, y: number, pipeConnection: PipeConnection) {
      // note: frame is 0-indexed
      const frame = pipeConnection % 17;
      if (options.pipeVariant === PipeVariant.Themed1) {
        spriteRenderer.drawSprite1x1(gfx, Image.ThemedPipes1, x, y, frame);
      } else if (options.pipeVariant === PipeVariant.Themed2) {
        spriteRenderer.drawSprite1x1(gfx, Image.ThemedPipes2, x, y, frame);
      } else if (options.pipeVariant === PipeVariant.Themed3) {
        spriteRenderer.drawSprite1x1(gfx, Image.ThemedPipes3, x, y, frame);
      } else {
        const offset = (Math.max(options.pipeVariant, 1) - 1) * 17;
        spriteRenderer.drawSprite1x1(gfx, Image.PipesSheet, x, y, frame + offset);
      }
    }

    function drawSwitch(x: number, y: number, switchType: SwitchType) {
      switch (switchType) {
        case SwitchType.Button:
          spriteRenderer.drawSprite1x1(gfx, Image.ButtonSheet, x, y, ButtonSheetFrame.Button2Ready - 1);
          break;
        case SwitchType.None:
        default:
          break;
      }
    }

    function drawPickup(x: number, y: number, pickupType: PickupType) {
      switch (pickupType) {
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
    }

    function drawParticles(zIndexPass = 0) {
      const deltaTime = 10000;
      if (zIndexPass < 10) {
        const test = (coord: number): boolean => {
          if (data.barriersMap[coord] && !data.passablesMap[coord]) return false;
          if (data.doorsMap[coord]) return false;
          if (isValidPortalChannel(data.portalsMap[coord])) return false;
          return true;
        }
        emitters.tick(deltaTime);
        particles.tick(deltaTime, test);
      } else if (zIndexPass < 20) {
        emitters10.tick(deltaTime);
        particles10.tick(deltaTime);
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
            renderer.drawPortal(portal, false, drawPortalOptions, mainGfx);
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

    function drawFire() {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        for (let x = 0; x < GRIDCOUNT_X; x++) {
          const coord = getCoordIndex2(x, y);
          if (data.threatsMap[coord] !== ThreatType.Flamethrower) continue;
          const gfxflame = renderer.getMainGfx();
          switch (getTileDir(x, y, data)) {
            case DIR.UP:
              spriteRenderer.drawSpritesheetAnim1x1(gfxflame, SpritesheetRange.FlamethrowerActive, x, y - 1, renderer.getElapsed(), Math.PI * 1.5);
              break;
            case DIR.DOWN:
              spriteRenderer.drawSpritesheetAnim1x1(gfxflame, SpritesheetRange.FlamethrowerActive, x, y + 1, renderer.getElapsed(), Math.PI * 0.5);
              break;
            case DIR.LEFT:
              withFlipx(gfxflame, x - 2, y, true, (tx, ty) => {
                spriteRenderer.drawSpritesheetAnim1x1(gfxflame, SpritesheetRange.FlamethrowerActive, tx, ty, renderer.getElapsed());
              }, 2);
              break;
            case DIR.RIGHT:
              spriteRenderer.drawSpritesheetAnim1x1(gfxflame, SpritesheetRange.FlamethrowerActive, x + 1, y, renderer.getElapsed());
              break;
          }
        }
      }
    }

    function drawInvincibilityPickup(x: number, y: number) {
      const cycle = Math.floor(gameState.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(invincibleColorGradient, (cycle % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(x, y, color.toString(), color.toString(), drawInvincibilityPickupOptions);
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
    setLevel,
    cleanup,
  } satisfies LevelPreviewSketchReturn;
}
