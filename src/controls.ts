import P5 from "p5";
import {
  MAX_MOVES,
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
  KEYCODE_W,
  KEYCODE_A,
  KEYCODE_D,
  KEYCODE_S,
} from './constants';
import { DIR, GameState } from "./types";

export interface InputCallbacks {
  onInit: () => void
  onStartGame: (difficulty: number) => void
  onClearUI: () => void
  onShowPortalUI: () => void
  onWarpToLevel: (level: number) => void
  onStartMoving: () => void
}

export function handleKeyPressed(p5: P5, state: GameState, playerDirection: DIR, moves: DIR[], callbacks: InputCallbacks) {
  const { keyCode, ENTER, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;
  const {
    onInit,
    onStartGame,
    onClearUI,
    onShowPortalUI,
    onWarpToLevel,
    onStartMoving,
  } = callbacks

  if (state.isLost) {
    if (keyCode === p5.ENTER) onInit();
    return;
  }

  if (!state.isGameStarted) {
    if (keyCode === KEYCODE_1) onStartGame(1);
    else if (keyCode === KEYCODE_2) onStartGame(2);
    else if (keyCode === KEYCODE_3) onStartGame(3);
    else if (keyCode === KEYCODE_4) onStartGame(4);
    else if (keyCode === ENTER) onStartGame(2);
    return;
  }

  if (keyCode === KEYCODE_J) {
    if (state.isPaused) {
      state.isPaused = false;
      onClearUI();
    } else {
      state.isPaused = true;
      onShowPortalUI();
    }
  }

  if (state.isPaused) {
    if (keyCode === KEYCODE_0) onWarpToLevel(10);
    else if (keyCode === KEYCODE_1) onWarpToLevel(1);
    else if (keyCode === KEYCODE_2) onWarpToLevel(2);
    else if (keyCode === KEYCODE_3) onWarpToLevel(3);
    else if (keyCode === KEYCODE_4) onWarpToLevel(4);
    else if (keyCode === KEYCODE_5) onWarpToLevel(5);
    else if (keyCode === KEYCODE_6) onWarpToLevel(6);
    else if (keyCode === KEYCODE_7) onWarpToLevel(7);
    else if (keyCode === KEYCODE_8) onWarpToLevel(8);
    else if (keyCode === KEYCODE_9) onWarpToLevel(9);
    return;
  }

  const prevMove = moves.length > 0
    ? moves[moves.length - 1]
    : playerDirection;
  let currentMove = null;

  if (keyCode === LEFT_ARROW || keyCode === KEYCODE_A) {
    currentMove = DIR.LEFT;
  } else if (keyCode === RIGHT_ARROW || keyCode === KEYCODE_D) {
    currentMove = DIR.RIGHT;
  } else if (keyCode === UP_ARROW || keyCode === KEYCODE_W) {
    currentMove = DIR.UP;
  } else if (keyCode === DOWN_ARROW || keyCode === KEYCODE_S) {
    currentMove = DIR.DOWN;
  }

  if (currentMove) {
    onStartMoving();
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
