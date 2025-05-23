import React from "react";
import Toggle from 'react-toggle'
import cx from "classnames";

import * as styles from './field.css';
import './react-toggle.css'

interface ToggleFieldProps {
  label?: string;
  name: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const ToggleField = ({ name, label, checked, onChange, disabled, className }: ToggleFieldProps) => {
  const toggle = (
    <Toggle
      name={name}
      checked={checked}
      onChange={(ev) => onChange(ev.target.checked)}
      disabled={disabled}
      className={className}
    />
  );

  if (!label) return toggle;

  return (
    <label className={cx(styles.toggleLabel)}>
      {toggle}
      <span className={styles.toggleLabelText}>{label}</span>
    </label>
  );
}
