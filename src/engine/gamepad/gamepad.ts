import { HURT_STUN_TIME, MAX_MOVES_GAMEPAD } from "../../constants";
import { AppMode, DIR, GameMode, GameState, InputAction, MOVE, UINavDir } from "../../types";
import { invertDirection, rotateDirection } from "../../utils";
import { InputCallbacks, validateMove } from "../controls";
import {
  Axis,
  Button,
} from "./StandardGamepadMapping";

const TRIGGER_THRESHOLD = 0.05;
const AXIS_DEADZONE = 0.05;

const current: Record<Button, boolean> = {
  [Button.South]: false,
  [Button.East]: false,
  [Button.West]: false,
  [Button.North]: false,
  [Button.BumperLeft]: false,
  [Button.BumperRight]: false,
  [Button.TriggerLeft]: false,
  [Button.TriggerRight]: false,
  [Button.Select]: false,
  [Button.Start]: false,
  [Button.StickLeft]: false,
  [Button.StickRight]: false,
  [Button.DpadUp]: false,
  [Button.DpadDown]: false,
  [Button.DpadLeft]: false,
  [Button.DpadRight]: false,
  [Button.XboxButton]: false
}
const prev: Record<Button, boolean> = {
  [Button.South]: false,
  [Button.East]: false,
  [Button.West]: false,
  [Button.North]: false,
  [Button.BumperLeft]: false,
  [Button.BumperRight]: false,
  [Button.TriggerLeft]: false,
  [Button.TriggerRight]: false,
  [Button.Select]: false,
  [Button.Start]: false,
  [Button.StickLeft]: false,
  [Button.StickRight]: false,
  [Button.DpadUp]: false,
  [Button.DpadDown]: false,
  [Button.DpadLeft]: false,
  [Button.DpadRight]: false,
  [Button.XboxButton]: false
}

/**
 * apply gamepad movement
 */
export function applyGamepadMove(
  state: GameState,
  playerDirection: DIR,
  moves: DIR[],
  callbacks: InputCallbacks,
  callAction: (action: InputAction) => void,
): boolean {
  if (state.appMode !== AppMode.Game) {
    return;
  }

  if (!state.isGameStarted) {
    return;
  }

  if (state.isExitingLevel || state.isExited) {
    return;
  }
  if (state.isPaused) {
    return;
  }
  if (state.isLost) {
    return;
  }

  const desiredMove = getCurrentGamepadMove()
  if (!desiredMove) {
    return;
  }

  const prevMove = moves.length > 0
    ? moves[moves.length - 1]
    : playerDirection;

  const desiredMoves: DIR[] = (() => {
    switch (desiredMove) {
      case MOVE.UP:
        return [DIR.UP];
      case MOVE.DOWN:
        return [DIR.DOWN];
      case MOVE.LEFT:
        return [DIR.LEFT];
      case MOVE.RIGHT:
        return [DIR.RIGHT];
      case MOVE.TURN_L:
        return [rotateDirection(prevMove)];
      case MOVE.TURN_R:
        return [invertDirection(rotateDirection(prevMove))];
      case MOVE.UTURN_L:
        {
          const move0 = rotateDirection(prevMove);
          return [move0, rotateDirection(move0)];
        }
      case MOVE.UTURN_R:
        {
          const move0 = invertDirection(rotateDirection(prevMove));
          return [move0, invertDirection(rotateDirection(move0))];
        }
      default:
        return [];
    }
  })();

  if (desiredMoves.length) {
    callAction(InputAction.StartMoving);
  } else {
    return;
  }

  // validate current move
  if (moves.length > MAX_MOVES_GAMEPAD) {
    return;
  }

  const disallowEqual = state.isMoving && (!!moves.length || state.timeSinceHurt >= HURT_STUN_TIME);

  let cancel = false
  desiredMoves.forEach((desiredMove, i) => {
    const valid = validateMove(i === 0 ? prevMove : desiredMoves[i - 1], desiredMove, disallowEqual || i > 0)
    if (!cancel && valid) {
      callbacks.onAddMove(desiredMove)
    } else {
      cancel = true
    }
  })
}

