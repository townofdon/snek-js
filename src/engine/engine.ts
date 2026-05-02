import P5, { Vector } from 'p5';

import {
  ALL_APPLES_BONUS,
  ALL_LOCKS_BONUS,
  ANIMATIONS,
  CLEAR_BONUS,
  COBRA_SCORE_MOD,
  DEBUG_EASY_LEVEL_EXIT,
  DEFAULT_PAR_TIME,
  DEFAULT_PORTALS,
  DIFFICULTY_MEDIUM,
  DISABLE_TRANSITIONS,
  FRAMERATE,
  FRAME_DUR_MS,
  GLOBAL_LIGHT_DEFAULT,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_FORGIVENESS_TIME,
  HURT_MUSIC_DUCK_TIME_MS,
  HURT_MUSIC_DUCK_VOL,
  HURT_STUN_TIME,
  INVINCIBILITY_PICKUP_FREEZE_MS,
  LEVEL_BONUS,
  LIVES_LEFT_BONUS,
  MAX_LIVES,
  MAX_SNAKE_SIZE,
  NUM_APPLES_START,
  NUM_SNAKE_INVINCIBLE_COLORS,
  PERFECT_BONUS,
  PICKUP_INVINCIBILITY_BONUS,
  SCORE_INCREMENT,
  SCREEN_SHAKE_DURATION_MS,
  SCREEN_SHAKE_MAGNITUDE_PX,
  SNAKE_INVINCIBLE_COLORS,
  SNAKE_REWIND_COLORS,
  START_SNAKE_SIZE,
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
  PICKUP_TYPE_RARITY_MAP,
  RARITY_LEGENDARY,
  RARITY_EPIC,
  RARITY_RARE,
} from "../constants";
import {
  Action,
  AppMode,
  BarrierType,
  ClickState,
  DIR,
  Difficulty,
  DrawState,
  FontsInstance,
  GameMode,
  GameSettings,
  GameState,
  HitType,
  IEnumerator,
  Image,
  InputAction,
  InputType,
  KeyChannel,
  Level,
  LevelType,
  Lock,
  LoopState,
  MusicTrack,
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
  getLevelProgress,
  invertDirection,
  isOrthogonalDirection,
  isWithinBlockDistance,
  removeArrayElement,
  getCoordX,
  getCoordY,
  isBreakableBarrier,
  coordToVec,
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
import { downloadFile, getCanvasImage, overlayOntoCanvas } from '@/editor/utils/publishUtils';
import { withErrorReporting } from '@/reporting';
import { AcquirePickupParticleSystem } from './particleSystems/AcquirePickupParticleSystem';
import { AcquirePickupScene, AcquirePickupSceneConstructorArgs } from '@/scenes/AcquirePickupScene';
import { DEFAULT_ENGINE_STATE } from '@/defaults';
import { engineMovement } from './engineComponents/movement';
import { engineRendering } from './engineComponents/rendering';
import { engineSpawning } from './engineComponents/spawning';

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

  const onMineLifetimeExpire = (coord: number) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
    explosions.add(x, y, frames * timePerFrame, frames, timePerFrame);
    playSound(Sound.xpound);
    drawState.shouldDrawActionFG = true;
  };
  const onShieldSpawnLifetimeExpire = (coord: number) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const { frames, timePerFrame } = ANIMATIONS[Image.Shield];
    const isEndOfLevelDrop = state.isDoorsOpen && apples.length === 0 && preyList.length === 0 && es.level.armorDrop;
    const lifetime = isEndOfLevelDrop ? 99999999 : es.difficulty.invincibilityTime;
    es.pickupsMap[getCoordIndex2(x, y)] = {
      lifetime: lifetime,
      type: PickupType.Armor,
    };
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
  const pickupOutlines = new AnimationList();
  const lightMap = createLightmap();

  const preySpawn: PreySpawn = {
    dropsByFrame: undefined
  } satisfies PreySpawn;
  const astar = new AStar({ allowDiagonals: true, allowClosest: true, randomizeWeights: true, mines, segments });
  const preyList = new PreyList({ astar, onLifetimeExpire: onMineLifetimeExpire });

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

  const {
    gfxBG,
    gfxExitLights,
    gfxKeysLocks,
    gfxApples,
    gfxFG,
    gfxFGAction,
    gfxLighting,
    gfxUIRight,
    initGraphics,
    resetGraphics,
    cacheGraphicalComponents,
    clearBackground,
    drawBackground,
    drawPlayerHead,
    drawPlayerSegment,
    erasePlayerSegmentCorner,
    drawApple,
    drawMines,
    drawPrey,
    drawFireTiles,
    drawExplosions,
    drawShields,
    drawPickupOutlines,
    drawExitLights,
    drawBarriers,
    drawPassableBarriers,
    drawDoors,
    drawKey,
    drawLock,
    drawDecorative1,
    drawDecorative2,
    drawParticles,
    drawPointsText,
    drawPortals,
  } = engineRendering({
    p5,
    state,
    es,
    drawState,
    player,
    segments,
    outfit,
    heldItems,
    gfxPresentation,
    renderer,
    spriteRenderer,
    replay,
    gradients,
    reversibleColorGradient,
    invincibleColorGradient,
    emitters,
    particles,
    emitters10,
    particles10,
  });

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

  const {
    spawnApple,
    spawnArmorPickup,
    chooseSpawnLocation,
  } = engineSpawning({
    p5,
    state,
    es,
    drawState,
    player,
    segments,
    replay,
    stats,
    coroutines,
    preySpawn,
    apples,
    mines,
    preyList,
    shieldSpawns,
    pickupOutlines,
    openDoors,
    playSound,
    explodeMine,
  });

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

  //#region RESET LEVEL

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
    state.timeSinceReverseStart = Infinity;
    state.timeSinceArmorPickup = Infinity;
    state.timeSinceArmorProtection = Infinity;
    state.timeSinceSpawnedAnyPickup = Infinity;
    state.timeSinceSpawnedWeightLossPillPickup = Infinity;
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
    pickupOutlines.reset();
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

    // add initial pickups
    for (let i = 0; i < levelData.pickups.length; i++) {
      const x = levelData.pickups[i].vec.x;
      const y = levelData.pickups[i].vec.y;
      const pickupType = levelData.pickups[i].type;
      if ([PickupType.Invincibility, PickupType.HealthPack, PickupType.WeightLossPill, PickupType.Reversibility].includes(pickupType)) {
        if (!apples.existsAt(x, y)) apples.add(x, y);
      }
      es.pickupsMap[getCoordIndex2(x, y)] = {
        lifetime: 99999999, // improbably high lifetime = never despawn
        type: pickupType,
      };
      if (pickupType === PickupType.Armor) {
        const { frames, timePerFrame } = ANIMATIONS[Image.Shield];
        shields.add(x, y, 99999999, frames, timePerFrame);
      }
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
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < es.portals[i as PortalChannel].length; j++) {
        const portalPosition = es.portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = es.portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        astar.setWall(portal.position.x, portal.position.y);
      }
    }
    es.locks.forEach(lock => {
      astar.setObstacle(lock.position.x, lock.position.y);
    })

    resetLightmap(lightMap, es.level.globalLight ?? GLOBAL_LIGHT_DEFAULT);
    startPortalParticles();
    if (es.level.type === LevelType.WarpZone || (es.level.type === LevelType.Maze && es.level !== START_LEVEL && es.level !== START_LEVEL_COBRA)) {
      startExitParticles();
    }
  }

  //#endregion RESET LEVEL

  //#region LOGIC LOOP

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
    if (apples.existsAtCoord(coord)) {
      didEat = true;
      if (es.pickupsMap[coord]?.type === PickupType.Invincibility) {
        incrementPickupBonus(PickupType.Invincibility, coord);
        startInvincibility();
      } else if (es.pickupsMap[coord]?.type === PickupType.Armor) {
        // handled below via shieldSpawns / shields
      } else if (es.pickupsMap[coord]?.type === PickupType.HealthPack) {
        acquireHealth();
        incrementPickupBonus(PickupType.HealthPack, coord);
        didEat = false;
      } else if (es.pickupsMap[coord]?.type === PickupType.WeightLossPill) {
        acquireWeightLoss();
        incrementPickupBonus(PickupType.WeightLossPill, coord);
        didEat = false;
      } else if (es.pickupsMap[coord]?.type === PickupType.Reversibility) {
        acquireReversibility();
        incrementPickupBonus(PickupType.Reversibility, coord);
        didEat = false;
      } else if (es.pickupsMap[coord]) {
        const rarity = PICKUP_TYPE_RARITY_MAP[es.pickupsMap[coord]?.type];
        if (rarity === RARITY_LEGENDARY) {
          playSound(Sound.acquireLegendaryItem, 0.3);
        } else if (rarity === RARITY_EPIC) {
          playSound(Sound.acquireEpicItem, 0.3);
        } else if (rarity === RARITY_RARE) {
          // playSound(Sound.acquireRareItem, 0.3);
        }
        incrementPickupBonus(es.pickupsMap[coord]?.type, coord);
      }
      if (didEat) {
        spawnAppleParticles(player.position);
        incrementScore();
        growSnake(coord);
        increaseSpeed();
        playSound(Sound.eat);
        if (!state.isDoorsOpen) renderLevelName();
      }
      if (pickupOutlines.existsAtCoord(coord)) {
        pickupOutlines.removeByCoord(coord);
      }
      apples.removeByCoord(coord);
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
      es.pickupsMap[coord] = null;
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

    // check for En Passant for prey
    const passantCoord = preyList.wasAtCoord(coord, FRAME_DUR_MS * 2);
    if (passantCoord >= 0) {
      spawnAppleParticles(coordToVec(passantCoord));
      incrementPreyBonus(preyList.getTypeByCoord(coord), coord);
      growSnake(coord);
      increaseSpeed();
      playSound(Sound.eat);
      preyList.removeByCoord(passantCoord);
      drawState.shouldDrawActionFG = true;
      didEat = true;
    }

    if (didEat && state.isDoorsOpen && apples.length === 0 && preyList.length === 0 && es.level.armorDrop && replay.mode !== ReplayMode.Playback) {
      const loc = chooseSpawnLocation(es.level.armorDrop);
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
          es.pickupsMap[i].lifetime -= loopState.deltaTime;
          if (es.pickupsMap[i].lifetime <= 0) {
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
    state.timeSinceReverseStart += loopState.deltaTime;
    state.timeSinceArmorPickup += loopState.deltaTime;
    state.timeSinceArmorProtection += loopState.deltaTime;
    state.timeSinceSpawnedAnyPickup += loopState.deltaTime;
    state.timeSinceSpawnedWeightLossPillPickup += loopState.deltaTime;
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

  //#endregion LOGIC LOOP

  //#region USER INPUT

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

  //#endregion USER INPUT

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

  //#region RENDER LOOP

  function renderLoop(gamepadInputHandled = false) {
    const timeFrameStart = performance.now();

    if (!gamepadInputHandled) {
      const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
      const isRewindAllowed = rewindAllowed(invincible || heldItems.reversibles > 0);
      const handled = applyGamepadMove(state, player.direction, player.directionToFirstSegment, isRewindAllowed, es.moves, inputCallbacks, handleInputAction)
      if (handled) {
        state.inputType = InputType.Gamepad;
      }
    }

    actions.tick();

    if (state.appMode === AppMode.StartScreen) return;
    if (state.isPaused) {
      renderer.drawRightUI(gfxUIRight, heldItems.armor, heldItems.reversibles);
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
    drawPointsText(pointsAnim);
    drawBarriers();
    drawDoors(doorsOpening);

    for (let i = 0; i < es.keys.length; i++) {
      drawKey(es.keys[i])
    }

    for (let i = 0; i < es.locks.length; i++) {
      drawLock(es.locks[i])
    }

    drawPortals();
    drawPickupOutlines(pickupOutlines);

    for (let i = 0; i < GRIDCOUNT_X * GRIDCOUNT_Y; i++) {
      if (apples.existsAtCoord(i)) {
        const x = Math.floor(i % GRIDCOUNT_X);
        const y = Math.floor(i / GRIDCOUNT_X);
        drawApple(x, y);
      }
    }

    drawShields(shieldSpawns, shields);
    drawMines(mines);
    drawPrey(preyList);
    drawFireTiles(fireTiles);
    drawExplosions(explosions);

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
    if (pickupOutlines.tick(p5.deltaTime)) {
      // draws each frame
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
    renderer.drawRightUI(gfxUIRight, heldItems.armor, heldItems.reversibles);
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

  //#endregion RENDER LOOP

  function playSound(sound: Sound, volume = 1, force = false) {
    if (state.isGameWon) return;
    if (!force && replay.mode === ReplayMode.Playback) return;
    sfx.play(sound, volume);
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
    const canRewind = rewindAllowed(invincible || heldItems.reversibles > 0);
    if (!canRewind) {
      return false;
    }
    state.isRewinding = true;
    state.isMoving = false;
    state.currentSpeed = 1;
    state.timeSinceGraceStarted = 0;
    tutorial.needsRewindControls = false;
    sfx.playLoop(Sound.rewindLoop);
    if (!invincible && heldItems.reversibles > 0) {
      heldItems.reversibles -= 1;
      state.timeSinceReverseStart = 0;
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
    // state.lives = Math.min(state.lives + 1, MAX_LIVES);
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

  function acquireReversibility() {
    if (replay.mode === ReplayMode.Playback) return;
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    heldItems.reversibles += 1;
    playSound(Sound.pickup, 0.35);
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
    playSound(Sound.acquireShield, 0.2);
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

  function acquireHealth() {
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    playSound(Sound.acquireHealth, 0.35);
    state.lives = Math.min(state.lives + 1, MAX_LIVES);
    renderHeartsUI();
  }

  function acquireWeightLoss() {
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isExitingLevel) return;
    if (state.isExited) return;
    state.currentSpeed = 1;
    // TODO: add uniq sound
    playSound(Sound.pickup, 0.35);
    startAction(weightLossRoutine(), Action.WeightLoss);
  }

  function* weightLossRoutine(): IEnumerator {
    const targetNumSegments = Math.max(Math.floor(segments.length * 0.7), START_SNAKE_SIZE);
    loopState.timeScale = 0;
    startScreenShake(0.5, -20, 0.8);
    while (segments.length > targetNumSegments) {
      playSound(Sound.waterSplash);
      const vec = segments.get(segments.length - 1);
      impactParticleSystem.emit(vec.x, vec.y);
      segments.remove(segments.length - 1);
      yield* coroutines.waitForTime(100);
    }
    loopState.timeScale = 1;
    startScreenShake(0, 1);
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
    // check if barrier at player position is breakable
    let isBreakable = false;
    const coord = getCoordIndex(vec);
    const isPassableBarrier = state.isDoorsOpen && es.passablesMap[coord];
    if (!isPassableBarrier && es.barriersMap[coord]) {
      isBreakable = es.barriersMap[coord] && isBreakableBarrier(es.barriersMap[coord]);
    }
    if (isBreakable) {
      state.timeSinceArmorProtection = 0;
      const barrierIdx = es.barriers.findIndex(barrier => getCoordIndex(barrier.vec) === coord);
      es.barriers = removeArrayElement(es.barriers, barrierIdx);
      es.barriersMap[coord] = BarrierType.Unset;
      renderer.invalidateStaticCache();
      const { frames, timePerFrame } = ANIMATIONS[Image.ExplosionSheet];
      explosions.add(vec.x, vec.y, frames * timePerFrame, frames, timePerFrame);
      playSound(Sound.xplodeLong);
      startScreenShake(2, 0, 0.8);
      reboundSnake(segments.length > 3 ? 2 : 1);
    } else if (invincible) {
      state.timeSinceArmorProtection = 0;
      startAutoRewind()
      startScreenShake(0.3, 0.8);
    } else if (isSnakeTrapped()) {
      return false;
    } else {
      state.timeSinceArmorProtection = 0;
      heldItems.armor -= 1;
      playSound(Sound.hurtSave);
      reboundSnake(segments.length > 3 ? 2 : 1);
    }
    return true;
  }

  function isSnakeTrapped() {
    if (![HitType.HitBarrier, HitType.HitDoor, HitType.HitSelf, HitType.HitLock].includes(state.lastHurtBy)) return false;
    const hasHit = checkHasHit(player.position);
    let trapped = true;
    outer:
    for (let i = 0; i <= 3; i++) {
      if (hasHit && i === 0) continue;
      const pos = i === 0 ? player.position : segments.get(i - 1);
      for (let i = 0; i < 4; i++) {
        let dir = DIR.UP;
        if (i === 1) dir = DIR.RIGHT;
        if (i === 2) dir = DIR.DOWN;
        if (i === 3) dir = DIR.LEFT;
        const test = pos.copy().add(dirToUnitVector(dir));
        if (!test.equals(player.position) && !checkHasHit(test)) {
          trapped = false;
          break outer;
        }
      }
    }
    return trapped;
  }

  // if snake has trapped itself, die immediately
  function handleSnakeTrapped(didReceiveDamage: boolean) {
    if (!didReceiveDamage) return;
    if (state.gameMode === GameMode.Casual) return;
    const trapped = isSnakeTrapped();
    if (!trapped) {
      return;
    }
    if (heldItems.reversibles > 0) {
      heldItems.reversibles -= 1;
      state.timeSinceReverseStart = 0;
      state.isLost = false;
      reboundSnake(1);
      startAutoRewind();
      playSound(Sound.hurtSave);
      return;
    }
    state.lives = 0;
    state.isLost = true;
    playSound(Sound.hurt3);
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
    if (state.isLost) return;
    if (appleCoord < 0) return;
    drawState.shouldDrawApples = true;
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
    } else if (pickupType === PickupType.HealthPack) {
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

  function addSnakeSegment() {
    drawState.shouldDrawApples = true;
    segments.addVec(segments.get(segments.length - 1));
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
    initGraphics,
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
