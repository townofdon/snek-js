import { PreyType } from "@/types";

export interface TesterData {
  agents: Record<number, PreyType>,
  walls: Record<number, boolean>,
  mines: Record<number, boolean>,
  playerPosition: number,
}

export interface StagedTesterData {
  originalPosition: number,
  agent: PreyType,
  wall: boolean,
  mine: boolean,
  player: boolean,
}

export interface TesterOptions {
  numAgents: number,
  preyType: PreyType,
  genWallPercentage: number,
  genMinePercentage: number,
  genWallBorder: boolean,
  genPlayerPosition: boolean,
}
