import {
  Action,
  DamageType,
  ExplosionType,
  GameMode,
  IEnumerator,
  Image,
  LaserType,
  Orientation,
  RemovalReason,
  ReplayMode,
  SmokeType,
  Sound,
  SpritesheetRange,
  ThreatFlag,
  ThreatType,
} from "@/types";
import {
  ANIMATIONS,
  BARREL_CASCADE_LIFETIME,
  BARREL_WARN_LIFETIME,
  BURN_DURATION_MS,
  BUTTON_RELEASE_DAMAGE_DELAY,
  ELECTROCUTION_DURATION_MS,
  GRIDCOUNT_X,
  GRIDCOUNT_Y,
  HURT_MUSIC_DUCK_TIME_MS,
  HURT_MUSIC_DUCK_VOL,
  HURT_STUN_TIME,
  LASER_DIODE_CRIT_LIFETIME,
  SMOKE_LIFETIME,
} from "@/constants";
import {
  FLAG_PREY_BURNED,
  FLAG_PREY_ELECTROCUTED,
  FLAG_PREY_STUNNED,
  FLAG_PREY_TRAPPED,
} from "@/collections/preyList";
import {
  buildTrappedFloodGrid,
  byCoord,
  clamp,
  floodFillTrapped,
  getCoordIndex,
  getCoordIndex2,
  getCoordX,
  getCoordY,
  isBreakableBarrier,
  lerp,
  makeCheckPreyCollision,
  neighborly,
} from "@/utils";
import { saveDataStore } from "@/stores/SaveDataStore";
import { Context } from "./context";
import { applyArmorProtection, removeBarrierTile } from "./mutations";
import { reboundSnake } from "./movement";
import { spawnLegendaryItem, spawnMeatItem } from "./spawning";


export function applyDamage(ctx: Context, amount: number) {
  const { es, state, replay, startScreenShake, renderHeartsUI, startAction, playSound, flashScreen } = ctx;
  if (state.gameMode === GameMode.Casual && replay.mode !== ReplayMode.Playback) {
    state.isMoving = false;
  } else {
    state.lives -= Math.floor(amount);
  }
  state.timeSinceHurt = 0;
  if (es.difficulty.index === 4) {
    state.currentSpeed = 1;
  } else {
    state.currentSpeed = 2;
  }
  flashScreen();
  startScreenShake(1, 0.4);
  renderHeartsUI();
  startAction(duckMusicOnHurt(ctx), Action.FadeMusic);
  if (state.lives >= 2) {
    playSound(Sound.hurt1);
  } else if (state.lives === 1) {
    playSound(Sound.hurt2);
  } else {
    playSound(Sound.hurt3);
  }
  if (state.gameMode === GameMode.Cobra && state.lives >= 0) {
    saveDataStore.updateLives(state.lives);
  }
}

export function* epicDeathRoutine(ctx: Context): IEnumerator {
  const { es, state, loopState, musicPlayer, coroutines } = ctx;
  state.isDeathIlluminating = true;
  loopState.timeScale = 0;
  musicPlayer.setVolume(0);
  musicPlayer.pause(es.level.musicTrack);
  yield* coroutines.waitForTime(700);
  state.isDeathIlluminating = false;
  loopState.timeScale = 1;
  applyDamage(ctx, 5);
  // tick one additional frame so that handleSpikeDeath is not called again.
  yield null;
}

export function handleSnakeElectrocution(ctx: Context): void {
  const { es, state, player, segments, threats, actionRunning, startAction } = ctx;
  if (state.isButtonPressed) return;
  if (state.isDeathIlluminating) return;
  if (actionRunning(Action.EpicDeath)) return;
  if (state.timeSinceButtonPressChanged < BUTTON_RELEASE_DAMAGE_DELAY) return;
  if (state.isExitingLevel) return;
  if (state.isLost) return;
  if (state.lives < 0) return;
  if (state.timeSinceInvincibleStart < es.difficulty.invincibilityTime) return;
  if (state.timeSinceHurt < HURT_STUN_TIME) return;
  if (state.timeSinceArmorProtection < HURT_STUN_TIME) return;
  if (state.timeSinceElectrocutionStart < ELECTROCUTION_DURATION_MS * 2) return;
  if (actionRunning(Action.Electrocution)) return;
  let overlappingLaser = false;
  let segmentAtCoord = false;
  let laserType = LaserType.Blue;
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const playerCoord = getCoordIndex(player.position);
    if (es.lasersMap[coord]?.damageActive && (coord === playerCoord || segments.existsAtCoord(coord))) {
      segmentAtCoord ||= segments.existsAtCoord(coord);
      overlappingLaser = true;
      if (es.lasersMap[coord].type === LaserType.Red) { laserType = LaserType.Red; }
    }
    if (coord === playerCoord && es.threatsMap[coord] === ThreatType.ElectricCoil && !byCoord(coord)(threats.hasFlagAt, ThreatFlag.NoDamage)) {
      overlappingLaser = true;
    }
  }
  if (overlappingLaser) {
    state.timeSinceElectrocutionStart = 0;
    startAction(electrocutionRoutine(ctx, laserType, segmentAtCoord), Action.Electrocution);
  }
}

