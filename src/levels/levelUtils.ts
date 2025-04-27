import { Level } from "../types";
import { LEVEL_01 } from "./level01";
import { LEVEL_02 } from "./level02";
import { LEVEL_03 } from "./level03";
import { LEVEL_04 } from "./level04";
import { LEVEL_05 } from "./level05";
import { LEVEL_06 } from "./level06";
import { LEVEL_07 } from "./level07";
import { LEVEL_08 } from "./level08";
import { LEVEL_09 } from "./level09";
import { LEVEL_10 } from "./level10";
import { LEVEL_11 } from "./level11";
import { LEVEL_12 } from "./level12";
import { LEVEL_13 } from "./level13";
import { LEVEL_14 } from "./level14";
import { LEVEL_15 } from "./level15";
import { LEVEL_17 } from "./level17";
import { LEVEL_16 } from "./level16";
import { LEVEL_18 } from "./level18";
import { LEVEL_19 } from "./level19";
import { LEVEL_99 } from "./level99";
import { TUTORIAL_LEVEL_10 } from "./tutorialLevel10";
import { TUTORIAL_LEVEL_20 } from "./tutorialLevel20";
import { TUTORIAL_LEVEL_30 } from "./tutorialLevel30";
import { TUTORIAL_LEVEL_40 } from "./tutorialLevel40";
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
import { CHALLENGE_LEVELS, LEVELS, SECRET_LEVELS } from "./levels";
import { shuffleArray } from "../utils";
import { LEVEL_WIN_GAME } from "./winGame";
import { X_GAUNTLET } from "./challenge/gauntlet";
import { X_SNEKCITY } from "./challenge/snekcity";

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
    case 120:
      return TUTORIAL_LEVEL_20;
    case 130:
      return TUTORIAL_LEVEL_30;
    case 140:
      return TUTORIAL_LEVEL_40;

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

    default:
      return LEVEL_01;
  }
}

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
  for (let i = 1; i < 200; i++) {
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
