import React from "react";
import cx from 'classnames';

import * as styles from "../Editor.css";
import { coordToVec } from "../../utils";

interface GridProps {
  mouseAt: number,
  children: React.ReactNode,
}

export const Grid = ({ mouseAt, children }: GridProps) => {
  const vector = mouseAt >= 0 ? coordToVec(mouseAt) : null;
  const renderGridCell = (index: number, invert = false, active = false) => {
    return (
      <span
        key={index}
        className={cx(styles.gridCell, {
          [styles.invert]: invert,
          [styles.active]: active,
        })}
      >
        { (index >= 1 && index <= 30) ? String(index).padStart(2, '0') : ' ' }
      </span>
    );
  }

  return (
    <div className={cx(styles.stack, styles.col, styles.alignStretch)}>
      <div>
        {Array.from({ length: 32 }).map((val, index) => renderGridCell(index, true, vector?.x === index - 1))}
      </div>
      <div className={cx(styles.stack, styles.row, styles.alignStretch)}>
        <div className={cx(styles.stack, styles.col)}>
          {Array.from({ length: 30 }).map((val, index) => renderGridCell(index + 1, false, vector?.y === index))}
        </div>
        {children}
        <div className={cx(styles.stack, styles.col)}>
          {Array.from({ length: 30 }).map((val, index) => renderGridCell(index + 1, true, vector?.y === index))}
        </div>
      </div>
      <div>
        {Array.from({ length: 32 }).map((val, index) => renderGridCell(index, false, vector?.x === index - 1))}
      </div>
    </div>
  );
}
