import P5, { Element, Vector } from 'p5';

import {
  MAIN_TITLE_SCREEN_LEVEL,
  START_LEVEL,
  LEVELS,
} from './levels';
import {
  TITLE,
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
} from './constants';
import { clamp, dirToUnitVector, getCoordIndex, getDifficultyFromIndex, getWarpLevelFromNum, invertDirection, parseUrlQueryParams, removeArrayElement, shuffleArray } from './utils';
import { ParticleSystem } from './particle-system';
import { UI } from './ui';
import { DIR, HitType, Difficulty, GameState, IEnumerator, Level, PlayerState, Replay, ReplayMode, ScreenShakeState, Sound, Stats, Portal, PortalChannel, PortalExitMode, LoseMessage, MusicTrack, GameSettings, AppMode } from './types';
import { PALETTE } from './palettes';
import { Coroutines } from './coroutines';
import { Fonts } from './fonts';
import { quotes as allQuotes } from './quotes';
import { handleKeyPressed } from './controls';
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
import { getMusicVolume, resumeAudioContext, setMusicVolume, setSfxVolume } from './audio';
import { Easing } from './easing';

let level: Level = MAIN_TITLE_SCREEN_LEVEL;
let difficulty: Difficulty = { ...DIFFICULTY_EASY };

const queryParams = parseUrlQueryParams();
const settings: GameSettings = {
  musicVolume: 1,
  sfxVolume: 1,
}
const state: GameState = {
  appMode: AppMode.Game,
  isGameStarted: false,
  isGameStarting: false,
  isPaused: false,
  isMoving: false,
  isSprinting: false,
  isLost: false,
  isDoorsOpen: false,
  isExitingLevel: false,
  isExited: false,
  isShowingDeathColours: false,
  levelIndex: 0,
  timeElapsed: 0,
  timeSinceLastMove: Infinity,
  timeSinceHurt: Infinity,
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

const loseMessages: Record<number, LoseMessage[]> = {}

let moves: DIR[] = []; // moves that the player has queued up
let segments: Vector[] = []; // snake segments
let apples: Vector[] = []; // food that the snake can eat to grow and score points
let barriers: Vector[] = []; // permanent structures that damage the snake
let doors: Vector[] = []; // like barriers, except that they disappear once the player has "cleared" a level (player must still exit the level though)
let decoratives1: Vector[] = []; // bg decorative elements
let decoratives2: Vector[] = []; // bg decorative elements

let barriersMap: Record<number, boolean> = {};
let doorsMap: Record<number, boolean> = {};
let nospawnsMap: Record<number, boolean> = {}; // no-spawns are designated spots on the map where an apple cannot spawn

let portals: Record<PortalChannel, Vector[]> = { ...DEFAULT_PORTALS() };
let portalsMap: Record<number, Portal> = {};
let portalParticlesStarted: Record<number, boolean> = {}

let uiElements: Element[] = [];
let particleSystems: ParticleSystem[] = [];
let screenFlashElement: Element;

let quotes = allQuotes.slice();

const difficultyButtons: Record<number, P5.Element> = {}

enum Action {
  FadingMusic = 'FadingMusic',
  ExecuteQuotesMode = "ExecuteQuotesMode"
}
type ActionKey = keyof typeof Action

export const sketch = (p5: P5) => {
  const coroutines = new Coroutines(p5);
  const startCoroutine = coroutines.start;
  const stopAllCoroutines = coroutines.stopAll;
  const tickCoroutines = coroutines.tick;
  const waitForTime = coroutines.waitForTime;

  // actions are unique, singleton coroutines, meaning that only one coroutine of a type can run at a time
  const actionIds: Record<ActionKey, string | null> = {
    FadingMusic: null,
    ExecuteQuotesMode: null,
  };
  const startAction = (enumerator: IEnumerator, actionKey: Action) => {
    if (replay.mode === ReplayMode.Playback) {
      return;
    }
    coroutines.stop(actionIds[actionKey]);
    coroutines.start(enumerator);
    actionIds[actionKey] = coroutines.start(enumerator);
  }
  const stopAction = (actionKey: Action) => {
    coroutines.stop(actionIds[actionKey]);
    actionIds[actionKey] = null;
  }

  const fonts = new Fonts(p5);
  const sfx = new SFX();
  const musicPlayer = new MusicPlayer();
  const winScene = new WinLevelScene(p5, sfx, fonts, { onSceneEnded: gotoNextLevel });
  const renderer = new Renderer({ p5, fonts, replay, state, screenShake });

  /**
   * https://p5js.org/reference/#/p5/preload
   */
  p5.preload = preload;
  function preload() {
    UI.setP5Instance(p5);
    fonts.load();
    sfx.load();
    musicPlayer.load(level.musicTrack);
  }

  /**
   * https://p5js.org/reference/#/p5/setup
   */
  p5.setup = setup;
  function setup() {
    state.appMode = AppMode.Game;
    state.isGameStarted = false;
    state.isGameStarting = false;
    level = MAIN_TITLE_SCREEN_LEVEL;

    UI.setP5Instance(p5);
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y);
    p5.frameRate(FRAMERATE);
    musicPlayer.stopAllTracks();
    musicPlayer.play(MAIN_TITLE_SCREEN_LEVEL.musicTrack);
    setMusicVolume(settings.musicVolume);
    setLevelIndexFromCurrentLevel();
    init(false);
    stopAllCoroutines();
    startReplay();
    winScene.reset();

    // override state after init()
    stats.numDeaths = 0;
    stats.numLevelsCleared = 0;
    stats.numLevelsEverCleared = 0;
    stats.numPointsEverScored = 0;
    stats.numApplesEverEaten = 0;
    stats.score = 0;
    stats.applesEaten = 0;
    stats.applesEatenThisLevel = 0;
    stats.totalTimeElapsed = 0;

    UI.enableScreenScroll();
    UI.clearLabels();
    UI.drawDarkOverlay(uiElements);
    UI.drawTitle(TITLE, "#ffc000", 5, true, uiElements);
    UI.drawTitle(TITLE, "#cdeaff", 0, false, uiElements);
    const offsetLeft = 150;
    difficultyButtons[1] = UI.drawButton("EASY", 0 + offsetLeft, 280, () => startGame(1), uiElements).addClass('easy');
    difficultyButtons[2] = UI.drawButton("MEDIUM", 105 + offsetLeft, 280, () => startGame(2), uiElements).addClass('medium');
    difficultyButtons[3] = UI.drawButton("HARD", 220 + offsetLeft, 280, () => startGame(3), uiElements).addClass('hard');
    difficultyButtons[4] = UI.drawButton("ULTRA", 108 + offsetLeft, 340, () => startGame(4), uiElements).addClass('ultra');
    for (let i = 1; i <= 4; i++) {
      difficultyButtons[i].addClass('difficulty')
    }

    hydrateLoseMessages(-1);
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
    resumeAudioContext();
    handleKeyPressed(p5, state, player.direction, moves, {
      onSetup: setup,
      onInit: () => init(false),
      onStartGame: startGame,
      onClearUI: clearUI,
      onShowPortalUI: showPortalUI,
      onWarpToLevel: warpToLevel,
      onStartMoving: startMoving,
      onAddMove: move => moves.push(move),
      onEnterQuoteMode: enterQuoteMode,
    });
  }

  p5.mouseClicked = mouseClicked;
  function mouseClicked() {
    resumeAudioContext();
    if (state.isGameStarted) return;
    if (state.isGameStarting) return;
    if (state.appMode != AppMode.Game) return;
    if (musicPlayer.isPlaying(MAIN_TITLE_SCREEN_LEVEL.musicTrack)) return;
    musicPlayer.play(MAIN_TITLE_SCREEN_LEVEL.musicTrack);
  }

  function startGame(difficultyIndex = 2) {
    if (state.isGameStarting) return;
    state.isGameStarting = true;
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
    yield* waitForTime(1000, (t) => {
      if (button) {
        const freq = .2;
        const shouldShow = t % freq > freq * 0.5;
        button.style('visibility', shouldShow ? 'visible' : 'hidden');
      }
    });

    stopReplay();
    level = START_LEVEL
    setLevelIndexFromCurrentLevel();
    init()
    difficulty = getDifficultyFromIndex(difficultyIndex);
    state.isGameStarting = false;
    state.isGameStarted = true;
    replay.difficulty = { ...difficulty };
  }

  function playSound(sound: Sound, volume = 1, force = false) {
    if (!force && replay.mode === ReplayMode.Playback) return;
    sfx.play(sound, volume);
  }

  function clearUI(force = false) {
    if (!force && replay.mode === ReplayMode.Playback) return;
    uiElements.forEach(element => element.remove())
    uiElements = [];
  }

  function renderDifficultyUI() {
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderDifficulty(difficulty.index, state.isShowingDeathColours);
  }

  function renderHeartsUI() {
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderHearts(state.lives, state.isShowingDeathColours);
  }

  function renderScoreUI(score = stats.score) {
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderScore(score, state.isShowingDeathColours);
  }

  function renderLevelName() {
    if (replay.mode === ReplayMode.Playback) return;
    UI.renderLevelName(level.name, state.isShowingDeathColours);
  }

  function startMoving() {
    if (!state.isMoving) {
      playSound(Sound.moveStart);
    }
    state.isMoving = true;
  }

  function init(shouldShowTransitions = true) {
    if (replay.mode === ReplayMode.Playback) {
      shouldShowTransitions = false;
      replay.shouldProceedToNextClip = true;
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
    state.isSprinting = false;
    state.isLost = false;
    state.isDoorsOpen = false;
    state.isExitingLevel = false;
    state.isExited = false;
    state.isShowingDeathColours = false;
    state.timeElapsed = 0;
    state.timeSinceLastMove = Infinity;
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
    barriers = [];
    doors = [];
    apples = [];
    segments = []
    decoratives1 = [];
    decoratives2 = [];
    particleSystems = [];
    barriersMap = {};
    doorsMap = {};
    nospawnsMap = {};
    portals = { ...DEFAULT_PORTALS() };
    portalsMap = {};
    portalParticlesStarted = {};

    renderer.reset();
    UI.disableScreenScroll();
    UI.clearLabels();
    clearUI();
    winScene.reset();
    stopAction(Action.FadingMusic);
    startAction(fadeMusic(1, 100), Action.FadingMusic);
    setSfxVolume(settings.sfxVolume);

    if (shouldShowTransitions) {
      musicPlayer.load(level.musicTrack);
      const buildSceneAction = buildSceneActionFactory(p5, sfx, fonts, state);
      Promise.resolve()
        .then(buildSceneAction(level.titleScene))
        .then(buildSceneAction(level.creditsScene))
        .catch(err => {
          console.error(err);
        }).finally(() => {
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
      segments.push(p5.createVector(x, player.position.y));
    }

    // add initial apples
    const numApplesStart = level.numApplesStart || NUM_APPLES_START;
    for (let i = 0; i < numApplesStart; i++) {
      addApple();
    }
  }

  function handleDraw() {
    if (state.isPaused) return;

    setTimeout(() => { tickCoroutines(); }, 0);

    if (state.appMode === AppMode.Quote) {
      p5.background("#000");
      return;
    }

    if (p5.keyIsDown(p5.SHIFT) && state.isMoving) {
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

    const snakePositionsMap: Record<number, boolean> = {};
    for (let i = 0; i < segments.length; i++) {
      drawPlayerSegment(segments[i]);
      if (state.isLost || state.isExitingLevel) continue;
      snakePositionsMap[getCoordIndex(segments[i])] = true;
      const appleFound = applesMap[getCoordIndex(segments[i])];
      if (appleFound != undefined && appleFound >= 0) {
        applesMap[getCoordIndex(segments[i])] = -1;
        spawnAppleParticles(segments[i]);
        growSnake(appleFound);
        incrementScore();
      }
    }

    drawPlayerHead(player.position);
    drawParticles(10);

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

    const didHit = checkHasHit(player.position, snakePositionsMap);
    state.isLost = didHit;

    apples = apples.filter(apple => !!apple);

    // handle snake hurt
    if (state.isLost && state.lives > 0) {
      state.isLost = false;
      state.lives -= 1;
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
      startAction(duckMusicOnHurt(), Action.FadingMusic);
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
        const didMove = movePlayer(snakePositionsMap, normalizedSpeed);
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
      state.timeSinceHurt += p5.deltaTime;
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
      }
      state.timeSinceHurt += p5.deltaTime;
    }

    // capture snake movement after hit and rebound
    if (replay.mode === ReplayMode.Capture && didHit) {
      replay.positions[state.frameCount] = [player.position.x, player.position.y];
    }

    if (getHasClearedLevel() && !state.isDoorsOpen) {
      openDoors();
      playSound(Sound.doorOpen);
    }

    if (!state.isExitingLevel && getHasSegmentExited(player.position)) {
      state.isExitingLevel = true;
      winScene.reset();
      if (replay.mode !== ReplayMode.Playback) {
        musicPlayer.stopAllTracks();
        playSound(Sound.winLevel);
      }
    }

    if (state.isExitingLevel && replay.mode !== ReplayMode.Playback) {
      winScene.draw();
    }

    if (!state.isExited && segments.every(segment => getHasSegmentExited(segment))) {
      state.isExited = true;
      if (replay.mode === ReplayMode.Playback) {
        gotoNextLevel();
      } else {
        const isPerfect = apples.length === 0 && state.lives === 3;
        const hasAllApples = apples.length === 0;
        winScene.triggerLevelExit({
          score: stats.score,
          levelClearBonus: getLevelClearBonus(),
          livesLeftBonus: getLivesLeftBonus(),
          allApplesBonus: getAllApplesBonus(),
          perfectBonus: getPerfectBonus(),
          livesLeft: state.lives,
          isPerfect,
          hasAllApples,
          onApplyScore: () => {
            const perfectBonus = isPerfect ? getPerfectBonus() : 0;
            const allApplesBonus = (!isPerfect && hasAllApples) ? getAllApplesBonus() : 0;
            addPoints(getLevelClearBonus() + getLivesLeftBonus() * state.lives + perfectBonus + allApplesBonus);
          }
        });
      }
    }

    state.frameCount += 1;
    renderer.tick();
  }

  function getTimeNeededUntilNextMove() {
    if (state.isExitingLevel) {
      return 0;
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

  function startScreenShake({ magnitude = 1, normalizedTime = 0, timeScale = 1 } = {}) {
    if (replay.mode === ReplayMode.Playback) return;
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

  function checkHasHit(vec: Vector, snakePositionsMap: Record<number, boolean> = null) {
    // check to see if snake ran into itself
    if (!state.isExitingLevel && snakePositionsMap && snakePositionsMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitSelf;
      return true;
    }

    // check if player has hit a door
    if (!state.isExitingLevel && doorsMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitDoor;
      return true;
    }

    // check if player has hit a barrier
    if (!state.isExitingLevel && barriersMap[getCoordIndex(vec)]) {
      state.lastHurtBy = HitType.HitBarrier;
      return true;
    }

    return false;
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
    player.position.set(portal.link);
    player.position.add(dirToUnitVector(p5, player.direction));
  }

  function movePlayer(snakePositionsMap: Record<number, boolean>, normalizedSpeed = 0): boolean {
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
    const willHitSomething = checkHasHit(futurePosition, snakePositionsMap);
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
      setMusicVolume(settings.musicVolume * clamp(p5.lerp(HURT_MUSIC_DUCK_VOL, 1, t), 0, 1));
      t += p5.deltaTime / HURT_MUSIC_DUCK_TIME_MS;
      yield null;
    }
    setMusicVolume(1);
    stopAction(Action.FadingMusic);
  }

  function spawnHurtParticles() {
    const position = player.position.copy()
    particleSystems.push(new ImpactParticleSystem(p5, level, position));
    particleSystems.push(new ImpactParticleSystem(p5, level, position, { spawnMod: .3, speedMod: 1.5, scaleMod: .5 }));
  }

  function getDirectionToFirstSegment() {
    if (segments.length <= 0) return DIR.RIGHT;
    const diff = player.position.copy().sub(segments[0]);
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
    for (let i = 0; i < numSegmentsToAdd; i++) {
      addSnakeSegment();
    }
    if (!state.isDoorsOpen) {
      addApple();
    }
  }

  function addPoints(points: number) {
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
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead);
  }

  function drawPlayerSegment(vec: Vector) {
    if (state.timeSinceHurt < HURT_STUN_TIME) {
      if (Math.floor(state.timeSinceHurt / HURT_FLASH_RATE) % 2 === 0) {
        renderer.drawSquare(vec.x, vec.y, "#000", "#000");
      } else {
        renderer.drawSquare(vec.x, vec.y, "#fff", "#fff");
      }
    } else {
      renderer.drawSquare(vec.x, vec.y,
        state.isShowingDeathColours ? PALETTE.deathInvert.playerTail : level.colors.playerTail,
        state.isShowingDeathColours ? PALETTE.deathInvert.playerTailStroke : level.colors.playerTailStroke);
    }
  }

  function drawApple(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.apple : level.colors.apple,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.appleStroke : level.colors.appleStroke);
  }

  function drawBarrier(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.barrier : level.colors.barrier,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.barrierStroke : level.colors.barrierStroke);
  }

  function drawDoor(vec: Vector) {
    renderer.drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.door : level.colors.door,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.doorStroke : level.colors.doorStroke);
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
      coroutines.stop(actionIds.FadingMusic);
      setMusicVolume(0);
      musicPlayer.halfSpeed(level.musicTrack);
    }
    startCoroutine(showGameOverRoutine());
    maybeSaveReplayStateToFile();
  }

  function* showGameOverRoutine(): IEnumerator {
    const applesEaten = stats.applesEaten;
    const score = stats.score;
    resetScore();
    startScreenShake();
    yield* waitForTime(200);
    startScreenShake({ magnitude: 3, normalizedTime: -HURT_STUN_TIME / SCREEN_SHAKE_DURATION_MS, timeScale: 0.1 });
    state.isShowingDeathColours = true;
    yield* waitForTime(HURT_STUN_TIME * 2.5);
    state.isShowingDeathColours = false;
    startScreenShake();
    if (replay.mode === ReplayMode.Playback) {
      yield* waitForTime(1000);
      init(false);
    } else {
      startAction(fadeMusic(0.3, 1000), Action.FadingMusic);
      const randomMessage = getRandomMessage();
      UI.drawDarkOverlay(uiElements);
      UI.drawButton("MAIN MENU", 20, 20, setup, uiElements);
      UI.drawButton("TRY AGAIN", 475, 20, () => init(false), uiElements);
      const offset = -100
      UI.drawText('YOU DIED!', '20px', 250 + offset, uiElements);
      UI.drawText(randomMessage, '12px', 320 + offset, uiElements);
      UI.drawText(`SCORE: ${Math.floor(score)}`, '30px', 370 + offset, uiElements);
      UI.drawText(`APPLES: ${applesEaten}`, '18px', 443 + offset, uiElements);
      UI.drawText('[ENTER] To Try Again ', '10px', 550 + offset, uiElements);
      UI.enableScreenScroll();
      renderScoreUI(score);
    }
  }

  function* fadeMusic(toVolume: number, duration: number): IEnumerator {
    yield null;
    const startVolume = settings.musicVolume > 0 ? getMusicVolume() / settings.musicVolume : 0;
    let t = 0;
    while (duration > 0 && t < 1) {
      setMusicVolume(settings.musicVolume * p5.lerp(startVolume, toVolume, Easing.inOutCubic(clamp(t, 0, 1))));
      t += p5.deltaTime / duration;
      yield null;
    }
    setMusicVolume(toVolume);
    stopAction(Action.FadingMusic);
  }

  function resetScore() {
    stats.score = 0;
    stats.applesEaten = 0;
    stats.numLevelsCleared = 0;
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
    resetScore();
    musicPlayer.stopAllTracks();
    level = getWarpLevelFromNum(levelNum);
    setLevelIndexFromCurrentLevel();
    init();
  }

  function showPortalUI() {
    UI.drawDarkOverlay(uiElements);
    UI.drawText('JUMP TO LEVEL', '30px', 100, uiElements);
    UI.drawText('Press \'J\' To Unpause', '18px', 150, uiElements);
    const xInitial = 120;
    const offset = 60;
    const yRow1 = 280;
    const yRow2 = 320;
    const yRow3 = 360;
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
    UI.drawButton("SS", x += offset, yRow3, () => warpToLevel(99), uiElements);
    UI.drawButton("S1", x += offset, yRow3, () => warpToLevel(110), uiElements);
    UI.drawButton("S2", x += offset, yRow3, () => warpToLevel(120), uiElements);
    UI.drawButton("S3", x += offset, yRow3, () => warpToLevel(130), uiElements);
  }

  function openDoors() {
    doors = [];
    doorsMap = {};
    state.isDoorsOpen = true;
  }

  function gotoNextLevel() {
    const showQuoteOnLevelWin = !!level.showQuoteOnLevelWin;
    stats.numLevelsCleared += 1;
    stats.numLevelsEverCleared += 1;
    stats.applesEatenThisLevel = 0;
    state.levelIndex++;
    if (replay.mode != ReplayMode.Playback) {
      musicPlayer.stopAllTracks();
    }
    level = LEVELS[state.levelIndex % LEVELS.length];
    if (level === START_LEVEL) {
      difficulty.index++;
      difficulty = getDifficultyFromIndex(difficulty.index);
    }

    maybeSaveReplayStateToFile();

    if (showQuoteOnLevelWin && replay.mode !== ReplayMode.Playback) {
      const quote = getNextQuote();
      const onSceneEnded = () => {
        init();
      }
      UI.clearLabels();
      stopAllCoroutines();
      new QuoteScene(quote, p5, sfx, fonts, { onSceneEnded });
    } else {
      init();
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
    clearUI(true);
    stopReplay();
    stopAllCoroutines();
    setMusicVolume(0.6);
    startAction(executeQuotesModeRoutine(), Action.ExecuteQuotesMode);
  }

  function* executeQuotesModeRoutine(): IEnumerator {
    const onEscapePress = () => {
      state.appMode = AppMode.Game;
      musicPlayer.stopAllTracks();
      setMusicVolume(1);
      stopAction(Action.ExecuteQuotesMode);
      setup();
    }
    while (state.appMode === AppMode.Quote) {
      yield null;
      const quote = getNextQuote();
      new QuoteScene(quote, p5, sfx, fonts, { onEscapePress });
      yield null;
    }
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

  function* replayRoutine(): IEnumerator {
    const clips = shuffleArray(replayClips)
    let clipIndex = 0;

    while (true) {
      const clip = clips[clipIndex % clips.length];
      if (!clip) {
        console.warn(`clip at index ${clipIndex} was null - clips.length=${clips.length}`);
        break;
      }

      replay.applesToSpawn = clip.applesToSpawn.slice();
      replay.difficulty = { ...clip.difficulty };
      replay.levelIndex = clip.levelIndex;
      replay.positions = clip.positions;

      state.levelIndex = clip.levelIndex;
      level = LEVELS[state.levelIndex % LEVELS.length];
      difficulty = { ...clip.difficulty };
      init(false);
      replay.shouldProceedToNextClip = false;
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
