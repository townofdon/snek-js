import React, { useEffect, useRef } from "react"
import { EditorSketchReturn, editorSketch } from "./editorSketch";
import { EditorData } from "../types";

interface EditorCanvasProps {
  data: EditorData,
}

export const EditorCanvas = ({ data }: EditorCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const sketch = useRef<EditorSketchReturn | null>(null);

  useEffect(() => {
    if (canvasRef.current && !sketch.current) {
      sketch.current = editorSketch();
    }
  }, [canvasRef.current]);

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
    <canvas ref={canvasRef} id="editor-canvas" className="p5Canvas" style={{ width: '600px', height: '600px' }} width="1200" height="1200" />
  );
};
