import React from "react";
import cx from "classnames";

import * as styles from './field.css';

interface FieldLabelProps {
  text: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export const FieldLabel = ({ text, children, fullWidth, style }: FieldLabelProps) => {
  return (
    <label className={cx({ [styles.fullWidth]: fullWidth })} style={style}>
      <span className={cx(styles.label, { [styles.fullWidth]: fullWidth })}>{text}</span>
      {children}
    </label>
  );
}
