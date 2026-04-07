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
    [BarrierType.SkullThemed]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Indent]: useRef<HTMLCanvasElement>(null),
    [BarrierType.IndentThemed]: useRef<HTMLCanvasElement>(null),
    [BarrierType.FireTile]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Flat]: useRef<HTMLCanvasElement>(null),
    [BarrierType.FlatThemed]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Pyramid]: useRef<HTMLCanvasElement>(null),
    [BarrierType.PyramidThemed]: useRef<HTMLCanvasElement>(null),
    [BarrierType.ExitSign]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Radar]: useRef<HTMLCanvasElement>(null),
    [BarrierType.ComputerChip]: useRef<HTMLCanvasElement>(null),
    [BarrierType.MetalPlate]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Panel0]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Panel1]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Panel2]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Panel3]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Panel4]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Panel5]: useRef<HTMLCanvasElement>(null),
    [BarrierType.Brick]: useRef<HTMLCanvasElement>(null),
    [BarrierType.BrickThemed]: useRef<HTMLCanvasElement>(null),
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
    const text = ({
      [BarrierType.Unset]: 'None',
      [BarrierType.Default]: '1',
      [BarrierType.Skull]: '2',
      [BarrierType.SkullThemed]: '3',
      [BarrierType.Indent]: '4',
      [BarrierType.IndentThemed]: '5',
      [BarrierType.FireTile]: '6',
      [BarrierType.Flat]: '7',
      [BarrierType.FlatThemed]: '8',
      [BarrierType.Pyramid]: '9',
      [BarrierType.PyramidThemed]: '10',
      [BarrierType.ExitSign]: "11",
      [BarrierType.Radar]: "12",
      [BarrierType.ComputerChip]: "13",
      [BarrierType.MetalPlate]: "14",
      [BarrierType.Panel0]: "15",
      [BarrierType.Panel1]: "16",
      [BarrierType.Panel2]: "17",
      [BarrierType.Panel3]: "18",
      [BarrierType.Panel4]: "19",
      [BarrierType.Panel5]: "20",
      [BarrierType.Brick]: "21",
      [BarrierType.BrickThemed]: "22",
    } satisfies Record<BarrierType, string>)[barrierType];
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
      {renderButton(BarrierType.SkullThemed)}
      {renderButton(BarrierType.Indent)}
      {renderButton(BarrierType.IndentThemed)}
      {renderButton(BarrierType.FireTile)}
      {renderButton(BarrierType.Flat)}
      {renderButton(BarrierType.FlatThemed)}
      {renderButton(BarrierType.Pyramid)}
      {renderButton(BarrierType.PyramidThemed)}
      {renderButton(BarrierType.ExitSign)}
      {renderButton(BarrierType.Radar)}
      {renderButton(BarrierType.ComputerChip)}
      {renderButton(BarrierType.MetalPlate)}
      {renderButton(BarrierType.Panel0)}
      {renderButton(BarrierType.Panel1)}
      {renderButton(BarrierType.Panel2)}
      {renderButton(BarrierType.Panel3)}
      {renderButton(BarrierType.Panel4)}
      {renderButton(BarrierType.Panel5)}
      {renderButton(BarrierType.Brick)}
      {renderButton(BarrierType.BrickThemed)}
    </div>
  );
}

const barrierTypeLabel = (barrierType: BarrierType) => {
  const tooltipText = ({
    [BarrierType.Unset]: 'None',
    [BarrierType.Default]: 'Default',
    [BarrierType.Skull]: 'Skull',
    [BarrierType.SkullThemed]: 'Themed Skull',
    [BarrierType.Indent]: 'Indent',
    [BarrierType.IndentThemed]: 'Themed Indent',
    [BarrierType.FireTile]: 'Fire',
    [BarrierType.Flat]: 'Flat',
    [BarrierType.FlatThemed]: 'Themed Flat',
    [BarrierType.Pyramid]: 'Pyramid',
    [BarrierType.PyramidThemed]: 'Themed Pyramid',
    [BarrierType.ExitSign]: "Exit Sign",
    [BarrierType.Radar]: "Radar Display",
    [BarrierType.ComputerChip]: "Computer Chip",
    [BarrierType.MetalPlate]: "Metal Plate",
    [BarrierType.Panel0]: "Panel 0",
    [BarrierType.Panel1]: "Panel 1",
    [BarrierType.Panel2]: "Panel 2",
    [BarrierType.Panel3]: "Panel 3",
    [BarrierType.Panel4]: "Panel 4",
    [BarrierType.Panel5]: "Panel 5",
    [BarrierType.Brick]: "Brick",
    [BarrierType.BrickThemed]: "Themed Brick",
  } satisfies Record<BarrierType, string>)[barrierType];
  return tooltipText || 'Unknown';
}
