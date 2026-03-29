import React, { useEffect, useLayoutEffect, useRef } from "react";

import { TesterData } from "./testerTypes";
import { testerSketch, TesterSketchReturn } from "./testerSketch";
import { Grid } from "@/components/Grid";

import * as styles from "./astar-tester.css";

interface TesterCanvasProps {
  data: TesterData;
  mouseAt: number;
  handleMouseMove: React.MouseEventHandler<HTMLDivElement>;
  handleMouseLeave: React.MouseEventHandler<HTMLDivElement>;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  handleMouseUp: React.MouseEventHandler<HTMLDivElement>;
}

export const TesterCanvas = ({
  data,
  mouseAt,
  handleMouseMove,
  handleMouseLeave,
  handleMouseDown,
  handleMouseUp,
}: TesterCanvasProps) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<TesterSketchReturn | null>(null);

  useLayoutEffect(() => {
    if (container.current && !sketch.current) {
      sketch.current = testerSketch(container.current, canvas);
    }
  }, [container.current]);

  useLayoutEffect(() => {
    if (sketch.current) {
      sketch.current.setData(data);
    }
  }, [data]);

  useLayoutEffect(() => {
    if (sketch.current) {
      sketch.current.setMouseAt(mouseAt);
    }
  }, [mouseAt]);

  useEffect(() => {
    return () => {
      sketch.current?.cleanup();
    };
  }, []);

  return (
    <Grid mouseAt={mouseAt}>
      <div
        key="astar-tester-canvas-container"
        className={styles.canvasContainer}
        ref={container}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </Grid>
  );
};
