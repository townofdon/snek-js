import { Action, BarrierType, BaseStats, DamageType, ExplosionType, GameMode, IEnumerator, Image, MapAnnotation, PickupRarity, PickupType, PreyType, RemovalReason, ReplayMode, Sound, SpritesheetImage } from "@/types";
import { Context } from "./context";
import { checkRewindAllowed } from "./logic";
import {
  ANIMATIONS,
  ARMOR_PICKUP_FREEZE_MS,
  CLEAR_BONUS,
  COBRA_SCORE_MOD,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_STUN_TIME,
  INVINCIBILITY_PICKUP_FREEZE_MS,
  MAX_LIVES,
  MAX_SNAKE_SIZE,
  PICKUP_COMMON_BONUS,
  PICKUP_COMMON_ITEMS,
  PICKUP_EPIC_BONUS,
  PICKUP_EPIC_ITEMS,
  PICKUP_GALACTIC_BONUS,
  PICKUP_INVINCIBILITY_BONUS,
  PICKUP_LEGENDARY_BONUS,
  PICKUP_LEGENDARY_ITEMS,
  PICKUP_RARE_BONUS,
  PICKUP_RARE_ITEMS,
  SCORE_INCREMENT,
  START_SNAKE_SIZE,
  TIME_REWIND_TAKEOVER_CONTROLS,
} from "@/constants";
import { LEVEL_WIN_GAME } from "@/levels/winGame";
import { getIsStartLevel } from "@/levels/levelUtils";
import { settings } from "@/stores/SettingsStore";
import { coordToVec, dirToUnitVector, getCoordIndex, getCoordX, getCoordY, recalculateLasersMap, removeArrayElement } from "@/utils";

export function resetStats(ctx: Context) {
  ctx.stats.perfect = true;
  ctx.stats.noApplesLeft = true;
  ctx.stats.numDeaths = 0;
  ctx.stats.numLevelsCleared = 0;
  ctx.stats.numLevelsEverCleared = 0;
  ctx.stats.numPointsEverScored = 0;
  ctx.stats.numApplesEverEaten = 0;
  ctx.stats.score = 0;
  ctx.stats.applesEatenThisLevel = 0;
  ctx.stats.totalGameTimeElapsed = 0;
  ctx.stats.totalLevelTimeElapsed = 0;
}

export function setStats(ctx: Context, incoming: BaseStats) {
  ctx.stats.perfect = incoming.perfect;
  ctx.stats.noApplesLeft = incoming.noApplesLeft;
  ctx.stats.score = incoming.score;
  ctx.stats.numDeaths = incoming.numDeaths;
  ctx.stats.numLevelsCleared = incoming.numLevelsCleared;
  ctx.stats.numLevelsEverCleared = incoming.numLevelsEverCleared;
  ctx.stats.numPointsEverScored = incoming.numPointsEverScored;
  ctx.stats.numApplesEverEaten = incoming.numApplesEverEaten;
  ctx.stats.totalGameTimeElapsed = incoming.totalGameTimeElapsed;
}

export function startMoving(ctx: Context) {
  const { state, tutorial, playSound } = ctx;
  if (state.isMoving) return;
  if (state.isRewinding && state.timeSinceArmorProtection < TIME_REWIND_TAKEOVER_CONTROLS) return;
  state.isMoving = true;
  state.isRewinding = false;
  state.currentSpeed = 1;
  tutorial.needsMoveControls = false;
  stopRewinding(ctx);
  if (state.timeSinceHurt >= HURT_STUN_TIME) {
    playSound(Sound.moveStart);
  }
}

export function stopRewinding(ctx: Context) {
  const { state, sfx } = ctx;
  state.isRewinding = false;
  sfx.stop(Sound.rewindLoop);
}

export function startAutoRewind(ctx: Context) {
  const { state, sfx } = ctx;
  if (state.isRewinding) return;
  if (!checkRewindAllowed(ctx, true)) return;
  state.isRewinding = true;
  state.isMoving = false;
  state.currentSpeed = 1;
  state.timeSinceGraceStarted = 0;
  sfx.playLoop(Sound.rewindLoop);
}

