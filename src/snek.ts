import P5, { Element, Vector } from 'p5';

import {
  MAIN_TITLE_SCREEN_LEVEL,
  START_LEVEL,
  LEVELS,
  LEVEL_01,
  LEVEL_02,
  LEVEL_03,
  LEVEL_04,
  LEVEL_05,
  LEVEL_06,
  LEVEL_07,
  LEVEL_08,
  LEVEL_09,
  LEVEL_10,
  LEVEL_99,
} from './levels';
import {
  TITLE,
  FRAMERATE,
  DIMENSIONS,
  GRIDCOUNT,
  BLOCK_SIZE,
  STROKE_SIZE,
  BASE_TICK_MS,
  MAX_MOVES,
  MAX_LIVES,
  START_SNAKE_SIZE,
  SPEED_INCREMENT,
  NUM_APPLES_START,
  SCORE_INCREMENT,
  CLEAR_BONUS,
  LEVEL_BONUS,
  SPEED_MOD_EASY,
  SPEED_MOD_MEDIUM,
  SPEED_MOD_HARD,
  SPEED_MOD_ULTRA,
  NUM_APPLES_MOD_EASY,
  NUM_APPLES_MOD_MEDIUM,
  NUM_APPLES_MOD_HARD,
  NUM_APPLES_MOD_ULTRA,
  SCORE_MOD_EASY,
  SCORE_MOD_MEDIUM,
  SCORE_MOD_HARD,
  SCORE_MOD_ULTRA,
  SPEED_LIMIT_EASY,
  SPEED_LIMIT_MEDIUM,
  SPEED_LIMIT_HARD,
  SPEED_LIMIT_ULTRA,
  KEYCODE_J,
  KEYCODE_0,
  KEYCODE_1,
  KEYCODE_2,
  KEYCODE_3,
  KEYCODE_4,
  KEYCODE_5,
  KEYCODE_6,
  KEYCODE_7,
  KEYCODE_8,
  KEYCODE_9,
  KEYCODE_SPACE,
  SCREEN_SHAKE_DURATION_MS,
  SCREEN_SHAKE_MAGNITUDE_PX,
  HURT_STUN_TIME,
  HURT_FLASH_RATE,
  HURT_GRACE_TIME,
} from './constants';
import { clamp } from './utils';
import { ParticleSystem } from './particle-system';
import { Easing } from './easing';
import { UI } from './ui';
import { DIR, Difficulty, GameState, IEnumerator, Level, PlayerState, ScreenShakeState } from './types';
import { PALETTE } from './palettes';
import { Coroutines } from './coroutines';
import { Fonts } from './fonts';

let level: Level = MAIN_TITLE_SCREEN_LEVEL;
let levelIndex = 0;
let difficulty: Difficulty = {
  index: 1,
  speedMod: SPEED_MOD_EASY,
  applesMod: NUM_APPLES_MOD_EASY,
  scoreMod: SCORE_MOD_EASY,
  speedLimit: SPEED_LIMIT_EASY,
};

let score = 0;
let totalScore = 0;
let totalApplesEaten = 0;

let state: GameState = {
  isPaused: false,
  isGameStarted: true,
  isTransitionSceneShowing: false,
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
  numApplesEaten: 0,
};
let player: PlayerState = {
  position: null,
  direction: DIR.RIGHT,
};
let screenShake: ScreenShakeState = {
  offset: null,
  timeSinceStarted: Infinity,
  timeSinceLastStep: Infinity,
  magnitude: 1,
  timeScale: 1,
};

let moves: DIR[] = [];
let segments: Vector[] = [];
let apples: Vector[] = [];
let barriers: Vector[] = [];
let doors: Vector[] = [];
let nospawns: Vector[] = [];
let decoratives1: Vector[] = [];
let decoratives2: Vector[] = [];

let barriersMap: Record<number, boolean> = {};
let doorsMap: Record<number, boolean> = {};
let nospawnsMap: Record<number, boolean> = {};

let uiElements: Element[] = [];
let particleSystems: ParticleSystem[] = [];

let screenFlashElement: Element;

