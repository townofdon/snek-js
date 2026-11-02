import {
  GameMode,
  ItemDropType,
  PickupType,
  PreyType,
  ReplayMode,
  Image,
  Sound,
  IEnumerator,
  PickupRarity,
  ThreatType,
  SpritesheetRange,
  ThreatFlag,
  RemovalReason,
  ExplosionType,
  SmokeType,
  AddAnimationListItemOptions,
} from "@/types";
import {
  ANIMATIONS,
  BASE_PICKUP_RARITY,
  DROP_LIKELIHOOD_ARMOR,
  DROP_LIKELIHOOD_HEALTHPACK,
  DROP_LIKELIHOOD_INVINCIBILITY,
  DROP_LIKELIHOOD_MINE,
  DROP_LIKELIHOOD_WEIGHTLOSSPILL,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  INVINCIBILITY_PICKUP_LIFETIME_MS,
  MAX_LIVES,
  PICKUP_LIFETIME_MS,
  PICKUP_SPAWN_COOLDOWN,
  PICKUP_INVINCIBILITY_SPAWN_COOLDOWN,
  PICKUP_WEIGHTLOSSPILL_SPAWN_COOLDOWN,
  PICKUP_SPAWN_SFX_DELAY,
  PICKUP_TYPE_RARITY_MAP,
  PITY_INCREMENT,
  PREY_SPAWN_WAIT_TIME_MAX,
  PREY_SPAWN_WAIT_TIME_MIN,
  RARITY_COMMON,
  RARITY_EPIC,
  RARITY_LEGENDARY,
  BARREL_WARN_LIFETIME,
  LASER_WARN_LIFETIME,
  PICKUP_LEGENDARY_ITEMS,
  PICKUP_MEAT_ITEMS,
  SMOKE_LIFETIME,
} from "@/constants";
import {
  clamp,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  getDropLikelihood,
  getLevelProgress,
  getManhattanDistance,
  getPickupLifetime,
  lerp,
} from "@/utils";
import { DEFAULT_PICKUP_TYPES } from "@/defaults";
import { Easing } from "@/easing";
import { Context } from "./context";
import { openDoors } from "./mutations";

export function spawnApple(ctx: Context, numTries = 0) {
  const { p5, es, state, drawState, replay, apples, threats } = ctx;
  drawState.shouldDrawApples = true;
  if (es.level.disableAppleSpawn) return;
  if (replay.mode === ReplayMode.Playback) {
    addAppleReplayMode(ctx);
    return;
  }
  const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
  const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
  const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
    || es.doorsMap[getCoordIndex2(x, y)]
    || es.nospawnsMap[getCoordIndex2(x, y)]
    || es.pickupsMap[getCoordIndex2(x, y)]
    || es.lasersMap[getCoordIndex2(x, y)]
    || es.pipesMap[getCoordIndex2(x, y)]
    || es.flamesMap[getCoordIndex2(x, y)]
    || threats.existsAt(x, y);
  if (spawnedInsideOfSomething) {
    if (numTries < 30) spawnApple(ctx, numTries + 1);
    return;
  }
  apples.add(x, y);
  if (replay.mode === ReplayMode.Capture) {
    replay.applesToSpawn.push([x, y]);
    return;
  }
  let spawned = false;
  if (maybeSpawnInvincibilityPickup(ctx)) { spawned = true; }
  if (!spawned && maybeSpawnHealthPickup(ctx)) { spawned = true; }
  if (!spawned && maybeSpawnWeightLossPickup(ctx)) { spawned = true; }
  if (maybeSpawnMine(ctx)) { spawned = true; }
  if (!spawned && maybeSpawnBomb(ctx)) { spawned = true; }
  if (maybeSpawnArmor(ctx)) { spawned = true; }
  if (!spawned && maybeSpawnOtherPickup(ctx, x, y)) { spawned = true; }
  if (!spawned) {
    state.pity = lerp(state.pity, 1, PITY_INCREMENT);
    state.pity = clamp(state.pity, 0, 1);
  }
  maybeSpawnPrey(ctx);
}

