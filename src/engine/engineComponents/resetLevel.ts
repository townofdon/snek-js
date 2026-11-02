import { DEFAULT_PORTALS, GLOBAL_LIGHT_DEFAULT, GRIDCOUNT_X, GRIDCOUNT_Y, MAX_LIVES, NUM_APPLES_START, PICKUP_LIFETIME_MS, START_SNAKE_SIZE } from "@/constants";
import { DEFAULT_GAME_STATE } from "@/defaults";
import { BarrierType, Boss, Context, DamageType, DIR, GameMode, Image, LevelType, LightSource, LightType, MusicTrack, PickupType, PortalChannel, PreyType, ReplayMode, ScreenShakeState, SpritesheetRange, ThreatType } from "@/types";
import { buildPipesMap, getCoordIndex, getCoordIndex2, invertDirection, recalculateFlamesMap, recalculateLasersMap } from "@/utils";
import { spawnApple } from "./spawning";
import { buildMapLayout, decodeMapData } from "@/editor/utils/editorUtils";
import { getExtendedPalette, PALETTE } from "@/palettes";
import { resetGamepad } from "../gamepad";
import { UI } from "@/ui/ui";
import { buildLevel } from "@/levels/levelBuilder";
import { getLevelBoss, SECRET_LEVEL_MAP, START_LEVEL, START_LEVEL_COBRA } from "@/levels/levelConstants";
import { initLightmap } from "../lighting";
import { BossConstructorArgs } from "@/boss/BaseBoss";
import { buildSceneActionFactory } from "@/scenes/sceneUtils";
import { allowAchievements, checkAchievementForLevelReached } from "@/achievements";
import { resumeAudioContext } from "../audio";

export interface ResetLevelImplParams {
  boss: { current: Boss | null },
  startPortalParticles: () => void,
  startExitParticles: () => void,
  setColorsFromLevel: () => void,
}

