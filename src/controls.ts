import P5 from "p5";
import {
  MAX_MOVES,
  KEYCODE_ALPHA_J,
  KEYCODE_ALPHA_0,
  KEYCODE_ALPHA_1,
  KEYCODE_ALPHA_2,
  KEYCODE_ALPHA_3,
  KEYCODE_ALPHA_4,
  KEYCODE_ALPHA_5,
  KEYCODE_ALPHA_6,
  KEYCODE_ALPHA_7,
  KEYCODE_ALPHA_8,
  KEYCODE_ALPHA_9,
  KEYCODE_ALPHA_W,
  KEYCODE_ALPHA_A,
  KEYCODE_ALPHA_D,
  KEYCODE_ALPHA_S,
  HURT_STUN_TIME,
  KEYCODE_QUOTE,
  KEYCODE_ALPHA_M,
  KEYCODE_NUMPAD_1,
  KEYCODE_NUMPAD_2,
  KEYCODE_NUMPAD_3,
  KEYCODE_NUMPAD_4,
  KEYCODE_ALPHA_C,
  KEYCODE_ALPHA_L,
  KEYCODE_ALPHA_R,
} from './constants';
import { AppMode, ClickState, DIR, GameState, RecentMoveTimings as RecentMoveTimes, RecentMoves, UICancelHandler, UIInteractHandler, UINavDir, UINavEventHandler } from "./types";
import { invertDirection, isOppositeDirection, isOrthogonalDirection, isSameDirection, rotateDirection } from "./utils";

export interface InputCallbacks {
  onHideStartScreen: () => void,
  onShowMainMenu: () => void,
  onConfirmShowMainMenu: () => void,
  onRetryLevel: () => void,
  onStartGame: () => void,
  onToggleCasualMode: () => void,
  onShowLeaderboard: () => void,
  onEnterQuoteMode: () => void,
  onEnterOstMode: () => void,
  onProceedToNextReplayClip: () => void,
  onPause: () => void,
  onUnpause: () => void,
  onWarpToLevel: (level: number) => void,
  onStartMoving: () => void,
  onStartRewinding: () => void,
  onAddMove: (move: DIR) => void,
  onUINavigate: UINavEventHandler,
  onUIInteract: UIInteractHandler,
  onUICancel: UICancelHandler,
}

