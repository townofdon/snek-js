import React, { useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { MapAnnotation } from "../types";
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from "../constants";
import { sidebarAnnotationsSketch, SidebarAnnotationsSketchReturn } from "./sidebarAnnotationsSketch";

import * as styles from "./Editor.css";
import { Stack } from "@/components/Stack";

interface SidebarMapAnnotationsProps {
  activeAnnotation: MapAnnotation,
  setAnnotation: (annotation: MapAnnotation) => void,
}

export const SidebarMapAnnotations = ({ activeAnnotation: activeMapAnnotation, setAnnotation }: SidebarMapAnnotationsProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<SidebarAnnotationsSketchReturn | null>(null);
  const canvasRef = {
    [MapAnnotation.None]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L1]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L2]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L3]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L4]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L5]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L6]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L7]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L8]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.L9]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.LA]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.ForceDirN]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.ForceDirS]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.ForceDirW]: useRef<HTMLCanvasElement>(null),
    [MapAnnotation.ForceDirE]: useRef<HTMLCanvasElement>(null),
  } satisfies Record<MapAnnotation, React.MutableRefObject<HTMLCanvasElement>>;

  useLayoutEffect(() => {
    if (container.current && canvasRef[MapAnnotation.L1].current && !sketch.current) {
      Object.values(MapAnnotation).filter(v => typeof v !== 'string').forEach(annotation => {
        if (!canvasRef[annotation].current && annotation !== MapAnnotation.None) {
          throw new Error(`No canvas exists for annotation ${annotationLabel(annotation)}`);
        }
      })
      sketch.current = sidebarAnnotationsSketch(container.current, canvasRef);
    }
  }, [container.current, canvasRef[MapAnnotation.L1].current]);

  const renderButton = (annotation: MapAnnotation, isLeft = false) => {
    const text = ({
      [MapAnnotation.None]: 'None',
      [MapAnnotation.L1]: '1',
      [MapAnnotation.L2]: '2',
      [MapAnnotation.L3]: '3',
      [MapAnnotation.L4]: '4',
      [MapAnnotation.L5]: '5',
      [MapAnnotation.L6]: '6',
      [MapAnnotation.L7]: '7',
      [MapAnnotation.L8]: '8',
      [MapAnnotation.L9]: '9',
      [MapAnnotation.LA]: 'A',
      [MapAnnotation.ForceDirN]: 'N',
      [MapAnnotation.ForceDirS]: 'S',
      [MapAnnotation.ForceDirW]: 'W',
      [MapAnnotation.ForceDirE]: 'E',
    } satisfies Record<MapAnnotation, string>)[annotation];
    const color = annotation === activeMapAnnotation ? '#ffffff' : '#444'
    return (
      <div key={annotation} className={styles.portalChannelSelect}>
        <button
          onClick={() => setAnnotation(annotation)}
          className={cx(styles.portalChannel, styles.noGrayscale, { [styles.active]: annotation === activeMapAnnotation })}
          style={{ backgroundColor: color }}
        >
          {annotation !== MapAnnotation.None && (
            <canvas
              ref={canvasRef[annotation]}
              id={`editor-sidebar-annotation-${annotation}`}
              className={styles.barrierPreview}
              width={BLOCK_SIZE_X}
              height={BLOCK_SIZE_Y}
              style={{ backgroundColor: '#343434' }}
            />
          )}
          {text}
          <span className={cx('tooltip', styles.tooltip, { [styles.customAnchor]: isLeft })}>
            {annotationLabel(annotation)}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar-barrier-types" ref={container}>
      <label>style</label>
      <Stack justify="end" align="start" noChildMargin>
        <div>
          {renderButton(MapAnnotation.L1)}
          {renderButton(MapAnnotation.L2)}
          {renderButton(MapAnnotation.L3)}
          {renderButton(MapAnnotation.L4)}
          {renderButton(MapAnnotation.L5)}
          {renderButton(MapAnnotation.L6)}
          {renderButton(MapAnnotation.L7)}
          {renderButton(MapAnnotation.L8)}
          {renderButton(MapAnnotation.L9)}
          {renderButton(MapAnnotation.LA)}
          {renderButton(MapAnnotation.ForceDirN)}
          {renderButton(MapAnnotation.ForceDirS)}
          {renderButton(MapAnnotation.ForceDirW)}
          {renderButton(MapAnnotation.ForceDirE)}
        </div>
      </Stack>
    </div>
  );
}

const annotationLabel = (annotation: MapAnnotation) => {
  const tooltipText = ({
    [MapAnnotation.None]: 'None',
    [MapAnnotation.L1]: "Label 1",
    [MapAnnotation.L2]: "Label 2",
    [MapAnnotation.L3]: "Label 3",
    [MapAnnotation.L4]: "Label 4",
    [MapAnnotation.L5]: "Label 5",
    [MapAnnotation.L6]: "Label 6",
    [MapAnnotation.L7]: "Label 7",
    [MapAnnotation.L8]: "Label 8",
    [MapAnnotation.L9]: "Label 9",
    [MapAnnotation.LA]: "Label A",
    [MapAnnotation.ForceDirN]: 'Force Dir N',
    [MapAnnotation.ForceDirS]: 'Force Dir S',
    [MapAnnotation.ForceDirW]: 'Force Dir W',
    [MapAnnotation.ForceDirE]: 'Force Dir E',
  } satisfies Record<MapAnnotation, string>)[annotation];
  return tooltipText || 'Unknown';
}
