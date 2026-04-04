import React, { useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { BarrierType, EditorOptions } from "../types";
import { BLOCK_SIZE } from "../constants";
import { sidebarBarrierTypesSketch, SidebarBarrierTypesSketchReturn } from "./sidebarBarrierTypesSketch";

import * as styles from "./Editor.css";

interface SidebarBarrierTypesProps {
  activeBarrierType: BarrierType,
  options: EditorOptions,
  setBarrierType: (barrierType: BarrierType) => void,
}

export const SidebarBarrierTypes = ({ activeBarrierType, options, setBarrierType }: SidebarBarrierTypesProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<SidebarBarrierTypesSketchReturn | null>(null);
  const syncOptionsTimeout = useRef<NodeJS.Timeout>(null);
  const canvasRef = {
    [BarrierType.Unset]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Default]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Skull]: useRef<HTMLCanvasElement>(null),
    [BarrierType.ThemedSkull]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Indent]: useRef<HTMLCanvasElement>(null),
    [BarrierType.ThemedIndent]: useRef<HTMLCanvasElement>(null),
    [BarrierType.FireTile]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Flat]: useRef<HTMLCanvasElement>(null),
    [BarrierType.ThemedFlat]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Pyramid]: useRef<HTMLCanvasElement>(null),
    [BarrierType.ThemedPyramid]: useRef<HTMLCanvasElement>(null),
  } satisfies Record<BarrierType, React.MutableRefObject<HTMLCanvasElement>>;

  useLayoutEffect(() => {
    if (container.current && canvasRef[BarrierType.Default].current && !sketch.current) {
      Object.values(BarrierType).filter(v => typeof v !== 'string').forEach(barrierType => {
        if (!canvasRef[barrierType].current && barrierType !== BarrierType.Unset) {
          throw new Error(`No canvas exists for barrierType ${barrierTypeLabel(barrierType)}`);
        }
      })
      sketch.current = sidebarBarrierTypesSketch(container.current, canvasRef);
      sketch.current.setOptions(options);
    }
  }, [container.current, canvasRef[BarrierType.Default].current]);

  useLayoutEffect(() => {
    clearTimeout(syncOptionsTimeout.current);
    if (sketch.current) {
      syncOptionsTimeout.current = setTimeout(() => {
        sketch.current.setOptions(options);
      }, 40);
    }
  }, [options]);

  const renderButton = (barrierType: BarrierType) => {
    const text = {
      [BarrierType.Unset]: 'None',
      [BarrierType.Default]: '1',
      [BarrierType.Skull]: '2',
      [BarrierType.ThemedSkull]: '3',
      [BarrierType.Indent]: '4',
      [BarrierType.ThemedIndent]: '5',
      [BarrierType.FireTile]: '6',
      [BarrierType.Flat]: '7',
      [BarrierType.ThemedFlat]: '8',
      [BarrierType.Pyramid]: '9',
      [BarrierType.ThemedPyramid]: '10',
    }[barrierType];
    const color = barrierType === activeBarrierType ? '#ffffff' : '#444'
    return (
      <div key={barrierType} className={styles.portalChannelSelect}>
        <button
          onClick={() => setBarrierType(barrierType)}
          className={cx(styles.portalChannel, styles.noGrayscale, { [styles.active]: barrierType === activeBarrierType })}
          style={{ backgroundColor: color }}
        >
          {barrierType !== BarrierType.Unset && (
            <canvas
              ref={canvasRef[barrierType]}
              id={`editor-tile-preview-barrier-${barrierType}`}
              className={styles.barrierPreview}
              width={BLOCK_SIZE.x}
              height={BLOCK_SIZE.y}
            />
          )}
          {text}
          <span className={cx('tooltip', styles.tooltip)}>{barrierTypeLabel(barrierType)}</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={container}>
      <label>style</label>
      {renderButton(BarrierType.Default)}
      {renderButton(BarrierType.Skull)}
      {renderButton(BarrierType.ThemedSkull)}
      {renderButton(BarrierType.Indent)}
      {renderButton(BarrierType.ThemedIndent)}
      {renderButton(BarrierType.FireTile)}
      {renderButton(BarrierType.Flat)}
      {renderButton(BarrierType.ThemedFlat)}
      {renderButton(BarrierType.Pyramid)}
      {renderButton(BarrierType.ThemedPyramid)}
    </div>
  );
}

const barrierTypeLabel = (barrierType: BarrierType) => {
  const tooltipText = {
    [BarrierType.Unset]: 'None',
    [BarrierType.Default]: 'Default',
    [BarrierType.Skull]: 'Skull',
    [BarrierType.ThemedSkull]: 'Themed Skull',
    [BarrierType.Indent]: 'Indent',
    [BarrierType.ThemedIndent]: 'Themed Indent',
    [BarrierType.FireTile]: 'Fire',
    [BarrierType.Flat]: 'Flat',
    [BarrierType.ThemedFlat]: 'Themed Flat',
    [BarrierType.Pyramid]: 'Pyramid',
    [BarrierType.ThemedPyramid]: 'Themed Pyramid',
  }[barrierType];
  return tooltipText || 'Unknown';
}