/**
 * Given this scenario:
 *
 * ```
 * A--B--A
 *    |
 *    |
 *    B
 * ```
 * If 'B' diodes blow up, then the AB/BA path would become AA,
 * which means the laser cells along that path will have updated diode a/b coords.
 */
function* electrocutionRoutine(ctx: Context, laserType: LaserType, segmentAtCoord: boolean): IEnumerator {
  const { es, state, player, segments, heldItems, threats, sfx, coroutines, playSound, stopAction } = ctx;
  const red = laserType === LaserType.Red;
  const armorProtect = heldItems.armor > 0 && !red;
  es.illuminationMap = {};
  if (armorProtect) {
    playSound(Sound.alarm, 0.5);
  }
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const laserCell = es.lasersMap[coord];
    const isPlayerAtCoord = coord === getCoordIndex(player.position) || segments.existsAtCoord(coord);
    if (laserCell && isPlayerAtCoord) {
      if (armorProtect) {
        // overload diodes to blow!
        byCoord(laserCell.coordDiodeA)(threats.addFlagAt, ThreatFlag.Crit);
        byCoord(laserCell.coordDiodeB)(threats.addFlagAt, ThreatFlag.Crit);
      }
      // illuminate intersecting laser
      state.isDeathIlluminating = true;
      const horizontal = getCoordY(laserCell.coordDiodeA) === getCoordY(laserCell.coordDiodeB);
      for (let lasercoord = laserCell.coordDiodeA; lasercoord <= laserCell.coordDiodeB; lasercoord += (horizontal ? 1 : GRIDCOUNT_X)) {
        es.illuminationMap[lasercoord] = 1;
      }
    }
    // flag electric coil as non-damaging
    if (isPlayerAtCoord && es.threatsMap[coord] === ThreatType.ElectricCoil) {
      byCoord(coord)(threats.addFlagAt, ThreatFlag.NoDamage);
    }
  }
  // illuminate snakey
  es.illuminationMap[getCoordIndex(player.position)] = 1;
  for (let i = 0; i < segments.length; i++) {
    es.illuminationMap[getCoordIndex(segments.get(i))] = 1;
  }
  // electrocute the snakey
  state.timeSinceElectrocutionStart = 0;
  sfx.playLoop(Sound.electrocuteLoop);
  let duration = armorProtect ? ELECTROCUTION_DURATION_MS / 2 : ELECTROCUTION_DURATION_MS;
  if (red || (!armorProtect && segmentAtCoord)) {
    duration = ELECTROCUTION_DURATION_MS * 2;
  }
  yield* coroutines.waitForTime(duration, () => {
    state.timeSinceElectrocutionStart = state.timeSinceElectrocutionStart % ELECTROCUTION_DURATION_MS
  });
  // do not yield so that we guarantee this routine completely finishes before recalculateLasersMap() is called again.
  state.timeSinceElectrocutionStart = Infinity;
  state.isDeathIlluminating = false;
  es.illuminationMap = {};
  sfx.stop(Sound.electrocuteLoop);
  if (armorProtect) {
    applyArmorProtection(ctx);
  } else {
    state.lastHurtBy = DamageType.Electrocution;
    applyDamage(ctx, red ? 5 : 1);
  }
  // remove electric coil if present
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const isPlayerAtCoord = coord === getCoordIndex(player.position) || segments.existsAtCoord(coord);
    if (isPlayerAtCoord && es.threatsMap[coord] === ThreatType.ElectricCoil) {
      threats.removeByCoord(coord, RemovalReason.Explode);
    }
    if (isPlayerAtCoord) {
      es.snekDamage[coord] = DamageType.Electrocution;
    }
  }
  if (!armorProtect && segmentAtCoord) {
    applyDamage(ctx, 5);
    return;
  }
  if (state.isLost) return;
  if (state.lives < 0) return;
  if (!armorProtect) {
    reboundSnake(ctx, 2);
    return;
  }
  // destroy laser diodes from armor protection
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const isPlayerAtCoord = coord === getCoordIndex(player.position) || segments.existsAtCoord(coord);
    // get latest laser cell because the map may have changed (see note above)
    const laserCell = es.lasersMap[coord];
    if (isPlayerAtCoord && laserCell && (threats.existsAtCoord(laserCell.coordDiodeA) || threats.existsAtCoord(laserCell.coordDiodeB))) {
      byCoord(laserCell.coordDiodeA)(threats.addFlagAt, ThreatFlag.Crit);
      byCoord(laserCell.coordDiodeB)(threats.addFlagAt, ThreatFlag.Crit);
      threats.setLifetimeByCoord(laserCell.coordDiodeA, 200);
      threats.setLifetimeByCoord(laserCell.coordDiodeB, 200);
      // disable and remove all adjacent lasers
      const x0 = Math.min(getCoordX(laserCell.coordDiodeA), getCoordX(laserCell.coordDiodeB));
      const x1 = Math.max(getCoordX(laserCell.coordDiodeA), getCoordX(laserCell.coordDiodeB));
      const y0 = Math.min(getCoordY(laserCell.coordDiodeA), getCoordY(laserCell.coordDiodeB));
      const y1 = Math.max(getCoordY(laserCell.coordDiodeA), getCoordY(laserCell.coordDiodeB));
      const horizontal = y0 === y1;
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          // if two crossing beams exist at a cell, only remove one
          if (es.lasersMap[getCoordIndex2(x, y)] && es.lasersMap[getCoordIndex2(x, y)].orientation === Orientation.Mixed) {
            if (horizontal) {
              es.lasersMap[getCoordIndex2(x, y)].orientation = Orientation.Vertical;
            } else {
              es.lasersMap[getCoordIndex2(x, y)].orientation = Orientation.Horizontal;
            }
            es.lasersMap[getCoordIndex2(x, y)].damageActive = true;
          } else {
            es.lasersMap[getCoordIndex2(x, y)] = undefined;
          }
        }
      }
    }
  }
  stopAction(Action.Electrocution);
}