export function eatPreyAt(ctx: Context, coord: number): boolean {
  const { preyList, drawState, appleParticleSystem, playSound } = ctx;
  if (!preyList.existsAtCoord(coord)) {
    return false;
  }
  const vec = coordToVec(coord);
  appleParticleSystem.emit(vec.x, vec.y);
  incrementPreyBonus(ctx, preyList.getTypeByCoord(coord), coord);
  growSnake(ctx, coord);
  increaseSpeed(ctx);
  playSound(Sound.eat);
  playSound(Sound.acquirePrey, 0.5);
  preyList.removeByCoord(coord);
  drawState.shouldDrawActionFG = true;
  return true;
}

export function increaseSpeed(ctx: Context) {
  const { es, state } = ctx;
  if (state.isLost) return;
  state.targetSpeed += 1;
  if (es.level.appleSlowdownMod && !state.isSprinting) {
    state.currentSpeed = Math.min(es.difficulty.speedSteps * es.level.appleSlowdownMod, state.currentSpeed);
  }
}

export function addSnakeSegment(ctx: Context) {
  const { drawState, segments } = ctx;
  drawState.shouldDrawApples = true;
  segments.addVec(segments.get(segments.length - 1));
}

export function growSnake(ctx: Context, appleCoord = -1) {
  const { es, drawState, segments, state, apples, startScreenShake } = ctx;
  if (state.isLost) return;
  if (appleCoord < 0) return;
  drawState.shouldDrawApples = true;
  startScreenShake(0.25, 0.8);
  apples.removeByCoord(appleCoord);
  const numSegmentsToAdd = Math.max(
    ((es.level.growthOverride ?? es.difficulty.index) - Math.floor(segments.length / 100)) * (es.level.growthMod ?? 1),
    1
  );
  const maxSize = es.level === LEVEL_WIN_GAME ? 0.25 : MAX_SNAKE_SIZE;
  if (segments.length < maxSize) {
    for (let i = 0; i < numSegmentsToAdd; i++) {
      addSnakeSegment(ctx);
    }
  }
}

export function addPoints(ctx: Context, points: number) {
  const { es, state, stats } = ctx;
  if (state.isGameWon) return;
  if (state.gameMode === GameMode.Casual) return;
  if (getIsStartLevel(es.level)) return;
  stats.score += points;
  stats.numPointsEverScored += points;
}

export function incrementScore(ctx: Context) {
  const { es, state, stats, renderScoreUI } = ctx;
  if (state.isGameWon) return;
  let bonus = 0;
  if (state.isDoorsOpen) {
    bonus = CLEAR_BONUS * es.difficulty.scoreMod;
  }
  const cobraMod = state.gameMode === GameMode.Cobra ? COBRA_SCORE_MOD : 1;
  const points = SCORE_INCREMENT * es.difficulty.scoreMod * cobraMod + bonus
  stats.applesEatenThisLevel += 1;
  stats.numApplesEverEaten += 1;
  addPoints(ctx, points);
  renderScoreUI();
}

export function incrementPreyBonus(ctx: Context, preyType: PreyType, coord: number) {
  const { state, stats, pointsAnim, renderScoreUI } = ctx;
  if (state.isGameWon) return;
  if (state.isLost) return;
  let points = 0;
  let image: SpritesheetImage | null = null;
  let rarity: PickupRarity = PickupRarity.None;
  const x = Math.floor(coord % GRIDCOUNT_X);
  const y = Math.floor(coord / GRIDCOUNT_X);
  switch (preyType) {
    case PreyType.Ant:
    case PreyType.Grub:
      points = PICKUP_EPIC_BONUS;
      image = Image.Points2000;
      rarity = PickupRarity.Epic;
      break;
    case PreyType.Grasshopper:
      points = PICKUP_LEGENDARY_BONUS;
      image = Image.Points5000;
      rarity = PickupRarity.Legendary;
      break;
    case PreyType.FieldMouse:
      points = PICKUP_GALACTIC_BONUS;
      image = Image.Points10000;
      rarity = PickupRarity.Galactic;
      break;
    default:
      break;
  }
  if (image) {
    const lifetime = ANIMATIONS[image].frames * ANIMATIONS[image].timePerFrame;
    pointsAnim.add(x, y, lifetime, image, rarity);
  }
  stats.applesEatenThisLevel += 1;
  stats.numApplesEverEaten += 1;
  addPoints(ctx, points);
  renderScoreUI();
}

