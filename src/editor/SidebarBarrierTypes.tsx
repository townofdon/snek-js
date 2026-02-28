import React from "react";
import cx from 'classnames';

import { BarrierType } from "../types";

import * as styles from "./Editor.css";
import { EDITOR_BARRIER_TYPE_COLORS } from "../constants";

interface SidebarBarrierTypesProps {
  activeBarrierType: BarrierType,
  setBarrierType: (barrierType: BarrierType) => void,
}

export const SidebarBarrierTypes = ({ activeBarrierType, setBarrierType }: SidebarBarrierTypesProps) => {
  const renderButton = (barrierType: BarrierType) => {
    const text = {
      [BarrierType.Unset]: 'None',
      [BarrierType.Default]: '1',
      [BarrierType.Skull]: '2',
      [BarrierType.ThemedSkull]: '3',
      [BarrierType.Indent]: '4',
      [BarrierType.ThemedIndent]: '5',
      [BarrierType.FireTile]: '6',
    }[barrierType];
    const tooltipText = {
      [BarrierType.Unset]: 'None',
      [BarrierType.Default]: 'Default',
      [BarrierType.Skull]: 'Skull',
      [BarrierType.ThemedSkull]: 'Themed Skull',
      [BarrierType.Indent]: 'Indent',
      [BarrierType.ThemedIndent]: 'Themed Indent',
      [BarrierType.FireTile]: 'Fire',
    }[barrierType];
    const color = barrierType === activeBarrierType ? EDITOR_BARRIER_TYPE_COLORS[barrierType] : '#444'
    const colorPreview = barrierType === activeBarrierType ? 'rgb(17 17 17 / 10%)' : EDITOR_BARRIER_TYPE_COLORS[barrierType];
    return (
      <div key={barrierType} className={styles.portalChannelSelect}>
        <span className={styles.portalChannelColorPreview} style={{ backgroundColor: colorPreview }} />
        <button
          onClick={() => setBarrierType(barrierType)}
          className={cx(styles.portalChannel, { [styles.active]: barrierType === activeBarrierType })}
          style={{ backgroundColor: color }}
        >
          {text}
          {tooltipText && <span className={cx('tooltip', styles.tooltip)}>{tooltipText}</span>}
        </button>
      </div>
    );
  }
  return (
    <div>
      <span>style</span>
      {renderButton(BarrierType.Default)}
      {renderButton(BarrierType.Skull)}
      {renderButton(BarrierType.ThemedSkull)}
      {renderButton(BarrierType.Indent)}
      {renderButton(BarrierType.ThemedIndent)}
      {renderButton(BarrierType.FireTile)}
    </div>
  );
}
