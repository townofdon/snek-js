import React from "react";
import { FieldLabel } from "./FieldLabel";
import { Field, RangeFieldProps } from "./Field";

import * as styles from './field.css';

interface SliderWithInputProps extends Omit<RangeFieldProps, 'type'> {
  label: string;
}

export const SliderWithInput = ({ label, ...props }: SliderWithInputProps) => {
  const { name, value, onChange, caption, fullWidth, ...restProps } = props;
  return (
    <div>
      <FieldLabel text={label}>
        <span style={{
          display: 'flex',
          alignItems: 'stretch',
        }}>
          <Field
            {...restProps}
            name={`${props.name}__input`}
            type="number"
            value={props.value}
            onChange={props.onChange}
            inputClassName={styles.sliderManualInput}
          />
          <Field
            {...restProps}
            name={`${props.name}__slider`}
            type="range"
            value={props.value}
            onChange={props.onChange}
            fullWidth
          />
        </span>
      </FieldLabel>
    </div>
  );
}
