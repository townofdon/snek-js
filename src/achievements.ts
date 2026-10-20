import EventEmitter from "eventemitter3";

import { SECRET_LEVELS } from "./levels/levelConstants";
import { getLevelById } from "./levels/levelUtils";
import { saveDataStore } from "./stores/SaveDataStore";
import { Achievement, DamageType, DifficultyIndex, Episode, GameMode, GameState, LevelId, ReplayMode, Stats, WearableFrame } from "./types";
import { LEVEL_01_D } from "./levels/ep01/level01d";
import { MAZE_04_LOOT_ROOM } from "./levels/mazes/maze04-lootroom";
import { LEVEL_01 } from "./levels/ep01/level01";
import { LEVEL_01_HARD } from "./levels/ep01/level01hard";
import { LEVEL_01_ULTRA } from "./levels/ep01/level01ultra";
import { BOSS_LEVEL_THE_TECHNICIAN } from "./levels/boss/bossLevelTechnician";
import { LEVEL_10 } from "./levels/ep01/level10";
import { LEVEL_99 } from "./levels/ep01/level99";
import { VARIANT_LEVEL_99 } from "./levels/bonusLevels/variantLevel99";
import { LEVEL_17 } from "./levels/ep01/level17";
import { LEVEL_18 } from "./levels/ep01/level18";
import { MAZE_03_STORAGE } from "./levels/mazes/maze03-storage";
import { toTime } from "./utils";

const SPEED_RUN_TIME_MS = toTime({ minutes: 60, seconds: 0 });

const EE = new EventEmitter();
const AchievementEvent = 'AchievementEvent'

export const onAchievement = (handler: (achievement: Achievement) => void) => {
  EE.on(AchievementEvent, handler);
}

export const offAchievement = (handler: (achievement: Achievement) => void) => {
  EE.off(AchievementEvent, handler);
}

/**
 * Unlock an achievment if not already unlocked.
 */
export function unlockAchievement(achievement: Achievement) {
  if (saveDataStore.getAchievements()[achievement]) {
    return;
  }
  saveDataStore.setAchievement(achievement);
  EE.emit(AchievementEvent, achievement);
}

export function canAchieve(state: GameState, replayMode: ReplayMode) {
  if (replayMode === ReplayMode.Playback) {
    return false;
  }
  if (!state.isGameStarted) {
    return false;
  }
  if (state.gameMode !== GameMode.Normal && state.gameMode !== GameMode.Cobra) {
    return false;
  }
  return true;
}

export interface LevelReachedStats {
  levelId: LevelId,
  episode: Episode,
  difficultyIndex: DifficultyIndex,
}
/**
 * Check if an achievement has been unlocked when a level is reached.
 */
export function checkAchievementForLevelReached(reached: LevelReachedStats) {
  const level = getLevelById(reached.levelId);
  const isSecretLevel = SECRET_LEVELS.includes(level);

  if (isSecretLevel) {
    unlockAchievement(Achievement.ReachSecretLevel)
  }
  if (level === LEVEL_01_D) {
    unlockAchievement(Achievement.ReachSecretLevelSnekadiaDark);
  }
  if (level === MAZE_04_LOOT_ROOM) {
    unlockAchievement(Achievement.ReachSecretLevelLootRoom);
  }
}

/**
 * Check if an achievement has been unlocked during Arcade mode.
 */
export function checkArcadeAchievement(score: number, timeElapsedMs: number) {
  if (score >= 1000000) {
    unlockAchievement(Achievement.ArcadeScoreMillionPoints);
  }
  if (timeElapsedMs >= 1000 * 60 * 60) {
    unlockAchievement(Achievement.ArcadeSurviveOneHour);
  }
}

/**
 * Check if an achievement has been unlocked when dying.
 */
export function checkAchievementForDeath(damage: DamageType, isTrapped: boolean) {
  if (damage === DamageType.HitBarrier || damage === DamageType.HitDoor) {
    unlockAchievement(Achievement.DieFromHitWall);
  }

  if (!isTrapped && damage === DamageType.HitSelf) {
    unlockAchievement(Achievement.DieFromHitSelf);
  }

  if (isTrapped) {
    unlockAchievement(Achievement.DieFromTrappedSelf);
  }

  if (damage === DamageType.HitLock) {
    unlockAchievement(Achievement.DieFromHitLockedGate);
  }

  if (damage === DamageType.HitMine) {
    unlockAchievement(Achievement.DieFromHitMine);
  }

  if (damage === DamageType.Electrocution) {
    unlockAchievement(Achievement.DieFromLaser);
  }

  if (damage === DamageType.SpikePierce) {
    unlockAchievement(Achievement.DieFromSpikes);
  }

  if (damage === DamageType.Explosive) {
    unlockAchievement(Achievement.DieFromExplosion);
  }

  if (damage === DamageType.SawCut) {
    unlockAchievement(Achievement.DieFromSawCut);
  }

  if (damage === DamageType.Burn) {
    unlockAchievement(Achievement.DieFromBurn);
  }
}

export interface GameCompletionStats {
  episode: Episode,
  gameMode: GameMode,
  difficultyIndex: DifficultyIndex,
}
/**
 * Check if an achievement has been unlocked when beating the game (all 3 episodes).
 */
