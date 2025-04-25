import { Area, Level } from "../types";
import { LEVEL_00 } from "./level00";
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
import { LEVEL_12 } from "./level12";
import { LEVEL_11 } from "./level11";
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

export const LEVELS: Level[] = [
    MAZE_01,
    LEVEL_01,
    LEVEL_02,
    LEVEL_03,
    TUTORIAL_LEVEL_10,
    LEVEL_04,
    LEVEL_05,
    LEVEL_06,
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

export const AREA_01: Area = {
    name: 'zone 01',
    levels: [
        LEVEL_01,
        LEVEL_02,
        LEVEL_03,
    ],
}
export const AREA_02: Area = {
    name: 'zone 02', // metropolis
    levels: [
        LEVEL_04,
        LEVEL_05,
        LEVEL_06,
        LEVEL_07,
        LEVEL_08,
        LEVEL_09,
        LEVEL_10,
    ]
}
export const AREA_03: Area = {
    name: 'zone 03',
    levels: [
        LEVEL_11,
        LEVEL_12,
    ]
}
export const AREA_04: Area = {
    name: 'zone 04', // lab zone
    levels: [
        LEVEL_13,
        LEVEL_14,
        LEVEL_15,
    ]
}
export const AREA_05: Area = {
    name: 'zone 05', // ultimate zone
    levels: [
        LEVEL_16,
        LEVEL_17,
        LEVEL_18,
        LEVEL_19,
        LEVEL_99,
    ]
}

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
]

export const CHALLENGE_LEVELS: Level[] = [
    X_ACROPOLIS,
    X_BEACONS,
    X_CASA,
    X_CATACOMBS,
    X_FORTITUDE,
    X_GUARDIAN,
    X_KINGS_HALL,
    X_LAST_RITES,
    X_MAKEITOUTALIVE,
    X_QUANTUM_ENTANGLEMENT,
    X_SKILL_CHECK,
    X_STONEMAZE,
    X_TOO_SIMPLE,
    X_UNDERGROUND,
    X_UNWIND,
    X_GAUNTLET,
];

export const MAIN_TITLE_SCREEN_LEVEL = LEVEL_00;

export const START_LEVEL = MAZE_01;
export const START_LEVEL_COBRA = MAZE_01_COBRA;
export const FIRST_CHALLENGE_LEVEL = X_ACROPOLIS;
