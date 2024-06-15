import React, { useRef } from 'react';
import Select, { ActionMeta, OnChangeValue } from 'react-select'
// import Dropdown, { Group, Option } from 'react-dropdown';

import { FieldLabel } from './FieldLabel';

import './react-dropdown.css';

export interface Option {
  id?: string;
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label?: string;
  options: Option[];
  value: Option;
  onChange: (val: Option) => void;
  placeholder?: string
}

export const DropdownField = ({ label, options, value, onChange, placeholder = "Select an option" }: DropdownFieldProps) => {
  const select = useRef(null);

  const handleChange = (option: OnChangeValue<Option, false>, actionMeta: ActionMeta<Option>) => {
    onChange(option);
  }

  const dropdown = (
    <Select
      ref={select}
      options={options}
      onChange={handleChange}
      value={value}
      placeholder={placeholder}
      classNamePrefix="react-select"
      menuShouldScrollIntoView
      menuPlacement="top"
    />
  );

  if (!label) return dropdown;

  return (
    <FieldLabel text={label}>
      {dropdown}
    </FieldLabel>
  );
}
