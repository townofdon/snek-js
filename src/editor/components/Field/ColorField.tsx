import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { HexColorPicker } from "react-colorful";

import * as styles from './field.css';
import { SpecialKey, getIsOutside, isCharPressed } from "../../utils/keyboardUtils";

interface ColorFieldProps {
  name: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const ColorField = ({ name, value, onChange, disabled, className, fullWidth}: ColorFieldProps) => {
  const [isPickerShowing, setPickerShowing] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const picker = (
    <HexColorPicker
      color={value}
      onChange={color => onChange(color)}
      className={cx(className, styles.colorPicker)}
    />
  );

  useEffect(() => {
    const onFocus = (ev: FocusEvent) => {
      if (getIsOutside(ev, containerRef)) {
        setPickerShowing(false);
      }
    };
    const onMouseDown = (ev: MouseEvent) => {
      if (getIsOutside(ev, containerRef)) {
        setPickerShowing(false);
      }
    };
    const onKeyDown = (ev: KeyboardEvent) => {
      if (isCharPressed(ev, SpecialKey.Enter) || isCharPressed(ev, SpecialKey.Escape)) {
        setPickerShowing(false);
      }
    }
    window.addEventListener('focus', onFocus);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    }
  }, [])

  const handleClick = () => {
    setPickerShowing(true);
  }

  const handleFocus = () => {
    setPickerShowing(true);
  }

  const stripHash = (val: string): string => {
    return val.replace(/^#/, '');
  }

  const includeHash = (val: string): string => {
    return `#${(stripHash(val))}`;
  }

  return (
    <span ref={containerRef} className={cx(styles.colorInputContainer, { [styles.fullWidth]: fullWidth })} onClick={handleClick}>
      <span className={styles.colorInputHash}>#</span>
      <span className={styles.colorInputPreview} style={{ backgroundColor: value }} />
      <input
        type="text"
        name={name}
        className={cx(styles.input, styles.colorInput, className, { [styles.fullWidth]: fullWidth })}
        value={stripHash(value)}
        onChange={ev => onChange(includeHash(ev.target.value))}
        onFocus={handleFocus}
        disabled={disabled}
      />
      {isPickerShowing ? picker : null}
    </span>
  );
}
