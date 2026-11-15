import React, { useLayoutEffect, useRef } from "react";
import cx from 'classnames';

import { PickupType } from "../types";
import { BLOCK_SIZE_X, BLOCK_SIZE_Y } from "../constants";

import * as styles from "./Editor.css";
import { Stack } from "@/components/Stack";
import { EditorPickupType } from "./editorTypes";
import { sidebarPickupsSketch, SidebarPickupsSketchReturn } from "./sidebarPickupsSketch";

interface SidebarPickupsProps {
  activePickup: PickupType,
  setPickup: (pickup: PickupType) => void,
}

export const SidebarPickups = ({ activePickup, setPickup }: SidebarPickupsProps) => {
  const container = useRef<HTMLDivElement>();
  const sketch = useRef<SidebarPickupsSketchReturn | null>(null);
  const canvasRef = {
    [PickupType.Invincibility]: useRef<HTMLCanvasElement>(null),
    [PickupType.Reversibility]: useRef<HTMLCanvasElement>(null),
    [PickupType.Armor]: useRef<HTMLCanvasElement>(null),
  } satisfies Record<EditorPickupType, React.MutableRefObject<HTMLCanvasElement>>;

  useLayoutEffect(() => {
    if (container.current && canvasRef[PickupType.Invincibility].current && !sketch.current) {
      sketch.current = sidebarPickupsSketch(container.current, canvasRef);
    }
  }, [container.current, canvasRef[PickupType.Invincibility].current]);

  const renderButton = (pickup: PickupType, isLeft = false) => {
    const text = ({
      [PickupType.Invincibility]: '1',
      [PickupType.Armor]: '2',
      [PickupType.Reversibility]: '3',
    } satisfies Record<EditorPickupType, string>)[pickup];
    const color = pickup === activePickup ? '#ffffff' : '#444'
    return (
      <div key={pickup} className={styles.portalChannelSelect}>
        <button
          onClick={() => setPickup(pickup)}
          className={cx(styles.portalChannel, styles.noGrayscale, { [styles.active]: pickup === activePickup })}
          style={{ backgroundColor: color }}
        >
          {pickup !== PickupType.None && (
            <canvas
              ref={canvasRef[pickup]}
              id={`editor-sidebar-pickup-${pickup}`}
              className={styles.barrierPreview}
              width={BLOCK_SIZE_X}
              height={BLOCK_SIZE_Y}
              style={{ backgroundColor: '#343434' }}
            />
          )}
          {text}
          <span className={cx('tooltip', styles.tooltip, { [styles.customAnchor]: isLeft })}>
            {pickupLabel(pickup)}
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
          {renderButton(PickupType.Invincibility)}
          {renderButton(PickupType.Armor)}
          {renderButton(PickupType.Reversibility)}
        </div>
      </Stack>
    </div>
  );
}

const pickupLabel = (annotation: PickupType) => {
  const tooltipText = ({
    [PickupType.Invincibility]: "Invincibility",
    [PickupType.Armor]: "Armor",
    [PickupType.Reversibility]: "Reversibility",
  } satisfies Record<EditorPickupType, string>)[annotation];
  return tooltipText || 'Unknown';
}
