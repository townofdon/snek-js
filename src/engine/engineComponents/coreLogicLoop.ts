import {
  ANIMATIONS,
  BARREL_CRIT_LIFETIME,
  BARREL_WARN_LIFETIME,
  BUTTON_RELEASE_DAMAGE_DELAY,
  FRAME_DUR_MS,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_FORGIVENESS_TIME,
  HURT_STUN_TIME,
  PICKUP_TYPE_RARITY_MAP,
  RARITY_EPIC,
  RARITY_LEGENDARY,
  RARITY_RARE,
  SCORE_INCREMENT,
} from "@/constants";
import {
  Action,
  DamageType,
  DIR,
  ExplosionType,
  GameMode,
  Image,
  LevelType,
  PickupType,
  PipeConnection,
  RemovalReason,
  ReplayMode,
  Sound,
  SpritesheetRange,
  ThreatFlag,
  ThreatType,
} from "@/types";
import { getCurrentGamepadSprint } from "../gamepad";
import {
  byCoord,
  checkHasPortalAtLocation,
  clamp,
  coordToVec,
  dirToUnitVector,
  findPipeExit,
  getBestPortalExitDirection,
  getCoordIndex,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  invertDirection,
  isBreakableBarrier,
  isOrthogonalDirection,
  outOfBounds,
  recalculateLasersMap,
  rotateSystemAfterPortalTraverse,
  shouldBlinkExpiringPickup,
} from "@/utils";
import { allowAchievements, checkArcadeAchievement } from "@/achievements";
import { getIsStartLevel } from "@/levels/levelUtils";
import { Context } from "./context";
import {
  _getTimeNeededUntilNextMove,
  _movePlayer,
  _updateCurrentMoveSpeed,
  getDirectionSnakeBackward,
  getDirectionSnakeForward,
  moveSegments,
  reboundSnake,
} from "./movement";
import {
  handleDifficultySelect,
  handleKeyPickup,
  handleSetNextLevel,
  handleSwitches,
  handleUnlock,
} from "./interactions";
import {
  canExplodeBarrelAt,
  checkCanBreakWalls,
  checkCanBreakWallsWithoutDamage,
  getHasClearedLevel,
  isSnakeTrapped,
  checkRewindAllowed,
  wallBreakableAt,
  checkCollision,
} from "./logic";
import {
  acquireArmor,
  acquireHealth,
  acquireInvincibility,
  acquireReversibility,
  acquireWeightLoss,
  addPoints,
  applyArmorProtection,
  applyMortalRuin,
  eatPreyAt,
  growSnake,
  increaseSpeed,
  incrementPickupBonus,
  incrementScore,
  openDoors,
  removeBarrierTile,
  startAutoRewind,
  stopRewinding,
} from "./mutations";
import {
  applyDamage,
  epicDeathRoutine,
  handlePreyElectrocution,
  handlePreyFireDamage,
  handlePreyTrapped,
  handleSnakeElectrocution,
  handleSnekFireDamage,
  spawnHurtParticles,
} from "./damage";
import { chooseSpawnLocation, spawnApple, spawnArmorPickup } from "./spawning";

