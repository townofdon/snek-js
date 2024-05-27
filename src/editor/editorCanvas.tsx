import React, { useEffect, useRef } from "react"
import { EditorSketchReturn, editorSketch } from "./editorSketch";
import { EditorData } from "../types";

interface EditorCanvasProps {
  data: EditorData,
}

export const EditorCanvas = ({ data }: EditorCanvasProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<EditorSketchReturn | null>(null);

  useEffect(() => {
    if (container.current && !sketch.current) {
      sketch.current = editorSketch(container.current);
    }
  }, [container.current]);

  useEffect(() => {
    if (sketch.current) {
      sketch.current.setData(data);
    }
  }, [data]);

  useEffect(() => {
    return () => {
      sketch.current?.cleanup();
    }
  }, []);
  return (
    <div ref={container} />
  );
};
