import P5 from 'p5';
import Color from 'color';

import './fullscreenHandler';

import {
  FRAMERATE,
  DIMENSIONS,
  MAX_LIVES,
  HURT_GRACE_TIME,
  DIFFICULTY_MEDIUM,
} from '../constants';
import {
  getCoordIndex,
  preloadImage,
  wait,
} from '../utils';
import {
  HitType,
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
  Level,
  Palette,
} from '../types';
import { Modal } from '../ui/modal';
import { UI } from '../ui/ui';
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
import { LoadingScene } from '../scenes/LoadingScene';
import { NoOpUnlockedMusicStore } from '../stores/UnlockedMusicStore';
import { buildMapLayout, decodeMapData } from '../editor/utils/editorUtils';
import { getEditorUrl, getPreviewUrl } from '../editor/utils/publishUtils';
import { GetMapByDataResponse, getMapByData } from '../api/map';
import { getExtendedPalette } from '../palettes';
import { LEVEL_01, LEVEL_02 } from '../levels';
import { requireElementById } from '../ui/uiUtils';

interface PreviewLevel {
  loading: boolean,
  current: Level,
  nextMap: string,
}
const level: PreviewLevel = {
  loading: true,
  current: undefined,
  nextMap: '',
}
loadLevel(getDataFromUrl(), true);

const settings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1,
  isScreenShakeDisabled: false,
}
const state: GameState = {
  appMode: AppMode.StartScreen,
  gameMode: GameMode.Normal,
  mapset: 0,
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
  const loadingScene = new LoadingScene(p5, gfxPresentation, fonts);

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
    setLevel(level.current);
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
    renderLoop();
    if (level.loading) {
      loadingScene.draw();
    }
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
    if (level.loading) return;
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

    state.appMode = AppMode.Game;
    state.gameMode = GameMode.Normal;
    state.isGameStarted = false;
    state.isGameStarting = false;
    setDifficulty(DIFFICULTY_MEDIUM);

    musicPlayer.stopAllTracks();
    musicPlayer.setVolume(1);
    sfx.stop(Sound.invincibleLoop);
    setLevel(level.current);
    initLevel();
    coroutines.stopAll();
    actions.stopAll();
    startLogicLoop();
    winLevelScene.reset();

    resetStats();
    tutorial.needsMoveControls = false;
    tutorial.needsRewindControls = false;

    const query = new URLSearchParams(window.location.search);
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

  async function gotoNextLevel() {
    musicPlayer.stopAllTracks();
    sfx.stop(Sound.invincibleLoop);
    clearBackground();
    maybeSaveReplayStateToFile();

    if (level.nextMap) {
      await loadLevel(level.nextMap);
      setLevel(level.current);
    }

    initLevel();
  }
}

function getDataFromUrl() {
  const query = new URLSearchParams(window.location.search);
  const queryData = query.get('data');
  return encodeURIComponent(queryData);
}

async function loadLevel(queryData: string, loadMapImage = false): Promise<void> {
  try {
    level.loading = true;
    const query = new URLSearchParams(window.location.search);
    const isEditorPreview = query.get('editorPreview') === 'true'
    if (!queryData) {
      level.current = LEVEL_01;
      return;
    }
    const res: GetMapByDataResponse | null = isEditorPreview ? null : await getMapByData(queryData)
      // @ts-ignore
      .catch((_err: any) => {
        console.warn(`No map found matching data param`);
        return null;
      });
    const [data, options] = decodeMapData(queryData);
    const layout = buildMapLayout(data);
    const loaded: Level = {
      id: '',
      name: options.name,
      timeToClear: options.timeToClear,
      applesToClear: options.applesToClear,
      numApplesStart: options.disableAppleSpawn ? 0 : options.numApplesStart,
      applesModOverride: 1,
      snakeStartSizeOverride: Math.max(options.snakeStartSize, 3),
      disableAppleSpawn: options.disableAppleSpawn,
      extraHurtGraceTime: options.extraHurtGraceTime,
      globalLight: options.globalLight,
      snakeSpawnPointOverride: getCoordIndex(data.playerSpawnPosition),
      snakeStartDirectionOverride: data.startDirection,
      showTitle: !isEditorPreview,
      showQuoteOnLevelWin: false,
      musicTrack: options.musicTrack,
      layout,
      colors: getExtendedPalette(options.palette),
      playWinSound: isEditorPreview,
      portalExitConfig: options.portalExitConfig,
      author: res?.map?.author,
    };
    level.current = loaded;
    if (!isEditorPreview) {
      level.nextMap = res?.next?.data;
      populateEditMapLink(queryData);
      document.getElementById('allMapsButton')?.classList.remove('hidden');
    }
    const mapId = res?.map?.id;
    const imageUrl = res?.map?.imageUrl;
    if (loadMapImage && mapId && imageUrl) {
      await preloadImage(imageUrl)
        .then(() => {
          updateStartScreenImage(imageUrl, options.palette);
        })
        .catch(err => {
          console.warn(`Unable to fetch image for map ${mapId}`);
        });
    }
    if (level.nextMap) {
      document.getElementById('buttonNextMap')?.classList.remove('hidden');
      document.getElementById('buttonNextMap')?.setAttribute('href', getPreviewUrl(level.nextMap));
    } else {
      document.getElementById('buttonNextMap')?.classList.add('hidden');
    }
    await(wait(20));
  } catch (err) {
    level.current = LEVEL_02;
    console.error(err.message);
  } finally {
    document.getElementById('loader')?.remove();
    level.loading = false;
  }
}

function populateEditMapLink(data: string) {
  const url = getEditorUrl(data);
  const button = document.getElementById('buttonEditMap');
  button.setAttribute('href', url);
  button.setAttribute('target', '_blank');
  button.classList.remove('hidden');
}

function updateStartScreenImage(imgUrl: string | undefined, colors: Palette) {
  if (!imgUrl) return;
  const splash = requireElementById<HTMLDivElement>('map-preview-splash');
  const image = requireElementById<HTMLImageElement>('map-preview-splash-img');
  const width = 1200;
  const height = 630;
  image.setAttribute('src', imgUrl);
  image.setAttribute('width', String(width));
  image.setAttribute('height', String(height));
  splash.classList.remove('hidden');
  document.getElementById('start-screen')?.remove();
  const backgroundColor = Color(colors.background).darken(0.4).desaturate(0.3).hex();
  splash.style.backgroundColor = backgroundColor;
}

