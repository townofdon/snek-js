import P5 from "p5";
import { VectorList } from "@/collections/vectorList";
import {
  DrawState,
  EngineState,
  GameMode,
  GameState,
  ItemDropType,
  PickupType,
  PlayerState,
  PreyType,
  Replay,
  ReplayMode,
  Stats,
  Image,
  Sound,
  IEnumerator,
  PreySpawn,
  PickupRarity,
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
  PICKUP_SPAWN_SFX_DELAY,
  PICKUP_TYPE_RARITY_MAP,
  PITY_INCREMENT,
  PREY_SPAWN_WAIT_TIME_MAX,
  PREY_SPAWN_WAIT_TIME_MIN,
  RARITY_COMMON,
  RARITY_EPIC,
  RARITY_LEGENDARY,
} from "@/constants";
import { AnimationList } from "@/collections/animationList";
import { AppleList } from "@/collections/appleList";
import {
  clamp,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  getDropLikelihood,
  getLevelProgress,
  getManhattanDistance,
  lerp,
} from "@/utils";
import { DEFAULT_PICKUP_TYPES } from "@/defaults";
import { Coroutines } from "../coroutines";
import { PreyList } from "@/collections/preyList";
import { Easing } from "@/easing";

interface EngineSpawningArgs {
  p5: P5,
  state: GameState,
  es: EngineState,
  drawState: DrawState,
  player: PlayerState,
  segments: VectorList,
  replay: Replay,
  stats: Stats,
  coroutines: Coroutines,
  preySpawn: PreySpawn,
  apples: AppleList,
  mines: AnimationList,
  preyList: PreyList,
  shieldSpawns: AnimationList,
  pickupOutlines: AnimationList,
  openDoors: () => void,
  playSound: (sound: Sound, volume?: number, force?: boolean) => void,
  explodeMine: (x: number, y: number) => void,
}

