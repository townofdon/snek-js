import P5, { Vector } from 'p5';

import {
  ALL_APPLES_BONUS,
  ALL_LOCKS_BONUS,
  ANIMATIONS,
  BLOCK_SIZE,
  CLEAR_BONUS,
  COBRA_SCORE_MOD,
  DEBUG_EASY_LEVEL_EXIT,
  DEFAULT_PAR_TIME,
  DEFAULT_PORTALS,
  DIFFICULTY_MEDIUM,
  DIMENSIONS,
  DISABLE_TRANSITIONS,
  FRAMERATE,
  FRAME_DUR_MS,
  GLOBAL_LIGHT_DEFAULT,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_FLASH_RATE,
  HURT_FORGIVENESS_TIME,
  HURT_MUSIC_DUCK_TIME_MS,
  HURT_MUSIC_DUCK_VOL,
  HURT_STUN_TIME,
  INVINCIBILITY_COLOR_CYCLE_MS,
  INVINCIBILITY_EXPIRE_FLASH_MS,
  INVINCIBILITY_EXPIRE_WARN_MS,
  INVINCIBILITY_PICKUP_FREEZE_MS,
  LEVEL_BONUS,
  LIVES_LEFT_BONUS,
  MAX_LIVES,
  MAX_SNAKE_SIZE,
  NUM_APPLES_START,
  NUM_SNAKE_INVINCIBLE_COLORS,
  PERFECT_BONUS,
  DROP_LIKELIHOOD_INVINCIBILITY,
  DROP_LIKELIHOOD_MINE,
  PICKUP_INVINCIBILITY_BONUS,
  PICKUP_LIFETIME_MS,
  PICKUP_SPAWN_COOLDOWN,
  SCORE_INCREMENT,
  SCREEN_SHAKE_DURATION_MS,
  SCREEN_SHAKE_MAGNITUDE_PX,
  SNAKE_INVINCIBLE_COLORS,
  SNAKE_REWIND_COLORS,
  SPEED_INCREMENT_SPEED_MS,
  SPEED_LIMIT_ULTRA_SPRINT,
  SPRINT_INCREMENT_SPEED_MS,
  START_SNAKE_SIZE,
  PICKUP_SPRITE_FRAME_MAP,
  PREY_SPAWN_WAIT_TIME_MIN,
  PREY_SPAWN_WAIT_TIME_MAX,
  PICKUP_COMMON_BONUS,
  PICKUP_COMMON_ITEMS,
  PICKUP_RARE_ITEMS,
  PICKUP_RARE_BONUS,
  PICKUP_EPIC_ITEMS,
  PICKUP_EPIC_BONUS,
  PICKUP_LEGENDARY_ITEMS,
  PICKUP_LEGENDARY_BONUS,
  PICKUP_GALACTIC_BONUS,
  TIME_REWIND_TAKEOVER_CONTROLS,
  KEYCODE_F10,
  IS_DEV,
  ARMOR_PICKUP_FREEZE_MS,
  DROP_LIKELIHOOD_ARMOR,
  PICKUP_TYPE_RARITY_MAP,
  RARITY_LEGENDARY,
  RARITY_COMMON,
  RARITY_EPIC,
  PITY_INCREMENT,
  BASE_PICKUP_RARITY,
  STROKE_SIZE,
} from "../constants";
import {
  Action,
  AppMode,
  BarrierType,
  ClickState,
  DIR,
  Difficulty,
  DrawSquareOptions,
  DrawState,
  FontsInstance,
  GameMode,
  GameSettings,
  GameState,
  GraphicalComponents,
  HitType,
  IEnumerator,
  Image,
  InputAction,
  InputType,
  Key,
  KeyChannel,
  Level,
  LevelType,
  Lock,
  LoopState,
  MusicTrack,
  ItemDropType,
  PlayerState,
  PortalChannel,
  Replay,
  ReplayMode,
  SFXInstance,
  ScreenShakeState,
  Sound,
  Stats,
  Tutorial,
  UINavEventHandler,
  PickupType,
  PreySpawn,
  PreyType,
  SpritesheetImage,
  PickupRarity,
  WearableFrame,
  Outfit,
  HeldItems,
  EngineState,
} from "../types";
import {
  clamp,
  dirToUnitVector,
  getCoordIndex,
  getCoordIndex2,
  getDifficultyFromIndex,
  getDirectionBetween,
  getDropLikelihood,
  getLevelProgress,
  getRotationFromDirection,
  getManhattanDistance,
  invertDirection,
  isAtMapEdge,
  isOrthogonalDirection,
  isWithinBlockDistance,
  lerp,
  shouldBlinkExpiringPickup,
  toRarity,
  triangle,
  removeArrayElement,
  getCoordX,
  getCoordY,
  } from "../utils";
import { VectorList } from "../collections/vectorList";
import { Gradients } from '../collections/gradients';
import { Particles } from '../collections/particles';
import { Emitters } from '../collections/emitters';
import { AppleList } from '../collections/appleList';
import { AnimationList } from '../collections/animationList';
import { AppleParticleSystem2 } from './particleSystems/AppleParticleSystem2';
import { ImpactParticleSystem2 } from './particleSystems/ImpactParticleSystem2';
import { PortalParticleSystem2 } from './particleSystems/PortalParticleSystem2';
import { GateUnlockParticleSystem2 } from './particleSystems/GateUnlockParticleSystem2';
import { buildLevel } from '../levels/levelBuilder';
import {
  CAMPAIGN_LEVELS,
  CHALLENGE_LEVELS,
  LEVELS,
  START_LEVEL,
  START_LEVEL_COBRA,
} from "../levels/levelConstants";
import { LEVEL_01 } from '../levels/campaign/level01';
import { LEVEL_99 } from '../levels/campaign/level99';
import { LEVEL_WIN_GAME } from '../levels/winGame';
import { VARIANT_LEVEL_99 } from '../levels/bonusLevels/variantLevel99';
import { WARP_ZONE_01 } from '../levels/bonusLevels/warpZone01';
import { WARP_ZONE_02 } from '../levels/bonusLevels/warpZone02';
import { WARP_ZONE_03 } from '../levels/bonusLevels/warpZone03';
import { WinLevelScene } from '../scenes/WinLevelScene';
import { findLevelWarpIndex, getNumRandomLevelsRemaining } from '../levels/levelUtils';
import { SpriteRenderer } from './spriteRenderer';
import { Renderer } from './renderer';
import { createLightmap, drawLighting, resetLightmap, updateLighting } from './lighting';
import { MusicPlayer } from './musicPlayer';
import { InputCallbacks, handleKeyPressed, validateMove } from './controls';
import { applyGamepadRumble, applyGamepadMove, getCurrentGamepadSprint } from './gamepad'
import { Easing } from '../easing';
import { getExtendedPalette, PALETTE } from '../palettes';
import { Coroutines } from './coroutines';
import { UI, UI_CANVAS_RIGHT, UI_PARENT_ID } from '../ui/ui';
import { buildSceneActionFactory } from '../scenes/sceneUtils';
import { TitleScene } from '../scenes/TitleScene';
import { buildMapLayout, decodeMapData } from '../editor/utils/editorUtils';
import { resumeAudioContext } from './audio';
import { LEVEL_01_HARD } from '../levels/campaign/level01hard';
import { LEVEL_01_ULTRA } from '../levels/campaign/level01ultra';
import { SaveDataStore } from '../stores/SaveDataStore';
import { AStar } from '../astar/astar';
import { PreyList } from '../collections/preyList';
import { downloadFile, getCanvasImage, overlayOntoCanvas } from '@/editor/utils/publishUtils';
import { withErrorReporting } from '@/reporting';
import { AcquirePickupParticleSystem } from './particleSystems/AcquirePickupParticleSystem';
import { AcquirePickupScene, AcquirePickupSceneConstructorArgs } from '@/scenes/AcquirePickupScene';
import { DEFAULT_ENGINE_STATE, DEFAULT_PICKUP_TYPES } from '@/defaults';
import { engineMovement } from './engineComponents/movement';

interface EngineParams {
  p5: P5,
  spriteRenderer: SpriteRenderer,
  state: GameState,
  stats: Stats,
  settings: GameSettings,
  outfit: Outfit,
  heldItems: HeldItems,
  replay?: Replay,
  tutorial: Tutorial,
  fonts: FontsInstance,
  sfx: SFXInstance,
  musicPlayer: MusicPlayer,
  actions: Coroutines,
  coroutines: Coroutines,
  winLevelScene: WinLevelScene,
  gfxPresentation: P5.Graphics,
  startAction: (enumerator: IEnumerator, actionKey: Action, force?: boolean) => void,
  stopAction: (actionKey: Action) => void,
  clearAction: (actionKey: Action) => void,
  clearUI: (force?: boolean) => void,
  gotoNextLevel: () => void,
  proceedToNextReplayClip: () => void,
  warpToLevel: (levelNum?: number) => void,
  handleInputAction: (action: InputAction) => void,
  onUINavigate: UINavEventHandler,
  onGameOver: () => void,
  onGameOverCobra: () => void,
  onRecordLevelProgress: InstanceType<typeof SaveDataStore>['recordLevelCompletion'],
}

