import { Vector } from "p5";
import {
  BURN_DURATION_MS,
  ELECTROCUTION_DURATION_MS,
  HURT_GRACE_TIME,
  HURT_STUN_TIME,
  LUNGE_STEPS,
  SPEED_INCREMENT_SPEED_MS,
  SPEED_LIMIT_ULTRA,
  SPEED_LIMIT_ULTRA_SPRINT,
  SPRINT_INCREMENT_SPEED_MS,
  TIME_WAIT_BEFORE_REWIND,
} from "@/constants";
import { Easing } from "@/easing";
import {
  DIR,
  Sound,
} from "@/types";
import {
  checkHasPortalAtLocation,
  checkIsMoving,
  clamp,
  dirToUnitVector,
  getBestPortalExitDirection,
  getCoordIndex,
  getDirectionBetween,
  invertDirection,
  isBreakableBarrier,
  lerp,
} from "@/utils";
import {
  canExplodeBarrelAt,
  checkCanBreakWallsWithoutDamage,
  checkCollision,
  checkInvincible,
  checkRewindAllowed,
  wallBreakableAt,
} from "./logic";
import { Context } from "./context";
import { startAutoRewind } from "./mutations";



function _getHurtGraceTime(ctx: Context, futurePosition: Vector, canAutoRewind: boolean) {
  const {
    es,
    state,
    heldItems,
  } = ctx;
  if (state.lungeStepsRemaining > 0) return 0;
  const futureCoord = getCoordIndex(futurePosition);
  const isBreakable = !es.passablesMap[futureCoord] && isBreakableBarrier(es.barriersMap[futureCoord]);
  const extraGraceTime = (isBreakable && heldItems.armor > 0) ? 0 : es.level.extraHurtGraceTime ?? 0;
  const hurtGraceTime = Math.max(
    HURT_GRACE_TIME + extraGraceTime + (es.difficulty.index === 4 ? 12 : 0),
    // if currently invincible or in casual mode, wait a bit longer before starting rewind
    canAutoRewind ? TIME_WAIT_BEFORE_REWIND : 0,
  );
  return hurtGraceTime;
}

export function moveSegments(ctx: Context) {
  const {
    player,
    segments,
  } = ctx;
  // Move each segment towards the next segment (first segment moves towards player position)
  for (let i = segments.length - 1; i >= 0; i--) {
    if (i === 0) {
      segments.setVec(i, player.position);
    } else {
      segments.setVec(i, segments.get(i - 1));
    }
  }
}

export function checkPortalTeleportWillHit(ctx: Context, position: Vector, dir: DIR): boolean {
  const {
    es,
    state,
    player,
  } = ctx;
  if (state.isExitingLevel) return false;
  const portal = es.portalsMap[getCoordIndex(position)];
  if (!portal) return false;
  if (!portal.link) return false;
  const newDir = getBestPortalExitDirection({
    portalLink: portal.link,
    playerDirection: player.direction,
    portalExitMode: es.level.portalExitConfig?.[portal.channel] || portal.exitMode,
    checkCollision: (location) => checkCollision(ctx, location),
    hasPortalAtLocation: (location) => checkHasPortalAtLocation(location, es.portalsMap),
  });
  return !!checkCollision(ctx, portal.link.copy().add(dirToUnitVector(newDir)));
}

export function _updateCurrentMoveSpeed(ctx: Context) {
  const {
    es,
    state,
    loopState,
  } = ctx;
  if (state.isSprinting) {
    const deltaSpeed = es.difficulty.speedSteps * (loopState.deltaTime / SPRINT_INCREMENT_SPEED_MS);
    state.currentSpeed += deltaSpeed;
    if (state.currentSpeed > es.difficulty.speedSteps) {
      state.currentSpeed = es.difficulty.speedSteps;
    }
    return;
  }
  if (state.currentSpeed === state.targetSpeed) {
    return;
  }
  if (state.currentSpeed < state.targetSpeed) {
    const time = Math.min(
      state.timeSinceArmorProtection - HURT_STUN_TIME,
      state.timeSinceHurt - HURT_STUN_TIME,
    );
    const t = Easing.inOutCubic(clamp(time * 0.5, 0, 1));
    const diff = Math.abs(state.targetSpeed - state.currentSpeed);
    const deltaSpeed = clamp(diff, 1, es.difficulty.speedSteps) * (loopState.deltaTime / SPEED_INCREMENT_SPEED_MS) * lerp(0, 1, t);
    state.currentSpeed += deltaSpeed;
    if (state.currentSpeed > state.targetSpeed) state.currentSpeed = state.targetSpeed;
  } else if (state.currentSpeed > state.targetSpeed) {
    const deltaSpeed = es.difficulty.speedSteps * (loopState.deltaTime / SPRINT_INCREMENT_SPEED_MS);
    state.currentSpeed -= deltaSpeed;
    if (state.currentSpeed < state.targetSpeed) state.currentSpeed = state.targetSpeed;
  }
}


/**
 * Move snake back after it hits something
 */
export function reboundSnake(ctx: Context, numTimes = 2) {
  const {
    player,
    segments,
  } = ctx;
  if (segments.length - 2 < numTimes) {
    // snek size <= 4 (head + 3 segments)
    for (let times = 0; times < numTimes; times++) {
      player.position.set(segments.get(0));
      const dir = getDirectionBetween(segments.get(segments.length - 1), segments.get(segments.length - 2));
      for (let i = 0; i < segments.length - 1; i++) {
        segments.setVec(i, segments.get(i + 1));
      }
      segments.get(segments.length - 1).add(dirToUnitVector(dir));
    }
  } else {
    for (let times = 0; times < numTimes; times++) {
      if (segments.length > 1) {
        player.position.set(segments.get(0));
      }
      for (let i = 0; i < segments.length - 1; i++) {
        segments.setVec(i, segments.get(i + 1));
      }
    }
  }
}


