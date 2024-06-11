import P5 from 'p5';

import {
  FRAMERATE,
  DIMENSIONS,
  MAX_LIVES,
  HURT_GRACE_TIME,
  DISABLE_TRANSITIONS,
  DIFFICULTY_MEDIUM,
} from '../constants';
import {
  getCoordIndex,
  parseUrlQueryParams,
} from '../utils';
import {
  HitType,
  GameState,
  IEnumerator,
  Sound,
  Stats,
  MusicTrack,
  GameSettings,
  AppMode,
  Tutorial,
  UINavDir,
  GameMode,
  InputAction,
  ActionKey,
  Action,
  Level,
} from '../types';
import { Modal } from '../ui/modal';
import { UI } from '../ui/ui';
import { showPauseUI, showPauseUIPreviewMode } from '../ui/uiComponents';
import { engine } from '../engine/engine';
import { resumeAudioContext } from '../engine/audio';
import { Coroutines } from '../engine/coroutines';
import { handleUIEvents } from '../engine/controls';
import { initLighting } from '../engine/lighting';
import { MusicPlayer } from '../engine/musicPlayer';
import { SFX } from '../engine/sfx';
import { SpriteRenderer } from '../engine/spriteRenderer';
import { Fonts } from '../fonts';
import { WinLevelScene } from '../scenes/WinLevelScene';
import { NoOpUnlockedMusicStore } from '../stores/UnlockedMusicStore';
import { buildMapLayout, decodeMapData } from '../editor/utils/editorUtils';
import { getExtendedPalette } from '../palettes';
import { LEVEL_01 } from '../levels';

const queryParams = parseUrlQueryParams();
const level = loadLevel();

const settings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1,
  isScreenShakeDisabled: false,
}
const state: GameState = {
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
  levelIndex: 0,
  actualTimeElapsed: 0,
  timeElapsed: 0,
  timeSinceLastMove: Infinity,
  timeSinceLastTeleport: Infinity,
  timeSinceHurt: Infinity,
  timeSinceHurtForgiveness: Infinity,
  timeSinceLastInput: Infinity,
  timeSinceInvincibleStart: Infinity,
  timeSinceSpawnedPickup: Infinity,
  hurtGraceTime: HURT_GRACE_TIME,
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
  applesEatenThisLevel: 0,
  totalTimeElapsed: 0,
}
const tutorial: Tutorial = {
  needsMoveControls: false,
  needsRewindControls: false,
};

let uiElements: P5.Element[] = [];

