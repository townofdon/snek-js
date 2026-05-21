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
  LUNGE_INPUT_WINDOW,
  LUNGE_COOLDOWN,
} from '../constants';
import { AppMode, ClickState, DIR, GameMode, GameState, InputAction, RecentMoveTimings as RecentMoveTimes, RecentMoves, UINavDir, UINavEventHandler } from "../types";
import { invertDirection, isOppositeDirection, isOrthogonalDirection, isSameDirection, rotateDirection } from "../utils";

export interface InputCallbacks {
  onWarpToLevel: (level: number) => void,
  onAddMove: (move: DIR) => void,
  onLunge: (dir: DIR) => void,
  onResetMoves: () => void,
  onUINavigate: UINavEventHandler,
}

export function handleKeyPressed(
  p5: P5,
  state: GameState,
  clickState: ClickState,
  playerDirection: DIR,
  playerDirectionToFirstSegment: DIR,
  moves: DIR[],
  recentMoves: RecentMoves,
  recentMoveInputs: RecentMoves,
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

  if (state.isLost && state.timeSinceHurt > 200) {
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
    : invertDirection(playerDirectionToFirstSegment);

  // disallow same moves unless snake is currently stunned after hitting something
  const disallowEqual = state.isMoving
    && (moves.length >= 2 || state.timeSinceHurt >= HURT_STUN_TIME)
    && (moves.length === 0 ? playerDirection === prevMove : true);

  if (currentMove) {
    callAction(InputAction.StartMoving);
  }

  // validate current move
  if (moves.length >= MAX_MOVES) {
    return;
  }

  // handle special moves
  if (state.isMoving && state.timeSinceHurt >= HURT_STUN_TIME) {
    updateRecentInputs(recentMoveInputs, recentInputs, recentInputTimes, currentMove);
    if (isLunge(state, playerDirection, recentInputs, recentInputTimes)) {
      callbacks.onLunge(recentInputs[0]);
      return;
    }
    const specialMoves = getSpecialMove(playerDirection, recentMoves, recentMoveInputs, recentInputTimes, checkWillHit);
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
  const { keyCode, keyIsPressed, ENTER, ESCAPE, SHIFT, TAB, BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW } = p5;
  if (keyCode === LEFT_ARROW || keyCode === KEYCODE_ALPHA_A) return onUINavigate(UINavDir.Left)
  if (keyCode === RIGHT_ARROW || keyCode === KEYCODE_ALPHA_D) return onUINavigate(UINavDir.Right)
  if (keyCode === UP_ARROW || keyCode === KEYCODE_ALPHA_W) return onUINavigate(UINavDir.Up)
  if (keyCode === DOWN_ARROW || keyCode === KEYCODE_ALPHA_S) return onUINavigate(UINavDir.Down)
  if (keyCode === TAB && p5.keyIsDown(SHIFT)) return onUINavigate(UINavDir.Prev)
  if (keyCode === TAB && !p5.keyIsDown(SHIFT)) return onUINavigate(UINavDir.Next)
  if (keyCode === ENTER && keyIsPressed) return onUIInteract();
  if (keyCode === ESCAPE || keyCode === BACKSPACE || keyCode === DELETE) return onUICancel();
  return false;
}

function updateRecentInputs(recentMoveInputs: RecentMoves, recentInputs: RecentMoves, recentInputTimes: RecentMoveTimes, currentMove: DIR) {
  if (!currentMove) {
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

  // prevent duplicate inputs - this is needed for special move logic below
  if (currentMove === recentMoveInputs[0]) {
    return;
  }
  for (let i = recentMoveInputs.length - 1; i >= 0; i--) {
    if (i > 0) {
      recentMoveInputs[i] = recentMoveInputs[i - 1];
    } else {
      recentMoveInputs[i] = currentMove;
    }
  }
}

/**
 * Determine whether the player is trying to lunge.
 */
function isLunge(state: GameState, playerDirection: DIR, recentInputs: RecentMoves, recentInputTimes: RecentMoveTimes) {
  if (state.timeSinceLungeStart < LUNGE_COOLDOWN) return false;
  if (!recentInputs[0] || !recentInputs[1]) return false;
  // disallow lunge backwards
  if (recentInputs[0] === invertDirection(playerDirection)) return false;
  // check for double tap
  if (recentInputs[0] === recentInputs[1]
    && recentInputTimes[0] === 0
    && recentInputTimes[1] < LUNGE_INPUT_WINDOW
  ) {
    return true;
  }
  return false;
}

const SPECIAL_MOVE_REPEAT_TIME = 120;

/**
 * Determine whether the player is trying to perform a special move (u-turn, etc.)
 */
function getSpecialMove(playerDirection: DIR, recentMoves: RecentMoves, recentMoveInputs: RecentMoves, recentInputTimes: RecentMoveTimes, checkWillHit: (dir: DIR, numMoves?: number) => boolean): (DIR[] | null) {
  if (!playerDirection) {
    return null;
  }
  const isTryingToReverseDirection = recentMoveInputs[0]
    && recentMoveInputs[0] === invertDirection(playerDirection)
    && recentInputTimes[0] === 0
    && recentInputTimes[1] > SPECIAL_MOVE_REPEAT_TIME;
  if (isTryingToReverseDirection) {
    const specialMoves = [rotateDirection(playerDirection), invertDirection(playerDirection)];
    // did turn one corner, e.g. was going RIGHT, now going DOWN
    const didTurnOneCorner = isSameDirection(recentMoves[0], playerDirection) && isOrthogonalDirection(recentMoves[1], playerDirection);
    // is the current configuration a result of a previous special move?
    const didPrevSpecialMove = didTurnOneCorner
      && isSameDirection(recentMoves[0], playerDirection)
      && isOrthogonalDirection(recentMoves[1], playerDirection)
      && isOppositeDirection(recentMoves[2], playerDirection)
      && isOrthogonalDirection(recentMoves[3], playerDirection)
      && isSameDirection(recentMoveInputs[1], playerDirection)
      && isOppositeDirection(recentMoveInputs[2], playerDirection);
    // did the player intentionally zig-zag? e.g. was going RIGHT then turned UP and LEFT
    const didZigZagIntentionally = didTurnOneCorner
      && isSameDirection(recentMoves[0], playerDirection)
      && isOrthogonalDirection(recentMoves[1], playerDirection)
      && isOppositeDirection(recentMoves[2], playerDirection)
      && isSameDirection(recentMoveInputs[1], playerDirection)
      && isOrthogonalDirection(recentMoveInputs[2], playerDirection)
      && isOppositeDirection(recentMoveInputs[3], playerDirection)
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

export function validateMove(prev: DIR, incoming: DIR | null, disallowEqual = true): boolean {
  if (!incoming) return false;
  if (disallowEqual && prev === incoming) return false;
  if (prev === DIR.UP && incoming === DIR.DOWN) return false;
  if (prev === DIR.DOWN && incoming === DIR.UP) return false;
  if (prev === DIR.LEFT && incoming === DIR.RIGHT) return false;
  if (prev === DIR.RIGHT && incoming === DIR.LEFT) return false;
  return true;
}
