import React from "react";
import cx from 'classnames';

import { BarrierType } from "../types";

import * as styles from "./Editor.css";

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
    // const className = {
    //   [BarrierType.Yellow]: styles.keyChannelYellow,
    //   [BarrierType.Red]: styles.keyChannelRed,
    //   [BarrierType.Blue]: styles.keyChannelBlue,
    // }[channel]
    const className = ''
    return (
      <div className={cx(className, styles.portalChannel, { [styles.active]: barrierType === activeBarrierType })}>
        {/* <span className={styles.keyChannelColorPreview} /> */}
        <button
          onClick={() => setBarrierType(barrierType)}
        >
          {text}
        </button>
      </div>
    );
  }
  return (
    <div>
      <label>style</label>
      {renderButton(BarrierType.Default)}
      {renderButton(BarrierType.Skull)}
      {renderButton(BarrierType.ThemedSkull)}
      {renderButton(BarrierType.Indent)}
      {renderButton(BarrierType.ThemedIndent)}
      {renderButton(BarrierType.FireTile)}
    </div>
  );
}
