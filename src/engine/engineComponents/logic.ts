import type { Vector } from "p5";
import { DamageType, DIR, GameMode, KeyChannel, ReplayMode, ThreatType } from "@/types";
import { HURT_STUN_TIME, LUNGE_STEPS, MAX_APPLES_TO_CLEAR, SPEED_LIMIT_ULTRA, START_SNAKE_SIZE } from "@/constants";
import { analyzeFloodFillTrappedResult, buildTrappedFloodGrid, dirToUnitVector, findPipeExit, floodFillTrapped, getCoordIndex, getLevelProgress, isBreakableBarrier } from "@/utils";
import { Context } from "./context";
import { settings } from "@/stores/SettingsStore";
import { getIsStartLevel } from "@/levels/levelUtils";

export const checkSwole = (ctx: Context) => getLevelProgress(ctx.stats, ctx.es.level, ctx.es.difficulty) > 0.45 || ctx.segments.length >= 50;

export const checkLunging = (ctx: Context) => ctx.state.lungeStepsRemaining > 0;

export const checkLungedRecently = (ctx: Context) => ctx.state.lungeStepsRemaining > 0 || ctx.state.timeSinceLungeStart < SPEED_LIMIT_ULTRA * (LUNGE_STEPS + 1);

export const checkInvincible = (ctx: Context) => ctx.state.timeSinceInvincibleStart < ctx.es.difficulty.invincibilityTime;

export const checkCanBreakWalls = (ctx: Context) => (checkLunging(ctx) && checkSwole(ctx)) || ctx.heldItems.armor > 0;

export const checkCanBreakWallsWithoutDamage = (ctx: Context) => checkCanBreakWalls(ctx) && (
  checkInvincible(ctx) || (checkLunging(ctx) && ctx.heldItems.armor > 0)
);

export const wallBreakableAt = (ctx: Context, coord: number) => !ctx.es.passablesMap[coord] && isBreakableBarrier(ctx.es.barriersMap[coord]);

export const canExplodeBarrelAt = (ctx: Context, coord: number) => checkLunging(ctx) && ctx.es.threatsMap[coord] === ThreatType.ExplodableBarrel;

export function getHasClearedLevel(ctx: Context) {
  const {
    es,
    state,
    stats,
  } = ctx;
  const applesMod = es.level.applesModOverride || es.difficulty.applesMod || 1;
  if (state.isGameWon) return false;
  if (settings.debug.easyExit && stats.applesEatenThisLevel > 0) return true;
  if (stats.applesEatenThisLevel >= es.level.applesToClear * applesMod) return true;
  if (state.timeElapsed >= es.level.timeToClear && stats.applesEatenThisLevel >= es.level.applesToClear * applesMod * 0.5) return true;
  if (stats.applesEatenThisLevel >= MAX_APPLES_TO_CLEAR) return true;
  return false;
}

export function checkRewindAllowed(ctx: Context, additionalConditions: boolean = false) {
  const { es, state, replay } = ctx;
  // Conditions for which rewind is always forbidden. These take precedence.
  if (replay.mode === ReplayMode.Playback) return false;
  if (state.isLost) return false;
  if (state.isGameWon) return false;
  if (state.timeSinceHurt < HURT_STUN_TIME) return false;
  if (state.lungeStepsRemaining > 0) return false;
  if (calculateSnakeSize(ctx) <= START_SNAKE_SIZE + 1) return false;
  // Conditions for which rewind is always allowed.
  if (state.gameMode === GameMode.Casual) return true;
  if (getIsStartLevel(es.level)) return true;
  // other conditions of varying scenarios
  if (additionalConditions) return true;
  return false;
}

export function calculateSnakeSize(ctx: Context): number {
  const { segments } = ctx;
  let size = 0;
  const uniquePositions: Record<number, boolean> = {};
  for (let i = 0; i < segments.length; i++) {
    if (!segments.get(i)) continue;
    if (!uniquePositions[getCoordIndex(segments.get(i))]) { size++; }
    uniquePositions[getCoordIndex(segments.get(i))] = true;
  }
  return size + 1;
}

export function checkCollision(ctx: Context, vec: Vector, checkBarricade = true): DamageType {
  const {
    es,
    state,
    player,
    segments,
  } = ctx;
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

export function isSnakeTrapped(ctx: Context) {
  const {
    es,
    state,
    player,
    segments,
  } = ctx;
  if (![DamageType.HitBarrier, DamageType.HitDoor, DamageType.HitSelf, DamageType.HitLock].includes(state.lastHurtBy)) return false;
  const hasHit = !!checkCollision(ctx, player.position);
  let trapped = true;
  let maxSegmentIndex = -1;
  const visited: Record<number, boolean> = {};
  const grid = buildTrappedFloodGrid((loc) => checkCollision(ctx, loc), segments, player.position);
  outer:
  for (let idx = 0; idx <= Math.min(3, segments.length - 2); idx++) {
    // skip checking adjacent tiles around player position when their current pos overlaps a collidable tile
    if (hasHit && idx === 0) {
      continue;
    }
    const pos = idx === 0 ? player.position : segments.get(idx - 1);
    for (let i = 0; i < 4; i++) {
      let dir = DIR.UP;
      if (i === 1) dir = DIR.RIGHT;
      if (i === 2) dir = DIR.DOWN;
      if (i === 3) dir = DIR.LEFT;
      const test = pos.copy().add(dirToUnitVector(dir));
      if (visited[getCoordIndex(test)]) {
        continue;
      }
      if (!test.equals(player.position) && !checkCollision(ctx, test)) {
        const result = floodFillTrapped(getCoordIndex(test), 10, grid, visited);
        trapped = analyzeFloodFillTrappedResult(result, segments.length);
        if (trapped && result.maxSegmentIndex > maxSegmentIndex) {
          maxSegmentIndex = result.maxSegmentIndex;
        }
        if (!trapped) {
          break outer;
        }
      }
    }
  }
  if (trapped) {
    es.illuminationMap[getCoordIndex(player.position)] = 1;
    Object.entries(visited).forEach(([idxStr, vis]) => {
      if (vis && !Number.isNaN(Number(idxStr))) {
        es.illuminationMap[Number(idxStr)] = 1;
      }
    });
  }
  return trapped;
}