export function coreLogicLoop(ctx: Context): Context {
  const {
    p5,
    es,
    state,
    loopState,
    replay,
    drawState,
    boss,
    stats,
    astar,
    renderer,
    sfx,
    player,
    segments,
    heldItems,
    apples,
    threats,
    shields,
    shieldSpawns,
    pickupOutlines,
    puffs,
    preyList,
    explosions,
    appleParticleSystem,
    playSound,
    startScreenShake,
    proceedToNextReplayClip,
    flashScreen,
    maybeGameOver,
    onLevelExitStart,
    onLevelExitFinish,
    actionRunning,
    startAction,
    stopAction,
    renderHeartsUI,
    renderScoreUI,
    renderLevelName,
  } = ctx;

  const currentTime = window.performance.now();
  const diff = loopState.timePrevMs === 0
    ? FRAME_DUR_MS
    : Math.max(currentTime - loopState.timePrevMs, 0);
  loopState.timePrevMs = currentTime;
  loopState.timeAccumulatedMs += diff;
  // ensure logic loop fires at approximately <FRAMERATE> fps
  if (loopState.timeAccumulatedMs < FRAME_DUR_MS) {
    return;
  } else {
    loopState.deltaTime = loopState.timeAccumulatedMs * loopState.timeScale;
    loopState.timeAccumulatedMs = 0;
  }

  if (
    (state.isMoving || state.isRewinding) &&
    (p5.keyIsDown(p5.SHIFT) || getCurrentGamepadSprint())
  ) {
    state.isSprinting = true;
  } else {
    state.isSprinting = false;
  }

  if (state.isPaused) return;
  if (!state.isGameStarted && replay.mode !== ReplayMode.Playback) return;

  let skip = false;
  let didHit = false;
  let didDamageEnvironment = false;
  let didApplyArmor = false;
  const invincible = state.timeSinceInvincibleStart < es.difficulty.invincibilityTime;

  //#region hurt forgiveness
  skip = (false
    || state.timeSinceHurtForgiveness < HURT_STUN_TIME * 2
    || state.timeSinceHurt >= HURT_FORGIVENESS_TIME
    || state.isGameWon
    || state.gameMode === GameMode.Casual
    || !state.isGameStarted
    || !state.isMoving
    || replay.mode === ReplayMode.Playback
    || es.moves.length <= 0
    || segments.length <= 0
    || state.lastHurtBy === DamageType.HitMine
    || state.lastHurtBy === DamageType.QuantumEntanglement
    || state.lastHurtBy === DamageType.Electrocution
    || state.lastHurtBy === DamageType.MortalRuin
    || state.lastHurtBy === DamageType.Explosive
  );
  if (!skip){
    const isGameOver = state.isLost && state.lives === 0;
    const move = es.moves[0];
    if (!isOrthogonalDirection(move, player.directionLastHit)) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }
    if (move === player.directionToFirstSegment) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }
    if (move === player.direction && isGameOver) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }

    const currentMove = dirToUnitVector(move);
    const futurePosition = isGameOver
      ? segments.get(0).copy().add(currentMove)
      : player.position.copy().add(currentMove);
    const willHitSomething = !!checkCollision(ctx, futurePosition);
    if (willHitSomething) {
      state.timeSinceHurtForgiveness = 0;
      return;
    }

    if (isGameOver) {
      reboundSnake(ctx, 2);
      playSound(Sound.hurt3);
    } else {
      state.lives += 1;
      state.collisions = Math.max(state.collisions - 1, 0);
    }
    es.moves.shift();
    player.direction = move;
    player.directionToFirstSegment = getDirectionSnakeBackward(ctx);
    state.isLost = false;
    state.timeSinceHurt = Infinity;
    state.timeSinceHurtForgiveness = 0;
    sfx.stop(Sound.death);
    playSound(Sound.hurtSave);
    renderHeartsUI();
    stopAction(Action.GameOver);
    renderer.invalidateStaticCache();
  }
  //#endregion hurt forgiveness

  //#region break if lost
  if (state.isLost) return ctx;
  //#endregion

  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------
  // -------

  //#region eat treats (segment)
  let didEat = false;
  for (let i = 0; i < segments.length; i++) {
    if (state.isLost || state.isExitingLevel) continue;
    const coord = getCoordIndex(segments.get(i));
    const appleFound = apples.existsAtCoord(coord) ? coord : -1;
    if (appleFound != undefined && appleFound >= 0) {
      const vec = segments.get(i);
      appleParticleSystem.emit(vec.x, vec.y);
      incrementScore(ctx);
      growSnake(ctx, appleFound);
      drawState.shouldDrawApples = true;
      didEat = true;
    }
  }
  //#endregion eat treats (segment)

  //#region eat treats (head)
  const coord = getCoordIndex(player.position);
  if (apples.existsAtCoord(coord)) {
    didEat = true;
    if (es.pickupsMap[coord]?.type === PickupType.Invincibility) {
      incrementPickupBonus(ctx, PickupType.Invincibility, coord);
      acquireInvincibility(ctx);
    } else if (es.pickupsMap[coord]?.type === PickupType.Armor) {
      // handled below via shieldSpawns / shields
    } else if (es.pickupsMap[coord]?.type === PickupType.HealthPack) {
      acquireHealth(ctx);
      incrementPickupBonus(ctx, PickupType.HealthPack, coord);
      didEat = false;
    } else if (es.pickupsMap[coord]?.type === PickupType.WeightLossPill) {
      acquireWeightLoss(ctx);
      incrementPickupBonus(ctx, PickupType.WeightLossPill, coord);
      didEat = false;
    } else if (es.pickupsMap[coord]?.type === PickupType.Reversibility) {
      acquireReversibility(ctx);
      incrementPickupBonus(ctx, PickupType.Reversibility, coord);
      didEat = false;
    } else if (es.pickupsMap[coord]) {
      const rarity = PICKUP_TYPE_RARITY_MAP[es.pickupsMap[coord]?.type];
      if (rarity === RARITY_LEGENDARY) {
        playSound(Sound.acquireLegendaryItem, 0.3);
      } else if (rarity === RARITY_EPIC) {
        if (Math.random() > 0.5) {
          playSound(Sound.acquireEpicItem, 0.3);
        } else {
          playSound(Sound.acquireEpicItem2, 0.3);
        }
      } else if (rarity === RARITY_RARE) {
        // playSound(Sound.acquireRareItem, 0.3);
      }
      incrementPickupBonus(ctx, es.pickupsMap[coord]?.type, coord);
    }
    if (didEat) {
      appleParticleSystem.emit(player.position.x, player.position.y);
      incrementScore(ctx);
      growSnake(ctx, coord);
      increaseSpeed(ctx);
      playSound(Sound.eat);
      if (!state.isDoorsOpen) renderLevelName();
    }
    if (pickupOutlines.existsAtCoord(coord)) {
      pickupOutlines.removeByCoord(coord, RemovalReason.PickedUp);
    }
    apples.removeByCoord(coord);
    es.pickupsMap[coord] = null;
    drawState.shouldDrawApples = true;
    didEat = true;
  }
  //#endregion eat treats (head)

  //#region arcade achivements
  if (didEat && state.gameMode === GameMode.Arcade && allowAchievements(state, replay.mode)) {
    checkArcadeAchievement(stats.score, stats.totalGameTimeElapsed)
  }
  //#endregion arcade achievements

  //#region acquire shield
  if (shieldSpawns.existsAtCoord(coord) || shields.existsAtCoord(coord)) {
    shieldSpawns.removeByCoord(coord, RemovalReason.PickedUp);
    shields.removeByCoord(coord, RemovalReason.PickedUp);
    incrementPickupBonus(ctx, PickupType.Armor, coord);
    acquireArmor(ctx);
    es.pickupsMap[coord] = null;
  }
  //#endregion acquire shield/armor

  //#region eat prey
  // check if head has reached any prey
  if (preyList.existsAtCoord(coord)) {
    didEat = eatPreyAt(ctx, coord);
  }

  // check for En Passant for prey
  const passantCoord = preyList.wasAtCoord(coord, FRAME_DUR_MS * 2);
  if (passantCoord >= 0) {
    didEat = eatPreyAt(ctx, passantCoord);
  }

  // if lunging, check tiles around snek head for prey.
  //
  // when lunging RIGHT, pattern is as-follows for a 9x9 grid (x=tile_to_check):
  // _ x x
  // x O _
  // _ x x
  if (state.lungeStepsRemaining > 0) {
    let tiles: number[];
    const left = -1;
    const right = 1;
    const up = -GRIDCOUNT_X;
    const down = GRIDCOUNT_X;
    if (player.direction === DIR.UP) {
      tiles = [coord + left, coord + right, coord + up + left, coord + up + right, coord + down];
    } else if (player.direction === DIR.DOWN) {
      tiles = [coord + left, coord + right, coord + down + left, coord + down + right, coord + up];
    } else if (player.direction === DIR.LEFT) {
      tiles = [coord + up, coord + down, coord + left + up, coord + left + down, coord + right];
    } else if (player.direction === DIR.RIGHT) {
      tiles = [coord + up, coord + down, coord + right + up, coord + right + down, coord + left];
    }
    for (let i = 0; i < tiles.length; i++) {
      const coord = tiles[i];
      if (preyList.existsAtCoord(coord)) {
        didEat = eatPreyAt(ctx, coord);
      }
      const passantCoord = preyList.wasAtCoord(coord, FRAME_DUR_MS * 2);
      if (passantCoord >= 0) {
        didEat = eatPreyAt(ctx, passantCoord);
      }
    }
  }

  if (didEat && !state.isDoorsOpen && !boss.current) {
    spawnApple(ctx);
  }
  //#endregion eat prey

  //#region tick prey, pickups
  if (!state.isInvertedColors) {
    astar.setSnekCoord(getCoordIndex(player.position));
    if (preyList.tick(loopState.deltaTime)) {
      drawState.shouldDrawActionFG = true;
    }
  }

  let didChange = false;
  for (let x = 0; x < GRIDCOUNT_X; x++) {
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      const i = getCoordIndex2(x, y);
      if (es.pickupsMap[i]) {
        const timeLeft = es.pickupsMap[i].lifetime;
        es.pickupsMap[i].lifetime -= loopState.deltaTime;
        if (shouldBlinkExpiringPickup(timeLeft) !== shouldBlinkExpiringPickup(es.pickupsMap[i].lifetime)) {
          drawState.shouldDrawApples = true;
        }
        if (es.pickupsMap[i].lifetime <= 0) {
          es.pickupsMap[i] = null;
          apples.removeByCoord(i);
          drawState.shouldDrawApples = true;
          const lifetime = ANIMATIONS[Image.PuffSheet].frames * ANIMATIONS[Image.PuffSheet].timePerFrame;
          puffs.add(x, y, lifetime, Image.PuffSheet);
        }
      }
    }
  }
  if (didChange) {
    recalculateLasersMap(es, threats);
  }
  //#endregion tick prey, pickups

  //#region portal travel
  const portal = es.portalsMap[getCoordIndex(player.position)];
  skip = (false
    || state.isExitingLevel
    || !portal
    || !portal.link
  )
  if (!skip){
    playSound(Sound.warp);
    const newDir = getBestPortalExitDirection({
      portalLink: portal.link,
      playerDirection: player.direction,
      portalExitMode: es.level.portalExitConfig?.[portal.channel] || portal.exitMode,
      checkCollision: (location) => checkCollision(ctx, location),
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
  //#endregion portal travel

  //#region pipe travel
  const pipe: PipeConnection = es.pipesMap[getCoordIndex(player.position)];
  skip = (false
    || state.isExitingLevel
    || !pipe
  );
  if (!skip){
    const result = findPipeExit(getCoordIndex(player.position), player.direction, state, es);
    if (result) {
      playSound(Sound.warp);
      const [exitCoord, exitDir] = result;
      const newPosition = coordToVec(exitCoord);
      player.position.set(newPosition);
      player.direction = exitDir;
    }
  }
  //#endregion pipe travel

  //#region interactions
  handleKeyPickup(ctx);
  handleSwitches(ctx);
  handleUnlock(ctx);
  handleDifficultySelect(ctx);
  handleSetNextLevel(ctx);
  //#endregion interactions

  // damage environment
  const canBreakWalls = (checkCanBreakWalls(ctx) && wallBreakableAt(ctx, coord));
  const canBreakWallsWithoutDamage = invincible || checkCanBreakWallsWithoutDamage(ctx);
  if (canBreakWalls && !es.passablesMap[coord] && isBreakableBarrier(es.barriersMap[coord])) {
    didDamageEnvironment = true;
    removeBarrierTile(ctx, coord);
    playSound(Sound.xplodeLong);
    startScreenShake(2, 0, 0.8);
  }
  if (threats.existsAtCoord(coord, ThreatType.ExplodableBarrel)) {
    didDamageEnvironment = true;
    const timeRemaining = byCoord(coord)(threats.getTimeRemaining);
    if (timeRemaining <= BARREL_CRIT_LIFETIME || canExplodeBarrelAt(ctx, coord)) {
      threats.removeByCoord(coord, RemovalReason.Explode);
    } else if (timeRemaining <= BARREL_WARN_LIFETIME) {
      byCoord(coord)(threats.setLifetime, BARREL_CRIT_LIFETIME);
      byCoord(coord)(threats.setSprite, SpritesheetRange.BarrelFireB);
    } else {
      byCoord(coord)(threats.setLifetime, BARREL_WARN_LIFETIME);
      // note - this ensures that the burning animation plays
      byCoord(coord)(threats.setSprite, SpritesheetRange.BarrelFireA);
    }
  }
  if (didDamageEnvironment && !canBreakWallsWithoutDamage) {
    didHit = true;
    state.lastHurtBy = DamageType.HitBarrier;
  }

  //#region collision
  skip = (false
    || didHit
    || state.isRewinding
    || state.isExitingLevel
    || state.isExited
    || state.isGameWon
    || state.timeSinceHurt < HURT_STUN_TIME
    || state.lives < 0
    || state.isLost
    || invincible
    || actionRunning(Action.EpicDeath)
  );
  if (!skip) {
    const checkBarricade = state.timeSinceLastMove < BUTTON_RELEASE_DAMAGE_DELAY && state.timeSinceButtonPressChanged > BUTTON_RELEASE_DAMAGE_DELAY;
    const hit = checkCollision(ctx, player.position, checkBarricade);
    if (hit) {
      state.lastHurtBy = hit;
      didHit = true;
    }
  }
  //#endregion collision

  //#region check mine hit
  skip = (false
    || didHit
    || state.isExitingLevel
    || state.isExited
    || state.isGameWon
    || state.timeSinceHurt < HURT_STUN_TIME
  );
  if (!skip){
    if (threats.existsAtCoord(coord, ThreatType.Mine) || threats.existsAtCoord(coord, ThreatType.Bomb)) {
      threats.removeByCoord(coord, RemovalReason.Explode);
      if (invincible) {
        didHit = false;
      } else if (heldItems.armor > 0) {
        heldItems.armor -= 1;
        state.timeSinceArmorProtection = 0;
        reboundSnake(ctx, 2);
        playSound(Sound.hurtSave);
        didHit = false;
      } else {
        state.lastHurtBy = DamageType.HitMine;
        didHit = true;  
      }
    }
    if (invincible && threats.existsAtCoord(coord, ThreatType.ElectricCoil)) {
      threats.removeByCoord(coord, RemovalReason.Explode);
    }
  }
  //#endregion check mine hit

  //#region check explosion hit
  skip = (false
    || didHit
    || state.isExitingLevel
    || state.isExited
    || state.isGameWon
    || state.timeSinceInvincibleStart <= es.difficulty.invincibilityTime
    || state.timeSinceHurt < HURT_STUN_TIME
    || state.timeSinceArmorProtection < HURT_STUN_TIME
  );
  if (!skip){
    const vec = player.position;
    const pos = getCoordIndex(vec);
    const checks = [
      0, 0,
      -1, 0,
      1, 0,
      0, -1,
      0, 1,
    ];
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        const explosiveDamage = explosions.existsAtCoord(coord, ExplosionType.Large)
          && byCoord(coord)(explosions.getFrame) === 0
          && !byCoord(coord)(explosions.hasFlagAt, ThreatFlag.NoDamage);
        if (!explosiveDamage) {
          continue;
        }
        for (let i = 0; i < Math.floor(checks.length / 2); i++) {
          const damagex = x + checks[2 * i + 0];
          const damagey = y + checks[2 * i + 1];
          if (damagex < 0 || damagex >= GRIDCOUNT_X) continue;
          if (damagey < 0 || damagey >= GRIDCOUNT_Y) continue;
          const damageCoord = getCoordIndex2(damagex, damagey);
          if (pos === damageCoord || segments.existsAtCoord(damageCoord)) {
            didHit = true;
            if (state.lives <= 0 && heldItems.armor <= 0) {
              es.snekDamage[damageCoord] = DamageType.Explosive;
            }
          }
        }
      }
    }
    if (didHit) {
      state.lastHurtBy = DamageType.Explosive;
    }
  }
  //#endregion check explosion hit

  //#region armor protection
  if (didHit && heldItems.armor > 0 && !isSnakeTrapped(ctx)) {
    didApplyArmor = true;
    didHit = false; // you saw nothing!
    state.lastHurtBy = DamageType.None;
    if (invincible) {
      state.timeSinceArmorProtection = 0;
      startAutoRewind(ctx);
      startScreenShake(0.3, 0.8);
    } else {
      applyArmorProtection(ctx);
    }
  }

  if (didDamageEnvironment || didApplyArmor) {
    state.lungeStepsRemaining = 0;
    state.timeSinceArmorProtection = 0;
    state.timeSinceLungeStart = Infinity;
    reboundSnake(ctx, 3);
  }
  //#endregion armor protection

  //#region spike death
  let instadeath = false;
  skip = (false
    || state.isExitingLevel
    || state.isExited
    || state.isLost
    || state.lives < 0
    || state.isDeathIlluminating
    || actionRunning(Action.EpicDeath)
    || state.isButtonPressed
    || state.timeSinceInvincibleStart < es.difficulty.invincibilityTime
    || state.timeSinceButtonPressChanged < BUTTON_RELEASE_DAMAGE_DELAY
  );
  if (!skip) {
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      const mortalRuin = false
        || es.threatsMap[coord] === ThreatType.Spikes
        || es.threatsMap[coord] === ThreatType.WallSpikes
        || es.threatsMap[coord] === ThreatType.Saw;
      const playerAtCoord = getCoordIndex(player.position) === coord || segments.existsAtCoord(coord);
      if (mortalRuin && playerAtCoord) {
        instadeath = true;
        state.lastHurtBy = es.threatsMap[coord] === ThreatType.Saw ? DamageType.SawCut : DamageType.SpikePierce;
        if (es.threatsMap[coord] === ThreatType.Saw) {
          es.snekDamage[coord] = DamageType.SawCut;
        }
        es.level.deathLocations ||= {};
        es.level.deathLocations[coord] = true;
        es.illuminationMap[coord] = 1;
        drawState.shouldDrawActionFG = true;
      }
    }
  }
  if (instadeath) {
    applyMortalRuin(ctx);
    sfx.stopAll();
    playSound(Sound.stab);
    startAction(epicDeathRoutine(ctx), Action.EpicDeath);
  }
  //#endregion spike death

  //#region snek trapped
  skip = (false
    || !didHit
    || state.lives < 0
    || state.isExitingLevel
    || state.isExited
    || state.isLost
    || state.isDeathIlluminating
    || actionRunning(Action.EpicDeath)
    || state.gameMode === GameMode.Casual
    || !isSnakeTrapped(ctx)
  )
  if (!skip && threats.existsAtCoord(coord, ThreatType.ExplodableBarrel)) {
    skip = true;
    threats.removeByCoord(coord, RemovalReason.Explode);
  }
  if (!skip && heldItems.reversibles > 0 && checkRewindAllowed(ctx, true) && !invincible) {
    // rewind
    skip = true;
    didHit = false;
    heldItems.reversibles -= 1;
    state.timeSinceReverseStart = 0;
    reboundSnake(ctx, 1);
    startAutoRewind(ctx);
    playSound(Sound.hurtSave);
  }
  if (!skip) {
    // trapped death
    state.isTrapped = true;
    if (heldItems.armor > 0) {
      heldItems.armor -= 1;
    }
    sfx.stopAll();
    playSound(Sound.stab);
    startAction(epicDeathRoutine(ctx), Action.EpicDeath);
  }
  //#endregion snek trapped

  if (didHit) {
    player.directionLastHit = player.direction;
    state.collisions += 1;
    if (state.lives === 0) {
      state.isLost = true;
    }
  }

  //#region snek damage
  skip = (false
    || !didHit
    || state.isLost
    || state.lives <= 0
    || state.isDeathIlluminating
    || actionRunning(Action.EpicDeath)
    // snake will perish soon enough.
    || state.lastHurtBy === DamageType.SawCut
    || state.lastHurtBy === DamageType.SpikePierce
  );
  if (!skip){
    applyDamage(ctx, 1);
    if (
      state.lastHurtBy === DamageType.HitBarrier ||
      state.lastHurtBy === DamageType.HitDoor ||
      state.lastHurtBy === DamageType.HitLock ||
      state.lastHurtBy === DamageType.HitSelf
    ) {
      spawnHurtParticles(ctx);
    }
    if (
      state.lastHurtBy === DamageType.HitBarrier ||
      state.lastHurtBy === DamageType.HitDoor ||
      state.lastHurtBy === DamageType.HitLock ||
      state.lastHurtBy === DamageType.HitSelf ||
      state.lastHurtBy === DamageType.HitMine
    ) {
      reboundSnake(ctx, 2);
    }
    player.directionToFirstSegment = getDirectionSnakeBackward(ctx);
    // if snake will move backwards into itself:
    // - set current direction to be: segments[0] --> snake head
    const currentMove = dirToUnitVector(player.direction);
    const futurePosition = player.position.copy().add(currentMove);
    if (segments.length > 0 && futurePosition.equals(segments.get(0).x, segments.get(0).y)) {
      player.direction = getDirectionSnakeForward(ctx);
    }
    state.lungeStepsRemaining = 0;
    es.moves = [];
  }
  //#endregion snek damage

  handleSnakeElectrocution(ctx);
  handleSnekFireDamage(ctx);
  handlePreyElectrocution(ctx);
  handlePreyFireDamage(ctx);
  handlePreyTrapped(ctx);

  // snake death
  //#region snek death
  if (state.isLost || state.lives < 0) {
    state.isLost = true;
    state.lives = 0;
    if (
      state.lastHurtBy === DamageType.HitBarrier ||
      state.lastHurtBy === DamageType.HitDoor ||
      state.lastHurtBy === DamageType.HitLock ||
      state.lastHurtBy === DamageType.HitSelf
    ) { spawnHurtParticles(ctx); }
    applyMortalRuin(ctx);
    renderHeartsUI();
    flashScreen(HURT_FORGIVENESS_TIME);
    startScreenShake();
    maybeGameOver();
    playSound(Sound.death);
    return;
  }
  //#endregion snek death

  //#region movement
  let didMove = false;
  skip = (false
    || !state.isMoving
    || state.isRewinding
    || replay.mode === ReplayMode.Playback
  );
  if (!skip){
    const timeNeededUntilNextMove = _getTimeNeededUntilNextMove(ctx);
    if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      const normalizedSpeed = clamp(es.difficulty.speedLimit / (timeNeededUntilNextMove || 0.001), 0, 1);
      didMove = _movePlayer(ctx, normalizedSpeed);
      if (didMove) player.directionToFirstSegment = invertDirection(player.direction);
    } else {
      state.timeSinceLastMove += loopState.deltaTime;
    }
    _updateCurrentMoveSpeed(ctx);
    if (!state.isExitingLevel && !state.isExited && !state.isGameWon) {
      stats.totalGameTimeElapsed += loopState.deltaTime;
      stats.totalLevelTimeElapsed += loopState.deltaTime;
    }
  }
  //#endregion movement

  //#region rewind
  skip = (false
    || !state.isRewinding
    || state.isExited
    || replay.mode !== ReplayMode.Disabled
  );
  if (!skip){
    // back that thing up
    const timeNeededUntilNextMove = _getTimeNeededUntilNextMove(ctx);
    const canRewind = checkRewindAllowed(ctx,
      state.timeSinceReverseStart < es.difficulty.invincibilityTime ||
      state.timeSinceInvincibleStart < es.difficulty.invincibilityTime
    );
    state.lungeStepsRemaining = 0;
    if (!canRewind) {
      stopRewinding(ctx);
    } else if (state.timeSinceLastMove >= timeNeededUntilNextMove) {
      state.timeSinceGraceStarted = 0;
      state.timeSinceLastMove = 0;
      reboundSnake(ctx, 1);
      player.direction = getDirectionSnakeForward(ctx);
      player.directionToFirstSegment = invertDirection(player.direction);
    } else {
      state.timeSinceLastMove += loopState.deltaTime;
    }
    _updateCurrentMoveSpeed(ctx);
  }
  //#endregion rewind

  //#region movement (replay)
  skip = (false
    || didHit
    || replay.mode !== ReplayMode.Playback
  );
  if (!skip){
    const position: [number, number] | undefined = replay.positions[state.frameCount];
    if (position != undefined) {
      moveSegments(ctx);
      player.position.set(position[0], position[1])
      player.direction = getDirectionSnakeForward(ctx);
      player.directionToFirstSegment = invertDirection(player.direction);
    }
    if (state.frameCount > replay.lastFrame) {
      proceedToNextReplayClip();
    }
  }
  //#endregion movement (replay)

  //#region capture replay info
  skip = (false
    || state.gameMode === GameMode.Casual
    || !state.isMoving
    || replay.mode !== ReplayMode.Capture
  )
  if (!skip){
    if (didMove) {
      replay.positions[state.frameCount] = [player.position.x, player.position.y];
    }
    if (didHit) {
      // capture snake movement after hit and rebound
      replay.positions[state.frameCount] = [player.position.x, player.position.y];
    }
  }
  //#endregion capture replay info

  //#region open doors, spawn armor
  if (getHasClearedLevel(ctx) && !state.isDoorsOpen && !actionRunning(Action.OpenDoors)) {
    openDoors(ctx);
  }
  const doorsOpen = state.isDoorsOpen || actionRunning(Action.OpenDoors);
  if (didEat && doorsOpen && apples.length === 0 && preyList.length === 0 && es.level.armorDrop && replay.mode !== ReplayMode.Playback) {
    const loc = chooseSpawnLocation(ctx, es.level.armorDrop);
    if (loc >= 0) {
      spawnArmorPickup(ctx, getCoordX(loc), getCoordY(loc));
    }
  }
  //#endregion open doors

  //#region exit start
  skip = (false
    || state.isGameWon
    || state.isExitingLevel
    || !outOfBounds(player.position.x, player.position.y)
  );
  if (!skip) {
    state.isExitingLevel = true;
    state.timeSinceInvincibleStart = Infinity;
    onLevelExitStart();
  }
  //#endregion

  //#region exiting
  skip = (false
    || !didMove
    || !state.isExitingLevel
    || state.isExited
    || !!getIsStartLevel(es.level)
    || es.level.type === LevelType.Maze
    || es.level.type === LevelType.WarpZone
  );
  if (!skip){
    if (!state.isGameWon) {
      addPoints(ctx, SCORE_INCREMENT);
    }
    renderScoreUI();
  }
  //#endregion exiting

  //#region exit finish
  skip = (false
    || !state.isExitingLevel
    || state.isExited
    || state.isGameWon
    || !segments.every(segment => outOfBounds(segment.x, segment.y))
  )
  if(!skip){
    state.isExited = true;
    onLevelExitFinish();
  }
  //#endregion exit finish

  //#region teleport map edge
  skip = (false
    || !state.isGameWon
  );
  if (!skip){
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
  //#endregion teleport map edge

  if (drawState.shouldRecalculateLasers) {
    recalculateLasersMap(es, threats);
    drawState.shouldRecalculateLasers = false;
  }

  if (boss.current && loopState.timeScale) {
    boss.current.tick(loopState.deltaTime);
  }

  state.timeSinceHurt += loopState.deltaTime;
  state.timeSinceHurtForgiveness += loopState.deltaTime;
  state.timeSinceInvincibleStart += loopState.deltaTime;
  state.timeSinceElectrocutionStart += loopState.deltaTime;
  state.timeSinceBurnStart += loopState.deltaTime;
  state.timeSinceReverseStart += loopState.deltaTime;
  state.timeSinceArmorPickup += loopState.deltaTime;
  state.timeSinceArmorProtection += loopState.deltaTime;
  state.timeSinceSpawnedAnyPickup += loopState.deltaTime;
  state.timeSinceSpawnedWeightLossPillPickup += loopState.deltaTime;
  state.timeSinceLastInput += loopState.deltaTime;
  state.timeSinceLastTeleport += loopState.deltaTime;
  state.timeSinceButtonPressChanged += loopState.deltaTime;
  state.timeSinceLungeStart += loopState.deltaTime;
  state.frameCount += 1;
  for (let i = es.recentInputTimes.length - 1; i >= 0; i--) {
    es.recentInputTimes[i] += loopState.deltaTime;
  }
  // solution to infinite portal loop soft lock:
  // since the loop happens every frame, decrement every N frames so that
  // the count will accumulate until it passes some critical threshold
  if (state.frameCount % 8 === 0) {
    state.numTeleports = Math.max(state.numTeleports - 1, 0);
  }
  return ctx;
}

