import P5, { Element, Vector } from 'p5';

import {
  MAIN_TITLE_SCREEN_LEVEL,
  START_LEVEL,
  LEVELS,
  LEVEL_AFTER_WIN,
} from './levels';
import {
  RECORD_REPLAY_STATE,
  FRAMERATE,
  FRAME_DUR_MS,
  DIMENSIONS,
  GRIDCOUNT,
  MAX_LIVES,
  START_SNAKE_SIZE,
  NUM_APPLES_START,
  SCORE_INCREMENT,
  CLEAR_BONUS,
  LEVEL_BONUS,
  SPEED_LIMIT_EASY,
  SPEED_LIMIT_MEDIUM,
  SPEED_LIMIT_HARD,
  SPEED_LIMIT_ULTRA,
  SCREEN_SHAKE_DURATION_MS,
  SCREEN_SHAKE_MAGNITUDE_PX,
  HURT_STUN_TIME,
  HURT_FLASH_RATE,
  HURT_GRACE_TIME,
  DIFFICULTY_EASY,
  DEBUG_EASY_LEVEL_EXIT,
  DISABLE_TRANSITIONS,
  LIVES_LEFT_BONUS,
  PERFECT_BONUS,
  DEFAULT_PORTALS,
  ALL_APPLES_BONUS,
  HURT_MUSIC_DUCK_VOL,
  HURT_MUSIC_DUCK_TIME_MS,
  SPEED_INCREMENT_SPEED_MS,
  SPRINT_INCREMENT_SPEED_MS,
  ACCENT_COLOR,
  SPEED_LIMIT_ULTRA_SPRINT,
  MAX_SNAKE_SIZE,
  GLOBAL_LIGHT_DEFAULT,
  HURT_FORGIVENESS_TIME,
  BLOCK_SIZE,
  DIFFICULTY_ULTRA,
  DIFFICULTY_HARD,
  DIFFICULTY_MEDIUM,
} from './constants';
import {
  clamp,
  dirToUnitVector,
  getCoordIndex,
  getCoordIndex2,
  getDifficultyFromIndex,
  getRotationFromDirection,
  invertDirection,
  isOrthogonalDirection,
  isWithinBlockDistance,
  lerp,
  parseUrlQueryParams,
  removeArrayElement,
  shuffleArray,
} from './utils';
import {
  findLevelWarpIndex,
  getWarpLevelFromNum,
} from './levels/levelUtils';
import {
  DIR,
  HitType,
  Difficulty,
  GameState,
  IEnumerator,
  Level,
  PlayerState,
  Replay,
  ReplayMode,
  ScreenShakeState,
  Sound,
  Stats,
  Portal,
  PortalChannel,
  PortalExitMode,
  LoseMessage,
  MusicTrack,
  GameSettings,
  AppMode,
  TitleVariant,
  Image,
  Tutorial,
  ClickState,
  RecentMoves,
  RecentMoveTimings,
  Key,
  Lock,
  KeyChannel,
  LoopState,
  UINavDir,
  LevelType,
  GraphicalComponents,
} from './types';
import { MainTitleFader, UIBindings, UI, Modal } from './ui';
import { PALETTE } from './palettes';
import { Coroutines } from './coroutines';
import { Fonts } from './fonts';
import { quotes as allQuotes } from './quotes';
import { InputAction, InputCallbacks, handleKeyPressed, handleUIEvents, validateMove } from './controls';
import { buildSceneActionFactory } from './scenes/sceneUtils';
import { buildLevel } from './levels/levelBuilder';
import { QuoteScene } from './scenes/QuoteScene';
import { SFX } from './sfx';
import { replayClips } from './replayClips/replayClips';
import { WinLevelScene } from './scenes/WinLevelScene';
import { LOSE_MESSAGES } from './messages';
import { DrawSquareOptions, Renderer } from './renderer';
import { MusicPlayer } from './musicPlayer';
import { resumeAudioContext } from './audio';
import { Easing } from './easing';
import { OSTScene } from './scenes/OSTScene';
import { SpriteRenderer } from './spriteRenderer';
import { WinGameScene } from './scenes/WinGameScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { createLightmap, drawLighting, initLighting, resetLightmap, updateLighting } from './lighting';
import { Apples } from './collections/apples';
import { VectorList } from './collections/vectorList';
import { Particles } from './collections/particles';
import { Emitters } from './collections/emitters';
import { Gradients } from './collections/gradients';
import { AppleParticleSystem2 } from './particleSystems/AppleParticleSystem2';
import { ImpactParticleSystem2 } from './particleSystems/ImpactParticleSystem2';
import { PortalParticleSystem2 } from './particleSystems/PortalParticleSystem2';
import { PortalVortexParticleSystem2 } from './particleSystems/PortalVortexParticleSystem2';
import { GateUnlockParticleSystem2 } from './particleSystems/GateUnlockParticleSystem2';
import { SECRET_LEVEL_20 } from './levels/bonusLevels/secretLevel20';
import { SECRET_LEVEL_21 } from './levels/bonusLevels/secretLevel21';
import { VARIANT_LEVEL_10 } from './levels/bonusLevels/variantLevel10';

let level: Level = MAIN_TITLE_SCREEN_LEVEL;
let difficulty: Difficulty = { ...DIFFICULTY_EASY };

const queryParams = parseUrlQueryParams();
const settings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1,
  isScreenShakeDisabled: false,
}
const loopState: LoopState = {
  interval: null,
  timePrevMs: 0,
  timeAccumulatedMs: 0,
  deltaTime: 0,
}
const state: GameState = {
  appMode: AppMode.StartScreen,
  isPreloaded: false,
  isCasualModeEnabled: false,
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
  levelIndex: 0,
  timeElapsed: 0,
  timeSinceLastMove: Infinity,
  timeSinceLastTeleport: Infinity,
  timeSinceHurt: Infinity,
  timeSinceHurtForgiveness: Infinity,
  timeSinceLastInput: Infinity,
  hurtGraceTime: HURT_GRACE_TIME + (level.extraHurtGraceTime ?? 0),
  lives: MAX_LIVES,
  targetSpeed: 1,
  currentSpeed: 1,
  steps: 0,
  frameCount: 0,
  lastHurtBy: HitType.Unknown,
  hasKeyYellow: false,
  hasKeyRed: false,
  hasKeyBlue: false,
  nextLevel: null,
};
const stats: Stats = {
  numDeaths: 0,
  numLevelsCleared: 0,
  numLevelsEverCleared: 0,
  numPointsEverScored: 0,
  numApplesEverEaten: 0,
  score: 0,
  applesEaten: 0,
  applesEatenThisLevel: 0,
  totalTimeElapsed: 0,
}
const metrics = {
  gameLoopProcessingTime: 0,
}
const player: PlayerState = {
  position: null,
  direction: DIR.RIGHT,
  directionToFirstSegment: DIR.RIGHT,
  directionLastHit: DIR.RIGHT,
};
const screenShake: ScreenShakeState = {
  offset: new Vector(0, 0),
  timeSinceStarted: Infinity,
  timeSinceLastStep: Infinity,
  magnitude: 1,
  timeScale: 1,
};
const replay: Replay = {
  mode: ReplayMode.Disabled,
  levelIndex: state.levelIndex,
  levelName: level.name,
  difficulty: { ...difficulty },
  applesToSpawn: [],
  positions: {},
  timeCaptureStarted: 'no-date',
  shouldProceedToNextClip: false,
}
const tutorial: Tutorial = {
  needsMoveControls: false,
  needsRewindControls: false,
};
const clickState: ClickState = {
  x: 0,
  y: 0,
  didReceiveInput: false,
  directionToPoint: DIR.RIGHT,
}
const drawPlayerOptions: DrawSquareOptions = { is3d: true, optimize: true }
const drawAppleOptions: DrawSquareOptions = { size: 0.8, is3d: true, optimize: true }
const drawBasicOptions: DrawSquareOptions = { optimize: true }
const drawPortalOptions: DrawSquareOptions = {}

const loseMessages: Record<number, LoseMessage[]> = {}

let moves: DIR[] = []; // moves that the player has queued up
let recentMoves: RecentMoves = [null, null, null, null]; // most recent moves that the snake has performed
let recentInputs: RecentMoves = [null, null, null, null]; // most recent inputs that the player has performed
let recentInputTimes: RecentMoveTimings = [Infinity, Infinity, Infinity, Infinity]; // timing of the most recent inputs that the player has performed
// let segments: Vector[] = []; // snake segments
let barriers: Vector[] = []; // permanent structures that damage the snake
let doors: Vector[] = []; // like barriers, except that they disappear once the player has "cleared" a level (player must still exit the level though)
let decoratives1: Vector[] = []; // bg decorative elements
let decoratives2: Vector[] = []; // bg decorative elements
let keys: Key[] = []; // keys
let locks: Lock[] = []; // locks
let passablesMap: Record<number, boolean> = {};
let barriersMap: Record<number, boolean> = {};
let doorsMap: Record<number, boolean> = {};
// let segmentsMap: Record<number, boolean> = {};
let nospawnsMap: Record<number, boolean> = {}; // no-spawns are designated spots on the map where an apple cannot spawn
let keysMap: Record<number, Key> = {};
let locksMap: Record<number, Lock> = {};
let diffSelectMap: Record<number, number> = {};

