import React, { useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { ThreatType, EditorOptions } from "../types";
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from "../constants";
import { sidebarThreatTypesSketch, SidebarThreatTypesSketchReturn } from "./sidebarThreatTypesSketch";
import { Stack } from "@/components/Stack";

import * as styles from "./Editor.css";

interface SidebarThreatTypesProps {
  activeThreatType: ThreatType,
  options: EditorOptions,
  setThreatType: (threatType: ThreatType) => void,
}

export const SidebarThreatTypes = ({ activeThreatType, options, setThreatType }: SidebarThreatTypesProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<SidebarThreatTypesSketchReturn | null>(null);
  const syncOptionsTimeout = useRef<NodeJS.Timeout>(null);
  const canvasRef = {
    [ThreatType.None]: useRef<HTMLCanvasElement>(null),
    [ThreatType.Mine]: useRef<HTMLCanvasElement>(null),
    [ThreatType.Bomb]: useRef<HTMLCanvasElement>(null),
    [ThreatType.LaserDiode]: useRef<HTMLCanvasElement>(null),
    [ThreatType.ExplodableBarrel]: useRef<HTMLCanvasElement>(null),
    [ThreatType.Barricade]: useRef<HTMLCanvasElement>(null),
    [ThreatType.Spikes]: useRef<HTMLCanvasElement>(null),
    [ThreatType.WallSpikes]: useRef<HTMLCanvasElement>(null),
    [ThreatType.Saw]: useRef<HTMLCanvasElement>(null),
    [ThreatType.Flamethrower]: useRef<HTMLCanvasElement>(null),
  } satisfies Record<ThreatType, React.MutableRefObject<HTMLCanvasElement>>;

  useLayoutEffect(() => {
    if (container.current && canvasRef[ThreatType.Mine].current && !sketch.current) {
      Object.values(ThreatType).filter(v => typeof v !== 'string').forEach(threatType => {
        if (!canvasRef[threatType].current && threatType !== ThreatType.None) {
          throw new Error(`No canvas exists for threatType ${threatTypeLabel(threatType)}`);
        }
      })
      sketch.current = sidebarThreatTypesSketch(container.current, canvasRef);
      sketch.current.setOptions(options);
    }
  }, [container.current, canvasRef[ThreatType.Mine].current]);

  useLayoutEffect(() => {
    clearTimeout(syncOptionsTimeout.current);
    if (sketch.current) {
      syncOptionsTimeout.current = setTimeout(() => {
        sketch.current.setOptions(options);
      }, 40);
    }
  }, [options]);

  const renderButton = (threatType: ThreatType) => {
    let i = 1;
    const text = ({
      [ThreatType.None]: "None",
      [ThreatType.Mine]: String(i++),
      [ThreatType.Bomb]: String(i++),
      [ThreatType.LaserDiode]: String(i++),
      [ThreatType.ExplodableBarrel]: String(i++),
      [ThreatType.Barricade]: String(i++),
      [ThreatType.Spikes]: String(i++),
      [ThreatType.WallSpikes]: String(i++),
      [ThreatType.Saw]: String(i++),
      [ThreatType.Flamethrower]: String(i++),
    } satisfies Record<ThreatType, string>)[threatType];
    const color = threatType === activeThreatType ? '#ffffff' : '#444'
    return (
      <div key={threatType} className={styles.portalChannelSelect}>
        <button
          onClick={() => setThreatType(threatType)}
          className={cx(styles.portalChannel, styles.noGrayscale, { [styles.active]: threatType === activeThreatType })}
          style={{ backgroundColor: color }}
        >
          {threatType !== ThreatType.None && (
            <canvas
              ref={canvasRef[threatType]}
              id={`editor-tile-preview-tile-${threatType}`}
              className={styles.barrierPreview}
              width={BLOCK_SIZE_X}
              height={BLOCK_SIZE_Y}
            />
          )}
          {text}
          <span className={cx('tooltip', styles.tooltip)}>
            {threatTypeLabel(threatType)}
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
          {renderButton(ThreatType.Mine)}
          {renderButton(ThreatType.Bomb)}
          {renderButton(ThreatType.LaserDiode)}
          {renderButton(ThreatType.ExplodableBarrel)}
          {renderButton(ThreatType.Barricade)}
          {renderButton(ThreatType.Spikes)}
          {renderButton(ThreatType.WallSpikes)}
          {renderButton(ThreatType.Saw)}
          {renderButton(ThreatType.Flamethrower)}
        </div>
      </Stack>
    </div>
  );
}

const threatTypeLabel = (threatType: ThreatType) => {
  const tooltipText = ({
    [ThreatType.None]: 'None',
    [ThreatType.Mine]: "Mine",
    [ThreatType.Bomb]: "Bomb",
    [ThreatType.LaserDiode]: "Laser Diode",
    [ThreatType.ExplodableBarrel]: "Explodable Barrel",
    [ThreatType.Barricade]: "Barricade",
    [ThreatType.Spikes]: "Spikes",
    [ThreatType.WallSpikes]: "Wall Spikes",
    [ThreatType.Saw]: "Saw",
    [ThreatType.Flamethrower]: "Flamethrower",
  } satisfies Record<ThreatType, string>)[threatType];
  return tooltipText || 'Unknown';
}
