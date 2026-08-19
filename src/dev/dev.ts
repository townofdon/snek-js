import P5 from 'p5';

import '../preview/fullscreenHandler';

import {
  FRAMERATE,
  DIMENSIONS,
  MAX_LIVES,
  DIFFICULTY_HARD,
} from '../constants';
import {
  DEFAULT_ACTION_IDS_MAP,
  DEFAULT_BASE_STATS,
  DEFAULT_GAME_STATE,
  DEFAULT_HELD_ITEMS,
  DEFAULT_OUTFIT,
} from "@/defaults";
import {
  getDifficultyFromIndex,
} from '../utils';
import {
  GameState,
  IEnumerator,
  Sound,
  Stats,
  GameSettings,
  AppMode,
  Tutorial,
  UINavDir,
  GameMode,
  InputAction,
  ActionKey,
  Action,
  Outfit,
  HeldItems,
  ResolutionMode,
  InputType,
} from '../types';
import { Modal } from '../ui/modal';
import { UI, UI_PARENT_ID } from '../ui/ui';
import { showPauseUIPreviewMode } from '../ui/uiComponents';
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
import { applyGamepadUIActions, tickGamepad } from '@/engine/gamepad';
import { MAZE_03_STORAGE } from '@/levels/mazes/maze03-storage';
import { UIBindings } from '@/ui/uiBindings';
import { saveDataStore } from '@/stores/SaveDataStore';

const level = MAZE_03_STORAGE;

const settings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1,
  isScreenShakeDisabled: false,
  resolutionMode: ResolutionMode.PixelPerfect,
  fullScreen: true,
}
const state: GameState = { ...DEFAULT_GAME_STATE };
const stats: Stats = { ...DEFAULT_BASE_STATS, applesEatenThisLevel: 0, totalLevelTimeElapsed: 0 } satisfies Stats;
const outfit: Outfit = { ...DEFAULT_OUTFIT };
const heldItems: HeldItems = { ...DEFAULT_HELD_ITEMS };
const tutorial: Tutorial = {
  needsMoveControls: false,
  needsRewindControls: false,
} satisfies Tutorial;

let uiElements: P5.Element[] = [];

export const sketch = (p5: P5) => {
  const coroutines = new Coroutines(p5);
  const actions = new Coroutines(p5);
  const actionIds: Record<ActionKey, string | null> = { ...DEFAULT_ACTION_IDS_MAP };
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
  const actionRunning = (actionKey: Action) => {
    return actions.exists(actionIds[actionKey]);
  }

  const fonts = new Fonts(p5);
  const sfx = new SFX();
  const musicPlayer = new MusicPlayer(settings);

  const gfxPresentation: P5.Graphics = p5.createGraphics(DIMENSIONS.x, DIMENSIONS.y);
  gfxPresentation.addClass('static-gfx-canvas').addClass('fg5').parent(UI_PARENT_ID).addClass('gfx-presentation').id('gfx-presentation');

  const spriteRenderer = new SpriteRenderer({ p5 });
  const winLevelScene = new WinLevelScene(p5, gfxPresentation, state, sfx, fonts, NoOpUnlockedMusicStore, spriteRenderer, { onSceneEnded: gotoNextLevel });

  const {
    initGraphics,
    setLevel,
    setDifficulty,
    getMaybeTitleScene,
    resetLevel,
    resetStats,
    renderLoop,
    startMoving,
    requestPlayerRewind,
    startLogicLoop,
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
    outfit,
    heldItems,
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
    proceedToNextReplayClip: () => {},
    warpToLevel: () => {},
    handleInputAction,
    onUINavigate,
    onGameOver,
    onGameOverCobra: onGameOver,
    onRecordLevelProgress: () => {},
  });

  const modal = new Modal();

  const uiBindings = new UIBindings(p5, state, settings, saveDataStore, {
    onSetMusicVolume: (volume) => { settings.musicVolume = volume; },
    onSetSfxVolume: (volume) => { settings.sfxVolume = volume; },
    onWarpToLevel: () => { console.log('onWarpToLevel not implemented.'); },
  }, handleInputAction);

  function handleInputAction(action: InputAction, p0?: any) {
    switch (action) {
      case InputAction.HideStartScreen:
        hideStartScreen();
        break;
      case InputAction.ShowSettingsMenu:
        UI.showSettingsMenu();
        playSound(Sound.unlock, 1, true);
        break;
      case InputAction.HideSettingsMenu:
        UI.hideSettingsMenu();
        sfx.play(Sound.doorOpen);
        break;
      case InputAction.RetryLevel:
        retryLevel();
        break;
      case InputAction.ToggleScreenshakeDisabled:
        toggleScreenshakeDisabled();
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
        requestPlayerRewind();
        break;
      case InputAction.TestAudio:
        sfx.play(Sound.eat);
        break;
      default:
        console.log(`unhandled action: ${action}`);
        break
    }
  }

  /**
   * https://p5js.org/reference/#/p5/preload
   */
  p5.preload = preload;
  function preload() {
    UI.init(p5);
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
    UI.init(p5);
    state.appMode = AppMode.StartScreen;
    state.isGameStarted = false;
    state.isGameStarting = false;
    const canvas = document.getElementById("game-canvas");
    if (!canvas) throw new Error('could not find canvas with id="game-canvas"');
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y, p5.P2D, canvas);
    p5.frameRate(FRAMERATE);
    initGraphics();
    setLevel(level);
    state.isPreloaded = true;
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
    if (!handled) handled = applyGamepadUIActions(state, handleInputAction, onUINavigate, onUIInteract, onUICancel);
    if (handled) {
      state.inputType = InputType.Gamepad;
    }
    renderLoop();
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
    resumeAudioContext().then(() => {
      startGame();
      UI.hideStartScreen();
      sfx.play(Sound.doorOpen);
    });
  }

  function startGame() {
    if (!state.isPreloaded) return;
    if (state.isGameStarting) return;

    const query = new URLSearchParams(window.location.search);
    state.appMode = AppMode.Game;
    state.gameMode = GameMode.Normal;
    state.isGameStarted = false;
    state.isGameStarting = false;
    const difficultyIndex = parseInt(query.get('difficulty')) || DIFFICULTY_HARD.index
    setDifficulty(getDifficultyFromIndex(difficultyIndex));

    musicPlayer.stopAllTracks();
    musicPlayer.setVolume(1);
    sfx.stop(Sound.invincibleLoop);
    setLevel(level);
    initLevel();
    coroutines.stopAll();
    actions.stopAll();
    startLogicLoop();
    winLevelScene.reset();

    resetStats();
    tutorial.needsMoveControls = false;
    tutorial.needsRewindControls = false;

    const disableFullscreen = query.get('disableFullscreen') === 'true';
    if (!disableFullscreen) {
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
  }

  function retryLevel() {
    initLevel(false);
  }

  function initLevel(shouldShowTransitions = true) {
    coroutines.stopAll();
    modal.hide();
    winLevelScene.reset();
    if (shouldShowTransitions) {
      playSound(Sound.unlock);
    }
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

  async function gotoNextLevel() {
    musicPlayer.stopAllTracks();
    sfx.stop(Sound.invincibleLoop);
    clearBackground();
    maybeSaveReplayStateToFile();

    initLevel();
  }
}
