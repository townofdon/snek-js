import P5 from 'p5';

import {
  MAIN_TITLE_SCREEN_LEVEL,
  START_LEVEL,
  START_LEVEL_COBRA,
  LEVELS,
  FIRST_CHALLENGE_LEVEL,
} from './levels';
import {
  RECORD_REPLAY_STATE,
  FRAMERATE,
  DIMENSIONS,
  MAX_LIVES,
  HURT_GRACE_TIME,
  DIFFICULTY_EASY,
  DISABLE_TRANSITIONS,
  DIFFICULTY_MEDIUM,
} from './constants';
import {
  getDifficultyFromIndex,
  getDifficultyName,
  getLevelProgress,
  getRelativeDir,
  parseUrlQueryParams,
  removeArrayElement,
  shuffleArray,
} from './utils';
import {
  getIsChallengeLevel,
  getNextRandomLevel,
  getWarpLevelFromNum,
  hydrateRandomLevels,
} from './levels/levelUtils';
import {
  HitType,
  GameState,
  IEnumerator,
  Replay,
  ReplayMode,
  Sound,
  Stats,
  LoseMessage,
  MusicTrack,
  GameSettings,
  AppMode,
  TitleVariant,
  Tutorial,
  UINavDir,
  GameMode,
  InputAction,
  ActionKey,
  Action,
  SNEKALYTICS_EVENT_TYPE,
  Mapset,
} from './types';
import { MainTitleFader } from './ui/mainTitleFader';
import { Modal } from './ui/modal';
import { UI } from './ui/ui';
import { UIBindings } from './ui/uiBindings';
import { showGameOverUI, showPauseUI } from './ui/uiComponents';
import { engine } from './engine/engine';
import { resumeAudioContext } from './engine/audio';
import { Coroutines } from './engine/coroutines';
import { handleUIEvents } from './engine/controls';
import { initLighting } from './engine/lighting';
import { MusicPlayer } from './engine/musicPlayer';
import { SFX } from './engine/sfx';
import { SpriteRenderer } from './engine/spriteRenderer';
import { Fonts } from './fonts';
import { quotes as allQuotes } from './quotes';
import { replayClips } from './replayClips/replayClips';
import { WinLevelScene } from './scenes/WinLevelScene';
import { LOSE_MESSAGES } from './messages';
import { OSTScene } from './scenes/OSTScene';
import { QuoteScene } from './scenes/QuoteScene';
import { WinGameScene } from './scenes/WinGameScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { UnlockedMusicStore } from './stores/UnlockedMusicStore';
import { SaveDataStore } from './stores/SaveDataStore';
import { recordSnekalyticsEvent } from './api/snekalytics';
import { applyGamepadUIActions, getGamepad, resetGamepad, tickGamepad } from './engine/gamepad';

const queryParams = parseUrlQueryParams();
const unlockedMusicStore = new UnlockedMusicStore()
const saveDataStore = new SaveDataStore();

const settings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1,
  isScreenShakeDisabled: false,
}
const state: GameState = {
  appMode: AppMode.StartScreen,
  gameMode: GameMode.Normal,
  mapset: Mapset.Campaign,
  isRandomizer: false,
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
  collisions: 0,
  targetSpeed: 1,
  currentSpeed: 1,
  steps: 0,
  frameCount: 0,
  numTeleports: 0,
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
  totalGameTimeElapsed: 0,
  totalLevelTimeElapsed: 0,
}
const replay: Replay = {
  mode: ReplayMode.Disabled,
  levelIndex: state.levelIndex,
  levelName: 'no-level',
  difficulty: { ...DIFFICULTY_MEDIUM },
  applesToSpawn: [],
  positions: {},
  timeCaptureStarted: 'no-date',
  shouldProceedToNextClip: false,
  lastFrame: 0,
}
const tutorial: Tutorial = {
  needsMoveControls: false,
  needsRewindControls: false,
};

const loseMessages: Record<number, LoseMessage[]> = {};

let uiElements: P5.Element[] = [];
let quotes = allQuotes.slice();

