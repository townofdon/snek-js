const title = 'SNEK';

const DIMENSIONS = { x: 600, y: 600 };
const GRIDCOUNT = { x: 30, y: 30 };
const BLOCK_SIZE = { x: DIMENSIONS.x / GRIDCOUNT.x, y: DIMENSIONS.y / GRIDCOUNT.y };
const STROKE_SIZE = 4;
const BASE_TICK_MS = 300;
const MAX_MOVES = 4;
const START_SNAKE_SIZE = 3;
const SPEED_INCREMENT = 1;
const NUM_APPLES_START = 3;

const SCORE_INCREMENT = 10;
const CLEAR_BONUS = 50;
const LEVEL_BONUS = 100;

const SPEED_MOD_EASY = .35;
const SPEED_MOD_MEDIUM = .75;
const SPEED_MOD_HARD = 1.6;

const NUM_APPLES_MOD_EASY = .5;
const NUM_APPLES_MOD_MEDIUM = .9;
const NUM_APPLES_MOD_HARD = 1;

const SCORE_MOD_EASY = .5;
const SCORE_MOD_MEDIUM = 2;
const SCORE_MOD_HARD = 5;

const INITIAL_LEVEL = LEVEL_01;
const KEYCODE_J = 74;
const KEYCODE_0 = 48;
const KEYCODE_1 = 49;
const KEYCODE_2 = 50;
const KEYCODE_3 = 51;
const KEYCODE_4 = 52;
const KEYCODE_5 = 53;
const KEYCODE_6 = 54;
const KEYCODE_7 = 55;
const KEYCODE_8 = 56;
const KEYCODE_9 = 57;
const KEYCODE_SPACE = 32;

const SCREEN_SHAKE_DURATION_MS = 1000;
const SCREEN_SHAKE_MAGNITUDE_PX = 4;

const DIR = {
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
}

let level = INITIAL_LEVEL;
let difficulty = {
  speedMod: SPEED_MOD_EASY,
  applesMod: NUM_APPLES_MOD_EASY,
  scoreMod: SCORE_MOD_EASY,
};

let score = 0;
let totalScore = 0;
let totalApplesEaten = 0;

let state = {
  isPaused: false,
  isStarted: true,
  isLost: false,
  isDoorsOpen: false,
  timeElapsed: 0,
  timeSinceLastMove: Infinity,
  speed: 1,
  numApplesEaten: 0,
};
let player = {
  position: null, // vector2
  direction: DIR.RIGHT,
};
let screenShake = {
  offset: null, // vector2
  timeSinceStarted: Infinity,
  magnitude: 1,
};

let moves = [];
let segments = [];
let apples = [];
let barriers = [];
let doors = [];
let nospawns = [];

let decoratives1 = [];
let decoratives2 = [];

let barriersMap = {};
let doorsMap = {};
let nospawnsMap = {};

let uiElements = [];
let particleSystems = [];

class AppleParticleSystem extends ParticleSystem {
  /** 
   * @param {p5.Vector} origin
   */
  constructor(origin, { spawnMod = 1, speedMod = 1, scaleMod = 1 } = {}) {
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
      BLOCK_SIZE,
      origin,
      colorStart: color(colorStart),
      colorEnd: color(colorEnd),
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

function setup() {
  level = INITIAL_LEVEL;
  frameRate(30);
  clearUI();
  init();

  score = 0;
  totalScore = 0;
  totalApplesEaten = 0;
  state.isStarted = false;
  UI.disableScreenScroll();

  UI.drawDarkOverlay(uiElements);
  UI.drawTitle(title, "#ffc000", 5, true, uiElements);
  UI.drawTitle(title, "#cdeaff", 0, false, uiElements);
  UI.drawButton("EASY", 150, 280, () => startGame(1), uiElements);
  UI.drawButton("MEDIUM", 255, 280, () => startGame(2), uiElements);
  UI.drawButton("HARD", 370, 280, () => startGame(3), uiElements);
}

function startGame(dif = 2) {
  switch (dif) {
    case 1:
      difficulty = {
        speedMod: SPEED_MOD_EASY,
        applesMod: NUM_APPLES_MOD_EASY,
        scoreMod: SCORE_MOD_EASY,
      }
      break;
    case 2:
      difficulty = {
        speedMod: SPEED_MOD_MEDIUM,
        applesMod: NUM_APPLES_MOD_MEDIUM,
        scoreMod: SCORE_MOD_MEDIUM,
      }
      break;
    case 3:
      difficulty = {
        speedMod: SPEED_MOD_HARD,
        applesMod: NUM_APPLES_MOD_HARD,
        scoreMod: SCORE_MOD_HARD,
      }
      break;
    default:
      throw new Error(`Unexpected difficulty: ${difficulty}`)
  }
  state.isStarted = true;
  UI.disableScreenScroll();
  clearUI();
}

function clearUI() {
  uiElements.forEach(element => element.remove())
  uiElements = [];
  UI.drawLevelName(level.name, "#fff", uiElements);
}

function init() {
  clearUI();
  createCanvas(DIMENSIONS.x, DIMENSIONS.y);
  UI.disableScreenScroll();

  score = 0;
  player.position = createVector(15, 15);
  player.direction = DIR.RIGHT;
  state.isPaused = false;
  state.isStarted = true;
  state.isLost = false;
  state.isDoorsOpen = false;
  state.timeElapsed = 0;
  state.timeSinceLastMove = Infinity;
  screenShake.timeSinceStarted = Infinity;
  screenShake.magnitude = 1;
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

      const vec = createVector(x, y);

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
      }
    }
    if (y >= GRIDCOUNT.y) { console.warn("level layout is too tall"); break; }
  }

  // create snake parts
  let x = player.position.x;
  for (let i = 0; i < START_SNAKE_SIZE; i++) {
    segments.push(createVector(--x, player.position.y));
  }

  // add initial apples
  const numApplesStart = level.numApplesStart || NUM_APPLES_START;
  for (let i = 0; i < numApplesStart; i++) {
    addApple();
  }
}

