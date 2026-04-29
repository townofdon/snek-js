import { IS_LOCALHOST } from "@/constants";
import { Level } from "../types";
import { shuffleArray } from "../utils";

import { LEVEL_01 } from "./campaign/level01";
import { LEVEL_01_HARD } from "./campaign/level01hard";
import { LEVEL_01_ULTRA } from "./campaign/level01ultra";
import { LEVEL_02 } from "./campaign/level02";
import { LEVEL_03 } from "./campaign/level03";
import { LEVEL_04 } from "./campaign/level04";
import { LEVEL_05 } from "./campaign/level05";
import { LEVEL_06 } from "./campaign/level06";
import { LEVEL_07 } from "./campaign/level07";
import { LEVEL_08 } from "./campaign/level08";
import { LEVEL_09 } from "./campaign/level09";
import { LEVEL_10 } from "./campaign/level10";
import { LEVEL_11 } from "./campaign/level11";
import { LEVEL_12 } from "./campaign/level12";
import { LEVEL_13 } from "./campaign/level13";
import { LEVEL_14 } from "./campaign/level14";
import { LEVEL_15 } from "./campaign/level15";
import { LEVEL_17 } from "./campaign/level17";
import { LEVEL_18 } from "./campaign/level18";
import { LEVEL_19 } from "./campaign/level19";
import { LEVEL_20 } from "./campaign/level20";
import { LEVEL_99 } from "./campaign/level99";
import { TUTORIAL_LEVEL_10 } from "./campaign/tutorialLevel10";
import { TUTORIAL_LEVEL_11 } from "./campaign/tutorialLevel11";
import { TUTORIAL_LEVEL_20 } from "./campaign/tutorialLevel20";
import { TUTORIAL_LEVEL_30 } from "./campaign/tutorialLevel30";
import { TUTORIAL_LEVEL_40 } from "./campaign/tutorialLevel40";
import { TUTORIAL_LEVEL_50 } from "./campaign/tutorialLevel50";
import { SECRET_LEVEL_10 } from "./bonusLevels/secretLevel10";
import { SECRET_LEVEL_20 } from "./bonusLevels/secretLevel20";
import { SECRET_LEVEL_21 } from "./bonusLevels/secretLevel21";
import { VARIANT_LEVEL_03 } from "./bonusLevels/variantLevel03";
import { VARIANT_LEVEL_05 } from "./bonusLevels/variantLevel05";
import { VARIANT_LEVEL_07 } from "./bonusLevels/variantLevel07";
import { VARIANT_LEVEL_08 } from "./bonusLevels/variantLevel08";
import { VARIANT_LEVEL_10 } from "./bonusLevels/variantLevel10";
import { VARIANT_LEVEL_15 } from "./bonusLevels/variantLevel15";
import { VARIANT_LEVEL_99 } from "./bonusLevels/variantLevel99";
import { X_ACROPOLIS } from "./challenge/acropolis";
import { X_BEACONS } from "./challenge/beacons";
import { X_CASA } from "./challenge/casa";
import { X_CATACOMBS } from "./challenge/catacombs";
import { X_FORTITUDE } from "./challenge/fortitude";
import { X_GUARDIAN } from "./challenge/guardian";
import { X_KINGS_HALL } from "./challenge/kingsHall";
import { X_STONEMAZE } from "./challenge/stonemaze";
import { X_LAST_RITES } from "./challenge/lastRites";
import { X_MAKEITOUTALIVE } from "./challenge/makeitoutalive";
import { X_QUANTUM_ENTANGLEMENT } from "./challenge/quantumEntanglement";
import { X_SKILL_CHECK } from "./challenge/skillCheck";
import { X_TOO_SIMPLE } from "./challenge/tooSimple";
import { X_UNDERGROUND } from "./challenge/underground";
import { X_UNWIND } from "./challenge/unwind";
import { CHALLENGE_LEVELS, LEVELS, SECRET_LEVELS } from "./levelConstants";
import { LEVEL_WIN_GAME } from "./winGame";
import { X_GAUNTLET } from "./challenge/gauntlet";
import { X_SNEKCITY } from "./challenge/snekcity";
import { X_CUBISM } from "./challenge/cubism";
import { X_DIGIN } from "./challenge/digIn";
import { X_DATACENTER } from "./challenge/dataCenter";
import { X_SEARCHLIGHT } from "./challenge/searchlight";
import { TUTORIAL_LEVEL_51 } from "./campaign/tutorialLevel51";
import { MAZE_03_STORAGE } from "./mazes/maze03-storage";
import { MAZE_04_LOOT_ROOM } from "./mazes/maze04-lootroom";
import { MAZE_01 } from "./mazes/maze01";
import { MAZE_01_COBRA } from "./mazes/maze01-cobra";
import { LEVEL_16 } from "./campaign/level16";

