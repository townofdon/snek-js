import React, { useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { EditorOptions, PipeConnection } from "../types";
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from "../constants";
import { Stack } from "@/components/Stack";
import { sidebarPipesSketch, SidebarPipesSketchReturn } from "./sidebarPipesSketch";

import * as styles from "./Editor.css";

interface SidebarPipesProps {
  activePipe: PipeConnection,
  options: EditorOptions,
  setPipe: (pickup: PipeConnection) => void,
}

export const SidebarPipes = ({ activePipe, options, setPipe }: SidebarPipesProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<SidebarPipesSketchReturn | null>(null);
  const canvasRef = {
    [PipeConnection.Unset]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.N]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.S]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.NS]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.W]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.NW]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.SW]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.NSW]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.E]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.NE]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.SE]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.NSE]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.WE]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.NWE]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.SWE]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.NSWE]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.Island]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.Barrier]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.Door]: useRef<HTMLCanvasElement>(null),
    [PipeConnection.DoorOpen]: null,
    [PipeConnection.Cap]: null,
  } satisfies Record<PipeConnection, React.MutableRefObject<HTMLCanvasElement>>;

  useLayoutEffect(() => {
    if (container.current && canvasRef[PipeConnection.N].current && !sketch.current) {
      sketch.current = sidebarPipesSketch(container.current, canvasRef, options.pipeVariant, options.palette);
    }
  }, [container.current, canvasRef[PipeConnection.N].current]);

  useLayoutEffect(() => {
    if (sketch.current) {
      sketch.current.setPipeVariant(options.pipeVariant);
      sketch.current.setPalette(options.palette);
    }
  }, [options]);

  const renderButton = (pipe: PipeConnection, isLeft = false) => {
    const text = ({
      [PipeConnection.Unset]: '1',
      [PipeConnection.Barrier]: "2",
      [PipeConnection.Door]: "3",
      [PipeConnection.N]: "4",
      [PipeConnection.S]: "5",
      [PipeConnection.NS]: "6",
      [PipeConnection.W]: "7",
      [PipeConnection.NW]: "8",
      [PipeConnection.SW]: "9",
      [PipeConnection.NSW]: "10",
      [PipeConnection.E]: "11",
      [PipeConnection.NE]: "12",
      [PipeConnection.SE]: "13",
      [PipeConnection.NSE]: "14",
      [PipeConnection.WE]: "15",
      [PipeConnection.NWE]: "16",
      [PipeConnection.SWE]: "17",
      [PipeConnection.NSWE]: "18",
      [PipeConnection.Island]: "19",
      [PipeConnection.DoorOpen]: "",
      [PipeConnection.Cap]: "",
    } satisfies Record<PipeConnection, string>)[pipe];
    const color = pipe === activePipe ? '#ffffff' : '#444';
    return (
      <div key={pipe} className={styles.portalChannelSelect}>
        <button
          onClick={() => setPipe(pipe)}
          className={cx(styles.portalChannel, styles.noGrayscale, {
            [styles.active]: pipe === activePipe,
            [styles.active]: pipe === activePipe,
          })}
          style={{ backgroundColor: color }}
        >
          {pipe === PipeConnection.Unset ? (
            <span className="minimood color-u" style={{ marginLeft: -20, fontSize: '0.8em' }}>Auto</span>
          ) : (
            <>
              <canvas
                ref={canvasRef[pipe]}
                id={`editor-pipe-sidebar-${pipe}`}
                className={styles.barrierPreview}
                width={BLOCK_SIZE_X + 4}
                height={BLOCK_SIZE_Y + 4}
                style={{ backgroundColor: '#343434' }}
              />
              {text}
              <span className={cx('tooltip', styles.tooltip, { [styles.customAnchor]: isLeft })}>
                {pickupLabel(pipe)}
              </span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar-pipes" ref={container}>
      <label>style</label>
      <Stack justify="end" align="start" noChildMargin>
        <div>
          {renderButton(PipeConnection.Unset)}
          {renderButton(PipeConnection.Barrier)}
          {renderButton(PipeConnection.Door)}
          {renderButton(PipeConnection.N)}
          {renderButton(PipeConnection.S)}
          {renderButton(PipeConnection.W)}
          {renderButton(PipeConnection.E)}
          {renderButton(PipeConnection.NS)}
          {renderButton(PipeConnection.WE)}
          {renderButton(PipeConnection.NW)}
          {renderButton(PipeConnection.NE)}
          {renderButton(PipeConnection.SW)}
          {renderButton(PipeConnection.SE)}
          {renderButton(PipeConnection.NWE)}
          {renderButton(PipeConnection.SWE)}
          {renderButton(PipeConnection.NSW)}
          {renderButton(PipeConnection.NSE)}
          {renderButton(PipeConnection.NSWE)}
        </div>
      </Stack>
    </div>
  );
}

const pickupLabel = (annotation: PipeConnection) => {
  const tooltipText = ({
    [PipeConnection.Unset]: "Autotile",
    [PipeConnection.N]: "Junction N",
    [PipeConnection.S]: "Junction S",
    [PipeConnection.NS]: "Junction NS",
    [PipeConnection.W]: "Junction W",
    [PipeConnection.NW]: "Junction NW",
    [PipeConnection.SW]: "Junction SW",
    [PipeConnection.NSW]: "Junction NSW",
    [PipeConnection.E]: "Junction E",
    [PipeConnection.NE]: "Junction NE",
    [PipeConnection.SE]: "Junction SE",
    [PipeConnection.NSE]: "Junction NSE",
    [PipeConnection.WE]: "Junction WE",
    [PipeConnection.NWE]: "Junction NWE",
    [PipeConnection.SWE]: "Junction SWE",
    [PipeConnection.NSWE]: "Junction NSWE",
    [PipeConnection.Barrier]: "Barrier Junction",
    [PipeConnection.Door]: "Door Junction",
    [PipeConnection.Island]: "Island",
    [PipeConnection.DoorOpen]: "",
    [PipeConnection.Cap]: "",
  } satisfies Record<PipeConnection, string>)[annotation];
  return tooltipText || 'Unknown';
}
