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
import { LEVEL_99 } from "./level99";
import { TUTORIAL_LEVEL_10 } from "./tutorialLevel10";
import { TUTORIAL_LEVEL_20 } from "./tutorialLevel20";

export const LEVELS: Level[] = [
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
    TUTORIAL_LEVEL_20,
    LEVEL_10,
    LEVEL_99,
];
export const INITIAL_LEVEL = LEVEL_01;
