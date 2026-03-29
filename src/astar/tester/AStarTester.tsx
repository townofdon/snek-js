import React, { useRef } from "react";
import cx from "classnames";

import { DIMENSIONS, GRIDCOUNT_X, GRIDCOUNT_Y } from "@/constants";
import { useRefState } from "@/editor/hooks/useRefState";
import { clamp, getCoordIndex2 } from "@/utils";
import { Grid } from "@/components/Grid";
import { Stack } from "@/components/Stack";
import { OptionsPanel } from "./OptionsPanel";

import * as styles from "./astar-tester.css";
import { TesterCanvas } from "./TesterCanvas";

export const AStarTester = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
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
            data={{}}
            mouseAt={mouseAt}
            handleMouseMove={handleMouseMove}
            handleMouseLeave={handleMouseLeave}
            handleMouseDown={() => {}}
            handleMouseUp={() => {}}
          />
          <OptionsPanel />
        </Stack>
      </div>
    </div>
  );
};