export function incrementPickupBonus(ctx: Context, pickupType: PickupType, coord: number) {
  const { state, pointsAnim, renderScoreUI } = ctx;
  if (state.isGameWon) return;
  if (state.isLost) return;
  let points = 0;
  let image: SpritesheetImage | null = null;
  let rarity: PickupRarity = PickupRarity.None;
  const x = Math.floor(coord % GRIDCOUNT_X);
  const y = Math.floor(coord / GRIDCOUNT_X);
  if (pickupType === PickupType.Invincibility) {
    points = PICKUP_INVINCIBILITY_BONUS;
    image = Image.Points1000;
    rarity = PickupRarity.Rare;
  } else if (pickupType === PickupType.Armor) {
    points = PICKUP_INVINCIBILITY_BONUS;
    image = Image.Points1000;
    rarity = PickupRarity.Rare;
  } else if (pickupType === PickupType.HealthPack) {
    points = PICKUP_INVINCIBILITY_BONUS;
    image = Image.Points1000;
    rarity = PickupRarity.Rare;
  } else if (pickupType === PickupType.Reversibility) {
    points = PICKUP_INVINCIBILITY_BONUS;
    image = Image.Points1000;
    rarity = PickupRarity.Rare;
  } else if (PICKUP_COMMON_ITEMS.includes(pickupType)) {
    points = PICKUP_COMMON_BONUS;
    image = Image.Points500;
    rarity = PickupRarity.Common;
  } else if (PICKUP_RARE_ITEMS.includes(pickupType)) {
    points = PICKUP_RARE_BONUS;
    image = Image.Points1000;
    rarity = PickupRarity.Rare;
  } else if (PICKUP_EPIC_ITEMS.includes(pickupType)) {
    points = PICKUP_EPIC_BONUS;
    image = Image.Points2000;
    rarity = PickupRarity.Epic;
  } else if (PICKUP_LEGENDARY_ITEMS.includes(pickupType)) {
    points = PICKUP_LEGENDARY_BONUS;
    image = Image.Points5000;
    rarity = PickupRarity.Legendary;
  }
  if (image) {
    const lifetime = ANIMATIONS[image].frames * ANIMATIONS[image].timePerFrame;
    pointsAnim.add(x, y, lifetime, image, rarity);
  }
  addPoints(ctx, points);
  renderScoreUI();
}

export function acquireHealth(ctx: Context) {
  const { state, renderHeartsUI, playSound } = ctx;
  if (!state.isGameStarted) return;
  if (state.isLost) return;
  if (state.isGameWon) return;
  if (state.isExitingLevel) return;
  if (state.isExited) return;
  playSound(Sound.acquireHealth, 0.35);
  state.lives = Math.min(state.lives + 1, MAX_LIVES);
  renderHeartsUI();
}

export function acquireInvincibility(ctx: Context) {
  const { state, replay, renderHeartsUI, startAction } = ctx;
  if (replay.mode === ReplayMode.Playback) return;
  if (!state.isGameStarted) return;
  if (state.isLost) return;
  if (state.isGameWon) return;
  if (state.isExitingLevel) return;
  if (state.isExited) return;
  startAction(invincibilityRoutine(ctx), Action.Invincibility);
  // state.lives = Math.min(state.lives + 1, MAX_LIVES);
  renderHeartsUI();
}