const WARP_INDEX_TO_LEVEL = {
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
  152: MAZE_03_STORAGE,
  153: MAZE_04_LOOT_ROOM,
  203: VARIANT_LEVEL_03,
  205: VARIANT_LEVEL_05,
  207: VARIANT_LEVEL_07,
  208: VARIANT_LEVEL_08,
  210: VARIANT_LEVEL_10,
  215: VARIANT_LEVEL_15,
  299: VARIANT_LEVEL_99,
  310: SECRET_LEVEL_10,
  320: SECRET_LEVEL_20,
  321: SECRET_LEVEL_21,
  401: X_ACROPOLIS,
  402: X_BEACONS,
  403: X_CASA,
  404: X_CATACOMBS,
  405: X_FORTITUDE,
  406: X_GUARDIAN,
  407: X_KINGS_HALL,
  408: X_STONEMAZE,
  409: X_LAST_RITES,
  410: X_MAKEITOUTALIVE,
  411: X_QUANTUM_ENTANGLEMENT,
  412: X_SKILL_CHECK,
  413: X_TOO_SIMPLE,
  414: X_UNDERGROUND,
  415: X_UNWIND,
  416: X_GAUNTLET,
  417: X_SNEKCITY,
  418: X_CUBISM,
  419: X_DIGIN,
  420: X_DATACENTER,
  421: X_SEARCHLIGHT,
} satisfies Record<number, Level>

const LEVEL_ID_TO_WARP_INDEX: Record<string, number> = Object.keys(WARP_INDEX_TO_LEVEL)
  .reduce((acc: Record<string, number>, idx: string) => {
    if (Number.isNaN(parseInt(idx, 10))) {
      throw new Error(`Bad warp index: ${idx}`);
    }
    const level = WARP_INDEX_TO_LEVEL[idx];
    if (!level) {
      throw new Error(`warp index did not map to a level: ${idx}`);
    }
    acc[level.id] = parseInt(idx, 10);
    return acc;
  }, {} satisfies Record<string, number>);

export function getWarpLevelFromNum(levelNum: number): Level {
  return WARP_INDEX_TO_LEVEL[levelNum] || LEVEL_01;
}

export const START_CHALLENGE_LEVEL_NUM = LEVEL_ID_TO_WARP_INDEX[X_SNEKCITY.id];

export function findLevelWarpIndex(level: Level): number {
  return LEVEL_ID_TO_WARP_INDEX[level.id] || -1;
}

export function getIsChallengeLevel(level: Level) {
  if (!level) return false;
  return level.id.length && level.id[0].toLowerCase() === 'x';
}

export function hydrateRandomLevels() {
  let pool = [
    ...LEVELS,
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
  const warpMap: Record<string, Level> = {};
  [
    ...LEVELS,
    ...SECRET_LEVELS,
    ...CHALLENGE_LEVELS,
  ].forEach(level => {
    // validate level ID
    if (!level.id) {
      throw new Error(`level "${level.name}" (${level.id}) has no ID!`);
    }
    if (idMap[level.id]) {
      throw new Error(`level id collision: "${level.name}" (${level.id}) and "${idMap[level.id].name}" (${idMap[level.id].id}) both have id "${level.id}"`);
    }
    idMap[level.id] = level;
    // validate level warp index
    const exclusions = [LEVEL_WIN_GAME, MAZE_01, MAZE_01_COBRA, LEVEL_01_HARD, LEVEL_01_ULTRA];
    if (exclusions.includes(level)) {
      return;
    }
    const idx = LEVEL_ID_TO_WARP_INDEX[level.id] || -1;
    if (idx < 1) {
      throw new Error(`level "${level.name}" (${level.id}) has no warp index!`);
    }
    if (warpMap[idx]) {
      throw new Error(`warp index collision: "${level.name}" (${level.id}) and "${warpMap[idx].name}" (${warpMap[idx].id}) both have index "${idx}"`);
    }
    if (findLevelWarpIndex(level) !== idx) {
      throw new Error(`level warp index mismatch: level=${level.name}(${level.id}),idxA=${idx},idxB=${findLevelWarpIndex(level)}`);
    }
    warpMap[idx] = level;
  });
}