export function engine({
  p5,
  spriteRenderer,
  state,
  stats,
  settings,
  outfit,
  heldItems,
  replay: engineReplay,
  tutorial,
  fonts,
  sfx,
  musicPlayer,
  actions,
  coroutines,
  winLevelScene,
  gfxPresentation,
  startAction,
  stopAction,
  clearAction,
  clearUI,
  gotoNextLevel,
  proceedToNextReplayClip,
  warpToLevel,
  handleInputAction,
  onUINavigate,
  onGameOver,
  onGameOverCobra,
  onRecordLevelProgress,
}: EngineParams) {
  const es: EngineState = DEFAULT_ENGINE_STATE;
  const loopState: LoopState = {
    interval: null,
    timePrevMs: 0,
    timeAccumulatedMs: 0,
    timeScale: 1,
    deltaTime: 0,
  } satisfies LoopState;
  const drawState: DrawState = {
    shouldDrawApples: true,
    shouldDrawKeysLocks: true,
    shouldDrawActionFG: true,
  } satisfies DrawState;
  const metrics = {
    gameLoopProcessingTime: 0,
  }
  const player: PlayerState = {
    position: new Vector(0, 0),
    direction: DIR.RIGHT,
    directionToFirstSegment: DIR.RIGHT,
    directionLastHit: DIR.RIGHT,
  } satisfies PlayerState;
  const clickState: ClickState = {
    x: 0,
    y: 0,
    didReceiveInput: false,
    directionToPoint: DIR.RIGHT,
  } satisfies ClickState;
  const screenShake: ScreenShakeState = {
    offset: new Vector(0, 0),
    timeSinceStarted: Infinity,
    timeSinceLastStep: Infinity,
    magnitude: 1,
    timeScale: 1,
  } satisfies ScreenShakeState;
  const replay = engineReplay || {
    mode: ReplayMode.Disabled,
    levelIndex: -1,
    levelName: 'no-level',
    difficulty: { ...DIFFICULTY_MEDIUM },
    applesToSpawn: [],
    positions: {},
    timeCaptureStarted: 'no-date',
    shouldProceedToNextClip: false,
    lastFrame: 0,
  } satisfies Replay;

  const drawPlayerOptions: DrawSquareOptions = { is3d: true, optimize: true };
  const drawPlayerOptionsAcquire: DrawSquareOptions = { is3d: false, optimize: true };
  const drawPlayerOptionsDeath: DrawSquareOptions = { is3d: true, optimize: true, screenshakeMul: -1 };
  const drawAppleOptions: DrawSquareOptions = { size: 0.8, is3d: true, optimize: true, screenshakeMul: 0 };
  const drawInvincibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };
  const drawReversibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };
  const drawBasicOptions: DrawSquareOptions = { optimize: true };
  const drawBasicOptionsNoShake: DrawSquareOptions = { optimize: true, screenshakeMul: 0 };
  const drawPortalOptions: DrawSquareOptions = {};

  const onMineLifetimeExpire = (coord: number) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
    explosions.add(x, y, frames * timePerFrame, frames, timePerFrame);
    state.lastHurtBy = HitType.HitMine;
    playSound(Sound.xpound);
    drawState.shouldDrawActionFG = true;
  };
  const onShieldSpawnLifetimeExpire = (coord: number) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const { frames, timePerFrame } = ANIMATIONS[Image.Shield];
    const isEndOfLevelDrop = state.isDoorsOpen && apples.length === 0 && preyList.length === 0 && es.level.armorDrop;
    const lifetime = isEndOfLevelDrop ? 99999999 : es.difficulty.invincibilityTime;
    shields.add(x, y, lifetime, frames, timePerFrame);
    drawState.shouldDrawActionFG = true;
  };
  const segments = new VectorList(); // snake segments
  const apples = new AppleList(); // food that the snake can eat to grow and score points
  const mines = new AnimationList({ onLifetimeExpire: onMineLifetimeExpire });
  const doorsOpening = new AnimationList();
  const fireTiles = new AnimationList();
  const explosions = new AnimationList();
  const pointsAnim = new AnimationList();
  const shields = new AnimationList();
  const shieldSpawns = new AnimationList({ onLifetimeExpire: onShieldSpawnLifetimeExpire});
  const lightMap = createLightmap();

  const preySpawn: PreySpawn = {
    dropsByFrame: undefined
  } satisfies PreySpawn;
  const astar = new AStar({ allowDiagonals: true, allowClosest: true, randomizeWeights: true, mines, segments });
  const preyList = new PreyList({ astar, onLifetimeExpire: onMineLifetimeExpire });

  const {
    handleSnakeMovement,
    handleSnakeRewind,
    handleSnakeMovementDuringReplay,
    handleTeleportOnGameWin,
    handlePortalTravel,
    reboundSnake,
    rewindAllowed,
    checkHasHit,
    checkPortalTeleportWillHit,
    getDirectionSnakeForward,
    getDirectionSnakeBackward,
  } = engineMovement({
    state,
    es,
    player,
    loopState,
    segments,
    replay,
    heldItems,
    stats,
    startAutoRewind,
    checkArmorProtection,
    playSound,
    stopRewinding,
    proceedToNextReplayClip,
  });

  // hack P5's "offscreen canvas" to layer multiple canvases for MAX PERF - see: https://p5js.org/reference/#/p5/createGraphics
  const gfxBG: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxExitLights: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxKeysLocks: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxApples: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxFG: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxFGAction: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxLighting: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y, p5.P2D);
  const gfxUIRight: P5.Graphics = p5.createGraphics(BLOCK_SIZE.x, DIMENSIONS.y, p5.P2D, document.getElementById(UI_CANVAS_RIGHT));
  gfxBG.addClass('static-gfx-canvas').addClass('bg').parent(UI_PARENT_ID).addClass('gfx-bg').id('canvas-bg');
  gfxExitLights.addClass('static-gfx-canvas').addClass('fg0').parent(UI_PARENT_ID).addClass('gfx-exit-lights');
  gfxKeysLocks.addClass('static-gfx-canvas').addClass('fg1').parent(UI_PARENT_ID).addClass('gfx-keys-locks').id('canvas-keys-locks');
  gfxApples.addClass('static-gfx-canvas').addClass('fg1').parent(UI_PARENT_ID).addClass('gfx-apples').id('canvas-apples');
  gfxFG.addClass('static-gfx-canvas').addClass('fg2').parent(UI_PARENT_ID).addClass('gfx-fg').id('canvas-fg');
  gfxFGAction.addClass('static-gfx-canvas').addClass('fg3').parent(UI_PARENT_ID).addClass('gfx-fg-action').id('canvas-action');
  gfxLighting.addClass('static-gfx-canvas').addClass('fg4').parent(UI_PARENT_ID).addClass('gfx-lighting').id('canvas-lighting');
  // move gfxPresentation so that it is on top of everything else
  document.getElementById('gfx-presentation').after(document.getElementById('canvas-lighting'));
  const graphicalComponents: GraphicalComponents = {
    deco1: p5.createGraphics(BLOCK_SIZE.x + STROKE_SIZE*2, BLOCK_SIZE.y + STROKE_SIZE*2),
    deco2: p5.createGraphics(BLOCK_SIZE.x + STROKE_SIZE*2, BLOCK_SIZE.y + STROKE_SIZE*2),
    barrier: p5.createGraphics(BLOCK_SIZE.x + STROKE_SIZE*2, BLOCK_SIZE.y + STROKE_SIZE*2),
    barrierPassable: p5.createGraphics(BLOCK_SIZE.x + STROKE_SIZE*2, BLOCK_SIZE.y + STROKE_SIZE*2),
    door: p5.createGraphics(BLOCK_SIZE.x + STROKE_SIZE*2, BLOCK_SIZE.y + STROKE_SIZE*2),
    snakeHead: p5.createGraphics(BLOCK_SIZE.x + STROKE_SIZE*2, BLOCK_SIZE.y + STROKE_SIZE*2),
    snakeSegment: p5.createGraphics(BLOCK_SIZE.x + STROKE_SIZE*2, BLOCK_SIZE.y + STROKE_SIZE*2),
    // @ts-ignore
    apple: null,
  };
  const gradients = new Gradients(p5);
  const particles = new Particles(p5, gradients, screenShake); // z-index 0
  const particles10 = new Particles(p5, gradients, screenShake); // z-index 10
  const emitters = new Emitters(p5, particles);
  const emitters10 = new Emitters(p5, particles10);
  const appleParticleSystem = new AppleParticleSystem2(p5, emitters, gradients);
  const impactParticleSystem = new ImpactParticleSystem2(p5, emitters10, gradients);
  const portalParticleSystem = new PortalParticleSystem2(p5, emitters10, gradients);
  const gateUnlockParticleSystem = new GateUnlockParticleSystem2(p5, emitters, gradients);
  const exitLightParticleSystem = new PortalParticleSystem2(p5, emitters, gradients);
  const acquirePickupParticleSystem = new AcquirePickupParticleSystem(p5, emitters, gradients);

  const reversibleColorGradient = gradients.addMultiple(SNAKE_REWIND_COLORS.map(c => p5.color(c)), NUM_SNAKE_INVINCIBLE_COLORS);
  const invincibleColorGradient = gradients.addMultiple(SNAKE_INVINCIBLE_COLORS.map(c => p5.color(c)), NUM_SNAKE_INVINCIBLE_COLORS);

  const renderer = new Renderer({ p5, fonts, replay, gameState: state, screenShake, spriteRenderer, tutorial });
  spriteRenderer.setScreenShake(screenShake);
  const acquirePickupScene = new AcquirePickupScene({
    p5,
    gfxFGAction,
    gfxPresentation,
    sfx,
    musicPlayer,
    fonts,
    renderer,
    spriteRenderer,
    gameState: state,
    segments,
    player,
    drawGameBackground: drawBackground,
    drawPlayerHead,
    drawPlayerSegment,
    erasePlayerSegmentCorner,
    drawParticles,
    callbacks: {
      onSceneStart: () => {
        stopLogicLoop();
        // TODO: add uniq sound
        playSound(Sound.doorOpenHuge);
        musicPlayer.setPlaybackRate(es.level.musicTrack, 0);
        musicPlayer.setVolume(0);
        exitLightParticleSystem.reset();
        acquirePickupParticleSystem.emit(15, 15);
        state.currentSpeed = 1;
        state.isMoving = false;
        state.acquireProgression = 0;
        particles.setGfx(gfxFGAction);
        renderer.setGfxOverride(gfxFGAction);
        gfxFGAction.clear(0, 0, 0, 0);
        UI.clearLabels();
      },
      onBeforeDraw: () => {
        drawState.shouldDrawActionFG = true;
      },
      onAcquire: () => {
        state.acquireProgression = 0;
        state.timeSinceArmorPickup = 0;
        heldItems.armor += 1;
        // set rewinding state just for visuals
        state.isRewinding = true;
      },
      onSceneEnded: () => {
        musicPlayer.setPlaybackRate(es.level.musicTrack, 1);
        startAction(fadeMusic(1, 2000), Action.FadeMusic);
        state.isRewinding = false;
        state.acquireProgression = 0;
        startLogicLoop();
        acquirePickupParticleSystem.reset();
        startExitParticles();
        renderer.setGfxOverride(null);
        particles.setGfx(p5);
        drawState.shouldDrawActionFG = true;
        renderDifficultyUI();
        renderHeartsUI();
        renderScoreUI();
        renderLevelName();
      },
    },
  } satisfies AcquirePickupSceneConstructorArgs);

  function initEngine() {
    [
      p5,
      gfxPresentation,
      gfxBG,
      gfxExitLights,
      gfxKeysLocks,
      gfxApples,
      gfxFG,
      gfxFGAction,
      gfxLighting,
      gfxUIRight,
    ].forEach((gfx: P5.Graphics) => {
      // set pixel density for a perf boost. see - https://p5js.org/reference/p5/pixelDensity/
      gfx.pixelDensity(1);
      gfx.noSmooth();
    });
  }

  function setLevel(incoming: Level) {
    es.level = incoming;
    if (es.level === LEVEL_01 && replay.mode !== ReplayMode.Playback) {
      if (es.difficulty.index === 3) {
        es.level = LEVEL_01_HARD;
      } else if (es.difficulty.index === 4) {
        es.level = LEVEL_01_ULTRA;
      }
    }
  }

  function setDifficulty(incoming: Difficulty) {
    es.difficulty = { ...incoming }
  }

  function getLevel() {
    return es.level;
  }

  function getDifficulty() {
    return es.difficulty;
  }

  function renderDifficultyUI() {
    if (es.level === START_LEVEL) return;
    if (es.level === START_LEVEL_COBRA) return;
    if (es.level.type === LevelType.Maze) return;
    if (es.level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderDifficulty(es.difficulty.index, state.isInvertedColors, state.gameMode === GameMode.Casual, state.gameMode === GameMode.Cobra);
  }

  function renderHeartsUI() {
    if (es.level === START_LEVEL) return;
    if (es.level === START_LEVEL_COBRA) return;
    if (es.level.type === LevelType.Maze) return;
    if (es.level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.gameMode === GameMode.Casual) return;
    UI.renderHearts(state.lives, state.isInvertedColors);
  }

  function renderScoreUI(score = stats.score) {
    if (es.level === START_LEVEL) return;
    if (es.level === START_LEVEL_COBRA) return;
    if (es.level.type === LevelType.Maze) return;
    if (es.level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.gameMode === GameMode.Casual) return;
    UI.renderScore(score, state.isInvertedColors);
  }

  function renderLevelName() {
    if (es.level === START_LEVEL) return;
    if (es.level === START_LEVEL_COBRA) return;
    if (es.level.type === LevelType.Maze) return;
    if (es.level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    const progress = getLevelProgress(stats, es.level, es.difficulty);
    UI.renderLevelName(es.level.name, state.isInvertedColors, progress);
  }

  function getMaybeTitleScene() {
      const annotation = (() => {
        if (!es.level.id) return '';
        if (state.isRandomizer) {
          const levelNum = (20 - getNumRandomLevelsRemaining()) || 20;
          return `${levelNum} / 20`;
        }
        {
          const levelIndex = CAMPAIGN_LEVELS.indexOf(es.level);
          if (levelIndex >= 0) return `${levelIndex + 1} / ${CAMPAIGN_LEVELS.length}`;
        }
        {
          const levelIndex = CHALLENGE_LEVELS.indexOf(es.level);
          if (levelIndex >= 0) return `${levelIndex + 1} / ${CHALLENGE_LEVELS.length}`;
        }
        if (es.level.author) return `by ${es.level.author}`;
        return ''
      })()
      const buildSceneAction = buildSceneActionFactory(p5, gfxPresentation, sfx, fonts, state);
      return es.level.showTitle
        ? buildSceneAction((p5, gfx, sfx, fonts, callbacks) => new TitleScene(es.level.name, annotation, p5, gfx, sfx, fonts, callbacks))
        : () => Promise.resolve();
  }

  interface ResetLevelParams {
    shouldShowTransitions: boolean,
    transition: () => Promise<void> | null,
    onTriggerWinGame?: () => void,
  }
  function resetLevel({ shouldShowTransitions = true, transition, onTriggerWinGame }: ResetLevelParams) {
    // init stats
    stats.applesEatenThisLevel = 0;
    stats.totalLevelTimeElapsed = 0;

    // init state for new es.level
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    drawState.shouldDrawActionFG = true;
    player.position = p5.createVector(15, 15);
    player.direction = DIR.RIGHT;
    player.directionToFirstSegment = DIR.LEFT;
    player.directionLastHit = DIR.LEFT;
    state.isPaused = false;
    state.isMoving = false;
    state.isRewinding = false;
    state.isSprinting = false;
    state.isLost = false;
    state.isGameWon = false;
    state.isDoorsOpen = false;
    state.isExitingLevel = false;
    state.isExited = false;
    state.isInvertedColors = false;
    state.actualTimeElapsed = 0;
    state.timeElapsed = 0;
    state.timeSinceLastMove = Infinity;
    state.timeSinceLastTeleport = Infinity;
    state.timeSinceHurt = Infinity;
    state.timeSinceHurtForgiveness = Infinity;
    state.timeSinceInvincibleStart = Infinity;
    state.timeSinceArmorPickup = Infinity;
    state.timeSinceArmorProtection = Infinity;
    state.timeSinceGraceStarted = 0;
    state.lives = state.gameMode === GameMode.Cobra ? state.lives : MAX_LIVES;
    state.collisions = 0;
    screenShake.timeSinceStarted = Infinity;
    screenShake.timeSinceLastStep = Infinity;
    screenShake.magnitude = 1;
    screenShake.timeScale = 1;
    screenShake.offset.x = 0;
    screenShake.offset.y = 0;
    state.targetSpeed = 1;
    state.currentSpeed = 1;
    state.steps = 0;
    state.pity = 0;
    state.frameCount = 0;
    state.numTeleports = 0;
    state.lastHurtBy = HitType.Unknown;
    state.hasKeyYellow = false;
    state.hasKeyRed = false;
    state.hasKeyBlue = false;
    es.moves = [];
    es.recentMoves = [null, null, null, null];
    es.recentInputs = [null, null, null, null];
    es.recentInputTimes = [Infinity, Infinity, Infinity, Infinity];
    es.barriers = [];
    es.doors = [];
    es.decoratives1 = [];
    es.decoratives2 = [];
    es.keys = [];
    es.passablesMap = {};
    es.barriersMap = {};
    es.doorsMap = {};
    es.pickupsMap = {};
    es.nospawnsMap = {};
    es.portals = { ...DEFAULT_PORTALS() };
    es.portalsMap = {};
    es.keysMap = {};
    apples.reset();
    mines.reset();
    shields.reset();
    shieldSpawns.reset();
    doorsOpening.reset();
    explosions.reset();
    fireTiles.reset();
    segments.reset();
    emitters.reset();
    emitters10.reset();
    particles.reset();
    particles10.reset();
    astar.reset();
    preyList.reset();

    if (es.level.layoutV2?.length) {
      try {
        // // NOTE TO FUTURE SELF: do NOT copy data directly from the URL. This is the path of pain and misery.
        // // Instead, use "Copy dev link" in snek editor, or use this snippet below:
        // const query = new URLSearchParams(`?data=${es.level.layoutV2}`);
        // const queryData = query.get('data');
        // const [data] = decodeMapData(queryData);
        const [data, options] = decodeMapData(es.level.layoutV2);
        es.level.colors = getExtendedPalette(options.palette);
        es.level.layout = buildMapLayout(data);
        es.level.snakeSpawnPointOverride = getCoordIndex(data.playerSpawnPosition);
        // may decide to remove these overwrites later
        es.level.disableAppleSpawn = options.disableAppleSpawn;
        if (options.disableAppleSpawn) {
          es.level.applesModOverride ??= 1;
          es.level.growthOverride = es.level.growthOverride ?? 2;
        }
        es.level.numApplesStart = options.numApplesStart;
        es.level.applesToClear = options.applesToClear;
        es.level.timeToClear = options.timeToClear;
        es.level.snakeStartSizeOverride = options.snakeStartSize;
        es.level.extraHurtGraceTime = options.extraHurtGraceTime;
        es.level.globalLight = options.globalLight;
        if (!es.level.musicTrack || es.level.musicTrack === MusicTrack.None) {
          es.level.musicTrack = options.musicTrack;
        }
        es.level.snakeStartDirectionOverride = data.startDirection;
      } catch (err) {
        console.error(err);
        console.error(`Unable to parse layoutV2 data for es.level "${es.level.name}"`);
      }
    }

    renderer.reset();
    renderer.invalidateStaticCache();
    spriteRenderer.setThemedAppleImage(es.level.colors);
    spriteRenderer.setThemedBorderImages(es.level.colors);
    spriteRenderer.setThemedDoorImage(es.level.colors);
    if (state.gameMode === GameMode.Cobra) {
      spriteRenderer.setThemedSegmentImage(PALETTE.cobra.playerTail, PALETTE.cobra.playerTailStroke);
    } else {
      spriteRenderer.setThemedSegmentImage(es.level.colors.playerTail, es.level.colors.playerTailStroke);
    }
    cacheGraphicalComponents();
    appleParticleSystem.setColorsFromLevel(es.level);
    UI.disableScreenScroll();
    UI.clearLabels();
    UI.hideDeathColors();
    clearUI();
    stopAction(Action.ChangeMusicLowpass);
    stopAction(Action.FadeMusic);
    stopAction(Action.GameOver);
    startAction(fadeMusic(1, 100), Action.FadeMusic);
    sfx.setGlobalVolume(settings.sfxVolume);
    resetScreenShake();
    applyScreenShakeGfx(0, 0);

    winLevelScene.reset();
    // modal.hide();
    // winGameScene.reset();

    resetGraphics();

    stopLogicLoop();
    if (shouldShowTransitions) {
      UI.hideGfxCanvas();
      actions.stopAll();
      musicPlayer.load(es.level.musicTrack);
      musicPlayer.setVolume(1);
      transition()
        .catch(err => { console.error(err); })
        .finally(() => {
          if (es.level.isWinGame) {
            state.isGameWon = true;
            state.isMoving = true;
            onTriggerWinGame();
          }
          renderDifficultyUI();
          renderHeartsUI();
          renderScoreUI();
          renderLevelName();
          UI.showGfxCanvas();
          musicPlayer.stopAllTracks();
          resumeAudioContext().then(() => {
            musicPlayer.play(es.level.musicTrack);
          })
          startLogicLoop();
        })
    } else {
      if (replay.mode !== ReplayMode.Playback && (state.isGameStarted || state.isGameStarting)) {
        if (DISABLE_TRANSITIONS) {
          musicPlayer.stopAllTracks();
        }
        musicPlayer.play(es.level.musicTrack);
      }
      startLogicLoop();
      renderDifficultyUI();
      renderHeartsUI();
      renderScoreUI();
      renderLevelName();
      UI.showGfxCanvas();
    }

    const levelData = buildLevel(es.level);
    player.position = levelData.playerSpawnPosition;
    player.direction = es.level.snakeStartDirectionOverride ?? DIR.RIGHT;
    player.directionToFirstSegment = invertDirection(player.direction);
    player.directionLastHit = invertDirection(player.direction);
    es.barriers = levelData.barriers;
    es.barriersMap = levelData.barriersMap;
    es.passablesMap = levelData.passablesMap;
    es.doors = levelData.doors;
    es.doorsMap = levelData.doorsMap;
    es.decoratives1 = levelData.decoratives1;
    es.decoratives2 = levelData.decoratives2;
    es.nospawnsMap = levelData.nospawnsMap;
    es.portals = levelData.portals;
    es.portalsMap = levelData.portalsMap;
    es.keys = levelData.keys;
    es.keysMap = levelData.keysMap;
    es.locks = levelData.locks;
    es.locksMap = levelData.locksMap;
    es.diffSelectMap = levelData.diffSelectMap;

    // set es.level metadata
    es.level.numLocks = es.locks.length;

    // create snake parts
    let x = player.position.x;
    let y = player.position.y;
    for (let i = 0; i < (es.level.snakeStartSizeOverride || START_SNAKE_SIZE); i++) {
      if (i < 3) {
        if (player.direction === DIR.RIGHT) x--;
        if (player.direction === DIR.LEFT) x++;
        if (player.direction === DIR.UP) y++;
        if (player.direction === DIR.DOWN) y--;
      }
      const segment = p5.createVector(x, y);
      segments.addVec(segment);
    }

    // add fire tiles
    es.barriers.filter(barrier => barrier.type === BarrierType.FireTile).forEach(barrier => {
      const x = barrier.vec.x;
      const y = barrier.vec.y;
      const lifetime = 99999999; // improbably high lifetime = never despawn
      fireTiles.add(x, y, lifetime, ANIMATIONS[Image.FireSheet].frames, ANIMATIONS[Image.FireSheet].timePerFrame);
    });

    // add initial mines
    for (let i = 0; i < levelData.mines.length; i++) {
      const x = levelData.mines[i].x;
      const y = levelData.mines[i].y;
      const lifetime = 99999999; // improbably high lifetime = never despawn
      mines.add(x, y, lifetime, ANIMATIONS[Image.MineSheet].frames, ANIMATIONS[Image.MineSheet].timePerFrame);
    }

    // add initial invincibility pickups
    for (let i = 0; i < levelData.invincibilities.length; i++) {
      const x = levelData.invincibilities[i].x;
      const y = levelData.invincibilities[i].y;
      if (!apples.existsAt(x, y)) apples.add(x, y);
      es.pickupsMap[getCoordIndex2(x, y)] = {
        timeTillDeath: 99999999, // improbably high lifetime = never despawn
        type: PickupType.Invincibility,
      };
    }

    // add initial apples
    for (let i = 0; i < levelData.apples.length; i++) {
      apples.add(levelData.apples[i].x, levelData.apples[i].y);
    }
    const numApplesStart = es.level.numApplesStart ?? NUM_APPLES_START;
    for (let i = 0; i < numApplesStart; i++) {
      spawnApple();
    }

    // setup prey spawns
    // TODO: configure drops per level - see obsidian notes
    preySpawn.dropsByFrame = {
      5: PreyType.Grub,
      10: PreyType.Ant,
      15: PreyType.FieldMouse,
      20: PreyType.Grasshopper,
      25: PreyType.FieldMouse,
      30: PreyType.Ant,
      35: PreyType.Grub,
    };
    es.barriers.forEach(barrier => {
      astar.setWall(barrier.vec.x, barrier.vec.y);
    });
    astar.setSnekCoord(getCoordIndex(player.position));
    es.doors.forEach(door => {
      astar.setWall(door.x, door.y);
    });

    resetLightmap(lightMap, es.level.globalLight ?? GLOBAL_LIGHT_DEFAULT);
    startPortalParticles();
    if (es.level.type === LevelType.WarpZone || (es.level.type === LevelType.Maze && es.level !== START_LEVEL && es.level !== START_LEVEL_COBRA)) {
      startExitParticles();
    }
  }

  function startLogicLoop() {
    if (loopState.interval) clearInterval(loopState.interval);
    loopState.interval = setInterval(withErrorReporting(logicLoop), 1);
  }

  function stopLogicLoop() {
    if (loopState.interval) clearInterval(loopState.interval);
    loopState.interval = null;
    loopState.deltaTime = 0;
    loopState.timeAccumulatedMs = 0;
    loopState.timePrevMs = 0;
    loopState.timeScale = 1;
  }

  function logicLoop() {
    const currentTime = window.performance.now();
    const diff = loopState.timePrevMs === 0
      ? FRAME_DUR_MS
      : Math.max(currentTime - loopState.timePrevMs, 0);
    loopState.timePrevMs = currentTime;
    loopState.timeAccumulatedMs += diff;
    // ensure logic loop fires at approximately <FRAMERATE> fps
    if (loopState.timeAccumulatedMs < FRAME_DUR_MS) {
      return;
    } else {
      loopState.deltaTime = loopState.timeAccumulatedMs * loopState.timeScale;
      loopState.timeAccumulatedMs = 0;
    }

    if (
      (state.isMoving || state.isRewinding) &&
      (p5.keyIsDown(p5.SHIFT) || getCurrentGamepadSprint())
    ) {
      state.isSprinting = true;
    } else {
      state.isSprinting = false;
    }

    if (state.isPaused) return;
    if (!state.isGameStarted && replay.mode !== ReplayMode.Playback) return;

    handleHurtForgiveness();

    if (state.isLost) return;

    // check if a segment intersects with an apple
    let didEat = false;
    for (let i = 0; i < segments.length; i++) {
      if (state.isLost || state.isExitingLevel) continue;
      const coord = getCoordIndex(segments.get(i));
      const appleFound = apples.existsAtCoord(coord) ? coord : -1;
      if (appleFound != undefined && appleFound >= 0) {
        spawnAppleParticles(segments.get(i));
        incrementScore();
        growSnake(appleFound);
        drawState.shouldDrawApples = true;
        didEat = true;
      }
    }

    // check if head has reached an apple
    const coord = getCoordIndex(player.position);
    const appleFoundCoord = apples.existsAtCoord(coord) ? coord : -1;
    if (appleFoundCoord != undefined && appleFoundCoord >= 0) {
      spawnAppleParticles(player.position);
      incrementScore();
      growSnake(appleFoundCoord);
      increaseSpeed();
      playSound(Sound.eat);
      if (!state.isDoorsOpen) renderLevelName();
      if (es.pickupsMap[coord]?.type === PickupType.Invincibility) {
        incrementPickupBonus(PickupType.Invincibility, coord);
        startInvincibility();
      } else if (es.pickupsMap[coord]?.type === PickupType.Armor) {
        // handled below via shieldSpawns / shields
      } else if (es.pickupsMap[coord]) {
        incrementPickupBonus(es.pickupsMap[coord]?.type, coord);
      }
      es.pickupsMap[coord] = null;
      drawState.shouldDrawApples = true;
      didEat = true;
    }

    // check if head has reached a shield pickup
    if (shieldSpawns.existsAtCoord(coord) || shields.existsAtCoord(coord)) {
      shieldSpawns.removeByCoord(coord);
      shields.removeByCoord(coord);
      incrementPickupBonus(PickupType.Armor, coord);
      acquireArmor();
    }

    // check if head has reached any prey
    if (preyList.existsAtCoord(coord)) {
      spawnAppleParticles(player.position);
      incrementPreyBonus(preyList.getTypeByCoord(coord), coord);
      growSnake(coord);
      increaseSpeed();
      playSound(Sound.eat);
      preyList.removeByCoord(coord);
      drawState.shouldDrawActionFG = true;
      didEat = true;
    }

    if (didEat && state.isDoorsOpen && apples.length === 0 && preyList.length === 0 && es.level.armorDrop && replay.mode !== ReplayMode.Playback) {
      const loc = chooseArmorSpawnLocation(es.level.armorDrop);
      if (loc >= 0) {
        spawnArmorPickup(getCoordX(getCoordX(loc)), getCoordY(loc));
      }
    }

    // tick time for prey
    if (!state.isInvertedColors) {
      astar.setSnekCoord(getCoordIndex(player.position));
      if (preyList.tick(loopState.deltaTime)) {
        drawState.shouldDrawActionFG = true;
      }
    }

    // tick time for all pickups
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        const i = getCoordIndex2(x, y);
        if (es.pickupsMap[i]) {
          es.pickupsMap[i].timeTillDeath -= loopState.deltaTime;
          if (es.pickupsMap[i].timeTillDeath <= 0) {
            es.pickupsMap[i] = null;
            apples.removeByCoord(i);
            drawState.shouldDrawApples = true;
          }
        }
      }
    }

    handlePortalTravel();
    handleKeyPickup();
    handleUnlock();
    handleDifficultySelect();
    handleSetNextLevel();

    const didHit = checkHasHit(player.position) || checkMineHit(player.position);
    if (didHit) {
      player.directionLastHit = player.direction;
      state.collisions += 1;
      state.isLost = true;
    }
    handleSnakeTrapped(state.isLost && state.lives > 0);
    handleSnakeDamage(state.isLost && state.lives > 0);

    // handle snake death
    if (state.isLost) {
      spawnHurtParticles();
      renderHeartsUI();
      flashScreen(HURT_FORGIVENESS_TIME);
      startScreenShake();
      triggerGameOver();
      playSound(Sound.death);
      return;
    }

    const didMove = handleSnakeMovement();
    handleSnakeRewind();

    handleSnakeMovementDuringReplay(didHit);
    handleCaptureReplayInfo(didMove, didHit);

    if (getHasClearedLevel() && !state.isDoorsOpen) {
      openDoors();
      playSound(Sound.doorOpen);
    }

    handleSnakeExitLevelStart();
    handleSnakeExitLevelMoveTick(didMove);
    handleSnakeExitLevelFinish();
    handleTeleportOnGameWin();

    state.timeSinceHurt += loopState.deltaTime;
    state.timeSinceHurtForgiveness += loopState.deltaTime;
    state.timeSinceInvincibleStart += loopState.deltaTime;
    state.timeSinceArmorPickup += loopState.deltaTime;
    state.timeSinceArmorProtection += loopState.deltaTime;
    state.timeSinceSpawnedPickup += loopState.deltaTime;
    state.timeSinceLastInput += loopState.deltaTime;
    state.timeSinceLastTeleport += loopState.deltaTime;
    state.frameCount += 1;
    for (let i = es.recentInputTimes.length - 1; i >= 0; i--) {
      es.recentInputTimes[i] += loopState.deltaTime;
    }
    // solution to infinite portal loop soft lock:
    // since the loop happens every frame, decrement every N frames so that
    // the count will accumulate until it passes some critical threshold
    if (state.frameCount % 8 === 0) {
      state.numTeleports = Math.max(state.numTeleports - 1, 0);
    }
  }

  const inputCallbacks: InputCallbacks = {
    onWarpToLevel: warpToLevel,
    onAddMove,
    onResetMoves,
    onUINavigate,
  }

  function onKeyPressed( ev: KeyboardEvent ) {
    if (IS_DEV && p5.keyCode === KEYCODE_F10) {
      saveMapImage();
      return;
    }
    handleKeyPressed(
      p5,
      state,
      clickState,
      player.direction,
      player.directionToFirstSegment,
      es.moves,
      es.recentMoves,
      es.recentInputs,
      es.recentInputTimes,
      checkPlayerWillHit,
      inputCallbacks,
      handleInputAction,
      ev,
    );
    state.timeSinceLastInput = 0;
    state.inputType = InputType.Keyboard;
  }

  async function saveMapImage() {
    // const mainCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    const fg = document.getElementById("canvas-fg") as HTMLCanvasElement;
    // const apples = document.getElementById("canvas-apples") as HTMLCanvasElement;
    const action = document.getElementById("canvas-action") as HTMLCanvasElement;
    const keysLocks = document.getElementById("canvas-es.keys-es.locks") as HTMLCanvasElement;
    const dest = document.getElementById("canvas-bg") as HTMLCanvasElement;
    const sourceDimensions = [1200, 1200] as const;
    const destinationDimensions = [1200, 1200] as const;
    // await overlayOntoCanvas(mainCanvas, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(fg, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(keysLocks, dest, ...sourceDimensions, ...destinationDimensions);
    // await overlayOntoCanvas(apples, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(action, dest, ...sourceDimensions, ...destinationDimensions);
    const img = await getCanvasImage(dest, `map-${Date.now()}.png`);
    downloadFile(img, `map-${findLevelWarpIndex(es.level)}-${es.level.name}.png`, 'img/png');
    renderer.invalidateStaticCache();
  }

  function renderLoop(gamepadInputHandled = false) {
    const timeFrameStart = performance.now();

    if (!gamepadInputHandled) {
      const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
      const isRewindAllowed = rewindAllowed(invincible || heldItems.armor > 0);
      const handled = applyGamepadMove(state, player.direction, player.directionToFirstSegment, isRewindAllowed, es.moves, inputCallbacks, handleInputAction)
      if (handled) {
        state.inputType = InputType.Gamepad;
      }
    }

    actions.tick();

    if (state.appMode === AppMode.StartScreen) return;
    if (state.isPaused) {
      renderer.drawRightUI(gfxUIRight, heldItems.armor);
      return;
    }

    setTimeout(() => { coroutines.tick(); }, 0);

    if (state.appMode === AppMode.Quote) {
      p5.background("#000");
      return;
    }

    updateScreenShake();
    drawBackground();

    for (let i = 0; i < es.decoratives1.length; i++) {
      drawDecorative1(es.decoratives1[i]);
    }

    for (let i = 0; i < es.decoratives2.length; i++) {
      drawDecorative2(es.decoratives2[i]);
    }

    drawExitLights();
    drawParticles(0);
    drawPointsText();
    drawBarriers();
    drawDoors();

    for (let i = 0; i < es.keys.length; i++) {
      drawKey(es.keys[i])
    }

    for (let i = 0; i < es.locks.length; i++) {
      drawLock(es.locks[i])
    }

    drawPortals();

    for (let i = 0; i < GRIDCOUNT_X * GRIDCOUNT_Y; i++) {
      if (apples.existsAtCoord(i)) {
        const x = Math.floor(i % GRIDCOUNT_X);
        const y = Math.floor(i / GRIDCOUNT_X);
        drawApple(x, y);
      }
    }

    drawShields();
    drawMines();
    drawPrey();
    drawFireTiles();
    drawExplosions();

    renderer.drawPlayerMoveArrows(p5, player.position, es.moves.length > 0 ? es.moves[0] : player.direction);

    for (let i = 0; i < segments.length; i++) {
      drawPlayerSegment(segments.get(i), i);
    }
    for (let i = 0; i < segments.length; i++) {
      erasePlayerSegmentCorner(segments.get(i), i);
    }

    const globalLight = es.level.globalLight ?? GLOBAL_LIGHT_DEFAULT;

    drawPlayerHead(player.position);
    drawPassableBarriers();
    drawParticles(10);
    renderer.drawCaptureMode();
    renderer.setStaticCacheFlags();

    drawState.shouldDrawApples = false;
    drawState.shouldDrawActionFG = false;
    drawState.shouldDrawKeysLocks = false;

    if (!state.isInvertedColors && pointsAnim.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (doorsOpening.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (!state.isInvertedColors && mines.tick(p5.deltaTime)) {
      drawState.shouldDrawApples = true;
    }
    if (fireTiles.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (explosions.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (shields.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (shieldSpawns.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }

    if (
      state.isGameStarted &&
      replay.mode !== ReplayMode.Playback &&
      globalLight < 1 &&
      !state.isInvertedColors &&
      state.timeSinceInvincibleStart >= es.difficulty.invincibilityTime
    ) {
      updateLighting(p5.deltaTime, lightMap, globalLight, player.position, es.portals, apples, es.pickupsMap, explosions, fireTiles);
      drawLighting(lightMap, renderer, gfxLighting);
    }

    if (es.level.renderInstructions) {
      es.level.renderInstructions(gfxPresentation, renderer, state, es.level.colors);
    }
    renderer.drawRightUI(gfxUIRight, heldItems.armor);
    renderer.drawTutorialMoveControls(gfxPresentation);
    renderer.drawTutorialRewindControls(gfxPresentation, player.position, rewindAllowed());
    renderer.drawFps(metrics.gameLoopProcessingTime);

    if (state.isLost && state.gameMode !== GameMode.Cobra) return;
    if (!state.isGameStarted && replay.mode !== ReplayMode.Playback) return;

    // tick time elapsed
    if (state.isMoving || replay.mode === ReplayMode.Playback) {
      state.timeElapsed += p5.deltaTime;
    }
    state.actualTimeElapsed += p5.deltaTime;

    handleSnakeExitLevelUI();

    renderer.tick();
    metrics.gameLoopProcessingTime = performance.now() - timeFrameStart;

    return true;
  }


  function playSound(sound: Sound, volume = 1, force = false) {
    if (state.isGameWon) return;
    if (!force && replay.mode === ReplayMode.Playback) return;
    sfx.play(sound, volume);
  }

  function onAddMove(currentMove: DIR) {
    if (!currentMove) return;
    es.moves.push(currentMove);
    for (let i = es.recentMoves.length - 1; i >= 0; i--) {
      if (i > 0) {
        es.recentMoves[i] = es.recentMoves[i - 1];
      } else {
        es.recentMoves[i] = currentMove;
      }
    }
  }

  function onResetMoves() {
    es.moves = [];
  }

  const onChangePlayerDirection: (direction: DIR) => void = (dir) => {
    if (validateMove(player.direction, dir)) {
      player.direction = dir;
      player.directionToFirstSegment = invertDirection(dir);
    }
  };

  function resetStats() {
    stats.numDeaths = 0;
    stats.numLevelsCleared = 0;
    stats.numLevelsEverCleared = 0;
    stats.numPointsEverScored = 0;
    stats.numApplesEverEaten = 0;
    stats.score = 0;
    stats.applesEatenThisLevel = 0;
    stats.totalGameTimeElapsed = 0;
    stats.totalLevelTimeElapsed = 0;
  }

  function resetGraphics() {
    renderer.invalidateStaticCache();
    gfxBG.clear(0, 0, 0, 0);
    gfxExitLights.clear(0, 0, 0, 0);
    gfxFG.clear(0, 0, 0, 0);
    gfxFGAction.clear(0, 0, 0, 0);
    gfxApples.clear(0, 0, 0, 0);
    gfxKeysLocks.clear(0, 0, 0, 0);
    gfxLighting.clear(0, 0, 0, 0);
    gfxPresentation.clear(0, 0, 0, 0);
    gfxUIRight.clear(0, 0, 0, 0);
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    drawState.shouldDrawActionFG = true;
  }

  function startMoving() {
    if (state.isMoving) return;
    if (state.isRewinding && state.timeSinceArmorProtection < TIME_REWIND_TAKEOVER_CONTROLS) return;
    state.isMoving = true;
    state.isRewinding = false;
    state.currentSpeed = 1;
    tutorial.needsMoveControls = false;
    stopRewinding();
    if (state.timeSinceHurt >= HURT_STUN_TIME) {
      playSound(Sound.moveStart);
    }
  }

  function stopRewinding() {
    state.isRewinding = false;
    sfx.stop(Sound.rewindLoop);
  }

  function startAutoRewind() {
    if (state.isRewinding) return;
    if (!rewindAllowed(true)) return;
    state.isRewinding = true;
    state.isMoving = false;
    state.currentSpeed = 1;
    state.timeSinceGraceStarted = 0;
    sfx.playLoop(Sound.rewindLoop);
  }

  function requestPlayerRewind() {
    if (state.isRewinding) return;
    const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const canRewind = rewindAllowed(invincible || heldItems.armor > 0);
    if (!canRewind) {
      return false;
    }
    state.isRewinding = true;
    state.isMoving = false;
    state.currentSpeed = 1;
    state.timeSinceGraceStarted = 0;
    tutorial.needsRewindControls = false;
    sfx.playLoop(Sound.rewindLoop);
    if (!invincible && heldItems.armor > 0) {
      heldItems.armor -= 1;
      state.timeSinceArmorProtection = 0;
      playSound(Sound.hurtSave);
    }
    return true;
  }

  function startInvincibility() {
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    startAction(invincibilityRoutine(), Action.Invincibility);
    state.lives = Math.min(state.lives + 1, MAX_LIVES);
    renderHeartsUI();
  }

  function* invincibilityRoutine(): IEnumerator {
    sfx.stop(Sound.invincibleLoop);
    playSound(Sound.pickupInvincibility);
    musicPlayer.setPlaybackRate(es.level.musicTrack, 0);
    musicPlayer.setVolume(0);
    state.timeSinceInvincibleStart = 0;
    state.isInvertedColors = true;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    loopState.timeScale = 0;
    startScreenShake(2, 0, 0.8);
    renderer.invalidateStaticCache();
    yield* coroutines.waitForTime(INVINCIBILITY_PICKUP_FREEZE_MS);
    state.isInvertedColors = false;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    loopState.timeScale = 1;
    startScreenShake(0, 1);
    renderer.invalidateStaticCache();
    yield* coroutines.waitForTime(600);
    sfx.playLoop(Sound.invincibleLoop, 0.55 * settings.musicVolume);
    while (state.timeSinceInvincibleStart < es.difficulty.invincibilityTime) {
      yield null;
    }
    sfx.stop(Sound.invincibleLoop);
    musicPlayer.setPlaybackRate(es.level.musicTrack, 1);
    musicPlayer.setVolume(1);
    if (state.isRewinding) {
      stopRewinding();
    }
  }

  function acquireArmor() {
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    heldItems.armor += 1;
    state.timeSinceArmorPickup = 0;
    state.currentSpeed = 1;
    startAction(armorRoutine(), Action.AcquireArmor);
  }

  function* armorRoutine(): IEnumerator {
    playSound(Sound.acquireShield, 0.6);
    sfx.stop(Sound.invincibleLoop);
    musicPlayer.setPlaybackRate(es.level.musicTrack, 0);
    musicPlayer.setVolume(0);
    state.isInvertedColors = true;
    drawState.shouldDrawActionFG = true;
    loopState.timeScale = 0;
    startScreenShake(2, 0, 0.8);
    renderer.invalidateStaticCache();
    yield* coroutines.waitForTime(ARMOR_PICKUP_FREEZE_MS);
    state.isInvertedColors = false;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    loopState.timeScale = 1;
    startScreenShake(0, 1);
    renderer.invalidateStaticCache();
    musicPlayer.setPlaybackRate(es.level.musicTrack, 1);
    musicPlayer.setVolume(1);
  }

  function spawnAppleParticles(position: Vector | undefined) {
    if (!position) return;
    appleParticleSystem.emit(position.x, position.y);
  }

  function flashScreen(extraDuration = 0) {
    if (replay.mode === ReplayMode.Playback) return;
    const screenFlashElement = UI.drawScreenFlash();
    setTimeout(() => {
      screenFlashElement?.remove();
    }, FRAMERATE * 2 + extraDuration)
  }

  function startScreenShake(magnitude = 1, normalizedTime = 0, timeScale = 1, force = false) {
    if (!force && replay.mode === ReplayMode.Playback) return;
    screenShake.timeSinceStarted = normalizedTime * SCREEN_SHAKE_DURATION_MS;
    screenShake.magnitude = magnitude;
    screenShake.timeScale = timeScale;
    const duration = (Math.max(1 - normalizedTime, 0) * SCREEN_SHAKE_DURATION_MS) / Math.max(timeScale, 0.1);
    if (!state.isGameWon) {
      applyGamepadRumble(duration, magnitude / 3, magnitude / 3);
    }
  }

  function updateScreenShake() {
    if (screenShake.offset == null) screenShake.offset = p5.createVector(0, 0);
    if (settings.isScreenShakeDisabled) {
      resetScreenShake();
      return;
    }
    screenShake.timeSinceStarted += p5.deltaTime;
    screenShake.timeSinceLastStep += p5.deltaTime * screenShake.timeScale;
    if (screenShake.timeSinceStarted < SCREEN_SHAKE_DURATION_MS) {
      if (screenShake.timeSinceLastStep >= 25) {
        screenShake.offset.x = (p5.random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
        screenShake.offset.y = (p5.random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
        screenShake.timeSinceLastStep = 0;
        if (state.isLost) {
          renderer.invalidateStaticCache();
          drawState.shouldDrawApples = true;
          drawState.shouldDrawKeysLocks = true;
        }
        applyScreenShakeGfx(screenShake.offset.x, screenShake.offset.y);
      }
    } else {
      if (screenShake.offset.x !== 0 || screenShake.offset.y !== 0) {
        if (state.isLost) {
          renderer.invalidateStaticCache();
          drawState.shouldDrawApples = true;
          drawState.shouldDrawKeysLocks = true;
        }
        applyScreenShakeGfx(0, 0);
      }
      resetScreenShake();
    }
  }

  function applyScreenShakeGfx(x: number, y: number) {
    const shake = (g: P5.Graphics, mul = 1) => { g.style('transform', `translate(${x * mul}px, ${y * mul}px)`); }
    shake(gfxBG, 0.5);
    shake(gfxExitLights, 0.5);
    shake(gfxFG, 2);
    shake(gfxFGAction, 1.7);
    shake(gfxKeysLocks, 1.5);
    shake(gfxApples, 1.2);
  }

  function resetScreenShake() {
    screenShake.offset.x = 0;
    screenShake.offset.y = 0;
    screenShake.magnitude = 1;
    screenShake.timeScale = 1;
    screenShake.timeSinceStarted = Infinity;
  }

  function getHasClearedLevel() {
    const applesMod = es.level.applesModOverride || es.difficulty.applesMod || 1;
    if (state.isGameWon) return false;
    if (DEBUG_EASY_LEVEL_EXIT && stats.applesEatenThisLevel > 0) return true;
    if (stats.applesEatenThisLevel >= es.level.applesToClear * applesMod) return true;
    if (state.timeElapsed >= es.level.timeToClear && stats.applesEatenThisLevel >= es.level.applesToClear * applesMod * 0.5) return true;
    return false;
  }

  function getHasSegmentExited(vec: Vector): boolean {
    return (
      vec.x > GRIDCOUNT_X - 1 ||
      vec.x < 0 ||
      vec.y > GRIDCOUNT_Y - 1 ||
      vec.y < 0
    );
  }

  function checkMineHit(vec: Vector): boolean {
    if (state.isExitingLevel) return false;
    if (state.isExited) return false;
    if (state.isGameWon) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    const coord = getCoordIndex(vec);
    if (mines.existsAtCoord(coord)) {
      explodeMine(vec.x, vec.y);
      // check invincible
      const isInvincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
      if (isInvincible) {
        return false;
      }
      // check armor
      if (heldItems.armor > 0) {
        heldItems.armor -= 1;
        state.timeSinceArmorProtection = 0;
        startScreenShake(1, 0.5);
        reboundSnake(segments.length > 3 ? 2 : 1);
        // TODO: ADD UNIQ SOUND
        playSound(Sound.hurtSave);
        return false;
      }
      state.lastHurtBy = HitType.HitMine;
      return true;
    }
    return false;
  }

  function explodeMine(x: number, y: number) {
    if (!mines.existsAt(x, y)) return;
    const coord = getCoordIndex2(x, y);
    mines.removeByCoord(coord);
    const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
    explosions.add(x, y, frames * timePerFrame, frames, timePerFrame);
    playSound(Sound.xpound);
    drawState.shouldDrawApples = true;
    drawState.shouldDrawActionFG = true;
  }

  function checkPlayerWillHit(dir: DIR, numMoves = 1): boolean {
    const pos = player.position.copy();
    const currentMove = dirToUnitVector(dir);
    for (let i = 0; i < numMoves; i++) {
      const futurePosition = pos.add(currentMove);
      const willHit = checkHasHit(futurePosition, false) || checkPortalTeleportWillHit(futurePosition, dir);
      if (willHit) return true;
    }
    return false;
  }

  function handleKeyPickup() {
    // if player is on top of a key, pick it up!
    const index = getCoordIndex(player.position);
    const key = es.keysMap[index];
    if (!key) return;
    if (key.channel === KeyChannel.Yellow) {
      state.hasKeyYellow = true;
      es.keys = es.keys.filter(key => key.channel !== KeyChannel.Yellow);
    } else if (key.channel === KeyChannel.Red) {
      state.hasKeyRed = true;
      es.keys = es.keys.filter(key => key.channel !== KeyChannel.Red);
    } else if (key.channel === KeyChannel.Blue) {
      state.hasKeyBlue = true;
      es.keys = es.keys.filter(key => key.channel !== KeyChannel.Blue);
    }
    es.keysMap[index] = null;
    playSound(Sound.pickup, 0.35);
    drawState.shouldDrawKeysLocks = true;
  }

  function handleUnlock() {
    if (!state.hasKeyYellow && !state.hasKeyRed && !state.hasKeyBlue) {
      return;
    }
    for (let i = 0; i < es.locks.length; i++) {
      if (state.hasKeyYellow && es.locks[i].channel === KeyChannel.Yellow && isWithinBlockDistance(es.locks[i].position, player.position, 1)) {
        unlockGate(es.locks[i]);
        return;
      }
      if (state.hasKeyRed && es.locks[i].channel === KeyChannel.Red && isWithinBlockDistance(es.locks[i].position, player.position, 1)) {
        unlockGate(es.locks[i]);
        return;
      }
      if (state.hasKeyBlue && es.locks[i].channel === KeyChannel.Blue && isWithinBlockDistance(es.locks[i].position, player.position, 1)) {
        unlockGate(es.locks[i]);
        return;
      }
    }
  }

  function unlockGate(lockTriggered: Lock) {
    playSound(Sound.doorOpenHuge);
    startScreenShake(0.7, 0.5);
    const group: Record<number, boolean> = {}
    const directionsToCheck: Vector[] = [
      dirToUnitVector(DIR.LEFT),
      dirToUnitVector(DIR.RIGHT),
      dirToUnitVector(DIR.UP),
      dirToUnitVector(DIR.DOWN),
    ]
    const addTouchingLocksToGroup = (lock: Lock) => {
      group[lock.coord] = true;
      for (let i = 0; i < directionsToCheck.length; i++) {
        const index = getCoordIndex(lock.position.copy().add(directionsToCheck[i]));
        if (!group[index] && es.locksMap[index] && es.locksMap[index].channel === lockTriggered.channel) {
          addTouchingLocksToGroup(es.locksMap[index]);
        }
      }
    }
    addTouchingLocksToGroup(lockTriggered);
    const coords = Object.keys(group).map(coordKey => parseInt(coordKey, 10));
    es.locks = es.locks.filter((lock) => {
      if (coords.includes(lock.coord)) {
        es.locksMap[lock.coord] = null;
        gateUnlockParticleSystem.emit(lock.position.x, lock.position.y, lock.channel);
        return false;
      }
      return true;
    });
    drawState.shouldDrawKeysLocks = true;
  }

  function handleDifficultySelect() {
    if (!getIsStartLevel()) return;
    const index = getCoordIndex(player.position);
    const difficultyIndex = es.diffSelectMap[index];
    if (difficultyIndex === undefined) return;
    es.difficulty = getDifficultyFromIndex(difficultyIndex);
  }

  function handleSetNextLevel() {
    const nextLevel = es.level.nextLevelMap?.[getCoordIndex(player.position)];
    if (!nextLevel) return;
    state.nextLevel = nextLevel;
  }

  function handleCaptureReplayInfo(didMove: boolean, didHit: boolean) {
    if (state.gameMode === GameMode.Casual) return;
    if (!state.isMoving) return;
    if (replay.mode !== ReplayMode.Capture) return;
    if (didMove) {
      replay.positions[state.frameCount] = [player.position.x, player.position.y];
    }
    // capture snake movement after hit and rebound
    if (didHit) {
      replay.positions[state.frameCount] = [player.position.x, player.position.y];
    }
  }

  function handleSnakeExitLevelStart() {
    if (state.isGameWon) return;
    if (state.isExitingLevel) return;
    if (!getHasSegmentExited(player.position)) return;

    const isStartLevel = getIsStartLevel();
    state.isExitingLevel = true;
    state.timeSinceInvincibleStart = Infinity;
    winLevelScene.reset(isStartLevel ? 'GET PSYCHED!' : 'SNEK CLEAR!');
    if (isStartLevel) startScreenShake(1.5, -1);
    sfx.stop(Sound.invincibleLoop);
    sfx.stop(Sound.rewindLoop);
    stopAction(Action.Invincibility);
    stopAction(Action.AcquireArmor);
    musicPlayer.setPlaybackRate(es.level.musicTrack, 1);
    exitLightParticleSystem.reset();
    acquirePickupParticleSystem.reset();
    if (replay.mode !== ReplayMode.Playback) {
      startAction(fadeMusic(0, 1000), Action.FadeMusic);
      if (isStartLevel) {
        playSound(Sound.doorOpenHuge);
      } else if (es.level === LEVEL_99 || es.level === VARIANT_LEVEL_99 || es.level.playWinSound) {
        playSound(Sound.winGame);
      } else {
        playSound(Sound.winLevel);
      }
    }
    // blow up all mines currently on the level
    const numExplosionsAtLevelExit = mines.length + preyList.length;
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        const coord = getCoordIndex2(x, y);
        if (mines.existsAtCoord(coord)) {
          mines.removeByCoord(coord);
          const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
          explosions.add(x, y, frames * timePerFrame, frames, timePerFrame);
          drawState.shouldDrawApples = true;
          drawState.shouldDrawActionFG = true;
        }
        if (preyList.existsAtCoord(coord)) {
          preyList.removeByCoord(coord);
          const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
          explosions.add(x, y, frames * timePerFrame, frames, timePerFrame);
          drawState.shouldDrawApples = true;
          drawState.shouldDrawActionFG = true;
        }
      }
    }
    // play several explosion sounds (but staggered)
    if (numExplosionsAtLevelExit) {
      const callbacks: (() => void)[] = [];
      for (let i = 0; i < numExplosionsAtLevelExit && i < 6; i++) {
        callbacks.push(() => playSound(Sound.xpound));
      }
      const chain = callbacks.reduce((acc, cur) => {
        return () => setTimeout(() => {
          cur();
          acc();
        }, 50);
      }, () => {});
      chain();
    }
  }

  function handleSnakeExitLevelMoveTick(didMove: boolean) {
    if (!didMove) return;
    if (!state.isExitingLevel) return;
    if (state.isExited) return;
    if (getIsStartLevel()) return;
    if (es.level.type === LevelType.Maze) return;
    if (es.level.type === LevelType.WarpZone) return;

    incrementScoreWhileExitingLevel();
    renderScoreUI();
  }

  function handleSnakeExitLevelUI() {
    if (state.isExitingLevel && replay.mode !== ReplayMode.Playback) {
      winLevelScene.draw();
    }
  }

  function handleSnakeExitLevelFinish() {
    if (!state.isExitingLevel) return;
    if (state.isExited) return;
    if (state.isGameWon) return;
    if (!segments.every(segment => getHasSegmentExited(segment))) return;

    state.isExited = true;
    if (replay.mode === ReplayMode.Playback) {
      proceedToNextReplayClip();
      return;
    }

    if (DISABLE_TRANSITIONS) {
      gotoNextLevel();
    } else if (getIsStartLevel()) {
      gotoNextLevel();
    } else if (es.level.type === LevelType.Maze) {
      gotoNextLevel();
    } else if (es.level.type === LevelType.WarpZone) {
      gotoNextLevel();
    } else {
      const levelToSave = es.level.recordProgressAsLevel || es.level;
      const isPerfect = apples.length === 0 && state.collisions === 0;
      const hasAllApples = apples.length === 0;
      const hasAllLocks = !!es.level.numLocks && es.locks.length === 0;
      const shouldRecordLevelCompletion = !DEBUG_EASY_LEVEL_EXIT &&
        state.gameMode !== GameMode.Casual &&
        !!levelToSave?.id;

      if (shouldRecordLevelCompletion) {
        onRecordLevelProgress(levelToSave.id, es.difficulty.index, isPerfect, stats.totalLevelTimeElapsed);
      }

      winLevelScene.triggerLevelExit({
        score: stats.score,
        levelClearBonus: getLevelClearBonus(),
        livesLeftBonus: getLivesLeftBonus(),
        allApplesBonus: getAllApplesBonus(),
        allLocksBonus: getAllLocksBonus(),
        perfectBonus: getPerfectBonus(),
        livesLeft: state.lives,
        isPerfect,
        hasAllApples,
        hasAllLocks,
        isCasualModeEnabled: state.gameMode === GameMode.Casual,
        levelMusicTrack: getIsStartLevel() ? undefined : es.level.musicTrack,
        parTime: es.level.parTime || DEFAULT_PAR_TIME,
        clearTime: Math.floor(stats.totalLevelTimeElapsed / 1000) * 1000,
        onApplyScore: () => {
          musicPlayer.stopAllTracks();
          const perfectBonus = isPerfect ? getPerfectBonus() : 0;
          const allApplesBonus = (!isPerfect && hasAllApples) ? getAllApplesBonus() : 0;
          const allLocksBonus = hasAllLocks ? getAllLocksBonus() : 0;
          addPoints(getLevelClearBonus()
            + getLivesLeftBonus() * state.lives
            + perfectBonus
            + allApplesBonus
            + allLocksBonus);
          renderScoreUI();
        },
      });
    }
  }

  function handleHurtForgiveness() {
    if (state.timeSinceHurtForgiveness < HURT_STUN_TIME * 2) return;
    if (state.timeSinceHurt >= HURT_FORGIVENESS_TIME) return;
    if (state.isGameWon) return;
    if (state.gameMode === GameMode.Casual) return;
    if (!state.isGameStarted) return;
    if (!state.isMoving) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (es.moves.length <= 0) return;
    if (segments.length <= 0) return;
    if (state.lastHurtBy === HitType.HitMine) return;

    const isGameOver = state.isLost && state.lives === 0;
    const move = es.moves[0];
    if (!isOrthogonalDirection(move, player.directionLastHit)) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }
    if (move === player.directionToFirstSegment) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }
    if (move === player.direction && isGameOver) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }

    const currentMove = dirToUnitVector(move);
    const futurePosition = isGameOver
      ? segments.get(0).copy().add(currentMove)
      : player.position.copy().add(currentMove);
    const willHitSomething = checkHasHit(futurePosition);
    if (willHitSomething) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }

    if (isGameOver) {
      reboundSnake(segments.length > 3 ? 2 : 1);
      playSound(Sound.hurt3);
    } else {
      state.lives += 1;
      state.collisions = Math.max(state.collisions - 1, 0);
    }
    es.moves.shift();
    player.direction = move;
    player.directionToFirstSegment = getDirectionSnakeBackward();
    state.isLost = false;
    state.timeSinceHurt = Infinity;
    state.timeSinceHurtForgiveness = 0;
    sfx.stop(Sound.death);
    playSound(Sound.hurtSave);
    renderHeartsUI();
    stopAction(Action.GameOver);
    renderer.invalidateStaticCache();
  }

  function checkArmorProtection(vec: Vector): boolean {
    if (heldItems.armor <= 0) return false;

    const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    if (!invincible) {
      heldItems.armor -= 1;
    }
    state.timeSinceArmorProtection = 0;

    // check if barrier at player position is breakable
    let isBreakable = false;
    const coord = getCoordIndex(vec);
    const isPassableBarrier = state.isDoorsOpen && es.passablesMap[coord];
    if (!isPassableBarrier && es.barriersMap[coord]) {
      isBreakable = es.barriersMap[coord] && (
        es.barriersMap[coord] === BarrierType.Brick ||
        es.barriersMap[coord] === BarrierType.BrickThemed ||
        es.barriersMap[coord] === BarrierType.BrickWhite ||
        es.barriersMap[coord] === BarrierType.Stone ||
        es.barriersMap[coord] === BarrierType.StoneThemed
      );
    }
    if (isBreakable) {
      const barrierIdx = es.barriers.findIndex(barrier => getCoordIndex(barrier.vec) === coord);
      es.barriers = removeArrayElement(es.barriers, barrierIdx);
      es.barriersMap[coord] = BarrierType.Unset;
      renderer.invalidateStaticCache();
      const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
      explosions.add(vec.x, vec.y, frames * timePerFrame, frames, timePerFrame);
      playSound(Sound.xplodeLong);
      startScreenShake(2, 0, 0.8);
      reboundSnake(segments.length > 3 ? 2 : 1);
    } else {
      startAutoRewind()
      startScreenShake(0.3, 0.8);
    }
    if (!invincible) {
      // TODO: ADD UNIQ SOUND
      playSound(Sound.hurtSave);
    }
    return true;
  }

  // if snake has trapped itself, die immediately
  function handleSnakeTrapped(didReceiveDamage: boolean) {
    if (!didReceiveDamage) return;
    if (state.gameMode === GameMode.Casual) return

    let trapped = true;
    outer:
    for (let i = 0; i < 3; i++) {
      const prev = segments.get(i);
      for (let i = 0; i <= 3; i++) {
        let dir = DIR.UP;
        if (i === 1) dir = DIR.RIGHT;
        if (i === 2) dir = DIR.DOWN;
        if (i === 3) dir = DIR.LEFT;
        const pos = prev.copy().add(dirToUnitVector(dir));
        if (!checkHasHit(pos)) {
          trapped = false;
          break outer;
        }
      }
    }
    if (trapped) {
      state.lives = 0;
      state.isLost = true;
      playSound(Sound.hurt3);
    }
  }

  function handleSnakeDamage(didReceiveDamage: boolean) {
    // const didReceiveDamage = state.isLost && state.lives > 0;
    if (!didReceiveDamage) return;

    state.isLost = false;
    if (state.gameMode === GameMode.Casual && replay.mode !== ReplayMode.Playback) {
      state.isMoving = false;
    } else {
      state.lives -= 1;
    }
    state.timeSinceHurt = 0;
    if (es.difficulty.index === 4) {
      state.currentSpeed = 1;
    } else {
      state.currentSpeed = 2;
    }
    flashScreen();
    startScreenShake(1, 0.4);
    renderHeartsUI();
    if (state.lastHurtBy !== HitType.HitMine) { spawnHurtParticles(); }
    reboundSnake(segments.length > 3 ? 2 : 1);
    player.directionToFirstSegment = getDirectionSnakeBackward();

    // if snake will move backwards into itself:
    // - set current direction to be: segments[0] --> snake head
    const currentMove = dirToUnitVector(player.direction);
    const futurePosition = player.position.copy().add(currentMove);
    if (segments.length > 0 && futurePosition.equals(segments.get(0).x, segments.get(0).y)) {
      player.direction = getDirectionSnakeForward();
    }

    es.moves = [];
    startAction(duckMusicOnHurt(), Action.FadeMusic);
    switch (state.lives) {
      case 2:
        playSound(Sound.hurt1);
        break;
      case 1:
        playSound(Sound.hurt2);
        break;
      case 0:
        playSound(Sound.hurt3);
        break;
    }
  }

  function* duckMusicOnHurt(): IEnumerator {
    yield null;
    let t = 0;
    while (t < 1) {
      musicPlayer.setVolume(clamp(p5.lerp(HURT_MUSIC_DUCK_VOL, 1, t), 0, 1));
      t += p5.deltaTime / HURT_MUSIC_DUCK_TIME_MS;
      yield null;
    }
    musicPlayer.setVolume(1);
    clearAction(Action.FadeMusic);
  }

  function spawnHurtParticles() {
    impactParticleSystem.emit(player.position.x, player.position.y);
  }

  /**
   * actions to apply when snake eats an apple
   */
  function growSnake(appleCoord = -1) {
    drawState.shouldDrawApples = true;
    if (state.isLost) return;
    if (appleCoord < 0) return;
    startScreenShake(0.25, 0.8);
    apples.removeByCoord(appleCoord);
    const numSegmentsToAdd = Math.max(
      ((es.level.growthOverride ?? es.difficulty.index) - Math.floor(segments.length / 100)) * (es.level.growthMod ?? 1),
      1
    );
    const maxSize = es.level === LEVEL_WIN_GAME ? 0.25 : MAX_SNAKE_SIZE;
    if (segments.length < maxSize) {
      for (let i = 0; i < numSegmentsToAdd; i++) {
        addSnakeSegment();
      }
    }
    if (!state.isDoorsOpen) {
      spawnApple();
    }
  }

  function addPoints(points: number) {
    if (state.isGameWon) return;
    if (state.gameMode === GameMode.Casual) return;
    if (getIsStartLevel()) return;
    stats.score += points;
    stats.numPointsEverScored += points;
  }

  function getParTimeBonusMultiplier() {
    const parTime = es.level.parTime || DEFAULT_PAR_TIME;
    const clearTime = Math.floor(stats.totalLevelTimeElapsed / 1000) * 1000;
    if (parTime <= 0) return 1;
    if (clearTime > parTime) return 1;
    // if (clearTime <= parTime - 30000) return 3;
    if (clearTime <= parTime - 20000) return 2.5;
    if (clearTime <= parTime - 10000) return 2;
    if (clearTime <= parTime) return 1.5;
    return 1;
  }

  function getLevelClearBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return (LEVEL_BONUS * es.difficulty.bonusMod * cobraMod || LEVEL_BONUS) * getParTimeBonusMultiplier();
  }

  function getLivesLeftBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return LIVES_LEFT_BONUS * es.difficulty.bonusMod * cobraMod || LIVES_LEFT_BONUS;
  }

  function getAllApplesBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return ALL_APPLES_BONUS * es.difficulty.bonusMod * cobraMod || ALL_APPLES_BONUS;
  }

  function getAllLocksBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return ALL_LOCKS_BONUS * es.difficulty.bonusMod * cobraMod || ALL_LOCKS_BONUS;
  }

  function getPerfectBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return PERFECT_BONUS * es.difficulty.bonusMod * cobraMod || PERFECT_BONUS;
  }

  function incrementScore() {
    if (state.isGameWon) return;
    let bonus = 0;
    if (state.isDoorsOpen) {
      bonus = CLEAR_BONUS * es.difficulty.scoreMod;
    }
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    const points = SCORE_INCREMENT * es.difficulty.scoreMod * cobraMod + bonus
    stats.applesEatenThisLevel += 1;
    stats.numApplesEverEaten += 1;
    addPoints(points);
    renderScoreUI();
  }

  function incrementPreyBonus(preyType: PreyType, coord: number) {
    if (state.isGameWon) return;
    if (state.isLost) return;
    let points = 0;
    let image: SpritesheetImage | null = null;
    let rarity: PickupRarity = PickupRarity.None;
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    switch (preyType) {
      case PreyType.Ant:
      case PreyType.Grub:
        points = PICKUP_EPIC_BONUS;
        image = Image.Points2000;
        rarity = PickupRarity.Epic;
        break;
      case PreyType.Grasshopper:
        points = PICKUP_LEGENDARY_BONUS;
        image = Image.Points5000;
        rarity = PickupRarity.Legendary;
        break;
      case PreyType.FieldMouse:
        points = PICKUP_GALACTIC_BONUS;
        image = Image.Points10000;
        rarity = PickupRarity.Galactic;
        break;
      default:
        break;
    }
    if (image) {
      pointsAnim.add(
        x,
        y,
        ANIMATIONS[image].frames * ANIMATIONS[image].timePerFrame,
        ANIMATIONS[image].frames,
        ANIMATIONS[image].timePerFrame,
        rarity,
      );
    }
    stats.applesEatenThisLevel += 1;
    stats.numApplesEverEaten += 1;
    addPoints(points);
    renderScoreUI();
  }

  function incrementPickupBonus(pickupType: PickupType, coord: number) {
    if (state.isGameWon) return;
    if (state.isLost) return;
    let points = 0;
    let image: SpritesheetImage | null = null;
    let rarity: PickupRarity = PickupRarity.None;
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    if (pickupType === PickupType.Invincibility) {
      points = PICKUP_INVINCIBILITY_BONUS;
      image = Image.Points1000;
      rarity = PickupRarity.Rare;
    } else if (pickupType === PickupType.Armor) {
      points = PICKUP_INVINCIBILITY_BONUS;
      image = Image.Points1000;
      rarity = PickupRarity.Rare;
    } else if (PICKUP_COMMON_ITEMS.includes(pickupType)) {
      points = PICKUP_COMMON_BONUS;
      image = Image.Points500;
      rarity = PickupRarity.Common;
    } else if (PICKUP_RARE_ITEMS.includes(pickupType)) {
      points = PICKUP_RARE_BONUS;
      image = Image.Points1000;
      rarity = PickupRarity.Rare;
    } else if (PICKUP_EPIC_ITEMS.includes(pickupType)) {
      points = PICKUP_EPIC_BONUS;
      image = Image.Points2000;
      rarity = PickupRarity.Epic;
    } else if (PICKUP_LEGENDARY_ITEMS.includes(pickupType)) {
      points = PICKUP_LEGENDARY_BONUS;
      image = Image.Points5000;
      rarity = PickupRarity.Legendary;
    }
    if (image) {
      pointsAnim.add(
        x,
        y,
        ANIMATIONS[image].frames * ANIMATIONS[image].timePerFrame,
        ANIMATIONS[image].frames,
        ANIMATIONS[image].timePerFrame,
        rarity,
      );
    }
    addPoints(points);
    renderScoreUI();
  }

  function incrementScoreWhileExitingLevel() {
    if (state.isGameWon) return;
    addPoints(SCORE_INCREMENT);
  }

  function increaseSpeed() {
    if (state.isLost) return;
    state.targetSpeed += 1;
    if (es.level.appleSlowdownMod && !state.isSprinting) {
      state.currentSpeed = Math.min(es.difficulty.speedSteps * es.level.appleSlowdownMod, state.currentSpeed);
    }
  }

  function openDoors() {
    const { frames, timePerFrame } = ANIMATIONS[Image.DoorOpenSheet];
    es.doors.forEach(door => {
      astar.removeWall(door.x, door.y);
      const x = door.x;
      const y = door.y;
      doorsOpening.add(x, y, frames * timePerFrame, frames, timePerFrame);
    });
    state.isDoorsOpen = true;
    startExitParticles();
    es.doors = [];
    es.doorsMap = {};
    renderer.invalidateStaticCache();
    drawState.shouldDrawKeysLocks = true;
  }

  function spawnApple(numTries = 0) {
    drawState.shouldDrawApples = true;
    if (es.level.disableAppleSpawn) return;
    if (replay.mode === ReplayMode.Playback) {
      addAppleReplayMode();
      return;
    }
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y);
    if (spawnedInsideOfSomething) {
      if (numTries < 30) spawnApple(numTries + 1);
      return;
    }
    apples.add(x, y);
    if (replay.mode === ReplayMode.Capture) {
      replay.applesToSpawn.push([x, y]);
    }
    let spawned = false;
    if (maybeSpawnInvincibilityPickup()) { spawned = true; }
    if (maybeSpawnMine()) { spawned = true; }
    if (maybeSpawnArmor()) { spawned = true; }
    if (!spawned && maybeSpawnOtherPickup(x, y)) { spawned = true; }
    if (!spawned) {
      state.pity = lerp(state.pity, 1, PITY_INCREMENT);
      state.pity = clamp(state.pity, 0, 1);
    }
    maybeSpawnPrey();
  }

  function maybeSpawnMine() {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (!es.level.pickupDropsByFrame && !es.level.pickupDrops?.[ItemDropType.Mine] && state.gameMode !== GameMode.Cobra) return false;

    const progress = getLevelProgress(stats, es.level, es.difficulty);
    const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.Mine
      ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
      : undefined
    const shouldSpawnDefault = state.gameMode === GameMode.Cobra;
    const baseLikelihood = getDropLikelihood(
      es.level.pickupDrops?.[ItemDropType.Mine] ?? shouldSpawnDefault,
      DROP_LIKELIHOOD_MINE,
      es.difficulty.index
    ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
    const likelihood = frameLikelihood ?? baseLikelihood;
    const r = Math.random() + likelihood;
    if (r < 1) {
      return false;
    }
    spawnMine()
    return true;
  }

  function maybeSpawnInvincibilityPickup(): boolean {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (state.timeSinceSpawnedPickup < PICKUP_SPAWN_COOLDOWN) return false;
    if (!es.level.pickupDropsByFrame && !es.level.pickupDrops?.[ItemDropType.Invincibility]) return false;

    const type = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type || ItemDropType.Invincibility;
    if (type !== ItemDropType.Invincibility) {
      return false;
    }
    const progress = getLevelProgress(stats, es.level, es.difficulty);
    const baseLikelihood = getDropLikelihood(
      es.level.pickupDrops?.[ItemDropType.Invincibility] ?? true,
      DROP_LIKELIHOOD_INVINCIBILITY,
      es.difficulty.index
    ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
    const likelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood || baseLikelihood;
    const r = Math.random() + likelihood;
    if (r < 1) {
      return false;
    }
    spawnInvincibilityPickup()
    return true;
  }

  function maybeSpawnArmor(): boolean {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (!es.level.pickupDropsByFrame && !es.level.pickupDrops?.[ItemDropType.Armor]) return false;

    const progress = getLevelProgress(stats, es.level, es.difficulty);
    const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.Armor
      ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
      : undefined
    const baseLikelihood = getDropLikelihood(
      es.level.pickupDrops?.[ItemDropType.Armor] ?? false,
      DROP_LIKELIHOOD_ARMOR,
      es.difficulty.index
    ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
    const likelihood = frameLikelihood ?? baseLikelihood;
    const r = Math.random() + likelihood;
    if (r < 1) {
      return false;
    }
    const coord = chooseArmorSpawnLocation();
    if (coord < 0) {
      return false
    }
    spawnArmorPickup(getCoordX(coord), getCoordY(coord));
    return true;
  }

  function maybeSpawnOtherPickup(x: number, y: number): boolean {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if(es.pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Invincibility) return false;
    if (Math.random() > BASE_PICKUP_RARITY) return false;

    const pool: PickupType[] = (es.level.pickupTypes ?? DEFAULT_PICKUP_TYPES).filter(pickupType => PICKUP_TYPE_RARITY_MAP[pickupType] > 0);
    const weights: number[] = pool.map(pickupType => lerp(PICKUP_TYPE_RARITY_MAP[pickupType], RARITY_COMMON, state.pity));
    if (pool.length !== weights.length) throw new Error(`pool and weight lengths do not match: ${pool.length} vs ${weights.length}`);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const r = Math.random() * totalWeight;
    let sum = 0;
    let pickup = PickupType.None;
    for (let i = 0; i < pool.length; i++) {
      sum += weights[i];
      if (r <= sum) {
        pickup = pool[i];
        break;
      }
    }
    if (!pickup) {
      return false;
    }
    es.pickupsMap[getCoordIndex2(x, y)] = {
      timeTillDeath: 999999999999,
      type: pickup,
    };
    // adjust pity system
    const rarity = PICKUP_TYPE_RARITY_MAP[pickup];
    if (rarity === RARITY_LEGENDARY) {
      state.pity = 0;
    } else if (rarity === RARITY_EPIC) {
      state.pity *= 0.5;
    } else if (rarity === RARITY_COMMON) {
      state.pity = lerp(state.pity, 1, PITY_INCREMENT);
    }
    state.pity = clamp(state.pity, 0, 1);
    return true;
  }

  function chooseArmorSpawnLocation(initialCoord = -1): number {
    if (initialCoord < 0) {
      initialCoord = getCoordIndex2(
        Math.floor(Math.random() * GRIDCOUNT_X - 2) + 1,
        Math.floor(Math.random() * GRIDCOUNT_Y - 2) + 1,
      );
    }
    const visited: Record<number, boolean> = {}
    const validCandidate = (x: number, y: number) => {
      return (
        !visited[getCoordIndex2(x, y)] &&
        x >= 0 &&
        y >= 0 &&
        x < GRIDCOUNT_X &&
        y < GRIDCOUNT_Y
      );
    }
    const candidateFound = (x: number, y: number) => {
      const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
        || es.doorsMap[getCoordIndex2(x, y)]
        || es.nospawnsMap[getCoordIndex2(x, y)]
        || mines.existsAt(x, y)
        || apples.existsAt(x, y)
        || segments.containsCoord(getCoordIndex2(x, y))
        || player.position.equals(x, y);
      return !spawnedInsideOfSomething;
    }
    const candidates = [initialCoord];
    while (candidates.length > 0) {
      const current = candidates.pop();
      visited[current] = true;
      const x = getCoordX(current);
      const y = getCoordY(current);
      if (candidateFound(x, y)) {
        return current;
      }
      if (validCandidate(x + 1, y)) {
        candidates.push(getCoordIndex2(x + 1, y));
      }
      if (validCandidate(x - 1, y)) {
        candidates.push(getCoordIndex2(x - 1, y));
      }
      if (validCandidate(x, y + 1)) {
        candidates.push(getCoordIndex2(x, y + 1));
      }
      if (validCandidate(x, y - 1)) {
        candidates.push(getCoordIndex2(x, y - 1));
      }
    }
    return -1;
  }

  function spawnArmorPickup(x: number, y: number) {
    const { frames, timePerFrame } = ANIMATIONS[Image.ShieldSpawn];
    shieldSpawns.add(x, y, frames * timePerFrame, frames, timePerFrame);
    playSound(Sound.shieldSpawn, 0.45);
    if (mines.existsAt(x, y)) {
      explodeMine(x, y);
    }
  }

  function spawnMine(numTries = 0) {
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y)
      || apples.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y);
    const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 5;
    if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
      if (numTries < 30) spawnMine(numTries + 1);
    } else {
      const { frames, timePerFrame } = ANIMATIONS[Image.MineSheet];
      mines.add(x, y, PICKUP_LIFETIME_MS, frames, timePerFrame);
    }
  }

  function spawnInvincibilityPickup(numTries = 0) {
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y);
    const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 20;
    if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
      if (numTries < 30) spawnInvincibilityPickup(numTries + 1);
    } else {
      if (!apples.existsAt(x, y)) apples.add(x, y);
      es.pickupsMap[getCoordIndex2(x, y)] = {
        timeTillDeath: PICKUP_LIFETIME_MS,
        type: PickupType.Invincibility,
      };
      state.timeSinceSpawnedPickup = 0;
    }
  }

  function maybeSpawnPrey() {
    const preyType = preySpawn.dropsByFrame?.[stats.applesEatenThisLevel];
    if (!preyType) {
      return;
    }
    spawnPrey(preyType, 0);
  }
  const spawnPrey = (preyType: PreyType, numTries: number) => {
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y);
    const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 20;
    if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
      if (numTries < 30) spawnPrey(preyType, numTries + 1);
    } else {
      coroutines.start(spawnPreyRoutine(preyType, getCoordIndex2(x, y)));
    }
  }
  function* spawnPreyRoutine(preyType: PreyType, coord: number): IEnumerator {
    yield* coroutines.waitForTime(lerp(PREY_SPAWN_WAIT_TIME_MIN, PREY_SPAWN_WAIT_TIME_MAX, Math.random()));
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    preyList.add(x, y, preyType);
  }

  function addAppleReplayMode() {
    drawState.shouldDrawApples = true;
    const appleToSpawn = replay.applesToSpawn.shift();
    if (appleToSpawn) {
      apples.add(appleToSpawn[0], appleToSpawn[1]);
    } else {
      // likely ran out of apples to spawn due to changes to level settings since time of clip recording, e.g. applesToClear; just open the doors as a quickfix
      openDoors();
    }
  }

  function addSnakeSegment() {
    drawState.shouldDrawApples = true;
    segments.addVec(segments.get(segments.length - 1));
  }

  function cacheGraphicalComponents() {
    graphicalComponents.barrier.push();
    graphicalComponents.barrier.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.barrier);
    renderer.drawSquareCustom(graphicalComponents.barrier, 0, 0, es.level.colors.barrier, es.level.colors.barrierStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 0, 0, 'light', es.level.colors.barrierBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 0, 0, 'dark', es.level.colors.barrierBorderDark, true);
    renderer.drawXCustom(graphicalComponents.barrier, 0, 0, es.level.colors.barrierStroke);
    graphicalComponents.barrier.pop();

    graphicalComponents.barrierPassable.push();
    graphicalComponents.barrierPassable.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.barrierPassable);
    renderer.drawSquareCustom(graphicalComponents.barrierPassable, 0, 0, es.level.colors.passableStroke, es.level.colors.passableStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 0, 0, 'light', es.level.colors.passableBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 0, 0, 'dark', es.level.colors.passableBorderDark, true);
    graphicalComponents.barrierPassable.pop();

    graphicalComponents.door.push();
    graphicalComponents.door.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.door);
    renderer.drawSquareCustom(graphicalComponents.door, 0, 0, es.level.colors.door, es.level.colors.doorStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 0, 0, 'light', es.level.colors.doorStroke, false);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 0, 0, 'dark', es.level.colors.doorStroke, false);
    graphicalComponents.door.pop();

    graphicalComponents.snakeHead.push();
    graphicalComponents.snakeHead.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.snakeHead);
    if (state.gameMode === GameMode.Cobra) {
      renderer.drawSquareCustom(graphicalComponents.snakeHead, 0, 0, PALETTE.cobra.playerHead, PALETTE.cobra.playerHead, drawPlayerOptions);
    } else {
      renderer.drawSquareCustom(graphicalComponents.snakeHead, 0, 0, es.level.colors.playerHead, es.level.colors.playerHead, drawPlayerOptions);
    }
    graphicalComponents.snakeHead.pop();

    graphicalComponents.snakeSegment.push();
    graphicalComponents.snakeSegment.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.snakeSegment);
    if (state.gameMode === GameMode.Cobra) {
      renderer.drawSquareCustom(graphicalComponents.snakeSegment, 0, 0, PALETTE.cobra.playerTail, PALETTE.cobra.playerTailStroke, drawPlayerOptions);
    } else {
      renderer.drawSquareCustom(graphicalComponents.snakeSegment, 0, 0, es.level.colors.playerTail, es.level.colors.playerTailStroke, drawPlayerOptions);
    }
    graphicalComponents.snakeSegment.pop();

    graphicalComponents.deco1.push();
    graphicalComponents.deco1.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.deco1);
    renderer.drawSquareCustom(graphicalComponents.deco1, 0, 0, es.level.colors.deco1, es.level.colors.deco1Stroke, drawBasicOptionsNoShake);
    graphicalComponents.deco1.pop();

    graphicalComponents.deco2.push();
    graphicalComponents.deco2.translate(STROKE_SIZE / 2, STROKE_SIZE / 2);
    renderer.clearGraphicalComponent(graphicalComponents.deco2);
    renderer.drawSquareCustom(graphicalComponents.deco2, 0, 0, es.level.colors.deco2, es.level.colors.deco2Stroke, drawBasicOptionsNoShake);
    graphicalComponents.deco2.pop();
  }

  function clearBackground() {
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    renderer.invalidateStaticCache();
    drawBackground();
  }

  function drawBackground() {
    const backgroundColor = state.isInvertedColors && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : es.level.colors.background;
    renderer.drawBackground(backgroundColor, gfxBG, gfxFG);
    gfxExitLights.clear(0, 0, 0, 0);
    gfxLighting.clear(0, 0, 0, 0);
    gfxPresentation.clear(0, 0, 0, 0);
    gfxUIRight.clear(0, 0, 0, 0);
    if (drawState.shouldDrawApples) {
      gfxApples.clear(0, 0, 0, 0);
    }
    if (drawState.shouldDrawKeysLocks) {
      gfxKeysLocks.clear(0, 0, 0, 0);
    }
    if (drawState.shouldDrawActionFG) {
      gfxFGAction.clear(0, 0, 0, 0);
    }
  }

  function drawPlayerHead(vec: Vector) {
    if (state.isInvertedColors) {
      renderer.drawSquareStatic(gfxFG, vec.x, vec.y,
        PALETTE.deathInvert.playerHead,
        PALETTE.deathInvert.playerHead,
        drawPlayerOptionsDeath);
    } else if (!state.isExitingLevel && state.timeSinceInvincibleStart < es.difficulty.invincibilityTime) {
      renderer.drawSquare(vec.x, vec.y, PALETTE.cobra.playerHead, PALETTE.cobra.playerHead, drawPlayerOptions);
    } else if (state.isLost) {
      renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.snakeHead, vec.x, vec.y, 0.5, -1);
    } else {
      renderer.drawGraphicalComponent1x1Custom(renderer.getMainGfx(), graphicalComponents.snakeHead, vec.x, vec.y);
    }
    const dir: DIR = (!state.isLost && es.moves.length > 0) ? (es.moves[0] as DIR) : player.direction;
    if (state.isLost) {
      spriteRenderer.drawImage3x3Static(gfxFG, Image.SnekHeadDead, vec.x, vec.y, getRotationFromDirection(dir), 1, -1);
      if (replay.mode !== ReplayMode.Playback) {
        // draw wearables
        p5.push();
        let rotation = getRotationFromDirection(dir);
        let wx = vec.x;
        if (dir === DIR.LEFT) {
          rotation = 0;
          p5.scale(-1, 1);
          wx = -wx - 1;
        }
        if (outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx, vec.y, outfit.exclusive - 1, rotation);
        }
        if (outfit.hair && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx, vec.y, outfit.hair - 1, rotation);
        }
        p5.pop();
        // show hat, eyewear as scattered across map
        if (outfit.eyes && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx - 1, vec.y - 1, outfit.eyes - 1, 0);
        }
        if (outfit.hat && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfxFGAction, Image.WearablesSheet, wx + 2, vec.y + 1, outfit.hat - 1, getRotationFromDirection(DIR.DOWN));
        }
      }
    } else {
      const gfx = state.isInvertedColors ? gfxFG : renderer.getMainGfx();
      const screenshakeMul = state.isInvertedColors ? -1 : 1;
      spriteRenderer.drawImage3x3Custom(gfx, Image.SnekHead, vec.x, vec.y, getRotationFromDirection(dir), 1, screenshakeMul);
      if (replay.mode !== ReplayMode.Playback) {
        gfx.push();
        let rotation = getRotationFromDirection(dir);
        let wx = vec.x;
        if (dir === DIR.LEFT) {
          rotation = 0;
          gfx.scale(-1, 1);
          wx = -wx - 1;
        }
        if (outfit.hair && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, vec.y, outfit.hair - 1, rotation);
        }
        if (outfit.eyes && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, vec.y, outfit.eyes - 1, rotation);
        }
        if (outfit.back && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, vec.y, outfit.back - 1, rotation);
        }
        if (heldItems.armor > 0) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, vec.y, WearableFrame.Crusher - 1, rotation);
        }
        if (outfit.hat && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, vec.y, outfit.hat - 1, rotation);
        }
        if (outfit.exclusive) {
          spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, wx, vec.y, outfit.exclusive - 1, rotation);
        }
        gfx.pop();
      }
    }
  }

  function drawPlayerSegment(vec: Vector | undefined, i = 0) {
    if (!vec) return;
    const isMiddle = i < segments.length - 1;
    const dirPrev = i === 0
      ? getDirectionBetween(segments.get(i), player.position)
      : getDirectionBetween(segments.get(i), segments.get(i - 1));
    const dirNext = getDirectionBetween(segments.get(i), segments.get(i + 1));
    const cornerNE = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.UP)
    );
    const cornerSE = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.DOWN)
    );
    const cornerSW = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.DOWN)
    );
    const cornerNW = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.UP)
    );
    const stunned = state.timeSinceHurt < HURT_STUN_TIME;
    const acquiringArmor = state.timeSinceArmorPickup < 100;
    const armorUsed = state.timeSinceArmorProtection < HURT_STUN_TIME;
    const invincible = !state.isExitingLevel && state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    if (stunned) {
      // draw stunned
      if (Math.floor(state.timeSinceHurt / HURT_FLASH_RATE) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", drawPlayerOptions);
      } else {
        renderer.drawSquare(vec.x, vec.y, "#fff", "#fff", drawPlayerOptions);
      }
    } else if (invincible) {
      // draw invincible
      const timeLeft = es.difficulty.invincibilityTime - state.timeSinceInvincibleStart;
      if (timeLeft < INVINCIBILITY_EXPIRE_WARN_MS && Math.floor(timeLeft / INVINCIBILITY_EXPIRE_FLASH_MS) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", drawPlayerOptions);
      } else {
        const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
        const color = gradients.calc(invincibleColorGradient, ((i + cycle) % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
        renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptions);
      }
    } else if (state.isRewinding || armorUsed || acquiringArmor) {
      // draw rewinding
      const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(reversibleColorGradient, ((i + cycle) % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptions);
      drawSegmentArmor(vec, i, dirPrev);
    } else if (state.isInvertedColors) {
      renderer.drawSquareStatic(gfxFG, vec.x, vec.y,
        PALETTE.deathInvert.playerTail,
        PALETTE.deathInvert.playerTailStroke,
        drawPlayerOptionsDeath);
      const backgroundColor = state.isInvertedColors && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : es.level.colors.background;
      if (cornerNE) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'NE', drawPlayerOptionsDeath.screenshakeMul);
      } else if (cornerSE) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'SE', drawPlayerOptionsDeath.screenshakeMul);
      } else if (cornerSW) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'SW', drawPlayerOptionsDeath.screenshakeMul);
      } else if (cornerNW) {
        renderer.eraseCorner(gfxFG, backgroundColor, vec.x, vec.y, 'NW', drawPlayerOptionsDeath.screenshakeMul);
      }
    } else {
      const gfx = renderer.getMainGfx();
      // draw normal segment
      if (cornerNE) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentNE, vec.x, vec.y, 0, 1, 0);
      } else if (cornerSE) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentSE, vec.x, vec.y, 0, 1, 0);
      } else if (cornerSW) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentSW, vec.x, vec.y, 0, 1, 0);
      } else if (cornerNW) {
        spriteRenderer.drawImage3x3Custom(gfx, Image.ThemedSegmentNW, vec.x, vec.y, 0, 1, 0);
      } else {
        renderer.drawGraphicalComponent1x1Custom(gfx, graphicalComponents.snakeSegment, vec.x, vec.y);
      }
      // draw decorative segment overlay
      const decoInterval = 9;
      if (i === 0 && state.gameMode === GameMode.Cobra) {
        const direction = invertDirection(player.directionToFirstSegment);
        spriteRenderer.drawImage3x3(Image.SnekSegmentB, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i === 1) {
        const direction = getDirectionBetween(segments.get(0), segments.get(1));
        spriteRenderer.drawImage3x3(Image.SnekSegmentE, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i >= decoInterval && (i+2) % decoInterval === 0 && segments.length >= i+4) {
        const direction = getDirectionBetween(segments.get(i + 1), segments.get(i));
        spriteRenderer.drawImage3x3(Image.SnekSegmentE, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i >= decoInterval && (i+2) % decoInterval === 1 && segments.length >= i+3) {
        const direction = getDirectionBetween(segments.get(i), segments.get(i + 1));
        spriteRenderer.drawImage3x3(Image.SnekSegmentDark, vec.x, vec.y, getRotationFromDirection(direction));
      } else if (i >= decoInterval && (i+2) % decoInterval === 2 && segments.length >= i+2) {
        const direction = getDirectionBetween(segments.get(i), segments.get(i + 1));
        spriteRenderer.drawImage3x3(Image.SnekSegmentE, vec.x, vec.y, getRotationFromDirection(direction));
      }
      drawSegmentArmor(vec, i, dirPrev);
    }
    if (state.acquireProgression > 0) {
      const color = p5.lerpColor(p5.color('#ffffff00'), p5.color('#ffffffff'), state.acquireProgression);
      renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptionsAcquire);
    }
  }

  function drawSegmentArmor(vec: Vector, i = 0, dirPrev: DIR) {
    const numArmoredSegments = 2 * (heldItems.armor - 1) + 1;
    const gfx = renderer.getMainGfx();
    if (heldItems.armor === 1 && replay.mode !== ReplayMode.Playback && i === 1) {
      spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, vec.x, vec.y, WearableFrame.CrusherSeg2 - 1, (getRotationFromDirection(invertDirection(dirPrev))));
    } else if (heldItems.armor > 0 && replay.mode !== ReplayMode.Playback && i > 0 && i < numArmoredSegments) {
      if (i % 2 === 1) {
        spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, vec.x, vec.y, WearableFrame.CrusherSeg1 - 1, (getRotationFromDirection(invertDirection(dirPrev))));
      } else {
        spriteRenderer.drawSprite3x3(gfx, Image.WearablesSheet, vec.x, vec.y, WearableFrame.CrusherSeg2 - 1, (getRotationFromDirection(invertDirection(dirPrev))));
      }
    }
  }

  function erasePlayerSegmentCorner(vec: Vector | undefined, i = 0) {
    if (!vec) return;
    const stunned = state.timeSinceHurt < HURT_STUN_TIME;
    const acquiringArmor = state.timeSinceArmorPickup < ARMOR_PICKUP_FREEZE_MS;
    const armorUsed = state.timeSinceArmorProtection < HURT_STUN_TIME;
    const invincible = !state.isExitingLevel && state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const acquiringOther = state.acquireProgression > 0;
    if (!stunned &&
      !armorUsed &&
      !acquiringArmor &&
      !invincible &&
      !state.isRewinding &&
      !state.isInvertedColors &&
      !acquiringOther
    ) {
      return;
    }
    const isMiddle = i < segments.length - 1;
    const dirPrev = i === 0
      ? getDirectionBetween(segments.get(i), player.position)
      : getDirectionBetween(segments.get(i), segments.get(i - 1));
    const dirNext = getDirectionBetween(segments.get(i), segments.get(i + 1));
    const cornerNE = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.UP)
    );
    const cornerSE = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.RIGHT) ||
      (dirPrev === DIR.RIGHT && dirNext === DIR.DOWN)
    );
    const cornerSW = isMiddle && (
      (dirPrev === DIR.DOWN && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.DOWN)
    );
    const cornerNW = isMiddle && (
      (dirPrev === DIR.UP && dirNext === DIR.LEFT) ||
      (dirPrev === DIR.LEFT && dirNext === DIR.UP)
    );
    const gfx = renderer.getMainGfx();
    const backgroundColor = state.isInvertedColors && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : es.level.colors.background;
    if (cornerNE) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'NE', 1);
    } else if (cornerSE) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'SE', 1);
    } else if (cornerSW) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'SW', 1);
    } else if (cornerNW) {
      renderer.eraseCorner(gfx, backgroundColor, vec.x, vec.y, 'NW', 1);
    }
  }

  function drawApple(x: number, y: number) {
    const isInvincibility = es.pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Invincibility;
    const isReversibility = es.pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Armor;
    if (state.isInvertedColors && replay.mode !== ReplayMode.Playback && isInvincibility) {
      renderer.drawSquare(x, y,
        PALETTE.deathInvert.apple,
        PALETTE.deathInvert.appleStroke,
        drawAppleOptions);
    } else if (isInvincibility) {
      const timeLeft = es.pickupsMap[getCoordIndex2(x, y)]?.timeTillDeath || 0;
      if (shouldBlinkExpiringPickup(timeLeft)) {
        return;
      }
      const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(invincibleColorGradient, (cycle % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(x, y, color.toString(), color.toString(), drawInvincibilityPickupOptions);
      if (timeLeft <= PICKUP_LIFETIME_MS) {
        spriteRenderer.drawImage3x3(Image.PickupArrows, x, y);
      }
    } else if (isReversibility) {
      const timeLeft = es.pickupsMap[getCoordIndex2(x, y)]?.timeTillDeath || 0;
      if (shouldBlinkExpiringPickup(timeLeft)) {
        return;
      }
      const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(reversibleColorGradient, (cycle % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(x, y, color.toString(), color.toString(), drawReversibilityPickupOptions);
      if (timeLeft <= PICKUP_LIFETIME_MS) {
        spriteRenderer.drawImage3x3(Image.PickupArrows, x, y);
      }
    } else if (drawState.shouldDrawApples) {
      const specialPickupType = es.pickupsMap[getCoordIndex2(x, y)]?.type;
      if (specialPickupType) {
        spriteRenderer.drawSprite3x3(gfxApples, Image.PickupsSheet, x, y, PICKUP_SPRITE_FRAME_MAP[specialPickupType] - 1);
      } else {
        spriteRenderer.drawImage3x3Custom(gfxApples, Image.ThemedApple, x, y, 0, 1, 0);
      }
    }
  }

  function drawMines() {
    if (drawState.shouldDrawApples) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (mines.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = mines.getElapsedByCoord(coord);
          if (shouldBlinkExpiringPickup(mines.getTimeRemaining(x, y))) {
            continue;
          }
          spriteRenderer.drawSpritesheetAnim3x3(gfxApples, Image.MineSheet, x, y, elapsed);
        }
      }
    }
  }

  function drawPrey() {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (preyList.existsAtCoord(coord)) {
          let x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          if (shouldBlinkExpiringPickup(preyList.getTimeRemaining(x, y))) {
            continue;
          }
          const flipx = preyList.getFlipX(x, y);
          const elapsed = preyList.getElapsed(x, y);
          const preyType = preyList.getTypeByCoord(coord);
          gfxFGAction.push();
          if (flipx) {
            gfxFGAction.scale(-1, 1);
            x = -x - 1;
          }
          switch (preyType) {
            case PreyType.Grub:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyGrubSheet, x, y, elapsed);
              break;
            case PreyType.FieldMouse:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyMouseSheet, x, y, elapsed);
              break;
            case PreyType.Ant:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyAntSheet, x, y, elapsed);
              break;
            case PreyType.Grasshopper:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.PreyGrasshopperSheet, x, y, elapsed);
              break;
          }
          gfxFGAction.pop();
        }
      }
    }
  }

  function drawFireTiles() {
    if (drawState.shouldDrawActionFG && !state.isInvertedColors) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (fireTiles.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = fireTiles.getElapsedByCoord(coord);
          spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.FireSheet, x, y, elapsed);
        }
      }
    }
  }

  function drawExplosions() {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (explosions.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = explosions.getElapsedByCoord(coord);
          spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.ExplosionSheet, x, y, elapsed);
        }
      }
    }
  }

  function drawShields() {
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (shieldSpawns.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = shieldSpawns.getElapsedByCoord(coord);
          spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, Image.ShieldSpawn, x, y, elapsed);
        } else if (shields.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = shields.getElapsedByCoord(coord);
          if (shouldBlinkExpiringPickup(shields.getTimeRemaining(x, y))) {
            continue;
          }
          spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, Image.Shield, x, y, elapsed);
        }
      }
    }
  }

  function drawExitLights() {
    if (state.appMode !== AppMode.Game) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isDoorsOpen && (es.level.type || 0) === LevelType.Level) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    if (state.isGameWon) return;

    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        if (x !== 0 && y !== 0 && x !== GRIDCOUNT_X - 1 && y !== GRIDCOUNT_Y - 1) continue;
        const coord = getCoordIndex2(x, y);
        if (es.barriersMap[coord] && !es.passablesMap[coord]) continue;
        if (es.portalsMap[coord]) continue;
        if (es.nospawnsMap[coord] && !es.locksMap[coord]) continue;
        const lightIndex = (i: number) => {
          return Math.round(lerp(0, 4, triangle((i + 6) / 4)))
        }
        const secondaryLightAlpha = 0.3;
        if (x === 0) {
          renderer.drawExitLight(gfxExitLights, x + 1, y, DIR.RIGHT, lightIndex(y), 1);
          renderer.drawExitLight(gfxExitLights, x + 2, y, DIR.RIGHT, lightIndex(y), secondaryLightAlpha);
        }
        if (x === GRIDCOUNT_X - 1) {
          renderer.drawExitLight(gfxExitLights, x - 1, y, DIR.LEFT, lightIndex(y), 1);
          renderer.drawExitLight(gfxExitLights, x - 2, y, DIR.LEFT, lightIndex(y), secondaryLightAlpha);
        }
        if (y === 0) {
          renderer.drawExitLight(gfxExitLights, x, y + 1, DIR.DOWN, lightIndex(x), 1);
          renderer.drawExitLight(gfxExitLights, x, y + 2, DIR.DOWN, lightIndex(x), secondaryLightAlpha);
        }
        if (y === GRIDCOUNT_Y - 1) {
          renderer.drawExitLight(gfxExitLights, x, y - 1, DIR.UP, lightIndex(x), 1);
          renderer.drawExitLight(gfxExitLights, x, y - 2, DIR.UP, lightIndex(x), secondaryLightAlpha);
        }
      }
    }
  }

  function drawBarriers() {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < es.barriers.length; i++) {
        if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
        const x = es.barriers[i].vec.x;
        const y = es.barriers[i].vec.y;
        switch (es.barriers[i].type) {
          case BarrierType.FireTile:
            // handled by drawFireTiles()
            break;
          case BarrierType.Skull:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 0);
            break;
          case BarrierType.SkullThemed:
            spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedBarrierSkull, x, y, 0, 1, 0);
            break;
          case BarrierType.Indent:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 2);
            break;
          case BarrierType.IndentThemed:
            spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedBarrierIndent, x, y, 0, 1, 0);
            break;
          case BarrierType.Flat:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 4);
            break;
          case BarrierType.FlatThemed:
            spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedBarrierFlat, x, y, 0, 1, 0);
            break;
          case BarrierType.Pyramid:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 6);
            break;
          case BarrierType.PyramidThemed:
            spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedBarrierPyramid, x, y, 0, 1, 0);
            break;
          case BarrierType.ExitSign:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 11);
            break;
          case BarrierType.Radar:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 12);
            break;
          case BarrierType.ComputerChip:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 13);
            break;
          case BarrierType.MetalPlate:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 14);
            break;
          case BarrierType.Panel0:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 15);
            break;
          case BarrierType.Panel1:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 16);
            break;
          case BarrierType.Panel2:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 17);
            break;
          case BarrierType.Panel3:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 18);
            break;
          case BarrierType.Panel4:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 19);
            break;
          case BarrierType.Panel5:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 20);
            break;
          case BarrierType.Brick:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 21);
            break;
          case BarrierType.BrickWhite:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 22);
            break;
          case BarrierType.BrickThemed:
            spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedBarrierBrick, x, y, 0, 1, 0);
            break;
          case BarrierType.Stone:
            spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, x, y, 24);
            break;
          case BarrierType.StoneThemed:
            spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedBarrierStone, x, y, 0, 1, 0);
            break;
          default:
          case BarrierType.Unset:
          case BarrierType.Default:
            renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.barrier, x, y, 1, 0);
            break;
        }
      }
      return;
    }

    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptionsNoShake);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorderStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, 'light', PALETTE.deathInvert.barrierStroke, false, 0);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorderStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, 'dark', PALETTE.deathInvert.barrierStroke, false, 0);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (state.isDoorsOpen && es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawXStatic(gfxFG, es.barriers[i].vec.x, es.barriers[i].vec.y, PALETTE.deathInvert.barrierStroke, 5, 0);
    }
  }

  function drawPassableBarriers() {
    if (!state.isDoorsOpen) return;
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < es.barriers.length; i++) {
        if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
        renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.barrierPassable, es.barriers[i].vec.x, es.barriers[i].vec.y, 1, 0);
        // draw passable glass overlay
        if (!es.keysMap[getCoordIndex(es.barriers[i].vec)]) {
          spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, es.barriers[i].vec.x, es.barriers[i].vec.y, 10);
        }
      }
      return;
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquare(es.barriers[i].vec.x, es.barriers[i].vec.y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptions);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorder(es.barriers[i].vec.x, es.barriers[i].vec.y, 'light', PALETTE.deathInvert.barrierStroke, true);
    }
    for (let i = 0; i < es.barriers.length; i++) {
      if (!es.passablesMap[getCoordIndex(es.barriers[i].vec)]) continue;
      renderer.drawSquareBorder(es.barriers[i].vec.x, es.barriers[i].vec.y, 'dark', PALETTE.deathInvert.barrierStroke, true);
    }
  }

  function drawDoors() {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < es.doors.length; i++) {
        const x = es.doors[i].x;
        const y = es.doors[i].y;
        const isThemedDoor = isAtMapEdge(x, y, 1);
        const isNonDoorLevel = false
          || es.level === START_LEVEL
          || es.level === START_LEVEL_COBRA
          || es.level === WARP_ZONE_01
          || es.level === WARP_ZONE_02
          || es.level === WARP_ZONE_03;
        if (isThemedDoor && !isNonDoorLevel) {
          spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedDoor, x, y, 0, 1, 0);
        } else if (!isNonDoorLevel) {
          spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedDoorAlt, x, y, 0, 1, 0);
        } else {
          renderer.drawGraphicalComponent1x1Static(gfxFG, graphicalComponents.door, x, y, 1, 0);
        }
      }
      // door open effect
      if (state.isDoorsOpen && drawState.shouldDrawActionFG) {
        const lifetime = ANIMATIONS[Image.DoorOpenSheet].frames * ANIMATIONS[Image.DoorOpenSheet].timePerFrame
        for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
          if (doorsOpening.existsAtCoord(coord)) {
            const x = Math.floor(coord % GRIDCOUNT_X);
            const y = Math.floor(coord / GRIDCOUNT_X);
            const elapsed = doorsOpening.getElapsedByCoord(coord);
            if (elapsed < lifetime) {
              spriteRenderer.drawSpritesheetAnim1x1(gfxFGAction, Image.DoorOpenSheet, x, y, elapsed);
            }
          }
        }
      }
      return;
    }
    for (let i = 0; i < es.doors.length; i++) {
      renderer.drawSquare(es.doors[i].x, es.doors[i].y, PALETTE.deathInvert.door, PALETTE.deathInvert.doorStroke, drawBasicOptions);
    }
    for (let i = 0; i < es.doors.length; i++) {
      renderer.drawSquareBorder(es.doors[i].x, es.doors[i].y, 'light', PALETTE.deathInvert.doorStroke);
    }
    for (let i = 0; i < es.doors.length; i++) {
      renderer.drawSquareBorder(es.doors[i].x, es.doors[i].y, 'dark', PALETTE.deathInvert.doorStroke);
    }
  }

  function drawKey(key: Key) {
    if (!state.isDoorsOpen && es.passablesMap[getCoordIndex(key.position)]) return;
    if (!drawState.shouldDrawKeysLocks && !state.isInvertedColors) return;
    if (state.isInvertedColors) {
      spriteRenderer.drawImage3x3(Image.KeyGrey, key.position.x, key.position.y);
    } else if (key.channel === KeyChannel.Yellow) {
      spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.KeyYellow, key.position.x, key.position.y, 0, 1, 0);
    } else if (key.channel === KeyChannel.Red) {
      spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.KeyRed, key.position.x, key.position.y, 0, 1, 0);
    } else if (key.channel === KeyChannel.Blue) {
      spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.KeyBlue, key.position.x, key.position.y, 0, 1, 0);
    }
  }

  function drawLock(lock: Lock) {
    if (!drawState.shouldDrawKeysLocks && !state.isInvertedColors) return;
    if (state.isInvertedColors) {
      spriteRenderer.drawImage3x3(Image.LockGrey, lock.position.x, lock.position.y);
    } else if (lock.channel === KeyChannel.Yellow) {
      spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.LockYellow, lock.position.x, lock.position.y, 0, 1, 0);
    } else if (lock.channel === KeyChannel.Red) {
      spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.LockRed, lock.position.x, lock.position.y, 0, 1, 0);
    } else if (lock.channel === KeyChannel.Blue) {
      spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.LockBlue, lock.position.x, lock.position.y, 0, 1, 0);
    }
  }

  function drawDecorative1(vec: Vector) {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponent1x1Static(gfxBG, graphicalComponents.deco1, vec.x, vec.y, 1, 0);
      // renderer.drawSquareStatic(gfxBG, vec.x, vec.y, es.level.colors.deco1, es.level.colors.deco1Stroke, drawBasicOptionsNoShake);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco1, PALETTE.deathInvert.deco1Stroke, drawBasicOptions);
    }
  }

  function drawDecorative2(vec: Vector) {
    if (!state.isInvertedColors || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponent1x1Static(gfxBG, graphicalComponents.deco2, vec.x, vec.y, 1, 0);
      // renderer.drawSquareStatic(gfxBG, vec.x, vec.y, es.level.colors.deco2, es.level.colors.deco2Stroke, drawBasicOptionsNoShake);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco2, PALETTE.deathInvert.deco2Stroke, drawBasicOptions);
    }
  }

  function drawParticlesTest(coord: number) {
    if (es.barriersMap[coord] && !es.passablesMap[coord]) return false;
    if (es.doorsMap[coord]) return false;
    if (es.portalsMap[coord]) return false;
    if (es.locksMap[coord]) return false;
    if (segments.containsCoord(coord)) return false;
    return true;
  }

  function drawParticles(zIndexPass = 0) {
    if (state.isInvertedColors) return;
    if (zIndexPass < 10) {
      emitters.tick(p5.deltaTime);
      particles.tick(p5.deltaTime, drawParticlesTest);
    } else if (zIndexPass < 20) {
      emitters10.tick(p5.deltaTime);
      particles10.tick(p5.deltaTime);
    }
  }

  function drawPointsText() {
    if (state.timeSinceArmorPickup < ARMOR_PICKUP_FREEZE_MS) return;
    if (drawState.shouldDrawActionFG) {
      for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
        if (pointsAnim.existsAtCoord(coord)) {
          const x = Math.floor(coord % GRIDCOUNT_X);
          const y = Math.floor(coord / GRIDCOUNT_X);
          const elapsed = pointsAnim.getElapsedByCoord(coord);
          const rarity = toRarity(pointsAnim.getType(x, y))
          switch (rarity) {
            case PickupRarity.Common:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points500, x, y, elapsed);
              break;
            case PickupRarity.Rare:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points1000, x, y, elapsed);
              break;
            case PickupRarity.Epic:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points2000, x, y, elapsed);
              break;
            case PickupRarity.Legendary:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points5000, x, y, elapsed);
              break;
            case PickupRarity.Galactic:
              spriteRenderer.drawSpritesheetAnim3x3(gfxFGAction, Image.Points10000, x, y, elapsed);
              break;
            default:
              break;
          }
        }
      }
    }
  }

  function drawPortals() {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < es.portals[i as PortalChannel].length; j++) {
        const portalPosition = es.portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = es.portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        renderer.drawPortal(portal, state.isInvertedColors && replay.mode !== ReplayMode.Playback, drawPortalOptions, gfxBG);
        // if (drawState.shouldDrawKeysLocks) {
        //   spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.ThemedPortalColumns, portalPosition.x, portalPosition.y, 0, 1, 0);
        // }
      }
    }
  }

  function startPortalParticles() {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < es.portals[i as PortalChannel].length; j++) {
        const portalPosition = es.portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = es.portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        portalParticleSystem.emit(portal.position.x, portal.position.y, portal.channel);
      }
    }
  }

  function startExitParticles() {
    if (state.appMode !== AppMode.Game) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isDoorsOpen && (es.level.type || 0) === LevelType.Level) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    if (state.isGameWon) return;

    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        if (x !== 0 && y !== 0 && x !== GRIDCOUNT_X - 1 && y !== GRIDCOUNT_Y - 1) continue;
        const coord = getCoordIndex2(x, y);
        // if (es.barriersMap[coord] && !es.passablesMap[coord]) continue;
        if (es.barriersMap[coord]) continue;
        if (es.portalsMap[coord]) continue;
        if (es.nospawnsMap[coord] && !es.locksMap[coord] && !es.doorsMap[coord]) continue;
        exitLightParticleSystem.emit(x, y, 0);
      }
    }
  }

  function triggerGameOver() {
    if (replay.mode === ReplayMode.Playback) {
      showGameOver();
    } else {
      startAction(triggerGameOverRoutine(), Action.GameOver);
    }
  }

  function* triggerGameOverRoutine(): IEnumerator {
    // give player a chance to recover a death blow
    state.isLost = true;
    state.timeSinceHurt = 0;
    yield null;
    yield* actions.waitForTime(HURT_FORGIVENESS_TIME * 2);
    yield null;
    showGameOver();
    clearAction(Action.GameOver);
  }

  function showGameOver() {
    state.isLost = true;
    state.timeSinceHurt = Infinity;
    if (replay.mode !== ReplayMode.Playback) {
      // musicPlayer.stop(es.level.musicTrack);
      state.lives = 0;
      stats.numDeaths += 1;
      stopAction(Action.FadeMusic);
      musicPlayer.setVolume(0);
      musicPlayer.halfSpeed(es.level.musicTrack);
    }
    switch (state.lastHurtBy) {
      case HitType.HitBarrier:
      case HitType.HitDoor:
      case HitType.HitLock:
      case HitType.HitSelf:
        reboundSnake(1);    
        break;
    }
    coroutines.start(showGameOverRoutine());
    maybeSaveReplayStateToFile();
  }

  function* showGameOverRoutine(): IEnumerator {
    if (state.gameMode !== GameMode.Cobra) {
      stats.score = parseInt(String(stats.score * 0.5), 10);
    }
    startScreenShake(1, 0, 0.4);
    yield* coroutines.waitForTime(200);
    startScreenShake(3, -HURT_STUN_TIME / SCREEN_SHAKE_DURATION_MS, 0.1);
    state.isInvertedColors = true;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawActionFG = true;
    drawState.shouldDrawKeysLocks = true;
    if (replay.mode !== ReplayMode.Playback) {
      UI.showDeathColors();
    }
    renderer.invalidateStaticCache();
    // UI.renderHearts(0, true);
    yield* coroutines.waitForTime(HURT_STUN_TIME * 2.5);
    state.isInvertedColors = false;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawActionFG = true;
    drawState.shouldDrawKeysLocks = true;
    UI.hideDeathColors();
    renderer.invalidateStaticCache();
    // UI.renderHearts(0, false);
    startScreenShake(1, 0.4);
    if (replay.mode === ReplayMode.Playback) {
      yield* coroutines.waitForTime(1000);
      proceedToNextReplayClip();
    } else if (state.gameMode === GameMode.Cobra) {
      startAction(fadeMusic(0.3, 1000), Action.FadeMusic);
      clearUI();
      UI.clearLabels();
      // winGameScene.trigger();
      // UI.enableScreenScroll();
      onGameOverCobra();
    } else {
      startAction(fadeMusic(0.3, 1000), Action.FadeMusic);
      renderScoreUI(stats.score);
      // UI.enableScreenScroll();
      // showGameOverUI(getNextLoseMessage(), uiElements, state, { confirmShowMainMenu, initLevel });
      // uiBindings.onGameOver();
      // stats.numLevelsCleared = 0;
      onGameOver();
    }
  }

  function maybeSaveReplayStateToFile() {
    if (replay.mode !== ReplayMode.Capture) return;
    try {
      function download(content: string, fileName: string, contentType = 'text/plain') {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
      }
      const trueIndex = findLevelWarpIndex(LEVELS[state.levelIndex % LEVELS.length]);
      if (trueIndex < 0) throw new Error('replay capture failed: findLevelWarpIndex returned -1');
      const fileName = `snek-data-${trueIndex}-${replay.levelName}-${replay.timeCaptureStarted}.json`;
      download(JSON.stringify(replay), fileName, 'application/json');
      console.log(`saved file "${fileName}"`);
    } catch (err) {
      console.error(err);
    }
  }

  function* fadeMusic(toVolume: number, durationMs: number): IEnumerator {
    yield null;
    const startVolume = musicPlayer.getVolume();
    let t = 0;
    while (durationMs > 0 && t < 1) {
      musicPlayer.setVolume(p5.lerp(startVolume, toVolume, Easing.inOutCubic(clamp(t, 0, 1))));
      t += p5.deltaTime / durationMs;
      yield null;
    }
    musicPlayer.setVolume(toVolume);
    clearAction(Action.FadeMusic);
  }

  function* changeMusicLowpass(toFreq: number, duration: number, start?: number): IEnumerator {
    yield null;
    const startFreq = start ?? musicPlayer.getLowpassFrequency();
    let t = 0;
    while (duration > 0 && t < 1) {
      musicPlayer.setLowpassFrequency(p5.lerp(startFreq, toFreq, Easing.inCubic(clamp(t, 0, 1))));
      t += p5.deltaTime / duration;
      yield null;
    }
    musicPlayer.setLowpassFrequency(toFreq);
    clearAction(Action.ChangeMusicLowpass);
  }

  function getIsStartLevel() {
    return es.level === START_LEVEL || es.level == START_LEVEL_COBRA;
  }

  return {
    initEngine,
    setLevel,
    setDifficulty,
    getLevel,
    getDifficulty,
    getMaybeTitleScene,
    resetStats,
    resetLevel,
    resetGraphics,
    renderLoop: withErrorReporting(renderLoop),
    startMoving,
    requestPlayerRewind,
    startScreenShake,
    startLogicLoop,
    stopLogicLoop,
    getIsStartLevel,
    clearBackground,
    changeMusicLowpass,
    playSound,
    fadeMusic,
    maybeSaveReplayStateToFile,
    onKeyPressed,
    onChangePlayerDirection,
  };
}
