import React, { useEffect, useRef } from "react";
import cx from "classnames";

import { DIMENSIONS, GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";
import { TESTER_INITIAL_DATA, TESTER_INITIAL_OPTIONS, TESTER_INITIAL_STAGED_DATA } from "./testerConstants";
import { clamp, getCoordIndex, getCoordIndex2 } from "@/utils";
import { useRefState } from "@/editor/hooks/useRefState";
import { Stack } from "@/components/Stack";
import { TesterOptionsPanel } from "./TesterOptionsPanel";
import { TesterCanvas } from "./TesterCanvas";

import * as styles from "./astar-tester.css";
import { PreyType } from "@/types";
import { Vector } from "p5";
import { MouseButton } from "@/editor/utils/keyboardUtils";
import { StagedTesterData } from "./testerTypes";

enum DrawMode {
  Move,
  Draw,
  Erase,
}

export const AStarTester = () => {
  const [mode, modeRef, setMode] = useRefState(DrawMode.Move);
  const [data, dataRef, setData] = useRefState(TESTER_INITIAL_DATA);
  const [staged, stagedRef, setStaged] = useRefState(TESTER_INITIAL_STAGED_DATA); // uncommitted data that gets applied as an overlay to sketchData
  const [sketchData, sketchDataRef, setSketchData] = useRefState(TESTER_INITIAL_DATA);
  const [options, optionsRef, setOptions] = useRefState(TESTER_INITIAL_OPTIONS);
  const [mouseAt, mouseAtRef, setMouseAt] = useRefState(-1);
  const [mouseFrom, mouseFromRef, setMouseFrom] = useRefState(-1);
  const [mousePressed, mousePressedRef, setMousePressed] = useRefState(false);

  useEffect(() => {
    if (mousePressed && mouseAt >= 0) {
      const agents: Record<number, PreyType> = { ...data.agents, ...(staged.agent ? { [mouseAt]: staged.agent } : {}) };
      const mines: Record<number, boolean> = { ...data.mines, ...(staged.mine ? { [mouseAt]: staged.mine } : {}) };
      const walls: Record<number, boolean> = { ...data.walls, ...(staged.wall ? { [mouseAt]: staged.wall } : {}) };
      const playerPosition = staged.player ? mouseAt : data.playerPosition;
      setSketchData({ agents, mines, walls, playerPosition });
    } else {
      setSketchData({ ...data });
    }
  }, [data, staged, mouseAt, mousePressed]);

  const handleMouseMove = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = Math.floor(clamp(ev.nativeEvent.offsetX, 0, DIMENSIONS.x - 1) / DIMENSIONS.x * GRIDCOUNT_X);
    const y = Math.floor(clamp(ev.nativeEvent.offsetY, 0, DIMENSIONS.y - 1) / DIMENSIONS.y * GRIDCOUNT_Y);
    const coord = getCoordIndex2(x, y);
    setMouseAt(coord);
  };

  const handleMouseLeave = () => {
    setMouseAt(-1);
  }

  const handleMouseDown = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // if already pressed, and different mouse button gets clicked, cancel the current operation
    if (mousePressedRef.current && ev.nativeEvent.button !== MouseButton.Left) {
      setMousePressed(false);
      return;
    }
    setMouseFrom(mouseAtRef.current);
    setMousePressed(ev.nativeEvent.button === MouseButton.Left);
    const coord = mouseAtRef.current;
    const hasPlayerAtCoord = dataRef.current.playerPosition === coord;
    setStaged({
      agent: dataRef.current.agents[coord],
      wall: dataRef.current.walls[coord],
      mine: dataRef.current.mines[coord],
      player: hasPlayerAtCoord,
    });
    setData({
      agents: { ...dataRef.current.agents, [coord]: PreyType.None },
      mines: { ...dataRef.current.mines, [coord]: false },
      walls: { ... dataRef.current.walls, [coord]: false },
      playerPosition: hasPlayerAtCoord ? -1 : dataRef.current.playerPosition,
    });
  };

  const handleMouseUp = (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setMousePressed(false);
    const coord = mouseAtRef.current;
    const agents: Record<number, PreyType> = { ...data.agents, ...(staged.agent ? { [coord]: staged.agent } : {}) };
    const mines: Record<number, boolean> = { ...data.mines, ...(staged.mine ? { [coord]: staged.mine } : {}) };
    const walls: Record<number, boolean> = { ...data.walls, ...(staged.wall ? { [coord]: staged.wall } : {}) };
    const playerPosition = staged.player ? coord : data.playerPosition;
    setData({ agents, mines, walls, playerPosition });
  };

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
    const playerPosition = options.genPlayerPosition ? getNextAvailableCell(0) : -1;
    setData(data => ({
      ...data,
      walls,
      mines,
      agents,
      playerPosition,
    }));
  };

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
            data={sketchData}
            mouseAt={mouseAt}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
            handleMouseDown={handleMouseDown}
            handleMouseUp={handleMouseUp}
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
