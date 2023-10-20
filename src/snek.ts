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
  BLOCK_SIZE,
  STROKE_SIZE,
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
} from './constants';
import { clamp, getCoordIndex, getDifficultyFromIndex, getWarpLevelFromNum, removeArrayElement, shuffleArray, vecToString } from './utils';
import { ParticleSystem } from './particle-system';
import { Easing } from './easing';
import { UI } from './ui';
import { DIR, HitType, Difficulty, GameState, IEnumerator, Level, PlayerState, Replay, ReplayMode, ScreenShakeState, Sound, Stats } from './types';
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

let level: Level = MAIN_TITLE_SCREEN_LEVEL;
let levelIndex = 0;
let difficulty: Difficulty = { ...DIFFICULTY_EASY };


const state: GameState = {
  isPaused: false,
  isGameStarted: false,
  isMoving: false,
  isLost: false,
  isDoorsOpen: false,
  isExitingLevel: false,
  isShowingDeathColours: false,
  timeElapsed: 0,
  timeSinceLastMove: Infinity,
  timeSinceHurt: Infinity,
  hurtGraceTime: HURT_GRACE_TIME,
  lives: MAX_LIVES,
  speed: 1,
  steps: 0,
  frameCount: 0,
  lastHurtBy: HitType.Unknown,
};
const stats: Stats = {
  numDeaths: 0,
  numLevelsCleared: 0,
  numPointsEverScored: 0,
  numApplesEverEaten: 0,
  score: 0,
  applesEaten: 0,
  applesEatenThisLevel: 0,
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
  levelIndex,
  levelName: level.name,
  difficulty: { ...difficulty },
  applesToSpawn: [],
  positions: {},
  timeCaptureStarted: 'no-date',
  shouldProceedToNextClip: false,
}

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

let uiElements: Element[] = [];
let particleSystems: ParticleSystem[] = [];
let screenFlashElement: Element;

let quotes = allQuotes.slice();