export function engineSpawning({
  p5,
  state,
  es,
  drawState,
  player,
  segments,
  replay,
  stats,
  coroutines,
  preySpawn,
  apples,
  mines,
  preyList,
  shieldSpawns,
  pickupOutlines,
  openDoors,
  playSound,
  explodeMine,
}: EngineSpawningArgs) {
  function spawnApple(numTries = 0) {
    drawState.shouldDrawApples = true;
    if (es.level.disableAppleSpawn) return;
    if (replay.mode === ReplayMode.Playback) {
      addAppleReplayMode();
      return;
    }
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || es.pickupsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y);
    if (spawnedInsideOfSomething) {
      if (numTries < 30) spawnApple(numTries + 1);
      return;
    }
    apples.add(x, y);
    if (replay.mode === ReplayMode.Capture) {
      replay.applesToSpawn.push([x, y]);
      return;
    }
    let spawned = false;
    if (maybeSpawnInvincibilityPickup()) { spawned = true; }
    if (!spawned && maybeSpawnHealthPickup()) { spawned = true; }
    if (!spawned && maybeSpawnWeightLossPickup()) { spawned = true; }
    if (maybeSpawnMine()) { spawned = true; }
    if (maybeSpawnArmor()) { spawned = true; }
    if (!spawned && maybeSpawnOtherPickup(x, y)) { spawned = true; }
    if (!spawned) {
      state.pity = lerp(state.pity, 1, PITY_INCREMENT);
      state.pity = clamp(state.pity, 0, 1);
    }
    maybeSpawnPrey();
  }

  function addAppleReplayMode() {
    drawState.shouldDrawApples = true;
    const appleToSpawn = replay.applesToSpawn.shift();
    if (appleToSpawn && appleToSpawn.length === 2) {
      apples.add(appleToSpawn[0], appleToSpawn[1]);
    } else {
      // likely ran out of apples to spawn due to changes to level settings since time of clip recording, e.g. applesToClear; just open the doors as a quickfix
      openDoors();
    }
  }

  function maybeSpawnMine() {
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
    spawnMine()
    return true;
  }

  function maybeSpawnInvincibilityPickup(): boolean {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (state.timeSinceSpawnedPickup < PICKUP_SPAWN_COOLDOWN) return false;
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
    spawnInvincibilityPickup()
    return true;
  }

  function maybeSpawnHealthPickup(): boolean {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (state.timeSinceSpawnedPickup < PICKUP_SPAWN_COOLDOWN / 4) return false;
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
    const coord = chooseSpawnLocation();
    if (coord < 0) {
      return false
    }
    spawnHealthPickup(getCoordX(coord), getCoordY(coord));
    return true;
  }

  function maybeSpawnWeightLossPickup(): boolean {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (state.timeSinceSpawnedPickup < PICKUP_SPAWN_COOLDOWN / 2) return false;
    if (segments.length < 10) return false;

    const frameLikelihood = es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.type === ItemDropType.WeightLossPill
      ? es.level.pickupDropsByFrame?.[stats.applesEatenThisLevel]?.likelihood
      : undefined
    const baseLikelihood = getDropLikelihood(
      es.level.pickupDrops?.[ItemDropType.WeightLossPill] ?? true,
      DROP_LIKELIHOOD_WEIGHTLOSSPILL,
      es.difficulty.index
    ) * lerp(0, 1, Easing.inQuad(segments.length / 200));
    const likelihood = frameLikelihood ?? baseLikelihood;
    const r = Math.random() + likelihood;
    if (r < 1) {
      return false;
    }
    const coord = chooseSpawnLocation();
    if (coord < 0) {
      return false
    }
    spawnWeightLossPickup(getCoordX(coord), getCoordY(coord));
    return true;
  }

  function maybeSpawnArmor(): boolean {
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
    const coord = chooseSpawnLocation();
    if (coord < 0) {
      return false
    }
    spawnArmorPickup(getCoordX(coord), getCoordY(coord));
    return true;
  }

  function maybeSpawnOtherPickup(x: number, y: number): boolean {
    if (es.level.disableAppleSpawn) return false;
    if (replay.mode === ReplayMode.Playback) return false;
    if (stats.applesEatenThisLevel === 0) return false;
    if (es.pickupsMap[getCoordIndex2(x, y)]) return false;
    if (!apples.existsAt(x, y)) return false;
    if (segments.existsAt(x, y)) return false;
    if (Math.random() > BASE_PICKUP_RARITY) return false;

    const pool: PickupType[] = (es.level.pickupTypes ?? DEFAULT_PICKUP_TYPES).filter(pickupType => PICKUP_TYPE_RARITY_MAP[pickupType] > 0);
    const weights: number[] = pool.map(pickupType => lerp(PICKUP_TYPE_RARITY_MAP[pickupType], RARITY_COMMON, state.pity));
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
    es.pickupsMap[getCoordIndex2(x, y)] = {
      lifetime: 999999999999,
      type: pickup,
    };
    // adjust pity system
    const rarity = PICKUP_TYPE_RARITY_MAP[pickup];
    let rarityType = PickupRarity.None;
    if (rarity === RARITY_LEGENDARY) {
      state.pity = 0;
      rarityType = PickupRarity.Legendary;
    } else if (rarity === RARITY_EPIC) {
      state.pity *= 0.5;
      rarityType = PickupRarity.Epic;
    } else if (rarity === RARITY_COMMON) {
      state.pity = lerp(state.pity, 1, PITY_INCREMENT);
    }
    state.pity = clamp(state.pity, 0, 1);
    // spawn pickup outline
    if (rarityType) {
      const { frames, timePerFrame} = ANIMATIONS[Image.PickupOutlineBlueSheet];
      pickupOutlines.add(x, y, 999999999999, frames, timePerFrame, rarityType);
    }
    return true;
  }

  function chooseSpawnLocation(initialCoord = -1): number {
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
      const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
        || es.doorsMap[getCoordIndex2(x, y)]
        || es.nospawnsMap[getCoordIndex2(x, y)]
        || es.pickupsMap[getCoordIndex2(x, y)]
        || mines.existsAt(x, y)
        || apples.existsAt(x, y)
        || segments.containsCoord(getCoordIndex2(x, y))
        || player.position.equals(x, y);
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

  function spawnHealthPickup(x: number, y: number) {
    if (!apples.existsAt(x, y)) apples.add(x, y);
    es.pickupsMap[getCoordIndex2(x, y)] = {
      lifetime: PICKUP_LIFETIME_MS,
      type: PickupType.HealthPack,
    };
    state.timeSinceSpawnedPickup = 0;
    drawState.shouldDrawApples = true;
    setTimeout(() => playSound(Sound.spawnPickup, 0.45), PICKUP_SPAWN_SFX_DELAY);
    if (mines.existsAt(x, y)) {
      explodeMine(x, y);
    }
  }

  function spawnWeightLossPickup(x: number, y: number) {
    if (!apples.existsAt(x, y)) apples.add(x, y);
    es.pickupsMap[getCoordIndex2(x, y)] = {
      lifetime: PICKUP_LIFETIME_MS,
      type: PickupType.WeightLossPill,
    };
    state.timeSinceSpawnedPickup = 0;
    drawState.shouldDrawApples = true;
    setTimeout(() => playSound(Sound.spawnPickup, 0.45), PICKUP_SPAWN_SFX_DELAY);
    if (mines.existsAt(x, y)) {
      explodeMine(x, y);
    }
  }

  function spawnArmorPickup(x: number, y: number) {
    const { frames, timePerFrame } = ANIMATIONS[Image.ShieldSpawn];
    shieldSpawns.add(x, y, frames * timePerFrame, frames, timePerFrame);
    es.pickupsMap[getCoordIndex2(x, y)] = {
      lifetime: frames * timePerFrame,
      type: PickupType.Armor,
    };
    setTimeout(() => playSound(Sound.shieldSpawn, 0.45), PICKUP_SPAWN_SFX_DELAY);
    if (mines.existsAt(x, y)) {
      explodeMine(x, y);
    }
  }

  function spawnMine(numTries = 0) {
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || es.pickupsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y)
      || apples.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y);
    const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 5;
    if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
      if (numTries < 30) spawnMine(numTries + 1);
    } else {
      const { frames, timePerFrame } = ANIMATIONS[Image.MineSheet];
      mines.add(x, y, PICKUP_LIFETIME_MS, frames, timePerFrame);
    }
  }

  function spawnInvincibilityPickup(numTries = 0) {
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || es.pickupsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y);
    const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 20;
    if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
      if (numTries < 30) spawnInvincibilityPickup(numTries + 1);
    } else {
      if (!apples.existsAt(x, y)) apples.add(x, y);
      setTimeout(() => playSound(Sound.shieldSpawn, 0.45), PICKUP_SPAWN_SFX_DELAY);
      es.pickupsMap[getCoordIndex2(x, y)] = {
        lifetime: INVINCIBILITY_PICKUP_LIFETIME_MS,
        type: PickupType.Invincibility,
      };
      state.timeSinceSpawnedPickup = 0;
    }
  }

  function maybeSpawnPrey() {
    const preyType = preySpawn.dropsByFrame?.[stats.applesEatenThisLevel];
    if (!preyType) {
      return;
    }
    spawnPrey(preyType, 0);
  }
  const spawnPrey = (preyType: PreyType, numTries: number) => {
    const x = Math.floor(p5.random(GRIDCOUNT_X - 2)) + 1;
    const y = Math.floor(p5.random(GRIDCOUNT_Y - 2)) + 1;
    const spawnedInsideOfSomething = es.barriersMap[getCoordIndex2(x, y)]
      || es.doorsMap[getCoordIndex2(x, y)]
      || es.nospawnsMap[getCoordIndex2(x, y)]
      || mines.existsAt(x, y)
      || segments.containsCoord(getCoordIndex2(x, y))
      || player.position.equals(x, y);
    const spawnedTooCloseToPlayer = getManhattanDistance(x, y, player.position.x, player.position.y) < 20;
    if (spawnedInsideOfSomething || spawnedTooCloseToPlayer) {
      if (numTries < 30) spawnPrey(preyType, numTries + 1);
    } else {
      coroutines.start(spawnPreyRoutine(preyType, getCoordIndex2(x, y)));
    }
  }
  function* spawnPreyRoutine(preyType: PreyType, coord: number): IEnumerator {
    yield* coroutines.waitForTime(lerp(PREY_SPAWN_WAIT_TIME_MIN, PREY_SPAWN_WAIT_TIME_MAX, Math.random()));
    const x = Math.floor(coord % GRIDCOUNT_X);
    const y = Math.floor(coord / GRIDCOUNT_X);
    preyList.add(x, y, preyType);
  }

  return {
    spawnApple,
    spawnArmorPickup,
    chooseSpawnLocation,
  };
}
