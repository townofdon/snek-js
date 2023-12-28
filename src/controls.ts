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
  KEYCODE_ALPHA_C,
  KEYCODE_ALPHA_L,
} from './constants';
import { AppMode, ClickState, DIR, GameState, RecentMoveTimings as RecentMoveTimes, RecentMoves } from "./types";
import { invertDirection, isOppositeDirection, isOrthogonalDirection, isSameDirection, rotateDirection } from "./utils";

export interface InputCallbacks {
  onHideStartScreen: () => void
  onShowMainMenu: () => void
  onConfirmShowMainMenu: () => void
  onInit: () => void
  onStartGame: (difficulty: number) => void
  onToggleCasualMode: () => void
  onShowLeaderboard: () => void
  onEnterQuoteMode: () => void
  onEnterOstMode: () => void
  onPause: () => void
  onUnpause: () => void
  onWarpToLevel: (level: number) => void
  onStartMoving: () => void
  onStartRewinding: () => void
  onAddMove: (move: DIR) => void
}

interface HandleKeyPressedParams {
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
}

export function handleKeyPressed({
  p5,
  state,
  clickState,
  playerDirection,
  moves,
  recentMoves,
  recentInputs,
  recentInputTimes,
  checkWillHit,
  callbacks,
}: HandleKeyPressedParams) {
  const { keyCode, ENTER, ESCAPE, SHIFT, BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;
  const {
    onHideStartScreen,
    onShowMainMenu,
    onConfirmShowMainMenu,
    onInit,
    onStartGame,
    onToggleCasualMode,
    onShowLeaderboard,
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

  if (state.appMode === AppMode.Leaderboard) {
    return;
  }

  if (state.appMode === AppMode.StartScreen) {
    if (keyCode === ENTER) onHideStartScreen();
    return;
  }

  if (state.appMode === AppMode.Quote) {
    if (keyCode === ESCAPE) onShowMainMenu();
    return;
  }

  if (state.isLost) {
    if (keyCode === ENTER) onInit();
    if (keyCode === KEYCODE_ALPHA_M) onConfirmShowMainMenu();
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
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_ALPHA_L) onShowLeaderboard();
    else if (keyCode === KEYCODE_ALPHA_C) onToggleCasualMode();
    return;
  }

  if (!state.isGameStarted) {
    return;
  }

  if (state.isExitingLevel || state.isExited) {
    return;
  }

  if (keyCode === ESCAPE && !state.isGameWon) {
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
    else if (keyCode === KEYCODE_ALPHA_M) onConfirmShowMainMenu();
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
          onAddMove(specialMoves[i]);
        }
      }
      return;
    }
  }

  if (!validateMove(prevMove, currentMove, disallowEqual)) {
    return;
  }

  onAddMove(currentMove);
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
  const isTryingToReverseDirection = recentInputs[0] && recentInputs[0] === invertDirection(currentDirection) && recentInputTimes[0] === 0;
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