export function spawnRegularApple(ctx: Context): number {
  const { replay, apples } = ctx;
  if (replay.mode === ReplayMode.Playback) {
    return -1;
  }
  const coord = chooseSpawnLocation(ctx);
  if (coord < 0) {
    return -1;
  }
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  apples.add(x, y);
  return coord;
}

function addAppleReplayMode(ctx: Context) {
  const { drawState, replay, apples } = ctx;
  drawState.shouldDrawApples = true;
  const appleToSpawn = replay.applesToSpawn.shift();
  if (appleToSpawn && appleToSpawn.length === 2) {
    apples.add(appleToSpawn[0], appleToSpawn[1]);
  } else {
    // likely ran out of apples to spawn due to changes to level settings since time of clip recording, e.g. applesToClear; just open the doors as a quickfix
    openDoors(ctx);
  }
}

function maybeSpawnMine(ctx: Context) {
  const { es, state, stats, replay } = ctx;
  if (es.level.disableAppleSpawn) return false;
  if (replay.mode === ReplayMode.Playback) return false;
  if (stats.applesEatenThisLevel === 0) return false;
  if (!es.level.pickupDropsByFrame && !es.level.pickupDrops?.[ItemDropType.Mine] && state.gameMode !== GameMode.Cobra) return false;

  const progress = getLevelProgress(stats, es.level, es.difficulty);
  const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.Mine
    ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
    : undefined
  const shouldSpawnDefault = state.gameMode === GameMode.Cobra;
  const baseLikelihood = getDropLikelihood(
    es.level.pickupDrops?.[ItemDropType.Mine] ?? shouldSpawnDefault,
    DROP_LIKELIHOOD_MINE,
    es.difficulty.index
  ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
  const likelihood = frameLikelihood ?? baseLikelihood;
  const r = Math.random() + likelihood;
  if (r < 1) {
    return false;
  }
  spawnThreat(ctx, ThreatType.Mine);
  return true;
}

function maybeSpawnBomb(ctx: Context) {
  const { es, state, stats, replay } = ctx;
  if (es.level.disableAppleSpawn) return false;
  if (replay.mode === ReplayMode.Playback) return false;
  if (stats.applesEatenThisLevel === 0) return false;
  if (!es.level.pickupDropsByFrame && !es.level.pickupDrops?.[ItemDropType.Bomb] && state.gameMode !== GameMode.Cobra) return false;

  const progress = getLevelProgress(stats, es.level, es.difficulty);
  const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.Bomb
    ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
    : undefined
  const shouldSpawnDefault = state.gameMode === GameMode.Cobra;
  const baseLikelihood = getDropLikelihood(
    es.level.pickupDrops?.[ItemDropType.Bomb] ?? shouldSpawnDefault,
    DROP_LIKELIHOOD_MINE,
    es.difficulty.index
  ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
  const likelihood = frameLikelihood ?? baseLikelihood;
  const r = Math.random() + likelihood;
  if (r < 1) {
    return false;
  }
  spawnThreat(ctx, ThreatType.Bomb);
  return true;
}

function maybeSpawnInvincibilityPickup(ctx: Context): boolean {
  const { es, state, stats, replay } = ctx;
  if (es.level.disableAppleSpawn) return false;
  if (replay.mode === ReplayMode.Playback) return false;
  if (stats.applesEatenThisLevel === 0) return false;
  if (state.timeSinceSpawnedAnyPickup < PICKUP_INVINCIBILITY_SPAWN_COOLDOWN) return false;
  if (!es.level.pickupDropsByFrame && !es.level.pickupDrops?.[ItemDropType.Invincibility]) return false;

  const type = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type || ItemDropType.Invincibility;
  if (type !== ItemDropType.Invincibility) {
    return false;
  }
  const progress = getLevelProgress(stats, es.level, es.difficulty);
  const baseLikelihood = getDropLikelihood(
    es.level.pickupDrops?.[ItemDropType.Invincibility] ?? true,
    DROP_LIKELIHOOD_INVINCIBILITY,
    es.difficulty.index
  ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
  const likelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood || baseLikelihood;
  const r = Math.random() + likelihood;
  if (r < 1) {
    return false;
  }
  spawnInvincibilityPickup(ctx)
  return true;
}

function maybeSpawnHealthPickup(ctx: Context): boolean {
  const { es, state, stats, replay } = ctx;
  if (es.level.disableAppleSpawn) return false;
  if (replay.mode === ReplayMode.Playback) return false;
  if (stats.applesEatenThisLevel === 0) return false;
  if (state.timeSinceSpawnedAnyPickup < PICKUP_SPAWN_COOLDOWN) return false;
  if (state.lives === MAX_LIVES) return false;

  const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.HealthPack
    ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
    : undefined
  const baseLikelihood = getDropLikelihood(
    es.level.pickupDrops?.[ItemDropType.HealthPack] ?? true,
    DROP_LIKELIHOOD_HEALTHPACK,
    es.difficulty.index
  ) * lerp(1, 0.2, state.lives / 2);
  const likelihood = frameLikelihood ?? baseLikelihood;
  const r = Math.random() + likelihood;
  if (r < 1) {
    return false;
  }
  const coord = chooseSpawnLocation(ctx);
  if (coord < 0) {
    return false
  }
  spawnHealthPickupAt(ctx, getCoordX(coord), getCoordY(coord));
  return true;
}

function maybeSpawnWeightLossPickup(ctx): boolean {
  const { es, state, stats, replay, segments } = ctx;
  if (es.level.disableAppleSpawn) return false;
  if (replay.mode === ReplayMode.Playback) return false;
  if (stats.applesEatenThisLevel === 0) return false;
  if (state.timeSinceSpawnedAnyPickup < PICKUP_SPAWN_COOLDOWN) return false;
  if (segments.length < 10) return false;

  const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.WeightLossPill
    ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
    : undefined
  const baseLikelihood = getDropLikelihood(
    es.level.pickupDrops?.[ItemDropType.WeightLossPill] ?? true,
    DROP_LIKELIHOOD_WEIGHTLOSSPILL,
    es.difficulty.index
  ) * Easing.inQuad(lerp(0, 1, segments.length / 200))
    * Easing.inCubic(lerp(0, 1, state.timeSinceSpawnedWeightLossPillPickup / PICKUP_WEIGHTLOSSPILL_SPAWN_COOLDOWN))
    * Easing.inCubic(lerp(1, 10, (segments.length - 200) / 200));
  const likelihood = frameLikelihood ?? baseLikelihood;
  const r = Math.random() + likelihood;
  if (r < 1) {
    return false;
  }
  const coord = chooseSpawnLocation(ctx);
  if (coord < 0) {
    return false
  }
  spawnWeightLossPickupAt(ctx, getCoordX(coord), getCoordY(coord));
  return true;
}

function maybeSpawnArmor(ctx: Context): boolean {
  const { es, stats, replay } = ctx;
  if (es.level.disableAppleSpawn) return false;
  if (replay.mode === ReplayMode.Playback) return false;
  if (stats.applesEatenThisLevel === 0) return false;
  if (!es.level.pickupDropsByFrame && !es.level.pickupDrops?.[ItemDropType.Armor]) return false;

  const progress = getLevelProgress(stats, es.level, es.difficulty);
  const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.Armor
    ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
    : undefined
  const baseLikelihood = getDropLikelihood(
    es.level.pickupDrops?.[ItemDropType.Armor] ?? false,
    DROP_LIKELIHOOD_ARMOR,
    es.difficulty.index
  ) * lerp(0.4, 1, progress * 1.25) * (stats.applesEatenThisLevel >= 10 ? 1 : 0)
  const likelihood = frameLikelihood ?? baseLikelihood;
  const r = Math.random() + likelihood;
  if (r < 1) {
    return false;
  }
  const coord = chooseSpawnLocation(ctx);
  if (coord < 0) {
    return false
  }
  spawnArmorPickup(ctx, getCoordX(coord), getCoordY(coord));
  return true;
}

function maybeSpawnOtherPickup(ctx: Context, x: number, y: number): boolean {
  const { es, state, stats, replay, apples, segments, pickupOutlines } = ctx;
  if (es.level.disableAppleSpawn) return false;
  if (replay.mode === ReplayMode.Playback) return false;
  if (stats.applesEatenThisLevel === 0) return false;
  if (es.pickupsMap[getCoordIndex2(x, y)]) return false;
  if (!apples.existsAt(x, y)) return false;
  if (segments.existsAt(x, y)) return false;
  if (Math.random() > BASE_PICKUP_RARITY) return false;

  const pool: PickupType[] = (es.level.pickupTypes ?? DEFAULT_PICKUP_TYPES).filter(pickupType => PICKUP_TYPE_RARITY_MAP[pickupType] > 0);
  const weights: number[] = pool.map(pickupType => lerp(PICKUP_TYPE_RARITY_MAP[pickupType], RARITY_COMMON, state.pity * 0.8));
  if (pool.length !== weights.length) throw new Error(`pool and weight lengths do not match: ${pool.length} vs ${weights.length}`);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const r = Math.random() * totalWeight;
  let sum = 0;
  let pickup = PickupType.None;
  for (let i = 0; i < pool.length; i++) {
    sum += weights[i];
    if (r <= sum) {
      pickup = pool[i];
      break;
    }
  }
  if (!pickup) {
    return false;
  }
  const rarity = PICKUP_TYPE_RARITY_MAP[pickup];
  // adjust pity system
  let rarityType = PickupRarity.None;
  if (rarity === RARITY_LEGENDARY) {
    state.pity = 0;
    rarityType = PickupRarity.Legendary;
  } else if (rarity === RARITY_EPIC) {
    state.pity = 0;
    rarityType = PickupRarity.Epic;
  } else if (rarity === RARITY_COMMON) {
    // state.pity = lerp(state.pity, 1, PITY_INCREMENT);
    state.pity += PITY_INCREMENT;
  }
  state.pity = clamp(state.pity, 0, 1);
  // spawn pickup
  const lifetime = getPickupLifetime(rarityType);
  es.pickupsMap[getCoordIndex2(x, y)] = {
    lifetime,
    type: pickup,
  };
  // spawn pickup outline
  if (rarityType) {
    pickupOutlines.add(x, y, lifetime, Image.PickupOutlineBlueSheet, rarityType);
  }
  return true;
}

export function spawnLegendaryItem(ctx: Context, x: number, y: number) {
  const { es, apples, pickupOutlines, playSound } = ctx;
  const idx = Math.floor(Math.random() * PICKUP_LEGENDARY_ITEMS.length);
  const lifetime = getPickupLifetime(PickupRarity.Legendary);
  es.pickupsMap[getCoordIndex2(x, y)] = {
    lifetime,
    type: PICKUP_LEGENDARY_ITEMS[idx],
  };
  pickupOutlines.add(x, y, lifetime, Image.PickupOutlineBlueSheet, PickupRarity.Legendary);
  if (!apples.existsAt(x, y)) {
    apples.add(x, y);
  }
  playSound(Sound.shieldSpawn, 0.45);
}

export function spawnMeatItem(ctx: Context, x: number, y: number) {
  const { es, apples, playSound } = ctx;
  const idx = Math.floor(Math.random() * PICKUP_MEAT_ITEMS.length);
  es.pickupsMap[getCoordIndex2(x, y)] = {
    lifetime: 999999999999,
    type: PICKUP_MEAT_ITEMS[idx],
  };
  if (!apples.existsAt(x, y)) {
    apples.add(x, y);
  }
  playSound(Sound.shieldSpawn, 0.45);
}

export function chooseSpawnLocation(ctx: Context, initialCoord = -1, predicate?: (coord: number) => boolean): number {
  const { es, player, segments, apples, threats } = ctx;
  if (initialCoord < 0) {
    initialCoord = getCoordIndex2(
      Math.floor(Math.random() * GRIDCOUNT_X - 2) + 1,
      Math.floor(Math.random() * GRIDCOUNT_Y - 2) + 1,
    );
  }
  const visited: Record<number, boolean> = {}
  const validCandidate = (x: number, y: number) => {
    return (
      !visited[getCoordIndex2(x, y)] &&
      x >= 0 &&
      y >= 0 &&
      x < GRIDCOUNT_X &&
      y < GRIDCOUNT_Y
    );
  }
  const candidateFound = (x: number, y: number) => {
    const spawnedInsideOfSomething = (
      es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || es.pickupsMap[getCoordIndex2(x, y)]
      || es.lasersMap[getCoordIndex2(x, y)]
      || es.pipesMap[getCoordIndex2(x, y)]
      || es.flamesMap[getCoordIndex2(x, y)]
      || threats.existsAt(x, y)
      || apples.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y)
      || !(predicate?.(getCoordIndex2(x, y)) ?? true)
    );
    return !spawnedInsideOfSomething;
  }
  const candidates = [initialCoord];
  while (candidates.length > 0) {
    const current = candidates.pop();
    visited[current] = true;
    const x = getCoordX(current);
    const y = getCoordY(current);
    if (candidateFound(x, y)) {
      return current;
    }
    if (validCandidate(x + 1, y)) {
      candidates.push(getCoordIndex2(x + 1, y));
    }
    if (validCandidate(x - 1, y)) {
      candidates.push(getCoordIndex2(x - 1, y));
    }
    if (validCandidate(x, y + 1)) {
      candidates.push(getCoordIndex2(x, y + 1));
    }
    if (validCandidate(x, y - 1)) {
      candidates.push(getCoordIndex2(x, y - 1));
    }
  }
  return -1;
}

export function spawnHealthPickup(ctx: Context, predicate?: (coord: number) => boolean) {
  const { p5, es, state, stats, replay, apples, threats } = ctx;
  const coord = chooseSpawnLocation(ctx, -1, predicate);
  if (coord < 0) -1;
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  spawnHealthPickupAt(ctx, x, y);
  return coord;
}

function spawnHealthPickupAt(ctx: Context, x: number, y: number) {
  const { es, state, drawState, apples, threats, playSound } = ctx;
  if (!apples.existsAt(x, y)) apples.add(x, y);
  es.pickupsMap[getCoordIndex2(x, y)] = {
    lifetime: PICKUP_LIFETIME_MS,
    type: PickupType.HealthPack,
  };
  state.timeSinceSpawnedAnyPickup = 0;
  drawState.shouldDrawApples = true;
  setTimeout(() => playSound(Sound.spawnPickup, 0.45), PICKUP_SPAWN_SFX_DELAY);
  if (threats.existsAt(x, y, ThreatType.Mine)) {
    threats.removeByCoord(getCoordIndex2(x, y), RemovalReason.Explode);
  }
}

export function spawnWeightLossPickup(ctx: Context, predicate?: (coord: number) => boolean) {
  const { p5, es, state, stats, replay, apples, threats } = ctx;
  const coord = chooseSpawnLocation(ctx, -1, predicate);
  if (coord < 0) -1;
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  spawnWeightLossPickupAt(ctx, x, y);
  return coord;
}

function spawnWeightLossPickupAt(ctx: Context, x: number, y: number) {
  const { es, state, drawState, apples, threats, playSound } = ctx;
  if (!apples.existsAt(x, y)) apples.add(x, y);
  es.pickupsMap[getCoordIndex2(x, y)] = {
    lifetime: PICKUP_LIFETIME_MS,
    type: PickupType.WeightLossPill,
  };
  state.timeSinceSpawnedAnyPickup = 0;
  state.timeSinceSpawnedWeightLossPillPickup = 0;
  drawState.shouldDrawApples = true;
  setTimeout(() => playSound(Sound.spawnPickup, 0.45), PICKUP_SPAWN_SFX_DELAY);
  if (threats.existsAt(x, y, ThreatType.Mine)) {
    threats.removeByCoord(getCoordIndex2(x, y), RemovalReason.Explode);
  }
}

export function spawnArmorPickup(ctx: Context, x: number, y: number) {
  const { es, threats, shieldSpawns, playSound } = ctx;
  const lifetime = ANIMATIONS[Image.ShieldSpawn].frames * ANIMATIONS[Image.ShieldSpawn].timePerFrame;
  shieldSpawns.add(x, y, lifetime, Image.ShieldSpawn);
  es.pickupsMap[getCoordIndex2(x, y)] = {
    // pickups up will be overridden in onShieldSpawnLifetimeExpire()
    lifetime: 99999999,
    type: PickupType.Armor,
  };
  setTimeout(() => playSound(Sound.shieldSpawn, 0.45), PICKUP_SPAWN_SFX_DELAY);
  if (threats.existsAt(x, y, ThreatType.Mine)) {
    threats.removeByCoord(getCoordIndex2(x, y), RemovalReason.Explode);
  }
}

export const spawnThreat: (ctx: Context, threatType: ThreatType, lifetime?: number, predicate?: (coord: number) => boolean) => number =
  function spawnThreatFn(ctx: Context, threatType: ThreatType, lifetime?: number, predicate?: (coord: number) => boolean, numTries = 0) {
  const { p5, es, player, segments, apples, threats, drawState } = ctx;
  const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
  const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
  const spawnedInsideOfSomething = (
    es.barriersMap[getCoordIndex2(x, y)]
    || es.doorsMap[getCoordIndex2(x, y)]
    || es.nospawnsMap[getCoordIndex2(x, y)]
    || es.pickupsMap[getCoordIndex2(x, y)]
    || es.lasersMap[getCoordIndex2(x, y)]
    || es.pipesMap[getCoordIndex2(x, y)]
    || es.flamesMap[getCoordIndex2(x, y)]
    || es.threatsMap[getCoordIndex2(x, y)]
    || threats.existsAt(x, y)
    || apples.existsAt(x, y)
    || segments.containsCoord(getCoordIndex2(x, y))
    || player.position.equals(x, y)
    || !(predicate?.(getCoordIndex2(x, y)) ?? true)
  );
  const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 5;
  if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
    if (numTries < 30) spawnThreatFn(ctx, threatType, lifetime, predicate, numTries + 1);
  } else {
    const opts: AddAnimationListItemOptions = { replaceExisting: true };
    switch (threatType) {
      case ThreatType.Mine:
        threats.add(x, y, lifetime ?? PICKUP_LIFETIME_MS, Image.MineSheet, ThreatType.Mine, opts);
        break;
      case ThreatType.Bomb:
        threats.add(x, y, lifetime ?? PICKUP_LIFETIME_MS, SpritesheetRange.Bomb, ThreatType.Bomb, opts);
        break;
      case ThreatType.LaserDiode:
        threats.add(x, y, lifetime ?? LASER_WARN_LIFETIME, SpritesheetRange.DiodeBlue, ThreatType.LaserDiode, opts);
        threats.addFlagAt(x, y, ThreatFlag.Activating);
        break;
      case ThreatType.ExplodableBarrel:
        threats.add(x, y, lifetime ?? BARREL_WARN_LIFETIME, SpritesheetRange.Barrel, ThreatType.ExplodableBarrel, opts);
        break;
      case ThreatType.ElectricCoil:
        threats.add(x, y, lifetime ?? PICKUP_LIFETIME_MS, SpritesheetRange.ElectricCoil, ThreatType.ElectricCoil, opts);
        break;
    }
    drawState.shouldDrawActionFG = true;
    return getCoordIndex2(x, y);
  }
  return -1;
}

export function spawnInvincibilityPickup(ctx: Context, predicate?: (coord: number) => boolean) {
  const { es, state, player, apples, playSound } = ctx;
  const coord = chooseSpawnLocation(ctx, -1, (pcoord => {
    const px = getCoordX(pcoord);
    const py = getCoordY(pcoord);
    const spawnedTooCloseToPlayer = getManhattanDistance(px, py, player.position.x, player.position.y) < 20;
    if (predicate) return !spawnedTooCloseToPlayer && predicate(pcoord);
    return !spawnedTooCloseToPlayer;
  }));
  if (coord < 0) -1;
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  if (!apples.existsAt(x, y)) apples.add(x, y);
  setTimeout(() => playSound(Sound.shieldSpawn, 0.45), PICKUP_SPAWN_SFX_DELAY);
  es.pickupsMap[coord] = {
    lifetime: INVINCIBILITY_PICKUP_LIFETIME_MS,
    type: PickupType.Invincibility,
  };
  state.timeSinceSpawnedAnyPickup = 0;
  return coord;
}

function maybeSpawnPrey(ctx: Context) {
  const { preySpawn, stats } = ctx;
  const preyType = preySpawn.dropsByFrame?.[stats.applesEatenThisLevel];
  if (!preyType) {
    return;
  }
  spawnPrey(ctx, preyType, 0);
}
const spawnPrey = (ctx: Context, preyType: PreyType, numTries: number) => {
  const { p5, es, player, segments, threats, coroutines } = ctx;
  const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
  const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
  const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
    || es.doorsMap[getCoordIndex2(x, y)]
    || es.nospawnsMap[getCoordIndex2(x, y)]
    || es.lasersMap[getCoordIndex2(x, y)]
    || es.pipesMap[getCoordIndex2(x, y)]
    || es.flamesMap[getCoordIndex2(x, y)]
    || threats.existsAt(x, y)
    || segments.containsCoord(getCoordIndex2(x, y))
    || player.position.equals(x, y);
  const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 20;
  if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
    if (numTries < 30) spawnPrey(ctx, preyType, numTries + 1);
  } else {
    coroutines.start(spawnPreyRoutine(ctx, preyType, getCoordIndex2(x, y)));
  }
}
function* spawnPreyRoutine(ctx: Context, preyType: PreyType, coord: number): IEnumerator {
  const { preyList, coroutines } = ctx;
  yield* coroutines.waitForTime(lerp(PREY_SPAWN_WAIT_TIME_MIN, PREY_SPAWN_WAIT_TIME_MAX, Math.random()));
  const x = Math.floor(coord % GRIDCOUNT_X);
  const y = Math.floor(coord / GRIDCOUNT_X);
  preyList.add(x, y, preyType);
}

