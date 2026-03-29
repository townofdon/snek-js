import { Vector } from "p5";
import { StagedTesterData, TesterData, TesterOptions } from "./testerTypes";
import { PreyType } from "@/types";

export const TESTER_INITIAL_DATA: TesterData = {
  agents: {
    63: 1,
    123: 2,
    183: 3,
    243: 4,
    // 273: 5,
  },
  walls: {
    0: true,
    30: true,
    60: true,
    29: true,
    59: true,
    89: true,
  },
  mines: {
    73: true,
    104: true,
    135: true,
  },
  playerPosition: 465,
} satisfies TesterData;

export const TESTER_INITIAL_OPTIONS: TesterOptions = {
  numAgents: 1,
  preyType: PreyType.Grub,
  genWallPercentage: 0.1,
  genMinePercentage: 0.05,
  genWallBorder: true,
  genPlayerPosition: true,
} satisfies TesterOptions;
