import P5, { Element, Vector } from 'p5';
import Color from 'color';

import {
  MAIN_TITLE_SCREEN_LEVEL,
  START_LEVEL,
  LEVELS,
} from './levels';
import {
  RECORD_REPLAY_STATE,
  FRAMERATE,
  DIMENSIONS,
  GRIDCOUNT,
  BASE_TICK_MS,
  MAX_LIVES,
  START_SNAKE_SIZE,
  SPEED_INCREMENT,
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
  LIVES_LEFT_BONUS,
  PERFECT_BONUS,
  DEFAULT_PORTALS,
  PORTAL_CHANNEL_COLORS,
  ALL_APPLES_BONUS,
  HURT_MUSIC_DUCK_VOL,
  HURT_MUSIC_DUCK_TIME_MS,
  SPEED_INCREMENT_SPEED_MS,
  SPRINT_INCREMENT_SPEED_MS,
  ACCENT_COLOR,
  BLOCK_SIZE,
  SPEED_LIMIT_ULTRA_SPRINT,
  MAX_SNAKE_SIZE,
  GLOBAL_LIGHT_DEFAULT,
} from './constants';
import { clamp, dirToUnitVector, getCoordIndex, getDifficultyFromIndex, getElementPosition, getWarpLevelFromNum, invertDirection, parseUrlQueryParams, removeArrayElement, shuffleArray, vectorToDir } from './utils';
import { ParticleSystem } from './particle-system';
import { MainTitleFader, UIBindings, UI, Modal } from './ui';
import { DIR, HitType, Difficulty, GameState, IEnumerator, Level, PlayerState, Replay, ReplayMode, ScreenShakeState, Sound, Stats, Portal, PortalChannel, PortalExitMode, LoseMessage, MusicTrack, GameSettings, AppMode, TitleVariant, Image, Tutorial, ClickState, RecentMoves, RecentMoveTimings } from './types';
import { PALETTE } from './palettes';
import { Coroutines } from './coroutines';
import { Fonts } from './fonts';
import { quotes as allQuotes } from './quotes';
import { handleKeyPressed, validateMove } from './controls';
import { buildSceneActionFactory } from './scenes/sceneUtils';
import { buildLevel } from './levels/levelBuilder';
import { QuoteScene } from './scenes/QuoteScene';
import { SFX } from './sfx';
import { replayClips } from './replayClips/replayClips';
import { AppleParticleSystem } from './particleSystems/AppleParticleSystem';
import { WinLevelScene } from './scenes/WinLevelScene';
import { LOSE_MESSAGES } from './messages';
import { ImpactParticleSystem } from './particleSystems/ImpactParticleSystem';
import { Renderer } from './renderer';
import { PortalParticleSystem, PortalVortexParticleSystem } from './particleSystems/PortalParticleSystem';
import { MusicPlayer } from './musicPlayer';
import { resumeAudioContext } from './audio';
import { Easing } from './easing';
import { OSTScene } from './scenes/OSTScene';
import { SpriteRenderer } from './spriteRenderer';
import { WinGameScene } from './scenes/WinGameScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { createLightmap, drawLighting, resetLightmap, updateLighting } from './lighting';

let level: Level = MAIN_TITLE_SCREEN_LEVEL;
let difficulty: Difficulty = { ...DIFFICULTY_EASY };

const canvas = document.getElementById('game-canvas');
const queryParams = parseUrlQueryParams();
const settings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1,
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
  timeSinceLastInput: Infinity,
  hurtGraceTime: HURT_GRACE_TIME + (level.extraHurtGraceTime ?? 0),
  lives: MAX_LIVES,
  targetSpeed: 1,
  currentSpeed: 1,
  steps: 0,
  frameCount: 0,
  lastHurtBy: HitType.Unknown,
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
const player: PlayerState = {
  position: null,
  direction: DIR.RIGHT,
};
const screenShake: ScreenShakeState = {
  offset: null,
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
  needsMoveControls: true,
  needsRewindControls: true,
};
const clickState: ClickState = {
  x: 0,
  y: 0,
  didReceiveInput: false,
  directionToPoint: DIR.RIGHT,
}

const loseMessages: Record<number, LoseMessage[]> = {}

let moves: DIR[] = []; // moves that the player has queued up
let recentMoves: RecentMoves = [null, null, null, null]; // most recent moves that the snake has performed
let recentInputs: RecentMoves = [null, null, null, null]; // most recent inputs that the player has performed
let recentInputTimes: RecentMoveTimings = [Infinity, Infinity, Infinity, Infinity]; // timing of the most recent inputs that the player has performed
let segments: Vector[] = []; // snake segments
let apples: Vector[] = []; // food that the snake can eat to grow and score points
let barriers: Vector[] = []; // permanent structures that damage the snake
let doors: Vector[] = []; // like barriers, except that they disappear once the player has "cleared" a level (player must still exit the level though)
let decoratives1: Vector[] = []; // bg decorative elements
let decoratives2: Vector[] = []; // bg decorative elements

let barriersMap: Record<number, boolean> = {};
let doorsMap: Record<number, boolean> = {};
let segmentsMap: Record<number, boolean> = {};
let nospawnsMap: Record<number, boolean> = {}; // no-spawns are designated spots on the map where an apple cannot spawn

const lightMap = createLightmap();

let portals: Record<PortalChannel, Vector[]> = { ...DEFAULT_PORTALS() };
let portalsMap: Record<number, Portal> = {};
let portalParticlesStarted: Record<number, boolean> = {}