export function applyGamepadUIActions(
  state: GameState,
  callAction: (action: InputAction) => void,
  onUINavigate: (navDir: UINavDir) => boolean,
  onUIInteract: () => boolean,
  onUICancel: () => boolean,
): boolean {
  const gamepad = navigator.getGamepads()?.[0];
  if (!gamepad) return false;
  if (!gamepad.connected) return false;

  if (state.appMode === AppMode.StartScreen) {
    if (wasPressedThisFrame(gamepad, Button.Start)) callAction(InputAction.HideStartScreen);
    return true;
  }

  if (state.appMode === AppMode.Quote) {
    if (wasPressedThisFrame(gamepad, Button.East)) callAction(InputAction.ShowMainMenu);
    return true;
  }

  const isGame = state.appMode === AppMode.Game && state.isGameStarted

  if (isGame && !state.isLost && !state.isGameWon && wasPressedThisFrame(gamepad, Button.Start)) {
    if (state.isPaused) {
      callAction(InputAction.UnPause);
      return true;
    } else {
      callAction(InputAction.Pause);
      return true;
    }
  }

  if (state.isGameStarting) {
    return false;
  }
  if (state.appMode !== AppMode.Game) {
    return false;
  }

  const isGameOverNormal = state.isLost && state.gameMode !== GameMode.Cobra && state.timeSinceHurt > 20;
  const proceed = !state.isGameStarted || state.isPaused || isGameOverNormal || state.isGameWon
  if (!proceed) {
    return;
  }

  if (wasPressedThisFrame(gamepad, Button.DpadUp)) {
    return onUINavigate(UINavDir.Up);
  }
  if (wasPressedThisFrame(gamepad, Button.DpadDown)) {
    return onUINavigate(UINavDir.Down);
  }
  if (wasPressedThisFrame(gamepad, Button.DpadLeft)) {
    return onUINavigate(UINavDir.Left);
  }
  if (wasPressedThisFrame(gamepad, Button.DpadRight)) {
    return onUINavigate(UINavDir.Right);
  }
  if (wasPressedThisFrame(gamepad, Button.BumperLeft)) {
    return onUINavigate(UINavDir.Prev);
  }
  if (wasPressedThisFrame(gamepad, Button.BumperRight)) {
    return onUINavigate(UINavDir.Next);
  }
  if (wasPressedThisFrame(gamepad, Button.Start)) {
    return onUIInteract();
  }
  if (wasPressedThisFrame(gamepad, Button.South)) {
    return onUIInteract();
  }
  if (wasPressedThisFrame(gamepad, Button.East)) {
    return onUICancel();
  }
}

export function updateGamepadState(): boolean {
  const gamepad = navigator.getGamepads()?.[0];
  if (!gamepad) return false;
  if (!gamepad.connected) return false;
  let anyButtonPressed = false
  gamepad.buttons.forEach((button, idx) => {
    prev[idx as Button] = current[idx as Button];
    current[idx as Button] = button.pressed;
    if (button.pressed) {
      anyButtonPressed = true
    }
  });
  return anyButtonPressed;
}

export function getGamepad(): Gamepad | null {
  return navigator.getGamepads()?.[0];
}

export function gamepadPressed(gamepad: Gamepad, id: Button) {
  if (!gamepad) return false;
  if (!gamepad.connected) return false;
  return !!gamepad.buttons[id]?.pressed;
}

export function wasPressedThisFrame(gamepad: Gamepad, id: Button) {
  if (!gamepad) return false;
  if (!gamepad.connected) return false;
  return !!current[id] && !prev[id];
}

export function anyButtonPressedThisFrame(gamepad: Gamepad) {
  if (!gamepad) return false;
  if (!gamepad.connected) return false;
  return gamepad.buttons.some((_, id) => wasPressedThisFrame(gamepad, id))
}

/**
 * Process gamepad buttons and axes and return the desired direction
 */
function getCurrentGamepadMove(): MOVE {
  const gamepad = navigator.getGamepads()?.[0];
  if (!gamepad) return MOVE.Nil;
  if (!gamepad.connected) return MOVE.Nil;

  if (wasPressedThisFrame(gamepad, Button.BumperLeft)) {
    return MOVE.UTURN_L;
  }
  if (wasPressedThisFrame(gamepad, Button.BumperRight)) {
    return MOVE.UTURN_R;
  }

  if (gamepad.buttons[Button.DpadUp]?.pressed) return MOVE.UP;
  if (gamepad.buttons[Button.DpadDown]?.pressed) return MOVE.DOWN;
  if (gamepad.buttons[Button.DpadLeft]?.pressed) return MOVE.LEFT;
  if (gamepad.buttons[Button.DpadRight]?.pressed) return MOVE.RIGHT;

  const x0 = gamepad.axes[Axis.LeftX]?.valueOf() || 0;
  const y0 = gamepad.axes[Axis.LeftY]?.valueOf() || 0;

  if (Math.abs(x0) > AXIS_DEADZONE || Math.abs(y0) > AXIS_DEADZONE) {
    if (Math.abs(x0) > Math.abs(y0)) {
      return x0 > 0 ? MOVE.RIGHT : MOVE.LEFT;
    } else {
      return y0 < 0 ? MOVE.UP : MOVE.DOWN;
    }
  }

  const x1 = gamepad.axes[Axis.RightX]?.valueOf() || 0;
  const y1 = gamepad.axes[Axis.RightY]?.valueOf() || 0;

  if (Math.abs(x1) > AXIS_DEADZONE || Math.abs(y1) > AXIS_DEADZONE) {
    if (Math.abs(x1) > Math.abs(y1)) {
      return x1 > 0 ? MOVE.RIGHT : MOVE.LEFT;
    } else {
      return y1 < 0 ? MOVE.UP : MOVE.DOWN;
    }
  }

  return MOVE.Nil;
}

export function getCurrentGamepadSprint() {
  const gamepad = navigator.getGamepads()?.[0];
  if (!gamepad) return false;
  if (!gamepad.connected) return false;
  return gamepad.buttons[Button.TriggerLeft]?.value > TRIGGER_THRESHOLD;
}

function handleGamepadConnected(event: GamepadEvent) {
  console.log("Gamepad connected:", event.gamepad.id);
}
function handleGamepadDisconnected(event: GamepadEvent) {
  console.log("Gamepad disconnected:", event.gamepad.id);
}
window.addEventListener("gamepadconnected", handleGamepadConnected, false);
window.addEventListener("gamepaddisconnected", handleGamepadDisconnected, false);