export const sketch = (p5: P5) => {

  const coroutines = new Coroutines(p5);
  const startCoroutine = coroutines.start;
  const stopAllCoroutines = coroutines.stopAll;
  const tickCoroutines = coroutines.tick;
  const waitForTime = coroutines.waitForTime;

  const fonts = new Fonts(p5);
  const sfx = new SFX();



  /**
   * https://p5js.org/reference/#/p5/preload
   */
  p5.preload = preload;
  function preload() {
    UI.setP5Instance(p5);
    fonts.load();
    sfx.load();
  }

  /**
   * https://p5js.org/reference/#/p5/setup
   */
  p5.setup = setup;
  function setup() {
    UI.setP5Instance(p5);
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y);
    p5.frameRate(FRAMERATE);

    level = MAIN_TITLE_SCREEN_LEVEL;
    setLevelIndexFromCurrentLevel();
    init(false);
    startReplay();

    // init state for game
    state.isGameStarted = false;
    stats.numDeaths = 0;
    stats.numLevelsCleared = 0;
    stats.numPointsEverScored = 0;
    stats.numApplesEverEaten = 0;
    stats.score = 0;
    stats.applesEaten = 0;
    UI.enableScreenScroll();
    UI.clearLabels();
    UI.drawDarkOverlay(uiElements);
    UI.drawTitle(TITLE, "#ffc000", 5, true, uiElements);
    UI.drawTitle(TITLE, "#cdeaff", 0, false, uiElements);
    const offsetLeft = 150;
    UI.drawButton("EASY", 0 + offsetLeft, 280, () => startGame(1), uiElements);
    UI.drawButton("MEDIUM", 105 + offsetLeft, 280, () => startGame(2), uiElements);
    UI.drawButton("HARD", 220 + offsetLeft, 280, () => startGame(3), uiElements);
    UI.drawButton("ULTRA", 108 + offsetLeft, 340, () => startGame(4), uiElements);
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
    handleKeyPressed(p5, state, player.direction, moves, {
      onInit: () => init(false),
      onStartGame: startGame,
      onClearUI: clearUI,
      onShowPortalUI: showPortalUI,
      onWarpToLevel: warpToLevel,
      onStartMoving: startMoving,
      onAddMove: move => moves.push(move),
    });
  }

  function startGame(difficultyIndex = 2) {
    stopAllCoroutines();
    stopReplay();
    level = START_LEVEL
    setLevelIndexFromCurrentLevel();
    state.isGameStarted = true;
    init()
    difficulty = getDifficultyFromIndex(difficultyIndex);
    state.isGameStarted = true;
    replay.difficulty = { ...difficulty };
    UI.disableScreenScroll();
    playSound(Sound.uiConfirm);
  }

  function playSound(sound: Sound, volume = 1) {
    if (replay.mode === ReplayMode.Playback) return;
    sfx.play(sound, volume);
  }

  function clearUI() {
    if (replay.mode === ReplayMode.Playback) return;
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
      replay.levelIndex = levelIndex;
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
    state.isLost = false;
    state.isDoorsOpen = false;
    state.isExitingLevel = false;
    state.isShowingDeathColours = false;
    state.timeElapsed = 0;
    state.timeSinceLastMove = Infinity;
    state.timeSinceHurt = Infinity;
    state.hurtGraceTime = HURT_GRACE_TIME;
    state.lives = MAX_LIVES;
    screenShake.timeSinceStarted = Infinity;
    screenShake.timeSinceLastStep = Infinity;
    screenShake.magnitude = 1;
    screenShake.timeScale = 1;
    state.speed = 1;
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

    UI.disableScreenScroll();
    UI.clearLabels();
    clearUI();

    if (shouldShowTransitions) {
      const buildSceneAction = buildSceneActionFactory(p5, fonts, state);
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
        })
    } else {
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

    updateScreenShake();
    drawBackground();

    for (let i = 0; i < decoratives1.length; i++) {
      drawDecorative1(decoratives1[i]);
    }

    for (let i = 0; i < decoratives2.length; i++) {
      drawDecorative2(decoratives2[i]);
    }

    drawParticles();

    for (let i = 0; i < barriers.length; i++) {
      drawBarrier(barriers[i]);
    }

    for (let i = 0; i < doors.length; i++) {
      drawDoor(doors[i]);
    }

    if (replay.mode === ReplayMode.Capture) {
      drawCaptureMode();
    }

    const applesMap: Record<string, number> = {};
    for (let i = 0; i < apples.length; i++) {
      if (!apples[i]) continue;
      drawApple(apples[i]);
      if (state.isLost || state.isExitingLevel) continue;
      applesMap[getCoordIndex(apples[i])] = i;
    }

    if (state.isGameStarted && !state.isMoving) {
      drawPlayerMoveArrows(player.position);
    }

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

    const didHit = checkHasHit(player.position, snakePositionsMap);
    state.isLost = didHit;

    apples = apples.filter(apple => !!apple);

    // handle snake hurt
    if (state.isLost && state.lives > 0) {
      state.isLost = false;
      state.lives -= 1;
      state.timeSinceHurt = 0;
      flashScreen();
      startScreenShake();
      renderHeartsUI();
      hurtSnake();
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
          incrementScoreWhileExitingLevel();
          renderScoreUI();
        }
      } else {
        state.timeSinceLastMove += p5.deltaTime;
      }
      state.timeElapsed += p5.deltaTime;
      state.timeSinceHurt += p5.deltaTime;
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
      addPoints(getLevelClearBonus() + getLivesLeftBonus());
    }

    if (state.isExitingLevel && segments.every(segment => getHasSegmentExited(segment))) {
      gotoNextLevel();
    }

    state.frameCount += 1;
  }

  function getTimeNeededUntilNextMove() {
    if (state.isExitingLevel) {
      return 0;
    }
    if (state.timeSinceHurt < HURT_STUN_TIME) {
      return Infinity;
    }
    if (difficulty.index === 4) {
      if (state.speed <= 1) return SPEED_LIMIT_EASY;
      if (state.speed <= 2) return SPEED_LIMIT_MEDIUM;
      if (state.speed <= 3) return SPEED_LIMIT_HARD;
      return SPEED_LIMIT_ULTRA;
    }
    return Math.max(
      BASE_TICK_MS / Math.max(state.speed * difficulty.speedMod, 1),
      difficulty.speedLimit
    );
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

  function movePlayer(snakePositionsMap: Record<number, boolean>, normalizedSpeed = 0): boolean {
    if (!state.isMoving) return false;
    state.timeSinceLastMove = 0;
    if (moves.length > 0 && !state.isExitingLevel) {
      player.direction = moves.shift()
    }
    let direction;
    switch (player.direction) {
      case DIR.LEFT:
        direction = p5.createVector(-1, 0);
        break;
      case DIR.RIGHT:
        direction = p5.createVector(1, 0);
        break;
      case DIR.UP:
        direction = p5.createVector(0, -1);
        break;
      case DIR.DOWN:
        direction = p5.createVector(0, 1);
        break;
      default:
        direction = p5.createVector(0, 0);
    }

    // determine if next move will be into something, allow for grace period before injuring snakey
    const willHitSomething = checkHasHit(player.position.copy().add(direction), snakePositionsMap);
    if (willHitSomething && state.hurtGraceTime > 0) {
      state.hurtGraceTime -= p5.deltaTime;
      return false;
    }

    // apply movement
    moveSegments();
    player.position.add(direction);
    state.hurtGraceTime = HURT_GRACE_TIME;

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
    const dirToFirstSegment = (() => {
      const diff = player.position.copy().sub(segments[0]);
      if (diff.x === -1) return DIR.LEFT;
      if (diff.x === 1) return DIR.RIGHT;
      if (diff.y === -1) return DIR.UP;
      if (diff.y === 1) return DIR.DOWN;
      return DIR.RIGHT;
    })();
    player.direction = dirToFirstSegment;
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
    return LEVEL_BONUS * difficulty.scoreMod;
  }

  function getLivesLeftBonus() {
    return LEVEL_BONUS * 10 * state.lives * difficulty.scoreMod;
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
      state.speed += 1;
    } else {
      state.speed += SPEED_INCREMENT * Math.min(difficulty.speedMod, 1);
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
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead);
  }

  function drawPlayerMoveArrows(vec: Vector) {
    if (replay.mode === ReplayMode.Playback) return;
    type ArrowBlock = { x: number, y: number, text: string }
    const arrowBlocks: ArrowBlock[] = [
      { x: vec.x, y: vec.y - 1, text: 'P' },
      { x: vec.x, y: vec.y + 1, text: 'Q' },
      { x: vec.x - 1, y: vec.y, text: 'N' },
      { x: vec.x + 1, y: vec.y, text: 'O' },
    ]
    for (let i = 0; i < arrowBlocks.length; i++) {
      const arrow = arrowBlocks[i];
      const position = {
        x: arrow.x * BLOCK_SIZE.x + BLOCK_SIZE.x * 0.4 + screenShake.offset.x,
        y: arrow.y * BLOCK_SIZE.y + BLOCK_SIZE.y * 0.35 + screenShake.offset.y,
      }
      p5.fill("#fff");
      p5.stroke("#000");
      p5.strokeWeight(4);
      p5.textSize(12);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textFont(fonts.variants.zicons);
      p5.text(arrow.text, position.x, position.y);
    }
  }

  function drawPlayerSegment(vec: Vector) {
    if (state.timeSinceHurt < HURT_STUN_TIME) {
      if (Math.floor(state.timeSinceHurt / HURT_FLASH_RATE) % 2 === 0) {
        drawSquare(vec.x, vec.y, "#000", "#000");
      } else {
        drawSquare(vec.x, vec.y, "#fff", "#fff");
      }
    } else {
      drawSquare(vec.x, vec.y,
        state.isShowingDeathColours ? PALETTE.deathInvert.playerTail : level.colors.playerTail,
        state.isShowingDeathColours ? PALETTE.deathInvert.playerTailStroke : level.colors.playerTailStroke);
    }
  }

  function drawApple(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.apple : level.colors.apple,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.appleStroke : level.colors.appleStroke);
  }

  function drawBarrier(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.barrier : level.colors.barrier,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.barrierStroke : level.colors.barrierStroke);
  }

  function drawDoor(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.door : level.colors.door,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.doorStroke : level.colors.doorStroke);
  }

  function drawDecorative1(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco1 : level.colors.deco1,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco1Stroke : level.colors.deco1Stroke);
  }

  function drawDecorative2(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco2 : level.colors.deco2,
      state.isShowingDeathColours && replay.mode !== ReplayMode.Playback ? PALETTE.deathInvert.deco2Stroke : level.colors.deco2Stroke);
  }

  function drawCaptureMode() {
    const reds: [number, number][] = [
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 28],
      [0, 29],
      [1, 29],
      [28, 29],
      [29, 28],
      [29, 29],
      [28, 0],
      [29, 0],
      [29, 1],
    ];
    for (let i = 0; i < reds.length; i++) {
      drawSquare(reds[i][0], reds[i][1], "#f00", "#f00");
    }
  }

  function drawSquare(x: number, y: number, background = "pink", lineColor = "fff", strokeSize = STROKE_SIZE) {
    p5.fill(background);
    p5.stroke(lineColor);
    p5.strokeWeight(strokeSize);
    const position = {
      x: x * BLOCK_SIZE.x + screenShake.offset.x,
      y: y * BLOCK_SIZE.y + screenShake.offset.y,
    }
    const size = BLOCK_SIZE.x - strokeSize;
    p5.square(position.x, position.y, size);
  }

  function drawParticles() {
    const tempParticleSystems = [];
    for (let i = 0; i < particleSystems.length; i++) {
      particleSystems[i].draw(p5, screenShake);
      particleSystems[i].tick(p5);
      // cleanup inactive particle systems
      if (particleSystems[i].isActive()) {
        tempParticleSystems.push(particleSystems[i]);
      } else {
        delete particleSystems[i];
      }
    }
    particleSystems = tempParticleSystems;
  }

  function showGameOver() {
    state.lives = 0;
    stats.numDeaths += 1;
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
      UI.drawDarkOverlay(uiElements);
      UI.drawButton("TRY AGAIN", 236, 280, () => init(false), uiElements);
      UI.drawButton("MAIN MENU", 20, 20, setup, uiElements);
      UI.drawText(`SCORE: ${Math.floor(score)}`, '40px', 370, uiElements);
      UI.drawText(`APPLES: ${applesEaten}`, '26px', 443, uiElements);
      UI.enableScreenScroll();
      renderScoreUI(score);
    }
  }

  function resetScore() {
    stats.score = 0;
    stats.applesEaten = 0;
    stats.applesEatenThisLevel = 0;
  }

  function warpToLevel(levelNum = 1) {
    resetScore();
    level = getWarpLevelFromNum(levelNum);
    setLevelIndexFromCurrentLevel();
    init();
  }

  function showPortalUI() {
    UI.drawDarkOverlay(uiElements);
    UI.drawText('JUMP TO LEVEL', '40px', 100, uiElements);
    UI.drawText('Press \'J\' To Unpause', '26px', 150, uiElements);
    const xInitial = 120;
    const offset = 60;
    const yRow1 = 280;
    const yRow2 = 320;
    let x = xInitial;
    UI.drawButton("1", x, yRow1, () => warpToLevel(1), uiElements);
    UI.drawButton("2", x += offset, yRow1, () => warpToLevel(2), uiElements);
    UI.drawButton("3", x += offset, yRow1, () => warpToLevel(3), uiElements);
    UI.drawButton("4", x += offset, yRow1, () => warpToLevel(4), uiElements);
    UI.drawButton("5", x += offset, yRow1, () => warpToLevel(5), uiElements);
    UI.drawButton("6", x += offset, yRow1, () => warpToLevel(6), uiElements);
    x = xInitial;
    UI.drawButton("7", x, yRow2, () => warpToLevel(7), uiElements);
    UI.drawButton("8", x += offset, yRow2, () => warpToLevel(8), uiElements);
    UI.drawButton("9", x += offset, yRow2, () => warpToLevel(9), uiElements);
    UI.drawButton("10", x += offset, yRow2, () => warpToLevel(10), uiElements);
    UI.drawButton("99", x += offset, yRow2, () => warpToLevel(99), uiElements);
  }

  function openDoors() {
    doors = [];
    doorsMap = {};
    state.isDoorsOpen = true;
  }

  function gotoNextLevel() {
    const showQuoteOnLevelWin = !!level.showQuoteOnLevelWin;
    stats.numLevelsCleared += 1;
    stats.applesEatenThisLevel = 0;
    levelIndex++;
    level = LEVELS[levelIndex % LEVELS.length];
    if (level === START_LEVEL) {
      difficulty.index++;
      difficulty = getDifficultyFromIndex(difficulty.index);
    }

    maybeSaveReplayStateToFile();

    if (showQuoteOnLevelWin && replay.mode !== ReplayMode.Playback) {
      const quoteIndex = Math.floor(p5.random(0, quotes.length));
      const quote = quotes[quoteIndex];
      quotes = removeArrayElement(quotes, quoteIndex);
      if (quotes.length <= 1) quotes = allQuotes.slice();
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

  function setLevelIndexFromCurrentLevel() {
    levelIndex = 0;
    for (let i = 0; i < LEVELS.length; i++) {
      if (level === LEVELS[i]) {
        levelIndex = i;
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

      levelIndex = clip.levelIndex;
      level = LEVELS[levelIndex % LEVELS.length];
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
