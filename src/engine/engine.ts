import P5, { Vector } from 'p5';

import {
  ANIMATIONS,
  DEFAULT_PAR_TIME,
  DIFFICULTY_MEDIUM,
  FRAMERATE,
  GLOBAL_LIGHT_DEFAULT,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_FORGIVENESS_TIME,
  HURT_STUN_TIME,
  NUM_SNAKE_INVINCIBLE_COLORS,
  SCREEN_SHAKE_DURATION_MS,
  SCREEN_SHAKE_MAGNITUDE_PX,
  SNAKE_INVINCIBLE_COLORS,
  SNAKE_REWIND_COLORS,
  KEYCODE_F10,
  IS_DEV,
  IS_LOCALHOST,
  DIMENSIONS,
  SMOKE_LIFETIME,
  LUNGE_COOLDOWN,
  LUNGE_STEPS,
} from "../constants";
import {
  Action,
  AppMode,
  ClickState,
  DIR,
  Difficulty,
  DrawState,
  FontsInstance,
  GameMode,
  GameSettings,
  GameState,
  DamageType,
  IEnumerator,
  Image,
  InputAction,
  InputType,
  Level,
  LevelType,
  LoopState,
  PlayerState,
  PortalChannel,
  Replay,
  ReplayMode,
  ISFX,
  ScreenShakeState,
  Sound,
  Stats,
  Tutorial,
  UINavEventHandler,
  PickupType,
  PreySpawn,
  Outfit,
  HeldItems,
  EngineState,
  ThreatType,
  SpritesheetRange,
  ExplosionType,
  ThreatFlag,
  SmokeType,
  Boss,
  RemovalReason,
  BaseStats,
} from "../types";
import {
  clamp,
  dirToUnitVector,
  getCoordIndex,
  getCoordIndex2,
  getLevelProgress,
  invertDirection,
  recalculateLasersMap,
  isValidThreatType,
  lerp,
  sluggify,
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
import {
  CAMPAIGN_LEVELS_EP_01,
  CAMPAIGN_LEVELS_EP_02,
  CAMPAIGN_LEVELS_EP_03,
  hasLevelBoss,
  START_LEVEL,
  START_LEVEL_COBRA,
} from "../levels/levelConstants";
import { LEVEL_01 } from '../levels/ep01/level01';
import { LEVEL_99 } from '../levels/ep01/level99';
import { VARIANT_LEVEL_99 } from '../levels/bonusLevels/variantLevel99';
import { WinLevelScene } from '../scenes/WinLevelScene';
import { SpriteRenderer } from './spriteRenderer';
import { Renderer } from './renderer';
import { drawLighting, updateLighting } from './lighting';
import { MusicPlayer } from './musicPlayer';
import { InputCallbacks, handleKeyPressed, validateMove } from './controls';
import { applyGamepadRumble, applyGamepadMove } from './gamepad'
import { Easing } from '../easing';
import { Coroutines } from './coroutines';
import { UI } from '../ui/ui';
import { buildSceneActionFactory } from '../scenes/sceneUtils';
import { TitleScene, TitleSceneOptions } from '../scenes/TitleScene';
import { setMusicVolume, setSfxVolume } from './audio';
import { LEVEL_01_HARD } from '../levels/ep01/level01hard';
import { LEVEL_01_ULTRA } from '../levels/ep01/level01ultra';
import { saveDataStore, SaveDataStore } from '../stores/SaveDataStore';
import { AStar } from '../astar/astar';
import { PreyList } from '../collections/preyList';
import { getCanvasImage, overlayOntoCanvas } from '@/editor/utils/publishUtils';
import { downloadFile } from '@/editor/utils/saveUtils';
import { withErrorReporting } from '@/reporting';
import { AcquirePickupParticleSystem } from './particleSystems/AcquirePickupParticleSystem';
import { AcquirePickupScene, AcquirePickupSceneConstructorArgs } from '@/scenes/AcquirePickupScene';
import { DEFAULT_ENGINE_STATE } from '@/defaults';
import { checkPortalTeleportWillHit, reboundSnake } from './engineComponents/movement';
import { engineRendering } from './engineComponents/rendering';
import { checkCollision, checkRewindAllowed } from './engineComponents/logic';
import { allowAchievements, checkAchievementForDeath, checkAchievementForLevelCompletion } from '@/achievements';
import { Context } from './engineComponents/context';
import { addPoints, applyMortalRuin, resetStats, setStats, startMoving } from './engineComponents/mutations';
import { getAllApplesBonus, getAllLocksBonus, getLevelClearBonus, getLivesLeftBonus, getPerfectBonus } from './engineComponents/scoring';
import { coreLogicLoop } from './engineComponents/coreLogicLoop';
import { getIsStartLevel } from '@/levels/levelUtils';
import { damageSurroundingTiles } from './engineComponents/damage';
import { resetLevelImpl, ResetLevelImplParams } from './engineComponents/resetLevel';
import { transitions, TransitionsParams } from './engineComponents/transitions';
import { emitLevelChangedEvent } from '@/ui/uiEvents';

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
  sfx: ISFX,
  musicPlayer: MusicPlayer,
  actions: Coroutines,
  coroutines: Coroutines,
  winLevelScene: WinLevelScene,
  gfxPresentation: P5.Graphics,
  startAction: (enumerator: IEnumerator, actionKey: Action, force?: boolean) => void,
  stopAction: (actionKey: Action) => void,
  clearAction: (actionKey: Action) => void,
  actionRunning: (actionKey: Action) => boolean,
  clearUI: (force?: boolean) => void,
  gotoNextLevel: () => void,
  proceedToNextReplayClip: () => void,
  handleInputAction: (action: InputAction) => void,
  onUINavigate: UINavEventHandler,
  onGameOver: () => void,
  onGameOverCobra: () => void,
  onGameOverArcade: () => void,
  onRecordLevelProgress: SaveDataStore['recordLevelCompletion'],
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
  actionRunning,
  clearUI,
  gotoNextLevel,
  proceedToNextReplayClip,
  handleInputAction,
  onUINavigate,
  onGameOver,
  onGameOverCobra,
  onGameOverArcade,
  onRecordLevelProgress,
}: EngineParams) {
  const boss: { current: Boss | null } = { current: null };
  const es: EngineState = { ...DEFAULT_ENGINE_STATE };
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
    shouldRecalculateLasers: false,
  } satisfies DrawState;
  const metrics = {
    gameLoopProcessingTime: 0,
    gameLoopProcessingTimeMax: 0,
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

  //#region animation lifecycles
  const onPreyLifetimeExpire = (coord: number) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const lifetime = ANIMATIONS[Image.ExplosionSheet].frames * ANIMATIONS[Image.ExplosionSheet].timePerFrame;
    explosions.add(x, y, lifetime, Image.ExplosionSheet, ExplosionType.Small);
    playSound(Sound.xpound);
    drawState.shouldDrawActionFG = true;
  };
  const onShieldSpawnLifetimeExpire = (coord: number) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const isEndOfLevelDrop = state.isDoorsOpen && apples.length === 0 && preyList.length === 0 && es.level.armorDrop;
    const lifetime = isEndOfLevelDrop ? 99999999 : es.difficulty.invincibilityTime;
    es.pickupsMap[getCoordIndex2(x, y)] = {
      lifetime: lifetime,
      type: PickupType.Armor,
    };
    shields.add(x, y, lifetime, Image.Shield);
    drawState.shouldDrawActionFG = true;
    return true;
  };
  const onThreatAdd = (coord: number, threatType: number) => {
    if (isValidThreatType(threatType)) {
      es.threatsMap[coord] = threatType;
      drawState.shouldDrawActionFG = true;
    }
  }
  const onThreatLifetimeExpire = (coord: number, threatType: number) => {
    if (isValidThreatType(threatType)) {
      const x = Math.floor(coord % GRIDCOUNT_X);
      const y = Math.floor(coord / GRIDCOUNT_X);
      if (threatType === ThreatType.LaserDiode && threats.hasFlagAt(x, y, ThreatFlag.Activating)) {
        threats.removeFlagAt(x, y, ThreatFlag.Activating);
        threats.setLifetime(x, y, 99999999);
        threats.restart(x, y);
        drawState.shouldRecalculateLasers = true;
        drawState.shouldDrawActionFG = true;
        playSound(Sound.switch);
        return false;
      }
    }
    return true;
  }
  const onThreatRemove = (coord: number, reason: RemovalReason) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    const smokeLifetime = lerp(SMOKE_LIFETIME * 0.5, SMOKE_LIFETIME, Math.random());
    const threatType = es.threatsMap[coord];
    if (threatType === ThreatType.ExplodableBarrel) {
      const lifetime = ANIMATIONS[Image.Explosion3Sheet].frames * ANIMATIONS[Image.Explosion3Sheet].timePerFrame;
      explosions.add(x, y, lifetime, Image.Explosion3Sheet, ExplosionType.Large);
      smoke.add(x, y, smokeLifetime, SpritesheetRange.BigSmokeActive, SmokeType.Large);
      playSound(Sound.xplode3);
      damageSurroundingTiles(ctx, coord, ExplosionType.Large);
      if (screenShake.timeSinceStarted >= SCREEN_SHAKE_DURATION_MS) {
        startScreenShake(2, 0, 0.8);
      }
      recalculateLasersMap(es, threats);
      if (state.isLost) {
        // checkExplosionHit(ctx, coordToVec(coord));
        applyMortalRuin(ctx);
      }
    } else if (threatType === ThreatType.Bomb) {
      const lifetime = ANIMATIONS[Image.Explosion3Sheet].frames * ANIMATIONS[Image.Explosion3Sheet].timePerFrame;
      explosions.add(x, y, lifetime, Image.Explosion3Sheet, ExplosionType.Large);
      smoke.add(x, y, smokeLifetime, SpritesheetRange.BigSmokeActive, SmokeType.Large);
      playSound(Sound.xplode3);
      damageSurroundingTiles(ctx, coord, ExplosionType.Large);
      if (screenShake.timeSinceStarted >= SCREEN_SHAKE_DURATION_MS) {
        startScreenShake(2, 0, 0.8);
      }
      if (state.isLost) {
        // checkExplosionHit(coordToVec(coord));
        applyMortalRuin(ctx);
      }
    } else if (threatType === ThreatType.Mine || reason === RemovalReason.LifetimeExpired || reason === RemovalReason.Explode) {
      const lifetime = ANIMATIONS[Image.ExplosionSheet].frames * ANIMATIONS[Image.ExplosionSheet].timePerFrame;
      explosions.add(x, y, lifetime, Image.ExplosionSheet, ExplosionType.Small);
      playSound(Sound.xpound);
      damageSurroundingTiles(ctx, coord, ExplosionType.Small);
      if (screenShake.timeSinceStarted >= SCREEN_SHAKE_DURATION_MS) {
        startScreenShake(1, 0.5);
      }
    }
    es.threatsMap[coord] = undefined;
    drawState.shouldDrawActionFG = true;
    if (threatType === ThreatType.LaserDiode) {
      recalculateLasersMap(es, threats);
      sfx.stop(Sound.alarm);
    }
  }
  const onSmokeRemove = (coord, reason, type) => {
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    if (type === SmokeType.Large && reason === RemovalReason.LifetimeExpired) {
      const { frames, timePerFrame } = ANIMATIONS[SpritesheetRange.BigSmokeOff];
      if (Math.random() < 0.5) {
        smoke.add(x, y, frames * timePerFrame, SpritesheetRange.BigSmokeOff, SmokeType.LargeDissipate);
      } else {
        smoke.add(x, y, lerp(SMOKE_LIFETIME * 0.5, SMOKE_LIFETIME, Math.random()), Image.SmokeSheet, SmokeType.Small);
      }
    }
  };
  //#endregion animation lifecycles

  //#region instantiations
  const segments = new VectorList(); // snake segments
  const apples = new AppleList(); // food that the snake can eat to grow and score points
  const threats = new AnimationList({ onAdd: onThreatAdd, onRemove: onThreatRemove, onLifetimeExpire: onThreatLifetimeExpire }).setName('threats');
  const doorsOpening = new AnimationList().setName('doorsOpening');
  const fireTiles = new AnimationList().setName('fireTiles');
  const explosions = new AnimationList().setName('explosions');
  const puffs = new AnimationList().setName('puffs');
  const smoke = new AnimationList({ onRemove: onSmokeRemove }).setName('smoke');
  const pointsAnim = new AnimationList();
  const shields = new AnimationList();
  const shieldSpawns = new AnimationList({ onLifetimeExpire: onShieldSpawnLifetimeExpire });
  const pickupOutlines = new AnimationList();
  const lights = new AnimationList();

  const preySpawn: PreySpawn = {
    dropsByFrame: undefined
  } satisfies PreySpawn;
  const astar = new AStar({ allowDiagonals: true, allowClosest: true, randomizeWeights: true, threats, segments });
  const preyList = new PreyList({ astar, onLifetimeExpire: onPreyLifetimeExpire });

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
  //#endregion instantiations

  //#region setup context
  const ctx = {
    p5,
    es,
    state,
    loopState,
    replay,
    drawState,
    tutorial,
    boss,
    stats,
    astar,
    renderer,
    spriteRenderer,
    coroutines,
    sfx,
    musicPlayer,
    player,
    segments,
    heldItems,
    apples,
    threats,
    explosions,
    shields,
    shieldSpawns,
    pickupOutlines,
    pointsAnim,
    puffs,
    smoke,
    preyList,
    lights,
    fireTiles,
    preySpawn,
    doorsOpening,
    appleParticleSystem,
    gateUnlockParticleSystem,
    impactParticleSystem,
    playSound,
    startScreenShake,
    startExitParticles,
    proceedToNextReplayClip,
    flashScreen,
    renderHeartsUI,
    renderScoreUI,
    renderLevelName,
    renderDifficultyUI,
    maybeGameOver,
    onLevelExitStart,
    onLevelExitFinish,
    startAction,
    stopAction,
    actionRunning,
    clearAction,
  } satisfies Context;
  //#endregion setup context

  //#region engineRendering
  const {
    gfxBG,
    gfxExitLights,
    gfxKeysLocks,
    gfxApples,
    gfxFG,
    gfxFGAction,
    gfxLighting,
    gfxUILeft,
    gfxUIRight,
    initGraphics,
    resetGraphics,
    cacheGraphicalComponents,
    clearBackground,
    drawBackground,
    drawPlayerPlannedMoves,
    drawPlayerHead,
    drawPlayerSegment,
    drawPipes,
    erasePlayerSegmentCorner,
    drawApple,
    drawSwitches,
    drawThreats,
    drawLasers,
    drawPrey,
    drawFireTiles,
    drawExplosions,
    drawSmoke,
    drawPuffs,
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
    loopState,
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
  //#endregion engineRendering

  //#region acquire item scene
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
        startAction(fadeMusic(1, 1000), Action.FadeMusic);
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
  //#endregion acquire item scene

  //#region getters / setters / ui
  function setLevel(incoming: Level) {
    es.level = incoming;
    if (es.level === LEVEL_01 && replay.mode !== ReplayMode.Playback) {
      if (es.difficulty.index === 3) {
        es.level = LEVEL_01_HARD;
      } else if (es.difficulty.index === 4) {
        es.level = LEVEL_01_ULTRA;
      }
    }
    emitLevelChangedEvent(es.level);
  }

  function setDifficulty(incoming: Difficulty) {
    es.difficulty = { ...incoming }
    renderDifficultyUI();
  }

  function getLevel() {
    return es.level;
  }

  function getDifficulty() {
    return es.difficulty;
  }

  function renderDifficultyUI() {
    if (!state.isGameStarted) return;
    if (state.appMode !== AppMode.Game) return;
    if (es.level === START_LEVEL) return;
    if (es.level === START_LEVEL_COBRA) return;
    if (es.level.type === LevelType.Maze) return;
    if (es.level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderDifficulty(es.difficulty.index, state.isInvertedColors, state.gameMode);
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
  //#endregion

  //#region RESET LEVEL
  interface ResetLevelParams {
    shouldShowTransitions: boolean,
    onTriggerWinGame?: () => void,
  }
  function resetLevel({ shouldShowTransitions = true, onTriggerWinGame }: ResetLevelParams) {
    apples.reset();
    threats.reset();
    shields.reset();
    shieldSpawns.reset();
    pickupOutlines.reset();
    lights.reset();
    doorsOpening.reset();
    explosions.reset();
    smoke.reset();
    puffs.reset();
    fireTiles.reset();
    segments.reset();
    emitters.reset();
    emitters10.reset();
    particles.reset();
    particles10.reset();
    astar.reset();
    preyList.reset();
    pointsAnim.reset();
    screenShake.timeSinceStarted = Infinity;
    screenShake.timeSinceLastStep = Infinity;
    screenShake.magnitude = 1;
    screenShake.timeScale = 1;
    screenShake.offset.x = 0;
    screenShake.offset.y = 0;
    UI.disableScreenScroll();
    UI.clearLabels();
    UI.hideDeathColors();
    clearUI();
    stopAction(Action.ChangeMusicLowpass);
    stopAction(Action.FadeMusic);
    stopAction(Action.GameOver);
    stopAction(Action.Electrocution);
    startAction(fadeMusic(1, 100), Action.FadeMusic);
    setSfxVolume(settings.sfxVolume);
    setMusicVolume(settings.musicVolume);
    resetScreenShake();
    applyScreenShakeGfx(0, 0);
    winLevelScene.reset();
    resetGraphics();
    resetLevelImpl(ctx, {
      boss,
      startPortalParticles,
      startExitParticles,
      setColorsFromLevel,
    } satisfies ResetLevelImplParams);
    const transition = getMaybeTitleScene();
    transitions({
      ctx,
      boss,
      shouldShowTransitions,
      gfxPresentation,
      fonts,
      actions,
      transition,
      startLogicLoop,
      stopLogicLoop,
      renderLoop,
    } satisfies TransitionsParams)
  }

  function setColorsFromLevel() {
    cacheGraphicalComponents();
    appleParticleSystem.setColorsFromLevel(es.level);
  }

  function getMaybeTitleScene() {
      const annotation = (() => {
        if (!es.level.id) return '';
        if (hasLevelBoss(es.level)) return '';
        if (state.gameMode === GameMode.Arcade) return '';
        {
          const levelIndex = CAMPAIGN_LEVELS_EP_01.indexOf(es.level);
          if (levelIndex >= 0) return `${levelIndex + 1} / ${CAMPAIGN_LEVELS_EP_01.length}`;
        }
        {
          const levelIndex = CAMPAIGN_LEVELS_EP_02.indexOf(es.level);
          if (levelIndex >= 0) return `${levelIndex + 1} / ${CAMPAIGN_LEVELS_EP_02.length}`;
        }
        {
          const levelIndex = CAMPAIGN_LEVELS_EP_03.indexOf(es.level);
          if (levelIndex >= 0) return `${levelIndex + 1} / ${CAMPAIGN_LEVELS_EP_03.length}`;
        }
        if (es.level.author) return `by ${es.level.author}`;
        return ''
      })();
      const buildSceneAction = buildSceneActionFactory(p5, gfxPresentation, sfx, fonts);
      const hideNowEnteringText = hasLevelBoss(es.level);
      const opts: TitleSceneOptions = { hideNowEnteringText };
      return es.level.showTitle
        ? buildSceneAction((p5, gfx, sfx, fonts, callbacks) => new TitleScene(es.level.name, annotation, p5, gfx, sfx, fonts, callbacks, opts))
        : () => Promise.resolve();
  }
  //#endregion RESET LEVEL

  //#region LOGIC LOOP
  function startLogicLoop() {
    if (loopState.interval) clearInterval(loopState.interval);
    loopState.timeScale = 1;
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

  const logicLoop = withErrorReporting(() => {
    coreLogicLoop(ctx);
  })
  //#endregion LOGIC LOOP

  //#region USER INPUT
  const inputCallbacks: InputCallbacks = {
    onAddMove,
    onLunge,
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
      es.recentMoveInputs,
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

  function checkPlayerWillHit(dir: DIR, numMoves = 1): boolean {
    const pos = player.position.copy();
    const currentMove = dirToUnitVector(dir);
    for (let i = 0; i < numMoves; i++) {
      const futurePosition = pos.add(currentMove);
      const willHit = !!checkCollision(ctx, futurePosition) || checkPortalTeleportWillHit(ctx, futurePosition, dir);
      if (willHit) return true;
    }
    return false;
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

  function onLunge(dir: DIR): void {
    if (state.timeSinceHurt < HURT_STUN_TIME) return;
    if (state.lungeStepsRemaining > 0) return;
    if (loopState.timeScale === 0) return;
    if (state.timeSinceLungeStart < LUNGE_COOLDOWN) return;
    if (state.isLost) return;
    if (state.lives < 0) return;
    state.timeSinceLungeStart = 0;
    state.lungeStepsRemaining = LUNGE_STEPS;
    player.direction = dir;
    es.moves = [];
    playSound(Sound.moveStart);
  }

  function onResetMoves() {
    es.moves = [];
  }

  function requestPlayerRewind() {
    if (state.isRewinding) return;
    const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const canRewind = checkRewindAllowed(ctx, invincible || heldItems.reversibles > 0);
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

  const onChangePlayerDirection: (direction: DIR) => void = (dir) => {
    if (validateMove(player.direction, dir)) {
      player.direction = dir;
      player.directionToFirstSegment = invertDirection(dir);
    }
  };
  //#endregion USER INPUT

  //#region RENDER LOOP

  const renderLoop = withErrorReporting((gamepadInputHandled = false) => {
    const timeFrameStart = performance.now();

    if (!gamepadInputHandled) {
      const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
      const isRewindAllowed = checkRewindAllowed(ctx, invincible || heldItems.reversibles > 0);
      const handled = applyGamepadMove(state, player.direction, player.directionToFirstSegment, isRewindAllowed, es.moves, inputCallbacks, handleInputAction)
      if (handled) {
        state.inputType = InputType.Gamepad;
      }
    }

    actions.tick();

    if (state.appMode === AppMode.StartScreen) return;
    if (state.isPaused) {
      renderer.drawLeftUI(gfxUILeft, getLevelProgress(stats, es.level, es.difficulty), boss.current);
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

    if (boss.current) {
      boss.current.draw(p5.deltaTime);
    }

    drawExitLights();
    drawParticles(0);
    drawPointsText(pointsAnim);
    drawBarriers();
    drawDoors(doorsOpening);
    drawPipes();

    for (let i = 0; i < es.keys.length; i++) {
      drawKey(es.keys[i])
    }

    for (let i = 0; i < es.locks.length; i++) {
      drawLock(es.locks[i])
    }

    drawSwitches();
    drawSmoke(smoke);
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
    drawThreats(threats);
    drawLasers();
    drawPrey(preyList);
    drawFireTiles(fireTiles);
    drawExplosions(explosions);
    drawPuffs(puffs);

    renderer.drawPlayerMoveArrows(p5, player.position, es.moves.length > 0 ? es.moves[0] : player.direction);
    drawPlayerPlannedMoves(es.portalsMap, (loc) => checkCollision(ctx, loc, true));

    for (let i = 0; i < segments.length; i++) {
      drawPlayerSegment(segments.get(i), i);
    }
    for (let i = 0; i < segments.length; i++) {
      erasePlayerSegmentCorner(segments.get(i), i);
    }

    drawPlayerHead(player.position);
    drawPassableBarriers();
    drawParticles(10);
    renderer.drawCaptureMode();
    renderer.setStaticCacheFlags();

    drawState.shouldDrawApples = false;
    drawState.shouldDrawActionFG = false;
    drawState.shouldDrawKeysLocks = false;

    let animDeltaTime = p5.deltaTime * Math.abs(Math.sign(loopState.deltaTime));
    if (boss.current) {
      animDeltaTime = p5.deltaTime;
    }
    if (!state.isInvertedColors && pointsAnim.tick(animDeltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (doorsOpening.tick(animDeltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (!state.isInvertedColors && threats.tick(p5.deltaTime * Math.abs(Math.sign(loopState.deltaTime)))) {
      drawState.shouldDrawActionFG = true;
    }
    if (fireTiles.tick(animDeltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (explosions.tick(state.isLost ? animDeltaTime : p5.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (puffs.tick(animDeltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (smoke.tick(animDeltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (shields.tick(animDeltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (shieldSpawns.tick(animDeltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
    if (pickupOutlines.tick(animDeltaTime)) {
      // draw to main gfx
    }

    const globalLight = state.isDeathIlluminating ? 0 : (state.globalLightOverride ?? es.level.globalLight ?? GLOBAL_LIGHT_DEFAULT);

    if (
      state.isGameStarted &&
      replay.mode !== ReplayMode.Playback &&
      globalLight < 1 &&
      !state.isInvertedColors &&
      state.timeSinceInvincibleStart >= es.difficulty.invincibilityTime
    ) {
      updateLighting(p5.deltaTime, globalLight, player.position, es.portals, es.pickupsMap, explosions, fireTiles, state, es, renderer.getElapsed());
      drawLighting(renderer, gfxLighting);
    }

    if (es.level.renderInstructions) {
      es.level.renderInstructions(gfxPresentation, renderer, state, es.level.colors);
    }
    renderer.drawLeftUI(gfxUILeft, getLevelProgress(stats, es.level, es.difficulty), boss.current);
    renderer.drawRightUI(gfxUIRight, heldItems.armor, heldItems.reversibles);
    renderer.drawTutorialMoveControls(gfxPresentation);
    renderer.drawTutorialRewindControls(gfxPresentation, player.position, checkRewindAllowed(ctx));
    renderer.drawFps(gfxPresentation, metrics.gameLoopProcessingTime);

    const bpm = 85;
    const musicTrackElapsed = Math.max(musicPlayer.getTimeElapsedCurrentTrack() || 0, 0);
    if ((musicTrackElapsed * (bpm / 60)) % 2 >= 1) {
      UI.syncSelectionToAudio(1);
    } else {
      UI.syncSelectionToAudio(2);
    }

    if (!state.isGameStarted && replay.mode !== ReplayMode.Playback) return;

    // tick time elapsed
    if ((!state.isLost && state.isMoving) || replay.mode === ReplayMode.Playback) {
      state.timeElapsed += p5.deltaTime;
    }
    state.actualTimeElapsed += p5.deltaTime;

    if (!state.isLost && state.isExitingLevel && replay.mode !== ReplayMode.Playback) {
      winLevelScene.draw();
    }

    renderer.tick();

    if (IS_DEV || IS_LOCALHOST) {
      metrics.gameLoopProcessingTime = performance.now() - timeFrameStart;
      if (metrics.gameLoopProcessingTime > metrics.gameLoopProcessingTimeMax) {
        metrics.gameLoopProcessingTimeMax = metrics.gameLoopProcessingTime;
        if (metrics.gameLoopProcessingTimeMax > 10) {
          console.warn(`Long render frame! ${metrics.gameLoopProcessingTimeMax.toFixed(4)}ms`);
        }
      }
    }
  });
  //#endregion RENDER LOOP

  //#region screenshake, fx
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
  //#endregion screenshake, fx

  //#region level exit
  function onLevelExitStart() {
    const isStartLevel = getIsStartLevel(es.level);
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
      startAction(fadeMusic(0, 500), Action.FadeMusic);
      if (isStartLevel) {
        playSound(Sound.doorOpenHuge);
      } else if (state.gameMode !== GameMode.Arcade && (es.level === LEVEL_99 || es.level === VARIANT_LEVEL_99 || es.level.playWinSound)) {
        playSound(Sound.winGame);
      } else {
        playSound(Sound.winLevel);
      }
    }
    // blow up all mines currently on the level
    stats.minesRemaining = 0;
    let numExplosionsAtLevelExit = preyList.length;
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      for (let y = 0; y < GRIDCOUNT_Y; y++) {
        const coord = getCoordIndex2(x, y);
        if (es.threatsMap[coord] === ThreatType.Mine) {
          stats.minesRemaining++;
        }
        if (es.threatsMap[coord] === ThreatType.Mine || es.threatsMap[coord] === ThreatType.Bomb) {
          threats.removeByCoord(coord, RemovalReason.Explode);
          numExplosionsAtLevelExit++;
        }
        if (preyList.existsAtCoord(coord)) {
          preyList.removeByCoord(coord);
          const lifetime = ANIMATIONS[Image.ExplosionSheet].frames * ANIMATIONS[Image.ExplosionSheet].timePerFrame;
          explosions.add(x, y, lifetime, Image.ExplosionSheet, ExplosionType.Small);
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

  function onLevelExitFinish() {
    state.isExited = true;
    if (replay.mode === ReplayMode.Playback) {
      proceedToNextReplayClip();
      return;
    }

    const levelToSave = es.level.recordProgressAsLevel || es.level;
    const perfect = apples.length === 0 && state.collisions === 0;
    const hasAllApples = apples.length === 0;
    const hasAllLocks = !!es.level.numLocks && es.locks.length === 0;
    const shouldRecordLevelCompletion = (true
      && !settings.debug.easyExit
      && state.gameMode !== GameMode.Tutorial
      && state.gameMode !== GameMode.Arcade
      && state.gameMode !== GameMode.Casual
      && !!levelToSave.id
    );
    if (!perfect) {
      stats.perfect = false;
    }
    if (!hasAllApples) {
      stats.noApplesLeft = false;
    }

    if (shouldRecordLevelCompletion) {
      onRecordLevelProgress(levelToSave.id, es.difficulty.index, perfect, stats.totalLevelTimeElapsed);
      if (allowAchievements(state, replay.mode)) {
        checkAchievementForLevelCompletion({
          levelId: es.level.id,
          episode: state.episode,
          difficultyIndex: es.difficulty.index,
          perfect,
          hasAllApples,
          hasAllLocks,
          doorsOpen: state.isDoorsOpen,
          blueKeyCollected: !es.keys.length,
          yellowKeyCollected: stats.yellowKeyCollected,
          redKeyCollected: stats.redKeyCollected,
          anyPowerupCollected: stats.anyPowerupCollected,
          livesRemaining: state.lives,
          applesRemaining: apples.length,
          locksRemaining: es.locks.length,
          minesRemaining: stats.minesRemaining,
          time: state.timeElapsed,
        });
      }
    }

    if (settings.debug.disableTransitions) {
      gotoNextLevel();
    } else if (getIsStartLevel(es.level)) {
      gotoNextLevel();
    } else if (es.level.quickExit) {
      gotoNextLevel();
    } else if (state.gameMode === GameMode.Tutorial) {
      gotoNextLevel();
    } else if (state.gameMode === GameMode.Casual) {
      gotoNextLevel();
    } else if (es.level.type === LevelType.Maze) {
      gotoNextLevel();
    } else if (es.level.type === LevelType.WarpZone) {
      gotoNextLevel();
    } else {

      winLevelScene.triggerLevelExit({
        score: stats.score,
        levelClearBonus: getLevelClearBonus(ctx),
        livesLeftBonus: getLivesLeftBonus(ctx),
        allApplesBonus: getAllApplesBonus(ctx),
        allLocksBonus: getAllLocksBonus(ctx),
        perfectBonus: getPerfectBonus(ctx),
        livesLeft: state.lives,
        isPerfect: perfect,
        hasAllApples,
        hasAllLocks,
        levelMusicTrack: getIsStartLevel(es.level) ? undefined : es.level.musicTrack,
        parTime: es.level.parTime || DEFAULT_PAR_TIME,
        clearTime: Math.floor(stats.totalLevelTimeElapsed / 1000) * 1000,
        onApplyScore: () => {
          musicPlayer.stopAllTracks();
          const perfectBonus = perfect ? getPerfectBonus(ctx) : 0;
          const allApplesBonus = (!perfect && hasAllApples) ? getAllApplesBonus(ctx) : 0;
          const allLocksBonus = hasAllLocks ? getAllLocksBonus(ctx) : 0;
          addPoints(ctx, getLevelClearBonus(ctx)
            + getLivesLeftBonus(ctx) * state.lives
            + perfectBonus
            + allApplesBonus
            + allLocksBonus);
          renderScoreUI();
        },
      });
    }
  }
  //#endregion level exit

  //#region particles
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
  //#endregion particles

  //#region game over
  function maybeGameOver() {
    if (replay.mode === ReplayMode.Playback) {
      showGameOver();
    } else {
      startAction(maybeGameOverRoutine(), Action.GameOver);
    }
  }

  function* maybeGameOverRoutine(): IEnumerator {
    // give player a chance to recover a death blow
    state.isLost = true;
    state.timeSinceHurt = 0;
    yield null;
    yield* actions.waitForTime(HURT_FORGIVENESS_TIME);
    yield null;
    showGameOver();
    clearAction(Action.GameOver);
  }

  function showGameOver() {
    stopAction(Action.EpicDeath);
    stopAction(Action.OpenDoors);
    state.isLost = true;
    state.timeSinceHurt = Infinity;
    if (replay.mode !== ReplayMode.Playback) {
      // musicPlayer.stop(es.level.musicTrack);
      state.lives = 0;
      stats.numDeaths += 1;
      stopAction(Action.FadeMusic);
      musicPlayer.setVolume(0);
      musicPlayer.pause(es.level.musicTrack);
    }
    switch (state.lastHurtBy) {
      case DamageType.HitBarrier:
      case DamageType.HitDoor:
      case DamageType.HitLock:
      case DamageType.HitSelf:
        reboundSnake(ctx, 1);    
        break;
    }
    coroutines.start(showGameOverRoutine());
    maybeSaveReplayStateToFile();
    if (state.gameMode === GameMode.Cobra) {
      saveDataStore.resetCurrentSaveSlot();
    }
    if (allowAchievements(state, replay.mode)) {
      checkAchievementForDeath(state.lastHurtBy, state.isTrapped);
    }
  }

  function* showGameOverRoutine(): IEnumerator {
    if (state.gameMode !== GameMode.Cobra && state.gameMode !== GameMode.Arcade) {
      stats.score = parseInt(String(stats.score * 0.5), 10);
    }
    loopState.timeScale = 0;
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
    yield* coroutines.waitForTime(HURT_STUN_TIME * 2.5);
    state.isInvertedColors = false;
    state.isDeathIlluminating = false;
    drawState.shouldDrawApples = true;
    drawState.shouldDrawActionFG = true;
    drawState.shouldDrawKeysLocks = true;
    UI.hideDeathColors();
    renderer.invalidateStaticCache();
    loopState.timeScale = 1;
    startScreenShake(1, 0.4);
    if (replay.mode !== ReplayMode.Playback) {
      musicPlayer.halfSpeed(es.level.musicTrack);
    }
    if (replay.mode === ReplayMode.Playback) {
      yield* coroutines.waitForTime(1000);
      proceedToNextReplayClip();
    } else if (state.gameMode === GameMode.Cobra) {
      startAction(fadeMusic(0.3, 500), Action.FadeMusic);
      clearUI();
      UI.clearLabels();
      onGameOverCobra();
    } else if (state.gameMode === GameMode.Arcade) {
      startAction(fadeMusic(0.3, 500), Action.FadeMusic);
      clearUI();
      UI.clearLabels();
      onGameOverArcade();
    } else {
      startAction(fadeMusic(0.3, 500), Action.FadeMusic);
      renderScoreUI(stats.score);
      onGameOver();
    }
  }
  //#endregion game over

  //#region save replay, etc.
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
      const fileName = `snek-data-${sluggify(replay.levelName)}-${replay.timeCaptureStarted}.json`;
      download(JSON.stringify(replay), fileName, 'application/json');
      console.log(`saved file "${fileName}"`);
    } catch (err) {
      console.error(err);
    }
  }

  // save a screenshot of the map
  async function saveMapImage() {
    // const mainCanvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    const fg = document.getElementById("canvas-fg") as HTMLCanvasElement;
    // const apples = document.getElementById("canvas-apples") as HTMLCanvasElement;
    const action = document.getElementById("canvas-action") as HTMLCanvasElement;
    const keysLocks = document.getElementById("canvas-keys-locks") as HTMLCanvasElement;
    const dest = document.getElementById("canvas-bg") as HTMLCanvasElement;
    const sourceDimensions = [DIMENSIONS.x, DIMENSIONS.y] as const;
    const destinationDimensions = [DIMENSIONS.x, DIMENSIONS.y] as const;
    // await overlayOntoCanvas(mainCanvas, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(fg, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(keysLocks, dest, ...sourceDimensions, ...destinationDimensions);
    // await overlayOntoCanvas(apples, dest, ...sourceDimensions, ...destinationDimensions);
    await overlayOntoCanvas(action, dest, ...sourceDimensions, ...destinationDimensions);
    const img = await getCanvasImage(dest, `map-${Date.now()}.png`);
    downloadFile(img, `map-${sluggify(es.level.name)}.png`, 'img/png');
    renderer.invalidateStaticCache();
  }
  //#endregion save replay data

  //#region audio
  function playSound(sound: Sound, volume = 1, force = false) {
    if (state.isGameWon) return;
    if (!force && replay.mode === ReplayMode.Playback) return;
    sfx.play(sound, volume);
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
  //#endregion audio

  return {
    initGraphics,
    setLevel,
    setDifficulty,
    getLevel,
    getDifficulty,
    setStats: (incoming: BaseStats) => setStats(ctx, incoming),
    resetStats: () => resetStats(ctx),
    resetLevel,
    resetGraphics,
    renderLoop,
    startMoving: () => startMoving(ctx),
    requestPlayerRewind,
    startScreenShake,
    startLogicLoop,
    stopLogicLoop,
    clearBackground,
    changeMusicLowpass,
    playSound,
    fadeMusic,
    maybeSaveReplayStateToFile,
    onKeyPressed,
    onChangePlayerDirection,
  };
}