export function handleSnekFireDamage(ctx: Context) {
  const { es, state, player, segments, actionRunning, startAction } = ctx;
  if (state.isButtonPressed) return;
  if (state.isDeathIlluminating) return;
  if (actionRunning(Action.EpicDeath)) return;
  if (state.timeSinceButtonPressChanged < BUTTON_RELEASE_DAMAGE_DELAY) return;
  if (state.isExitingLevel) return;
  if (state.isLost) return;
  if (state.lives < 0) return;
  if (state.timeSinceInvincibleStart < es.difficulty.invincibilityTime) return;
  if (state.timeSinceHurt < HURT_STUN_TIME) return;
  if (state.timeSinceArmorProtection < HURT_STUN_TIME) return;
  if (state.timeSinceBurnStart < Infinity) return;
  if (actionRunning(Action.Burnination)) return;

  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    if (es.flamesMap[coord] && (coord === getCoordIndex(player.position) || segments.existsAtCoord(coord))) {
      startAction(burninationRoutine(ctx), Action.Burnination);
      return;
    }
  }
}

function* burninationRoutine(ctx: Context): IEnumerator {
  const { es, state, player, segments, smoke, sfx, heldItems, coroutines, stopAction } = ctx;
  state.timeSinceBurnStart = 0;
  let segmentAtCoord = false;
  const seen: Record<number, boolean> = {}
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    if (es.flamesMap[coord] && (coord === getCoordIndex(player.position) || segments.existsAtCoord(coord))) {
      if (segments.existsAtCoord(coord)) {
        segmentAtCoord = true;
      }
      smoke.add(getCoordX(coord), getCoordY(coord), 9999999, SpritesheetRange.BigSmokeActive, SmokeType.Large, { replaceExisting: true });
      seen[coord] = true;
    }
  }
  const hasArmor = heldItems.armor > 0;
  sfx.playLoop(Sound.burn);
  yield* coroutines.waitForTime(hasArmor ? BURN_DURATION_MS / 2 : BURN_DURATION_MS);
  sfx.stop(Sound.burn);
  if (hasArmor) {
    applyArmorProtection(ctx);
  } else {
    state.lastHurtBy = DamageType.Burn;
    if (segmentAtCoord) {
      applyDamage(ctx, 5);
    } else {
      applyDamage(ctx, 1);
    }
  }
  state.timeSinceBurnStart = Infinity;
  if (state.isLost || state.lives < 0) {
    // add smoke to neighbors
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      if (!seen[coord] && segments.existsAtCoord(coord) && neighborly(coord, es.flamesMap)) {
        seen[coord] = true;
        smoke.add(getCoordX(coord), getCoordY(coord), 9999999, SpritesheetRange.BigSmokeActive, SmokeType.Large, { replaceExisting: true, elapsed: Math.floor(Math.random() * 10) * 200 });
      }
    }
  }
  if (state.isLost) return;
  if (state.lives < 0) return;

  // disable smoke at coord
  const { frames, timePerFrame } = ANIMATIONS[SpritesheetRange.BigSmokeActive];
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    if (es.flamesMap[coord] && (coord === getCoordIndex(player.position) || segments.existsAtCoord(coord))) {
      smoke.removeByCoord(coord, RemovalReason.None);
      smoke.add(getCoordX(coord), getCoordY(coord), frames * timePerFrame, SpritesheetRange.BigSmokeOff, SmokeType.LargeDissipate);
    }
  }
  reboundSnake(ctx, 2);
  stopAction(Action.Burnination);
}

