const title = 'SNEK';

const DIMENSIONS = { x: 600, y: 600 };
const GRIDCOUNT = { x: 30, y: 30 };
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

let state = {};
let player = {};
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

function setup() {
  level = INITIAL_LEVEL;
  frameRate(30);
  clearUI();
  init();

  score = 0;
  totalScore = 0;
  totalApplesEaten = 0;
  state.isStarted = false;

  UI.drawDarkOverlay(uiElements);
  UI.drawTitle(title, "#ffc000", 5, true, uiElements);
  UI.drawTitle(title, "#cdeaff", 0, false, uiElements);
  UI.drawButton("EASY", 150, 280, () => startGame(1), uiElements);
  UI.drawButton("MEDIUM", 255, 280, () => startGame(2), uiElements);
  UI.drawButton("HARD", 370, 280, () => startGame(3), uiElements);
}

function startGame(dif = 0) {
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
  clearUI();
  UI.drawLevelName(level.name, "#fff", uiElements);
}

function clearUI() {
  uiElements.forEach(element => element.remove())
  uiElements = [];
}

function init() {
  clearUI();
  createCanvas(DIMENSIONS.x, DIMENSIONS.y);
  UI.drawLevelName(level.name, "#fff", uiElements);

  score = 0;
  player = {
    position: createVector(15, 15),
    direction: DIR.RIGHT,
  }
  state = {
    isStarted: true,
    isLost: false,
    isDoorsOpen: false,
    timeElapsed: 0,
    timeSinceLastMove: Infinity,
    speed: 1,
    numApplesEaten: 0,
  }

  moves = [];
  barriers = [];
  doors = [];
  apples = [];
  segments = []
  nospawns = [];

  decoratives1 = [];
  decoratives2 = [];

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
  if (state.isLost) {
    return;
  }

  drawBackground();

  for (let i = 0; i < decoratives1.length; i++) {
    drawDecorative1(decoratives1[i]);
  }

  for (let i = 0; i < decoratives2.length; i++) {
    drawDecorative2(decoratives2[i]);
  }

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
    applesMap[getCoordIndex(apples[i])] = i;
  }

  const snakePositionsMap = {};
  for (let i = 0; i < segments.length; i++) {
    drawPlayerPart(segments[i]);
    snakePositionsMap[getCoordIndex(segments[i])] = true;
    const appleFound = applesMap[getCoordIndex(segments[i])];
    if (appleFound != undefined && appleFound >= 0) {
      applesMap[getCoordIndex(segments[i])] = -1;
      growSnake(appleFound);
    }
  }

  drawPlayer(player.position);

  if (!state.isStarted) {
    return;
  }

  // check if head has reached an apple
  const appleFound = applesMap[getCoordIndex(player.position)];
  if (appleFound != undefined && appleFound >= 0) {
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
    showGameOver();
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

function getHasClearedLevel() {
  if (state.numApplesEaten >= level.applesToClear * difficulty.applesMod) return true;
  if (state.timeElapsed >= level.timeToClear && state.numApplesEaten >= level.applesToClear * difficulty.applesMod * 0.5) return true;
  return false;
}

function getCoordIndex(vec) {
  return clamp(vec.x, 0, GRIDCOUNT.x - 1) + clamp(vec.y, 0, GRIDCOUNT.y - 1) * GRIDCOUNT.x
}

function clamp(val, minVal, maxVal) {
  return max(min(val, maxVal), minVal);
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
  let bonus = 0;
  removeApple(appleIndex);
  addSegment();
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

function addSegment() {
  segments.push(segments[segments.length - 1].copy());
}

function drawBackground() {
  background("#505050");
}

function drawPlayer(vec) {
  drawSquare(vec.x, vec.y, "#fa0", "#fa0");
}

function drawPlayerPart(vec) {
  drawSquare(vec.x, vec.y, "#CA8F17", "#E9D3A7");
}

function drawApple(vec) {
  drawSquare(vec.x, vec.y, "#FF4B00", "#742A2A");
}

function drawBarrier(vec) {
  drawSquare(vec.x, vec.y, "#1579B6", "#607D8B");
}

function drawDoor(vec) {
  drawSquare(vec.x, vec.y, "#B6B115", "#8B8A60");
}

function drawDecorative1(vec) {
  drawSquare(vec.x, vec.y, "#535353", "#515151");
}

function drawDecorative2(vec) {
  drawSquare(vec.x, vec.y, "#595959", "#555555");
}

function drawSquare(x, y, background = "pink", lineColor = "fff") {
  fill(background)
  stroke(lineColor)
  strokeWeight(STROKE_SIZE);
  square(x * DIMENSIONS.x / GRIDCOUNT.x, y * DIMENSIONS.y / GRIDCOUNT.y, 600 / 30 - STROKE_SIZE);
}

function showGameOver() {
  UI.drawButton("TRY AGAIN", 250, 280, init, uiElements);
  UI.drawButton("MAIN MENU", 20, 20, setup, uiElements);
  UI.drawText(`SCORE: ${parseInt(totalScore + score, 10)}`, '40px', 370, uiElements);
  UI.drawText(`APPLES: ${state.numApplesEaten + totalApplesEaten}`, '26px', 443, uiElements);
  score = 0;
  totalScore = 0;
  state.numApplesEaten = 0;
  totalApplesEaten = 0;
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