export function _getTimeNeededUntilNextMove(ctx: Context): number {
  const {
    es,
    state,
    loopState,
  } = ctx;
  if (state.isExitingLevel) {
    return 0;
  }
  if (state.isGameWon) {
    return SPEED_LIMIT_ULTRA_SPRINT;
  }
  if (state.timeSinceElectrocutionStart < ELECTROCUTION_DURATION_MS * 2) {
    return Infinity;
  }
  if (state.timeSinceBurnStart < BURN_DURATION_MS * 2) {
    return Infinity;
  }
  if (!checkIsMoving(state, loopState)) {
    return Infinity;
  }
  if (state.isSprinting && state.lungeStepsRemaining > 2) {
    return 0;
  }
  if (state.isSprinting && state.lungeStepsRemaining > 0) {
    return Math.min(es.difficulty.sprintLimit, 10);
  }
  if (state.lungeStepsRemaining > 2) {
    return SPEED_LIMIT_ULTRA_SPRINT;
  }
  if (state.lungeStepsRemaining > 0) {
    return Math.min(es.difficulty.sprintLimit, SPEED_LIMIT_ULTRA);
  }
  if (es.difficulty.index === 4 && state.isSprinting) {
    return es.difficulty.sprintLimit;
  }
  const time = lerp(es.difficulty.speedStart,
    state.isSprinting ? es.difficulty.sprintLimit : es.difficulty.speedLimit,
    state.currentSpeed / es.difficulty.speedSteps);
  return Math.max(time, es.level.speedLimit || 0);
}

export function _movePlayer(ctx: Context, normalizedSpeed = 0): boolean {
  const {
    es,
    state,
    player,
    segments,
    loopState,
    playSound,
  } = ctx;
  if (!state.isMoving) return false;
  if (state.isExited) return false;
  if (state.isRewinding) return false;
  if (state.timeSinceHurt < HURT_STUN_TIME) return false;
  if (state.timeSinceArmorProtection < HURT_STUN_TIME) return false;
  state.timeSinceLastMove = 0;
  const prevDirection = player.direction;
  // check lunge cancel
  if (es.moves.length > 0
    && !state.isExitingLevel
    && state.lungeStepsRemaining < LUNGE_STEPS - 1
    && es.moves[0] !== player.direction
  ) {
    state.lungeStepsRemaining = 0;
  }
  const isFirstLungeFrame = state.lungeStepsRemaining === LUNGE_STEPS;
  // check for queued-up moves
  if (es.moves.length > 0 && !state.isExitingLevel && state.lungeStepsRemaining <= 0) {
    const move = es.moves.shift();
    if (move && move !== player.directionToFirstSegment) player.direction = move;
  }
  const currentMove = dirToUnitVector(player.direction);
  const futurePosition = player.position.copy().add(currentMove);

  // disallow snake moving backwards into itself
  if (segments.length > 0 && futurePosition.equals(segments.get(0).x, segments.get(0).y)) {
    player.direction = player.direction === prevDirection ? getDirectionSnakeForward(ctx) : prevDirection;
    return false;
  }

  // calc grace period
  const willHitSomething = checkCollision(ctx, futurePosition) || checkPortalTeleportWillHit(ctx, futurePosition, player.direction);
  const invincible = checkInvincible(ctx);
  const canAutoRewind = checkRewindAllowed(ctx, invincible);
  const canBreakWallsWithoutDamage = checkCanBreakWallsWithoutDamage(ctx);
  const breakable = (wallBreakableAt(ctx, getCoordIndex(futurePosition)) && canBreakWallsWithoutDamage)
    || (canExplodeBarrelAt(ctx, getCoordIndex(futurePosition)));
  const hurtGraceTime = _getHurtGraceTime(ctx, futurePosition, canAutoRewind);
  if (!breakable && willHitSomething && state.timeSinceGraceStarted <= hurtGraceTime) {
    state.timeSinceGraceStarted += loopState.deltaTime;
    return false;
  }
  if (!breakable && willHitSomething && canAutoRewind) {
    state.timeSinceGraceStarted = 0;
    startAutoRewind(ctx);
    return false;
  }

  // apply movement
  moveSegments(ctx);
  player.position.add(currentMove);
  // extra move on first lunge frame
  if (isFirstLungeFrame
    && !willHitSomething
    && !checkCollision(ctx, player.position.copy().add(currentMove))
    && !segments.existsAt(player.position.x, player.position.y)
  ) {
    moveSegments(ctx);
    player.position.add(currentMove);
  }
  state.timeSinceGraceStarted = 0;

  // play step sfx
  const volume = lerp(1, 0.5, normalizedSpeed);
  if (state.steps % 2 === 0) {
    playSound(Sound.step1, volume);
  } else {
    playSound(Sound.step2, volume);
  }
  state.steps += 1;
  state.lungeStepsRemaining = Math.max(0, state.lungeStepsRemaining - 1);
  return true;
}

export function getDirectionSnakeForward(ctx: Context) {
  return getDirectionBetween(ctx.player.position, ctx.segments.get(0));
}

export function getDirectionSnakeBackward(ctx: Context) {
  return invertDirection(getDirectionSnakeForward(ctx))
}
