import { Level } from "../types";
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
import { LEVEL_01_HARD } from "./level01hard";
import { LEVEL_01_ULTRA } from "./level01ultra";

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

export const MAIN_TITLE_SCREEN_LEVEL = LEVEL_00;

export const START_LEVEL = MAZE_01;
export const LEVEL_AFTER_WIN = LEVEL_01;
export const LEVEL_AFTER_WIN_HARD = LEVEL_01_HARD;
export const LEVEL_AFTER_WIN_ULTRA = LEVEL_01_ULTRA;
