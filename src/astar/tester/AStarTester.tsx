import React, { useRef } from "react";
import cx from "classnames";

import { DIMENSIONS, GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";
import { TESTER_INITIAL_DATA, TESTER_INITIAL_OPTIONS } from "./testerConstants";
import { clamp, getCoordIndex2 } from "@/utils";
import { useRefState } from "@/editor/hooks/useRefState";
import { Stack } from "@/components/Stack";
import { TesterOptionsPanel } from "./TesterOptionsPanel";
import { TesterCanvas } from "./TesterCanvas";

import * as styles from "./astar-tester.css";
import { PreyType } from "@/types";
import { Vector } from "p5";

export const AStarTester = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [data, dataRef, setData] = useRefState(TESTER_INITIAL_DATA);
  const [options, optionsRef, setOptions] = useRefState(TESTER_INITIAL_OPTIONS);
  const [mouseAt, mouseAtRef, setMouseAt] = useRefState(-1);

  const handleMouseMove = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = Math.floor(clamp(ev.nativeEvent.offsetX, 0, DIMENSIONS.x - 1) / DIMENSIONS.x * GRIDCOUNT_X);
    const y = Math.floor(clamp(ev.nativeEvent.offsetY, 0, DIMENSIONS.y - 1) / DIMENSIONS.y * GRIDCOUNT_Y);
    const coord = getCoordIndex2(x, y);
    setMouseAt(coord);
  };

  const handleMouseLeave = () => {
    setMouseAt(-1);
  }

  const handleGenerateMap = () => {
    const walls: Record<number, boolean> = {}
    const mines: Record<number, boolean> = {}
    const agents: Record<number, PreyType> = {}
    // fill walls, mines
    for (let coord = 0; coord < GRIDCOUNT_X * GRIDCOUNT_Y; coord++) {
      const x = Math.floor(coord % GRIDCOUNT_X);
      const y = Math.floor(coord / GRIDCOUNT_X);
      const isBorder = x === 0 || y === 0 || x === GRIDCOUNT_X - 1 || y === GRIDCOUNT_Y - 1;
      walls[coord] = false;
      mines[coord] = false;
      agents[coord] = PreyType.None;
      if (options.genWallBorder && isBorder) {
        walls[coord] = true;
      } else if (Math.random() <= options.genWallPercentage) {
        walls[coord] = true;
      } else if (Math.random() <= options.genMinePercentage) {
        mines[coord] = true;
      }
    }
    const getNextAvailableCell = (numTries: number): number => {
      if (numTries > 300) {
        throw new Error('Unable to find available cell, please try again.');
      }
      const coord = Math.floor(Math.random() * GRIDCOUNT_X * GRIDCOUNT_Y);
      if (walls[coord] || mines[coord] || agents[coord]) {
        return getNextAvailableCell(numTries + 1);
      } else {
        return coord;
      }
    }
    // fill agents
    for (let i = 0; i < options.numAgents; i++) {
      const coord = getNextAvailableCell(0);
      agents[coord] = options.preyType;
    }
    // set player position
    const playerCoord = getNextAvailableCell(0);
    const playerPosition = options.genPlayerPosition
      ? new Vector(Math.floor(playerCoord % GRIDCOUNT_X), Math.floor(playerCoord / GRIDCOUNT_X))
      : new Vector(-1, -1);
    setData(data => ({
      ...data,
      walls,
      mines,
      agents,
      playerPosition,
    }));
  }

  return (
    <div className={cx(styles.layout)}>
      <div className={styles.container}>
        <Stack row>
          <h1 className={styles.mainTitle}>AStar Tester</h1>
        </Stack>
      </div>
      <div className={styles.container}>
        <Stack row align="start">
          <TesterCanvas
            data={data}
            mouseAt={mouseAt}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
            handleMouseDown={() => {}}
            handleMouseUp={() => {}}
          />
          <TesterOptionsPanel
            options={options}
            setOptions={setOptions}
            handleGenerateMap={handleGenerateMap}
          />
        </Stack>
      </div>
    </div>
  );
};
