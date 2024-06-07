import React from "react";
import cx from "classnames";

import * as styles from './field.css';

interface FieldLabelProps {
  text: string;
  children: React.ReactNode;
  fullWidth?: boolean
}

export const FieldLabel = ({ text, children, fullWidth }: FieldLabelProps) => {
  return (
    <label>
      <span className={cx(styles.label, { [styles.fullWidth]: fullWidth })}>{text}</span>
      {children}
    </label>
  );
}
