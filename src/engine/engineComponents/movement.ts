import P5, { Vector } from "p5";
import { VectorList } from "@/collections/vectorList";
import {
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_GRACE_TIME,
  HURT_STUN_TIME,
  SPEED_INCREMENT_SPEED_MS,
  SPEED_LIMIT_ULTRA_SPRINT,
  SPRINT_INCREMENT_SPEED_MS,
  START_SNAKE_SIZE,
  TIME_WAIT_BEFORE_REWIND,
} from "@/constants";
import { Easing } from "@/easing";
import { START_LEVEL, START_LEVEL_COBRA } from "@/levels/levelConstants";
import {
  DIR,
  EngineState,
  GameMode,
  GameState,
  HeldItems,
  HitType,
  KeyChannel,
  LoopState,
  PlayerState,
  Replay,
  ReplayMode,
  Sound,
  Stats,
} from "@/types";
import {
  checkHasPortalAtLocation,
  clamp,
  dirToUnitVector,
  getBestPortalExitDirection,
  getCoordIndex,
  getDirectionBetween,
  invertDirection,
  isBreakableBarrier,
  lerp,
  rotateSystemAfterPortalTraverse,
} from "@/utils";

interface EngineMovementArgs {
  state: GameState,
  es: EngineState,
  player: PlayerState,
  loopState: LoopState,
  segments: VectorList,
  replay: Replay,
  heldItems: HeldItems,
  stats: Stats,
  startAutoRewind: () => void,
  checkArmorProtection: (vec: Vector) => boolean,
  playSound: (sound: Sound, volume?: number, force?: boolean) => void,
  stopRewinding: () => void,
  proceedToNextReplayClip: () => void,
}