export function handleKeyPressed(
  p5: P5,
  state: GameState,
  clickState: ClickState,
  playerDirection: DIR,
  moves: DIR[],
  recentMoves: RecentMoves,
  recentInputs: RecentMoves,
  recentInputTimes: RecentMoveTimes,
  checkWillHit: (dir: DIR, numMoves?: number) => boolean,
  callbacks: InputCallbacks,
  ev?: KeyboardEvent,
) {
  const { keyCode, TAB, ENTER, ESCAPE, SHIFT, BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;

  if (state.isGameStarting) {
    return;
  }

  if (keyCode === TAB || keyCode === ENTER) {
    ev?.preventDefault();
  }

  if (state.appMode === AppMode.Leaderboard) {
    return;
  }

  if (state.appMode === AppMode.StartScreen) {
    if (keyCode === ENTER) callbacks.onHideStartScreen();
    return;
  }

  if (state.appMode === AppMode.Quote) {
    if (keyCode === ESCAPE) callbacks.onShowMainMenu();
    return;
  }

  if (!state.isGameStarted && state.appMode === AppMode.Game) {
    if (false) { }
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_QUOTE) callbacks.onEnterQuoteMode();
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_ALPHA_M) callbacks.onEnterOstMode();
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_ALPHA_L) callbacks.onShowLeaderboard();
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_ALPHA_R) callbacks.onProceedToNextReplayClip();
    else if (keyCode === KEYCODE_ALPHA_C) callbacks.onToggleCasualMode();
    handleUIEvents(p5, callbacks.onUINavigate, callbacks.onUIInteract, callbacks.onUICancel);
  }

  if (!state.isGameStarted) {
    return;
  }

  if (state.isExitingLevel || state.isExited) {
    return;
  }

  if (state.isLost) {
    if (keyCode === ENTER) callbacks.onRetryLevel();
    if (keyCode === KEYCODE_ALPHA_M) callbacks.onConfirmShowMainMenu();
    return;
  }

  if (keyCode === ESCAPE && !state.isGameWon) {
    if (state.isPaused) {
      state.isPaused = false;
      callbacks.onUnpause();
    } else {
      state.isPaused = true;
      callbacks.onPause();
    }
  }

  if (state.isPaused) {
    handleUIEvents(p5, callbacks.onUINavigate, callbacks.onUIInteract, callbacks.onUICancel);
    if (keyCode === KEYCODE_ALPHA_0) callbacks.onWarpToLevel(10);
    else if (keyCode === KEYCODE_ALPHA_1) callbacks.onWarpToLevel(1);
    else if (keyCode === KEYCODE_ALPHA_2) callbacks.onWarpToLevel(2);
    else if (keyCode === KEYCODE_ALPHA_3) callbacks.onWarpToLevel(3);
    else if (keyCode === KEYCODE_ALPHA_4) callbacks.onWarpToLevel(4);
    else if (keyCode === KEYCODE_ALPHA_5) callbacks.onWarpToLevel(5);
    else if (keyCode === KEYCODE_ALPHA_6) callbacks.onWarpToLevel(6);
    else if (keyCode === KEYCODE_ALPHA_7) callbacks.onWarpToLevel(7);
    else if (keyCode === KEYCODE_ALPHA_8) callbacks.onWarpToLevel(8);
    else if (keyCode === KEYCODE_ALPHA_9) callbacks.onWarpToLevel(9);
    else if (keyCode === KEYCODE_ALPHA_M) callbacks.onConfirmShowMainMenu();
    return;
  }

  if (keyCode === BACKSPACE || keyCode === DELETE) {
    callbacks.onStartRewinding();
    return;
  }

  let currentMove: DIR | null = null;

  if (clickState.didReceiveInput) {
    currentMove = clickState.directionToPoint;
    clickState.didReceiveInput = false;
  }

  if (keyCode === LEFT_ARROW || keyCode === KEYCODE_ALPHA_A) {
    currentMove = DIR.LEFT;
  } else if (keyCode === RIGHT_ARROW || keyCode === KEYCODE_ALPHA_D) {
    currentMove = DIR.RIGHT;
  } else if (keyCode === UP_ARROW || keyCode === KEYCODE_ALPHA_W) {
    currentMove = DIR.UP;
  } else if (keyCode === DOWN_ARROW || keyCode === KEYCODE_ALPHA_S) {
    currentMove = DIR.DOWN;
  }

  const prevMove = moves.length > 0
    ? moves[moves.length - 1]
    : playerDirection;

  // disallow same moves unless snake is currently stunned after hitting something
  const disallowEqual = state.isMoving && state.timeSinceHurt >= HURT_STUN_TIME;

  if (currentMove) {
    callbacks.onStartMoving();
  }

  // validate current move
  if (moves.length >= MAX_MOVES) {
    return;
  }

  // handle special moves
  if (state.isMoving && state.timeSinceHurt >= HURT_STUN_TIME) {
    updateRecentInputs(recentInputs, recentInputTimes, currentMove, p5.deltaTime);
    const specialMoves = getSpecialMove(playerDirection, recentMoves, recentInputs, recentInputTimes, checkWillHit);
    if (specialMoves?.length) {
      for (let i = 0; i < specialMoves.length; i++) {
        const prevMove = moves.length > 0
          ? moves[moves.length - 1]
          : playerDirection;
        if (validateMove(prevMove, specialMoves[i], disallowEqual)) {
          callbacks.onAddMove(specialMoves[i]);
        }
      }
      return;
    }
  }

  if (!validateMove(prevMove, currentMove, disallowEqual)) {
    return;
  }

  callbacks.onAddMove(currentMove);
}