export const sketch = (p5: P5) => {
  const coroutines = new Coroutines(p5);
  const actions = new Coroutines(p5);
  const actionIds: Record<ActionKey, string | null> = {
    [Action.FadeMusic]: null,
    [Action.ExecuteQuotesMode]: null,
    [Action.SetTitleVariant]: null,
    [Action.ChangeMusicLowpass]: null,
    [Action.GameOver]: null,
    [Action.Invincibility]: null,
  };
  const startAction = (enumerator: IEnumerator, actionKey: Action, force = false) => {
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

  const fonts = new Fonts(p5);
  const sfx = new SFX();
  const musicPlayer = new MusicPlayer(settings);

  const gfxPresentation: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  gfxPresentation.addClass('static-gfx-canvas').addClass('fg4').parent('game').addClass('gfx-presentation');

  const spriteRenderer = new SpriteRenderer({ p5 });
  const winLevelScene = new WinLevelScene(p5, gfxPresentation, sfx, fonts, NoOpUnlockedMusicStore, spriteRenderer, { onSceneEnded: gotoNextLevel });

  const {
    setLevel,
    setDifficulty,
    getMaybeTitleScene,
    resetLevel,
    resetStats,
    renderLoop,
    startMoving,
    startRewinding,
    startLogicLoop,
    getIsStartLevel,
    clearBackground,
    changeMusicLowpass,
    playSound,
    fadeMusic,
    maybeSaveReplayStateToFile,
    onKeyPressed,
  } = engine({
    p5,
    spriteRenderer,
    state,
    stats,
    settings,
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
    proceedToNextReplayClip: () => {},
    warpToLevel: () => {},
    handleInputAction,
    onUINavigate,
    onGameOver,
    onGameOverCobra: onGameOver,
    onRecordLevelProgress: () => {},
  });

  const modal = new Modal();

  function handleInputAction(action: InputAction) {
    switch (action) {
      case InputAction.HideStartScreen:
        hideStartScreen();
        break;
      case InputAction.ShowMainMenu:
        // startPreview();
        break;
      case InputAction.ShowSettingsMenu:
        showSettingsMenu();
        break;
      case InputAction.HideSettingsMenu:
        UI.hideSettingsMenu();
        sfx.play(Sound.doorOpen);
        if (!state.isGameStarted) UI.showMainMenu();
        break;
      case InputAction.ConfirmShowMainMenu:
        break;
      case InputAction.RetryLevel:
        retryLevel();
        break;
      case InputAction.StartGame:
        startGame();
        break;
      case InputAction.ToggleCasualMode:
        break;
      case InputAction.ToggleCobraMode:
        break;
      case InputAction.ToggleScreenshakeDisabled:
        toggleScreenshakeDisabled();
        break;
      case InputAction.ShowLeaderboard:
        break;
      case InputAction.EnterQuoteMode:
        break;
      case InputAction.EnterOstMode:
        break;
      case InputAction.ProceedToNextReplayClip:
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
    UI.setP5Instance(p5);
    const canvas = document.getElementById("game-canvas");
    if (!canvas) throw new Error('could not find canvas with id="game-canvas"');
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y, p5.P2D, canvas);
    p5.frameRate(FRAMERATE);
    setLevel(level);
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
      const isGameOverNormal = state.isLost && state.timeSinceHurt > 20;
      if (!handled && (!state.isGameStarted || state.isPaused || isGameOverNormal)) {
        handled = handleUIEvents(p5, onUINavigate, onUIInteract, onUICancel);
        if (handled) { ev?.preventDefault(); }
      }
    }
    if (handled) {
      ev?.stopPropagation();
      return;
    }
    onKeyPressed(ev);
  }

  function onUINavigate(navDir: UINavDir) {
    let handled = false;
    if (!handled) handled = modal.handleUINavigation(navDir);
    // if (!handled) handled = uiBindings.handleUINavigation(navDir);
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
    // if (!handled) handled = uiBindings.handleUIInteract();
    return handled;
  }

  function onUICancel() {
    let handled = false;
    if (!handled) handled = modal.handleUICancel();
    // if (!handled) handled = uiBindings.handleUICancel();
    return handled;
  }

  function toggleScreenshakeDisabled(value?: boolean) {
    sfx.play(Sound.uiBlip);
    settings.isScreenShakeDisabled = value ?? !settings.isScreenShakeDisabled;
    // uiBindings.refreshFieldValues();
  }

  function hideStartScreen() {
    if (!state.isPreloaded) return;
    startGame();
    UI.hideStartScreen();
    sfx.play(Sound.doorOpen);
  }

  function startGame() {
    if (!state.isPreloaded) return;
    if (state.isGameStarting) return;

    state.appMode = AppMode.Game;
    state.gameMode = GameMode.Normal;
    state.isGameStarted = false;
    state.isGameStarting = false;
    setDifficulty(DIFFICULTY_MEDIUM);

    musicPlayer.stopAllTracks();
    musicPlayer.setVolume(1);
    sfx.stop(Sound.invincibleLoop);
    initLevel();
    coroutines.stopAll();
    actions.stopAll();
    startLogicLoop();
    winLevelScene.reset();

    resetStats();
    tutorial.needsMoveControls = false;
    tutorial.needsRewindControls = false;

    const query = new URLSearchParams(window.location.search);
    const fullscreen = query.get('fullscreen');
    if (fullscreen === 'true') {
      document.body.requestFullscreen();
    }

    state.isGameStarting = true;
    state.lives = MAX_LIVES;
    resetStats();
    UI.disableScreenScroll();
    setTimeout(() => {
      sfx.stop(Sound.invincibleLoop);
    }, 0)
    state.isGameStarting = false;
    state.isGameStarted = true;
  }

  function clearUI(force = false) {
    uiElements.forEach(element => element.remove())
    uiElements = [];
    UI.hideTitle();
  }

  function showSettingsMenu() {
    UI.showSettingsMenu({ isInGameMenu: state.isGameStarted, isCobraModeUnlocked: false });
    // uiBindings.refreshFieldValues();
    playSound(Sound.unlock, 1, true);
  }

  function retryLevel() {
    initLevel(false);
  }

  function initLevel(shouldShowTransitions = true) {
    coroutines.stopAll();
    modal.hide();
    winLevelScene.reset();
    playSound(Sound.unlock);
    const titleScene = getMaybeTitleScene();
    resetLevel({ shouldShowTransitions, transition: titleScene });
  }

  function onGameOver() {
    stats.score = 0;
    stats.numLevelsCleared = 0;
    initLevel(false);
  }

  function pause() {
    if (!state.isGameStarted) return;
    if (state.isLost) return;
    if (state.isGameWon) return;
    if (state.isPaused) return;
    if (state.isExitingLevel || state.isExited) return;
    state.isPaused = true;
    showPauseUIPreviewMode(uiElements, { unpause });
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

  function gotoNextLevel() {
    musicPlayer.stopAllTracks();
    sfx.stop(Sound.invincibleLoop);
    clearBackground();
    maybeSaveReplayStateToFile();
    initLevel();
  }
}

function loadLevel(): Level {
  try {
    const query = new URLSearchParams(window.location.search);
    const queryData = query.get('data');
    if (!queryData) {
      return LEVEL_01;
    }
    const [data, options] = decodeMapData(queryData);
    const layout = buildMapLayout(data);
    const level: Level = {
      name: options.name,
      timeToClear: options.timeToClear,
      applesToClear: options.applesToClear,
      numApplesStart: options.disableAppleSpawn ? 0 : options.numApplesStart,
      applesModOverride: 1,
      snakeStartSizeOverride: Math.max(options.snakeStartSize, 3),
      disableAppleSpawn: options.disableAppleSpawn,
      globalLight: options.globalLight,
      snakeSpawnPointOverride: getCoordIndex(data.playerSpawnPosition),
      showTitle: false,
      showQuoteOnLevelWin: false,
      musicTrack: MusicTrack.None,
      layout,
      colors: getExtendedPalette(options.palette),
      playWinSound: true,
      portalExitConfig: options.portalExitConfig,
    };
    return level;
  } catch (err) {
    console.error(err.message);
    // TODO: HANDLE ERROR STATE
    // toast.error('Unable to load map data from url');
    return LEVEL_01;
  }
}