function* invincibilityRoutine(ctx: Context): IEnumerator {
  const { es, state, sfx, drawState, loopState, renderer, coroutines, musicPlayer, playSound, startScreenShake } = ctx;
  sfx.stop(Sound.invincibleLoop);
  playSound(Sound.pickupInvincibility);
  musicPlayer.setPlaybackRate(es.level.musicTrack, 0);
  musicPlayer.setVolume(0);
  state.timeSinceInvincibleStart = 0;
  state.isInvertedColors = true;
  drawState.shouldDrawApples = true;
  drawState.shouldDrawKeysLocks = true;
  loopState.timeScale = 0;
  startScreenShake(2, 0, 0.8);
  renderer.invalidateStaticCache();
  yield* coroutines.waitForTime(INVINCIBILITY_PICKUP_FREEZE_MS);
  state.isInvertedColors = false;
  drawState.shouldDrawApples = true;
  drawState.shouldDrawKeysLocks = true;
  loopState.timeScale = 1;
  startScreenShake(0, 1);
  renderer.invalidateStaticCache();
  yield* coroutines.waitForTime(300);
  sfx.playLoop(Sound.invincibleLoop, 0.55 * settings.musicVolume);
  while (state.timeSinceInvincibleStart < es.difficulty.invincibilityTime) {
    yield null;
  }
  sfx.stop(Sound.invincibleLoop);
  musicPlayer.setPlaybackRate(es.level.musicTrack, 1);
  musicPlayer.setVolume(1);
  if (state.isRewinding) {
    stopRewinding(ctx);
  }
}

export function acquireReversibility(ctx: Context) {
  const { state, replay, heldItems, playSound } = ctx;
  if (replay.mode === ReplayMode.Playback) return;
  if (!state.isGameStarted) return;
  if (state.isLost) return;
  if (state.isGameWon) return;
  if (state.isExitingLevel) return;
  if (state.isExited) return;
  heldItems.reversibles += 1;
  playSound(Sound.pickup, 0.35);
}

export function acquireArmor(ctx: Context) {
  const { state, replay, heldItems, startAction } = ctx;
  if (replay.mode === ReplayMode.Playback) return;
  if (!state.isGameStarted) return;
  if (state.isLost) return;
  if (state.isGameWon) return;
  if (state.isExitingLevel) return;
  if (state.isExited) return;
  heldItems.armor += 1;
  state.timeSinceArmorPickup = 0;
  state.currentSpeed = 1;
  startAction(armorRoutine(ctx), Action.AcquireArmor);
}

function* armorRoutine(ctx: Context): IEnumerator {
  const { es, state, sfx, drawState, loopState, renderer, coroutines, musicPlayer, playSound, startScreenShake } = ctx;
  playSound(Sound.acquireShield, 0.2);
  sfx.stop(Sound.invincibleLoop);
  musicPlayer.setPlaybackRate(es.level.musicTrack, 0);
  musicPlayer.setVolume(0);
  state.isInvertedColors = true;
  drawState.shouldDrawActionFG = true;
  loopState.timeScale = 0;
  startScreenShake(2, 0, 0.8);
  renderer.invalidateStaticCache();
  yield* coroutines.waitForTime(ARMOR_PICKUP_FREEZE_MS);
  state.isInvertedColors = false;
  drawState.shouldDrawApples = true;
  drawState.shouldDrawKeysLocks = true;
  loopState.timeScale = 1;
  startScreenShake(0, 1);
  renderer.invalidateStaticCache();
  musicPlayer.setPlaybackRate(es.level.musicTrack, 1);
  musicPlayer.setVolume(1);
}

export function acquireWeightLoss(ctx: Context) {
  const { state, playSound, startAction } = ctx;
  if (!state.isGameStarted) return;
  if (state.isLost) return;
  if (state.isGameWon) return;
  if (state.isExitingLevel) return;
  if (state.isExited) return;
  state.currentSpeed = 1;
  // TODO: add uniq sound
  playSound(Sound.pickup, 0.35);
  startAction(weightLossRoutine(ctx), Action.WeightLoss);
}

function* weightLossRoutine(ctx: Context): IEnumerator {
  const { segments, loopState, impactParticleSystem, coroutines, playSound, startScreenShake } = ctx;
  const targetNumSegments = Math.max(Math.floor(segments.length * 0.7), START_SNAKE_SIZE);
  loopState.timeScale = 0;
  startScreenShake(0.5, -20, 0.8);
  while (segments.length > targetNumSegments) {
    playSound(Sound.waterSplash);
    const vec = segments.get(segments.length - 1);
    impactParticleSystem.emit(vec.x, vec.y);
    segments.remove(segments.length - 1);
    yield* coroutines.waitForTime(50);
  }
  loopState.timeScale = 1;
  startScreenShake(0, 1);
}

export function openDoors(ctx: Context) {
  const { state, startAction, actionRunning } = ctx;
  if (state.isDoorsOpen) return;
  if (actionRunning(Action.OpenDoors)) return;
  startAction(openDoorsRoutine(ctx), Action.OpenDoors);
}

