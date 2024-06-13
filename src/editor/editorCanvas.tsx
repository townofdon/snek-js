import React, { useEffect, useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { GRIDCOUNT } from "../constants";
import { Tile } from "./editorTypes";
import { EditorData, EditorOptions } from "../types";
import { getCoordIndex2 } from "../utils";
import { getTileExplanation, getTileLabel } from "./utils/tileUtils";
import { EditorSketchReturn, EditorTool, Operation, editorSketch } from "./editorSketch";
import { Grid } from "./components/Grid";

import * as styles from "./Editor.css";

interface EditorCanvasProps {
  data: EditorData;
  options: EditorOptions;
  mouseAt: number;
  mouseFrom: number;
  tool: EditorTool;
  tile: Tile;
  operation: Operation;
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  handleMouseMove: React.MouseEventHandler<HTMLDivElement>;
  handleMouseLeave: React.MouseEventHandler<HTMLDivElement>;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  handleMouseUp: React.MouseEventHandler<HTMLDivElement>;
  editorTiles: React.ReactNode;
  editorTools: React.ReactNode;
  tileSidebar: React.ReactNode | null;
}

export const EditorCanvas = ({
  data,
  options,
  mouseAt,
  mouseFrom,
  tool,
  tile,
  operation,
  canvas,
  handleMouseMove,
  handleMouseLeave,
  handleMouseDown,
  handleMouseUp,
  editorTiles,
  editorTools,
  tileSidebar,
}: EditorCanvasProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<EditorSketchReturn | null>(null);
  const syncOptionsTimeout = useRef<NodeJS.Timeout>(null);

  useLayoutEffect(() => {
    if (container.current && !sketch.current) {
      sketch.current = editorSketch(container.current, canvas);
      sketch.current.setOptions(options);
    }
  }, [container.current]);

  useLayoutEffect(() => {
    if (sketch.current) {
      sketch.current.setData(data);
    }
  }, [data]);

  useLayoutEffect(() => {
    clearTimeout(syncOptionsTimeout.current);
    if (sketch.current) {
      syncOptionsTimeout.current = setTimeout(() => {
        sketch.current.setOptions(options);
      }, 40);
    }
  }, [options]);

  useLayoutEffect(() => {
    if (sketch.current) {
      sketch.current.setMouseAt(mouseAt);
      sketch.current.setMouseFrom(mouseFrom);
      sketch.current.setTool(tool);
      sketch.current.setOperation(operation);
    }
  }, [mouseAt, mouseFrom, tool, operation]);

  useEffect(() => {
    return () => {
      sketch.current?.cleanup();
    };
  }, []);

  const preSpawnedAppleCount = (() => {
    let count = 0;
    for (let y = 0; y < GRIDCOUNT.y; y++) {
      for (let x = 0; x < GRIDCOUNT.x; x++) {
        const coord = getCoordIndex2(x, y);
        if (data.applesMap[coord]) count++;
      }
    }
    return count;
  })();

  const tileLabel = getTileLabel(tile);

  return (
    <div className={cx(styles.stack, styles.col)}>
      {editorTools}
      <div className={cx(styles.stack, styles.row, styles.alignStretch)}>
        {/* <div className={cx(styles.stack, styles.row, styles.alignStretch)}> */}
          {tileSidebar}
          {editorTiles}
        {/* </div> */}
        <Grid mouseAt={mouseAt}>
          <div
            className={styles.canvasContainer}
            ref={container}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          />
        </Grid>
      </div>
      <div className={styles.mapBottomInfo}>
        <span className={styles.item}>Pre-spawned apple count: <span className={styles.val}>{preSpawnedAppleCount}</span></span>
        {tile !== Tile.None && (
          <span className={styles.item}>Current Tile: <span className={styles.val}>{tileLabel}</span></span>
        )}
      </div>
      <div className={styles.mapBottomDescription}>
        {tile !== Tile.None && (
          <span>{getTileExplanation(tile)}</span>
        )}
      </div>
    </div>
  );
};