export function checkAchievementForGameCompletion(completion: GameCompletionStats, stats: Stats) {
  // SpeedRun = 300,
  // SpeedRunDeathless = 310,
  // SpeedRunUltraCobra = 320,
  unlockAchievement(Achievement.BeatGame);

  if (completion.difficultyIndex === 3) {
    unlockAchievement(Achievement.BeatGameHard);
  }

  if (completion.difficultyIndex === 4) {
    unlockAchievement(Achievement.BeatGameUltra);
  }

  if (completion.gameMode === GameMode.Cobra) {
    unlockAchievement(Achievement.BeatGameCobra);
  }

  if (completion.difficultyIndex === 4 && completion.gameMode === GameMode.Cobra) {
    unlockAchievement(Achievement.BeatGameUltraCobra);
  }

  if (stats.perfect) {
    unlockAchievement(Achievement.BeatGameAllLevelsPerfect);
  }

  if (stats.noApplesLeft) {
    unlockAchievement(Achievement.BeatGame100PercentApples);
  }

  if (stats.numDeaths === 0) {
    unlockAchievement(Achievement.BeatGameZeroDeaths);
  }

  if (stats.totalGameTimeElapsed <= SPEED_RUN_TIME_MS) {
    unlockAchievement(Achievement.SpeedRun);
  }

  if (stats.totalGameTimeElapsed <= SPEED_RUN_TIME_MS && stats.numDeaths === 0) {
    unlockAchievement(Achievement.SpeedRunDeathless);
  }

  if (stats.totalGameTimeElapsed <= SPEED_RUN_TIME_MS && stats.numDeaths === 0 && completion.difficultyIndex === 4 && completion.gameMode === GameMode.Cobra) {
    unlockAchievement(Achievement.SpeedRunUltraCobra);
  }
}

/**
 * Check if an achievement has been unlocked when beating an episode.
 */
export function checkAchievementForEpisodeCompletion(episode: Episode) {
  switch (episode) {
    case Episode.E1:
      unlockAchievement(Achievement.BeatEpisode1);
      break;
    case Episode.E2:
      unlockAchievement(Achievement.BeatEpisode2);
      break;
    case Episode.E3:
      unlockAchievement(Achievement.BeatEpisode3);
      break;
  }
}

export interface LevelCompletionStats {
  levelId: LevelId,
  episode: Episode,
  difficultyIndex: DifficultyIndex,
  perfect: boolean,
  hasAllApples: boolean,
  hasAllLocks: boolean,
  doorsOpen: boolean,
  blueKeyCollected: boolean,
  yellowKeyCollected: boolean,
  redKeyCollected: boolean,
  anyPowerupCollected: boolean,
  livesRemaining: number,
  applesRemaining: number,
  locksRemaining: number,
  minesRemaining: number,
  time: number,
}
/**
 * Check if an achievement has been unlocked when beating a level.
 */
export function checkAchievementForLevelCompletion(completion: LevelCompletionStats) {
  const level = getLevelById(completion.levelId);

  if (completion.perfect) {
    unlockAchievement(Achievement.BeatAnyLevelPerfect);
  }

  if (completion.livesRemaining === 0) {
    unlockAchievement(Achievement.BeatAnyLevelNoHeartsLeft);
  }

  if (completion.difficultyIndex === 4) {
    unlockAchievement(Achievement.BeatAnyLevelUltra);
  }

  if (level === LEVEL_01 || level === LEVEL_01_HARD || level === LEVEL_01_ULTRA) {
    unlockAchievement(Achievement.BeatLevelSnekadia);
  }

  if (level === BOSS_LEVEL_THE_TECHNICIAN) {
    unlockAchievement(Achievement.BeatLevelTechnician);
  }

  if (level === LEVEL_10) {
    unlockAchievement(Achievement.BeatLevelXFactor);
  }

  if (level === LEVEL_99) {
    unlockAchievement(Achievement.BeatLevelSurvive);
  }

  if (level === LEVEL_99 && !completion.redKeyCollected) {
    unlockAchievement(Achievement.BeatLevelSurvive_NoRedKey);
  }

  if (level === VARIANT_LEVEL_99) {
    unlockAchievement(Achievement.BeatLevelEndurance);
  }

  if (level === VARIANT_LEVEL_99 && !completion.anyPowerupCollected) {
    unlockAchievement(Achievement.BeatLevelEndurance_NoPowerupsUsed);
  }

  if (level === LEVEL_17 && !completion.doorsOpen) {
    unlockAchievement(Achievement.BeatLevelBaitSwitch_EarlyExit);
  }

  if (level === LEVEL_18 && !completion.yellowKeyCollected) {
    unlockAchievement(Achievement.BeatLevelRuins_NoYellowKey);
  }

  if (level === LEVEL_18 && completion.perfect && completion.locksRemaining === 0) {
    unlockAchievement(Achievement.BeatLevelRuins_PerfectAllGates);
  }

  if (level === MAZE_03_STORAGE && completion.perfect && completion.minesRemaining === 0) {
    unlockAchievement(Achievement.BeatLevelOrdnanceVault_PerfectAllMines);
  }
}

export function checkAchievementForAllWearablesCollected() {
  const unlocked = saveDataStore.getUnlockedWearables();
  const items = Object.values(WearableFrame).filter(v => v && typeof v === 'number');
  if (items.every(item => unlocked[item])) {
    unlockAchievement(Achievement.CollectAllWearableItems);
  }
}
