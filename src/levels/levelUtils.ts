import { IS_LOCALHOST } from "@/constants";
import { Episode, GameMode, Level } from "../types";
import { shuffleArray } from "../utils";

import { LEVEL_01 } from "./ep01/level01";
import { LEVEL_02 } from "./ep01/level02";
import { LEVEL_03 } from "./ep01/level03";
import { LEVEL_04 } from "./ep01/level04";
import { LEVEL_05 } from "./ep01/level05";
import { LEVEL_06 } from "./ep01/level06";
import { LEVEL_07 } from "./ep01/level07";
import { LEVEL_08 } from "./ep01/level08";
import { LEVEL_09 } from "./ep01/level09";
import { LEVEL_10 } from "./ep01/level10";
import { LEVEL_11 } from "./ep01/level11";
import { LEVEL_12 } from "./ep01/level12";
import { LEVEL_13 } from "./ep01/level13";
import { LEVEL_14 } from "./ep01/level14";
import { LEVEL_15 } from "./ep01/level15";
import { LEVEL_17 } from "./ep01/level17";
import { LEVEL_18 } from "./ep01/level18";
import { LEVEL_19 } from "./ep01/level19";
import { LEVEL_20 } from "./ep01/level20";
import { LEVEL_99 } from "./ep01/level99";
import { TUTORIAL_LEVEL_10 } from "./ep01/tutorialLevel10";
import { TUTORIAL_LEVEL_11 } from "./ep01/tutorialLevel11";
import { TUTORIAL_LEVEL_20 } from "./ep01/tutorialLevel20";
import { TUTORIAL_LEVEL_30 } from "./ep01/tutorialLevel30";
import { TUTORIAL_LEVEL_40 } from "./ep01/tutorialLevel40";
import { TUTORIAL_LEVEL_50 } from "./ep01/tutorialLevel50";
import { ARCADE_LEVELS, CHALLENGE_LEVELS, LEVELS_EP_01, LEVELS_EP_02, LEVELS_EP_03, SECRET_LEVELS, TUTORIAL_LEVELS } from "./levelConstants";
import { LEVEL_WIN_GAME } from "./winGame";
import { X_SNEKCITY } from "./ep02/snekcity";
import { TUTORIAL_LEVEL_51 } from "./ep01/tutorialLevel51";
import { LEVEL_16 } from "./ep01/level16";
import { MAZE_04_LOOT_ROOM } from "./mazes/maze04-lootroom";

export const REPLAY_LEVEL_INDEX = {
  1: LEVEL_01,
  2: LEVEL_02,
  3: LEVEL_03,
  4: LEVEL_04,
  5: LEVEL_05,
  6: LEVEL_06,
  7: LEVEL_07,
  8: LEVEL_08,
  9: LEVEL_09,
  10: LEVEL_10,
  11: LEVEL_11,
  12: LEVEL_12,
  13: LEVEL_13,
  14: LEVEL_14,
  15: LEVEL_15,
  16: LEVEL_16,
  17: LEVEL_17,
  18: LEVEL_18,
  19: LEVEL_19,
  20: LEVEL_20,
  99: LEVEL_99,
  110: TUTORIAL_LEVEL_10,
  111: TUTORIAL_LEVEL_11,
  120: TUTORIAL_LEVEL_20,
  130: TUTORIAL_LEVEL_30,
  140: TUTORIAL_LEVEL_40,
  150: TUTORIAL_LEVEL_50,
  151: TUTORIAL_LEVEL_51,
} satisfies Record<number, Level>

export const START_CHALLENGE_LEVEL_ID = X_SNEKCITY.id;

// TODO: REMOVE IN FAVOR OF getEpisodeFromLevel()
export function getIsChallengeLevel(level: Level) {
  if (!level) return false;
  return LEVELS_EP_02.includes(level);
  // return level.id.length && level.id[0].toLowerCase() === 'x';
}

export function getEpisodeFromLevel(level: Level) {
  if (!level) return Episode.None;
  if (LEVELS_EP_01.includes(level)) return Episode.E1;
  if (LEVELS_EP_02.includes(level)) return Episode.E2;
  if (LEVELS_EP_03.includes(level)) return Episode.E3;
  return Episode.None;
}

export function hydrateRandomLevels() {
  let pool = [
    ...LEVELS_EP_01,
    ...SECRET_LEVELS,
    ...CHALLENGE_LEVELS,
  ].filter(level => !!level.id);
  for (let i = 0; i < 5; i++) {
    pool = shuffleArray(pool);
  }
  randomLevels = pool.slice(0, 20);
}

let randomLevels: Level[] = [];
hydrateRandomLevels();

export function getNumRandomLevelsRemaining() {
  return randomLevels.length;
}

export function getNextRandomLevel(): Level | null {
  if (!randomLevels.length) {
    hydrateRandomLevels();
    return LEVEL_WIN_GAME;
  }
  const level = randomLevels.shift();
  return level;
}

export function validateLevels() {
  if (!IS_LOCALHOST) return;
  const idMap: Record<string, Level> = {};
  [
    ...LEVELS_EP_01,
    ...LEVELS_EP_02,
    ...LEVELS_EP_03,
    ...SECRET_LEVELS,
  ].forEach(level => {
    // validate level ID
    if (!level.id) {
      throw new Error(`level "${level.name}" (${level.id}) has no ID!`);
    }
    if (idMap[level.id]) {
      throw new Error(`level id collision: "${level.name}" (${level.id}) and "${idMap[level.id].name}" (${idMap[level.id].id}) both have id "${level.id}"`);
    }
    idMap[level.id] = level;
  });
}

/**
 * @throws {Error} if no level found
 */
export function getLevelById(id: string): Level {
  if (!id) {
    throw new Error(`unable to find level for id=${id || '<empty>'}`);
  }
  const pool = [
    ...LEVELS_EP_01,
    ...LEVELS_EP_02,
    ...LEVELS_EP_03,
    ...SECRET_LEVELS,
  ];
  for (let i = 0; i < pool.length; i++) {
    if (pool[i].id === id) return pool[i];
  }
  return null;
}

export function getStartLevel(gameMode: GameMode, episode: Episode): Level {
  switch (gameMode) {
    case GameMode.Normal:
      // fallthrough
    case GameMode.Casual:
      // fallthrough
    case GameMode.Cobra:
      switch (episode) {
        case Episode.E1:
          return LEVELS_EP_01[0];
        case Episode.E2:
          return LEVELS_EP_02[0];
        case Episode.E3:
          return LEVELS_EP_03[0];
      }
      return LEVELS_EP_01[0];
    case GameMode.Arcade:
      return ARCADE_LEVELS[0][0];
    case GameMode.Tutorial:
      return TUTORIAL_LEVELS[0];
  }
  return MAZE_04_LOOT_ROOM;
}