const segments = new VectorList(); // snake segments
const apples = new Apples(); // food that the snake can eat to grow and score points
const lightMap = createLightmap();

let portals: Record<PortalChannel, Vector[]> = { ...DEFAULT_PORTALS() };
let portalsMap: Record<number, Portal> = {};

let uiElements: Element[] = [];

let quotes = allQuotes.slice();

enum Action {
  FadeMusic = 'FadeMusic',
  ExecuteQuotesMode = 'ExecuteQuotesMode',
  SetTitleVariant = 'SetTitleVariant',
  ChangeMusicLowpass = 'ChangeMusicLowpass',
  GameOver = 'GameOver',
}
type ActionKey = keyof typeof Action

export const sketch = (p5: P5) => {
  const coroutines = new Coroutines(p5);
  const startCoroutine = coroutines.start;
  const stopAllCoroutines = coroutines.stopAll;
  const waitForTime = coroutines.waitForTime;

  // actions are unique, singleton coroutines, meaning that only one coroutine of a type can run at a time
  const actions = new Coroutines(p5);
  const actionIds: Record<ActionKey, string | null> = {
    [Action.FadeMusic]: null,
    [Action.ExecuteQuotesMode]: null,
    [Action.SetTitleVariant]: null,
    [Action.ChangeMusicLowpass]: null,
    [Action.GameOver]: null,
  };
  const startAction = (enumerator: IEnumerator, actionKey: Action, force = false) => {
    if (!force && replay.mode === ReplayMode.Playback) {
      return;
    }
    actions.stop(actionIds[actionKey]);
    actions.start(enumerator);
    actionIds[actionKey] = actions.start(enumerator);
  }
  const stopAction = (actionKey: Action) => {
    actions.stop(actionIds[actionKey]);
    actionIds[actionKey] = null;
  }
  const clearAction = (actionKey: Action) => {
    actionIds[actionKey] = null;
  }

  // offscreen canvas for caching static game elements - see: https://p5js.org/reference/#/p5/createGraphics
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
  const appleParticleSystem = new AppleParticleSystem2(p5, level, emitters, gradients);
  const impactParticleSystem = new ImpactParticleSystem2(p5, level, emitters10, gradients);
  const portalParticleSystem = new PortalParticleSystem2(p5, emitters10, gradients);
  const portalVortexParticleSystem = new PortalVortexParticleSystem2(p5, emitters, gradients);
  const gateUnlockParticleSystem = new GateUnlockParticleSystem2(p5, emitters, gradients);

  const fonts = new Fonts(p5);
  const sfx = new SFX();
  const musicPlayer = new MusicPlayer(settings);
  const mainTitleFader = new MainTitleFader(p5);
  const winLevelScene = new WinLevelScene(p5, sfx, fonts, { onSceneEnded: gotoNextLevel });
  const onChangePlayerDirection: (direction: DIR) => void = (dir) => {
    if (validateMove(player.direction, dir)) {
      player.direction = dir;
      player.directionToFirstSegment = invertDirection(dir);
    }
  };
  const winGameScene = new WinGameScene({ p5, gameState: state, stats, sfx, fonts, onChangePlayerDirection, callbacks: { onSceneEnded: gotoNextLevel } })
  const leaderboardScene = new LeaderboardScene({ p5, sfx, fonts, callbacks: { onSceneEnded: hideLeaderboard } });
  const spriteRenderer = new SpriteRenderer({ p5, staticGraphics, screenShake });
  const renderer = new Renderer({ p5, staticGraphics, fonts, replay, gameState: state, screenShake, spriteRenderer, tutorial });
  const modal = new Modal();

  const uiBindings = new UIBindings(p5, sfx, state, settings, {
    onSetMusicVolume: (volume) => { settings.musicVolume = volume; },
    onSetSfxVolume: (volume) => { settings.sfxVolume = volume; },
    onToggleCasualMode: toggleCasualMode,
    onWarpToLevel: warpToLevel,
  }, handleInputAction);
  const inputCallbacks: InputCallbacks = {
    onWarpToLevel: warpToLevel,
    onAddMove: onAddMove,
    onUINavigate: onUINavigate,
  }

  function handleInputAction(action: InputAction) {
    switch (action) {
      case InputAction.HideStartScreen:
        hideStartScreen();
        break;
      case InputAction.ShowMainMenu:
        showMainMenu();
        break;
      case InputAction.ShowSettingsMenu:
        showSettingsMenu();
        break;
      case InputAction.HideSettingsMenu:
        UI.hideSettingsMenu();
        sfx.play(Sound.doorOpen);
        if (!state.isGameStarted) UI.showMainMenu();
        if (state.isPaused) uiBindings.onPause();
        break;
      case InputAction.ConfirmShowMainMenu:
        confirmShowMainMenu();
        break;
      case InputAction.RetryLevel:
        retryLevel();
        break;
      case InputAction.StartGame:
        startGame();
        break;
      case InputAction.ToggleCasualMode:
        toggleCasualMode();
        break;
      case InputAction.ToggleScreenshakeDisabled:
        toggleScreenshakeDisabled();
        break;
      case InputAction.ShowLeaderboard:
        showLeaderboard();
        break;
      case InputAction.EnterQuoteMode:
        enterQuoteMode();
        break;
      case InputAction.EnterOstMode:
        enterOstMode();
        break;
      case InputAction.ProceedToNextReplayClip:
        proceedToNextReplayClip();
        break;
      case InputAction.Pause:
        pause();
        break;
      case InputAction.UnPause:
        unpause();
        break;
      case InputAction.StartMoving:
        startMoving();
        break;
      case InputAction.StartRewinding:
        startRewinding();
        break;
    }
  }

  /**
   * https://p5js.org/reference/#/p5/preload
   */
  p5.preload = preload;
  function preload() {
    UI.setP5Instance(p5);
    fonts.load();
    sfx.load();
    musicPlayer.load(level.musicTrack);
    spriteRenderer.loadImages();
    initLighting(p5);
  }

  /**
   * https://p5js.org/reference/#/p5/setup
   */
  p5.setup = setup;
  function setup() {
    state.appMode = AppMode.StartScreen;
    state.isGameStarted = false;
    state.isGameStarting = false;
    level = MAIN_TITLE_SCREEN_LEVEL;
    UI.setP5Instance(p5);
    const canvas = document.getElementById("game-canvas");
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y, p5.P2D, canvas);
    p5.frameRate(FRAMERATE);
    initLevel(false);
    state.isPreloaded = true;
  }

  /**
   * https://p5js.org/reference/#/p5/draw
   * called by window.requestAnimationFrame
   */
  p5.draw = draw;
  function draw() {
    renderLoop();
  }

  /**
   * https://p5js.org/reference/#/p5/keyPressed
   */
  p5.keyPressed = keyPressed;
  function keyPressed(ev?: KeyboardEvent) {
    state.timeSinceLastInput = 0;
    resumeAudioContext();
    let handled = false;
    // check if can handle UI events
    if (!state.isGameStarting && state.appMode === AppMode.Game) {
      if (!handled && state.isGameWon) {
        handled = winGameScene.keyPressed();
      }
      if (!handled && (!state.isGameStarted || state.isPaused)) {
        handled = handleUIEvents(p5, onUINavigate, onUIInteract, onUICancel);
      }
    }
    if (handled) {
      ev?.preventDefault();
      return;
    }
    handleKeyPressed(
      p5,
      state,
      clickState,
      player.direction,
      moves,
      recentMoves,
      recentInputs,
      recentInputTimes,
      checkPlayerWillHit,
      inputCallbacks,
      handleInputAction,
      ev,
    );
  }

  function onUINavigate(navDir: UINavDir) {
    let handled = false;
    if (!handled) handled = modal.handleUINavigation(navDir);
    if (!handled) handled = uiBindings.handleUINavigation(navDir);
    if (handled) {
      sfx.play(Sound.uiBlip, 0.5);
    } else {
      sfx.play(Sound.hurt2, 0.4);
    }
    return handled;
  }

  function onUIInteract() {
    let handled = false;
    if (!handled) handled = modal.handleUIInteract();
    if (!handled) handled = uiBindings.handleUIInteract();
    return handled;
  }

  function onUICancel() {
    let handled = false;
    if (!handled) handled = modal.handleUICancel();
    if (!handled) handled = uiBindings.handleUICancel();
    return handled;
  }

  function toggleCasualMode(value?: boolean) {
    sfx.play(Sound.uiBlip);
    state.isCasualModeEnabled = value ?? !state.isCasualModeEnabled;
    if (state.isCasualModeEnabled) {
      UI.showMainCasualModeLabel();
    } else {
      UI.hideMainCasualModeLabel();
    }
    uiBindings.refreshFieldValues();
  }

  function toggleScreenshakeDisabled(value?: boolean) {
    sfx.play(Sound.uiBlip);
    settings.isScreenShakeDisabled = value ?? !settings.isScreenShakeDisabled;
    uiBindings.refreshFieldValues();
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

  function resetStats() {
    stats.numDeaths = 0;
    stats.numLevelsCleared = 0;
    stats.numLevelsEverCleared = 0;
    stats.numPointsEverScored = 0;
    stats.numApplesEverEaten = 0;
    stats.score = 0;
    stats.applesEaten = 0;
    stats.applesEatenThisLevel = 0;
    stats.totalTimeElapsed = 0;
  }

  function hideStartScreen() {
    if (!state.isPreloaded) return;
    showMainMenu();
    UI.hideStartScreen();
    sfx.play(Sound.doorOpen);
  }

  function showMainMenu() {
    if (!state.isPreloaded) return;

    state.appMode = AppMode.Game;
    state.isGameStarted = false;
    state.isGameStarting = false;
    level = MAIN_TITLE_SCREEN_LEVEL;

    musicPlayer.stopAllTracks();
    musicPlayer.setVolume(1);
    setLevelIndexFromCurrentLevel();
    initLevel(false);
    stopAllCoroutines();
    actions.stopAll();
    startReplay();
    startLogicLoop();
    winLevelScene.reset();
    winGameScene.reset();
    resumeAudioContext().then(() => {
      musicPlayer.play(MAIN_TITLE_SCREEN_LEVEL.musicTrack);
    });

    resetStats();
    tutorial.needsMoveControls = true;
    tutorial.needsRewindControls = true;

    UI.enableScreenScroll();
    showMainMenuUI();
    hydrateLoseMessages(-1);
  }

  function showMainMenuUI() {
    UI.clearLabels();
    UI.drawDarkOverlay(uiElements);
    UI.showTitle();
    if (state.isCasualModeEnabled) {
      UI.showMainCasualModeLabel();
    }
    UI.showMainMenu();
    UI.hideSettingsMenu();
    uiBindings.refreshFieldValues();
    modal.hide();
  }

  function showLeaderboard() {
    UI.clearLabels();
    clearUI(true);
    modal.hide();
    state.appMode = AppMode.Leaderboard;
    leaderboardScene.trigger();
    setTimeout(() => {
      startScreenShake(3, 0.5, 1, true)
    }, 600)
  }

  function hideLeaderboard() {
    state.appMode = AppMode.Game;
    playSound(Sound.unlock, 1, true);
    showMainMenuUI();
  }

  function startGame() {
    if (!state.isPreloaded) return;
    if (state.isGameStarting) return;
    state.isGameStarting = true;
    resetStats();
    UI.disableScreenScroll();
    setTimeout(() => {
      musicPlayer.stopAllTracks();
    }, 0)
    playSound(Sound.uiConfirm, 1, true);
    startCoroutine(startGameRoutine());
  }

  function* startGameRoutine(): IEnumerator {
    if (!DISABLE_TRANSITIONS) {
      yield* waitForTime(1000, (t) => {
        const freq = .2;
        const shouldShow = t % freq > freq * 0.5;
        uiBindings.setStartButtonVisibility(shouldShow);
      });
    } else {
      yield null;
    }
    stopReplay();
    level = START_LEVEL;
    difficulty = { ...DIFFICULTY_EASY };

    // TODO: REVERT
    // TODO: REVERT
    // TODO: REVERT
    // TODO: REVERT
    // TODO: REVERT
    // TODO: REVERT
    // level = VARIANT_LEVEL_10;
    // difficulty = { ...DIFFICULTY_MEDIUM };
    // difficulty = { ...DIFFICULTY_HARD };
    // difficulty = { ...DIFFICULTY_ULTRA };

    setLevelIndexFromCurrentLevel();
    initLevel()
    playSound(Sound.unlock);
    state.isGameStarting = false;
    state.isGameStarted = true;
    replay.difficulty = { ...difficulty };
  }

  function playSound(sound: Sound, volume = 1, force = false) {
    if (state.isGameWon) return;
    if (!force && replay.mode === ReplayMode.Playback) return;
    sfx.play(sound, volume);
  }

  function clearUI(force = false) {
    if (!force && replay.mode === ReplayMode.Playback) return;
    uiElements.forEach(element => element.remove())
    uiElements = [];
    UI.hideTitle();
    UI.hideMainCasualModeLabel();
    UI.hideMainMenu();
  }

  function showSettingsMenu() {
    UI.showSettingsMenu(state.isGameStarted);
    uiBindings.refreshFieldValues();
    playSound(Sound.unlock, 1, true);
  }

  function renderDifficultyUI() {
    if (level === START_LEVEL) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderDifficulty(difficulty.index, state.isShowingDeathColours, state.isCasualModeEnabled);
  }

  function renderHeartsUI() {
    if (level === START_LEVEL) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.isCasualModeEnabled) {
      UI.renderCasualRewindTip();
    } else {
      UI.renderHearts(state.lives, state.isShowingDeathColours);
    }
  }

  function renderScoreUI(score = stats.score) {
    if (level === START_LEVEL) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.isCasualModeEnabled) return;
    UI.renderScore(score, state.isShowingDeathColours);
  }

  function renderLevelName() {
    if (level === START_LEVEL) return;
    if (level.type === LevelType.Maze) return;
    if (level.type === LevelType.WarpZone) return;
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    const progress = clamp(stats.applesEatenThisLevel / (level.applesToClear * (level.applesModOverride || difficulty.applesMod)), 0, 1);
    UI.renderLevelName(level.name, state.isShowingDeathColours, progress);
  }

  function startMoving() {
    if (state.isMoving) return;
    state.isMoving = true;
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
    tutorial.needsRewindControls = false;
    state.currentSpeed = 1;
    sfx.playLoop(Sound.rewindLoop);
  }

  function stopRewinding() {
    state.isRewinding = false;
    sfx.stop(Sound.rewindLoop);
  }

  function canRewind(): boolean {
    if (!state.isCasualModeEnabled) return false;
    if (state.isLost) return false;
    if (state.isGameWon) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (calculateSnakeSize() <= START_SNAKE_SIZE + 1) return false;
    return true;
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

  function retryLevel() {
    initLevel(false);
  }

  function initLevel(shouldShowTransitions = true) {
    if (DISABLE_TRANSITIONS) {
      shouldShowTransitions = false;
    }
    if (replay.mode === ReplayMode.Playback) {
      shouldShowTransitions = false;
    } else {
      stopAllCoroutines();
      replay.mode = RECORD_REPLAY_STATE ? ReplayMode.Capture : ReplayMode.Disabled;
      replay.timeCaptureStarted = (new Date()).toISOString();
      replay.levelIndex = state.levelIndex;
      replay.levelName = level.name;
      replay.difficulty = { ...difficulty };
      replay.applesToSpawn = [];
      replay.positions = {};
    }

    // init stats
    stats.applesEatenThisLevel = 0;

    // init state for new level
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
    state.timeElapsed = 0;
    state.timeSinceLastMove = Infinity;
    state.timeSinceLastTeleport = Infinity;
    state.timeSinceHurt = Infinity;
    state.timeSinceHurtForgiveness = Infinity;
    state.hurtGraceTime = HURT_GRACE_TIME + (level.extraHurtGraceTime ?? 0);
    state.lives = MAX_LIVES;
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
    state.lastHurtBy = HitType.Unknown;
    state.hasKeyYellow = false;
    state.hasKeyRed = false;
    state.hasKeyBlue = false;
    state.nextLevel = null;
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
    nospawnsMap = {};
    portals = { ...DEFAULT_PORTALS() };
    portalsMap = {};
    keysMap = {};
    apples.reset();
    segments.reset();
    emitters.reset();
    emitters10.reset();
    particles.reset();
    particles10.reset();

    renderer.reset();
    cacheGraphicalComponents();
    appleParticleSystem.setColorsFromLevel(level);
    UI.disableScreenScroll();
    UI.clearLabels();
    clearUI();
    modal.hide();
    winLevelScene.reset();
    winGameScene.reset();
    stopAction(Action.ChangeMusicLowpass);
    stopAction(Action.FadeMusic);
    stopAction(Action.GameOver);
    startAction(fadeMusic(1, 100), Action.FadeMusic);
    sfx.setGlobalVolume(settings.sfxVolume);

    if (shouldShowTransitions) {
      stopLogicLoop();
      actions.stopAll();
      musicPlayer.load(level.musicTrack);
      musicPlayer.setVolume(1);
      const buildSceneAction = buildSceneActionFactory(p5, sfx, fonts, state);
      Promise.resolve()
        .then(buildSceneAction(level.titleScene))
        .catch(err => {
          console.error(err);
        }).finally(() => {
          if (level.isWinGame) {
            winGameScene.trigger();
            state.isGameWon = true;
            state.isMoving = true;
          }
          renderDifficultyUI();
          renderHeartsUI();
          renderScoreUI();
          renderLevelName();
          musicPlayer.stopAllTracks();
          musicPlayer.play(level.musicTrack);
          startLogicLoop();
        })
    } else {
      if (replay.mode !== ReplayMode.Playback && (state.isGameStarted || state.isGameStarting)) {
        if (DISABLE_TRANSITIONS) musicPlayer.stopAllTracks();
        musicPlayer.play(level.musicTrack);
        startLogicLoop();
      }
      renderDifficultyUI();
      renderHeartsUI();
      renderScoreUI();
      renderLevelName();
    }

    if (!state.isGameStarted && replay.mode === ReplayMode.Playback) {
      startAction(mainTitleFader.setTitleVariant(level.titleVariant ?? TitleVariant.GrayBlue), Action.SetTitleVariant, true);
    }

    const levelData = buildLevel({ p5, level, difficulty });
    player.position = levelData.playerSpawnPosition;
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

    // create snake parts
    let x = player.position.x;
    for (let i = 0; i < (level.snakeStartSizeOverride || START_SNAKE_SIZE); i++) {
      if (i < 3) x--;
      const segment = p5.createVector(x, player.position.y);
      segments.addVec(segment);
    }

    // add initial apples
    for (let i = 0; i < levelData.apples.length; i++) {
      apples.add(levelData.apples[i].x, levelData.apples[i].y);
    }
    const numApplesStart = level.numApplesStart ?? NUM_APPLES_START;
    for (let i = 0; i < numApplesStart; i++) {
      addApple();
    }

    resetLightmap(lightMap, level.globalLight ?? GLOBAL_LIGHT_DEFAULT);
    startPortalParticles();
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
      loopState.deltaTime = loopState.timeAccumulatedMs;
      loopState.timeAccumulatedMs = 0;
    }

    if (p5.keyIsDown(p5.SHIFT) && (state.isMoving || state.isRewinding)) {
      state.isSprinting = true;
    } else {
      state.isSprinting = false;
    }

    if (state.isPaused) return;
    if (!state.isGameStarted && replay.mode !== ReplayMode.Playback) return;

    handleHurtForgiveness();

    if (state.isLost) return;

    for (let i = 0; i < segments.length; i++) {
      if (state.isLost || state.isExitingLevel) continue;
      const coord = getCoordIndex(segments.get(i));
      const appleFound = apples.existsAtCoord(coord) ? coord : -1;
      if (appleFound != undefined && appleFound >= 0) {
        spawnAppleParticles(segments.get(i));
        growSnake(appleFound);
        incrementScore();
      }
    }

    // check if head has reached an apple
    const coord = getCoordIndex(player.position);
    const appleFound = apples.existsAtCoord(coord) ? coord : -1;
    if (appleFound != undefined && appleFound >= 0) {
      spawnAppleParticles(player.position);
      growSnake(appleFound);
      incrementScore();
      increaseSpeed();
      playSound(Sound.eat);
      if (!state.isDoorsOpen) renderLevelName();
    }

    handlePortalTravel();
    handleKeyPickup();
    handleUnlock();
    handleDifficultySelect();
    handleSetNextLevel();

    const didHit = checkHasHit(player.position);
    if (didHit) player.directionLastHit = player.direction;
    state.isLost = didHit;
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
    state.timeSinceLastInput += loopState.deltaTime;
    state.timeSinceLastTeleport += loopState.deltaTime;
    state.frameCount += 1;
    for (let i = recentInputTimes.length - 1; i >= 0; i--) {
      recentInputTimes[i] += loopState.deltaTime;
    }
  }

  function renderLoop() {
    const timeFrameStart = performance.now();

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

    drawParticles(0);
    drawBarriers();
    drawDoors();

    for (let i = 0; i < keys.length; i++) {
      drawKey(keys[i])
    }

    for (let i = 0; i < locks.length; i++) {
      drawLock(locks[i])
    }

    renderer.drawStaticGraphics();
    drawPortals();

    renderer.drawCaptureMode();

    for (let i = 0; i < GRIDCOUNT.x * GRIDCOUNT.y; i++) {
      if (apples.existsAtCoord(i)) {
        const x = Math.floor(i % GRIDCOUNT.x);
        const y = Math.floor(i / GRIDCOUNT.x);
        drawApple(x, y);
      }
    }

    renderer.drawPlayerMoveArrows(player.position, moves.length > 0 ? moves[0] : player.direction);

    for (let i = 0; i < segments.length; i++) {
      drawPlayerSegment(segments.get(i));
    }

    const globalLight = level.globalLight ?? GLOBAL_LIGHT_DEFAULT;

    drawPlayerHead(player.position);
    drawPassableBarriers();
    drawParticles(10);

    if (state.isGameStarted && replay.mode !== ReplayMode.Playback && globalLight < 1 && !state.isShowingDeathColours) {
      updateLighting(lightMap, globalLight, player.position, portals);
      drawLighting(lightMap, renderer);
    }


    if (level === START_LEVEL) renderer.drawDifficultySelect(state.isShowingDeathColours ? PALETTE.deathInvert.background : level.colors.background);
    renderer.drawUIKeys();
    renderer.drawTutorialMoveControls();
    renderer.drawTutorialRewindControls(player.position, canRewind);
    renderer.drawFps(queryParams.showFps, metrics.gameLoopProcessingTime);
    if (!state.isGameStarted) leaderboardScene.draw();

    if (state.isLost) return;
    if (!state.isGameStarted && replay.mode !== ReplayMode.Playback) return;

    // tick time elapsed
    if (state.isMoving || replay.mode === ReplayMode.Playback) {
      state.timeElapsed += p5.deltaTime;
    }

    handleSnakeExitLevelUI();
    handleRenderWinGameScene();

    renderer.tick();
    metrics.gameLoopProcessingTime = performance.now() - timeFrameStart;
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
    if (difficulty.index === 4) {
      if (state.isSprinting) return difficulty.sprintLimit;
      if (state.currentSpeed <= 1) return SPEED_LIMIT_EASY;
      if (state.currentSpeed <= 2) return p5.lerp(SPEED_LIMIT_EASY, SPEED_LIMIT_MEDIUM, state.currentSpeed - 1);
      if (state.currentSpeed <= 3) return p5.lerp(SPEED_LIMIT_MEDIUM, SPEED_LIMIT_HARD, state.currentSpeed - 2);
      if (state.currentSpeed <= 4) return p5.lerp(SPEED_LIMIT_HARD, SPEED_LIMIT_ULTRA, state.currentSpeed - 3);
      return SPEED_LIMIT_ULTRA;
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

  function spawnAppleParticles(position: Vector) {
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
  }

  function updateScreenShake() {
    if (settings.isScreenShakeDisabled) {
      screenShake.offset.x = 0;
      screenShake.offset.y = 0;
      screenShake.magnitude = 1;
      screenShake.timeScale = 1;
      return;
    }
    screenShake.timeSinceStarted += p5.deltaTime;
    screenShake.timeSinceLastStep += p5.deltaTime * screenShake.timeScale;
    if (screenShake.offset == null) screenShake.offset = p5.createVector(0, 0);
    if (screenShake.timeSinceStarted < SCREEN_SHAKE_DURATION_MS) {
      if (screenShake.timeSinceLastStep >= 25) {
        screenShake.offset.x = (p5.random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
        screenShake.offset.y = (p5.random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
        screenShake.timeSinceLastStep = 0;
        renderer.invalidateStaticCache();
      }
    } else {
      if (screenShake.offset.x !== 0 || screenShake.offset.y !== 0) {
        renderer.invalidateStaticCache();
      }
      screenShake.offset.x = 0;
      screenShake.offset.y = 0;
      screenShake.magnitude = 1;
      screenShake.timeScale = 1;
    }
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
      vec.x > GRIDCOUNT.x - 1 ||
      vec.x < 0 ||
      vec.y > GRIDCOUNT.y - 1 ||
      vec.y < 0
    );
  }

  function checkHasHit(vec: Vector) {
    if (state.isExitingLevel) return false;
    if (state.isExited) return false;
    if (state.isGameWon) return false;

    if (segments.containsCoord(getCoordIndex(vec))) {
      state.lastHurtBy = HitType.HitSelf;
      return true;
    }

    if (level.disableWallCollision) return false;

    if (doorsMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitDoor;
      return true;
    }

    const isPassableBarrier = state.isDoorsOpen && passablesMap[getCoordIndex(vec)];
    if (!isPassableBarrier && barriersMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitBarrier;
      return true;
    }

    if (locksMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitLock;
      return true;
    }

    return false;
  }

  function checkPlayerWillHit(dir: DIR, numMoves = 1): boolean {
    const pos = player.position.copy();
    const currentMove = dirToUnitVector(p5, dir);
    for (let i = 0; i < numMoves; i++) {
      const futurePosition = pos.add(currentMove);
      const willHit = checkHasHit(futurePosition) || checkPortalTeleportWillHit(futurePosition, dir);
      if (willHit) return true;
    }
    return false;
  }

  function checkPortalTeleportWillHit(position: Vector, dir: DIR): boolean {
    const portal = portalsMap[getCoordIndex(position)];
    if (!portal) return false;
    if (!portal.link) return false;
    const newDir = (level.portalExitConfig?.[portal.channel] || portal.exitMode) === PortalExitMode.InvertDirection
      ? invertDirection(dir)
      : dir;
    return checkHasHit(portal.link.copy().add(dirToUnitVector(p5, newDir)));
  }

  function handlePortalTravel() {
    const portal = portalsMap[getCoordIndex(player.position)];
    if (!portal) return;
    if (!portal.link) {
      console.warn(`portal has no link: channel=${portal.channel},(${portal.position.x},${portal.position.y})`);
      return;
    }
    playSound(Sound.warp);
    switch (level.portalExitConfig?.[portal.channel] || portal.exitMode) {
      case PortalExitMode.InvertDirection:
        player.direction = invertDirection(player.direction);
        player.directionToFirstSegment = invertDirection(player.direction);
        break;
      case PortalExitMode.SameDirection:
        break;
    }
    state.timeSinceLastMove = 0;
    state.timeSinceLastTeleport = 0;
    player.position.set(portal.link);
    player.position.add(dirToUnitVector(p5, player.direction));
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
    renderer.invalidateStaticCache();
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
      dirToUnitVector(p5, DIR.LEFT),
      dirToUnitVector(p5, DIR.RIGHT),
      dirToUnitVector(p5, DIR.UP),
      dirToUnitVector(p5, DIR.DOWN),
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
    renderer.invalidateStaticCache();
  }

  function handleDifficultySelect() {
    if (level !== START_LEVEL) return;
    const index = getCoordIndex(player.position);
    const difficultyIndex = diffSelectMap[index];
    if (difficultyIndex === undefined) return;
    difficulty = getDifficultyFromIndex(difficultyIndex);
  }

  function handleSetNextLevel() {
    if (!level.nextLevelMap) return;
    const nextLevel = level.nextLevelMap[getCoordIndex(player.position)];
    if (!nextLevel) return;
    state.nextLevel = nextLevel;
  }

  function handleSnakeMovement() {
    if (!state.isMoving) return;
    if (replay.mode === ReplayMode.Playback) return;

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
    stats.totalTimeElapsed += loopState.deltaTime;
    return didMove;
  }

  function movePlayer(normalizedSpeed = 0): boolean {
    if (!state.isMoving) return false;
    if (state.isExited) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    state.timeSinceLastMove = 0;
    const prevDirection = player.direction;
    if (moves.length > 0 && !state.isExitingLevel) {
      const move = moves.shift();
      if (move !== player.directionToFirstSegment) player.direction = move;
    }
    const currentMove = dirToUnitVector(p5, player.direction);
    const futurePosition = player.position.copy().add(currentMove);

    // disallow snake moving backwards into itself
    if (segments.length > 0 && futurePosition.equals(segments.get(0).x, segments.get(0).y)) {
      player.direction = player.direction === prevDirection ? getDirectionSnakeForward() : prevDirection;
      return false;
    }

    // determine if next move will be into something, allow for grace period before injuring snakey
    const willHitSomething = checkHasHit(futurePosition) || checkPortalTeleportWillHit(futurePosition, player.direction);
    if (willHitSomething && state.hurtGraceTime > 0) {
      state.hurtGraceTime -= loopState.deltaTime;
      return false;
    }

    // apply movement
    moveSegments();
    player.position.add(currentMove);
    state.hurtGraceTime = HURT_GRACE_TIME + (level.extraHurtGraceTime ?? 0);

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
    if (replay.mode !== ReplayMode.Disabled) return;

    const timeNeededUntilNextMove = getTimeNeededUntilNextMove();
    if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      rewindPlayer();
    } else {
      state.timeSinceLastMove += loopState.deltaTime;
    }
    updateCurrentMoveSpeed();
  }

  function rewindPlayer() {
    if (!state.isRewinding) return;
    if (state.isExited) return;
    if (!canRewind()) {
      stopRewinding();
      return;
    }
    state.timeSinceLastMove = 0;
    reboundSnake(1);
    player.direction = getDirectionSnakeForward();
    player.directionToFirstSegment = invertDirection(player.direction);
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
  }

  function handleCaptureReplayInfo(didMove: boolean, didHit: boolean) {
    if (state.isCasualModeEnabled) return;
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

    state.isExitingLevel = true;
    winLevelScene.reset(level === START_LEVEL ? 'GET PSYCHED!' : 'SNEK CLEAR!');
    if (replay.mode !== ReplayMode.Playback) {
      startAction(fadeMusic(0, 1000), Action.FadeMusic);
      if (level === START_LEVEL) {
        playSound(Sound.doorOpenHuge);
      } else {
        playSound(Sound.winLevel);
      }
    }
  }

  function handleSnakeExitLevelMoveTick(didMove: boolean) {
    if (!didMove) return;
    if (!state.isExitingLevel) return;
    if (state.isExited) return;
    if (level === START_LEVEL) return;
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
    } else if (level === START_LEVEL) {
      gotoNextLevel();
    } else if (level.type === LevelType.Maze) {
      gotoNextLevel();
    } else if (level.type === LevelType.WarpZone) {
      gotoNextLevel();
    } else {
      const isPerfect = apples.length === 0 && state.lives === 3;
      const hasAllApples = apples.length === 0;
      winLevelScene.triggerLevelExit({
        score: stats.score,
        levelClearBonus: getLevelClearBonus(),
        livesLeftBonus: getLivesLeftBonus(),
        allApplesBonus: getAllApplesBonus(),
        perfectBonus: getPerfectBonus(),
        livesLeft: state.lives,
        isPerfect,
        hasAllApples,
        isCasualModeEnabled: state.isCasualModeEnabled,
        onApplyScore: () => {
          musicPlayer.stopAllTracks();
          const perfectBonus = isPerfect ? getPerfectBonus() : 0;
          const allApplesBonus = (!isPerfect && hasAllApples) ? getAllApplesBonus() : 0;
          addPoints(getLevelClearBonus() + getLivesLeftBonus() * state.lives + perfectBonus + allApplesBonus);
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
        x: GRIDCOUNT.x + WIN_SCREEN_TELEPORT_PADDING,
        y: GRIDCOUNT.y + WIN_SCREEN_TELEPORT_PADDING,
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

  function handleRenderWinGameScene() {
    if (!state.isGameWon) return;
    winGameScene.draw();
  }

  function handleHurtForgiveness() {
    if (state.timeSinceHurtForgiveness < HURT_STUN_TIME * 2) return;
    if (state.timeSinceHurt >= HURT_FORGIVENESS_TIME) return;
    if (state.isGameWon) return;
    if (state.isCasualModeEnabled) return;
    if (!state.isGameStarted) return;
    if (!state.isMoving) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (moves.length <= 0) return;
    if (segments.length <= 0) return;

    const isGameOver = state.isLost && state.lives === 0;
    const move = moves.shift();
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

    const currentMove = dirToUnitVector(p5, move);
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
    }
    player.direction = move;
    player.directionToFirstSegment = getDirectionSnakeBackward();
    state.isLost = false;
    state.timeSinceHurt = Infinity;
    state.timeSinceHurtForgiveness = 0;
    sfx.stop(Sound.death);
    playSound(Sound.hurtSave);
    renderHeartsUI();
    stopAction(Action.GameOver);
  }

  function handleSnakeDamage(didReceiveDamage: boolean) {
    // const didReceiveDamage = state.isLost && state.lives > 0;
    if (!didReceiveDamage) return;

    state.isLost = false;
    if (state.isCasualModeEnabled && replay.mode !== ReplayMode.Playback) {
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
    startScreenShake();
    renderHeartsUI();
    spawnHurtParticles();
    reboundSnake(segments.length > 3 ? 2 : 1);
    // set current direction to be the direction from the first segment towards the snake head
    player.direction = getDirectionSnakeForward();
    player.directionToFirstSegment = invertDirection(player.direction);
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

  function getDirectionBetween(from: Vector, to: Vector) {
    if (!from || !to) return DIR.RIGHT;
    const diffX = clamp(from.x - to.x, -1, 1);
    const diffY = clamp(from.y - to.y, -1, 1);
    if (diffX === -1) return DIR.LEFT;
    if (diffX === 1) return DIR.RIGHT;
    if (diffY === -1) return DIR.UP;
    if (diffY === 1) return DIR.DOWN;
    return DIR.RIGHT;
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
    if (state.isLost) return;
    if (appleCoord < 0) return;
    startScreenShake(0.4, 0.8);
    apples.removeByCoord(appleCoord);
    const numSegmentsToAdd = Math.max(
      (difficulty.index - Math.floor(segments.length / 100)) * (level.growthMod ?? 1),
      1
    );
    if (segments.length < MAX_SNAKE_SIZE) {
      for (let i = 0; i < numSegmentsToAdd; i++) {
        addSnakeSegment();
      }
    }
    if (!state.isDoorsOpen) {
      addApple();
    }
  }

  function addPoints(points: number) {
    if (state.isGameWon) return;
    if (state.isCasualModeEnabled) return;
    if (level === START_LEVEL) return;
    stats.score += points;
    stats.numPointsEverScored += points;
  }

  function getLevelClearBonus() {
    return LEVEL_BONUS * difficulty.bonusMod;
  }

  function getLivesLeftBonus() {
    return LIVES_LEFT_BONUS * difficulty.bonusMod;
  }

  function getAllApplesBonus() {
    return ALL_APPLES_BONUS * difficulty.bonusMod;
  }

  function getPerfectBonus() {
    return PERFECT_BONUS * difficulty.bonusMod;
  }

  function incrementScore() {
    if (state.isGameWon) return;
    let bonus = 0;
    if (state.isDoorsOpen) {
      bonus = CLEAR_BONUS * difficulty.scoreMod;
    }
    const points = SCORE_INCREMENT * difficulty.scoreMod + bonus
    stats.applesEaten += 1;
    stats.applesEatenThisLevel += 1;
    stats.numApplesEverEaten += 1;
    addPoints(points);
    renderScoreUI();
  }

  function incrementScoreWhileExitingLevel() {
    if (state.isGameWon) return;
    const points = SCORE_INCREMENT;
    addPoints(points);
  }

  function increaseSpeed() {
    if (state.isLost) return;
    state.targetSpeed += 1;
    if (level.appleSlowdownMod && !state.isSprinting) {
      state.currentSpeed = Math.min(difficulty.speedSteps * level.appleSlowdownMod, state.currentSpeed);
    }
  }

  function addApple(numTries = 0) {
    if (level.disableAppleSpawn) return;
    if (replay.mode === ReplayMode.Playback) {
      addAppleReplayMode();
      return;
    }
    const x = Math.floor(p5.random(GRIDCOUNT.x - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT.y - 2)) + 1;
    const spawnedInsideOfSomething = barriersMap[getCoordIndex2(x, y)]
      || doorsMap[getCoordIndex2(x, y)]
      || nospawnsMap[getCoordIndex2(x, y)];
    if (spawnedInsideOfSomething) {
      if (numTries < 30) addApple(numTries + 1);
    } else {
      apples.add(x, y);
      if (replay.mode === ReplayMode.Capture) {
        replay.applesToSpawn.push([x, y]);
      }
    }
  }

  function addAppleReplayMode() {
    const appleToSpawn = replay.applesToSpawn.shift();
    if (appleToSpawn) {
      apples.add(appleToSpawn[0], appleToSpawn[1]);
    } else {
      // likely ran out of apples to spawn due to changes to level settings since time of clip recording, e.g. applesToClear; just open the doors as a quickfix
      openDoors();
    }
  }

  function addSnakeSegment() {
    segments.addVec(segments.get(segments.length - 1));
  }

  function cacheGraphicalComponents() {
    renderer.clearGraphicalComponent(graphicalComponents.barrier);
    renderer.drawSquareCustom(graphicalComponents.barrier, 1, 1, level.colors.barrier, level.colors.barrierStroke, drawBasicOptions);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'light', level.colors.barrierBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrier, 1, 1, 'dark', level.colors.barrierBorderDark, true);
    renderer.drawXCustom(graphicalComponents.barrier, 1, 1, level.colors.barrierStroke);

    renderer.clearGraphicalComponent(graphicalComponents.barrierPassable);
    renderer.drawSquareCustom(graphicalComponents.barrierPassable, 1, 1, level.colors.passableStroke, level.colors.passableStroke, drawBasicOptions);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 1, 1, 'light', level.colors.passableBorderLight, true);
    renderer.drawSquareBorderCustom(graphicalComponents.barrierPassable, 1, 1, 'dark', level.colors.passableBorderDark, true);

    renderer.clearGraphicalComponent(graphicalComponents.door);
    renderer.drawSquareCustom(graphicalComponents.door, 1, 1, level.colors.door, level.colors.doorStroke, drawBasicOptions);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 1, 1, 'light', level.colors.doorStroke, false);
    renderer.drawSquareBorderCustom(graphicalComponents.door, 1, 1, 'dark', level.colors.doorStroke, false);

    renderer.clearGraphicalComponent(graphicalComponents.snakeHead);
    renderer.drawSquareCustom(graphicalComponents.snakeHead, 1, 1, level.colors.playerHead, level.colors.playerHead, drawPlayerOptions);

    renderer.clearGraphicalComponent(graphicalComponents.snakeSegment);
    renderer.drawSquareCustom(graphicalComponents.snakeSegment, 1, 1, level.colors.playerTail, level.colors.playerTailStroke, drawPlayerOptions);

    renderer.clearGraphicalComponent(graphicalComponents.apple);
    renderer.drawSquareCustom(graphicalComponents.apple, 1, 1, level.colors.apple, level.colors.appleStroke, drawAppleOptions);

    renderer.clearGraphicalComponent(graphicalComponents.deco1);
    renderer.drawSquareCustom(graphicalComponents.deco1, 1, 1, level.colors.deco1, level.colors.deco1Stroke, drawBasicOptions);

    renderer.clearGraphicalComponent(graphicalComponents.deco2);
    renderer.drawSquareCustom(graphicalComponents.deco2, 1, 1, level.colors.deco2, level.colors.deco2Stroke, drawBasicOptions);
  }

  function drawBackground() {
    renderer.drawBackground(state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : level.colors.background);
  }

  function drawPlayerHead(vec: Vector) {
    if (state.isShowingDeathColours) {
      renderer.drawSquare(vec.x, vec.y,
        PALETTE.deathInvert.playerHead,
        PALETTE.deathInvert.playerHead,
        drawPlayerOptions);
    } else {
      renderer.drawGraphicalComponent(graphicalComponents.snakeHead, vec.x, vec.y);
    }
    const direction = (!state.isLost && moves.length > 0) ? moves[0] : player.direction;
    if (state.isLost) {
      spriteRenderer.drawImage3x3(Image.SnekHeadDead, vec.x, vec.y, getRotationFromDirection(direction));
    } else {
      spriteRenderer.drawImage3x3(Image.SnekHead, vec.x, vec.y, getRotationFromDirection(direction));
    }
  }

  function drawPlayerSegment(vec: Vector) {
    if (state.timeSinceHurt < HURT_STUN_TIME) {
      if (Math.floor(state.timeSinceHurt / HURT_FLASH_RATE) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", drawPlayerOptions);
      } else {
        renderer.drawSquare(vec.x, vec.y, "#fff", "#fff", drawPlayerOptions);
      }
    } else {
      if (state.isShowingDeathColours) {
        renderer.drawSquare(vec.x, vec.y,
          PALETTE.deathInvert.playerTail,
          PALETTE.deathInvert.playerTailStroke,
          drawPlayerOptions);
      } else {
        renderer.drawGraphicalComponent(graphicalComponents.snakeSegment, vec.x, vec.y);
      }
    }
  }

  function drawApple(x: number, y: number) {
    if (state.isShowingDeathColours && replay.mode !== ReplayMode.Playback) {
      renderer.drawSquare(x, y,
        PALETTE.deathInvert.apple,
        PALETTE.deathInvert.appleStroke,
        drawAppleOptions);
    } else {
      renderer.drawGraphicalComponent(graphicalComponents.apple, x, y);
    }
  }

  function drawBarriers() {
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < barriers.length; i++) {
        if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i])]) continue;
        renderer.drawGraphicalComponentStatic(graphicalComponents.barrier, barriers[i].x, barriers[i].y);
      }
      return;
    }

    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i])]) continue;
      renderer.drawSquareStatic(barriers[i].x, barriers[i].y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptions);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i])]) continue;
      renderer.drawSquareBorderStatic(barriers[i].x, barriers[i].y, 'light', PALETTE.deathInvert.barrierStroke, false);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i])]) continue;
      renderer.drawSquareBorderStatic(barriers[i].x, barriers[i].y, 'dark', PALETTE.deathInvert.barrierStroke, false);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (state.isDoorsOpen && passablesMap[getCoordIndex(barriers[i])]) continue;
      renderer.drawXStatic(barriers[i].x, barriers[i].y, PALETTE.deathInvert.barrierStroke);
    }
  }

  function drawPassableBarriers() {
    if (!state.isDoorsOpen) return;
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < barriers.length; i++) {
        if (!passablesMap[getCoordIndex(barriers[i])]) continue;
        renderer.drawGraphicalComponent(graphicalComponents.barrierPassable, barriers[i].x, barriers[i].y);
      }
      return;
    }
    for (let i = 0; i < barriers.length; i++) {
      if (!passablesMap[getCoordIndex(barriers[i])]) continue;
      renderer.drawSquare(barriers[i].x, barriers[i].y, PALETTE.deathInvert.barrier, PALETTE.deathInvert.barrierStroke, drawBasicOptions);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (!passablesMap[getCoordIndex(barriers[i])]) continue;
      renderer.drawSquareBorder(barriers[i].x, barriers[i].y, 'light', PALETTE.deathInvert.barrierStroke, true);
    }
    for (let i = 0; i < barriers.length; i++) {
      if (!passablesMap[getCoordIndex(barriers[i])]) continue;
      renderer.drawSquareBorder(barriers[i].x, barriers[i].y, 'dark', PALETTE.deathInvert.barrierStroke, true);
    }
  }

  function drawDoors() {
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      for (let i = 0; i < doors.length; i++) {
        renderer.drawGraphicalComponent(graphicalComponents.door, doors[i].x, doors[i].y);
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
    if (state.isShowingDeathColours) {
      spriteRenderer.drawImage3x3(Image.KeyGrey, key.position.x, key.position.y);
    } else if (key.channel === KeyChannel.Yellow) {
      spriteRenderer.drawImage3x3Static(Image.KeyYellow, key.position.x, key.position.y);
    } else if (key.channel === KeyChannel.Red) {
      spriteRenderer.drawImage3x3Static(Image.KeyRed, key.position.x, key.position.y);
    } else if (key.channel === KeyChannel.Blue) {
      spriteRenderer.drawImage3x3Static(Image.KeyBlue, key.position.x, key.position.y);
    }
  }

  function drawLock(lock: Lock) {
    if (state.isShowingDeathColours) {
      spriteRenderer.drawImage3x3(Image.LockGrey, lock.position.x, lock.position.y);
    } else if (lock.channel === KeyChannel.Yellow) {
      spriteRenderer.drawImage3x3Static(Image.LockYellow, lock.position.x, lock.position.y);
    } else if (lock.channel === KeyChannel.Red) {
      spriteRenderer.drawImage3x3Static(Image.LockRed, lock.position.x, lock.position.y);
    } else if (lock.channel === KeyChannel.Blue) {
      spriteRenderer.drawImage3x3Static(Image.LockBlue, lock.position.x, lock.position.y);
    }
  }

  function drawDecorative1(vec: Vector) {
    if (vec.equals(player.position)) return;
    if (doorsMap[getCoordIndex(vec)]) return;
    if (segments.containsCoord(getCoordIndex(vec))) return;
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponent(graphicalComponents.deco1, vec.x, vec.y);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco1, PALETTE.deathInvert.deco1Stroke, drawBasicOptions);
    }
  }

  function drawDecorative2(vec: Vector) {
    if (vec.equals(player.position)) return;
    if (doorsMap[getCoordIndex(vec)]) return;
    if (segments.containsCoord(getCoordIndex(vec))) return;
    if (!state.isShowingDeathColours || replay.mode === ReplayMode.Playback) {
      renderer.drawGraphicalComponent(graphicalComponents.deco2, vec.x, vec.y);
    } else {
      renderer.drawSquare(vec.x, vec.y, PALETTE.deathInvert.deco2, PALETTE.deathInvert.deco2Stroke, drawBasicOptions);
    }
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
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < portals[i as PortalChannel].length; j++) {
        const portalPosition = portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        renderer.drawPortal(portal, state.isShowingDeathColours && replay.mode !== ReplayMode.Playback, drawPortalOptions);
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
        portalVortexParticleSystem.emit(portal.position.x, portal.position.y, portal.channel);
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
    startCoroutine(showGameOverRoutine());
    maybeSaveReplayStateToFile();
  }

  function* showGameOverRoutine(): IEnumerator {
    stats.score = parseInt(String(stats.score * 0.5), 10);
    startScreenShake();
    yield* waitForTime(200);
    startScreenShake(3, -HURT_STUN_TIME / SCREEN_SHAKE_DURATION_MS, 0.1);
    state.isShowingDeathColours = true;
    renderer.invalidateStaticCache();
    yield* waitForTime(HURT_STUN_TIME * 2.5);
    state.isShowingDeathColours = false;
    renderer.invalidateStaticCache();
    startScreenShake();
    if (replay.mode === ReplayMode.Playback) {
      yield* waitForTime(1000);
      proceedToNextReplayClip();
    } else {
      startAction(fadeMusic(0.3, 1000), Action.FadeMusic);
      const randomMessage = getRandomMessage();
      stats.numLevelsCleared = 0;
      UI.drawDarkOverlay(uiElements);
      UI.drawButton("MAIN MENU", 20, 20, showMainMenu, uiElements);
      UI.drawButton("TRY AGAIN", 475, 20, () => initLevel(false), uiElements);
      const offset = -50
      UI.drawText('YOU DIED!', '28px', 250 + offset, uiElements, { color: ACCENT_COLOR });
      UI.drawText(randomMessage, '12px', 340 + offset, uiElements);
      // UI.drawText(`SCORE: ${Math.floor(score)}`, '30px', 370 + offset, uiElements);
      // UI.drawText(`APPLES: ${applesEaten}`, '18px', 443 + offset, uiElements);
      UI.drawText('[ENTER]&nbsp;&nbsp;&nbsp;Try Again ', '14px', 450 + offset, uiElements, { color: ACCENT_COLOR });
      UI.drawText('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[M]&nbsp;&nbsp;&nbsp;Main Menu ', '14px', 480 + offset, uiElements, { color: ACCENT_COLOR, marginLeft: 16 });
      UI.enableScreenScroll();
      renderScoreUI(stats.score);
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

  // I will buy a beer for whoever can decipher my spaghetticode
  const getRandomMessage = (numIterations = 0): string => {
    const allMessages = (loseMessages[state.levelIndex] || []).concat(level.disableNormalLoseMessages ? [] : loseMessages[-1]);
    const relevantMessages = allMessages.filter(([message, callback]) => {
      if (callback) return callback(state, stats, difficulty);
      return state.lastHurtBy !== HitType.HitLock && stats.numLevelsCleared <= 2;
    }).map((contents) => contents[0]);
    if (relevantMessages.length <= 0) {
      if (numIterations > 0) {
        return "Death smiles at us all. All we can do is smile back.";
      }
      hydrateLoseMessages(state.levelIndex);
      return getRandomMessage(numIterations + 1);
    }
    const randomMessage = relevantMessages[Math.floor(p5.random(0, relevantMessages.length))];
    // remove from existing messages
    loseMessages[-1] = loseMessages[-1].filter(([message, callback]) => message != randomMessage);
    if (loseMessages[state.levelIndex]) {
      loseMessages[state.levelIndex] = loseMessages[state.levelIndex].filter(([message, callback]) => message != randomMessage);
    }
    return randomMessage;
  }

  const hydrateLoseMessages = (levelIndex: number) => {
    loseMessages[-1] = [...LOSE_MESSAGES];
    // if -1, hydrate lose messages for all levels
    if (levelIndex < 0) {
      for (let i = 0; i <= 99; i++) {
        const level = LEVELS[i];
        if (!level) continue;
        if (!level.extraLoseMessages) continue;
        loseMessages[i] = [...level.extraLoseMessages];
      }
    } else {
      const level = LEVELS[levelIndex];
      if (!level) return;
      if (!level.extraLoseMessages) return;
      loseMessages[levelIndex] = [...level.extraLoseMessages];
    }
  }

  function warpToLevel(levelNum = 1) {
    if (!queryParams.enableWarp && !state.isCasualModeEnabled) return;
    stats.numLevelsCleared = 0;
    musicPlayer.stopAllTracks();
    level = getWarpLevelFromNum(levelNum);
    resetStats();
    setLevelIndexFromCurrentLevel();
    initLevel();
  }

  function pause() {
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isPaused) return;
    if (state.isExitingLevel || state.isExited) return;
    state.isPaused = true;
    showPauseUI();
    uiBindings.onPause();
    sfx.play(Sound.unlock, 0.8);
    startAction(changeMusicLowpass(0.07, 1500, 0.2), Action.ChangeMusicLowpass, true);
    startAction(fadeMusic(0.6, 2000), Action.FadeMusic, true);
  }

  function unpause() {
    if (!state.isPaused) return;
    state.isPaused = false;
    clearUI();
    UI.hideSettingsMenu();
    sfx.play(Sound.unlock, 0.8);
    startAction(changeMusicLowpass(1, 1500), Action.ChangeMusicLowpass, true);
    startAction(fadeMusic(1, 1000), Action.FadeMusic, true);
    modal.hide();
  }

  function confirmShowMainMenu() {
    const handleYes = () => {
      modal.hide();
      showMainMenu();
      sfx.play(Sound.doorOpen);
    }
    const handleNo = () => {
      modal.hide();
      sfx.play(Sound.uiBlip);
      if (state.isPaused) uiBindings.onPause();
    }
    modal.show('Goto Main Menu?', 'All progress will be lost.', handleYes, handleNo);
    sfx.play(Sound.unlock);
  }

  function showInGameSettingsMenu() {
    sfx.play(Sound.unlock);
    UI.showSettingsMenu(true);
  }

  function showPauseUI() {
    UI.drawDarkOverlay(uiElements);
    UI.drawText('PAUSED', '30px', 235, uiElements, { color: ACCENT_COLOR });
    UI.drawText('[ESC] To Unpause', '14px', 285, uiElements);
    UI.drawButton("MAIN MENU", 20, 20, confirmShowMainMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonMainMenu');
    UI.drawButton("SETTINGS", 445, 20, showInGameSettingsMenu, uiElements).addClass('minimood').addClass('focus-invert').id('pauseButtonSettings');

    if (!queryParams.enableWarp && !state.isCasualModeEnabled || level === START_LEVEL) {
      return;
    }
    UI.drawText('WARP TO LEVEL', '24px', 380, uiElements, { color: ACCENT_COLOR });
    const xInitial = 120;
    const offset = 60;
    const yRow1 = 440;
    const yRow2 = 480;
    const yRow3 = 520;
    const yRow4 = 560;
    let x = xInitial;
    UI.drawButton("01", x + 0.00000, yRow1, () => warpToLevel(1), uiElements).addClass('focus-invert').id('pauseButtonWarp01');
    UI.drawButton("02", x += offset, yRow1, () => warpToLevel(2), uiElements).addClass('focus-invert').id('pauseButtonWarp02');
    UI.drawButton("03", x += offset, yRow1, () => warpToLevel(3), uiElements).addClass('focus-invert').id('pauseButtonWarp03');
    UI.drawButton("04", x += offset, yRow1, () => warpToLevel(4), uiElements).addClass('focus-invert').id('pauseButtonWarp04');
    UI.drawButton("05", x += offset, yRow1, () => warpToLevel(5), uiElements).addClass('focus-invert').id('pauseButtonWarp05');
    UI.drawButton("06", x += offset, yRow1, () => warpToLevel(6), uiElements).addClass('focus-invert').id('pauseButtonWarp06');
    x = xInitial;
    UI.drawButton("07", x + 0.00000, yRow2, () => warpToLevel(7), uiElements).addClass('focus-invert').id('pauseButtonWarp07');
    UI.drawButton("08", x += offset, yRow2, () => warpToLevel(8), uiElements).addClass('focus-invert').id('pauseButtonWarp08');
    UI.drawButton("09", x += offset, yRow2, () => warpToLevel(9), uiElements).addClass('focus-invert').id('pauseButtonWarp09');
    UI.drawButton("10", x += offset, yRow2, () => warpToLevel(10), uiElements).addClass('focus-invert').id('pauseButtonWarp10');
    UI.drawButton("11", x += offset, yRow2, () => warpToLevel(11), uiElements).addClass('focus-invert').id('pauseButtonWarp11');
    UI.drawButton("12", x += offset, yRow2, () => warpToLevel(12), uiElements).addClass('focus-invert').id('pauseButtonWarp12');
    x = xInitial;
    UI.drawButton("13", x + 0.00000, yRow3, () => warpToLevel(13), uiElements).addClass('focus-invert').id('pauseButtonWarp13');
    UI.drawButton("14", x += offset, yRow3, () => warpToLevel(14), uiElements).addClass('focus-invert').id('pauseButtonWarp14');
    UI.drawButton("15", x += offset, yRow3, () => warpToLevel(15), uiElements).addClass('focus-invert').id('pauseButtonWarp15');
    UI.drawButton("16", x += offset, yRow3, () => warpToLevel(16), uiElements).addClass('focus-invert').id('pauseButtonWarp16');
    UI.drawButton("17", x += offset, yRow3, () => warpToLevel(17), uiElements).addClass('focus-invert').id('pauseButtonWarp17');
    UI.drawButton("18", x += offset, yRow3, () => warpToLevel(18), uiElements).addClass('focus-invert').id('pauseButtonWarp18');
    x = xInitial;
    UI.drawButton("19", x + 0.00000, yRow4, () => warpToLevel(19), uiElements).addClass('focus-invert').id('pauseButtonWarp19');
    UI.drawButton("20", x += offset, yRow4, () => warpToLevel(99), uiElements).addClass('focus-invert').id('pauseButtonWarp20');
    UI.drawButton("S1", x += offset, yRow4, () => warpToLevel(110), uiElements).addClass('focus-invert').id('pauseButtonWarpS1');
    UI.drawButton("S2", x += offset, yRow4, () => warpToLevel(120), uiElements).addClass('focus-invert').id('pauseButtonWarpS2');
    UI.drawButton("S3", x += offset, yRow4, () => warpToLevel(130), uiElements).addClass('focus-invert').id('pauseButtonWarpS3');
    UI.drawButton("S4", x += offset, yRow4, () => warpToLevel(140), uiElements).addClass('focus-invert').id('pauseButtonWarpS4');
  }

  function openDoors() {
    doors = [];
    doorsMap = {};
    state.isDoorsOpen = true;
    renderer.invalidateStaticCache();
  }

  function gotoNextLevel() {
    if (replay.mode === ReplayMode.Playback) return;

    musicPlayer.stopAllTracks();

    if (state.isGameWon) {
      difficulty.index++;
      difficulty = getDifficultyFromIndex(difficulty.index);
      resetStats();
      level = LEVEL_AFTER_WIN;
      setLevelIndexFromCurrentLevel();
      initLevel();
      return;
    }

    const showQuoteOnLevelWin = !!level.showQuoteOnLevelWin && !DISABLE_TRANSITIONS;
    stats.numLevelsCleared += 1;
    stats.numLevelsEverCleared += 1;
    stats.applesEatenThisLevel = 0;
    if (state.nextLevel || level.nextLevel) {
      level = state.nextLevel || level.nextLevel;
      setLevelIndexFromCurrentLevel();
    } else {
      state.levelIndex++;
      level = LEVELS[state.levelIndex % LEVELS.length];
    }

    maybeSaveReplayStateToFile();

    if (showQuoteOnLevelWin) {
      stopLogicLoop();
      const quote = getNextQuote();
      const onSceneEnded = () => {
        initLevel();
      }
      UI.clearLabels();
      stopAllCoroutines();
      actions.stopAll();
      new QuoteScene(quote, p5, sfx, fonts, { onSceneEnded });
    } else {
      initLevel();
    }
  }

  function getNextQuote() {
    const quoteIndex = Math.floor(p5.random(0, quotes.length));
    const quote = quotes[quoteIndex];
    quotes = removeArrayElement(quotes, quoteIndex);
    if (quotes.length <= 1) quotes = allQuotes.slice();
    return quote;
  }

  function enterQuoteMode() {
    if (state.isGameStarted || state.isGameStarting) return;
    state.appMode = AppMode.Quote;
    musicPlayer.stopAllTracks({ exclude: [MusicTrack.lordy] });
    musicPlayer.play(MusicTrack.lordy);
    sfx.play(Sound.doorOpen);
    clearUI(true);
    stopReplay();
    stopAllCoroutines();
    actions.stopAll();
    musicPlayer.setVolume(0.6);
    startAction(executeQuotesModeRoutine(), Action.ExecuteQuotesMode);
  }

  function* executeQuotesModeRoutine(): IEnumerator {
    const onEscapePress = () => {
      state.appMode = AppMode.Game;
      musicPlayer.stopAllTracks();
      musicPlayer.setVolume(1);
      stopAction(Action.ExecuteQuotesMode);
      showMainMenu();
    }
    while (state.appMode === AppMode.Quote) {
      yield null;
      const quote = getNextQuote();
      new QuoteScene(quote, p5, sfx, fonts, { onEscapePress });
      yield null;
    }
  }

  function enterOstMode() {
    state.appMode = AppMode.OST;
    clearUI(true);
    stopReplay();
    stopAllCoroutines();
    actions.stopAll();
    const prevMusicVolume = settings.musicVolume;
    settings.musicVolume = 1;
    const onEscapePress = () => {
      state.appMode = AppMode.Game;
      settings.musicVolume = prevMusicVolume;
      musicPlayer.stopAllTracks();
      musicPlayer.setVolume(1);
      showMainMenu();
    }
    musicPlayer.setVolume(1.3);
    new OSTScene(p5, sfx, musicPlayer, fonts, { onEscapePress })
  }

  function setLevelIndexFromCurrentLevel() {
    state.levelIndex = 0;
    for (let i = 0; i < LEVELS.length; i++) {
      if (level === LEVELS[i]) {
        state.levelIndex = i;
        break;
      }
    }
  }

  function startReplay() {
    replay.mode = ReplayMode.Playback;
    startCoroutine(replayRoutine());
  }

  function stopReplay() {
    replay.mode = ReplayMode.Disabled;
  }

  function proceedToNextReplayClip() {
    replay.shouldProceedToNextClip = true;
  }

  function* replayRoutine(): IEnumerator {
    const clips = shuffleArray(replayClips)
    let clipIndex = 0;

    while (true) {
      const clip = clips[clipIndex % clips.length];
      if (!clip) {
        console.warn(`clip at index ${clipIndex} was null - clips.length=${clips.length}`);
        break;
      }

      replay.shouldProceedToNextClip = false;
      replay.applesToSpawn = clip.applesToSpawn.slice();
      replay.difficulty = { ...clip.difficulty };
      replay.levelIndex = clip.levelIndex;
      replay.positions = clip.positions;

      level = getWarpLevelFromNum(clip.levelIndex);
      setLevelIndexFromCurrentLevel();
      difficulty = { ...clip.difficulty };
      initLevel(false);
      clipIndex++;
      yield null;

      while (!replay.shouldProceedToNextClip) {
        yield null;
      }
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
}