export function damageSurroundingTiles(ctx: Context, coord: number, explosionType: ExplosionType) {
  const { es, threats } = ctx;
  const x = getCoordX(coord);
  const y = getCoordY(coord);
  const checks = [
    -1, -1,
    -1, 0,
    -1, 1,
    0, -1,
    0, 1,
    1, -1,
    1, 0,
    1, 1,
  ];
  for (let i = 0; i < Math.floor(checks.length / 2); i++) {
    const tx = x + checks[2 * i + 0];
    const ty = y + checks[2 * i + 1];
    if (tx < 0 || tx >= GRIDCOUNT_X) continue;
    if (ty < 0 || ty >= GRIDCOUNT_Y) continue;
    const damageCoord = getCoordIndex2(tx, ty);
    // cascade barrel explosions
    const barrelLifetime = explosionType === ExplosionType.Large ? BARREL_CASCADE_LIFETIME : BARREL_WARN_LIFETIME;
    if (threats.existsAtCoord(damageCoord, ThreatType.ExplodableBarrel) && threats.getTimeRemaining(tx, ty) > barrelLifetime) {
      threats.setLifetime(tx, ty, barrelLifetime);
    }
    // // destroy adjacent diodes
    if (explosionType === ExplosionType.Large && threats.existsAtCoord(damageCoord, ThreatType.LaserDiode) && threats.getTimeRemaining(tx, ty) > LASER_DIODE_CRIT_LIFETIME) {
      threats.setLifetime(tx, ty, LASER_DIODE_CRIT_LIFETIME);
      // playSound(Sound.alarm, 0.5);
    }
    // destroy adjacent mines
    if (explosionType === ExplosionType.Large && threats.existsAtCoord(damageCoord, ThreatType.Mine)) {
      threats.removeByCoord(damageCoord, RemovalReason.Explode);
    }
    // always destroy adjacent tiles if breakable
    if (explosionType === ExplosionType.Large && isBreakableBarrier(es.barriersMap[damageCoord])) {
      removeBarrierTile(ctx, damageCoord);
    }
    // small chance of destroying non-breakable adjacent tiles
    if (explosionType === ExplosionType.Large && Math.random() < 0.0015) {
      removeBarrierTile(ctx, damageCoord);
    }
  }
}

function* duckMusicOnHurt(ctx: Context): IEnumerator {
  const { musicPlayer, p5, clearAction } = ctx;
  yield null;
  let t = 0;
  while (t < 1) {
    musicPlayer.setVolume(clamp(p5.lerp(HURT_MUSIC_DUCK_VOL, 1, t), 0, 1));
    t += p5.deltaTime / HURT_MUSIC_DUCK_TIME_MS;
    yield null;
  }
  musicPlayer.setVolume(1);
  clearAction(Action.FadeMusic);
}

export function spawnHurtParticles(ctx: Context) {
  const { player, puffs } = ctx;
  const x = player.position.x;
  const y = player.position.y;
  // impactParticleSystem.emit(x, y);
  const lifetime = ANIMATIONS[Image.PuffSheet].frames * ANIMATIONS[Image.PuffSheet].timePerFrame;
  puffs.add(x, y, lifetime, Image.PuffSheet);
}

