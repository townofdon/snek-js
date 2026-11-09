import React, { useEffect, useRef, useState } from "react";

import { Outfit } from "@/types"
import {
  OUTFIT_PREVIEW_SCALE,
  OUTFIT_PREVIEW_SIZE_X,
  OUTFIT_PREVIEW_SIZE_Y,
  outfitPreviewSketch,
  OutfitPreviewSketchReturn,
} from "./outfitPreviewSketch";

interface OutfitPreviewProps {
  outfit: Outfit,
  className?: string,
  style?: React.CSSProperties,
}
export const OutfitPreview = ({
  outfit,
  className,
  style,
}: OutfitPreviewProps) => {
  const [init, setInit] = useState(false);
  const container = useRef<HTMLDivElement>();
  const canvas = useRef<HTMLCanvasElement>();
  const sketch = useRef<OutfitPreviewSketchReturn | null>(null);
  const timeout = useRef(null);

  useEffect(() => {
    if (!init) return;
    clearTimeout(timeout.current);
    if (outfit) {
      if (!sketch.current) {
        sketch.current = outfitPreviewSketch(container.current, canvas, outfit, OUTFIT_PREVIEW_SCALE);
      }
    } else {
      sketch.current?.cleanup();
      sketch.current = null;
    }
  }, [outfit, init]);

  useEffect(() => {
    // hack to get React strict mode to not call levelPreviewSketch twice.
    setInit(true);
  }, []);

  if (!outfit) return null;

  return (
    <div
      ref={container}
      className={"canvas-container"
        + (className ? ` ${className}` : "")
      }
      style={{
        ...style,
        width: OUTFIT_PREVIEW_SIZE_X * OUTFIT_PREVIEW_SCALE,
        height: OUTFIT_PREVIEW_SIZE_Y * OUTFIT_PREVIEW_SCALE,
      }}
    >
    </div>
  )
}
