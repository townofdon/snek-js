import React, { forwardRef } from "react";

interface CheckboxFieldProps {
  label?: string;
  caption?: string;
  name: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(({ name, label, caption, checked, onChange, disabled, className }: CheckboxFieldProps, ref) => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    onChange(ev.target.checked);
  }
  const checkbox = (
    <>
      <input ref={ref} type="checkbox" name={name} checked={checked} onChange={handleChange} disabled={disabled} className={className} />
      <span className="checkmark"></span>
    </>
  );

  if (!label) return checkbox;

  return (
    <div className="field">
      <div>
        <label className="checkbox-label" tabIndex={0}>
          {checkbox}
          {label}
        </label>
      </div>
      {caption && (
        <span className="caption">{caption}</span>
      )}
    </div>
  );
})