export function spawnPuffAt(ctx: Context, x: number, y: number) {
  const { puffs } = ctx;
  const lifetime = ANIMATIONS[Image.PuffSheet].frames * ANIMATIONS[Image.PuffSheet].timePerFrame;
  puffs.add(x, y, lifetime, Image.PuffSheet);
}

export function spawnExplosionAt(ctx: Context, x: number, y: number) {
  const { explosions } = ctx;
  const lifetime = ANIMATIONS[Image.Explosion3Sheet].frames * ANIMATIONS[Image.Explosion3Sheet].timePerFrame;
  explosions.add(x, y, lifetime, Image.Explosion3Sheet, ExplosionType.Large, { replaceExisting: true });
  explosions.addFlagAt(x, y, ThreatFlag.NoDamage);
}

export function spawnSmokeAt(ctx: Context, x: number, y: number, type: SmokeType) {
  const { smoke } = ctx;
  if (type === SmokeType.Large) {
    const smokeLifetime = lerp(SMOKE_LIFETIME * 0.5, SMOKE_LIFETIME, Math.random());
    smoke.add(x, y, smokeLifetime, SpritesheetRange.BigSmokeActive, SmokeType.Large, { replaceExisting: true });
  } else if (type === SmokeType.LargeDissipate) {
    const { frames, timePerFrame } = ANIMATIONS[SpritesheetRange.BigSmokeActive];
    smoke.add(x, y, frames * timePerFrame, SpritesheetRange.BigSmokeOff, SmokeType.LargeDissipate);
  } {
    const smokeLifetime = lerp(SMOKE_LIFETIME * 0.5, SMOKE_LIFETIME, Math.random());
    smoke.add(x, y, smokeLifetime, Image.SmokeSheet, SmokeType.Small);
  }
}