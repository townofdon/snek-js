import React, { useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { PushableType } from "../types";
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from "../constants";
import { Stack } from "@/components/Stack";
import { sidebarPushablesSketch, SidebarPushablesSketchReturn } from "./sidebarPushablesSketch";

import * as styles from "./Editor.css";

interface SidebarPushablesProps {
  activePushable: PushableType,
  setPushable: (pushable: PushableType) => void,
}

export const SidebarPushables = ({ activePushable, setPushable }: SidebarPushablesProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<SidebarPushablesSketchReturn | null>(null);
  const canvasRef = {
    [PushableType.None]: useRef<HTMLCanvasElement>(null),
    [PushableType.Box1]: useRef<HTMLCanvasElement>(null),
    [PushableType.Box1B]: useRef<HTMLCanvasElement>(null),
    [PushableType.Box2]: useRef<HTMLCanvasElement>(null),
    [PushableType.Box2B]: useRef<HTMLCanvasElement>(null),
    [PushableType.Box2R]: useRef<HTMLCanvasElement>(null),
    [PushableType.MirrorNE]: useRef<HTMLCanvasElement>(null),
    [PushableType.MirrorNW]: useRef<HTMLCanvasElement>(null),
    [PushableType.MirrorSE]: useRef<HTMLCanvasElement>(null),
    [PushableType.MirrorSW]: useRef<HTMLCanvasElement>(null),
    [PushableType.Yuzu]: useRef<HTMLCanvasElement>(null),
  } satisfies Record<PushableType, React.MutableRefObject<HTMLCanvasElement>>;

  useLayoutEffect(() => {
    if (container.current && canvasRef[PushableType.Box1].current && !sketch.current) {
      sketch.current = sidebarPushablesSketch(container.current, canvasRef);
    }
  }, [container.current, canvasRef[PushableType.Box1].current]);

  const renderButton = (pushable: PushableType, isLeft = false) => {
    const text = ({
      [PushableType.Box1]: '1',
      [PushableType.None]: "2",
      [PushableType.Box1B]: "3",
      [PushableType.Box2]: "4",
      [PushableType.Box2B]: "5",
      [PushableType.Box2R]: "6",
      [PushableType.MirrorNE]: "7",
      [PushableType.MirrorNW]: "8",
      [PushableType.MirrorSE]: "9",
      [PushableType.MirrorSW]: "10",
      [PushableType.Yuzu]: "11",
    } satisfies Record<PushableType, string>)[pushable];
    const color = pushable === activePushable ? '#ffffff' : '#444'
    return (
      <div key={pushable} className={styles.portalChannelSelect}>
        <button
          onClick={() => setPushable(pushable)}
          className={cx(styles.portalChannel, styles.noGrayscale, { [styles.active]: pushable === activePushable })}
          style={{ backgroundColor: color }}
        >
          {pushable !== PushableType.None && (
            <canvas
              ref={canvasRef[pushable]}
              id={`editor-sidebar-pushable-${pushable}`}
              className={styles.barrierPreview}
              width={BLOCK_SIZE_X}
              height={BLOCK_SIZE_Y}
              style={{ backgroundColor: '#343434' }}
            />
          )}
          {text}
          <span className={cx('tooltip', styles.tooltip, { [styles.customAnchor]: isLeft })}>
            {pushableLabel(pushable)}
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
          {renderButton(PushableType.Box1)}
          {renderButton(PushableType.Box1B)}
          {renderButton(PushableType.Box2)}
          {renderButton(PushableType.Box2B)}
          {renderButton(PushableType.Box2R)}
          {renderButton(PushableType.MirrorNE)}
          {renderButton(PushableType.MirrorNW)}
          {renderButton(PushableType.MirrorSE)}
          {renderButton(PushableType.MirrorSW)}
          {renderButton(PushableType.Yuzu)}
        </div>
      </Stack>
    </div>
  );
}

const pushableLabel = (annotation: PushableType) => {
  const tooltipText = ({
    [PushableType.None]: "None",
    [PushableType.Box1]: "Box1",
    [PushableType.Box1B]: "Box1B",
    [PushableType.Box2]: "Box2",
    [PushableType.Box2B]: "Box2B",
    [PushableType.Box2R]: "Box2R",
    [PushableType.MirrorNE]: "Mirror NE",
    [PushableType.MirrorNW]: "Mirror NW",
    [PushableType.MirrorSE]: "Mirror SE",
    [PushableType.MirrorSW]: "Mirror SW",
    [PushableType.Yuzu]: "Yuzu",
  } satisfies Record<PushableType, string>)[annotation];
  return tooltipText || 'Unknown';
}