export function resetLevelImpl(ctx: Context, params: ResetLevelImplParams) {
  const {
    boss,
    startPortalParticles,
    startExitParticles,
    setColorsFromLevel,
  } = params;
  const {
    p5,
    es,
    stats,
    drawState,
    replay,
    state,
    player,
    threats,
    apples,
    shields,
    fireTiles,
    segments,
    preySpawn,
    astar,
    renderer,
    spriteRenderer,
    sfx,
    musicPlayer,
    lights,
  } = ctx;
  // init stats
  stats.applesEatenThisLevel = 0;
  stats.totalLevelTimeElapsed = 0;
  stats.blueKeyCollected = false;
  stats.yellowKeyCollected = false;
  stats.redKeyCollected = false;
  stats.anyPowerupCollected = false;
  stats.minesRemaining = 0;
  // init state for new level
  drawState.shouldDrawApples = true;
  drawState.shouldDrawKeysLocks = true;
  drawState.shouldDrawActionFG = true;
  player.position = p5.createVector(15, 15);
  player.direction = DIR.RIGHT;
  player.directionToFirstSegment = DIR.LEFT;
  player.directionLastHit = DIR.LEFT;
  state.isPaused = false;
  state.isMoving = false;
  state.isRewinding = false;
  state.isSprinting = false;
  state.isLost = false;
  state.isTrapped = false;
  state.isGameWon = false;
  state.isDoorsOpen = false;
  state.isButtonPressed = false;
  state.isExitingLevel = false;
  state.isExited = false;
  state.isInvertedColors = false;
  state.isDeathIlluminating = false;
  state.globalLightOverride = undefined;
  state.lightsOn = DEFAULT_GAME_STATE.lightsOn;
  state.actualTimeElapsed = 0;
  state.timeElapsed = 0;
  state.timeSinceLastMove = Infinity;
  state.timeSinceLastTeleport = Infinity;
  state.timeSinceHurt = Infinity;
  state.timeSinceHurtForgiveness = Infinity;
  state.timeSinceInvincibleStart = Infinity;
  state.timeSinceElectrocutionStart = Infinity;
  state.timeSinceBurnStart = Infinity;
  state.timeSinceReverseStart = Infinity;
  state.timeSinceArmorPickup = Infinity;
  state.timeSinceArmorProtection = Infinity;
  state.timeSinceSpawnedAnyPickup = Infinity;
  state.timeSinceSpawnedWeightLossPillPickup = Infinity;
  state.timeSinceLungeStart = Infinity;
  state.timeSinceButtonPressChanged = Infinity;
  state.timeSinceGraceStarted = 0;
  state.lives = (state.gameMode === GameMode.Cobra || state.gameMode === GameMode.Arcade) ? state.lives : MAX_LIVES;
  state.collisions = 0;
  state.targetSpeed = 1;
  state.currentSpeed = 1;
  state.lungeStepsRemaining = 0;
  state.steps = 0;
  state.pity = 0;
  state.frameCount = 0;
  state.numTeleports = 0;
  state.lastHurtBy = DamageType.None;
  state.hasKeyYellow = false;
  state.hasKeyRed = false;
  state.hasKeyBlue = false;
  es.moves = [];
  es.recentMoves = [null, null, null, null];
  es.recentMoveInputs = [null, null, null, null];
  es.recentInputTimes = [Infinity, Infinity, Infinity, Infinity];
  es.barriers = [];
  es.doors = [];
  es.decoratives1 = [];
  es.decoratives2 = [];
  es.keys = [];
  es.portals = { ...DEFAULT_PORTALS() };
  for (let y = 0; y < GRIDCOUNT_Y; y++) {
    for (let x = 0; x < GRIDCOUNT_X; x++) {
      es.passablesMap[getCoordIndex2(x, y)] = undefined;
      es.barriersMap[getCoordIndex2(x, y)] = undefined;
      es.doorsMap[getCoordIndex2(x, y)] = undefined;
      es.pickupsMap[getCoordIndex2(x, y)] = undefined;
      es.nospawnsMap[getCoordIndex2(x, y)] = undefined;
      es.portalsMap[getCoordIndex2(x, y)] = undefined;
      es.keysMap[getCoordIndex2(x, y)] = undefined;
      es.locksMap[getCoordIndex2(x, y)] = undefined;
      es.threatsMap[getCoordIndex2(x, y)] = undefined;
      es.lasersMap[getCoordIndex2(x, y)] = undefined;
      es.switchesMap[getCoordIndex2(x, y)] = undefined;
      es.pipesMap[getCoordIndex2(x, y)] = undefined;
      es.flamesMap[getCoordIndex2(x, y)] = undefined;
      es.illuminationMap[getCoordIndex2(x, y)] = undefined;
      es.lightSources[getCoordIndex2(x, y)] = undefined;
    }
  }

  if (es.level.layoutV2?.length) {
    try {
      // // NOTE TO FUTURE SELF: do NOT copy data directly from the URL. This is the path of pain and misery.
      // // Instead, use "Copy dev link" in snek editor, or use this snippet below:
      // const query = new URLSearchParams(`?data=${es.level.layoutV2}`);
      // const queryData = query.get('data');
      // const [data] = decodeMapData(queryData);
      const [data, options] = decodeMapData(es.level.layoutV2);
      es.level.colors = getExtendedPalette(options.palette);
      es.level.layout = buildMapLayout(data);
      es.level.snakeSpawnPointOverride = getCoordIndex(data.playerSpawnPosition);
      // may decide to remove these overwrites later
      es.level.disableAppleSpawn = options.disableAppleSpawn;
      if (options.disableAppleSpawn) {
        es.level.applesModOverride ??= 1;
        es.level.growthOverride = es.level.growthOverride ?? 2;
      }
      es.level.numApplesStart = options.numApplesStart;
      es.level.applesToClear = options.applesToClear;
      es.level.timeToClear = options.timeToClear;
      es.level.snakeStartSizeOverride = options.snakeStartSize;
      es.level.extraHurtGraceTime = options.extraHurtGraceTime;
      es.level.globalLight = options.globalLight;
      es.level.pipeVariant = options.pipeVariant;
      if (!es.level.musicTrack || es.level.musicTrack === MusicTrack.None) {
        es.level.musicTrack = options.musicTrack;
      }
      es.level.snakeStartDirectionOverride = data.startDirection;
    } catch (err) {
      console.error(err);
      console.error(`Unable to parse layoutV2 data for es.level "${es.level.name}"`);
    }
  }

  resetGamepad();
  renderer.reset();
  renderer.invalidateStaticCache();
  spriteRenderer.setThemedAppleImage(es.level.colors);
  spriteRenderer.setThemedBorderImages(es.level.colors);
  spriteRenderer.setThemedDoorImage(es.level.colors);
  if (state.gameMode === GameMode.Cobra) {
    spriteRenderer.setThemedSegmentImage(PALETTE.cobra.playerTail, PALETTE.cobra.playerTailStroke);
  } else {
    spriteRenderer.setThemedSegmentImage(es.level.colors.playerTail, es.level.colors.playerTailStroke);
  }
  setColorsFromLevel();

  // init boss
  boss.current = getLevelBoss(es.level, {
    ctx,
    gameState: state,
    annotations: es.level.annotations || {},
    renderer,
    spriteRenderer,
    difficulty: es.difficulty.index,
    sfx,
    musicPlayer,
  } satisfies BossConstructorArgs);

  const levelData = buildLevel(es.level);
  player.position = levelData.playerSpawnPosition;
  player.direction = es.level.snakeStartDirectionOverride ?? DIR.RIGHT;
  player.directionToFirstSegment = invertDirection(player.direction);
  player.directionLastHit = invertDirection(player.direction);
  es.barriers = levelData.barriers;
  es.barriersMap = levelData.barriersMap;
  es.passablesMap = levelData.passablesMap;
  es.doors = levelData.doors;
  es.doorsMap = levelData.doorsMap;
  es.decoratives1 = levelData.decoratives1;
  es.decoratives2 = levelData.decoratives2;
  es.nospawnsMap = levelData.nospawnsMap;
  es.portals = levelData.portals;
  es.portalsMap = levelData.portalsMap;
  es.keys = levelData.keys;
  es.keysMap = levelData.keysMap;
  es.locks = levelData.locks;
  es.locksMap = levelData.locksMap;
  es.diffSelectMap = levelData.diffSelectMap;
  es.pipeOverrides = es.level.pipeOverrides || {};
  es.annotations = es.level.annotations || {};
  es.snekDamage = {};

  if (SECRET_LEVEL_MAP[es.level.id]) {
    es.level.nextLevelMap ??= {};
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      const annotation = es.level.annotations[coord];
      if (annotation && SECRET_LEVEL_MAP[es.level.id][annotation]) {
        es.level.nextLevelMap[coord] = SECRET_LEVEL_MAP[es.level.id][annotation];
      }
    }
  }

  // set es.level metadata
  es.level.numLocks = es.locks.length;
  if (es.level.startDark) {
    state.isDeathIlluminating = true;
  }

  // create snake parts
  let x = player.position.x;
  let y = player.position.y;
  for (let i = 0; i < (es.level.snakeStartSizeOverride || START_SNAKE_SIZE); i++) {
    if (i < 3) {
      if (player.direction === DIR.RIGHT) x--;
      if (player.direction === DIR.LEFT) x++;
      if (player.direction === DIR.UP) y++;
      if (player.direction === DIR.DOWN) y--;
    }
    const segment = p5.createVector(x, y);
    segments.addVec(segment);
  }

  // add fire tiles
  es.barriers.filter(barrier => barrier.type === BarrierType.FireTile).forEach(barrier => {
    const x = barrier.vec.x;
    const y = barrier.vec.y;
    const lifetime = 99999999; // improbably high lifetime = never despawn
    fireTiles.add(x, y, lifetime, Image.FireSheet);
  });

  // add buttons / switches
  levelData.switches.forEach(item => {
    const coord = getCoordIndex2(item.vec.x, item.vec.y);
    es.switchesMap[coord] = item.type;
  });

  buildPipesMap(levelData.pipes, es.pipesMap, es.pipeOverrides);

  // add initial threats
  for (let i = 0; i < levelData.threats.length; i++) {
    const x = levelData.threats[i].vec.x;
    const y = levelData.threats[i].vec.y;
    const threatType = levelData.threats[i].type;
    const forever = 99999999; // improbably high lifetime = never despawn
    if (threatType) {
      switch (threatType) {
        case ThreatType.Mine:
          threats.add(x, y, forever, Image.MineSheet, ThreatType.Mine);
          break;
        case ThreatType.Bomb:
          threats.add(x, y, PICKUP_LIFETIME_MS, SpritesheetRange.Bomb, ThreatType.Bomb);
          break;
        case ThreatType.LaserDiode:
          threats.add(x, y, forever, SpritesheetRange.DiodeBlue, ThreatType.LaserDiode);
          break;
        case ThreatType.ExplodableBarrel:
          threats.add(x, y, forever, SpritesheetRange.Barrel, ThreatType.ExplodableBarrel);
          break;
        case ThreatType.Barricade:
          threats.add(x, y, forever, SpritesheetRange.BarricadeDeploy, ThreatType.Barricade, {
            disabledImg: SpritesheetRange.BarricadeRetract,
          });
          break;
        case ThreatType.Spikes:
          threats.add(x, y, forever, SpritesheetRange.Spikes, ThreatType.Spikes);
          break;
        case ThreatType.WallSpikes:
          threats.add(x, y, forever, SpritesheetRange.WallSpikesDeploy, ThreatType.WallSpikes, {
            disabledImg: SpritesheetRange.WallSpikesRetract,
          });
          break;
        case ThreatType.Saw:
          threats.add(x, y, forever, SpritesheetRange.SawActive, ThreatType.Saw, {
            disabledImg: SpritesheetRange.SawOff,
          });
          break;
        case ThreatType.Flamethrower:
          threats.add(x, y, forever, SpritesheetRange.FlamethrowerActive, ThreatType.Flamethrower, {
            disabledImg: SpritesheetRange.FlamethrowerOff,
          });
          break;
        case ThreatType.ElectricCoil:
          threats.add(x, y, forever, SpritesheetRange.ElectricCoil, ThreatType.ElectricCoil);
          break;
        default:
          break;
      }
    }
  }

  recalculateLasersMap(es, threats);
  recalculateFlamesMap(es);

  // add initial pickups
  for (let i = 0; i < levelData.pickups.length; i++) {
    const x = levelData.pickups[i].vec.x;
    const y = levelData.pickups[i].vec.y;
    const pickupType = levelData.pickups[i].type;
    if ([PickupType.Invincibility, PickupType.HealthPack, PickupType.WeightLossPill, PickupType.Reversibility].includes(pickupType)) {
      if (!apples.existsAt(x, y)) apples.add(x, y);
    }
    es.pickupsMap[getCoordIndex2(x, y)] = {
      lifetime: 99999999, // improbably high lifetime = never despawn
      type: pickupType,
    };
    if (pickupType === PickupType.Armor) {
      shields.add(x, y, 99999999, Image.Shield);
    }
  }

  // add initial apples
  for (let i = 0; i < levelData.apples.length; i++) {
    apples.add(levelData.apples[i].x, levelData.apples[i].y);
  }
  let numApplesStart = es.level.numApplesStart ?? NUM_APPLES_START;
  if (boss.current) {
    numApplesStart = 0;
  }
  for (let i = 0; i < numApplesStart; i++) {
    spawnApple(ctx);
  }

  // setup prey spawns
  // TODO: configure drops per level - see obsidian notes
  preySpawn.dropsByFrame = {
    5: PreyType.Grub,
    10: PreyType.Ant,
    15: PreyType.FieldMouse,
    20: PreyType.Grasshopper,
    25: PreyType.FieldMouse,
    30: PreyType.Ant,
    35: PreyType.Grub,
  };
  let hasDirectionalLight = false;
  es.barriers.forEach(barrier => {
    astar.setWall(barrier.vec.x, barrier.vec.y);
    if (barrier.type === BarrierType.PanelLight) {
      es.lightSources[getCoordIndex(barrier.vec)] = {
        radius: 1,
        falloff: 2,
        strength: 0.7,
        type: LightType.Point,
      } satisfies LightSource;
    } else if (barrier.type === BarrierType.WarningLight) {
      hasDirectionalLight = true;
      es.lightSources[getCoordIndex(barrier.vec)] = {
        radius: 1,
        falloff: 4,
        strength: 0.3,
        type: LightType.DirectionalSpotlight,
      } satisfies LightSource;
    }
  });
  if (hasDirectionalLight) {
    // add animation list to trigger gfxAction clear
    lights.add(0, 0, 9999999999, SpritesheetRange.WarningLightOn);
  }
  astar.setSnekCoord(getCoordIndex(player.position));
  es.doors.forEach(door => {
    astar.setWall(door.x, door.y);
  });
  levelData.pipes.forEach(pipe => {
    astar.setWall(pipe.x, pipe.y);
  })
  for (let i = 0; i <= 9; i++) {
    for (let j = 0; j < es.portals[i as PortalChannel].length; j++) {
      const portalPosition = es.portals[i as PortalChannel][j];
      if (!portalPosition) continue;
      const portal = es.portalsMap[getCoordIndex(portalPosition)];
      if (!portal) continue;
      astar.setWall(portal.position.x, portal.position.y);
    }
  }
  es.locks.forEach(lock => {
    astar.setObstacle(lock.position.x, lock.position.y);
  });
  initLightmap(es.level.globalLight ?? GLOBAL_LIGHT_DEFAULT, es.level.lightPalette);
  startPortalParticles();
  if (es.level.type === LevelType.WarpZone || (es.level.type === LevelType.Maze && es.level !== START_LEVEL && es.level !== START_LEVEL_COBRA)) {
    startExitParticles();
  }
}
