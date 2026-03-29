import { Vector } from "p5";
import { PreyType } from "@/types";

export interface TesterData {
  agents: Record<number, PreyType>,
  walls: Record<number, boolean>,
  mines: Record<number, boolean>,
  playerPosition: Vector,
}

export interface TesterOptions {
  numAgents: number,
  preyType: PreyType,
  genWallPercentage: number,
  genMinePercentage: number,
  genWallBorder: boolean,
  genPlayerPosition: boolean,
}
