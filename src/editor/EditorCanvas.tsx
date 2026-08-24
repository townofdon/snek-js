import React, { useEffect, useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { GRIDCOUNT_X, GRIDCOUNT_Y } from "../constants";
import { Tile } from "./editorTypes";
import { EditorData, EditorOptions } from "../types";
import { getCoordIndex2 } from "../utils";
import { getTileExplanation, getTileLabel } from "./utils/tileUtils";
import { EditorSketchReturn, EditorTool, Operation, editorSketch } from "./editorSketch";
import { Grid } from "@/components/Grid";

import * as styles from "./Editor.css";

interface EditorCanvasProps {
  data: EditorData;
  selected: Record<number, boolean>;
  options: EditorOptions;
  mouseAt: number;
  mouseFrom: number;
  mousePressed: boolean;
  tool: EditorTool;
  tile: Tile;
  operation: Operation;
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  handleMouseMove: React.MouseEventHandler<HTMLDivElement>;
  handleMouseLeave: React.MouseEventHandler<HTMLDivElement>;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  handleMouseUp: React.MouseEventHandler<HTMLDivElement>;
  handleClearSelected: () => void;
  editorTiles: React.ReactNode;
  editorTools: React.ReactNode;
  tileSidebar: React.ReactNode | null;
  isPreviewShowing: boolean;
}

export const EditorCanvas = ({
  data,
  selected,
  options,
  mouseAt,
  mouseFrom,
  mousePressed,
  tool,
  tile,
  operation,
  canvas,
  handleMouseMove,
  handleMouseLeave,
  handleMouseDown,
  handleMouseUp,
  handleClearSelected,
  editorTiles,
  editorTools,
  tileSidebar,
  isPreviewShowing,
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
    if (sketch.current) {
      sketch.current.setSelected(selected);
    }
  }, [selected]);

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
      sketch.current.setMousePressed(mousePressed);
      sketch.current.setTool(tool);
      sketch.current.setOperation(operation);
      sketch.current.setShowingPreview(isPreviewShowing);
    }
  }, [mouseAt, mouseFrom, mousePressed, tool, operation, isPreviewShowing]);

  useEffect(() => {
    return () => {
      sketch.current?.cleanup();
    };
  }, []);

  const preSpawnedAppleCount = (() => {
    let count = 0;
    for (let y = 0; y < GRIDCOUNT_Y; y++) {
      for (let x = 0; x < GRIDCOUNT_X; x++) {
        const coord = getCoordIndex2(x, y);
        if (data.applesMap[coord]) count++;
      }
    }
    return count;
  })();

  const tileLabel = getTileLabel(tile);

  return (
    <div className={cx('editor-canvas', styles.stack, styles.col)}>
      {editorTools}
      <div className={cx(styles.stack, styles.row, styles.alignStretch, styles.justifyStart)}>
        {tileSidebar}
        {editorTiles}
        <Grid mouseAt={mouseAt}>
          <div
            key="editor-canvas-container"
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
      <div className={styles.mapBottomShortcuts}>
        <span className={styles.item}>
          &lt;<span className={styles.val}>-+</span>&gt; cycle tile
        </span>
        <span className={styles.item}>
          &lt;<span className={styles.val}>[]</span>&gt; cycle channel
        </span>
        <span className={styles.item}>
          <span className={styles.val}>B</span>=brush
        </span>
        <span className={styles.item}>
          <span className={styles.val}>E</span>=eraser
        </span>
        <span className={styles.item}>
          <span className={styles.val}>L</span>=line
        </span>
        <span className={styles.item}>
          <span className={styles.val}>R</span>=rect
        </span>
        <span className={styles.item}>
          <span className={styles.val}>G</span>=fill
        </span>
      </div>
    </div>
  );
};
