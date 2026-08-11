import React, { forwardRef } from "react";

interface SliderFieldProps {
  id: string;
  label: string;
  caption?: string;
  name: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  onChange: (val: number) => void;
  onMouseUp?: () => void;
}

export const SliderField = forwardRef<HTMLInputElement, SliderFieldProps>(
  (
    {
      id,
      name,
      label,
      caption,
      value,
      min = 0,
      max = 1,
      step = 0.1,
      disabled,
      className,
      onChange,
      onMouseUp,
    }: SliderFieldProps,
    ref,
  ) => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
      const val = Number(ev.target.value);
      if (!Number.isNaN(val)) {
        onChange(val);
      }
    };
    return (
      <div className="field">
        <div>
          <input
            ref={ref}
            type="range"
            id={id}
            name={name}
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            className={className}
            onChange={handleChange}
            onMouseUp={onMouseUp}
          />
          <label htmlFor={id}>{label}</label>
        </div>
        {!!caption && <span className="caption">{caption}</span>}
      </div>
    );
  },
);
