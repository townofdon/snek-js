import type { Vector } from "p5";
import { DIR, GameMode, KeyChannel, Lock, Sound, ThreatType } from "@/types";
import { Context } from "./context";
import { byCoord, dirToUnitVector, getCoordIndex, getDifficultyFromIndex, isWithinBlockDistance, recalculateLasersMap } from "@/utils";
import { GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";
import { getIsStartLevel } from "@/levels/levelUtils";

export function anySwitchPressed(ctx: Context): boolean {
  const {
    es,
    state,
    player,
    segments,
    preyList,
  } = ctx;
  if (state.isButtonPressed && (state.isExitingLevel || state.isExited)) {
    return true;
  }
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    if (!es.switchesMap[coord]) continue;
    if (getCoordIndex(player.position) === coord) return true;
    if (segments.existsAtCoord(coord)) return true;
    if (preyList.existsAtCoord(coord)) return true;
  }
  return false;
}

export function handleSwitches(ctx: Context) {
  const {
    es,
    state,
    drawState,
    segments,
    threats,
    playSound,
  } = ctx;
  const pressed = anySwitchPressed(ctx);
  if (pressed && !state.isButtonPressed) {
    state.isButtonPressed = true;
    state.timeSinceButtonPressChanged = 0;
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (false
        || es.threatsMap[coord] === ThreatType.Barricade
        || es.threatsMap[coord] === ThreatType.Spikes
        || es.threatsMap[coord] === ThreatType.WallSpikes
        || es.threatsMap[coord] === ThreatType.Saw
        || es.threatsMap[coord] === ThreatType.Flamethrower
      ) {
        byCoord(coord)(threats.disable);
      }
    }
    playSound(Sound.switch, 0.9);
    drawState.shouldDrawActionFG = true;
  } else if (!pressed && state.isButtonPressed) {
    state.isButtonPressed = false;
    state.timeSinceButtonPressChanged = 0;
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (false
        || es.threatsMap[coord] === ThreatType.Barricade
        || es.threatsMap[coord] === ThreatType.Spikes
        || es.threatsMap[coord] === ThreatType.WallSpikes
        || es.threatsMap[coord] === ThreatType.Saw
        || es.threatsMap[coord] === ThreatType.Flamethrower
      ) {
        byCoord(coord)(threats.enable);
      }
    }
    playSound(Sound.switchOff, 0.9);
    drawState.shouldDrawActionFG = true;
  }
  // if segment is over a barricade when button is released, keep resetting that cell's elapsed time until segment leaves.
  if (!state.isButtonPressed) {
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (es.threatsMap[coord] === ThreatType.Barricade && segments.existsAtCoord(coord)) {
        byCoord(coord)(threats.restart);
      }
    }
  }
}

export function handleKeyPickup(ctx: Context) {
  const {
    es,
    state,
    drawState,
    player,
    playSound,
  } = ctx;
  // if player is on top of a key, pick it up!
  const index = getCoordIndex(player.position);
  const key = es.keysMap[index];
  if (!key) return;
  if (key.channel === KeyChannel.Yellow) {
    state.hasKeyYellow = true;
    es.keys = es.keys.filter(key => key.channel !== KeyChannel.Yellow);
  } else if (key.channel === KeyChannel.Red) {
    state.hasKeyRed = true;
    es.keys = es.keys.filter(key => key.channel !== KeyChannel.Red);
  } else if (key.channel === KeyChannel.Blue) {
    state.hasKeyBlue = true;
    es.keys = es.keys.filter(key => key.channel !== KeyChannel.Blue);
  }
  es.keysMap[index] = null;
  playSound(Sound.pickup, 0.35);
  drawState.shouldDrawKeysLocks = true;
}

export function handleUnlock(ctx: Context) {
  const { es, state, player } = ctx;
  if (!state.hasKeyYellow && !state.hasKeyRed && !state.hasKeyBlue) {
    return;
  }
  for (let i = 0; i < es.locks.length; i++) {
    if (state.hasKeyYellow && es.locks[i].channel === KeyChannel.Yellow && isWithinBlockDistance(es.locks[i].position, player.position, 1)) {
      unlockGate(ctx, es.locks[i]);
      return;
    }
    if (state.hasKeyRed && es.locks[i].channel === KeyChannel.Red && isWithinBlockDistance(es.locks[i].position, player.position, 1)) {
      unlockGate(ctx, es.locks[i]);
      return;
    }
    if (state.hasKeyBlue && es.locks[i].channel === KeyChannel.Blue && isWithinBlockDistance(es.locks[i].position, player.position, 1)) {
      unlockGate(ctx, es.locks[i]);
      return;
    }
  }
}

function unlockGate(ctx: Context, lockTriggered: Lock) {
  const {
    es,
    threats,
    drawState,
    gateUnlockParticleSystem,
    playSound,
    startScreenShake,
  } = ctx;
  playSound(Sound.doorOpenHuge);
  startScreenShake(0.7, 0.5);
  const group: Record<number, boolean> = {}
  const directionsToCheck: Vector[] = [
    dirToUnitVector(DIR.LEFT),
    dirToUnitVector(DIR.RIGHT),
    dirToUnitVector(DIR.UP),
    dirToUnitVector(DIR.DOWN),
  ]
  const addTouchingLocksToGroup = (lock: Lock) => {
    group[lock.coord] = true;
    for (let i = 0; i < directionsToCheck.length; i++) {
      const index = getCoordIndex(lock.position.copy().add(directionsToCheck[i]));
      if (!group[index] && es.locksMap[index] && es.locksMap[index].channel === lockTriggered.channel) {
        addTouchingLocksToGroup(es.locksMap[index]);
      }
    }
  }
  addTouchingLocksToGroup(lockTriggered);
  const coords = Object.keys(group).map(coordKey => parseInt(coordKey, 10));
  es.locks = es.locks.filter((lock) => {
    if (coords.includes(lock.coord)) {
      es.locksMap[lock.coord] = null;
      gateUnlockParticleSystem.emit(lock.position.x, lock.position.y, lock.channel);
      return false;
    }
    return true;
  });
  drawState.shouldDrawKeysLocks = true;
  drawState.shouldDrawActionFG = true;
  recalculateLasersMap(es, threats);
}

export function handleDifficultySelect(ctx: Context) {
  const { es, player } = ctx;
  if (!getIsStartLevel(ctx.es.level)) return;
  const index = getCoordIndex(player.position);
  const difficultyIndex = es.diffSelectMap[index];
  if (difficultyIndex === undefined) return;
  es.difficulty = getDifficultyFromIndex(difficultyIndex);
}

export function handleSetNextLevel(ctx: Context) {
  const { es, state, player } = ctx;
  if (state.gameMode === GameMode.Arcade) return;
  const nextLevel = es.level.nextLevelMap?.[getCoordIndex(player.position)];
  if (!nextLevel) return;
  state.nextLevel = nextLevel;
}
