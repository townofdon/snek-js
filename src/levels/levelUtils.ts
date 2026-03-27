import { Level } from "../types";
import { LEVEL_01 } from "./campaign/level01";
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
import { LEVEL_16 } from "./campaign/level16";
import { LEVEL_18 } from "./campaign/level18";
import { LEVEL_19 } from "./campaign/level19";
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
import { shuffleArray } from "../utils";
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

export function getWarpLevelFromNum(levelNum: number): Level {
  switch (levelNum) {
    case 1:
      return LEVEL_01;
    case 2:
      return LEVEL_02;
    case 3:
      return LEVEL_03;
    case 4:
      return LEVEL_04;
    case 5:
      return LEVEL_05;
    case 6:
      return LEVEL_06;
    case 7:
      return LEVEL_07;
    case 8:
      return LEVEL_08;
    case 9:
      return LEVEL_09;
    case 10:
      return LEVEL_10;
    case 11:
      return LEVEL_11;
    case 12:
      return LEVEL_12;
    case 13:
      return LEVEL_13;
    case 14:
      return LEVEL_14;
    case 15:
      return LEVEL_15;
    case 16:
      return LEVEL_16;
    case 17:
      return LEVEL_17;
    case 18:
      return LEVEL_18;
    case 19:
      return LEVEL_19;
    case 99:
      return LEVEL_99;

    case 110:
      return TUTORIAL_LEVEL_10;
    case 111:
      return TUTORIAL_LEVEL_11;
    case 120:
      return TUTORIAL_LEVEL_20;
    case 130:
      return TUTORIAL_LEVEL_30;
    case 140:
      return TUTORIAL_LEVEL_40;
    case 150:
      return TUTORIAL_LEVEL_50;
    case 151:
      return TUTORIAL_LEVEL_51;
    case 152:
      return MAZE_03_STORAGE;
    case 153:
      return MAZE_04_LOOT_ROOM;

    case 203:
      return VARIANT_LEVEL_03;
    case 205:
      return VARIANT_LEVEL_05;
    case 207:
      return VARIANT_LEVEL_07;
    case 208:
      return VARIANT_LEVEL_08;
    case 210:
      return VARIANT_LEVEL_10;
    case 215:
      return VARIANT_LEVEL_15;
    case 299:
      return VARIANT_LEVEL_99;

    case 310:
      return SECRET_LEVEL_10;
    case 320:
      return SECRET_LEVEL_20;
    case 321:
      return SECRET_LEVEL_21;

    case 401:
      return X_ACROPOLIS;
    case 402:
      return X_BEACONS;
    case 403:
      return X_CASA;
    case 404:
      return X_CATACOMBS;
    case 405:
      return X_FORTITUDE;
    case 406:
      return X_GUARDIAN;
    case 407:
      return X_KINGS_HALL;
    case 408:
      return X_STONEMAZE;
    case 409:
      return X_LAST_RITES;
    case 410:
      return X_MAKEITOUTALIVE;
    case 411:
      return X_QUANTUM_ENTANGLEMENT;
    case 412:
      return X_SKILL_CHECK;
    case 413:
      return X_TOO_SIMPLE;
    case 414:
      return X_UNDERGROUND;
    case 415:
      return X_UNWIND;
    case 416:
      return X_GAUNTLET;
    case 417:
      return X_SNEKCITY;
    case 418:
      return X_CUBISM;
    case 419:
      return X_DIGIN;
    case 420:
      return X_DATACENTER;
    case 421:
      return X_SEARCHLIGHT;
    default:
      return LEVEL_01;
  }
}

export const START_CHALLENGE_LEVEL_NUM = findLevelWarpIndex(X_SNEKCITY);

export function validateLevelIds() {
  const map: Record<string, Level> = {};
  [
    ...LEVELS,
    ...SECRET_LEVELS,
    ...CHALLENGE_LEVELS,
  ].forEach(level => {
    if (!level.id) return;
    if (map[level.id]) {
      throw new Error(`level id collision: "${level.name}" and "${map[level.id].name}" both have id "${level.id}"`);
    }
    map[level.id] = level;
  });
}

export function findLevelWarpIndex(level: Level): number {
  for (let i = 1; i < 420; i++) {
    if (getWarpLevelFromNum(i) === level) return i;
  }
  return -1;
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
