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
  HURT_STUN_TIME,
  KEYCODE_QUOTE,
  KEYCODE_ALPHA_M,
  KEYCODE_NUMPAD_1,
  KEYCODE_NUMPAD_2,
  KEYCODE_NUMPAD_3,
  KEYCODE_NUMPAD_4,
} from './constants';
import { AppMode, ClickState, DIR, GameState } from "./types";

export interface InputCallbacks {
  onHideStartScreen: () => void
  onSetup: () => void
  onInit: () => void
  onStartGame: (difficulty: number) => void
  onEnterQuoteMode: () => void
  onEnterOstMode: () => void
  onPause: () => void
  onUnpause: () => void
  onWarpToLevel: (level: number) => void
  onStartMoving: () => void
  onStartRewinding: () => void
  onAddMove: (move: DIR) => void
}

export function handleKeyPressed(p5: P5, state: GameState, clickState: ClickState, playerDirection: DIR, moves: DIR[], callbacks: InputCallbacks) {
  const { keyCode, ENTER, ESCAPE, SHIFT, BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;
  const {
    onHideStartScreen,
    onSetup,
    onInit,
    onStartGame,
    onEnterQuoteMode,
    onEnterOstMode,
    onPause,
    onUnpause,
    onWarpToLevel,
    onStartMoving,
    onStartRewinding,
    onAddMove,
  } = callbacks

  if (state.isGameStarting) {
    return;
  }

  if (state.appMode === AppMode.StartScreen) {
    if (keyCode === ENTER) onHideStartScreen();
    return;
  }

  if (state.appMode === AppMode.Quote) {
    if (keyCode === ESCAPE) onSetup();
    return;
  }

  if (state.isLost) {
    if (keyCode === ENTER) onInit();
    if (keyCode === KEYCODE_ALPHA_M) onSetup();
    return;
  }

  if (!state.isGameStarted && state.appMode === AppMode.Game) {
    if (false) { }
    else if (keyCode === KEYCODE_1 || keyCode === KEYCODE_NUMPAD_1) onStartGame(1);
    else if (keyCode === KEYCODE_2 || keyCode === KEYCODE_NUMPAD_2) onStartGame(2);
    else if (keyCode === KEYCODE_3 || keyCode === KEYCODE_NUMPAD_3) onStartGame(3);
    else if (keyCode === KEYCODE_4 || keyCode === KEYCODE_NUMPAD_4) onStartGame(4);
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_QUOTE) onEnterQuoteMode();
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_ALPHA_M) onEnterOstMode();
    return;
  }

  if (!state.isGameStarted) {
    return;
  }

  if (state.isExitingLevel || state.isExited) {
    return;
  }

  if (keyCode === ESCAPE) {
    if (state.isPaused) {
      state.isPaused = false;
      onUnpause();
    } else {
      state.isPaused = true;
      onPause();
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

  if (keyCode === BACKSPACE || keyCode === DELETE) {
    onStartRewinding();
    return;
  }

  let currentMove: DIR | null = null;

  if (clickState.didReceiveInput) {
    currentMove = clickState.directionToPoint;
    clickState.didReceiveInput = false;
  }

  if (keyCode === LEFT_ARROW || keyCode === KEYCODE_A) {
    currentMove = DIR.LEFT;
  } else if (keyCode === RIGHT_ARROW || keyCode === KEYCODE_D) {
    currentMove = DIR.RIGHT;
  } else if (keyCode === UP_ARROW || keyCode === KEYCODE_W) {
    currentMove = DIR.UP;
  } else if (keyCode === DOWN_ARROW || keyCode === KEYCODE_S) {
    currentMove = DIR.DOWN;
  }

  const prevMove = moves.length > 0
    ? moves[moves.length - 1]
    : playerDirection;

  // disallow same moves unless snake is currently stunned after hitting something
  const disallowEqual = state.isMoving && state.timeSinceHurt >= HURT_STUN_TIME;

  if (currentMove) {
    onStartMoving();
  }

  // validate current move
  if (moves.length >= MAX_MOVES) return;
  if (!validateMove(prevMove, currentMove, disallowEqual)) return;

  onAddMove(currentMove);
}

export function validateMove(prev: DIR, current: DIR, disallowEqual = true) {
  if (!current) return false;
  if (disallowEqual && prev === current) return false;
  if (prev === DIR.UP && current === DIR.DOWN) return false;
  if (prev === DIR.DOWN && current === DIR.UP) return false;
  if (prev === DIR.LEFT && current === DIR.RIGHT) return false;
  if (prev === DIR.RIGHT && current === DIR.LEFT) return false;
  return true;
}