let uiElements: Element[] = [];
let particleSystems: ParticleSystem[] = [];
let screenFlashElement: Element;

let quotes = allQuotes.slice();

const difficultyButtons: Record<number, P5.Element> = {}

enum Action {
  FadeMusic = 'FadeMusic',
  ExecuteQuotesMode = 'ExecuteQuotesMode',
  SetTitleVariant = 'SetTitleVariant',
  ChangeMusicSpeed = 'ChangeMusicSpeed'
}
type ActionKey = keyof typeof Action

export const sketch = (p5: P5) => {
  const coroutines = new Coroutines(p5);
  const startCoroutine = coroutines.start;
  const stopAllCoroutines = coroutines.stopAll;
  const tickCoroutines = coroutines.tick;
  const waitForTime = coroutines.waitForTime;

  // actions are unique, singleton coroutines, meaning that only one coroutine of a type can run at a time
  const actions = new Coroutines(p5);
  const actionIds: Record<ActionKey, string | null> = {
    [Action.FadeMusic]: null,
    [Action.ExecuteQuotesMode]: null,
    [Action.SetTitleVariant]: null,
    [Action.ChangeMusicSpeed]: null,
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
  const mainTitleFader = new MainTitleFader(p5);
  const uiBindings = new UIBindings(p5, sfx, state, {
    onShowMainMenu: showMainMenu,
    onSetMusicVolume: (volume) => { settings.musicVolume = volume; },
    onSetSfxVolume: (volume) => { settings.sfxVolume = volume; },
    onToggleCasualMode: toggleCasualMode,
  });
  const winLevelScene = new WinLevelScene(p5, sfx, fonts, { onSceneEnded: gotoNextLevel });
  const onChangePlayerDirection: (direction: DIR) => void = (dir) => {
    if (validateMove(player.direction, dir)) {
      player.direction = dir
    }
  };
  const winGameScene = new WinGameScene({ p5, gameState: state, stats, sfx, fonts, onChangePlayerDirection, callbacks: { onSceneEnded: gotoNextLevel } })
  const leaderboardScene = new LeaderboardScene({ p5, sfx, fonts, callbacks: { onSceneEnded: hideLeaderboard } });
  const spriteRenderer = new SpriteRenderer({ p5, replay, gameState: state, screenShake });
  const renderer = new Renderer({ p5, fonts, replay, gameState: state, screenShake, spriteRenderer, tutorial });
  const modal = new Modal(p5, sfx);

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
   */
  p5.draw = draw;
  function draw() {
    handleDraw();
  }

  /**
   * https://p5js.org/reference/#/p5/keyPressed
   */
  p5.keyPressed = keyPressed;
  function keyPressed() {
    state.timeSinceLastInput = 0;
    resumeAudioContext();
    handleKeyPressed({
      p5,
      state,
      clickState,
      playerDirection: player.direction,
      moves,
      recentMoves,
      recentInputs,
      recentInputTimes,
      checkWillHit: checkPlayerWillHit,
      callbacks: {
        onHideStartScreen: () => { uiBindings.onButtonStartGameClick(); },
        onShowMainMenu: showMainMenu,
        onConfirmShowMainMenu: confirmShowMainMenu,
        onInit: () => initLevel(false),
        onStartGame: startGame,
        onToggleCasualMode: toggleCasualMode,
        onPause: pause,
        onUnpause: unpause,
        onWarpToLevel: warpToLevel,
        onStartMoving: startMoving,
        onStartRewinding: startRewinding,
        onAddMove: onAddMove,
        onEnterQuoteMode: enterQuoteMode,
        onEnterOstMode: enterOstMode,
        onShowLeaderboard: showLeaderboard,
      }
    });
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

  /**
   * https://p5js.org/reference/#/p5/mouseClicked
   */
  p5.mouseClicked = mouseClicked;
  function mouseClicked(event?: MouseEvent): void {
    if (state.appMode !== AppMode.Game) return;
    if (!state.isGameStarted) return;
    if (state.isPaused) return;
    state.timeSinceLastInput = 0;
    const canvasPosition = getElementPosition(canvas);
    // set the point clicked on the grid inside the canvas
    clickState.x = Math.floor((event.clientX - canvasPosition.x) / BLOCK_SIZE.x);
    clickState.y = Math.floor((event.clientY - canvasPosition.y) / BLOCK_SIZE.y);
    if (clickState.x < 0 || clickState.x >= GRIDCOUNT.x) return;
    if (clickState.y < 0 || clickState.y >= GRIDCOUNT.y) return;
    // get direction from player to point clicked
    const posX = clickState.x - player.position.x;
    const posY = clickState.y - player.position.y;
    if (!state.isMoving) {
      const dir = vectorToDir(posX, posY);
      clickState.directionToPoint = dir;
      clickState.didReceiveInput = true;
      keyPressed();
    } else {
      const dirX = vectorToDir(posX, 0);
      const dirY = vectorToDir(0, posY);
      if (dirX && validateMove(player.direction, dirX)) {
        clickState.directionToPoint = dirX;
        clickState.didReceiveInput = true;
        keyPressed();
      } else if (dirY && validateMove(player.direction, dirY)) {
        clickState.directionToPoint = dirY;
        clickState.didReceiveInput = true;
        keyPressed();
      } else {
        clickState.didReceiveInput = false;
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
    const offsetLeft = 150;
    difficultyButtons[1] = UI.drawButton('easy', 0 + offsetLeft, 280, () => startGame(1), uiElements).addClass('easy');
    difficultyButtons[2] = UI.drawButton('medium', 105 + offsetLeft, 280, () => startGame(2), uiElements).addClass('medium');
    difficultyButtons[3] = UI.drawButton('hard', 220 + offsetLeft, 280, () => startGame(3), uiElements).addClass('hard');
    difficultyButtons[4] = UI.drawButton('ULTRA', 108 + offsetLeft, 340, () => startGame(4), uiElements).addClass('ultra');
    for (let i = 1; i <= 4; i++) {
      difficultyButtons[i].addClass('difficulty')
    }
    const uiButtonOptions = (altText: string) => ({ parentId: 'main-ui-buttons', altText });
    const buttonOstMode = UI.drawButton('', -1, -1, () => enterOstMode(), uiElements, uiButtonOptions('Enter OST Mode')).id('ui-button-ost-mode').addClass('ui-sprite').addClass('headphones');
    const buttonQuoteMode = UI.drawButton('', -1, -1, () => enterQuoteMode(), uiElements, uiButtonOptions('Enter Quote Mode')).id('ui-button-quote-mode').addClass('ui-sprite').addClass('quote');
    const buttonLeaderboard = UI.drawButton('', -1, -1, () => showLeaderboard(), uiElements, uiButtonOptions('Show Leaderboard')).id('ui-button-leaderboard').addClass('ui-sprite').addClass('trophy');
    const buttonSettings = UI.drawButton('', -1, -1, () => showSettingsMenu(), uiElements, uiButtonOptions('Open Settings')).id('ui-button-settings').addClass('ui-sprite').addClass('gear');
    UI.addTooltip("OST Mode", buttonOstMode);
    UI.addTooltip("Quote Mode", buttonQuoteMode);
    UI.addTooltip("Leaderboard", buttonLeaderboard, 'right');
    UI.addTooltip("Settings", buttonSettings, 'right');
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
      startScreenShake({ magnitude: 3, normalizedTime: 0.5, force: true })
    }, 600)
  }

  function hideLeaderboard() {
    state.appMode = AppMode.Game;
    playSound(Sound.unlock, 1, true);
    showMainMenuUI();
  }

  function startGame(difficultyIndex = 2) {
    if (!state.isPreloaded) return;
    if (state.isGameStarting) return;
    state.isGameStarting = true;
    resetStats();
    UI.disableScreenScroll();
    setTimeout(() => {
      musicPlayer.stopAllTracks();
    }, 0)
    playSound(Sound.uiConfirm, 1, true);
    startCoroutine(startGameRoutine(difficultyIndex));
  }

  function* startGameRoutine(difficultyIndex = 2): IEnumerator {
    const button = difficultyButtons[difficultyIndex];
    if (button) button.addClass('selected');
    if (!DEBUG_EASY_LEVEL_EXIT) {
      yield* waitForTime(1000, (t) => {
        if (button) {
          const freq = .2;
          const shouldShow = t % freq > freq * 0.5;
          button.style('visibility', shouldShow ? 'visible' : 'hidden');
        }
      });
    }
    stopReplay();
    level = START_LEVEL
    setLevelIndexFromCurrentLevel();
    initLevel()
    difficulty = getDifficultyFromIndex(difficultyIndex);
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
  }

  function showSettingsMenu() {
    UI.showSettingsMenu();
    uiBindings.refreshFieldValues();
    playSound(Sound.unlock, 1, true);
  }

  function renderDifficultyUI() {
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderDifficulty(difficulty.index, state.isShowingDeathColours, state.isCasualModeEnabled);
  }

  function renderHeartsUI() {
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.isCasualModeEnabled) {
      UI.renderCasualRewindTip();
    } else {
      UI.renderHearts(state.lives, state.isShowingDeathColours);
    }
  }

  function renderScoreUI(score = stats.score) {
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    if (state.isCasualModeEnabled) return;
    UI.renderScore(score, state.isShowingDeathColours);
  }

  function renderLevelName() {
    if (state.isGameWon) return;
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderLevelName(level.name, state.isShowingDeathColours);
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
      if (!segments[i]) continue;
      if (!uniquePositions[getCoordIndex(segments[i])]) { size++; }
      uniquePositions[getCoordIndex(segments[i])] = true;
    }
    return size + 1;
  }

  function initLevel(shouldShowTransitions = true) {
    if (replay.mode === ReplayMode.Playback || DEBUG_EASY_LEVEL_EXIT) {
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
    state.hurtGraceTime = HURT_GRACE_TIME + (level.extraHurtGraceTime ?? 0);
    state.lives = MAX_LIVES;
    screenShake.timeSinceStarted = Infinity;
    screenShake.timeSinceLastStep = Infinity;
    screenShake.magnitude = 1;
    screenShake.timeScale = 1;
    state.targetSpeed = 1;
    state.currentSpeed = 1;
    state.steps = 0;
    state.frameCount = 0;
    state.lastHurtBy = HitType.Unknown;
    moves = [];
    recentMoves = [null, null, null, null];
    recentInputs = [null, null, null, null];
    recentInputTimes = [Infinity, Infinity, Infinity, Infinity];
    barriers = [];
    doors = [];
    apples = [];
    segments = []
    decoratives1 = [];
    decoratives2 = [];
    particleSystems = [];
    barriersMap = {};
    segmentsMap = {};
    doorsMap = {};
    nospawnsMap = {};
    portals = { ...DEFAULT_PORTALS() };
    portalsMap = {};
    portalParticlesStarted = {};

    renderer.reset();
    UI.disableScreenScroll();
    UI.clearLabels();
    clearUI();
    modal.hide();
    winLevelScene.reset();
    winGameScene.reset();
    stopAction(Action.FadeMusic);
    startAction(fadeMusic(1, 100), Action.FadeMusic);
    sfx.setGlobalVolume(settings.sfxVolume);

    if (shouldShowTransitions) {
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
        })
    } else {
      if (replay.mode !== ReplayMode.Playback && state.isGameStarted) {
        musicPlayer.play(level.musicTrack);
      }
      renderDifficultyUI();
      renderHeartsUI();
      renderScoreUI();
      renderLevelName();
    }

    if (!state.isGameStarted && replay.mode === ReplayMode.Playback) {
      startAction(mainTitleFader.setTitleVariant(level.titleVariant ?? TitleVariant.GrayBlue), Action.SetTitleVariant, true);
    }

    const levelData = buildLevel({ p5, level });
    player.position = levelData.playerSpawnPosition;
    barriers = levelData.barriers;
    barriersMap = levelData.barriersMap;
    doors = levelData.doors;
    doorsMap = levelData.doorsMap;
    apples = levelData.apples;
    decoratives1 = levelData.decoratives1;
    decoratives2 = levelData.decoratives2;
    nospawnsMap = levelData.nospawnsMap;
    portals = levelData.portals;
    portalsMap = levelData.portalsMap;

    // create snake parts
    let x = player.position.x;
    for (let i = 0; i < (level.snakeStartSizeOverride || START_SNAKE_SIZE); i++) {
      if (i < 3) x--;
      const segment = p5.createVector(x, player.position.y);
      segments.push(segment);
      segmentsMap[getCoordIndex(segment)] = true;
    }

    // add initial apples
    const numApplesStart = level.numApplesStart || NUM_APPLES_START;
    for (let i = 0; i < numApplesStart; i++) {
      addApple();
    }
    resetLightmap(lightMap, level.globalLight ?? GLOBAL_LIGHT_DEFAULT);
  }

  function handleDraw() {
    actions.tick();

    if (state.isPaused) return;

    setTimeout(() => { tickCoroutines(); }, 0);

    if (state.appMode === AppMode.Quote) {
      p5.background("#000");
      return;
    }

    if (p5.keyIsDown(p5.SHIFT) && (state.isMoving || state.isRewinding)) {
      state.isSprinting = true;
    } else {
      state.isSprinting = false;
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
    drawPortals();

    for (let i = 0; i < barriers.length; i++) {
      drawBarrier(barriers[i]);
    }

    for (let i = 0; i < doors.length; i++) {
      drawDoor(doors[i]);
    }

    if (replay.mode === ReplayMode.Capture) {
      renderer.drawCaptureMode();
    }

    const applesMap: Record<string, number> = {};
    for (let i = 0; i < apples.length; i++) {
      if (!apples[i]) continue;
      drawApple(apples[i]);
      if (state.isLost || state.isExitingLevel) continue;
      applesMap[getCoordIndex(apples[i])] = i;
    }

    renderer.drawPlayerMoveArrows(player.position, moves.length > 0 ? moves[0] : player.direction);

    for (let i = 0; i < GRIDCOUNT.x * GRIDCOUNT.y; i++) {
      segmentsMap[i] = false;
    }
    for (let i = 0; i < segments.length; i++) {
      drawPlayerSegment(segments[i]);
      if (state.isLost || state.isExitingLevel) continue;
      segmentsMap[getCoordIndex(segments[i])] = true;
      const appleFound = applesMap[getCoordIndex(segments[i])];
      if (appleFound != undefined && appleFound >= 0) {
        applesMap[getCoordIndex(segments[i])] = -1;
        spawnAppleParticles(segments[i]);
        growSnake(appleFound);
        incrementScore();
      }
    }

    const globalLight = level.globalLight ?? GLOBAL_LIGHT_DEFAULT;
    if (state.isGameStarted && replay.mode !== ReplayMode.Playback && globalLight < 1) {
      updateLighting(lightMap, globalLight, player.position, portals);
      drawLighting(lightMap, renderer);
    }

    drawPlayerHead(player.position);
    drawParticles(10);

    renderer.drawTutorialMoveControls();
    renderer.drawTutorialRewindControls(player.position, canRewind);
    renderer.drawFps();
    if (!state.isGameStarted) leaderboardScene.draw();

    if (state.isLost) return;
    if (!state.isGameStarted && replay.mode !== ReplayMode.Playback) return;

    // check if head has reached an apple
    const appleFound = applesMap[getCoordIndex(player.position)];
    if (appleFound != undefined && appleFound >= 0) {
      spawnAppleParticles(player.position);
      growSnake(appleFound);
      incrementScore();
      increaseSpeed();
      playSound(Sound.eat);
    }

    handlePortalTravel();

    const didHit = checkHasHit(player.position);
    state.isLost = didHit;

    apples = apples.filter(apple => !!apple);

    // handle snake hurt
    if (state.isLost && state.lives > 0) {
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
      hurtSnake();
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

    // handle snake death
    if (state.isLost) {
      spawnHurtParticles();
      renderHeartsUI();
      flashScreen();
      showGameOver();
      playSound(Sound.death);
      return;
    }

    // handle snake movement
    if (state.isMoving && replay.mode !== ReplayMode.Playback) {
      const timeNeededUntilNextMove = getTimeNeededUntilNextMove();
      if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
        const normalizedSpeed = clamp(difficulty.speedLimit / (timeNeededUntilNextMove || 0.001), 0, 1);
        const didMove = movePlayer(normalizedSpeed);
        if (didMove && replay.mode === ReplayMode.Capture) {
          replay.positions[state.frameCount] = [player.position.x, player.position.y];
        }
        if (state.isExitingLevel) {
          if (!state.isExited) incrementScoreWhileExitingLevel();
          renderScoreUI();
        }
      } else {
        state.timeSinceLastMove += p5.deltaTime;
      }
      updateCurrentMoveSpeed();
      stats.totalTimeElapsed += p5.deltaTime;
    }

    // handle snake rewind
    if (state.isRewinding && replay.mode === ReplayMode.Disabled) {
      const timeNeededUntilNextMove = getTimeNeededUntilNextMove();
      if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
        rewindPlayer();
      } else {
        state.timeSinceLastMove += p5.deltaTime;
      }
      updateCurrentMoveSpeed();
    }

    // tick time elapsed
    if (state.isMoving || replay.mode === ReplayMode.Playback) {
      state.timeElapsed += p5.deltaTime;
    }

    // handle snake movement during replay
    if (replay.mode === ReplayMode.Playback && !didHit) {
      const position: [number, number] | undefined = replay.positions[state.frameCount];
      if (position != undefined) {
        moveSegments();
        player.position.set(position[0], position[1])
        player.direction = getDirectionToFirstSegment();
      }
    }

    // capture snake movement after hit and rebound
    if (replay.mode === ReplayMode.Capture && didHit) {
      replay.positions[state.frameCount] = [player.position.x, player.position.y];
    }

    if (getHasClearedLevel() && !state.isDoorsOpen) {
      openDoors();
      playSound(Sound.doorOpen);
    }

    // handle snake exit start
    if (!state.isExitingLevel && !state.isGameWon && getHasSegmentExited(player.position)) {
      state.isExitingLevel = true;
      winLevelScene.reset();
      if (replay.mode !== ReplayMode.Playback) {
        musicPlayer.stopAllTracks();
        playSound(Sound.winLevel);
      }
    }

    if (state.isExitingLevel && replay.mode !== ReplayMode.Playback) {
      winLevelScene.draw();
    }

    // handle snake exit finish
    if (!state.isExited && !state.isGameWon && segments.every(segment => getHasSegmentExited(segment))) {
      state.isExited = true;
      if (replay.mode === ReplayMode.Playback) {
        proceedToNextReplayClip();
      } else if (DEBUG_EASY_LEVEL_EXIT) {
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
            const perfectBonus = isPerfect ? getPerfectBonus() : 0;
            const allApplesBonus = (!isPerfect && hasAllApples) ? getAllApplesBonus() : 0;
            addPoints(getLevelClearBonus() + getLivesLeftBonus() * state.lives + perfectBonus + allApplesBonus);
            renderScoreUI();
          },
        });
      }
    }

    // handle snake teleport on game win
    if (state.isGameWon) {
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
      winGameScene.draw();
    }

    state.timeSinceHurt += p5.deltaTime;
    state.timeSinceLastInput += p5.deltaTime;
    state.timeSinceLastTeleport += p5.deltaTime;
    state.frameCount += 1;
    for (let i = recentInputTimes.length - 1; i >= 0; i--) {
      recentInputTimes[i] += p5.deltaTime;
    }
    renderer.tick();
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
    return Math.max(
      BASE_TICK_MS / Math.max(state.currentSpeed * difficulty.speedMod, 1),
      state.isSprinting ? difficulty.sprintLimit : difficulty.speedLimit
    );
  }

  // A NOTE ON THE SPEED SYSTEM
  // Yes, I know it's hacky and relies on magic numbers.
  // A better solution would be to assign a quadratic curve to each difficulty.
  // I may do think in a future iteration if I feel up to it. Right now, the game is good enough.
  function updateCurrentMoveSpeed() {
    if (state.isSprinting) {
      const deltaSpeed = 10 * (p5.deltaTime / SPRINT_INCREMENT_SPEED_MS);
      state.currentSpeed += deltaSpeed;
      if (state.currentSpeed > 10) {
        state.currentSpeed = 10;
      }
      return;
    }
    if (state.currentSpeed === state.targetSpeed) {
      return;
    }
    if (state.currentSpeed < state.targetSpeed) {
      const t = Easing.inOutCubic(clamp((state.timeSinceHurt - HURT_STUN_TIME) * 0.5, 0, 1));
      const diff = Math.abs(state.targetSpeed - state.currentSpeed);
      const deltaSpeed = clamp(diff, 1, SPEED_INCREMENT) * (p5.deltaTime / SPEED_INCREMENT_SPEED_MS) * p5.lerp(0, 1, t);
      state.currentSpeed += deltaSpeed;
      if (state.currentSpeed > state.targetSpeed) state.currentSpeed = state.targetSpeed;
    } else if (state.currentSpeed > state.targetSpeed) {
      const deltaSpeed = 10 * (p5.deltaTime / SPRINT_INCREMENT_SPEED_MS);
      state.currentSpeed -= deltaSpeed;
      if (state.currentSpeed < state.targetSpeed) state.currentSpeed = state.targetSpeed;
    }
  }

  function spawnAppleParticles(position: Vector) {
    particleSystems.push(new AppleParticleSystem(p5, level, position));
    particleSystems.push(new AppleParticleSystem(p5, level, position, { spawnMod: .3, speedMod: 4, scaleMod: .5 }));
  }

  function flashScreen() {
    if (replay.mode === ReplayMode.Playback) return;
    screenFlashElement = UI.drawScreenFlash();
    setTimeout(() => {
      screenFlashElement?.remove();
    }, FRAMERATE * 2)
  }

  function startScreenShake({ magnitude = 1, normalizedTime = 0, timeScale = 1, force = false } = {}) {
    if (!force && replay.mode === ReplayMode.Playback) return;
    screenShake.timeSinceStarted = normalizedTime * SCREEN_SHAKE_DURATION_MS;
    screenShake.magnitude = magnitude;
    screenShake.timeScale = timeScale;
  }

  function updateScreenShake() {
    screenShake.timeSinceStarted += p5.deltaTime;
    screenShake.timeSinceLastStep += p5.deltaTime * screenShake.timeScale;
    if (screenShake.offset == null) screenShake.offset = p5.createVector(0, 0);
    if (screenShake.timeSinceStarted < SCREEN_SHAKE_DURATION_MS) {
      if (screenShake.timeSinceLastStep >= 25) {
        screenShake.offset.x = (p5.random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
        screenShake.offset.y = (p5.random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
        screenShake.timeSinceLastStep = 0;
      }
    } else {
      screenShake.offset.x = 0;
      screenShake.offset.y = 0;
      screenShake.magnitude = 1;
      screenShake.timeScale = 1;
    }
  }

  function getHasClearedLevel() {
    if (state.isGameWon) return false;
    if (DEBUG_EASY_LEVEL_EXIT && stats.applesEatenThisLevel > 0) return true;
    if (stats.applesEatenThisLevel >= level.applesToClear * difficulty.applesMod) return true;
    if (state.timeElapsed >= level.timeToClear && stats.applesEatenThisLevel >= level.applesToClear * difficulty.applesMod * 0.5) return true;
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

    if (segmentsMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitSelf;
      return true;
    }

    if (doorsMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitDoor;
      return true;
    }

    if (barriersMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitBarrier;
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
        break;
      case PortalExitMode.SameDirection:
        break;
    }
    state.timeSinceLastMove = 0;
    state.timeSinceLastTeleport = 0;
    player.position.set(portal.link);
    player.position.add(dirToUnitVector(p5, player.direction));
  }

  function movePlayer(normalizedSpeed = 0): boolean {
    if (!state.isMoving) return false;
    if (state.isExited) return false;
    state.timeSinceLastMove = 0;
    const prevDirection = player.direction;
    if (moves.length > 0 && !state.isExitingLevel) {
      player.direction = moves.shift()
    }
    const currentMove = dirToUnitVector(p5, player.direction);
    const futurePosition = player.position.copy().add(currentMove);

    // disallow snake moving backwards into itself
    if (segments.length > 0 && futurePosition.equals(segments[0].x, segments[0].y)) {
      player.direction = prevDirection;
      return false;
    }

    // determine if next move will be into something, allow for grace period before injuring snakey
    const willHitSomething = checkHasHit(futurePosition) || checkPortalTeleportWillHit(futurePosition, player.direction);
    if (willHitSomething && state.hurtGraceTime > 0) {
      state.hurtGraceTime -= p5.deltaTime;
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
        segments[i].set(player.position);
      } else {
        segments[i].set(segments[i - 1]);
      }
    }
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
    player.direction = getDirectionToFirstSegment();
  }

  /**
   * actions to apply when snake has taken damage
   */
  function hurtSnake() {
    reboundSnake(segments.length > 3 ? 2 : 1);
    // reset any queued up moves so that next action player takes feels more intentional
    moves = [];
    // set current direction to be the direction from the first segment towards the snake head
    player.direction = getDirectionToFirstSegment();
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
    const position = player.position.copy()
    particleSystems.push(new ImpactParticleSystem(p5, level, position));
    particleSystems.push(new ImpactParticleSystem(p5, level, position, { spawnMod: .3, speedMod: 1.5, scaleMod: .5 }));
  }

  function getDirectionToFirstSegment() {
    return getDirectionBetween(player.position, segments[0]);
  }

  function getDirectionBetween(from: Vector, to: Vector) {
    if (!from || !to) return DIR.RIGHT;
    const diff = from.copy().sub(to);
    if (diff.x === -1) return DIR.LEFT;
    if (diff.x === 1) return DIR.RIGHT;
    if (diff.y === -1) return DIR.UP;
    if (diff.y === 1) return DIR.DOWN;
    return DIR.RIGHT;
  }

  /**
   * Move snake back after it hits something
   */
  function reboundSnake(numTimes = 2) {
    for (let times = 0; times < numTimes; times++) {
      if (segments.length > 1) {
        player.position.set(segments[0]);
      }
      for (let i = 0; i < segments.length - 1; i++) {
        segments[i].set(segments[i + 1]);
      }
    }
  }

  /**
   * actions to apply when snake eats an apple
   */
  function growSnake(appleIndex = -1) {
    if (state.isLost) return;
    if (appleIndex < 0) return;
    startScreenShake({ magnitude: 0.4, normalizedTime: 0.8 });
    removeApple(appleIndex);
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
    if (difficulty.index === 4) {
      state.targetSpeed += 1;
    } else if (difficulty.index === 1) {
      state.targetSpeed += 1.2;
    } else {
      state.targetSpeed += SPEED_INCREMENT * Math.min(difficulty.speedMod, 1);
    }
  }

  function removeApple(index = -1) {
    if (index < 0) return;
    apples = apples.slice(0, index).concat(apples.slice(index + 1))
  }

  function addApple(numTries = 0) {
    if (level.disableAppleSpawn) return;
    if (replay.mode === ReplayMode.Playback) {
      const appleToSpawn = replay.applesToSpawn.shift();
      if (!appleToSpawn) { console.warn('ran out of apples to spawn during replay mode'); return; }
      const apple = p5.createVector(appleToSpawn[0], appleToSpawn[1]);
      apples.push(apple);
      return;
    }
    const x = Math.floor(p5.random(GRIDCOUNT.x - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT.y - 2)) + 1;
    const apple = p5.createVector(x, y);
    const spawnedInsideOfSomething = barriersMap[getCoordIndex(apple)]
      || doorsMap[getCoordIndex(apple)]
      || nospawnsMap[getCoordIndex(apple)];
    if (spawnedInsideOfSomething) {
      if (numTries < 30) addApple(numTries + 1);
    } else {
      apples.push(apple);
      if (replay.mode === ReplayMode.Capture) {
        replay.applesToSpawn.push([apple.x, apple.y]);
      }
    }
  }

  function addSnakeSegment() {
    segments.push(segments[segments.length - 1].copy());
  }

  function drawBackground() {
    p5.background(state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.background : level.colors.background);
  }

  function drawPlayerHead(vec: Vector) {
    const options = { is3d: true };
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead,
      options);
    const direction = moves.length > 0 ? moves[0] : player.direction;
    if (state.isLost) {
      spriteRenderer.drawImage3x3(Image.SnekHeadDead, vec.x, vec.y, getRotationFromDirection(direction));
    } else {
      spriteRenderer.drawImage3x3(Image.SnekHead, vec.x, vec.y, getRotationFromDirection(direction));
    }
  }

  function getRotationFromDirection(direction: DIR) {
    switch (direction) {
      case DIR.UP:
        return Math.PI * 1.5;
      case DIR.DOWN:
        return Math.PI * .5;
      case DIR.LEFT:
        return Math.PI * 1;
      case DIR.RIGHT:
        return 0;
    }
  }

  function drawPlayerSegment(vec: Vector) {
    const options = { is3d: true };
    if (state.timeSinceHurt < HURT_STUN_TIME) {
      if (Math.floor(state.timeSinceHurt / HURT_FLASH_RATE) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000", options);
      } else {
        renderer.drawSquare(vec.x, vec.y, "#fff", "#fff", options);
      }
    } else {
      renderer.drawSquare(vec.x, vec.y,
        state.isShowingDeathColours ? PALETTE.deathInvert.playerTail : level.colors.playerTail,
        state.isShowingDeathColours ? PALETTE.deathInvert.playerTailStroke : level.colors.playerTailStroke,
        options);
    }
  }

  function drawApple(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.apple : level.colors.apple,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.appleStroke : level.colors.appleStroke,
      { size: 0.8, is3d: true });
  }

  function drawBarrier(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.barrier : level.colors.barrier,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.barrierStroke : level.colors.barrierStroke,
      { is3d: true });
    renderer.drawX(vec.x, vec.y, state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.barrierStroke : level.colors.barrierStroke);
  }

  function drawDoor(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.door : level.colors.door,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.doorStroke : level.colors.doorStroke,
      { is3d: true });
  }

  function drawDecorative1(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco1 : level.colors.deco1,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco1Stroke : level.colors.deco1Stroke);
  }

  function drawDecorative2(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco2 : level.colors.deco2,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco2Stroke : level.colors.deco2Stroke);
  }

  function drawParticles(zIndexPass = 0) {
    const tempParticleSystems = [];
    for (let i = 0; i < particleSystems.length; i++) {
      if (!particleSystems[i]) continue;
      if (particleSystems[i].isActive()) {
        particleSystems[i].draw(p5, screenShake, zIndexPass);
        particleSystems[i].tick(p5);
        tempParticleSystems.push(particleSystems[i]);
      } else {
        delete particleSystems[i];
      }
    }
    particleSystems = tempParticleSystems;
  }

  function drawPortals() {
    for (let i = 0; i <= 9; i++) {
      for (let j = 0; j < portals[i as PortalChannel].length; j++) {
        const portalPosition = portals[i as PortalChannel][j];
        if (!portalPosition) continue;
        const portal = portalsMap[getCoordIndex(portalPosition)];
        if (!portal) continue;
        renderer.drawPortal(portal, state.isShowingDeathColours && replay.mode !== ReplayMode.Playback);
        if (!portalParticlesStarted[portal.hash]) {
          portalParticlesStarted[portal.hash] = true;
          const accent = PORTAL_CHANNEL_COLORS[portal.channel];
          particleSystems.push(new PortalParticleSystem(p5, portal.position, accent));
          particleSystems.push(new PortalParticleSystem(p5, portal.position, "#fff"));
          particleSystems.push(new PortalVortexParticleSystem(p5, portal.position, "#000"));
          particleSystems.push(new PortalVortexParticleSystem(p5, portal.position, "#fff"));
        }
      }
    }
  }

  function showGameOver() {
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
    startScreenShake({ magnitude: 3, normalizedTime: -HURT_STUN_TIME / SCREEN_SHAKE_DURATION_MS, timeScale: 0.1 });
    state.isShowingDeathColours = true;
    yield* waitForTime(HURT_STUN_TIME * 2.5);
    state.isShowingDeathColours = false;
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

  function* fadeMusic(toVolume: number, duration: number): IEnumerator {
    yield null;
    const startVolume = musicPlayer.getVolume();
    let t = 0;
    while (duration > 0 && t < 1) {
      musicPlayer.setVolume(p5.lerp(startVolume, toVolume, Easing.inOutCubic(clamp(t, 0, 1))));
      t += p5.deltaTime / duration;
      yield null;
    }
    musicPlayer.setVolume(toVolume);
    clearAction(Action.FadeMusic);
  }

  function* changeMusicSpeed(toSpeed: number, duration: number): IEnumerator {
    yield null;
    const startSpeed = musicPlayer.getPlaybackRate(level.musicTrack);
    let t = 0;
    while (duration > 0 && t < 1) {
      musicPlayer.setPlaybackRate(level.musicTrack, p5.lerp(startSpeed, toSpeed, Easing.inCubic(clamp(t, 0, 1))));
      t += p5.deltaTime / duration;
      yield null;
    }
    musicPlayer.setPlaybackRate(level.musicTrack, toSpeed);
    clearAction(Action.ChangeMusicSpeed);
  }

  // I will buy a beer for whoever can decipher my spaghetticode
  const getRandomMessage = (numIterations = 0): string => {
    const allMessages = (loseMessages[state.levelIndex] || []).concat(level.disableNormalLoseMessages ? [] : loseMessages[-1]);
    const relevantMessages = allMessages.filter(([message, callback]) => !callback || callback(state, stats, difficulty)).map((contents) => contents[0]);
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
    setLevelIndexFromCurrentLevel();
    initLevel();
  }

  function pause() {
    showPauseUI();
    sfx.play(Sound.unlock, 0.8);
    startAction(changeMusicSpeed(0, 3000), Action.ChangeMusicSpeed, true);
    startAction(fadeMusic(0.6, 2000), Action.FadeMusic, true);
  }

  function unpause() {
    clearUI();
    UI.hideSettingsMenu();
    sfx.play(Sound.unlock, 0.8);
    startAction(changeMusicSpeed(1, 1500), Action.ChangeMusicSpeed, true);
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
    UI.drawButton("MAIN MENU", 20, 20, confirmShowMainMenu, uiElements).addClass('minimood');
    UI.drawButton("SETTINGS", 445, 20, showInGameSettingsMenu, uiElements).addClass('minimood');

    if (!queryParams.enableWarp && !state.isCasualModeEnabled) {
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
    UI.drawButton("01", x, yRow1, () => warpToLevel(1), uiElements);
    UI.drawButton("02", x += offset, yRow1, () => warpToLevel(2), uiElements);
    UI.drawButton("03", x += offset, yRow1, () => warpToLevel(3), uiElements);
    UI.drawButton("04", x += offset, yRow1, () => warpToLevel(4), uiElements);
    UI.drawButton("05", x += offset, yRow1, () => warpToLevel(5), uiElements);
    UI.drawButton("06", x += offset, yRow1, () => warpToLevel(6), uiElements);
    x = xInitial;
    UI.drawButton("07", x, yRow2, () => warpToLevel(7), uiElements);
    UI.drawButton("08", x += offset, yRow2, () => warpToLevel(8), uiElements);
    UI.drawButton("09", x += offset, yRow2, () => warpToLevel(9), uiElements);
    UI.drawButton("10", x += offset, yRow2, () => warpToLevel(10), uiElements);
    UI.drawButton("11", x += offset, yRow2, () => warpToLevel(11), uiElements);
    UI.drawButton("12", x += offset, yRow2, () => warpToLevel(12), uiElements);
    x = xInitial;
    UI.drawButton("13", x, yRow3, () => warpToLevel(13), uiElements);
    UI.drawButton("14", x += offset, yRow3, () => warpToLevel(14), uiElements);
    UI.drawButton("15", x += offset, yRow3, () => warpToLevel(15), uiElements);
    UI.drawButton("S1", x += offset, yRow3, () => warpToLevel(110), uiElements);
    UI.drawButton("S2", x += offset, yRow3, () => warpToLevel(120), uiElements);
    UI.drawButton("S3", x += offset, yRow3, () => warpToLevel(130), uiElements);
    x = xInitial;
    UI.drawButton("LL", x, yRow4, () => warpToLevel(99), uiElements);
  }

  function openDoors() {
    doors = [];
    doorsMap = {};
    state.isDoorsOpen = true;
  }

  function gotoNextLevel() {
    if (replay.mode === ReplayMode.Playback) return;

    const showQuoteOnLevelWin = !!level.showQuoteOnLevelWin && !DEBUG_EASY_LEVEL_EXIT;
    stats.numLevelsCleared += 1;
    stats.numLevelsEverCleared += 1;
    stats.applesEatenThisLevel = 0;
    state.levelIndex++;
    musicPlayer.stopAllTracks();
    level = LEVELS[state.levelIndex % LEVELS.length];
    if (level === START_LEVEL) {
      difficulty.index++;
      difficulty = getDifficultyFromIndex(difficulty.index);
      resetStats();
    }

    maybeSaveReplayStateToFile();

    if (showQuoteOnLevelWin) {
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

      state.levelIndex = clip.levelIndex;
      level = LEVELS[state.levelIndex % LEVELS.length];
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
      const fileName = `snek-data-${replay.levelIndex}-${replay.levelName}-${replay.timeCaptureStarted}.json`;
      download(JSON.stringify(replay), fileName, 'application/json');
      console.log(`saved file "${fileName}"`);
    } catch (err) {
      console.error(err);
    }
  }
}
