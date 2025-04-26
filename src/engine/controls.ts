import P5 from "p5";
import {
  MAX_MOVES,
  KEYCODE_ALPHA_A,
  KEYCODE_ALPHA_C,
  KEYCODE_ALPHA_D,
  KEYCODE_ALPHA_P,
  KEYCODE_ALPHA_R,
  KEYCODE_ALPHA_S,
  KEYCODE_ALPHA_W,
  HURT_STUN_TIME,
  HURT_MOVE_RESET_INITIAL_DELAY,
  HURT_MOVE_RESET_INPUT_DELAY,
} from '../constants';
import { AppMode, ClickState, DIR, GameMode, GameState, InputAction, RecentMoveTimings as RecentMoveTimes, RecentMoves, UINavDir, UINavEventHandler } from "../types";
import { invertDirection, isOppositeDirection, isOrthogonalDirection, isSameDirection, rotateDirection } from "../utils";

export interface InputCallbacks {
  onWarpToLevel: (level: number) => void,
  onAddMove: (move: DIR) => void,
  onResetMoves: () => void,
  onUINavigate: UINavEventHandler,
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
  callAction: (action: InputAction) => void,
  ev?: KeyboardEvent,
): boolean {
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
    if (keyCode === ENTER) callAction(InputAction.HideStartScreen);
    return;
  }

  if (state.appMode === AppMode.Quote) {
    if (keyCode === ESCAPE) callAction(InputAction.ShowMainMenu);
    return;
  }

  if (!state.isGameStarted && state.appMode === AppMode.Game) {
    if (false) { }
    else if (p5.keyIsDown(SHIFT) && keyCode === KEYCODE_ALPHA_R) callAction(InputAction.ProceedToNextReplayClip);
    else if (keyCode === KEYCODE_ALPHA_C) callAction(InputAction.ToggleCasualMode);
  }

  if (!state.isGameStarted) {
    return;
  }

  if (state.isExitingLevel || state.isExited) {
    return;
  }

  if (state.isLost && state.timeSinceHurt > 20) {
    if (keyCode === ENTER && state.gameMode !== GameMode.Cobra) callAction(InputAction.RetryLevel);
    return;
  }

  if (!state.isLost && !state.isGameWon && [ENTER, ESCAPE, KEYCODE_ALPHA_P].includes(keyCode)) {
    if (state.isPaused) {
      callAction(InputAction.UnPause);
    } else {
      callAction(InputAction.Pause);
    }
  }

  if (state.isPaused) {
    return;
  }

  if (keyCode === BACKSPACE || keyCode === DELETE) {
    callAction(InputAction.StartRewinding);
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
  const disallowEqual = state.isMoving && (moves.length >= 2 || state.timeSinceHurt >= HURT_STUN_TIME);

  if (currentMove) {
    callAction(InputAction.StartMoving);
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

  // reset on hurt (might remove this later)
  if (
    !!moves.length &&
    state.timeSinceHurt < HURT_STUN_TIME &&
    state.timeSinceHurt > HURT_MOVE_RESET_INITIAL_DELAY &&
    state.timeSinceLastInput > HURT_MOVE_RESET_INPUT_DELAY
  ) {
    callbacks.onResetMoves();
  }

  callbacks.onAddMove(currentMove);
}

export function handleUIEvents(p5: P5, onUINavigate: UINavEventHandler, onUIInteract: () => boolean, onUICancel: () => boolean): boolean {
  const { keyCode, ENTER, ESCAPE, SHIFT, TAB, BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;
  if (keyCode === LEFT_ARROW || keyCode === KEYCODE_ALPHA_A) return onUINavigate(UINavDir.Left)
  if (keyCode === RIGHT_ARROW || keyCode === KEYCODE_ALPHA_D) return onUINavigate(UINavDir.Right)
  if (keyCode === UP_ARROW || keyCode === KEYCODE_ALPHA_W) return onUINavigate(UINavDir.Up)
  if (keyCode === DOWN_ARROW || keyCode === KEYCODE_ALPHA_S) return onUINavigate(UINavDir.Down)
  if (keyCode === TAB && p5.keyIsDown(SHIFT)) return onUINavigate(UINavDir.Prev)
  if (keyCode === TAB && !p5.keyIsDown(SHIFT)) return onUINavigate(UINavDir.Next)
  if (keyCode === ENTER) return onUIInteract();
  if (keyCode === ESCAPE || keyCode === BACKSPACE || keyCode === DELETE) return onUICancel();
  return false;
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

export function validateMove(prev: DIR, current: DIR | null, disallowEqual = true): boolean {
  if (!current) return false;
  if (disallowEqual && prev === current) return false;
  if (prev === DIR.UP && current === DIR.DOWN) return false;
  if (prev === DIR.DOWN && current === DIR.UP) return false;
  if (prev === DIR.LEFT && current === DIR.RIGHT) return false;
  if (prev === DIR.RIGHT && current === DIR.LEFT) return false;
  return true;
}
