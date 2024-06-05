import React, { useEffect, useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { EditorSketchReturn, editorSketch } from "./editorSketch";
import { EditorData } from "../types";

import * as styles from "./Editor.css";

interface EditorCanvasProps {
  data: EditorData;
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
        <div
          ref={container}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
};