function keyPressed() {
  if (state.isLost) {
    if (keyCode === ENTER) init();
    return;
  }

  if (!state.isStarted) {
    if (keyCode === ENTER) startGame();
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
    ? (moves.length === 1 ? moves[0] : moves[moves.length - 1])
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

function validateMove(prev, current) {
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

  const applesMap = {};
  for (let i = 0; i < apples.length; i++) {
    if (!apples[i]) continue;
    drawApple(apples[i]);
    if (state.isLost) continue;
    applesMap[getCoordIndex(apples[i])] = i;
  }

  const snakePositionsMap = {};
  for (let i = 0; i < segments.length; i++) {
    drawPlayerPart(segments[i]);
    if (state.isLost) continue;
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
  if (!state.isStarted) return;

  // check if head has reached an apple
  const appleFound = applesMap[getCoordIndex(player.position)];
  if (appleFound != undefined && appleFound >= 0) {
    spawnAppleParticles(player.position);
    growSnake(appleFound);
  }

  const playerPositionDisplay = `(${player.position.x},${player.position.y})`;

  // check to see if snake ran into itself
  if (snakePositionsMap[getCoordIndex(player.position)]) {
    console.log(`snake ran into itself - position ${playerPositionDisplay}`);
    state.isLost = true;
  }

  // check if player has hit a door
  if (doorsMap[getCoordIndex(player.position)]) {
    console.log(`snake hit a door - position ${playerPositionDisplay}`);
    state.isLost = true;
  }

  // check if player has hit a barrier
  if (barriersMap[getCoordIndex(player.position)]) {
    console.log(`snake hit a barrier - position ${playerPositionDisplay}`);
    state.isLost = true;
  }

  apples = apples.filter(apple => !!apple);

  if (state.isLost) {
    startScreenShake();
    showGameOver();
    resetScore();
    return;
  }

  if (state.timeSinceLastMove >= BASE_TICK_MS / max(state.speed * difficulty.speedMod, 1)) {
    movePlayer();
  } else {
    state.timeSinceLastMove += deltaTime;
  }
  state.timeElapsed += deltaTime;

  if (getHasClearedLevel() && !state.isDoorsOpen) {
    openDoors();
  }

  if (
    player.position.x > GRIDCOUNT.x - 1 ||
    player.position.x < 0 ||
    player.position.y > GRIDCOUNT.y - 1 ||
    player.position.y < 0
  ) {
    gotoNextLevel();
  }
}

function spawnAppleParticles(position) {
  particleSystems.push(new AppleParticleSystem(position));
  particleSystems.push(new AppleParticleSystem(position, { spawnMod: .3, speedMod: 4, scaleMod: .5 }));
}

function startScreenShake({ magnitude = 1, normalizedTime = 0 } = {}) {
  screenShake.timeSinceStarted = normalizedTime * SCREEN_SHAKE_DURATION_MS;
  screenShake.magnitude = magnitude;
}

function updateScreenShake() {
  screenShake.timeSinceStarted += deltaTime;
  if (screenShake.offset == null) screenShake.offset = createVector(0, 0);
  if (screenShake.timeSinceStarted < SCREEN_SHAKE_DURATION_MS) {
    screenShake.offset.x = (random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
    screenShake.offset.y = (random(2) - 1) * SCREEN_SHAKE_MAGNITUDE_PX * screenShake.magnitude;
  } else {
    screenShake.offset.x = 0;
    screenShake.offset.y = 0;
    screenShake.magnitude = 1;
  }
}

function getHasClearedLevel() {
  if (state.numApplesEaten >= level.applesToClear * difficulty.applesMod) return true;
  if (state.timeElapsed >= level.timeToClear && state.numApplesEaten >= level.applesToClear * difficulty.applesMod * 0.5) return true;
  return false;
}

function getCoordIndex(vec) {
  return Utils.clamp(vec.x, 0, GRIDCOUNT.x - 1) + Utils.clamp(vec.y, 0, GRIDCOUNT.y - 1) * GRIDCOUNT.x
}

function movePlayer() {
  if (moves.length > 0) {
    player.direction = moves.shift()
  }
  let direction;
  switch (player.direction) {
    case DIR.LEFT:
      direction = createVector(-1, 0);
      break;
    case DIR.RIGHT:
      direction = createVector(1, 0);
      break;
    case DIR.UP:
      direction = createVector(0, -1);
      break;
    case DIR.DOWN:
      direction = createVector(0, 1);
      break;
    default:
      direction = createVector(0, 0);
  }
  let next = player.position;
  for (let i = 0; i < segments.length; i++) {
    const temp = segments[i].copy();
    segments[i].set(next.x, next.y);
    next = temp;
  }
  player.position.add(direction);
  state.timeSinceLastMove = 0;
}

function growSnake(appleIndex) {
  if (state.isLost) return;
  let bonus = 0;
  startScreenShake({ magnitude: 0.4, normalizedTime: 0.8 });
  removeApple(appleIndex);
  addSnakeSegment();
  if (!state.isDoorsOpen) {
    addApple();
  } else {
    bonus = CLEAR_BONUS * difficulty.scoreMod;
  }
  state.speed += SPEED_INCREMENT * min(difficulty.speedMod, 1);
  state.numApplesEaten += 1;
  score += SCORE_INCREMENT * difficulty.scoreMod + bonus;
}

function removeApple(index) {
  apples = apples.slice(0, index).concat(apples.slice(index + 1))
}

function addApple(numTries = 0) {
  const x = parseInt(random(GRIDCOUNT.x - 2), 10) + 1;
  const y = parseInt(random(GRIDCOUNT.y - 2), 10) + 1;
  const apple = createVector(x, y);
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
  background(level.colors.background);
}

function drawPlayer(vec) {
  drawSquare(vec.x, vec.y, level.colors.playerHead, level.colors.playerHead);
}

function drawPlayerPart(vec) {
  drawSquare(vec.x, vec.y, level.colors.playerTail, level.colors.playerTailStroke);
}

function drawApple(vec) {
  drawSquare(vec.x, vec.y, level.colors.apple, level.colors.appleStroke);
}

function drawBarrier(vec) {
  drawSquare(vec.x, vec.y, level.colors.barrier, level.colors.barrierStroke);
}

function drawDoor(vec) {
  drawSquare(vec.x, vec.y, level.colors.door, level.colors.doorStroke);
}

function drawDecorative1(vec) {
  drawSquare(vec.x, vec.y, level.colors.deco1, level.colors.deco1Stroke);
}

function drawDecorative2(vec) {
  drawSquare(vec.x, vec.y, level.colors.deco2, level.colors.deco2Stroke);
}

function drawSquare(x, y, background = "pink", lineColor = "fff") {
  fill(background);
  stroke(lineColor);
  strokeWeight(STROKE_SIZE);
  const position = {
    x: x * BLOCK_SIZE.x + screenShake.offset.x,
    y: y * BLOCK_SIZE.y + screenShake.offset.y,
  }
  const size = BLOCK_SIZE.x - STROKE_SIZE;
  square(position.x, position.y, size);
}

function drawParticles() {
  const tempParticleSystems = [];
  for (let i = 0; i < particleSystems.length; i++) {
    particleSystems[i].draw(BLOCK_SIZE, screenShake);
    particleSystems[i].tick();
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
  UI.drawDarkOverlay(uiElements);
  UI.drawButton("TRY AGAIN", 236, 280, init, uiElements);
  UI.drawButton("MAIN MENU", 20, 20, setup, uiElements);
  UI.drawText(`SCORE: ${parseInt(totalScore + score, 10)}`, '40px', 370, uiElements);
  UI.drawText(`APPLES: ${state.numApplesEaten + totalApplesEaten}`, '26px', 443, uiElements);
  UI.enableScreenScroll();
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
  score += LEVEL_BONUS * difficulty.scoreMod;
  totalScore += score;
  score = 0;
  totalApplesEaten += state.numApplesEaten;
  state.numApplesEaten = 0;
  level = getNextLevel();
  init();
}

function getNextLevel() {
  switch (level) {
    case LEVEL_01:
      return LEVEL_02;
    case LEVEL_02:
      return LEVEL_03;
    case LEVEL_03:
      return LEVEL_04;
    case LEVEL_04:
      return LEVEL_05;
    case LEVEL_05:
      return LEVEL_06;
    case LEVEL_06:
      return LEVEL_07;
    case LEVEL_07:
      return LEVEL_08;
    case LEVEL_08:
      return LEVEL_09;
    case LEVEL_09:
      return LEVEL_10;
    case LEVEL_10:
      return LEVEL_99;
    default:
      return LEVEL_01;
  }
}

function getLevelFromNum(levelNum) {
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
