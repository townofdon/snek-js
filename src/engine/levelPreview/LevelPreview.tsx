import React, { useEffect, useRef, useState } from "react";

import { Level } from "@/types"
import { levelPreviewSketch, LevelPreviewSketchReturn } from "./levelPreviewSketch";

const DEFER_LOADING_DELAY = 100;
const JITTER = 25;

interface LevelPreviewProps {
  level: Level,
  width: number,
  height: number,
  blink?: boolean,
  locked?: boolean,
  deferLoading?: boolean,
  className?: string,
  style?: React.CSSProperties,
}
export const LevelPreview = ({
  level,
  width,
  height,
  blink,
  locked,
  deferLoading,
  className,
  style,
}: LevelPreviewProps) => {
  const [init, setInit] = useState(false);
  const container = useRef<HTMLDivElement>();
  const canvas = useRef<HTMLCanvasElement>();
  const sketch = useRef<LevelPreviewSketchReturn | null>(null);
  const timeout = useRef(null);

  useEffect(() => {
    if (!init) return;
    clearTimeout(timeout.current);
    if (level) {
      const load = () => {
        if (!sketch.current) {
          sketch.current = levelPreviewSketch(container.current, canvas, width, height);
        }
        sketch.current?.setLevel(level);
      }
      if (deferLoading) {
        timeout.current = setTimeout(load, DEFER_LOADING_DELAY + Math.random() * JITTER - JITTER * 0.5);
      } else {
        load();
      }
    } else {
      sketch.current?.cleanup();
      sketch.current = null;
    }
  }, [level, init, deferLoading]);

  useEffect(() => {
    // hack to get React strict mode to not call levelPreviewSketch twice.
    setInit(true);
  }, []);

  if (!level) return null;

  return (
    <div
      ref={container}
      className={"canvas-container"
        + (blink ? " invisible" : "")
        + (className ? ` ${className}` : "")
        + (locked ? ` locked` : "")
      }
      style={{
        ...style,
        width,
        height,
      }}
    >
      {locked && (
        <>
          <span className="overworld-icon lock"
            style={{
              position: 'absolute',
              top: '45%',
            }}
          />
          <p className="locked-level-text minimood">
            Complete previous level first
          </p>
        </>
      )}
    </div>
  )
}
