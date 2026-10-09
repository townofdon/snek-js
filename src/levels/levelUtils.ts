import { IS_LOCALHOST } from "@/constants";
import { Episode, Level } from "../types";
import { shuffleArray } from "../utils";

import { LEVEL_01 } from "./ep01/level01";
import { LEVEL_01_HARD } from "./ep01/level01hard";
import { LEVEL_01_ULTRA } from "./ep01/level01ultra";
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
import { X_ACROPOLIS } from "./ep02/acropolis";
import { X_BEACONS } from "./ep02/beacons";
import { X_CASA } from "./ep02/casa";
import { X_CATACOMBS } from "./ep02/catacombs";
import { X_FORTITUDE } from "./ep02/fortitude";
import { X_GUARDIAN } from "./ep02/guardian";
import { X_KINGS_HALL } from "./ep02/kingsHall";
import { X_STONEMAZE } from "./ep02/stonemaze";
import { X_LAST_RITES } from "./ep02/lastRites";
import { X_MAKEITOUTALIVE } from "./ep02/makeitoutalive";
import { X_QUANTUM_ENTANGLEMENT } from "./ep03/quantumEntanglement";
import { X_SKILL_CHECK } from "./ep02/skillCheck";
import { X_TOO_SIMPLE } from "./ep02/tooSimple";
import { X_UNDERGROUND } from "./ep02/underground";
import { X_UNWIND } from "./ep02/unwind";
import { CHALLENGE_LEVELS, LEVELS_EP_01, LEVELS_EP_02, LEVELS_EP_03, SECRET_LEVELS } from "./levelConstants";
import { LEVEL_WIN_GAME } from "./winGame";
import { X_GAUNTLET } from "./ep02/gauntlet";
import { X_SNEKCITY } from "./ep02/snekcity";
import { X_CUBISM } from "./ep02/cubism";
import { X_DIGIN } from "./ep02/digIn";
import { X_DATACENTER } from "./ep02/dataCenter";
import { X_SEARCHLIGHT } from "./ep02/searchlight";
import { TUTORIAL_LEVEL_51 } from "./ep01/tutorialLevel51";
import { MAZE_03_STORAGE } from "./mazes/maze03-storage";
import { MAZE_04_LOOT_ROOM } from "./mazes/maze04-lootroom";
import { MAZE_01 } from "./mazes/maze01";
import { MAZE_01_COBRA } from "./mazes/maze01-cobra";
import { LEVEL_16 } from "./ep01/level16";
import { BOSS_LEVEL_THE_TECHNICIAN } from "./boss/bossLevelTechnician";
import { X_BACKCHANNELS } from "./ep03/backChannels";
import { X_DETHRATTLE } from "./ep03/dethrattle";
import { X_DOOMSCROLL } from "./ep03/doomscroll";
import { X_FUELDEPOT } from "./ep03/fuelDepot";
import { X_MECHANICAL_ROOM } from "./ep03/mechanicalRoom";
import { X_POINTTAKEN } from "./ep03/pointTaken";
import { X_SHORT_FUSE } from "./ep03/shortFuse";
import { X_SPACEPORT } from "./ep03/spaceport";
import { X_WALLCRUSHER } from "./ep03/wallcrusher";

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
  501: X_BACKCHANNELS,
  502: X_DETHRATTLE,
  503: X_DOOMSCROLL,
  504: X_FUELDEPOT,
  505: X_MECHANICAL_ROOM,
  506: X_POINTTAKEN,
  507: X_SHORT_FUSE,
  508: X_SPACEPORT,
  509: X_WALLCRUSHER,
  901: BOSS_LEVEL_THE_TECHNICIAN,
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
  if (!level) return -1;
  return LEVEL_ID_TO_WARP_INDEX[level.id] || -1;
}

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
  const warpMap: Record<string, Level> = {};
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

export function findLevelFromId(id: string): (Level | null) {
  if (!id) {
    return null;
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