export const sketch = (p5: P5) => {

  p5.preload = preload;
  p5.setup = setup;
  p5.draw = draw;
  p5.keyPressed = keyPressed;

  const coroutines = new Coroutines(p5);
  const startCoroutine = coroutines.start;
  const stopAllCoroutines = coroutines.stopAll;
  const tickCoroutines = coroutines.tick;
  const waitForTime = coroutines.waitForTime;

  const fonts = new Fonts(p5);

  class AppleParticleSystem extends ParticleSystem {
    /** 
     * @param {P5} p5
     * @param {P5.Vector} origin
     */
    constructor(p5: P5, origin: Vector, { spawnMod = 1, speedMod = 1, scaleMod = 1 } = {}) {
      const lifetime = 1000;
      const numParticles = 10 * spawnMod;
      const speed = 1 * speedMod;
      const speedVariance = 1.5 * speedMod;
      const scaleStart = .6 * scaleMod;
      const scaleEnd = 0.3 * scaleMod;
      const scaleVariance = 0.2 * scaleMod;
      const colorStart = level.colors.appleStroke;
      const colorEnd = level.colors.background;
      const easingFnc = Easing.outCubic;
      super({
        p5,
        origin,
        colorStart: p5.color(colorStart),
        colorEnd: p5.color(colorEnd),
        lifetime,
        numParticles,
        speed,
        speedVariance,
        scaleStart,
        scaleEnd,
        scaleVariance,
        easingFnc,
      });
    }
  }

  function preload() {
    fonts.load();
    UI.setP5Instance(p5);
  }

  function setup() {
    level = MAIN_TITLE_SCREEN_LEVEL;
    setLevelIndexFromCurrentLevel();
    p5.frameRate(FRAMERATE);
    init(false);

    score = 0;
    totalScore = 0;
    totalApplesEaten = 0;
    state.isGameStarted = false;
    state.isTransitionSceneShowing = false;
    UI.disableScreenScroll();

    UI.drawDarkOverlay(uiElements);
    UI.drawTitle(TITLE, "#ffc000", 5, true, uiElements);
    UI.drawTitle(TITLE, "#cdeaff", 0, false, uiElements);
    UI.drawButton("EASY", 150, 280, () => startGame(1), uiElements);
    UI.drawButton("MEDIUM", 255, 280, () => startGame(2), uiElements);
    UI.drawButton("HARD", 370, 280, () => startGame(3), uiElements);
    UI.drawButton("ULTRA", 485, 530, () => startGame(4), uiElements);
  }

  function startGame(dif = 2) {
    level = START_LEVEL
    init()
    switch (dif) {
      case 1:
        difficulty = {
          index: 1,
          speedMod: SPEED_MOD_EASY,
          applesMod: NUM_APPLES_MOD_EASY,
          scoreMod: SCORE_MOD_EASY,
          speedLimit: SPEED_LIMIT_EASY,
        }
        break;
      case 2:
        difficulty = {
          index: 2,
          speedMod: SPEED_MOD_MEDIUM,
          applesMod: NUM_APPLES_MOD_MEDIUM,
          scoreMod: SCORE_MOD_MEDIUM,
          speedLimit: SPEED_LIMIT_MEDIUM,
        }
        break;
      case 3:
        difficulty = {
          index: 3,
          speedMod: SPEED_MOD_HARD,
          applesMod: NUM_APPLES_MOD_HARD,
          scoreMod: SCORE_MOD_HARD,
          speedLimit: SPEED_LIMIT_HARD,
        }
        break;
      case 4:
        difficulty = {
          index: 4,
          speedMod: SPEED_MOD_ULTRA,
          applesMod: NUM_APPLES_MOD_ULTRA,
          scoreMod: SCORE_MOD_ULTRA,
          speedLimit: SPEED_LIMIT_ULTRA,
        }
        break;
      default:
        throw new Error(`Unexpected difficulty: ${difficulty}`)
    }
    state.isGameStarted = true;
    UI.disableScreenScroll();
    UI.renderDifficulty(difficulty.index, state.isShowingDeathColours);
    clearUI();
  }

  function clearUI() {
    uiElements.forEach(element => element.remove())
    uiElements = [];
    UI.renderLevelName(level.name, state.isShowingDeathColours);
    renderHeartsUI();
  }

  function renderHeartsUI() {
    UI.renderHearts(state.lives, state.isShowingDeathColours);
  }

  function renderScoreUI() {
    UI.renderScore(score + totalScore, state.isShowingDeathColours);
  }

  function init(shouldShowTransitions = true) {
    p5.createCanvas(DIMENSIONS.x, DIMENSIONS.y);
    stopAllCoroutines();

    score = 0;
    player.position = p5.createVector(15, 15);
    player.direction = DIR.RIGHT;
    state.isPaused = false;
    state.isGameStarted = true;
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
    state.numApplesEaten = 0;
    moves = [];
    barriers = [];
    doors = [];
    apples = [];
    segments = []
    nospawns = [];
    decoratives1 = [];
    decoratives2 = [];
    particleSystems = [];
    barriersMap = {};
    doorsMap = {};
    nospawnsMap = {};

    UI.disableScreenScroll();
    renderHeartsUI();
    renderScoreUI();
    clearUI();

    let showTitleScene = async () => { }
    let showStoryScene = async () => { }
    let showCreditsScene = async () => { }

    if (level.storyScene) {
      showStoryScene = () => new Promise((resolve, reject) => {
        try {
          const onSceneEnded = () => {
            resolve()
          }
          state.isTransitionSceneShowing = true;
          level.titleScene(p5, fonts, { onSceneEnded })
        } catch (err) {
          reject(err)
        }
      })
    }

    if (level.titleScene) {
      showTitleScene = () => new Promise((resolve, reject) => {
        try {
          const onSceneEnded = () => {
            resolve()
          }
          state.isTransitionSceneShowing = true;
          level.titleScene(p5, fonts, { onSceneEnded })
        } catch (err) {
          reject(err)
        }
      })
    }

    if (level.creditsScene) {
      showCreditsScene = () => new Promise((resolve, reject) => {
        try {
          const onSceneEnded = () => {
            setup()
            resolve()
          }
          state.isTransitionSceneShowing = true;
          level.creditsScene(p5, fonts, { onSceneEnded })
        } catch (err) {
          reject(err)
        }
      })
    }

    if (shouldShowTransitions) {
      state.isGameStarted = true;
      showStoryScene().then(showTitleScene).then(showCreditsScene).catch(err => {
        console.error(err);
      }).finally(() => {
        state.isTransitionSceneShowing = false;
      })
    }

    // parse level data - add barriers and doors
    const layoutRows = level.layout.trim().split('\n');
    for (let y = 0; y < layoutRows.length; y++) {
      const rowStr = layoutRows[y];

      for (let x = 0; x < rowStr.length; x++) {
        if (x >= GRIDCOUNT.x) { console.warn("level layout is too wide"); break; }

        const char = rowStr.charAt(x);
        if (char === ' ') {
          continue;
        }

        const vec = p5.createVector(x, y);

        switch (char.toLowerCase()) {
          case 'x':
            barriers.push(vec);
            barriersMap[getCoordIndex(vec)] = true;
            break;
          case 'd':
            doors.push(vec);
            doorsMap[getCoordIndex(vec)] = true;
            break;
          case 'o':
            player.position = vec;
            break;

          // no-spawns
          case '~':
            nospawns.push(vec);
            nospawnsMap[getCoordIndex(vec)] = true;
            break;
          case '_':
            decoratives1.push(vec);
            nospawns.push(vec);
            nospawnsMap[getCoordIndex(vec)] = true;
            break;
          case '+':
            decoratives2.push(vec);
            nospawns.push(vec);
            nospawnsMap[getCoordIndex(vec)] = true;
            break;

          // decorative
          case '-':
            decoratives1.push(vec);
            break;
          case '=':
            decoratives2.push(vec);
            break;

          // manually-spawned apples
          case 'a':
            apples.push(vec);
        }
      }
      if (y >= GRIDCOUNT.y) { console.warn("level layout is too tall"); break; }
    }

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

  function keyPressed() {
    const { keyCode, ENTER, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;

    if (state.isLost) {
      if (keyCode === p5.ENTER) init(false);
      return;
    }

    if (!state.isGameStarted) {
      if (keyCode === KEYCODE_1) startGame(1);
      else if (keyCode === KEYCODE_2) startGame(2);
      else if (keyCode === KEYCODE_3) startGame(3);
      else if (keyCode === KEYCODE_4) startGame(4);
      else if (keyCode === ENTER) startGame();
      return;
    }

    if (keyCode === KEYCODE_SPACE) {
      startScreenShake();
    }

    if (keyCode === KEYCODE_J) {
      if (state.isPaused) {
        state.isPaused = false;
        clearUI();
      } else {
        state.isPaused = true;
        showPortalUI();
      }
    }

    if (state.isPaused) {
      if (keyCode === KEYCODE_0) warpToLevel(10);
      else if (keyCode === KEYCODE_1) warpToLevel(1);
      else if (keyCode === KEYCODE_2) warpToLevel(2);
      else if (keyCode === KEYCODE_3) warpToLevel(3);
      else if (keyCode === KEYCODE_4) warpToLevel(4);
      else if (keyCode === KEYCODE_5) warpToLevel(5);
      else if (keyCode === KEYCODE_6) warpToLevel(6);
      else if (keyCode === KEYCODE_7) warpToLevel(7);
      else if (keyCode === KEYCODE_8) warpToLevel(8);
      else if (keyCode === KEYCODE_9) warpToLevel(9);
      return;
    }

    const prevMove = moves.length > 0
      ? moves[moves.length - 1]
      : player.direction;
    let currentMove = null;

    if (keyCode === LEFT_ARROW) {
      currentMove = DIR.LEFT;
    } else if (keyCode === RIGHT_ARROW) {
      currentMove = DIR.RIGHT;
    } else if (keyCode === UP_ARROW) {
      currentMove = DIR.UP;
    } else if (keyCode === DOWN_ARROW) {
      currentMove = DIR.DOWN;
    }

    // validate current move
    if (moves.length >= MAX_MOVES) return;
    if (!validateMove(prevMove, currentMove)) return;

    moves.push(currentMove);
  }

  function validateMove(prev: DIR, current: DIR) {
    if (!current) return false;
    if (prev === current) return false;
    if (prev === DIR.UP && current === DIR.DOWN) return false;
    if (prev === DIR.DOWN && current === DIR.UP) return false;
    if (prev === DIR.LEFT && current === DIR.RIGHT) return false;
    if (prev === DIR.RIGHT && current === DIR.LEFT) return false;
    return true;
  }

  function draw() {
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

    const applesMap: Record<string, number> = {};
    for (let i = 0; i < apples.length; i++) {
      if (!apples[i]) continue;
      drawApple(apples[i]);
      if (state.isLost || state.isExitingLevel) continue;
      applesMap[getCoordIndex(apples[i])] = i;
    }

    const snakePositionsMap: Record<number, boolean> = {};
    for (let i = 0; i < segments.length; i++) {
      drawPlayerPart(segments[i]);
      if (state.isLost || state.isExitingLevel) continue;
      snakePositionsMap[getCoordIndex(segments[i])] = true;
      const appleFound = applesMap[getCoordIndex(segments[i])];
      if (appleFound != undefined && appleFound >= 0) {
        applesMap[getCoordIndex(segments[i])] = -1;
        spawnAppleParticles(segments[i]);
        growSnake(appleFound);
      }
    }

    drawPlayer(player.position);

    if (state.isLost) return;
    if (!state.isGameStarted) return;

    // check if head has reached an apple
    const appleFound = applesMap[getCoordIndex(player.position)];
    if (appleFound != undefined && appleFound >= 0) {
      spawnAppleParticles(player.position);
      growSnake(appleFound);
      increaseSpeed();
    }

    state.isLost = checkHasHit(player.position, snakePositionsMap);

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
    }

    // handle snake death
    if (state.isLost) {
      state.lives = 0;
      renderHeartsUI();
      flashScreen();
      showGameOver();
      return;
    }

    const timeNeededUntilNextMove = getTimeNeededUntilNextMove();
    if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      movePlayer(snakePositionsMap);
    } else {
      state.timeSinceLastMove += p5.deltaTime;
    }
    state.timeElapsed += p5.deltaTime;
    state.timeSinceHurt += p5.deltaTime;

    if (getHasClearedLevel() && !state.isDoorsOpen) {
      openDoors();
    }

    if (!state.isExitingLevel && getHasSegmentExited(player.position)) {
      state.isExitingLevel = true;
      score += LEVEL_BONUS * difficulty.scoreMod;
      score += LEVEL_BONUS * 10 * state.lives * difficulty.scoreMod;
    }

    if (state.isExitingLevel) {
      score += SCORE_INCREMENT;
      renderScoreUI();
    }

    if (state.isExitingLevel && segments.every(segment => getHasSegmentExited(segment))) {
      gotoNextLevel();
    }
  }

  function getTimeNeededUntilNextMove() {
    if (state.isExitingLevel) {
      return 1;
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
    particleSystems.push(new AppleParticleSystem(p5, position));
    particleSystems.push(new AppleParticleSystem(p5, position, { spawnMod: .3, speedMod: 4, scaleMod: .5 }));
  }

  function flashScreen() {
    screenFlashElement = UI.drawScreenFlash();
    setTimeout(() => {
      screenFlashElement?.remove();
    }, FRAMERATE * 2)
  }

  function startScreenShake({ magnitude = 1, normalizedTime = 0, timeScale = 1 } = {}) {
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
    if (state.numApplesEaten >= level.applesToClear * difficulty.applesMod) return true;
    if (state.timeElapsed >= level.timeToClear && state.numApplesEaten >= level.applesToClear * difficulty.applesMod * 0.5) return true;
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

  function getCoordIndex(vec: Vector): number {
    return clamp(vec.x, 0, GRIDCOUNT.x - 1) + clamp(vec.y, 0, GRIDCOUNT.y - 1) * GRIDCOUNT.x
  }

  function checkHasHit(vec: Vector, snakePositionsMap: Record<number, boolean> = null) {
    // check to see if snake ran into itself
    if (!state.isExitingLevel && snakePositionsMap && snakePositionsMap[getCoordIndex(vec)]) {
      return true;
    }

    // check if player has hit a door
    if (!state.isExitingLevel && doorsMap[getCoordIndex(vec)]) {
      return true;
    }

    // check if player has hit a barrier
    if (!state.isExitingLevel && barriersMap[getCoordIndex(vec)]) {
      return true;
    }

    return false;
  }

  function movePlayer(snakePositionsMap: Record<number, boolean>) {
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
      return;
    }

    // apply movement
    for (let i = segments.length - 1; i >= 0; i--) {
      if (i === 0) {
        segments[i].set(player.position);
      } else {
        segments[i].set(segments[i - 1]);
      }
    }
    player.position.add(direction);
    state.hurtGraceTime = HURT_GRACE_TIME;
  }

  function reboundSnake(numTimes = 2) {
    for (let times = 0; times < numTimes; times++) {
      if (segments.length > 1) { player.position.set(segments[0]); }
      for (let i = 0; i < segments.length - 1; i++) {
        segments[i].set(segments[i + 1]);
      }
    }
  }

  function growSnake(appleIndex = -1) {
    if (state.isLost) return;
    if (appleIndex < 0) return;
    let bonus = 0;
    startScreenShake({ magnitude: 0.4, normalizedTime: 0.8 });
    removeApple(appleIndex);
    const numSegmentsToAdd = (() => {
      return Math.max(
        (difficulty.index - Math.floor(segments.length / 100)) * (level.growthMod ?? 1),
        1
      );
    })()
    for (let i = 0; i < numSegmentsToAdd; i++) {
      addSnakeSegment();
    }
    if (!state.isDoorsOpen) {
      addApple();
    } else {
      bonus = CLEAR_BONUS * difficulty.scoreMod;
    }
    state.numApplesEaten += 1;
    score += SCORE_INCREMENT * difficulty.scoreMod + bonus;
    renderScoreUI();
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
    }
  }

  function addSnakeSegment() {
    segments.push(segments[segments.length - 1].copy());
  }

  function drawBackground() {
    p5.background(state.isShowingDeathColours ? PALETTE.deathInvert.background : level.colors.background);
  }

  function drawPlayer(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead,
      state.isShowingDeathColours ? PALETTE.deathInvert.playerHead : level.colors.playerHead);
  }

  function drawPlayerPart(vec: Vector) {
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
      state.isShowingDeathColours ? PALETTE.deathInvert.apple : level.colors.apple,
      state.isShowingDeathColours ? PALETTE.deathInvert.appleStroke : level.colors.appleStroke);
  }

  function drawBarrier(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.barrier : level.colors.barrier,
      state.isShowingDeathColours ? PALETTE.deathInvert.barrierStroke : level.colors.barrierStroke);
  }

  function drawDoor(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.door : level.colors.door,
      state.isShowingDeathColours ? PALETTE.deathInvert.doorStroke : level.colors.doorStroke);
  }

  function drawDecorative1(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.deco1 : level.colors.deco1,
      state.isShowingDeathColours ? PALETTE.deathInvert.deco1Stroke : level.colors.deco1Stroke);
  }

  function drawDecorative2(vec: Vector) {
    drawSquare(vec.x, vec.y,
      state.isShowingDeathColours ? PALETTE.deathInvert.deco2 : level.colors.deco2,
      state.isShowingDeathColours ? PALETTE.deathInvert.deco2Stroke : level.colors.deco2Stroke);
  }

  function drawSquare(x: number, y: number, background = "pink", lineColor = "fff") {
    p5.fill(background);
    p5.stroke(lineColor);
    p5.strokeWeight(STROKE_SIZE);
    const position = {
      x: x * BLOCK_SIZE.x + screenShake.offset.x,
      y: y * BLOCK_SIZE.y + screenShake.offset.y,
    }
    const size = BLOCK_SIZE.x - STROKE_SIZE;
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

  function showGameOver() {
    startCoroutine(showGameOverRoutine());
  }

  function* showGameOverRoutine(): IEnumerator {
    startScreenShake();
    yield* waitForTime(200);
    startScreenShake({ magnitude: 3, normalizedTime: -HURT_STUN_TIME / SCREEN_SHAKE_DURATION_MS, timeScale: 0.1 });
    state.isShowingDeathColours = true;
    yield* waitForTime(HURT_STUN_TIME * 2.5);
    state.isShowingDeathColours = false;
    startScreenShake();
    UI.drawDarkOverlay(uiElements);
    UI.drawButton("TRY AGAIN", 236, 280, () => init(false), uiElements);
    UI.drawButton("MAIN MENU", 20, 20, setup, uiElements);
    UI.drawText(`SCORE: ${Math.floor(totalScore + score)}`, '40px', 370, uiElements);
    UI.drawText(`APPLES: ${state.numApplesEaten + totalApplesEaten}`, '26px', 443, uiElements);
    UI.enableScreenScroll();
    renderScoreUI();
    resetScore();
  }

  function resetScore() {
    score = 0;
    totalScore = 0;
    state.numApplesEaten = 0;
    totalApplesEaten = 0;
  }

  function warpToLevel(levelNum = 1) {
    resetScore();
    level = getLevelFromNum(levelNum);
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
    totalScore += score;
    score = 0;
    totalApplesEaten += state.numApplesEaten;
    state.numApplesEaten = 0;
    levelIndex++;
    level = LEVELS[levelIndex % LEVELS.length];
    init();
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

  function getLevelFromNum(levelNum: number) {
    switch (levelNum) {
      case 1:
        return LEVEL_01;
      case 2:
        return LEVEL_02;
      case 3:
        return LEVEL_03;
      case 4:
        return LEVEL_04;
      case 5:
        return LEVEL_05;
      case 6:
        return LEVEL_06;
      case 7:
        return LEVEL_07;
      case 8:
        return LEVEL_08;
      case 9:
        return LEVEL_09;
      case 10:
        return LEVEL_10;
      case 99:
        return LEVEL_99;
      default:
        return LEVEL_01;
    }
  }
}