export function engineMovement({
  state,
  es,
  player,
  loopState,
  segments,
  replay,
  heldItems,
  stats,
  startAutoRewind,
  checkArmorProtection,
  playSound,
  stopRewinding,
  proceedToNextReplayClip,
}: EngineMovementArgs) {

  function handleSnakeMovement(): boolean {
    if (!state.isMoving) return false;
    if (state.isRewinding) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    let didMove = false;
    const timeNeededUntilNextMove = _getTimeNeededUntilNextMove();
    if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      const normalizedSpeed = clamp(es.difficulty.speedLimit / (timeNeededUntilNextMove || 0.001), 0, 1);
      didMove = _movePlayer(normalizedSpeed);
      if (didMove) player.directionToFirstSegment = invertDirection(player.direction);
    } else {
      state.timeSinceLastMove += loopState.deltaTime;
    }
    _updateCurrentMoveSpeed();
    if (!state.isExitingLevel && !state.isExited && !state.isGameWon) {
      stats.totalGameTimeElapsed += loopState.deltaTime;
      stats.totalLevelTimeElapsed += loopState.deltaTime;
    }
    return didMove;
  }

  function handleSnakeRewind() {
    if (!state.isRewinding) return;
    if (state.isExited) return;
    if (replay.mode !== ReplayMode.Disabled) return;
    // back that thing up
    const timeNeededUntilNextMove = _getTimeNeededUntilNextMove();
    const canRewind = rewindAllowed(
      state.timeSinceReverseStart < es.difficulty.invincibilityTime ||
      state.timeSinceInvincibleStart < es.difficulty.invincibilityTime
    );
    if (!canRewind) {
      stopRewinding();
    } else if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      state.timeSinceGraceStarted = 0;
      state.timeSinceLastMove = 0;
      reboundSnake(1);
      player.direction = getDirectionSnakeForward();
      player.directionToFirstSegment = invertDirection(player.direction);
    } else {
      state.timeSinceLastMove += loopState.deltaTime;
    }
    _updateCurrentMoveSpeed();
  }

  function handleSnakeMovementDuringReplay(didHit: boolean) {
    if (didHit) return;
    if (replay.mode !== ReplayMode.Playback) return;
    const position: [number, number] | undefined = replay.positions[state.frameCount];
    if (position != undefined) {
      moveSegments();
      player.position.set(position[0], position[1])
      player.direction = getDirectionSnakeForward();
      player.directionToFirstSegment = invertDirection(player.direction);
    }
    if (state.frameCount > replay.lastFrame) {
      proceedToNextReplayClip();
    }
  }

  function handleTeleportOnGameWin() {
    if (!state.isGameWon) return;
    const WIN_SCREEN_TELEPORT_PADDING = 2;
    const WIN_SCREEN_TELEPORT_BOUNDS = {
      min: {
        x: 0 - WIN_SCREEN_TELEPORT_PADDING,
        y: 0 - WIN_SCREEN_TELEPORT_PADDING,
      },
      max: {
        x: GRIDCOUNT_X + WIN_SCREEN_TELEPORT_PADDING,
        y: GRIDCOUNT_Y + WIN_SCREEN_TELEPORT_PADDING,
      },
    }
    const bounds = WIN_SCREEN_TELEPORT_BOUNDS;
    if (player.position.x < bounds.min.x) {
      player.position.x = bounds.max.x;
    } else if (player.position.x > bounds.max.x) {
      player.position.x = bounds.min.x;
    } else if (player.position.y < bounds.min.y) {
      player.position.y = bounds.max.y;
    } else if (player.position.y > bounds.max.y) {
      player.position.y = bounds.min.y;
    }
  }

  function handlePortalTravel() {
    if (state.isExitingLevel) return;
    const portal = es.portalsMap[getCoordIndex(player.position)];
    if (!portal) return;
    if (!portal.link) {
      console.warn(`portal has no link: channel=${portal.channel},(${portal.position.x},${portal.position.y})`);
      return;
    }
    playSound(Sound.warp);
    const newDir = getBestPortalExitDirection({
      portalLink: portal.link,
      playerDirection: player.direction,
      portalExitMode: es.level.portalExitConfig?.[portal.channel] || portal.exitMode,
      checkHasHit,
      hasPortalAtLocation: (location) => checkHasPortalAtLocation(location, es.portalsMap),
    });
    const prevDir = player.direction;
    player.direction = newDir;
    player.directionToFirstSegment = invertDirection(player.direction);
    state.timeSinceLastMove = 0;
    state.timeSinceLastTeleport = 0;
    player.position.set(portal.link);
    player.position.add(dirToUnitVector(player.direction));
    state.numTeleports++;
    if (state.numTeleports > 80) {
      // kill the snake to prevent a soft lock due to infinite loop
      state.lives = 0;
      state.isLost = true;
      state.lastHurtBy = HitType.QuantumEntanglement;
    }
    // apply system rotation to es.recentInputs and es.recentMoves so that special es.moves (u-turn, etc) still work
    if (prevDir !== newDir) {
      for (let i = 0; i < es.recentMoves.length; i++) {
        es.recentMoves[i] = rotateSystemAfterPortalTraverse(prevDir, newDir, es.recentMoves[i]);
      }
      for (let i = 0; i < es.recentInputs.length; i++) {
        es.recentInputs[i] = rotateSystemAfterPortalTraverse(prevDir, newDir, es.recentInputs[i]);
      }
    }
  }

  function _movePlayer(normalizedSpeed = 0): boolean {
    if (!state.isMoving) return false;
    if (state.isExited) return false;
    if (state.isRewinding) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    if (state.timeSinceArmorProtection < HURT_STUN_TIME) return false;
    state.timeSinceLastMove = 0;
    const prevDirection = player.direction;
    if (es.moves.length > 0 && !state.isExitingLevel) {
      const move = es.moves.shift();
      if (move && move !== player.directionToFirstSegment) player.direction = move;
    }
    const currentMove = dirToUnitVector(player.direction);
    const futurePosition = player.position.copy().add(currentMove);

    // disallow snake moving backwards into itself
    if (segments.length > 0 && futurePosition.equals(segments.get(0).x, segments.get(0).y)) {
      player.direction = player.direction === prevDirection ? getDirectionSnakeForward() : prevDirection;
      return false;
    }

    // determine if next move will be into something, allow for grace period before injuring snakey
    const willHitSomething = checkHasHit(futurePosition) || checkPortalTeleportWillHit(futurePosition, player.direction);
    const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const canAutoRewind = rewindAllowed(invincible);
    const futureCoord = getCoordIndex(futurePosition);
    const isBreakable = !es.passablesMap[futureCoord] && isBreakableBarrier(es.barriersMap[futureCoord]);
    const extraGraceTime = (isBreakable && heldItems.armor > 0) ? 0 : es.level.extraHurtGraceTime ?? 0;
    const hurtGraceTime = Math.max(
      HURT_GRACE_TIME + extraGraceTime + (es.difficulty.index === 4 ? 12 : 0),
      // if currently invincible or in casual mode, wait a bit longer before starting rewind
      canAutoRewind ? TIME_WAIT_BEFORE_REWIND : 0,
    );
    if (willHitSomething && state.timeSinceGraceStarted <= hurtGraceTime) {
      state.timeSinceGraceStarted += loopState.deltaTime;
      return false;
    }
    if (willHitSomething && checkArmorProtection(futurePosition)) {
      state.timeSinceGraceStarted = 0;
      return false;
    }
    if (willHitSomething && canAutoRewind) {
      state.timeSinceGraceStarted = 0;
      startAutoRewind();
      return false;
    }

    // apply movement
    moveSegments();
    player.position.add(currentMove);
    state.timeSinceGraceStarted = 0;

    // play step sfx
    const volume = lerp(1, 0.5, normalizedSpeed);
    if (state.steps % 2 === 0) {
      playSound(Sound.step1, volume);
    } else {
      playSound(Sound.step2, volume);
    }
    state.steps += 1;
    return true;
  }

  /**
   * Move each segment towards the next segment (first segment moves towards player position)
   */
  function moveSegments() {
    for (let i = segments.length - 1; i >= 0; i--) {
      if (i === 0) {
        segments.setVec(i, player.position);
      } else {
        segments.setVec(i, segments.get(i - 1));
      }
    }
  }

  /**
   * Move snake back after it hits something
   */
  function reboundSnake(numTimes = 2) {
    for (let times = 0; times < numTimes; times++) {
      if (segments.length > 1) {
        player.position.set(segments.get(0));
      }
      for (let i = 0; i < segments.length - 1; i++) {
        segments.setVec(i, segments.get(i + 1));
      }
    }
  }

  function checkHasHit(vec: Vector, updateLastHurtBy = true): boolean {
    if (state.isExitingLevel) return false;
    if (state.isExited) return false;
    if (state.isGameWon) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    const coord = getCoordIndex(vec);
    // self
    const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const rewindingFromArmor = state.isRewinding && state.timeSinceArmorProtection < es.difficulty.invincibilityTime;
    if (segments.containsCoord(coord) && !invincible && !rewindingFromArmor) {
      if (updateLastHurtBy) state.lastHurtBy = HitType.HitSelf;
      return true;
    }
    // clip reality
    if (es.level.disableWallCollision) return false;
    // door
    if (es.doorsMap[coord]) {
      if (updateLastHurtBy) state.lastHurtBy = HitType.HitDoor;
      return true;
    }
    // barrier
    const isPassableBarrier = state.isDoorsOpen && es.passablesMap[coord];
    if (!isPassableBarrier && es.barriersMap[coord]) {
      if (updateLastHurtBy) state.lastHurtBy = HitType.HitBarrier;
      return true;
    }
    // lock
    if (es.locksMap[coord]) {
      if (es.locksMap[coord].channel === KeyChannel.Yellow && state.hasKeyYellow) return false;
      if (es.locksMap[coord].channel === KeyChannel.Red && state.hasKeyRed) return false;
      if (es.locksMap[coord].channel === KeyChannel.Blue && state.hasKeyBlue) return false;
      if (updateLastHurtBy) state.lastHurtBy = HitType.HitLock;
      return true;
    }
    return false;
  }

  function checkPortalTeleportWillHit(position: Vector, dir: DIR): boolean {
    if (state.isExitingLevel) return false;
    const portal = es.portalsMap[getCoordIndex(position)];
    if (!portal) return false;
    if (!portal.link) return false;
    const newDir = getBestPortalExitDirection({
      portalLink: portal.link,
      playerDirection: player.direction,
      portalExitMode: es.level.portalExitConfig?.[portal.channel] || portal.exitMode,
      checkHasHit,
      hasPortalAtLocation: (location) => checkHasPortalAtLocation(location, es.portalsMap),
    });
    return checkHasHit(portal.link.copy().add(dirToUnitVector(newDir)), false);
  }

  function _getTimeNeededUntilNextMove() {
    if (state.isExitingLevel) {
      return 0;
    }
    if (state.isGameWon) {
      return SPEED_LIMIT_ULTRA_SPRINT;
    }
    if (state.timeSinceHurt < HURT_STUN_TIME) {
      return Infinity;
    }
    if (state.timeSinceArmorProtection < HURT_STUN_TIME && !state.isRewinding) {
      return Infinity;
    }
    if (es.difficulty.index === 4 && state.isSprinting) {
      return es.difficulty.sprintLimit;
    }
    return lerp(es.difficulty.speedStart,
      state.isSprinting ? es.difficulty.sprintLimit : es.difficulty.speedLimit,
      state.currentSpeed / es.difficulty.speedSteps);
  }

  function _updateCurrentMoveSpeed() {
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

  function getDirectionSnakeForward() {
    return getDirectionBetween(player.position, segments.get(0));
  }

  function getDirectionSnakeBackward() {
    return invertDirection(getDirectionSnakeForward())
  }

  function _calculateSnakeSize(): number {
    let size = 0;
    const uniquePositions: Record<number, boolean> = {};
    for (let i = 0; i < segments.length; i++) {
      if (!segments.get(i)) continue;
      if (!uniquePositions[getCoordIndex(segments.get(i))]) { size++; }
      uniquePositions[getCoordIndex(segments.get(i))] = true;
    }
    return size + 1;
  }

  function rewindAllowed(additionalConditions: boolean = false) {
    // Conditions for which rewind is always forbidden. These take precedence.
    if (replay.mode === ReplayMode.Playback) return false;
    if (state.isLost) return false;
    if (state.isGameWon) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    if (_calculateSnakeSize() <= START_SNAKE_SIZE + 1) return false;
    // Conditions for which rewind is always allowed.
    if (state.gameMode === GameMode.Casual) return true;
    if (es.level === START_LEVEL) return true;
    if (es.level === START_LEVEL_COBRA) return true;
    // other conditions of varying scenarios
    if (additionalConditions) return true;
    return false;
  }

  return {
    handleSnakeMovement,
    handleSnakeRewind,
    handleSnakeMovementDuringReplay,
    handleTeleportOnGameWin,
    handlePortalTravel,
    reboundSnake,
    rewindAllowed,
    checkHasHit,
    checkPortalTeleportWillHit,
    getDirectionSnakeForward,
    getDirectionSnakeBackward,
  };
}
