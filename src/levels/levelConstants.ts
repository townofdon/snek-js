import { Level } from "../types";
import { LEVEL_00 } from "./campaign/level00";
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
import { LEVEL_12 } from "./campaign/level12";
import { LEVEL_11 } from "./campaign/level11";
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
import { TUTORIAL_LEVEL_51 } from "./campaign/tutorialLevel51";
import { LEVEL_WIN_GAME } from "./winGame";
import { MAZE_01 } from "./mazes/maze01";
import { MAZE_01_COBRA } from "./mazes/maze01-cobra";
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
import { X_UNWIND } from "./challenge/unwind";
import { X_UNDERGROUND } from "./challenge/underground";
import { X_GAUNTLET } from "./challenge/gauntlet";
import { X_SNEKCITY } from "./challenge/snekcity";
import { X_CUBISM } from "./challenge/cubism";
import { X_DIGIN } from "./challenge/digIn";
import { X_DATACENTER } from "./challenge/dataCenter";
import { X_SEARCHLIGHT } from "./challenge/searchlight";
import { MAZE_04_LOOT_ROOM } from "./mazes/maze04-lootroom";
import { MAZE_03_STORAGE } from "./mazes/maze03-storage";

export const LEVELS: Level[] = [
    MAZE_01,
    LEVEL_01,
    TUTORIAL_LEVEL_10,
    LEVEL_02,
    LEVEL_03,
    TUTORIAL_LEVEL_11,
    LEVEL_04,
    LEVEL_05,
    LEVEL_06,
    TUTORIAL_LEVEL_50,
    LEVEL_07,
    LEVEL_08,
    LEVEL_09,
    LEVEL_10,
    TUTORIAL_LEVEL_20,
    LEVEL_11,
    LEVEL_12,
    TUTORIAL_LEVEL_30,
    LEVEL_13,
    LEVEL_14,
    LEVEL_15,
    TUTORIAL_LEVEL_40,
    LEVEL_16,
    LEVEL_17,
    LEVEL_18,
    LEVEL_19,
    LEVEL_99,
    LEVEL_WIN_GAME,
];

export const CAMPAIGN_LEVELS = LEVELS.filter(level => {
    switch (level) {
        case MAZE_01:
        case TUTORIAL_LEVEL_10:
        case TUTORIAL_LEVEL_11:
        case TUTORIAL_LEVEL_20:
        case TUTORIAL_LEVEL_30:
        case TUTORIAL_LEVEL_40:
        case TUTORIAL_LEVEL_50:
        case TUTORIAL_LEVEL_51:
        case LEVEL_WIN_GAME:
            return false;
        default:
            return true;
    }
});

export const SECRET_LEVELS = [
    SECRET_LEVEL_10,
    SECRET_LEVEL_20,
    SECRET_LEVEL_21,
    VARIANT_LEVEL_03,
    VARIANT_LEVEL_05,
    VARIANT_LEVEL_07,
    VARIANT_LEVEL_08,
    VARIANT_LEVEL_10,
    VARIANT_LEVEL_15,
    VARIANT_LEVEL_99,
    TUTORIAL_LEVEL_51,
    MAZE_03_STORAGE,
]

export const CHALLENGE_LEVELS: Level[] = [
    X_SNEKCITY,
    X_ACROPOLIS,
    X_BEACONS,
    X_CUBISM,
    X_CASA,
    X_DIGIN,
    X_CATACOMBS,
    X_FORTITUDE,
    X_GUARDIAN,
    X_SEARCHLIGHT,
    X_KINGS_HALL,
    X_LAST_RITES,
    X_MAKEITOUTALIVE,
    X_QUANTUM_ENTANGLEMENT,
    X_SKILL_CHECK,
    X_STONEMAZE,
    X_TOO_SIMPLE,
    X_DATACENTER,
    X_UNDERGROUND,
    X_UNWIND,
    X_GAUNTLET,
];

export const MAIN_TITLE_SCREEN_LEVEL = LEVEL_00;

export const START_LEVEL = MAZE_01;
export const START_LEVEL_COBRA = MAZE_01_COBRA;
export const FIRST_CHALLENGE_LEVEL = X_SNEKCITY;