export function handleUIEvents(p5: P5, onUINavigate: UINavEventHandler, onUIInteract: UIInteractHandler, onUICancel: UICancelHandler) {
  const { keyCode, ENTER, ESCAPE, SHIFT, TAB, BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;
  if (false) { }
  else if (keyCode === LEFT_ARROW || keyCode === KEYCODE_ALPHA_A) onUINavigate(UINavDir.Left)
  else if (keyCode === RIGHT_ARROW || keyCode === KEYCODE_ALPHA_D) onUINavigate(UINavDir.Right)
  else if (keyCode === UP_ARROW || keyCode === KEYCODE_ALPHA_W) onUINavigate(UINavDir.Up)
  else if (keyCode === DOWN_ARROW || keyCode === KEYCODE_ALPHA_S) onUINavigate(UINavDir.Down)
  else if (keyCode === TAB && p5.keyIsDown(SHIFT)) onUINavigate(UINavDir.Prev)
  else if (keyCode === TAB && !p5.keyIsDown(SHIFT)) onUINavigate(UINavDir.Next)
  else if (keyCode === ENTER) onUIInteract();
  else if (keyCode === ESCAPE || keyCode === BACKSPACE || keyCode === DELETE) onUICancel();
}

function updateRecentInputs(recentInputs: RecentMoves, recentInputTimes: RecentMoveTimes, currentMove: DIR, deltaTime: number) {
  if (!currentMove) {
    return;
  }
  // prevent duplicate inputs
  // note - if a special move needs repeated keys, this needs to be refactored.
  if (currentMove === recentInputs[0]) {
    return;
  }
  for (let i = recentInputs.length - 1; i >= 0; i--) {
    if (i > 0) {
      recentInputs[i] = recentInputs[i - 1];
      recentInputTimes[i] = recentInputTimes[i - 1];
    } else {
      recentInputs[i] = currentMove;
      recentInputTimes[i] = 0;
    }
  }
}

const SPECIAL_MOVE_REPEAT_TIME = 120;
function getSpecialMove(currentDirection: DIR, recentMoves: RecentMoves, recentInputs: RecentMoves, recentInputTimes: RecentMoveTimes, checkWillHit: (dir: DIR, numMoves?: number) => boolean): (DIR[] | null) {
  if (!currentDirection) {
    return null;
  }
  const isTryingToReverseDirection = recentInputs[0]
    && recentInputs[0] === invertDirection(currentDirection)
    && recentInputTimes[0] === 0
    && recentInputTimes[1] > SPECIAL_MOVE_REPEAT_TIME;
  if (isTryingToReverseDirection) {
    const specialMoves = [rotateDirection(currentDirection), invertDirection(currentDirection)];
    // did turn one corner, e.g. was going RIGHT, now going DOWN
    const didTurnOneCorner = isSameDirection(recentMoves[0], currentDirection) && isOrthogonalDirection(recentMoves[1], currentDirection);
    // is the current configuration a result of a previous special move?
    const didPrevSpecialMove = didTurnOneCorner
      && isSameDirection(recentMoves[0], currentDirection)
      && isOrthogonalDirection(recentMoves[1], currentDirection)
      && isOppositeDirection(recentMoves[2], currentDirection)
      && isOrthogonalDirection(recentMoves[3], currentDirection)
      && isSameDirection(recentInputs[1], currentDirection)
      && isOppositeDirection(recentInputs[2], currentDirection);
    // did the player intentionally zig-zag? e.g. was going RIGHT then turned UP and LEFT
    const didZigZagIntentionally = didTurnOneCorner
      && isSameDirection(recentMoves[0], currentDirection)
      && isOrthogonalDirection(recentMoves[1], currentDirection)
      && isOppositeDirection(recentMoves[2], currentDirection)
      && isSameDirection(recentInputs[1], currentDirection)
      && isOrthogonalDirection(recentInputs[2], currentDirection)
      && isOppositeDirection(recentInputs[3], currentDirection)
      && (Math.abs(recentInputTimes[2] - recentInputTimes[1]) < SPECIAL_MOVE_REPEAT_TIME);
    if (didPrevSpecialMove || didZigZagIntentionally) {
      // assume player wants to continue turning in on snekself
      specialMoves[0] = recentMoves[1];
    } else if (didTurnOneCorner) {
      specialMoves[0] = invertDirection(recentMoves[1]);
    }
    if (checkWillHit(specialMoves[0])) {
      specialMoves[0] = invertDirection(specialMoves[0]);
    }
    if (checkWillHit(specialMoves[0])) {
      return null;
    }
    return specialMoves;
  }

  return null;
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