export const sketch = (p5: P5) => {
  const coroutines = new Coroutines(p5);
  // actions are unique, singleton coroutines, meaning that only one coroutine of a type can run at a time
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
  
  const fonts = new Fonts(p5);
  const sfx = new SFX();
  const musicPlayer = new MusicPlayer(settings);

  const gfxPresentation: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  gfxPresentation.addClass('static-gfx-canvas').addClass('fg4').parent('game').addClass('gfx-presentation');

  const spriteRenderer = new SpriteRenderer({ p5 });
  const winLevelScene = new WinLevelScene(p5, gfxPresentation, sfx, fonts, unlockedMusicStore, spriteRenderer, { onSceneEnded: gotoNextLevel });

  const {
    setLevel,
    setDifficulty,
    getLevel,
    getDifficulty,
    getMaybeTitleScene,
    resetLevel,
    resetStats,
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
  } = engine({
    p5,
    spriteRenderer,
    state,
    stats,
    settings,
    replay,
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
    onRecordLevelProgress: saveDataStore.recordLevelCompletion,
  });

  const mainTitleFader = new MainTitleFader(p5);
  const winGameScene = new WinGameScene({ p5, gfx: gfxPresentation, gameState: state, stats, sfx, fonts, onChangePlayerDirection, spriteRenderer, callbacks: { onSceneEnded: gotoNextLevel } })
  const leaderboardScene = new LeaderboardScene({ p5, gfx: gfxPresentation, sfx, fonts, callbacks: { onSceneEnded: hideLeaderboard } });

  const modal = new Modal();

  const uiBindings = new UIBindings(p5, sfx, state, settings, {
    onSetMusicVolume: (volume) => { settings.musicVolume = volume; },
    onSetSfxVolume: (volume) => { settings.sfxVolume = volume; },
    onToggleCasualMode: toggleCasualMode,
    onToggleCobraMode: toggleCobraMode,
    onWarpToLevel: warpToLevel,
  }, handleInputAction);

  function handleInputAction(action: InputAction, p0?: any) {
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
        if (state.isPaused) uiBindings.onPauseCancelModal();
        break;
      case InputAction.ConfirmShowMainMenu:
        confirmShowMainMenu();
        break;
      case InputAction.RetryLevel:
        retryLevel();
        break;
      case InputAction.ChooseGameMode:
        if (!state.isGameStarted) showGameModeMenu();
        break;
      case InputAction.CancelChooseGameMode:
        UI.hideGameModeMenu();
        sfx.play(Sound.doorOpen);
        if (!state.isGameStarted) UI.showMainMenu();
        break;
      case InputAction.ShowLevelSelectMenu:
        if (!state.isGameStarted) showLevelSelectMenu();
        break;
      case InputAction.HideLevelSelectMenu:
        if (!state.isGameStarted) showGameModeMenu();
        break;
      case InputAction.StartGame:
        const levelNum = typeof p0 === 'number' ? p0 : -1;
        startGame(levelNum);
        break;
      case InputAction.ToggleCasualMode:
        toggleCasualMode();
        break;
      case InputAction.ToggleCobraMode:
        toggleCobraMode();
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
      case InputAction.GotoCommunityPage:
        window.location.href = `${getRelativeDir()}community`;
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
    musicPlayer.load(MAIN_TITLE_SCREEN_LEVEL.musicTrack);
    spriteRenderer.loadImages();
    initLighting(p5);
  }

  /**
   * https://p5js.org/reference/#/p5/setup
   */
  p5.setup = setup;
  function setup() {
    state.appMode = AppMode.StartScreen;
    state.mapset = Mapset.Campaign;
    state.isRandomizer = false;
    state.isGameStarted = false;
    state.isGameStarting = false;
    setLevel(MAIN_TITLE_SCREEN_LEVEL);
    UI.setP5Instance(p5);
    const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
    if (!canvas) throw new Error('could not find canvas with id="game-canvas"');
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y, p5.P2D, canvas);
    p5.frameRate(FRAMERATE);
    initLevel(false);
    state.isPreloaded = true;
    window.addEventListener('beforeunload', () => {
      if (state.appMode === AppMode.Game && state.isGameStarted) {
        recordSnekalyticsEvent({
          difficulty: getDifficultyName(getDifficulty().index),
          eventType: SNEKALYTICS_EVENT_TYPE.QUIT_GAME,
          levelName: getLevel().name,
          levelProgress: getLevelProgress(stats, getLevel(), getDifficulty()),
          levelTimeProgress: state.timeElapsed,
          score: stats.score,
          isCobra: state.gameMode === GameMode.Cobra,
        });
      }
    })
  }

  /**
   * https://p5js.org/reference/#/p5/draw
   * called by window.requestAnimationFrame
   */
  p5.draw = draw;
  function draw() {
    // prevent freezing due to animation frame build up if tab loses focus
    if (p5.deltaTime > 3000) return;
    let handled = false;
    if (!handled) handled = winGameScene.gamepadButtonPressed()
    if (!handled) handled = applyGamepadUIActions(state, handleInputAction, onUINavigate, onUIInteract, onUICancel);
    renderLoop(handled);
    if (!state.isGameStarted) leaderboardScene.draw();
    handleRenderWinGameScene();
    tickGamepad();
  }

  /**
   * https://p5js.org/reference/#/p5/keyPressed
   */
  p5.keyPressed = keyPressed;
  function keyPressed(ev?: KeyboardEvent) {
    resumeAudioContext();
    let handled = false;
    // check if can handle UI events
    if (!state.isGameStarting && state.appMode === AppMode.Game) {
      const isGameOver = state.isLost && state.timeSinceHurt > 20;
      if (!handled) {
        handled = winGameScene.keyPressed();
      }
      if (!handled && (!state.isGameStarted || state.isPaused || isGameOver)) {
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
    if (!handled) handled = uiBindings.handleUINavigation(navDir);
    if (handled) {
      sfx.play(Sound.uiBlip, 0.5);
    } else if (!state.isGameWon) {
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
    sfx.play(Sound.uiBlip, 0.7);
    if (value === false && state.gameMode === GameMode.Casual) {
      state.gameMode = GameMode.Normal;
    } else if (value === true) {
      state.gameMode = GameMode.Casual;
    } else if (state.gameMode === GameMode.Casual) {
      state.gameMode = GameMode.Normal;
    } else {
      state.gameMode = GameMode.Casual;
    }
    if (state.gameMode === GameMode.Casual) {
      UI.showMainCasualModeLabel();
    } else {
      UI.hideMainCasualModeLabel();
    }
    uiBindings.refreshFieldValues();
  }

  function toggleCobraMode(value?: boolean) {
    if (!saveDataStore.getIsCobraModeUnlocked()) return;
    sfx.play(Sound.uiBlip, 0.7);
    if (value === false && state.gameMode === GameMode.Cobra) {
      state.gameMode = GameMode.Normal;
    } else if (value === true) {
      state.gameMode = GameMode.Cobra;
    } else if (state.gameMode === GameMode.Cobra) {
      state.gameMode = GameMode.Normal;
    } else {
      state.gameMode = GameMode.Cobra;
    }
    if (state.gameMode === GameMode.Cobra) {
      UI.showMainCobraModeLabel();
    } else {
      UI.hideMainCobraModeLabel();
    }
    uiBindings.refreshFieldValues();
  }

  function toggleScreenshakeDisabled(value?: boolean) {
    sfx.play(Sound.uiBlip);
    settings.isScreenShakeDisabled = value ?? !settings.isScreenShakeDisabled;
    uiBindings.refreshFieldValues();
  }

  function hideStartScreen() {
    if (!state.isPreloaded) return;
    showMainMenu();
    UI.hideStartScreen();
    sfx.play(Sound.doorOpen);
  }

  function showMainMenu() {
    if (!state.isPreloaded) return;

    document.body.requestFullscreen();

    state.appMode = AppMode.Game;
    state.mapset = Mapset.Campaign;
    state.isGameStarted = false;
    state.isGameStarting = false;
    state.isRandomizer = false;
    if (state.gameMode === GameMode.Cobra) {
      state.gameMode = GameMode.Normal;
    }
    setLevel(MAIN_TITLE_SCREEN_LEVEL);

    musicPlayer.stopAllTracks();
    musicPlayer.setVolume(1);
    sfx.stop(Sound.invincibleLoop);
    setLevelIndexFromCurrentLevel();
    initLevel(false);
    coroutines.stopAll();
    actions.stopAll();
    startReplay();
    startLogicLoop();
    winLevelScene.reset();
    winGameScene.reset();
    resetGamepad();
    resumeAudioContext().then(() => {
      musicPlayer.play(MAIN_TITLE_SCREEN_LEVEL.musicTrack);
    });

    resetStats();
    tutorial.needsMoveControls = true;
    tutorial.needsRewindControls = true;

    UI.renderLevelSelectMenuCompletion(saveDataStore);
    UI.enableScreenScroll();
    UI.hideGameModeMenu();
    showMainMenuUI();
    hydrateLoseMessages(-1);
  }

  function showMainMenuUI() {
    UI.clearLabels();
    UI.drawDarkOverlay(uiElements);
    UI.showTitle();
    if (state.gameMode === GameMode.Casual) {
      UI.showMainCasualModeLabel();
    }
    if (state.gameMode === GameMode.Cobra) {
      UI.showMainCobraModeLabel();
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
    leaderboardScene.trigger(() => {
      startScreenShake(3, 0.5, 1, true)
    });
  }

  function hideLeaderboard() {
    state.appMode = AppMode.Game;
    playSound(Sound.unlock, 1, true);
    showMainMenuUI();
  }

  function showGameModeMenu() {
    playSound(Sound.unlock, 1, true);
    UI.hideLevelSelectMenu();
    UI.showGameModeMenu();
    uiBindings.onSelectGameMode();
  }

  function showLevelSelectMenu() {
    playSound(Sound.unlock, 1, true);
    UI.hideGameModeMenu();
    UI.showLevelSelectMenu();
  }

  function startGame(levelNum = -1) {
    if (!state.isPreloaded) return;
    if (state.isGameStarting) return;
    state.isGameStarting = true;
    state.lives = MAX_LIVES;
    resetStats();
    UI.disableScreenScroll();
    setTimeout(() => {
      musicPlayer.stopAllTracks();
      sfx.stop(Sound.invincibleLoop);
    }, 0)
    playSound(Sound.uiConfirm, 1, true);
    coroutines.start(startGameRoutine(levelNum));
  }

  function* startGameRoutine(levelNum = -1): IEnumerator {
    if (!DISABLE_TRANSITIONS) {
      yield* coroutines.waitForTime(1000, (t) => {
        const freq = .2;
        const shouldShow = t % freq > freq * 0.5;
        uiBindings.setStartButtonVisibility(shouldShow, levelNum);
      });
    } else {
      yield null;
    }
    stopReplay();
    if (state.isRandomizer) {
      hydrateRandomLevels();
    }
    state.nextLevel = levelNum >= 1 ? getWarpLevelFromNum(levelNum) : null;
    if (getIsChallengeLevel(state.nextLevel)) {
      state.mapset = Mapset.Challenge;
    }
    setLevel(state.gameMode === GameMode.Cobra ? START_LEVEL_COBRA : START_LEVEL);
    setDifficulty(DIFFICULTY_EASY);

    setLevelIndexFromCurrentLevel();
    initLevel()
    playSound(Sound.unlock);
    state.isGameStarting = false;
    state.isGameStarted = true;
    replay.difficulty = { ...getDifficulty() };
  }

  function clearUI(force = false) {
    if (!force && replay.mode === ReplayMode.Playback) return;
    uiElements.forEach(element => element.remove())
    uiElements = [];
    UI.hideTitle();
    UI.hideMainCasualModeLabel();
    UI.hideMainCobraModeLabel();
    UI.hideMainMenu();
    UI.hideGameModeMenu();
    UI.hideLevelSelectMenu();
  }

  function showSettingsMenu() {
    UI.showSettingsMenu({ isInGameMenu: state.isGameStarted, isCobraModeUnlocked: saveDataStore.getIsCobraModeUnlocked() });
    uiBindings.refreshFieldValues();
    playSound(Sound.unlock, 1, true);
  }

  function retryLevel() {
    initLevel(false);
  }

  function initLevel(shouldShowTransitions = true) {
    const level = getLevel();
    const difficulty = getDifficulty();
    if (DISABLE_TRANSITIONS) {
      shouldShowTransitions = false;
    }
    if (replay.mode === ReplayMode.Playback) {
      shouldShowTransitions = false;
    } else {
      coroutines.stopAll();
      replay.mode = RECORD_REPLAY_STATE ? ReplayMode.Capture : ReplayMode.Disabled;
      replay.timeCaptureStarted = (new Date()).toISOString();
      replay.levelIndex = state.levelIndex;
      replay.levelName = level.name;
      replay.difficulty = { ...difficulty };
      replay.applesToSpawn = [];
      replay.positions = {};
    }

    modal.hide();
    winLevelScene.reset();
    winGameScene.reset();

    const titleScene = getMaybeTitleScene();
    resetLevel({ shouldShowTransitions, transition: titleScene, onTriggerWinGame });

    if (!state.isGameStarted && replay.mode === ReplayMode.Playback) {
      startAction(mainTitleFader.setTitleVariant(getLevel().titleVariant ?? TitleVariant.GrayBlue), Action.SetTitleVariant, true);
    }
  }

  function onTriggerWinGame() {
    winGameScene.trigger();
    unlockedMusicStore.unlockTrack(MusicTrack.overture);
    saveDataStore.unlockCobraMode();
  }

  function handleRenderWinGameScene() {
    if (state.isShowingDeathColours) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.isLost && state.gameMode !== GameMode.Cobra) return;
    if (!state.isGameStarted) return;
    const isCobraGameOver = state.isLost && state.gameMode === GameMode.Cobra;
    if (state.isGameWon || isCobraGameOver) {
      winGameScene.draw();
    }
  }

  function onGameOverCobra() {
    winGameScene.trigger();
    UI.enableScreenScroll();
    recordSnekalyticsEvent({
      difficulty: getDifficultyName(getDifficulty().index),
      eventType: SNEKALYTICS_EVENT_TYPE.DEATH,
      levelName: getLevel().name,
      levelProgress: getLevelProgress(stats, getLevel(), getDifficulty()),
      levelTimeProgress: state.timeElapsed,
      score: stats.score,
      isCobra: state.gameMode === GameMode.Cobra,
    });
  }

  function onGameOver() {
    UI.enableScreenScroll();
    showGameOverUI(getNextLoseMessage(), uiElements, state, { confirmShowMainMenu, initLevel });
    uiBindings.onGameOver();
    stats.numLevelsCleared = 0;
    recordSnekalyticsEvent({
      difficulty: getDifficultyName(getDifficulty().index),
      eventType: SNEKALYTICS_EVENT_TYPE.DEATH,
      levelName: getLevel().name,
      levelProgress: getLevelProgress(stats, getLevel(), getDifficulty()),
      levelTimeProgress: state.timeElapsed,
      score: stats.score,
      isCobra: state.gameMode === GameMode.Cobra,
    });
  }

  function warpToLevel(levelNum = 1) {
    if (getIsStartLevel() || state.gameMode === GameMode.Cobra) return;
    const fromLevel = getLevel();
    const toLevel = getWarpLevelFromNum(levelNum);
    recordSnekalyticsEvent({
      difficulty: getDifficultyName(getDifficulty().index),
      eventType: SNEKALYTICS_EVENT_TYPE.WARP,
      levelName: `${fromLevel.name}-->${toLevel.name}`,
      levelProgress: getLevelProgress(stats, getLevel(), getDifficulty()),
      levelTimeProgress: state.timeElapsed,
      score: stats.score,
      isCobra: false,
    });
    clearBackground();
    stats.numLevelsCleared = 0;
    musicPlayer.stopAllTracks();
    sfx.stop(Sound.invincibleLoop);
    setLevel(toLevel);
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
    showPauseUI(uiElements, {
      isWarpDisabled: getIsStartLevel() || state.gameMode === GameMode.Cobra || state.isRandomizer,
      hasWarpEnabledParam: queryParams.enableWarp,
      isChallengeLevel: getIsChallengeLevel(getLevel()),
    }, {
      unpause,
      confirmShowMainMenu,
      showInGameSettingsMenu,
      warpToLevel,
    });
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
      recordSnekalyticsEvent({
        difficulty: getDifficultyName(getDifficulty().index),
        eventType: SNEKALYTICS_EVENT_TYPE.QUIT_GAME,
        levelName: getLevel().name,
        levelProgress: getLevelProgress(stats, getLevel(), getDifficulty()),
        levelTimeProgress: state.timeElapsed,
        score: stats.score,
        isCobra: state.gameMode === GameMode.Cobra,
      });
      modal.hide();
      showMainMenu();
      sfx.play(Sound.doorOpen);
    }
    const handleNo = () => {
      modal.hide();
      sfx.play(Sound.uiBlip);
      if (state.isLost) {
        uiBindings.onGameOverCancelModal();
      } else if (state.isPaused) {
        uiBindings.onPauseCancelModal();
      }
    }
    modal.show('Goto Main Menu?', 'Current score will be lost.', handleYes, handleNo);
    sfx.play(Sound.unlock);
  }

  function showInGameSettingsMenu() {
    sfx.play(Sound.unlock);
    UI.showSettingsMenu({ isInGameMenu: true, isCobraModeUnlocked: saveDataStore.getIsCobraModeUnlocked() });
  }

  function gotoNextLevel() {
    if (replay.mode === ReplayMode.Playback) return;

    musicPlayer.stopAllTracks();
    sfx.stop(Sound.invincibleLoop);
    clearBackground();

    if (state.isGameWon) {
      recordSnekalyticsEvent({
        difficulty: getDifficultyName(getDifficulty().index),
        eventType: SNEKALYTICS_EVENT_TYPE.WIN_GAME,
        levelName: getLevel().name,
        levelProgress: getLevelProgress(stats, getLevel(), getDifficulty()),
        levelTimeProgress: state.timeElapsed,
        score: stats.score,
        isCobra: false,
      });
      resetStats();
      state.gameMode = GameMode.Cobra;
      state.nextLevel = null;
      const nextDifficultyIndex = getDifficulty().index + 1;
      setDifficulty(getDifficultyFromIndex(nextDifficultyIndex));
      setLevel(START_LEVEL_COBRA);
      setLevelIndexFromCurrentLevel();
      if (state.mapset === Mapset.Challenge) {
        state.nextLevel = FIRST_CHALLENGE_LEVEL;
      }
      initLevel();
      return;
    }

    if (state.isLost && state.gameMode === GameMode.Cobra) {
      winGameScene.reset();
      resetStats();
      showMainMenu();
      return;
    }

    if (getLevel() !== START_LEVEL && getLevel() !== START_LEVEL_COBRA) {
      recordSnekalyticsEvent({
        difficulty: getDifficultyName(getDifficulty().index),
        eventType: SNEKALYTICS_EVENT_TYPE.WIN_LEVEL,
        levelName: getLevel().name,
        levelProgress: getLevelProgress(stats, getLevel(), getDifficulty()),
        levelTimeProgress: state.timeElapsed,
        score: stats.score,
        isCobra: state.gameMode === GameMode.Cobra,
      });
    }

    const level = getLevel();
    const showQuoteOnLevelWin = !!level.showQuoteOnLevelWin && !DISABLE_TRANSITIONS;
    stats.numLevelsCleared += 1;
    stats.numLevelsEverCleared += 1;
    stats.applesEatenThisLevel = 0;

    const nextLevel = state.isRandomizer ? getNextRandomLevel() : (state.nextLevel || level.nextLevel);
    if (nextLevel) {
      setLevel(nextLevel)
      setLevelIndexFromCurrentLevel();
    } else {
      state.levelIndex++;
      setLevel(LEVELS[state.levelIndex % LEVELS.length]);
    }
    state.nextLevel = null;

    maybeSaveReplayStateToFile();

    if (showQuoteOnLevelWin) {
      stopLogicLoop();
      const quote = getNextQuote();
      const onSceneEnded = () => {
        initLevel();
      }
      UI.clearLabels();
      UI.hideGfxCanvas();
      coroutines.stopAll();
      actions.stopAll();
      new QuoteScene(quote, p5, gfxPresentation, sfx, fonts, { onSceneEnded });
    } else {
      initLevel();
    }
  }

  // I will buy a beer for whoever can decipher my spaghetticode
  const getNextLoseMessage = (numIterations = 0): string => {
    if (state.lastHurtBy === HitType.QuantumEntanglement) {
      const messages = [
        'You caused a rift in the snektime continuum.',
        'Attempting to be in two places at once can have disastrous results.',
        'Quantum entangle yourself lately?',
        'After a million years of being stuck in an infinite portal, you discover the horrifying truth that time loops back on itself.',
      ];
      const index = Math.floor(p5.random(0, messages.length));
      return messages[index];
    }
    const level = getLevel();
    const difficulty = getDifficulty();
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
      return getNextLoseMessage(numIterations + 1);
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
      const level = LEVELS[levelIndex || -1] || getLevel();
      if (!level) return;
      if (!level.extraLoseMessages) return;
      loseMessages[levelIndex] = [...level.extraLoseMessages];
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
    sfx.stop(Sound.invincibleLoop);
    sfx.play(Sound.doorOpen);
    clearUI(true);
    UI.hideGfxCanvas();
    stopReplay();
    coroutines.stopAll();
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
      new QuoteScene(quote, p5, gfxPresentation, sfx, fonts, { onEscapePress });
      yield null;
    }
  }

  function enterOstMode() {
    state.appMode = AppMode.OST;
    clearUI(true);
    UI.hideGfxCanvas();
    stopReplay();
    coroutines.stopAll();
    actions.stopAll();
    const prevMusicVolume = settings.musicVolume;
    settings.musicVolume = 1;
    const onEscapePress = () => {
      state.appMode = AppMode.Game;
      settings.musicVolume = prevMusicVolume;
      musicPlayer.stopAllTracks();
      musicPlayer.setVolume(1);
      sfx.stop(Sound.invincibleLoop);
      showMainMenu();
    }
    musicPlayer.setVolume(1.3);
    new OSTScene(p5, gfxPresentation, sfx, musicPlayer, fonts, unlockedMusicStore, spriteRenderer, { onEscapePress })
  }

  function setLevelIndexFromCurrentLevel() {
    state.levelIndex = 0;
    for (let i = 0; i < LEVELS.length; i++) {
      if (getLevel() === LEVELS[i]) {
        state.levelIndex = i;
        break;
      }
    }
  }

  function startReplay() {
    replay.mode = ReplayMode.Playback;
    coroutines.start(replayRoutine());
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
      const frames = Object.keys(clip.positions);
      const lastFrame = frames.length > 0 ? Number(frames[frames.length - 1]) : 0;
      replay.shouldProceedToNextClip = false;
      replay.applesToSpawn = clip.applesToSpawn.slice();
      replay.difficulty = { ...clip.difficulty };
      replay.levelIndex = clip.levelIndex;
      replay.positions = clip.positions;
      replay.lastFrame = lastFrame;
      setLevel(getWarpLevelFromNum(clip.levelIndex));
      setLevelIndexFromCurrentLevel();
      setDifficulty(clip.difficulty);
      initLevel(false);
      clipIndex++;
      yield null;

      while (!replay.shouldProceedToNextClip) {
        yield null;
      }
    }
  }
}
