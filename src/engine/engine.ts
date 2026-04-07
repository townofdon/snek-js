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
  DIFFICULTY_EASY,
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
  HURT_GRACE_TIME,
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
  TIME_WAIT_BEFORE_REWIND,
  TIME_REWIND_TAKEOVER_CONTROLS,
  KEYCODE_ALPHA_A,
  KEYCODE_ALPHA_D,
  KEYCODE_F10,
  IS_DEV,
} from "../constants";
import {
  Action,
  AppMode,
  Barrier,
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
  Pickup,
  ItemDropType,
  PlayerState,
  Portal,
  PortalChannel,
  RecentMoveTimings,
  RecentMoves,
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
} from "../types";
import {
  checkHasPortalAtLocation,
  clamp,
  dirToUnitVector,
  getBestPortalExitDirection,
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
  rotateSystemAfterPortalTraverse,
  shouldBlinkExpiringPickup,
  toRarity,
  triangle,
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
import { PortalVortexParticleSystem2 } from './particleSystems/PortalVortexParticleSystem2';
import { GateUnlockParticleSystem2 } from './particleSystems/GateUnlockParticleSystem2';
import { buildLevel } from '../levels/levelBuilder';
import {
  CAMPAIGN_LEVELS,
  CHALLENGE_LEVELS,
  LEVELS,
  MAIN_TITLE_SCREEN_LEVEL,
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
import { UI } from '../ui/ui';
import { buildSceneActionFactory } from '../scenes/sceneUtils';
import { TitleScene } from '../scenes/TitleScene';
import { buildMapLayout, decodeMapData } from '../editor/utils/editorUtils';
import { resumeAudioContext } from './audio';
import { LEVEL_01_HARD } from '../levels/campaign/level01hard';
import { LEVEL_01_ULTRA } from '../levels/campaign/level01ultra';
import { SaveDataStore } from '../stores/SaveDataStore';
import { AStar } from '../astar/astar';
import { PreyList } from '../collections/preyList';
import { TUTORIAL_LEVEL_10 } from '@/levels/campaign/tutorialLevel10';
import { downloadFile, getCanvasImage, overlayOntoCanvas } from '@/editor/utils/publishUtils';

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
  let level: Level = MAIN_TITLE_SCREEN_LEVEL;
  let difficulty: Difficulty = { ...DIFFICULTY_EASY };
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
  const drawPlayerOptionsDeath: DrawSquareOptions = { is3d: true, optimize: true, screenshakeMul: -1 };
  const drawAppleOptions: DrawSquareOptions = { size: 0.8, is3d: true, optimize: true, screenshakeMul: 0 };
  const drawInvincibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };
  const drawReversibilityPickupOptions: DrawSquareOptions = { size: 0.5, is3d: true, optimize: true };
  const drawBasicOptions: DrawSquareOptions = { optimize: true };
  const drawBasicOptionsNoShake: DrawSquareOptions = { optimize: true, screenshakeMul: 0 };
  const drawPortalOptions: DrawSquareOptions = {};

  let moves: DIR[] = []; // moves that the player has queued up
  let recentMoves: RecentMoves = [null, null, null, null]; // most recent moves that the snake has performed
  let recentInputs: RecentMoves = [null, null, null, null]; // most recent inputs that the player has performed
  let recentInputTimes: RecentMoveTimings = [Infinity, Infinity, Infinity, Infinity]; // timing of the most recent inputs that the player has performed
  let barriers: Barrier[] = []; // permanent structures that damage the snake
  let doors: Vector[] = []; // like barriers, except that they disappear once the player has "cleared" a level (player must still exit the level though)
  let decoratives1: Vector[] = []; // bg decorative elements
  let decoratives2: Vector[] = []; // bg decorative elements
  let keys: Key[] = []; // unlock locks
  let locks: Lock[] = []; // unlockable barriers
  let passablesMap: Record<number, boolean> = {}; // map of barriers that become passable when doors open
  let barriersMap: Record<number, BarrierType> = {}; // map of barriers (obstacles or walls that the snake can hit)
  let doorsMap: Record<number, boolean> = {}; // map of doors - blocks that disappear once conditions are met
  let pickupsMap: Record<number, Pickup | null> = {}; // map of pickup items, powerups, etc.
  let nospawnsMap: Record<number, boolean> = {}; // no-spawns are designated spots on the map where an apple cannot spawn
  let keysMap: Record<number, Key | null> = {};
  let locksMap: Record<number, Lock | null> = {};
  let diffSelectMap: Record<number, number> = {};

  const onLifetimeExpire = (coord: number) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
    explosions.add(x, y, frames * timePerFrame, frames, timePerFrame);
    state.lastHurtBy = HitType.HitMine;
    playSound(Sound.xpound);
    drawState.shouldDrawActionFG = true;
  };
  const segments = new VectorList(); // snake segments
  const apples = new AppleList(); // food that the snake can eat to grow and score points
  const mines = new AnimationList({ onLifetimeExpire });
  const doorsOpening = new AnimationList();
  const fireTiles = new AnimationList();
  const explosions = new AnimationList();
  const pointsAnim = new AnimationList();
  const lightMap = createLightmap();

  let portals: Record<PortalChannel, Vector[]> = { ...DEFAULT_PORTALS() };
  let portalsMap: Record<number, Portal> = {};

  const preySpawn: PreySpawn = {
    dropsByFrame: undefined
  } satisfies PreySpawn;
  const astar = new AStar({ allowDiagonals: true, allowClosest: true, randomizeWeights: true, mines, segments });
  const preyList = new PreyList({ astar, onLifetimeExpire });

  // hack P5's "offscreen canvas" to layer multiple canvases for MAX PERF - see: https://p5js.org/reference/#/p5/createGraphics
  const gfxBG: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  const gfxExitLights: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  const gfxKeysLocks: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  const gfxApples: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  const gfxFG: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  const gfxFGAction: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  const gfxLighting: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  gfxBG.addClass('static-gfx-canvas').addClass('bg').parent('game').addClass('gfx-bg').id('canvas-bg');
  gfxExitLights.addClass('static-gfx-canvas').addClass('fg0').parent('game').addClass('gfx-exit-lights');
  gfxKeysLocks.addClass('static-gfx-canvas').addClass('fg1').parent('game').addClass('gfx-keys-locks').id('canvas-keys-locks');
  gfxApples.addClass('static-gfx-canvas').addClass('fg1').parent('game').addClass('gfx-apples').id('canvas-apples');
  gfxFG.addClass('static-gfx-canvas').addClass('fg2').parent('game').addClass('gfx-fg').id('canvas-fg');
  gfxFGAction.addClass('static-gfx-canvas').addClass('fg3').parent('game').addClass('gfx-fg-action').id('canvas-action');
  gfxLighting.addClass('static-gfx-canvas').addClass('fg4').parent('game').addClass('gfx-lighting').id('canvas-lighting');
  const graphicalComponents: GraphicalComponents = {
    deco1: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    deco2: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    barrier: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    barrierPassable: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    door: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    // @ts-ignore
    apple: null,
    snakeHead: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
    // note - unused for main engine
    snakeSegment: p5.createGraphics(BLOCK_SIZE.x * 3, BLOCK_SIZE.y * 3),
  };
  // set pixel density for a perf boost. see - https://p5js.org/reference/p5/pixelDensity/
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
  ].forEach(gfx => gfx.pixelDensity(1));
  const gradients = new Gradients(p5);
  const particles = new Particles(p5, gradients, screenShake); // z-index 0
  const particles10 = new Particles(p5, gradients, screenShake); // z-index 10
  const emitters = new Emitters(p5, particles);
  const emitters10 = new Emitters(p5, particles10);
  const appleParticleSystem = new AppleParticleSystem2(p5, emitters, gradients);
  const impactParticleSystem = new ImpactParticleSystem2(p5, emitters10, gradients);
  const portalParticleSystem = new PortalParticleSystem2(p5, emitters10, gradients);
  const portalVortexParticleSystem = new PortalVortexParticleSystem2(p5, emitters, gradients);
  const gateUnlockParticleSystem = new GateUnlockParticleSystem2(p5, emitters, gradients);
  const exitLightParticleSystem = new PortalParticleSystem2(p5, emitters, gradients);

  const reversibleColorGradient = gradients.addMultiple(SNAKE_REWIND_COLORS.map(c => p5.color(c)), NUM_SNAKE_INVINCIBLE_COLORS);
  const invincibleColorGradient = gradients.addMultiple(SNAKE_INVINCIBLE_COLORS.map(c => p5.color(c)), NUM_SNAKE_INVINCIBLE_COLORS);

  const renderer = new Renderer({ p5, fonts, replay, gameState: state, screenShake, spriteRenderer, tutorial });
  spriteRenderer.setScreenShake(screenShake);

  function setLevel(incoming: Level) {
    level = incoming;
    if (level === LEVEL_01 && replay.mode !== ReplayMode.Playback) {
      if (difficulty.index === 3) {
        level = LEVEL_01_HARD;
      } else if (difficulty.index === 4) {
        level = LEVEL_01_ULTRA;
      }
    }
  }

  function setDifficulty(incoming: Difficulty) {
    difficulty = { ...incoming }
  }

  function getLevel() {
    return level;
  }

  function getDifficulty() {
    return difficulty;
  }

  function renderDifficultyUI() {
    if (level === START_LEVEL) return;
    if (level === START_LEVEL_COBRA) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderDifficulty(difficulty.index, state.isShowingDeathColours, state.gameMode === GameMode.Casual, state.gameMode === GameMode.Cobra);
  }

  function renderHeartsUI() {
    if (level === START_LEVEL) return;
    if (level === START_LEVEL_COBRA) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.gameMode === GameMode.Casual) return;
    UI.renderHearts(state.lives, state.isShowingDeathColours);
  }

  function renderScoreUI(score = stats.score) {
    if (level === START_LEVEL) return;
    if (level === START_LEVEL_COBRA) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.gameMode === GameMode.Casual) return;
    UI.renderScore(score, state.isShowingDeathColours);
  }

  function renderLevelName() {
    if (level === START_LEVEL) return;
    if (level === START_LEVEL_COBRA) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    const progress = getLevelProgress(stats, level, difficulty);
    UI.renderLevelName(level.name, state.isShowingDeathColours, progress);
  }

  function getMaybeTitleScene() {
      const annotation = (() => {
        if (!level.id) return '';
        if (state.isRandomizer) {
          const levelNum = (20 - getNumRandomLevelsRemaining()) || 20;
          return `${levelNum} / 20`;
        }
        {
          const levelIndex = CAMPAIGN_LEVELS.indexOf(level);
          if (levelIndex >= 0) return `${levelIndex + 1} / ${CAMPAIGN_LEVELS.length}`;
        }
        {
          const levelIndex = CHALLENGE_LEVELS.indexOf(level);
          if (levelIndex >= 0) return `${levelIndex + 1} / ${CHALLENGE_LEVELS.length}`;
        }
        if (level.author) return `by ${level.author}`;
        return ''
      })()
      const buildSceneAction = buildSceneActionFactory(p5, gfxPresentation, sfx, fonts, state);
      return level.showTitle
        ? buildSceneAction((p5, gfx, sfx, fonts, callbacks) => new TitleScene(level.name, annotation, p5, gfx, sfx, fonts, callbacks))
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

    // init state for new level
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
    state.isShowingDeathColours = false;
    state.actualTimeElapsed = 0;
    state.timeElapsed = 0;
    state.timeSinceLastMove = Infinity;
    state.timeSinceLastTeleport = Infinity;
    state.timeSinceHurt = Infinity;
    state.timeSinceHurtForgiveness = Infinity;
    state.timeSinceInvincibleStart = Infinity;
    state.timeSinceReversibleStart = Infinity;
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
    state.frameCount = 0;
    state.numTeleports = 0;
    state.lastHurtBy = HitType.Unknown;
    state.hasKeyYellow = false;
    state.hasKeyRed = false;
    state.hasKeyBlue = false;
    moves = [];
    recentMoves = [null, null, null, null];
    recentInputs = [null, null, null, null];
    recentInputTimes = [Infinity, Infinity, Infinity, Infinity];
    barriers = [];
    doors = [];
    decoratives1 = [];
    decoratives2 = [];
    keys = [];
    passablesMap = {};
    barriersMap = {};
    doorsMap = {};
    pickupsMap = {};
    nospawnsMap = {};
    portals = { ...DEFAULT_PORTALS() };
    portalsMap = {};
    keysMap = {};
    apples.reset();
    mines.reset();
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

    if (level.layoutV2?.length) {
      try {
        // // NOTE TO FUTURE SELF: do NOT copy data directly from the URL. This is the path of pain and misery.
        // // Instead, use "Copy dev link" in snek editor, or use this snippet below:
        // const query = new URLSearchParams(`?data=${level.layoutV2}`);
        // const queryData = query.get('data');
        // const [data] = decodeMapData(queryData);
        const [data, options] = decodeMapData(level.layoutV2);
        level.colors = getExtendedPalette(options.palette);
        level.layout = buildMapLayout(data);
        level.snakeSpawnPointOverride = getCoordIndex(data.playerSpawnPosition);
        // may decide to remove these overwrites later
        level.disableAppleSpawn = options.disableAppleSpawn;
        if (options.disableAppleSpawn) {
          level.applesModOverride ??= 1;
          level.growthOverride = level.growthOverride ?? 2;
        }
        level.numApplesStart = options.numApplesStart;
        level.applesToClear = options.applesToClear;
        level.timeToClear = options.timeToClear;
        level.snakeStartSizeOverride = options.snakeStartSize;
        level.extraHurtGraceTime = options.extraHurtGraceTime;
        level.globalLight = options.globalLight;
        if (!level.musicTrack || level.musicTrack === MusicTrack.None) {
          level.musicTrack = options.musicTrack;
        }
        level.snakeStartDirectionOverride = data.startDirection;
      } catch (err) {
        console.error(err);
        console.error(`Unable to parse layoutV2 data for level "${level.name}"`);
      }
    }

    renderer.reset();
    renderer.invalidateStaticCache();
    spriteRenderer.setThemedAppleImage(level.colors);
    spriteRenderer.setThemedBorderImages(level.colors);
    spriteRenderer.setThemedDoorImage(level.colors);
    if (state.gameMode === GameMode.Cobra) {
      spriteRenderer.setThemedSegmentImage(PALETTE.cobra.playerTail, PALETTE.cobra.playerTailStroke);
    } else {
      spriteRenderer.setThemedSegmentImage(level.colors.playerTail, level.colors.playerTailStroke);
    }
    cacheGraphicalComponents();
    appleParticleSystem.setColorsFromLevel(level);
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
      musicPlayer.load(level.musicTrack);
      musicPlayer.setVolume(1);
      transition()
        .catch(err => { console.error(err); })
        .finally(() => {
          if (level.isWinGame) {
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
            musicPlayer.play(level.musicTrack);
          })
          startLogicLoop();
        })
    } else {
      if (replay.mode !== ReplayMode.Playback && (state.isGameStarted || state.isGameStarting)) {
        if (DISABLE_TRANSITIONS) {
          musicPlayer.stopAllTracks();
        }
        musicPlayer.play(level.musicTrack);
      }
      startLogicLoop();
      renderDifficultyUI();
      renderHeartsUI();
      renderScoreUI();
      renderLevelName();
      UI.showGfxCanvas();
    }

    const levelData = buildLevel(level);
    player.position = levelData.playerSpawnPosition;
    player.direction = level.snakeStartDirectionOverride ?? DIR.RIGHT;
    player.directionToFirstSegment = invertDirection(player.direction);
    player.directionLastHit = invertDirection(player.direction);
    barriers = levelData.barriers;
    barriersMap = levelData.barriersMap;
    passablesMap = levelData.passablesMap;
    doors = levelData.doors;
    doorsMap = levelData.doorsMap;
    decoratives1 = levelData.decoratives1;
    decoratives2 = levelData.decoratives2;
    nospawnsMap = levelData.nospawnsMap;
    portals = levelData.portals;
    portalsMap = levelData.portalsMap;
    keys = levelData.keys;
    keysMap = levelData.keysMap;
    locks = levelData.locks;
    locksMap = levelData.locksMap;
    diffSelectMap = levelData.diffSelectMap;

    // set level metadata
    level.numLocks = locks.length;

    // create snake parts
    let x = player.position.x;
    let y = player.position.y;
    for (let i = 0; i < (level.snakeStartSizeOverride || START_SNAKE_SIZE); i++) {
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
    barriers.filter(barrier => barrier.type === BarrierType.FireTile).forEach(barrier => {
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
      pickupsMap[getCoordIndex2(x, y)] = {
        timeTillDeath: 99999999, // improbably high lifetime = never despawn
        type: PickupType.Invincibility,
      };
    }

    // add initial apples
    for (let i = 0; i < levelData.apples.length; i++) {
      apples.add(levelData.apples[i].x, levelData.apples[i].y);
    }
    const numApplesStart = level.numApplesStart ?? NUM_APPLES_START;
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
    barriers.forEach(barrier => {
      astar.setWall(barrier.vec.x, barrier.vec.y);
    });
    astar.setSnekCoord(getCoordIndex(player.position));
    doors.forEach(door => {
      astar.setWall(door.x, door.y);
    });

    resetLightmap(lightMap, level.globalLight ?? GLOBAL_LIGHT_DEFAULT);
    startPortalParticles();
    if (level.type === LevelType.WarpZone || (level.type === LevelType.Maze && level !== START_LEVEL && level !== START_LEVEL_COBRA)) {
      startExitParticles();
    }
  }

  function startLogicLoop() {
    if (loopState.interval) clearInterval(loopState.interval);
    loopState.interval = setInterval(logicLoop, 1);
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
    for (let i = 0; i < segments.length; i++) {
      if (state.isLost || state.isExitingLevel) continue;
      const coord = getCoordIndex(segments.get(i));
      const appleFound = apples.existsAtCoord(coord) ? coord : -1;
      if (appleFound != undefined && appleFound >= 0) {
        spawnAppleParticles(segments.get(i));
        incrementScore();
        growSnake(appleFound);
        drawState.shouldDrawApples = true;
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
      if (pickupsMap[coord]?.type === PickupType.Invincibility) {
        incrementPickupBonus(PickupType.Invincibility, coord);
        startInvincibility();
      } else if (pickupsMap[coord]?.type === PickupType.Reversibility) {
        incrementPickupBonus(PickupType.Reversibility, coord);
        state.isRewindEnabled = true;
        state.timeSinceReversibleStart = 0;
        playSound(Sound.hurtSave);
        startRewinding();
      } else if (pickupsMap[coord]) {
        incrementPickupBonus(pickupsMap[coord]?.type, coord);
      }
      pickupsMap[coord] = null;
      drawState.shouldDrawApples = true;
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
    }

    // tick time for prey
    if (!state.isShowingDeathColours) {
      astar.setSnekCoord(getCoordIndex(player.position));
      if (preyList.tick(loopState.deltaTime)) {
        drawState.shouldDrawActionFG = true;
      }
    }

    // tick time for all pickups
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        const i = getCoordIndex2(x, y);
        if (pickupsMap[i]) {
          pickupsMap[i].timeTillDeath -= loopState.deltaTime;
          if (pickupsMap[i].timeTillDeath <= 0) {
            pickupsMap[i] = null;
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
    }
    state.isLost = state.isLost || didHit;
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
    state.timeSinceReversibleStart += loopState.deltaTime;
    state.timeSinceSpawnedPickup += loopState.deltaTime;
    state.timeSinceLastInput += loopState.deltaTime;
    state.timeSinceLastTeleport += loopState.deltaTime;
    state.frameCount += 1;
    for (let i = recentInputTimes.length - 1; i >= 0; i--) {
      recentInputTimes[i] += loopState.deltaTime;
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
    // force player to use u-turn mechanic on "turnaround" level
    const { keyCode, LEFT_ARROW, ENTER, RIGHT_ARROW } = p5;
    if (level?.id === TUTORIAL_LEVEL_10.id && player.direction === DIR.RIGHT && !recentInputs[1]
      && keyCode !== LEFT_ARROW && keyCode !== RIGHT_ARROW && keyCode !== KEYCODE_ALPHA_A && keyCode !== KEYCODE_ALPHA_D && keyCode !== ENTER) {
      return;
    }
    if (!IS_DEV && p5.keyCode === KEYCODE_F10) {
      saveMapImage();
      return;
    }
    handleKeyPressed(
      p5,
      state,
      clickState,
      player.direction,
      player.directionToFirstSegment,
      moves,
      recentMoves,
      recentInputs,
      recentInputTimes,
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
    const dest = document.getElementById("canvas-bg") as HTMLCanvasElement;
    const sourceDimensions = [2400,2400] as const;
    const destinationDimensions = [1200, 1200] as const;
    // await overlayOntoCanvas(mainCanvas, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(fg, dest, ...sourceDimensions, ...destinationDimensions);
    // await overlayOntoCanvas(apples, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(action, dest, ...sourceDimensions, ...destinationDimensions);
    const img = await getCanvasImage(dest, `map-${Date.now()}.png`);
    downloadFile(img, `map-${findLevelWarpIndex(level)}-${level.name}.png`, 'img/png');
    renderer.invalidateStaticCache();
  }

  function renderLoop(gamepadInputHandled = false) {
    const timeFrameStart = performance.now();

    if (!gamepadInputHandled) {
      const isInvincible = state.timeSinceInvincibleStart < difficulty.invincibilityTime;
      const isRewindAllowed = isInvincible || state.gameMode === GameMode.Casual || level === START_LEVEL || level === START_LEVEL_COBRA;
      const handled = applyGamepadMove(state, player.direction, player.directionToFirstSegment, isRewindAllowed, moves, inputCallbacks, handleInputAction)
      if (handled) {
        state.inputType = InputType.Gamepad;
      }
    }

    actions.tick();

    if (state.isPaused) return;
    if (state.appMode === AppMode.StartScreen) return;

    setTimeout(() => { coroutines.tick(); }, 0);

    if (state.appMode === AppMode.Quote) {
      p5.background("#000");
      return;
    }

    updateScreenShake();
    drawBackground();

    for (let i = 0; i < decoratives1.length; i++) {
      drawDecorative1(decoratives1[i]);
    }

    for (let i = 0; i < decoratives2.length; i++) {
      drawDecorative2(decoratives2[i]);
    }

    drawExitLights();
    drawParticles(0);
    drawPointsText();
    drawBarriers();
    drawDoors();

    for (let i = 0; i < keys.length; i++) {
      drawKey(keys[i])
    }

    for (let i = 0; i < locks.length; i++) {
      drawLock(locks[i])
    }

    drawPortals();

    for (let i = 0; i < GRIDCOUNT_X * GRIDCOUNT_Y; i++) {
      if (apples.existsAtCoord(i)) {
        const x = Math.floor(i % GRIDCOUNT_X);
        const y = Math.floor(i / GRIDCOUNT_X);
        drawApple(x, y);
      }
    }

    drawMines();
    drawPrey();
    drawFireTiles();
    drawExplosions();

    renderer.drawPlayerMoveArrows(p5, player.position, moves.length > 0 ? moves[0] : player.direction);

    p5.push();
    for (let i = 0; i < segments.length; i++) {
      drawPlayerSegment(segments.get(i), i);
    }
    for (let i = 0; i < segments.length; i++) {
      erasePlayerSegmentCorner(segments.get(i), i);
    }
    p5.pop();

    const globalLight = level.globalLight ?? GLOBAL_LIGHT_DEFAULT;

    drawPlayerHead(player.position);
    drawPassableBarriers();
    drawParticles(10);
    renderer.drawCaptureMode();
    renderer.setStaticCacheFlags();

    drawState.shouldDrawApples = false;
    drawState.shouldDrawActionFG = false;
    drawState.shouldDrawKeysLocks = false;

    if (pointsAnim.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (doorsOpening.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (!state.isShowingDeathColours && mines.tick(p5.deltaTime)) {
      drawState.shouldDrawApples = true;
    }
    if (fireTiles.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (explosions.tick(p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }

    if (
      state.isGameStarted &&
      replay.mode !== ReplayMode.Playback &&
      globalLight < 1 &&
      !state.isShowingDeathColours &&
      state.timeSinceInvincibleStart >= difficulty.invincibilityTime
    ) {
      updateLighting(lightMap, globalLight, player.position, portals, apples, pickupsMap, explosions, fireTiles);
      drawLighting(lightMap, renderer, gfxLighting);
    }

    if (level.renderInstructions) {
      level.renderInstructions(gfxPresentation, renderer, state, level.colors);
    }
    renderer.drawUIKeys(gfxPresentation);
    renderer.drawTutorialMoveControls(gfxPresentation);
    renderer.drawTutorialRewindControls(gfxPresentation, player.position, canRewind);
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
    moves.push(currentMove);
    for (let i = recentMoves.length - 1; i >= 0; i--) {
      if (i > 0) {
        recentMoves[i] = recentMoves[i - 1];
      } else {
        recentMoves[i] = currentMove;
      }
    }
  }

  function onResetMoves() {
    moves = [];
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
  }

  function startMoving() {
    if (state.isMoving) return;
    if (state.timeSinceReversibleStart < TIME_REWIND_TAKEOVER_CONTROLS) return;
    state.isMoving = true;
    state.isRewinding = false;
    state.isRewindEnabled = false;
    state.currentSpeed = 1;
    tutorial.needsMoveControls = false;
    stopRewinding();
    if (state.timeSinceHurt >= HURT_STUN_TIME) {
      playSound(Sound.moveStart);
    }
  }

  function startRewinding() {
    if (state.isRewinding) return;
    if (!canRewind()) return;
    state.isRewinding = true;
    state.isMoving = false;
    state.currentSpeed = 1;
    state.timeSinceGraceStarted = 0;
    tutorial.needsRewindControls = false;
    sfx.playLoop(Sound.rewindLoop);
  }

  function stopRewinding() {
    state.isRewinding = false;
    state.isRewindEnabled = false;
    sfx.stop(Sound.rewindLoop);
  }

  function calculateSnakeSize(): number {
    let size = 0;
    const uniquePositions: Record<number, boolean> = {};
    for (let i = 0; i < segments.length; i++) {
      if (!segments.get(i)) continue;
      if (!uniquePositions[getCoordIndex(segments.get(i))]) { size++; }
      uniquePositions[getCoordIndex(segments.get(i))] = true;
    }
    return size + 1;
  }

  function canRewind(): boolean {
    if (
      !state.isRewindEnabled
      && state.gameMode !== GameMode.Casual
      && state.timeSinceInvincibleStart >= difficulty.invincibilityTime
      && level !== START_LEVEL
      && level !== START_LEVEL_COBRA
    ) return false;
    if (state.isLost) return false;
    if (state.isGameWon) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (calculateSnakeSize() <= START_SNAKE_SIZE + 1) return false;
    return true;
  }

  function startInvincibility() {
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    startAction(startInvincibilityRoutine(), Action.Invincibility);
    state.lives = Math.min(state.lives + 1, MAX_LIVES);
    renderHeartsUI();
  }

  function* startInvincibilityRoutine(): IEnumerator {
    sfx.stop(Sound.invincibleLoop);
    playSound(Sound.pickupInvincibility);
    musicPlayer.setPlaybackRate(level.musicTrack, 0);
    musicPlayer.setVolume(0);
    state.timeSinceInvincibleStart = 0;
    state.isShowingDeathColours = true;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    loopState.timeScale = 0;
    startScreenShake(2, 0, 0.8);
    renderer.invalidateStaticCache();
    yield* coroutines.waitForTime(INVINCIBILITY_PICKUP_FREEZE_MS);
    state.isShowingDeathColours = false;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    loopState.timeScale = 1;
    startScreenShake(0, 1);
    renderer.invalidateStaticCache();
    yield* coroutines.waitForTime(600);
    sfx.playLoop(Sound.invincibleLoop, 0.55 * settings.musicVolume);
    while (state.timeSinceInvincibleStart < difficulty.invincibilityTime) {
      yield null;
    }
    sfx.stop(Sound.invincibleLoop);
    musicPlayer.setPlaybackRate(level.musicTrack, 1);
    musicPlayer.setVolume(1);
    if (state.isRewinding) {
      stopRewinding();
    }
  }

  function getTimeNeededUntilNextMove() {
    if (state.isExitingLevel) {
      return 0;
    }
    if (state.isGameWon) {
      return SPEED_LIMIT_ULTRA_SPRINT;
    }
    if (state.timeSinceHurt < HURT_STUN_TIME) {
      return Infinity;
    }
    if (difficulty.index === 4 && state.isSprinting) {
      return difficulty.sprintLimit;
    }
    return lerp(difficulty.speedStart,
      state.isSprinting ? difficulty.sprintLimit : difficulty.speedLimit,
      state.currentSpeed / difficulty.speedSteps);
  }

  function updateCurrentMoveSpeed() {
    if (state.isSprinting) {
      const deltaSpeed = difficulty.speedSteps * (loopState.deltaTime / SPRINT_INCREMENT_SPEED_MS);
      state.currentSpeed += deltaSpeed;
      if (state.currentSpeed > difficulty.speedSteps) {
        state.currentSpeed = difficulty.speedSteps;
      }
      return;
    }
    if (state.currentSpeed === state.targetSpeed) {
      return;
    }
    if (state.currentSpeed < state.targetSpeed) {
      const t = Easing.inOutCubic(clamp((state.timeSinceHurt - HURT_STUN_TIME) * 0.5, 0, 1));
      const diff = Math.abs(state.targetSpeed - state.currentSpeed);
      const deltaSpeed = clamp(diff, 1, difficulty.speedSteps) * (loopState.deltaTime / SPEED_INCREMENT_SPEED_MS) * p5.lerp(0, 1, t);
      state.currentSpeed += deltaSpeed;
      if (state.currentSpeed > state.targetSpeed) state.currentSpeed = state.targetSpeed;
    } else if (state.currentSpeed > state.targetSpeed) {
      const deltaSpeed = difficulty.speedSteps * (loopState.deltaTime / SPRINT_INCREMENT_SPEED_MS);
      state.currentSpeed -= deltaSpeed;
      if (state.currentSpeed < state.targetSpeed) state.currentSpeed = state.targetSpeed;
    }
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
    const applesMod = level.applesModOverride || difficulty.applesMod || 1;
    if (state.isGameWon) return false;
    if (DEBUG_EASY_LEVEL_EXIT && stats.applesEatenThisLevel > 0) return true;
    if (stats.applesEatenThisLevel >= level.applesToClear * applesMod) return true;
    if (state.timeElapsed >= level.timeToClear && stats.applesEatenThisLevel >= level.applesToClear * applesMod * 0.5) return true;
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
      mines.removeByCoord(coord);
      const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
      explosions.add(vec.x, vec.y, frames * timePerFrame, frames, timePerFrame);
      state.lastHurtBy = HitType.HitMine;
      playSound(Sound.xpound);
      drawState.shouldDrawApples = true;
      drawState.shouldDrawActionFG = true;
      const isInvincible = state.timeSinceInvincibleStart < difficulty.invincibilityTime;
      return !isInvincible;
    }
    return false;
  }

  function checkHasHit(vec: Vector): boolean {
    if (state.isExitingLevel) return false;
    if (state.isExited) return false;
    if (state.isGameWon) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    const coord = getCoordIndex(vec);

    if (segments.containsCoord(coord) && state.timeSinceInvincibleStart >= difficulty.invincibilityTime) {
      state.lastHurtBy = HitType.HitSelf;
      return true;
    }

    if (level.disableWallCollision) return false;

    if (doorsMap[coord]) {
      state.lastHurtBy = HitType.HitDoor;
      return true;
    }

    const isPassableBarrier = state.isDoorsOpen && passablesMap[coord];
    if (!isPassableBarrier && barriersMap[coord]) {
      state.lastHurtBy = HitType.HitBarrier;
      return true;
    }

    if (locksMap[coord]) {
      if (locksMap[coord].channel === KeyChannel.Yellow && state.hasKeyYellow) return false;
      if (locksMap[coord].channel === KeyChannel.Red && state.hasKeyRed) return false;
      if (locksMap[coord].channel === KeyChannel.Blue && state.hasKeyBlue) return false;
      state.lastHurtBy = HitType.HitLock;
      return true;
    }

    return false;
  }

  function checkPlayerWillHit(dir: DIR, numMoves = 1): boolean {
    const pos = player.position.copy();
    const currentMove = dirToUnitVector(dir);
    for (let i = 0; i < numMoves; i++) {
      const futurePosition = pos.add(currentMove);
      const willHit = checkHasHit(futurePosition) || checkPortalTeleportWillHit(futurePosition, dir);
      if (willHit) return true;
    }
    return false;
  }

  function checkPortalTeleportWillHit(position: Vector, dir: DIR): boolean {
    if (state.isExitingLevel) return false;
    const portal = portalsMap[getCoordIndex(position)];
    if (!portal) return false;
    if (!portal.link) return false;
    const newDir = getBestPortalExitDirection({
      portalLink: portal.link,
      playerDirection: player.direction,
      portalExitMode: level.portalExitConfig?.[portal.channel] || portal.exitMode,
      checkHasHit,
      hasPortalAtLocation: (location) => checkHasPortalAtLocation(location, portalsMap),
    });
    return checkHasHit(portal.link.copy().add(dirToUnitVector(newDir)));
  }

  function handlePortalTravel() {
    if (state.isExitingLevel) return;
    const portal = portalsMap[getCoordIndex(player.position)];
    if (!portal) return;
    if (!portal.link) {
      console.warn(`portal has no link: channel=${portal.channel},(${portal.position.x},${portal.position.y})`);
      return;
    }
    playSound(Sound.warp);
    const newDir = getBestPortalExitDirection({
      portalLink: portal.link,
      playerDirection: player.direction,
      portalExitMode: level.portalExitConfig?.[portal.channel] || portal.exitMode,
      checkHasHit,
      hasPortalAtLocation: (location) => checkHasPortalAtLocation(location, portalsMap),
    });
    const prevDir = player.direction;
    player.direction = newDir;
    player.directionToFirstSegment = invertDirection(player.direction);
    state.timeSinceLastMove = 0;
    state.timeSinceLastTeleport = 0;
    player.position.set(portal.link);
    player.position.add(dirToUnitVector(player.direction));
    state.numTeleports++;
    if (state.numTeleports > 80) {
      // kill the snake to prevent a soft lock due to infinite loop
      state.lives = 0;
      state.isLost = true;
      state.lastHurtBy = HitType.QuantumEntanglement;
    }
    // apply system rotation to recentInputs and recentMoves so that special moves (u-turn, etc) still work
    if (prevDir !== newDir) {
      for (let i = 0; i < recentMoves.length; i++) {
        recentMoves[i] = rotateSystemAfterPortalTraverse(prevDir, newDir, recentMoves[i]);
      }
      for (let i = 0; i < recentInputs.length; i++) {
        recentInputs[i] = rotateSystemAfterPortalTraverse(prevDir, newDir, recentInputs[i]);
      }
    }
  }

  function handleKeyPickup() {
    // if player is on top of a key, pick it up!
    const index = getCoordIndex(player.position);
    const key = keysMap[index];
    if (!key) return;
    if (key.channel === KeyChannel.Yellow) {
      state.hasKeyYellow = true;
      keys = keys.filter(key => key.channel !== KeyChannel.Yellow);
    } else if (key.channel === KeyChannel.Red) {
      state.hasKeyRed = true;
      keys = keys.filter(key => key.channel !== KeyChannel.Red);
    } else if (key.channel === KeyChannel.Blue) {
      state.hasKeyBlue = true;
      keys = keys.filter(key => key.channel !== KeyChannel.Blue);
    }
    keysMap[index] = null;
    playSound(Sound.pickup, 0.35);
    drawState.shouldDrawKeysLocks = true;
    // renderer.invalidateStaticCache();
    // drawState.shouldDrawApples = true;
  }

  function handleUnlock() {
    if (!state.hasKeyYellow && !state.hasKeyRed && !state.hasKeyBlue) {
      return;
    }
    for (let i = 0; i < locks.length; i++) {
      if (state.hasKeyYellow && locks[i].channel === KeyChannel.Yellow && isWithinBlockDistance(locks[i].position, player.position, 1)) {
        unlockGate(locks[i]);
        return;
      }
      if (state.hasKeyRed && locks[i].channel === KeyChannel.Red && isWithinBlockDistance(locks[i].position, player.position, 1)) {
        unlockGate(locks[i]);
        return;
      }
      if (state.hasKeyBlue && locks[i].channel === KeyChannel.Blue && isWithinBlockDistance(locks[i].position, player.position, 1)) {
        unlockGate(locks[i]);
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
        if (!group[index] && locksMap[index] && locksMap[index].channel === lockTriggered.channel) {
          addTouchingLocksToGroup(locksMap[index]);
        }
      }
    }
    addTouchingLocksToGroup(lockTriggered);
    const coords = Object.keys(group).map(coordKey => parseInt(coordKey, 10));
    locks = locks.filter((lock) => {
      if (coords.includes(lock.coord)) {
        locksMap[lock.coord] = null;
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
    const difficultyIndex = diffSelectMap[index];
    if (difficultyIndex === undefined) return;
    difficulty = getDifficultyFromIndex(difficultyIndex);
  }

  function handleSetNextLevel() {
    const nextLevel = level.nextLevelMap?.[getCoordIndex(player.position)];
    if (!nextLevel) return;
    state.nextLevel = nextLevel;
  }

  function handleSnakeMovement(): boolean {
    if (!state.isMoving) return false;
    if (state.isRewinding) return false;
    if (replay.mode === ReplayMode.Playback) return false;

    let didMove = false;
    const timeNeededUntilNextMove = getTimeNeededUntilNextMove();
    if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      const normalizedSpeed = clamp(difficulty.speedLimit / (timeNeededUntilNextMove || 0.001), 0, 1);
      didMove = movePlayer(normalizedSpeed);
      if (didMove) player.directionToFirstSegment = invertDirection(player.direction);
    } else {
      state.timeSinceLastMove += loopState.deltaTime;
    }
    updateCurrentMoveSpeed();
    if (!state.isExitingLevel && !state.isExited && !state.isGameWon) {
      stats.totalGameTimeElapsed += loopState.deltaTime;
      stats.totalLevelTimeElapsed += loopState.deltaTime;
    }
    return didMove;
  }

  function movePlayer(normalizedSpeed = 0): boolean {
    if (!state.isMoving) return false;
    if (state.isExited) return false;
    if (state.isRewinding) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    state.timeSinceLastMove = 0;
    const isInvincible = state.timeSinceInvincibleStart < difficulty.invincibilityTime;
    const isRewindAllowed = isInvincible || state.gameMode === GameMode.Casual || level === START_LEVEL || level === START_LEVEL_COBRA;
    const prevDirection = player.direction;
    if (moves.length > 0 && !state.isExitingLevel) {
      const move = moves.shift();
      if (move && move !== player.directionToFirstSegment) player.direction = move;
    }
    const currentMove = dirToUnitVector(player.direction);
    const futurePosition = player.position.copy().add(currentMove);

    // disallow snake moving backwards into itself
    if (segments.length > 0 && futurePosition.equals(segments.get(0).x, segments.get(0).y)) {
      player.direction = player.direction === prevDirection ? getDirectionSnakeForward() : prevDirection;
      return false;
    }

    // determine if next move will be into something, allow for grace period before injuring snakey
    const willHitSomething = checkHasHit(futurePosition) || checkPortalTeleportWillHit(futurePosition, player.direction);
    const hurtGraceTime = Math.max(
      HURT_GRACE_TIME + (level.extraHurtGraceTime ?? 0) + (difficulty.index === 4 ? 12 : 0),
      isRewindAllowed ? TIME_WAIT_BEFORE_REWIND : 0,
    );
    if (willHitSomething && state.timeSinceGraceStarted <= hurtGraceTime) {
      state.timeSinceGraceStarted += loopState.deltaTime;
      return false;
    }
    if (willHitSomething && isRewindAllowed) {
      startRewinding();
      return false;
    }

    // apply movement
    moveSegments();
    player.position.add(currentMove);
    state.timeSinceGraceStarted = 0;

    // play step sfx
    const volume = p5.lerp(1, 0.5, normalizedSpeed);
    if (state.steps % 2 === 0) {
      playSound(Sound.step1, volume);
    } else {
      playSound(Sound.step2, volume);
    }
    state.steps += 1;
    return true;
  }

  function moveSegments() {
    for (let i = segments.length - 1; i >= 0; i--) {
      if (i === 0) {
        segments.setVec(i, player.position);
      } else {
        segments.setVec(i, segments.get(i - 1));
      }
    }
  }

  function handleSnakeRewind() {
    if (!state.isRewinding) return;
    if (state.isExited) return;
    if (replay.mode !== ReplayMode.Disabled) return;

    const timeNeededUntilNextMove = getTimeNeededUntilNextMove();
    if (!canRewind()) {
      stopRewinding();
    } else if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      state.timeSinceLastMove = 0;
      reboundSnake(1);
      player.direction = getDirectionSnakeForward();
      player.directionToFirstSegment = invertDirection(player.direction);
    } else {
      state.timeSinceLastMove += loopState.deltaTime;
    }
    updateCurrentMoveSpeed();
  }

  function handleSnakeMovementDuringReplay(didHit: boolean) {
    if (didHit) return;
    if (replay.mode !== ReplayMode.Playback) return;
    const position: [number, number] | undefined = replay.positions[state.frameCount];
    if (position != undefined) {
      moveSegments();
      player.position.set(position[0], position[1])
      player.direction = getDirectionSnakeForward();
      player.directionToFirstSegment = invertDirection(player.direction);
    }
    if (state.frameCount > replay.lastFrame) {
      proceedToNextReplayClip();
    }
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
    musicPlayer.setPlaybackRate(level.musicTrack, 1);
    exitLightParticleSystem.reset();
    if (replay.mode !== ReplayMode.Playback) {
      startAction(fadeMusic(0, 1000), Action.FadeMusic);
      if (isStartLevel) {
        playSound(Sound.doorOpenHuge);
      } else if (level === LEVEL_99 || level === VARIANT_LEVEL_99 || level.playWinSound) {
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
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;

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
    } else if (DISABLE_TRANSITIONS) {
      gotoNextLevel();
    } else if (getIsStartLevel()) {
      gotoNextLevel();
    } else if (level.type === LevelType.Maze) {
      gotoNextLevel();
    } else if (level.type === LevelType.WarpZone) {
      gotoNextLevel();
    } else {
      const levelToSave = level.recordProgressAsLevel || level;
      const isPerfect = apples.length === 0 && state.collisions === 0;
      const hasAllApples = apples.length === 0;
      const hasAllLocks = !!level.numLocks && locks.length === 0;
      const shouldRecordLevelCompletion = !DEBUG_EASY_LEVEL_EXIT &&
        state.gameMode !== GameMode.Casual &&
        !!levelToSave?.id;

      if (shouldRecordLevelCompletion) {
        onRecordLevelProgress(levelToSave.id, difficulty.index, isPerfect, stats.totalLevelTimeElapsed);
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
        levelMusicTrack: getIsStartLevel() ? undefined : level.musicTrack,
        parTime: level.parTime || DEFAULT_PAR_TIME,
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

  function handleTeleportOnGameWin() {
    if (!state.isGameWon) return;
    const WIN_SCREEN_TELEPORT_PADDING = 2;
    const WIN_SCREEN_TELEPORT_BOUNDS = {
      min: {
        x: 0 - WIN_SCREEN_TELEPORT_PADDING,
        y: 0 - WIN_SCREEN_TELEPORT_PADDING,
      },
      max: {
        x: GRIDCOUNT_X + WIN_SCREEN_TELEPORT_PADDING,
        y: GRIDCOUNT_Y + WIN_SCREEN_TELEPORT_PADDING,
      },
    }
    const bounds = WIN_SCREEN_TELEPORT_BOUNDS;
    if (player.position.x < bounds.min.x) {
      player.position.x = bounds.max.x;
    } else if (player.position.x > bounds.max.x) {
      player.position.x = bounds.min.x;
    } else if (player.position.y < bounds.min.y) {
      player.position.y = bounds.max.y;
    } else if (player.position.y > bounds.max.y) {
      player.position.y = bounds.min.y;
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
    if (moves.length <= 0) return;
    if (segments.length <= 0) return;
    if (state.lastHurtBy === HitType.HitMine) return;

    const isGameOver = state.isLost && state.lives === 0;
    const move = moves[0];
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
    moves.shift();
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
    if (difficulty.index === 4) {
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

    moves = [];
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

  function getDirectionSnakeForward() {
    return getDirectionBetween(player.position, segments.get(0));
  }

  function getDirectionSnakeBackward() {
    return invertDirection(getDirectionSnakeForward())
  }

  /**
   * Move snake back after it hits something
   */
  function reboundSnake(numTimes = 2) {
    for (let times = 0; times < numTimes; times++) {
      if (segments.length > 1) {
        player.position.set(segments.get(0));
      }
      for (let i = 0; i < segments.length - 1; i++) {
        segments.setVec(i, segments.get(i + 1));
      }
    }
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
      ((level.growthOverride ?? difficulty.index) - Math.floor(segments.length / 100)) * (level.growthMod ?? 1),
      1
    );
    const maxSize = level === LEVEL_WIN_GAME ? 0.25 : MAX_SNAKE_SIZE;
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
    const parTime = level.parTime || DEFAULT_PAR_TIME;
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
    return (LEVEL_BONUS * difficulty.bonusMod * cobraMod || LEVEL_BONUS) * getParTimeBonusMultiplier();
  }

  function getLivesLeftBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return LIVES_LEFT_BONUS * difficulty.bonusMod * cobraMod || LIVES_LEFT_BONUS;
  }

  function getAllApplesBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return ALL_APPLES_BONUS * difficulty.bonusMod * cobraMod || ALL_APPLES_BONUS;
  }

  function getAllLocksBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return ALL_LOCKS_BONUS * difficulty.bonusMod * cobraMod || ALL_LOCKS_BONUS;
  }

  function getPerfectBonus() {
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    return PERFECT_BONUS * difficulty.bonusMod * cobraMod || PERFECT_BONUS;
  }

  function incrementScore() {
    if (state.isGameWon) return;
    let bonus = 0;
    if (state.isDoorsOpen) {
      bonus = CLEAR_BONUS * difficulty.scoreMod;
    }
    const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
    const points = SCORE_INCREMENT * difficulty.scoreMod * cobraMod + bonus
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
    } else if (pickupType === PickupType.Reversibility) {
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
    if (level.appleSlowdownMod && !state.isSprinting) {
      state.currentSpeed = Math.min(difficulty.speedSteps * level.appleSlowdownMod, state.currentSpeed);
    }
  }

  function openDoors() {
    const { frames, timePerFrame } = ANIMATIONS[Image.DoorOpenSheet];
    doors.forEach(door => {
      astar.removeWall(door.x, door.y);
      const x = door.x;
      const y = door.y;
      doorsOpening.add(x, y, frames * timePerFrame, frames, timePerFrame);
    });
    state.isDoorsOpen = true;
    startExitParticles();
    doors = [];
    doorsMap = {};
    renderer.invalidateStaticCache();
    drawState.shouldDrawKeysLocks = true;
  }

  function spawnApple(numTries = 0) {
    drawState.shouldDrawApples = true;
    if (level.disableAppleSpawn) return;
    if (replay.mode === ReplayMode.Playback) {
      addAppleReplayMode();
      return;
    }
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = barriersMap[getCoordIndex2(x, y)]
      || doorsMap[getCoordIndex2(x, y)]
      || nospawnsMap[getCoordIndex2(x, y)]
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
    if (!spawned) { maybeSpawnOtherPickup(x, y); }
    maybeSpawnPrey();
  }

  function maybeSpawnMine() {
    if (level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (!level.pickupDropsByFrame && !level.pickupDrops?.[ItemDropType.Mine] && state.gameMode !== GameMode.Cobra) return false;

    const progress = getLevelProgress(stats, level, difficulty);
    const frameLikelihood = level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.Mine
      ? level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
      : undefined
    const shouldSpawnDefault = state.gameMode === GameMode.Cobra;
    const baseLikelihood = getDropLikelihood(
      level.pickupDrops?.[ItemDropType.Mine] ?? shouldSpawnDefault,
      DROP_LIKELIHOOD_MINE,
      difficulty.index
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
    if (level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (state.timeSinceSpawnedPickup < PICKUP_SPAWN_COOLDOWN) return false;
    if (!level.pickupDropsByFrame && !level.pickupDrops?.[ItemDropType.Invincibility]) return false;

    const type = level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type || ItemDropType.Invincibility;
    if (type !== ItemDropType.Invincibility) {
      return false;
    }
    const progress = getLevelProgress(stats, level, difficulty);
    const baseLikelihood = getDropLikelihood(
      level.pickupDrops?.[ItemDropType.Invincibility] ?? true,
      DROP_LIKELIHOOD_INVINCIBILITY,
      difficulty.index
    ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
    const likelihood = level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood || baseLikelihood;
    const r = Math.random() + likelihood;
    if (r < 1) {
      return false;
    }
    spawnInvincibilityPickup()
    return true;
  }

  function maybeSpawnOtherPickup(x: number, y: number): boolean {
    if (level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if(pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Invincibility) return false;

    const pool: PickupType[] = [
      PickupType.Cheese,
      PickupType.Carrot,
      PickupType.Potato,
      PickupType.Tomato,
      PickupType.Onion,
      PickupType.Cabbage,
      PickupType.Broccoli,
      PickupType.Mushroom,
      PickupType.BreadLoaf,
      PickupType.Cucumber,
      PickupType.Pretzel,
      PickupType.Taco,
      PickupType.Drumstick,
      PickupType.Burger,
      PickupType.PizzaSlice,
      PickupType.HotDog,
      PickupType.Egg,
      PickupType.Fries,
      PickupType.Candy,
      PickupType.ChocolateBar,
      PickupType.Popsicle,
      PickupType.Lollipop,
      PickupType.Muffin,
      PickupType.Croisant,
      PickupType.Baguette,
      PickupType.Cupcake,
      PickupType.Donut,
    ]
    const pickup = pool[Math.floor(Math.random() * pool.length)]
    pickupsMap[getCoordIndex2(x, y)] = {
      timeTillDeath: 999999999999,
      type: pickup,
    };

    return;

    // TODO: ADD MORE PICKUP TYPES THAT CAN SPAWN AT ALL TIMES
    // const basePickupTypes: PickupType[] = [
    //   // watermelon,
    //   // strawberry,
    //   // grapes,
    //   // kiwi,
    //   // health,
    //   // ...etc.
    // ];

    // create array of pickup items, e.g. [Watermelon, Kiwi, Orange, Grapes, ...]
    // get array of weights for the same items e.g. [0.1, 0.2, 0.05, 0.4, ...]
    // sort array
    // r0 = random number * totalWeights
    // iterate through items util floor(r0) === item's weight

    const progress = getLevelProgress(stats, level, difficulty);
    const baseLikelihood = getDropLikelihood(
      level.pickupDrops?.[ItemDropType.Mine] ?? false,
      DROP_LIKELIHOOD_MINE,
      difficulty.index
    ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
    const likelihood = baseLikelihood;
    const r = Math.random() + likelihood;
    if (r < 1) {
      return false;
    }
    // spawnPickup(pickupType, x, y);
    return true;
  }

  function spawnMine(numTries = 0) {
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = barriersMap[getCoordIndex2(x, y)]
      || doorsMap[getCoordIndex2(x, y)]
      || nospawnsMap[getCoordIndex2(x, y)]
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
    const spawnedInsideOfSomething = barriersMap[getCoordIndex2(x, y)]
      || doorsMap[getCoordIndex2(x, y)]
      || nospawnsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y);
    const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 20;
    if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
      if (numTries < 30) spawnInvincibilityPickup(numTries + 1);
    } else {
      if (!apples.existsAt(x, y)) apples.add(x, y);
      pickupsMap[getCoordIndex2(x, y)] = {
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
    const spawnedInsideOfSomething = barriersMap[getCoordIndex2(x, y)]
      || doorsMap[getCoordIndex2(x, y)]
      || nospawnsMap[getCoordIndex2(x, y)]
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
    renderer.clearGraphicalComponent(graphicalComponents.barrier);
    renderer.drawSquareCustom(graphicalComponents.barrier, 1, 1, level.colors.barrier, level.colors.barrierStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'light', level.colors.barrierBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'dark', level.colors.barrierBorderDark, true);
    renderer.drawXCustom(graphicalComponents.barrier, 1, 1, level.colors.barrierStroke);

    renderer.clearGraphicalComponent(graphicalComponents.barrierPassable);
    renderer.drawSquareCustom(graphicalComponents.barrierPassable, 1, 1, level.colors.passableStroke, level.colors.passableStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 1, 1, 'light', level.colors.passableBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 1, 1, 'dark', level.colors.passableBorderDark, true);

    renderer.clearGraphicalComponent(graphicalComponents.door);
    renderer.drawSquareCustom(graphicalComponents.door, 1, 1, level.colors.door, level.colors.doorStroke, drawBasicOptionsNoShake);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 1, 1, 'light', level.colors.doorStroke, false);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 1, 1, 'dark', level.colors.doorStroke, false);

    renderer.clearGraphicalComponent(graphicalComponents.snakeHead);
    if (state.gameMode === GameMode.Cobra) {
      renderer.drawSquareCustom(graphicalComponents.snakeHead, 1, 1, PALETTE.cobra.playerHead, PALETTE.cobra.playerHead, drawPlayerOptions);
    } else {
      renderer.drawSquareCustom(graphicalComponents.snakeHead, 1, 1, level.colors.playerHead, level.colors.playerHead, drawPlayerOptions);
    }

    renderer.clearGraphicalComponent(graphicalComponents.snakeSegment);
    if (state.gameMode === GameMode.Cobra) {
      renderer.drawSquareCustom(graphicalComponents.snakeSegment, 1, 1, PALETTE.cobra.playerTail, PALETTE.cobra.playerTailStroke, drawPlayerOptions);
    } else {
      renderer.drawSquareCustom(graphicalComponents.snakeSegment, 1, 1, level.colors.playerTail, level.colors.playerTailStroke, drawPlayerOptions);
    }

    renderer.clearGraphicalComponent(graphicalComponents.deco1);
    renderer.drawSquareCustom(graphicalComponents.deco1, 1, 1, level.colors.deco1, level.colors.deco1Stroke, drawBasicOptionsNoShake);

    renderer.clearGraphicalComponent(graphicalComponents.deco2);
    renderer.drawSquareCustom(graphicalComponents.deco2, 1, 1, level.colors.deco2, level.colors.deco2Stroke, drawBasicOptionsNoShake);
  }

  function clearBackground() {
    drawState.shouldDrawApples = true;
    drawState.shouldDrawKeysLocks = true;
    renderer.invalidateStaticCache();
    drawBackground();
  }

  function drawBackground() {
    const backgroundColor = state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : level.colors.background;
    renderer.drawBackground(backgroundColor, gfxBG, gfxFG);
    gfxExitLights.clear(0, 0, 0, 0);
    gfxLighting.clear(0, 0, 0, 0);
    gfxPresentation.clear(0, 0, 0, 0);
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
    if (state.isShowingDeathColours) {
      renderer.drawSquareStatic(gfxFG, vec.x, vec.y,
        PALETTE.deathInvert.playerHead,
        PALETTE.deathInvert.playerHead,
        drawPlayerOptionsDeath);
    } else if (!state.isExitingLevel && state.timeSinceInvincibleStart < difficulty.invincibilityTime) {
      renderer.drawSquare(vec.x, vec.y, PALETTE.cobra.playerHead, PALETTE.cobra.playerHead, drawPlayerOptions);
    } else if (state.isLost) {
      renderer.drawGraphicalComponentStatic(gfxFG, graphicalComponents.snakeHead, vec.x, vec.y, 0.5, -1);
    } else {
      renderer.drawGraphicalComponent(graphicalComponents.snakeHead, vec.x, vec.y);
    }
    const dir: DIR = (!state.isLost && moves.length > 0) ? (moves[0] as DIR) : player.direction;
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
    } else if (state.isShowingDeathColours) {
      spriteRenderer.drawImage3x3Static(gfxFG, Image.SnekHead, vec.x, vec.y, getRotationFromDirection(dir), 1, -1);
    } else {
      spriteRenderer.drawImage3x3(Image.SnekHead, vec.x, vec.y, getRotationFromDirection(dir));
      if (replay.mode !== ReplayMode.Playback) {
        p5.push();
        let rotation = getRotationFromDirection(dir);
        let wx = vec.x;
        if (dir === DIR.LEFT) {
          rotation = 0;
          p5.scale(-1, 1);
          wx = -wx - 1;
        }
        if (outfit.exclusive) {
          spriteRenderer.drawSprite3x3(p5, Image.WearablesSheet, wx, vec.y, outfit.exclusive - 1, rotation);
        }
        if (outfit.hair && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(p5, Image.WearablesSheet, wx, vec.y, outfit.hair - 1, rotation);
        }
        if (outfit.eyes && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(p5, Image.WearablesSheet, wx, vec.y, outfit.eyes - 1, rotation);
        }
        if (outfit.back && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(p5, Image.WearablesSheet, wx, vec.y, outfit.back - 1, rotation);
        }
        if (heldItems.crusher) {
          spriteRenderer.drawSprite3x3(p5, Image.WearablesSheet, wx, vec.y, WearableFrame.Crusher - 1, rotation);
        }
        if (outfit.hat && !outfit.exclusive) {
          spriteRenderer.drawSprite3x3(p5, Image.WearablesSheet, wx, vec.y, outfit.hat - 1, rotation);
        }
        p5.pop();
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
    const invincible = !state.isExitingLevel && state.timeSinceInvincibleStart < difficulty.invincibilityTime;
    if (stunned) {
      // draw stunned
      if (Math.floor(state.timeSinceHurt / HURT_FLASH_RATE) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", drawPlayerOptions);
      } else {
        renderer.drawSquare(vec.x, vec.y, "#fff", "#fff", drawPlayerOptions);
      }
    } else if (invincible) {
      // draw invincible
      const timeLeft = difficulty.invincibilityTime - state.timeSinceInvincibleStart;
      if (timeLeft < INVINCIBILITY_EXPIRE_WARN_MS && Math.floor(timeLeft / INVINCIBILITY_EXPIRE_FLASH_MS) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", drawPlayerOptions);
      } else {
        const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
        const color = gradients.calc(invincibleColorGradient, ((i + cycle) % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
        renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptions);
      }
    } else if (state.isRewinding) {
      // draw rewinding
      const cycle = Math.floor(state.actualTimeElapsed / INVINCIBILITY_COLOR_CYCLE_MS);
      const color = gradients.calc(reversibleColorGradient, ((i + cycle) % (NUM_SNAKE_INVINCIBLE_COLORS - 1)) / (NUM_SNAKE_INVINCIBLE_COLORS - 1));
      renderer.drawSquare(vec.x, vec.y, color.toString(), color.toString(), drawPlayerOptions);
    } else if (state.isShowingDeathColours) {
      renderer.drawSquareStatic(gfxFG, vec.x, vec.y,
        PALETTE.deathInvert.playerTail,
        PALETTE.deathInvert.playerTailStroke,
        drawPlayerOptionsDeath);
      const backgroundColor = state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : level.colors.background;
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
      // draw normal segment
      if (cornerNE) {
        spriteRenderer.drawImage3x3Custom(p5, Image.ThemedSegmentNE, vec.x, vec.y, 0, 1, 0);
      } else if (cornerSE) {
        spriteRenderer.drawImage3x3Custom(p5, Image.ThemedSegmentSE, vec.x, vec.y, 0, 1, 0);
      } else if (cornerSW) {
        spriteRenderer.drawImage3x3Custom(p5, Image.ThemedSegmentSW, vec.x, vec.y, 0, 1, 0);
      } else if (cornerNW) {
        spriteRenderer.drawImage3x3Custom(p5, Image.ThemedSegmentNW, vec.x, vec.y, 0, 1, 0);
      } else if (state.gameMode === GameMode.Cobra) {
        renderer.drawSquare(vec.x, vec.y, PALETTE.cobra.playerTail, PALETTE.cobra.playerTailStroke, drawPlayerOptions);
      } else {
        renderer.drawSquare(vec.x, vec.y, level.colors.playerTail, level.colors.playerTailStroke, drawPlayerOptions);
      }
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
    }
  }

  function erasePlayerSegmentCorner(vec: Vector | undefined, i = 0) {
    if (!vec) return;
    const stunned = state.timeSinceHurt < HURT_STUN_TIME;
    const invincible = !state.isExitingLevel && state.timeSinceInvincibleStart < difficulty.invincibilityTime;
    if (!stunned &&
      !invincible &&
      !state.isRewinding &&
      !state.isShowingDeathColours
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
    const backgroundColor = state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : level.colors.background;
    if (cornerNE) {
      renderer.eraseCorner(p5, backgroundColor, vec.x, vec.y, 'NE', 1);
    } else if (cornerSE) {
      renderer.eraseCorner(p5, backgroundColor, vec.x, vec.y, 'SE', 1);
    } else if (cornerSW) {
      renderer.eraseCorner(p5, backgroundColor, vec.x, vec.y, 'SW', 1);
    } else if (cornerNW) {
      renderer.eraseCorner(p5, backgroundColor, vec.x, vec.y, 'NW', 1);
    }
  }

  function drawApple(x: number, y: number) {
    const isInvincibility = pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Invincibility;
    const isReversibility = pickupsMap[getCoordIndex2(x, y)]?.type === PickupType.Reversibility;
    if (state.isShowingDeathColours && replay.mode !== ReplayMode.Playback && isInvincibility) {
      renderer.drawSquare(x, y,
        PALETTE.deathInvert.apple,
        PALETTE.deathInvert.appleStroke,
        drawAppleOptions);
    } else if (isInvincibility) {
      const timeLeft = pickupsMap[getCoordIndex2(x, y)]?.timeTillDeath || 0;
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
      const timeLeft = pickupsMap[getCoordIndex2(x, y)]?.timeTillDeath || 0;
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
      const specialPickupType = pickupsMap[getCoordIndex2(x, y)]?.type;
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
    if (drawState.shouldDrawActionFG && !state.isShowingDeathColours) {
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

  function drawExitLights() {
    if (state.appMode !== AppMode.Game) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isDoorsOpen && (level.type || 0) === LevelType.Level) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    if (state.isGameWon) return;

    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        if (x !== 0 && y !== 0 && x !== GRIDCOUNT_X - 1 && y !== GRIDCOUNT_Y - 1) continue;
        const coord = getCoordIndex2(x, y);
        if (barriersMap[coord] && !passablesMap[coord]) continue;
        if (portalsMap[coord]) continue;
        if (nospawnsMap[coord] && !locksMap[coord]) continue;
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
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < barriers.length; i++) {
        if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i].vec)]) continue;
        const x = barriers[i].vec.x;
        const y = barriers[i].vec.y;
        switch (barriers[i].type) {
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
          default:
          case BarrierType.Unset:
          case BarrierType.Default:
            renderer.drawGraphicalComponentStatic(gfxFG, graphicalComponents.barrier, barriers[i].vec.x, barriers[i].vec.y, 1, 0);
            break;
        }
      }
      return;
    }

    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i].vec)]) continue;
      renderer.drawSquareStatic(gfxFG, barriers[i].vec.x, barriers[i].vec.y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptionsNoShake);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i].vec)]) continue;
      renderer.drawSquareBorderStatic(gfxFG, barriers[i].vec.x, barriers[i].vec.y, 'light', PALETTE.deathInvert.barrierStroke, false, 0);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i].vec)]) continue;
      renderer.drawSquareBorderStatic(gfxFG, barriers[i].vec.x, barriers[i].vec.y, 'dark', PALETTE.deathInvert.barrierStroke, false, 0);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i].vec)]) continue;
      renderer.drawXStatic(gfxFG, barriers[i].vec.x, barriers[i].vec.y, PALETTE.deathInvert.barrierStroke, 5, 0);
    }
  }

  function drawPassableBarriers() {
    if (!state.isDoorsOpen) return;
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < barriers.length; i++) {
        if (!passablesMap[getCoordIndex(barriers[i].vec)]) continue;
        renderer.drawGraphicalComponentStatic(gfxFG, graphicalComponents.barrierPassable, barriers[i].vec.x, barriers[i].vec.y, 1, 0);
        // draw passable glass overlay
        if (!keysMap[getCoordIndex(barriers[i].vec)]) {
          spriteRenderer.drawSprite1x1Static(gfxFG, Image.TileSheet16, barriers[i].vec.x, barriers[i].vec.y, 10);
        }
      }
      return;
    }
    for (let i = 0; i < barriers.length; i++) {
      if (!passablesMap[getCoordIndex(barriers[i].vec)]) continue;
      renderer.drawSquare(barriers[i].vec.x, barriers[i].vec.y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptions);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (!passablesMap[getCoordIndex(barriers[i].vec)]) continue;
      renderer.drawSquareBorder(barriers[i].vec.x, barriers[i].vec.y, 'light', PALETTE.deathInvert.barrierStroke, true);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (!passablesMap[getCoordIndex(barriers[i].vec)]) continue;
      renderer.drawSquareBorder(barriers[i].vec.x, barriers[i].vec.y, 'dark', PALETTE.deathInvert.barrierStroke, true);
    }
  }

  function drawDoors() {
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < doors.length; i++) {
        const x = doors[i].x;
        const y = doors[i].y;
        const isThemedDoor = isAtMapEdge(x, y, 1);
        const isNonDoorLevel = false
          || level === START_LEVEL
          || level === START_LEVEL_COBRA
          || level === WARP_ZONE_01
          || level === WARP_ZONE_02
          || level === WARP_ZONE_03;
        if (isThemedDoor && !isNonDoorLevel) {
          spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedDoor, x, y, 0, 1, 0);
        } else if (!isNonDoorLevel) {
          spriteRenderer.drawImage1x1Static(gfxFG, Image.ThemedDoorAlt, x, y, 0, 1, 0);
        } else {
          renderer.drawGraphicalComponentStatic(gfxFG, graphicalComponents.door, x, y, 1, 0);
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
    for (let i = 0; i < doors.length; i++) {
      renderer.drawSquare(doors[i].x, doors[i].y, PALETTE.deathInvert.door, PALETTE.deathInvert.doorStroke, drawBasicOptions);
    }
    for (let i = 0; i < doors.length; i++) {
      renderer.drawSquareBorder(doors[i].x, doors[i].y, 'light', PALETTE.deathInvert.doorStroke);
    }
    for (let i = 0; i < doors.length; i++) {
      renderer.drawSquareBorder(doors[i].x, doors[i].y, 'dark', PALETTE.deathInvert.doorStroke);
    }
  }

  function drawKey(key: Key) {
    if (!state.isDoorsOpen && passablesMap[getCoordIndex(key.position)]) return;
    if (!drawState.shouldDrawKeysLocks && !state.isShowingDeathColours) return;
    if (state.isShowingDeathColours) {
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
    if (!drawState.shouldDrawKeysLocks && !state.isShowingDeathColours) return;
    if (state.isShowingDeathColours) {
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
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponentStatic(gfxBG, graphicalComponents.deco1, vec.x, vec.y, 1, 0);
      // renderer.drawSquareStatic(gfxBG, vec.x, vec.y, level.colors.deco1, level.colors.deco1Stroke, drawBasicOptionsNoShake);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco1, PALETTE.deathInvert.deco1Stroke, drawBasicOptions);
    }
  }

  function drawDecorative2(vec: Vector) {
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponentStatic(gfxBG, graphicalComponents.deco2, vec.x, vec.y, 1, 0);
      // renderer.drawSquareStatic(gfxBG, vec.x, vec.y, level.colors.deco2, level.colors.deco2Stroke, drawBasicOptionsNoShake);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco2, PALETTE.deathInvert.deco2Stroke, drawBasicOptions);
    }
  }

  function drawParticlesTest(coord: number) {
    if (barriersMap[coord] && !passablesMap[coord]) return false;
    if (doorsMap[coord]) return false;
    if (portalsMap[coord]) return false;
    if (locksMap[coord]) return false;
    if (segments.containsCoord(coord)) return false;
    return true;
  }

  function drawParticles(zIndexPass = 0) {
    if (state.isShowingDeathColours) return;
    if (zIndexPass < 10) {
      emitters.tick(p5.deltaTime);
      particles.tick(p5.deltaTime, drawParticlesTest);
    } else if (zIndexPass < 20) {
      emitters10.tick(p5.deltaTime);
      particles10.tick(p5.deltaTime);
    }
  }

  function drawPointsText() {
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
      for (let j = 0; j < portals[i as PortalChannel].length; j++) {
        const portalPosition = portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        renderer.drawPortal(portal, state.isShowingDeathColours && replay.mode !== ReplayMode.Playback, drawPortalOptions, gfxBG);
        // if (drawState.shouldDrawKeysLocks) {
        //   spriteRenderer.drawImage3x3Custom(gfxKeysLocks, Image.ThemedPortalColumns, portalPosition.x, portalPosition.y, 0, 1, 0);
        // }
      }
    }
  }

  function startPortalParticles() {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < portals[i as PortalChannel].length; j++) {
        const portalPosition = portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        portalParticleSystem.emit(portal.position.x, portal.position.y, portal.channel);
        // portalVortexParticleSystem.emit(portal.position.x, portal.position.y, portal.channel);
      }
    }
  }

  function startExitParticles() {
    if (state.appMode !== AppMode.Game) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isDoorsOpen && (level.type || 0) === LevelType.Level) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    if (state.isGameWon) return;

    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        if (x !== 0 && y !== 0 && x !== GRIDCOUNT_X - 1 && y !== GRIDCOUNT_Y - 1) continue;
        const coord = getCoordIndex2(x, y);
        // if (barriersMap[coord] && !passablesMap[coord]) continue;
        if (barriersMap[coord]) continue;
        if (portalsMap[coord]) continue;
        if (nospawnsMap[coord] && !locksMap[coord] && !doorsMap[coord]) continue;
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
      // musicPlayer.stop(level.musicTrack);
      state.lives = 0;
      stats.numDeaths += 1;
      stopAction(Action.FadeMusic);
      musicPlayer.setVolume(0);
      musicPlayer.halfSpeed(level.musicTrack);
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
    state.isShowingDeathColours = true;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawActionFG = true;
    drawState.shouldDrawKeysLocks = true;
    if (replay.mode !== ReplayMode.Playback) {
      UI.showDeathColors();
    }
    renderer.invalidateStaticCache();
    // UI.renderHearts(0, true);
    yield* coroutines.waitForTime(HURT_STUN_TIME * 2.5);
    state.isShowingDeathColours = false;
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
    return level === START_LEVEL || level == START_LEVEL_COBRA;
  }

  return {
    setLevel,
    setDifficulty,
    getLevel,
    getDifficulty,
    getMaybeTitleScene,
    resetStats,
    resetLevel,
    renderLoop,
    startMoving,
    startRewinding,
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