export function handlePreyElectrocution(ctx: Context) {
  const { es, state, preyList, coroutines } = ctx;
  if (state.isButtonPressed) return;
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const x = getCoordX(coord);
    const y = getCoordY(coord);
    if (es.lasersMap[coord]?.damageActive && preyList.existsAtCoord(coord) && !preyList.hasFlagAt(x, y, FLAG_PREY_ELECTROCUTED)) {
      coroutines.start(electrocutePreyRoutine(ctx, x, y));
    }
  }
}

function* electrocutePreyRoutine(ctx: Context, x: number, y: number): IEnumerator {
  const { state, preyList, sfx, smoke, drawState, coroutines } = ctx;
  preyList.addFlagAt(x, y, FLAG_PREY_STUNNED);
  preyList.addFlagAt(x, y, FLAG_PREY_ELECTROCUTED);
  sfx.playLoop(Sound.electrocuteLoop);
  yield* coroutines.waitForTime(ELECTROCUTION_DURATION_MS);
  preyList.remove(x, y);
  if (!preyList.hasFlagForAny(FLAG_PREY_ELECTROCUTED) && state.timeSinceElectrocutionStart === Infinity) {
    sfx.stop(Sound.electrocuteLoop);
  }
  const smokeLifetime = lerp(SMOKE_LIFETIME * 0.5, SMOKE_LIFETIME, Math.random());
  smoke.add(x, y, smokeLifetime, SpritesheetRange.BigSmokeActive, SmokeType.Large);
  spawnMeatItem(ctx, x, y);
  drawState.shouldDrawActionFG = true;
  drawState.shouldDrawApples = true;
}

export function handlePreyFireDamage(ctx: Context) {
  const { es, state, preyList, coroutines } = ctx;
  if (state.isButtonPressed) return;
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const x = getCoordX(coord);
    const y = getCoordY(coord);
    if (es.flamesMap[coord] && preyList.existsAtCoord(coord) && !preyList.hasFlagAt(x, y, FLAG_PREY_BURNED)) {
      coroutines.start(burnPreyRoutine(ctx, x, y));
    }
  }
}

function* burnPreyRoutine(ctx: Context, x: number, y: number): IEnumerator {
  const { preyList, sfx, smoke, drawState, coroutines, actionRunning } = ctx;
  preyList.addFlagAt(x, y, FLAG_PREY_STUNNED);
  preyList.addFlagAt(x, y, FLAG_PREY_BURNED);
  sfx.playLoop(Sound.burn);
  yield* coroutines.waitForTime(ELECTROCUTION_DURATION_MS);
  preyList.remove(x, y);
  if (!preyList.hasFlagForAny(FLAG_PREY_BURNED) && !actionRunning(Action.Burnination)) {
    sfx.stop(Sound.burn);
  }
  const smokeLifetime = lerp(SMOKE_LIFETIME * 0.5, SMOKE_LIFETIME, Math.random());
  smoke.add(x, y, smokeLifetime, SpritesheetRange.BigSmokeActive, SmokeType.Large);
  spawnMeatItem(ctx, x, y);
  drawState.shouldDrawActionFG = true;
  drawState.shouldDrawApples = true;
}

export function handlePreyTrapped(ctx: Context, ) {
  const { preyList, es, state, segments, player, coroutines } = ctx;
  const checkPreyCollision = makeCheckPreyCollision(es, state, segments, player.position);
  const visited: Record<number, boolean> = {};
  const grid = buildTrappedFloodGrid(checkPreyCollision, segments, player.position);
  for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
    const x = getCoordX(coord);
    const y = getCoordY(coord);
    if (preyList.existsAtCoord(coord) && !preyList.hasFlagAt(x, y, FLAG_PREY_TRAPPED)) {
      const result = floodFillTrapped(coord, 4, grid, visited);
      const trapped = !result.didFill;
      if (trapped) {
        coroutines.start(trapPreyRoutine(ctx, x, y));
      }
    }
  }
}

function* trapPreyRoutine(ctx: Context, x: number, y: number): IEnumerator {
  const { preyList, drawState, coroutines } = ctx;
  preyList.addFlagAt(x, y, FLAG_PREY_TRAPPED);
  preyList.addFlagAt(x, y, FLAG_PREY_STUNNED);
  preyList.addFlagAt(x, y, FLAG_PREY_ELECTROCUTED);
  yield* coroutines.waitForTime(250);
  if (!preyList.existsAt(x, y)) return;
  preyList.remove(x, y);
  spawnLegendaryItem(ctx, x, y);
  drawState.shouldDrawActionFG = true;
  drawState.shouldDrawApples = true;
}