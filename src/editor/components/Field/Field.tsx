import React from "react";
import cx from "classnames";

import { FieldLabel } from "./FieldLabel";
import { ColorField } from "./ColorField";
import { ToggleField } from "./ToggleField";

import * as styles from './field.css';

interface BaseFieldProps<T> {
  name: string;
  value: T;
  onChange: (val: T) => void;
  disabled?: boolean;
  label?: string;
  caption?: string;
  placeholder?: string
  min?: number;
  max?: number;
  step?: number;
  fullWidth?: boolean;
  className?: string;
  inputClassName?: string;
}

export interface TextFieldProps extends BaseFieldProps<string> { type?: 'text' }
export interface NumberFieldProps extends BaseFieldProps<number> { type: 'number' }
export interface RangeFieldProps extends BaseFieldProps<number> { type: 'range' }
export interface CheckboxFieldProps extends BaseFieldProps<boolean> { type: 'checkbox' }
export interface ColorFieldProps extends BaseFieldProps<string> { type: 'color' }
export type FieldProps = TextFieldProps | NumberFieldProps | CheckboxFieldProps | RangeFieldProps | ColorFieldProps
function isTextProps(props: FieldProps): props is TextFieldProps { return !props.type || props.type === 'text'; }
function isNumberProps(props: FieldProps): props is NumberFieldProps { return props.type === 'number'; }
function isRangeProps(props: FieldProps): props is RangeFieldProps { return props.type === 'range'; }
function isCheckboxProps(props: FieldProps): props is CheckboxFieldProps { return props.type === 'checkbox'; }
function isColorProps(props: FieldProps): props is ColorFieldProps { return props.type === 'color'; }

export const Field = ({
  type = "text",
  min,
  max,
  step,
  fullWidth,
  className,
  inputClassName,
  placeholder,
  disabled,
  ...otherProps
}: FieldProps) => {
  const props: FieldProps = { type, disabled, ...otherProps } as FieldProps;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    if (isTextProps(props)) {
      props.onChange(ev.target.value);
    } else if (isNumberProps(props)) {
      props.onChange(Number(ev.target.value));
    } else if (isRangeProps(props)) {
      props.onChange(Number(ev.target.value));
    } else if (isCheckboxProps(props)) {
      props.onChange(ev.target.checked);
    }
  };

  const renderField = () => {
    const inputClassNames = cx(styles.input, inputClassName, {
      [styles.range]: props.type === "range",
      [styles.fullWidth]: fullWidth,
    });
    if (isCheckboxProps(props)) {
      return (
        <ToggleField
          label={props.value ? "Yes" : "No"}
          name={props.name}
          onChange={props.onChange}
          checked={props.value}
          className={inputClassNames}
          disabled={disabled}
        />
      );
    } else if (isColorProps(props)) {
      return (
        <ColorField
          name={props.name}
          value={props.value}
          onChange={(color) => props.onChange(color)}
          fullWidth={fullWidth}
          className={inputClassNames}
          disabled={disabled}
        />
      );
    } else {
      return (
        <input
          name={props.name}
          type={props.type || "text"}
          onChange={handleChange}
          value={props.value}
          min={min}
          max={max}
          step={step}
          className={inputClassNames}
          placeholder={placeholder}
          disabled={disabled}
        />
      );
    }
  };

  return (
    <div
      className={cx(styles.fieldContainer, className, { [styles.fullWidth]: fullWidth })}
    >
      {props.label ? (
        <FieldLabel text={props.label} fullWidth={fullWidth}>
          {renderField()}
        </FieldLabel>
      ) : (
        renderField()
      )}

      {props.caption && <div className={styles.caption}>{props.caption}</div>}
    </div>
  );
};