function* openDoorsRoutine(ctx: Context) {
  const { es, state, astar, doorsOpening, threats, drawState, loopState, renderer, coroutines, playSound, startScreenShake, startExitParticles } = ctx;
  loopState.timeScale = 0;
  let didRemoveAnyBarrier = false;
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    if (es.barriersMap[coord] && es.annotations[coord] === MapAnnotation.Exit) {
      didRemoveAnyBarrier = true;
      removeBarrierTile(ctx, coord);
      playSound(Sound.xpound);
      startScreenShake(2, 0, 0.8);
      yield* coroutines.waitForTime(66);
    }
  }
  if (didRemoveAnyBarrier) {
    state.currentSpeed = 0;
    yield* coroutines.waitForTime(140);
  }
  state.isDoorsOpen = true;
  loopState.timeScale = 1;
  playSound(Sound.doorOpen);
  const lifetime = ANIMATIONS[Image.DoorOpenSheet].frames * ANIMATIONS[Image.DoorOpenSheet].timePerFrame;
  es.doors.forEach(door => {
    astar.removeWall(door.x, door.y);
    const x = door.x;
    const y = door.y;
    doorsOpening.add(x, y, lifetime, Image.DoorOpenSheet);
  });
  startExitParticles();
  es.doors = [];
  es.doorsMap = {};
  renderer.invalidateStaticCache();
  drawState.shouldDrawKeysLocks = true;
  recalculateLasersMap(es, threats);
}

export function applyArmorProtection(ctx: Context): void {
  const { heldItems, state, playSound } = ctx;
  if (heldItems.armor <= 0) return;
  state.timeSinceArmorProtection = 0;
  state.lungeStepsRemaining = 0;
  heldItems.armor -= 1;
  playSound(Sound.hurtSave);
}

export function applyMortalRuin(ctx: Context) {
  const { es, player, segments } = ctx;
  // decapitate snek
  if (es.snekDamage[getCoordIndex(player.position)] === DamageType.SawCut) {
    for (let i = segments.length - 1; i > 0; i--) {
      segments.get(i).set(segments.get(i - 1));
    }
    segments.get(0).set(player.position);
    player.position.add(dirToUnitVector(player.direction));
    es.snekDamage[getCoordIndex(player.position)] = DamageType.MortalRuin;
    es.snekDamage[getCoordIndex(segments.get(0))] = DamageType.MortalRuin;
    es.snekDamage[getCoordIndex(segments.get(1))] = DamageType.MortalRuin;
    es.illuminationMap[getCoordIndex(player.position)] = 1;
  }
  // carnage lay in the wake of snek
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    if (!segments.existsAtCoord(coord)) {
      continue;
    }
    if (es.snekDamage[coord] === DamageType.SawCut || es.snekDamage[coord] === DamageType.Explosive) {
      const idx = segments.getIndexAtCoord(coord);
      if (idx > 0) { es.snekDamage[getCoordIndex(segments.get(idx - 1))] = DamageType.MortalRuin; }
      if (idx === 0 || idx === segments.length - 1) { es.snekDamage[coord] = DamageType.MortalRuin; }
      else if (idx >= 1) { es.snekDamage[coord] = DamageType.MortalRuinHide; }
      if (idx < segments.length - 1) { es.snekDamage[getCoordIndex(segments.get(idx + 1))] = DamageType.MortalRuin; }
    }
  }
}

export function removeBarrierTile(ctx: Context, coord: number) {
  const { es, astar, threats, explosions, renderer } = ctx;
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  const barrierIdx = es.barriers.findIndex(barrier => getCoordIndex(barrier.vec) === coord);
  es.barriers = removeArrayElement(es.barriers, barrierIdx);
  es.barriersMap[coord] = BarrierType.Unset;
  astar.removeWall(x, y);
  renderer.invalidateStaticCache();
  const lifetime = ANIMATIONS[Image.ExplosionSheet].frames * ANIMATIONS[Image.ExplosionSheet].timePerFrame;
  explosions.add(x, y, lifetime, Image.ExplosionSheet, ExplosionType.Small);
  recalculateLasersMap(es, threats);
}