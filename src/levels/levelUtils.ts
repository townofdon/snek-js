
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
import { Level } from "../types";
import { IS_DEV } from "../constants";

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
    default:
      if (IS_DEV) {
        throw new Error(`Could not find warp level for num: ${levelNum}`)
      }
      return LEVEL_01;
  }
}


export function findLevelWarpIndex(level: Level): number {
  for (let i = 1; i < 200; i++) {
    if (getWarpLevelFromNum(i) === level) return i;
  }
  return -1;
}
