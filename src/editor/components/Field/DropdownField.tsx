import React from 'react';
import Dropdown, { Group, Option } from 'react-dropdown';

import { FieldLabel } from './FieldLabel';

import * as styles from './field.css';
import './react-dropdown.css';

interface DropdownFieldProps {
  label?: string;
  options: (string | Group | Option)[];
  value: string | Option;
  onChange: (val: string) => void;
  placeholder?: string
}

export const DropdownField = ({ label, options, value, onChange, placeholder = "Select an option" }: DropdownFieldProps) => {
  const handleChange = (option: Option) => {
    onChange(option.value);
  }

  const dropdown = (
    <Dropdown
      options={options}
      onChange={handleChange}
      value={value}
      placeholder={placeholder}
      className={styles.dropdownRoot}
    />
  );

  if (!label) return dropdown;

  return (
    <FieldLabel text={label}>
      {dropdown}
    </FieldLabel>
  );
}
