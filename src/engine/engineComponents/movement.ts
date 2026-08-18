import { Vector } from "p5";
import { VectorList } from "@/collections/vectorList";
import {
  BURN_DURATION_MS,
  ELECTROCUTION_DURATION_MS,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_GRACE_TIME,
  HURT_STUN_TIME,
  LUNGE_STEPS,
  SPEED_INCREMENT_SPEED_MS,
  SPEED_LIMIT_ULTRA,
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
  DamageType,
  KeyChannel,
  LoopState,
  PlayerState,
  Replay,
  ReplayMode,
  Sound,
  Stats,
  ThreatType,
  PipeConnection,
} from "@/types";
import {
  checkHasPortalAtLocation,
  checkIsMoving,
  clamp,
  coordToVec,
  dirToUnitVector,
  findPipeExit,
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
    state.lungeStepsRemaining = 0;
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
      checkCollision,
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
      state.lastHurtBy = DamageType.QuantumEntanglement;
    }
    // apply system rotation to es.recentMoveInputs and es.recentMoves so that special moves (u-turn, etc) still work
    if (prevDir !== newDir) {
      for (let i = 0; i < es.recentMoves.length; i++) {
        es.recentMoves[i] = rotateSystemAfterPortalTraverse(prevDir, newDir, es.recentMoves[i]);
      }
      for (let i = 0; i < es.recentMoveInputs.length; i++) {
        es.recentMoveInputs[i] = rotateSystemAfterPortalTraverse(prevDir, newDir, es.recentMoveInputs[i]);
      }
    }
  }

  function handlePipeTravel() {
    if (state.isExitingLevel) return;
    const pipe: PipeConnection = es.pipesMap[getCoordIndex(player.position)];
    if (!pipe) return;
    const result = findPipeExit(getCoordIndex(player.position), player.direction, state, es);
    if (!result) return;
    playSound(Sound.warp);
    const [exitCoord, exitDir] = result;
    const newPosition = coordToVec(exitCoord);
    player.position.set(newPosition);
    player.direction = exitDir;
  }

  function _movePlayer(normalizedSpeed = 0): boolean {
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
      player.direction = player.direction === prevDirection ? getDirectionSnakeForward() : prevDirection;
      return false;
    }

    // determine if next move will be into something, allow for grace period before injuring snakey
    const willHitSomething = checkHasHit(futurePosition) || checkPortalTeleportWillHit(futurePosition, player.direction);
    const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const canAutoRewind = rewindAllowed(invincible);
    const hurtGraceTime = _getHurtGraceTime(futurePosition, canAutoRewind);
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
    // extra move on first lunge frame
    if (isFirstLungeFrame
      && !willHitSomething
      && !checkHasHit(player.position.copy().add(currentMove))
      && !segments.existsAt(player.position.x, player.position.y)
    ) {
      moveSegments();
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

  function _getHurtGraceTime(futurePosition: Vector, canAutoRewind: boolean) {
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

  function checkCollision(vec: Vector, checkBarricade = true): DamageType {
    if (state.isExitingLevel) return DamageType.None;
    if (state.isExited) return DamageType.None;
    if (state.isGameWon) return DamageType.None;
    const coord = getCoordIndex(vec);
    // self
    const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;
    const rewindingFromArmor = state.isRewinding && state.timeSinceArmorProtection < es.difficulty.invincibilityTime;
    if (segments.containsCoord(coord) && !invincible && !rewindingFromArmor) {
      return DamageType.HitSelf;
    }
    // clip reality
    if (es.level.disableWallCollision) return DamageType.None;
    // door
    if (es.doorsMap[coord]) {
      return DamageType.HitDoor;
    }
    // barrier
    const isPassableBarrier = state.isDoorsOpen && es.passablesMap[coord];
    if (!isPassableBarrier && es.barriersMap[coord]) {
      return DamageType.HitBarrier;
    }
    // lock
    if (es.locksMap[coord]) {
      if (es.locksMap[coord].channel === KeyChannel.Yellow && state.hasKeyYellow) return DamageType.None;
      if (es.locksMap[coord].channel === KeyChannel.Red && state.hasKeyRed) return DamageType.None;
      if (es.locksMap[coord].channel === KeyChannel.Blue && state.hasKeyBlue) return DamageType.None;
      return DamageType.HitLock;
    }
    // pipe
    if (es.pipesMap[coord] && !findPipeExit(getCoordIndex(vec), player.direction, state, es)) {
      return DamageType.HitBarrier;
    }
    // threats
    if (es.threatsMap[coord] === ThreatType.LaserDiode) {
      return DamageType.HitBarrier;
    }
    if (es.threatsMap[coord] === ThreatType.ExplodableBarrel) {
      return DamageType.HitBarrier;
    }
    if (checkBarricade && es.threatsMap[coord] === ThreatType.Barricade && !state.isButtonPressed) {
      return DamageType.HitBarrier;
    }
    if (es.threatsMap[coord] === ThreatType.Spikes && !state.isButtonPressed && !invincible) {
      return DamageType.SpikePierce;
    }
    if (es.threatsMap[coord] === ThreatType.WallSpikes && !state.isButtonPressed && !invincible) {
      return DamageType.SpikePierce;
    }
    if (es.threatsMap[coord] === ThreatType.Saw && !state.isButtonPressed && !invincible) {
      return DamageType.SawCut;
    }
    if (es.threatsMap[coord] === ThreatType.Flamethrower) {
      return DamageType.HitBarrier;
    }
    return DamageType.None;
  }

  function checkHasHit(vec: Vector, updateLastHurtBy = true, checkBarricade = true): boolean {
    if (state.isExitingLevel) return false;
    if (state.isExited) return false;
    if (state.isGameWon) return false;
    if (state.timeSinceHurt < HURT_STUN_TIME) return false;
    const hit = checkCollision(vec, checkBarricade);
    if (hit && updateLastHurtBy) {
      state.lastHurtBy = hit;
    }
    return !!hit;
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
      checkCollision,
      hasPortalAtLocation: (location) => checkHasPortalAtLocation(location, es.portalsMap),
    });
    return !!checkCollision(portal.link.copy().add(dirToUnitVector(newDir)));
  }

  function _getTimeNeededUntilNextMove(): number {
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
    handlePipeTravel,
    reboundSnake,
    rewindAllowed,
    checkHasHit,
    checkCollision,
    checkPortalTeleportWillHit,
    getDirectionSnakeForward,
    getDirectionSnakeBackward,
  };
}
