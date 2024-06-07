import React from "react";
import cx from "classnames";

import { FieldLabel } from "./FieldLabel";

import * as styles from './field.css';

interface BaseFieldProps<T> {
  name: string;
  label?: string;
  caption?: string;
  value: T;
  onChange: (val: T) => void;
  min?: number;
  max?: number;
  fullWidth?: boolean;
}

interface TextFieldProps extends BaseFieldProps<string> { type?: 'text' }
interface NumberFieldProps extends BaseFieldProps<number> { type: 'number' }
interface RangeFieldProps extends BaseFieldProps<number> { type: 'range' }
interface CheckboxFieldProps extends BaseFieldProps<boolean> { type: 'checkbox' }
type FieldProps = TextFieldProps | NumberFieldProps | CheckboxFieldProps | RangeFieldProps
function isTextProps(props: FieldProps): props is TextFieldProps { return !props.type || props.type === 'text'; }
function isNumberProps(props: FieldProps): props is NumberFieldProps { return props.type === 'number'; }
function isRangeProps(props: FieldProps): props is RangeFieldProps { return props.type === 'range'; }
function isCheckboxProps(props: FieldProps): props is CheckboxFieldProps { return props.type === 'checkbox'; }

export const Field = ({ type = 'text', min, max, fullWidth, ...otherProps }: FieldProps) => {
  const props: FieldProps = { type, ...otherProps } as FieldProps;

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
  }

  const renderField = () => {
    const restProps = {
      min,
      max,
      className: cx(styles.input, { [styles.fullWidth]: fullWidth })
    };
    if (isCheckboxProps(props)) {
      return <input name={props.name} type={props.type} onChange={handleChange} checked={props.value} {...restProps} />
    } else {
      return <input name={props.name} type={props.type || 'text'} onChange={handleChange} value={props.value} {...restProps} />
    }
  }

  return (
    <div className={cx(styles.fieldContainer, { [styles.fullWidth]: fullWidth })}>
      {props.label ? (
        <FieldLabel text={props.label} fullWidth={fullWidth}>
          {renderField()}
        </FieldLabel>
      ) : (
        renderField()
      )}

      {props.caption && (
        <div>{props.caption}</div>
      )}
    </div>
  );
}
