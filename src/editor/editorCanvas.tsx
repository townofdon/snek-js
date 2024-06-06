import React, { useEffect, useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { EditorSketchReturn, EditorTool, Operation, editorSketch } from "./editorSketch";
import { EditorData } from "../types";

import * as styles from "./Editor.css";
import { Grid } from "./components/Grid";

interface EditorCanvasProps {
  data: EditorData;
  mouseAt: number;
  mouseFrom: number;
  tool: EditorTool;
  operation: Operation;
  canvas: React.MutableRefObject<HTMLCanvasElement>;
  handleMouseMove: React.MouseEventHandler<HTMLDivElement>;
  handleMouseLeave: React.MouseEventHandler<HTMLDivElement>;
  handleMouseDown: React.MouseEventHandler<HTMLDivElement>;
  handleMouseUp: React.MouseEventHandler<HTMLDivElement>;
  editorTiles: React.ReactNode;
  editorTools: React.ReactNode;
}

export const EditorCanvas = ({
  data,
  mouseAt,
  mouseFrom,
  tool,
  operation,
  canvas,
  handleMouseMove,
  handleMouseLeave,
  handleMouseDown,
  handleMouseUp,
  editorTiles,
  editorTools,
}: EditorCanvasProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<EditorSketchReturn | null>(null);

  useLayoutEffect(() => {
    if (container.current && !sketch.current) {
      sketch.current = editorSketch(container.current, canvas);
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
  return (
    <div className={cx(styles.stack, styles.col)}>
      {editorTools}
      <div className={cx(styles.stack, styles.row, styles.alignStretch)}>
        {editorTiles}
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
    </div>
  );
};
